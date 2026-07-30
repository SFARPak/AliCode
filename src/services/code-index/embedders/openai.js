"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.OpenAiEmbedder = void 0
const openai_1 = require("openai")
const openai_native_1 = require("../../../api/providers/openai-native")
const constants_1 = require("../constants")
const embeddingModels_1 = require("../../../shared/embeddingModels")
const i18n_1 = require("../../../i18n")
const validation_helpers_1 = require("../shared/validation-helpers")
const openai_error_handler_1 = require("../../../api/providers/utils/openai-error-handler")
/**
 * OpenAI implementation of the embedder interface with batching and rate limiting
 */
class OpenAiEmbedder extends openai_native_1.OpenAiNativeHandler {
	embeddingsClient
	defaultModelId
	/**
	 * Creates a new OpenAI embedder
	 * @param options API handler options
	 */
	constructor(options) {
		super(options)
		const apiKey = this.options.openAiNativeApiKey ?? "not-provided"
		// Wrap OpenAI client creation to handle invalid API key characters
		try {
			this.embeddingsClient = new openai_1.OpenAI({ apiKey })
		} catch (error) {
			// Use the error handler to transform ByteString conversion errors
			throw (0, openai_error_handler_1.handleOpenAIError)(error, "OpenAI")
		}
		this.defaultModelId = options.openAiEmbeddingModelId || "text-embedding-3-small"
	}
	/**
	 * Creates embeddings for the given texts with batching and rate limiting
	 * @param texts Array of text strings to embed
	 * @param model Optional model identifier
	 * @returns Promise resolving to embedding response
	 */
	async createEmbeddings(texts, model) {
		const modelToUse = model || this.defaultModelId
		// Apply model-specific query prefix if required
		const queryPrefix = (0, embeddingModels_1.getModelQueryPrefix)("openai", modelToUse)
		const processedTexts = queryPrefix
			? texts.map((text, index) => {
					// Prevent double-prefixing
					if (text.startsWith(queryPrefix)) {
						return text
					}
					const prefixedText = `${queryPrefix}${text}`
					const estimatedTokens = Math.ceil(prefixedText.length / 4)
					if (estimatedTokens > constants_1.MAX_ITEM_TOKENS) {
						console.warn(
							(0, i18n_1.t)("embeddings:textWithPrefixExceedsTokenLimit", {
								index,
								estimatedTokens,
								maxTokens: constants_1.MAX_ITEM_TOKENS,
							}),
						)
						// Return original text if adding prefix would exceed limit
						return text
					}
					return prefixedText
				})
			: texts
		const allEmbeddings = []
		const usage = { promptTokens: 0, totalTokens: 0 }
		const remainingTexts = [...processedTexts]
		while (remainingTexts.length > 0) {
			const currentBatch = []
			let currentBatchTokens = 0
			const processedIndices = []
			for (let i = 0; i < remainingTexts.length; i++) {
				const text = remainingTexts[i]
				const itemTokens = Math.ceil(text.length / 4)
				if (itemTokens > constants_1.MAX_ITEM_TOKENS) {
					console.warn(
						(0, i18n_1.t)("embeddings:textExceedsTokenLimit", {
							index: i,
							itemTokens,
							maxTokens: constants_1.MAX_ITEM_TOKENS,
						}),
					)
					processedIndices.push(i)
					continue
				}
				if (currentBatchTokens + itemTokens <= constants_1.MAX_BATCH_TOKENS) {
					currentBatch.push(text)
					currentBatchTokens += itemTokens
					processedIndices.push(i)
				} else {
					break
				}
			}
			// Remove processed items from remainingTexts (in reverse order to maintain correct indices)
			for (let i = processedIndices.length - 1; i >= 0; i--) {
				remainingTexts.splice(processedIndices[i], 1)
			}
			if (currentBatch.length > 0) {
				const batchResult = await this._embedBatchWithRetries(currentBatch, modelToUse)
				allEmbeddings.push(...batchResult.embeddings)
				usage.promptTokens += batchResult.usage.promptTokens
				usage.totalTokens += batchResult.usage.totalTokens
			}
		}
		return { embeddings: allEmbeddings, usage }
	}
	/**
	 * Helper method to handle batch embedding with retries and exponential backoff
	 * @param batchTexts Array of texts to embed in this batch
	 * @param model Model identifier to use
	 * @returns Promise resolving to embeddings and usage statistics
	 */
	async _embedBatchWithRetries(batchTexts, model) {
		for (let attempts = 0; attempts < constants_1.MAX_BATCH_RETRIES; attempts++) {
			try {
				const response = await this.embeddingsClient.embeddings.create({
					input: batchTexts,
					model: model,
				})
				return {
					embeddings: response.data.map((item) => item.embedding),
					usage: {
						promptTokens: response.usage?.prompt_tokens || 0,
						totalTokens: response.usage?.total_tokens || 0,
					},
				}
			} catch (error) {
				const hasMoreAttempts = attempts < constants_1.MAX_BATCH_RETRIES - 1
				// Check if it's a rate limit error
				const httpError = error
				if (httpError?.status === 429 && hasMoreAttempts) {
					const delayMs = constants_1.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempts)
					console.warn(
						(0, i18n_1.t)("embeddings:rateLimitRetry", {
							delayMs,
							attempt: attempts + 1,
							maxRetries: constants_1.MAX_BATCH_RETRIES,
						}),
					)
					await new Promise((resolve) => setTimeout(resolve, delayMs))
					continue
				}
				// Log the error for debugging
				console.error(
					`OpenAI embedder error (attempt ${attempts + 1}/${constants_1.MAX_BATCH_RETRIES}):`,
					error,
				)
				// Format and throw the error
				throw (0, validation_helpers_1.formatEmbeddingError)(error, constants_1.MAX_BATCH_RETRIES)
			}
		}
		throw new Error((0, i18n_1.t)("embeddings:failedMaxAttempts", { attempts: constants_1.MAX_BATCH_RETRIES }))
	}
	/**
	 * Validates the OpenAI embedder configuration by attempting a minimal embedding request
	 * @returns Promise resolving to validation result with success status and optional error message
	 */
	async validateConfiguration() {
		return (0, validation_helpers_1.withValidationErrorHandling)(async () => {
			// Test with a minimal embedding request
			const response = await this.embeddingsClient.embeddings.create({
				input: ["test"],
				model: this.defaultModelId,
			})
			// Check if we got a valid response
			if (!response.data || response.data.length === 0) {
				return {
					valid: false,
					error: (0, i18n_1.t)("embeddings:openai.invalidResponseFormat"),
				}
			}
			return { valid: true }
		}, "openai")
	}
	get embedderInfo() {
		return {
			name: "openai",
		}
	}
}
exports.OpenAiEmbedder = OpenAiEmbedder
