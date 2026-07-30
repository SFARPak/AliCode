"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.OpenRouterEmbedder = exports.OPENROUTER_DEFAULT_PROVIDER_NAME = void 0
const openai_1 = require("openai")
const constants_1 = require("../constants")
const embeddingModels_1 = require("../../../shared/embeddingModels")
const i18n_1 = require("../../../i18n")
const validation_helpers_1 = require("../shared/validation-helpers")
const async_mutex_1 = require("async-mutex")
const openai_error_handler_1 = require("../../../api/providers/utils/openai-error-handler")
// Default provider name when no specific provider is selected
exports.OPENROUTER_DEFAULT_PROVIDER_NAME = "[default]"
/**
 * OpenRouter implementation of the embedder interface with batching and rate limiting.
 * OpenRouter provides an OpenAI-compatible API that gives access to hundreds of models
 * through a single endpoint, automatically handling fallbacks and cost optimization.
 */
class OpenRouterEmbedder {
	embeddingsClient
	defaultModelId
	apiKey
	maxItemTokens
	baseUrl = "https://openrouter.ai/api/v1"
	specificProvider
	// Global rate limiting state shared across all instances
	static globalRateLimitState = {
		isRateLimited: false,
		rateLimitResetTime: 0,
		consecutiveRateLimitErrors: 0,
		lastRateLimitError: 0,
		// Mutex to ensure thread-safe access to rate limit state
		mutex: new async_mutex_1.Mutex(),
	}
	/**
	 * Creates a new OpenRouter embedder
	 * @param apiKey The API key for authentication
	 * @param modelId Optional model identifier (defaults to "openai/text-embedding-3-large")
	 * @param maxItemTokens Optional maximum tokens per item (defaults to MAX_ITEM_TOKENS)
	 * @param specificProvider Optional specific provider to route requests to
	 */
	constructor(apiKey, modelId, maxItemTokens, specificProvider) {
		if (!apiKey) {
			throw new Error((0, i18n_1.t)("embeddings:validation.apiKeyRequired"))
		}
		this.apiKey = apiKey
		// Only set specificProvider if it's not the default value
		this.specificProvider =
			specificProvider && specificProvider !== exports.OPENROUTER_DEFAULT_PROVIDER_NAME
				? specificProvider
				: undefined
		// Wrap OpenAI client creation to handle invalid API key characters
		try {
			this.embeddingsClient = new openai_1.OpenAI({
				baseURL: this.baseUrl,
				apiKey: apiKey,
				defaultHeaders: {
					"HTTP-Referer": "https://github.com/AliCodeInc/Roo-Code",
					"X-Title": "AliCode",
				},
			})
		} catch (error) {
			// Use the error handler to transform ByteString conversion errors
			throw (0, openai_error_handler_1.handleOpenAIError)(error, "OpenRouter")
		}
		this.defaultModelId = modelId || (0, embeddingModels_1.getDefaultModelId)("openrouter")
		this.maxItemTokens = maxItemTokens || constants_1.MAX_ITEM_TOKENS
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
		const queryPrefix = (0, embeddingModels_1.getModelQueryPrefix)("openrouter", modelToUse)
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
				if (itemTokens > this.maxItemTokens) {
					console.warn(
						(0, i18n_1.t)("embeddings:textExceedsTokenLimit", {
							index: i,
							itemTokens,
							maxTokens: this.maxItemTokens,
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
			// Check global rate limit before attempting request
			await this.waitForGlobalRateLimit()
			try {
				// Build the request parameters
				const requestParams = {
					input: batchTexts,
					model: model,
					// OpenAI package (as of v4.78.1) has a parsing issue that truncates embedding dimensions to 256
					// when processing numeric arrays, which breaks compatibility with models using larger dimensions.
					// By requesting base64 encoding, we bypass the package's parser and handle decoding ourselves.
					encoding_format: "base64",
				}
				// Add provider routing if a specific provider is set
				if (this.specificProvider) {
					requestParams.provider = {
						order: [this.specificProvider],
						only: [this.specificProvider],
						allow_fallbacks: false,
					}
				}
				const response = await this.embeddingsClient.embeddings.create(requestParams)
				// Convert base64 embeddings to float32 arrays
				const processedEmbeddings = response.data.map((item) => {
					if (typeof item.embedding === "string") {
						const buffer = Buffer.from(item.embedding, "base64")
						// Create Float32Array view over the buffer
						const float32Array = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4)
						return {
							...item,
							embedding: Array.from(float32Array),
						}
					}
					return item
				})
				// Replace the original data with processed embeddings
				response.data = processedEmbeddings
				const embeddings = response.data.map((item) => item.embedding)
				return {
					embeddings: embeddings,
					usage: {
						promptTokens: response.usage?.prompt_tokens || 0,
						totalTokens: response.usage?.total_tokens || 0,
					},
				}
			} catch (error) {
				const hasMoreAttempts = attempts < constants_1.MAX_BATCH_RETRIES - 1
				// Check if it's a rate limit error
				const httpError = error
				if (httpError?.status === 429) {
					// Update global rate limit state
					await this.updateGlobalRateLimitState(httpError)
					if (hasMoreAttempts) {
						// Calculate delay based on global rate limit state
						const baseDelay = constants_1.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempts)
						const globalDelay = await this.getGlobalRateLimitDelay()
						const delayMs = Math.max(baseDelay, globalDelay)
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
				}
				// Log the error for debugging
				console.error(
					`OpenRouter embedder error (attempt ${attempts + 1}/${constants_1.MAX_BATCH_RETRIES}):`,
					error,
				)
				// Format and throw the error
				throw (0, validation_helpers_1.formatEmbeddingError)(error, constants_1.MAX_BATCH_RETRIES)
			}
		}
		throw new Error((0, i18n_1.t)("embeddings:failedMaxAttempts", { attempts: constants_1.MAX_BATCH_RETRIES }))
	}
	/**
	 * Validates the OpenRouter embedder configuration by testing API connectivity
	 * @returns Promise resolving to validation result with success status and optional error message
	 */
	async validateConfiguration() {
		return (0, validation_helpers_1.withValidationErrorHandling)(async () => {
			// Test with a minimal embedding request
			const testTexts = ["test"]
			const modelToUse = this.defaultModelId
			// Build the request parameters
			const requestParams = {
				input: testTexts,
				model: modelToUse,
				encoding_format: "base64",
			}
			// Add provider routing if a specific provider is set
			if (this.specificProvider) {
				requestParams.provider = {
					order: [this.specificProvider],
					only: [this.specificProvider],
					allow_fallbacks: false,
				}
			}
			const response = await this.embeddingsClient.embeddings.create(requestParams)
			// Check if we got a valid response
			if (!response?.data || response.data.length === 0) {
				return {
					valid: false,
					error: "embeddings:validation.invalidResponse",
				}
			}
			return { valid: true }
		}, "openrouter")
	}
	/**
	 * Returns information about this embedder
	 */
	get embedderInfo() {
		return {
			name: "openrouter",
		}
	}
	/**
	 * Waits if there's an active global rate limit
	 */
	async waitForGlobalRateLimit() {
		const release = await OpenRouterEmbedder.globalRateLimitState.mutex.acquire()
		let mutexReleased = false
		try {
			const state = OpenRouterEmbedder.globalRateLimitState
			if (state.isRateLimited && state.rateLimitResetTime > Date.now()) {
				const waitTime = state.rateLimitResetTime - Date.now()
				// Silent wait - no logging to prevent flooding
				release()
				mutexReleased = true
				await new Promise((resolve) => setTimeout(resolve, waitTime))
				return
			}
			// Reset rate limit if time has passed
			if (state.isRateLimited && state.rateLimitResetTime <= Date.now()) {
				state.isRateLimited = false
				state.consecutiveRateLimitErrors = 0
			}
		} finally {
			// Only release if we haven't already
			if (!mutexReleased) {
				release()
			}
		}
	}
	/**
	 * Updates global rate limit state when a 429 error occurs
	 */
	async updateGlobalRateLimitState(error) {
		const release = await OpenRouterEmbedder.globalRateLimitState.mutex.acquire()
		try {
			const state = OpenRouterEmbedder.globalRateLimitState
			const now = Date.now()
			// Increment consecutive rate limit errors
			if (now - state.lastRateLimitError < 60000) {
				// Within 1 minute
				state.consecutiveRateLimitErrors++
			} else {
				state.consecutiveRateLimitErrors = 1
			}
			state.lastRateLimitError = now
			// Calculate exponential backoff based on consecutive errors
			const baseDelay = 5000 // 5 seconds base
			const maxDelay = 300000 // 5 minutes max
			const exponentialDelay = Math.min(baseDelay * Math.pow(2, state.consecutiveRateLimitErrors - 1), maxDelay)
			// Set global rate limit
			state.isRateLimited = true
			state.rateLimitResetTime = now + exponentialDelay
			// Silent rate limit activation - no logging to prevent flooding
		} finally {
			release()
		}
	}
	/**
	 * Gets the current global rate limit delay
	 */
	async getGlobalRateLimitDelay() {
		const release = await OpenRouterEmbedder.globalRateLimitState.mutex.acquire()
		try {
			const state = OpenRouterEmbedder.globalRateLimitState
			if (state.isRateLimited && state.rateLimitResetTime > Date.now()) {
				return state.rateLimitResetTime - Date.now()
			}
			return 0
		} finally {
			release()
		}
	}
}
exports.OpenRouterEmbedder = OpenRouterEmbedder
