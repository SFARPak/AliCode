"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.BedrockEmbedder = void 0
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime")
const credential_providers_1 = require("@aws-sdk/credential-providers")
const constants_1 = require("../constants")
const embeddingModels_1 = require("../../../shared/embeddingModels")
const package_1 = require("../../../shared/package")
const i18n_1 = require("../../../i18n")
const validation_helpers_1 = require("../shared/validation-helpers")
/**
 * Amazon Bedrock implementation of the embedder interface with batching and rate limiting
 */
class BedrockEmbedder {
	region
	profile
	bedrockClient
	defaultModelId
	/**
	 * Creates a new Amazon Bedrock embedder
	 * @param region AWS region for Bedrock service (required)
	 * @param profile AWS profile name for credentials (optional - uses default credential chain if not provided)
	 * @param modelId Optional model ID override
	 */
	constructor(region, profile, modelId) {
		this.region = region
		this.profile = profile
		if (!region) {
			throw new Error("Region is required for AWS Bedrock embedder")
		}
		// Initialize the Bedrock client with credentials
		// If profile is specified, use it; otherwise use default credential chain
		const credentials = this.profile
			? (0, credential_providers_1.fromIni)({ profile: this.profile })
			: (0, credential_providers_1.fromNodeProviderChain)()
		this.bedrockClient = new client_bedrock_runtime_1.BedrockRuntimeClient({
			userAgentAppId: `AliCode#${package_1.Package.version}`,
			region: this.region,
			credentials,
		})
		this.defaultModelId = modelId || (0, embeddingModels_1.getDefaultModelId)("bedrock")
	}
	/**
	 * Creates embeddings for the given texts with batching and rate limiting
	 * @param texts Array of text strings to embed
	 * @param model Optional model identifier
	 * @returns Promise resolving to embedding response
	 */
	async createEmbeddings(texts, model) {
		const modelToUse = model || this.defaultModelId
		const allEmbeddings = []
		const usage = { promptTokens: 0, totalTokens: 0 }
		const remainingTexts = [...texts]
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
				const embeddings = []
				let totalPromptTokens = 0
				let totalTokens = 0
				// Process each text in the batch
				// Note: Amazon Titan models typically don't support batch embedding in a single request
				// So we process them individually
				for (const text of batchTexts) {
					const embedding = await this._invokeEmbeddingModel(text, model)
					embeddings.push(embedding.embedding)
					totalPromptTokens += embedding.inputTextTokenCount || 0
					totalTokens += embedding.inputTextTokenCount || 0
				}
				return {
					embeddings,
					usage: {
						promptTokens: totalPromptTokens,
						totalTokens,
					},
				}
			} catch (error) {
				const hasMoreAttempts = attempts < constants_1.MAX_BATCH_RETRIES - 1
				// Check if it's a rate limit error
				if (error.name === "ThrottlingException" && hasMoreAttempts) {
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
					`Bedrock embedder error (attempt ${attempts + 1}/${constants_1.MAX_BATCH_RETRIES}):`,
					error,
				)
				// Format and throw the error
				throw (0, validation_helpers_1.formatEmbeddingError)(error, constants_1.MAX_BATCH_RETRIES)
			}
		}
		throw new Error((0, i18n_1.t)("embeddings:failedMaxAttempts", { attempts: constants_1.MAX_BATCH_RETRIES }))
	}
	/**
	 * Invokes the embedding model for a single text
	 * @param text The text to embed
	 * @param model The model identifier to use
	 * @returns Promise resolving to embedding and token count
	 */
	async _invokeEmbeddingModel(text, model) {
		let requestBody
		let modelId = model
		// Prepare the request body based on the model
		if (model.startsWith("amazon.nova-2-multimodal")) {
			// Nova multimodal embeddings use a task-based format with embeddingParams
			// Reference: https://docs.aws.amazon.com/bedrock/latest/userguide/embeddings-nova.html
			requestBody = {
				taskType: "SINGLE_EMBEDDING",
				singleEmbeddingParams: {
					embeddingPurpose: "GENERIC_INDEX",
					embeddingDimension: 1024, // Nova supports 1024 or 3072
					text: {
						truncationMode: "END",
						value: text,
					},
				},
			}
		} else if (model.startsWith("amazon.titan-embed")) {
			requestBody = {
				inputText: text,
			}
		} else if (model.startsWith("cohere.embed-v4")) {
			// Cohere Embed v4 requires embedding_types parameter
			requestBody = {
				texts: [text],
				input_type: "search_document",
				embedding_types: ["float"],
			}
		} else if (model.startsWith("cohere.embed")) {
			// Cohere Embed v3 format
			requestBody = {
				texts: [text],
				input_type: "search_document",
			}
		} else {
			// Default to Titan format
			requestBody = {
				inputText: text,
			}
		}
		const params = {
			modelId,
			body: JSON.stringify(requestBody),
			contentType: "application/json",
			accept: "application/json",
		}
		const command = new client_bedrock_runtime_1.InvokeModelCommand(params)
		const response = await this.bedrockClient.send(command)
		// Parse the response
		const responseBody = JSON.parse(new TextDecoder().decode(response.body))
		// Extract embedding based on model type
		if (model.startsWith("amazon.nova-2-multimodal")) {
			// Nova multimodal returns { embeddings: [{ embedding: [...] }] }
			// Reference: AWS Bedrock documentation
			return {
				embedding: responseBody.embeddings?.[0]?.embedding || responseBody.embedding,
				inputTextTokenCount: responseBody.inputTextTokenCount,
			}
		} else if (model.startsWith("amazon.titan-embed")) {
			return {
				embedding: responseBody.embedding,
				inputTextTokenCount: responseBody.inputTextTokenCount,
			}
		} else if (model.startsWith("cohere.embed-v4")) {
			// Cohere Embed v4 returns { embeddings: { float: [[...]] } }
			return {
				embedding: responseBody.embeddings?.float?.[0] || responseBody.embeddings?.[0],
			}
		} else if (model.startsWith("cohere.embed")) {
			// Cohere Embed v3 returns { embeddings: [[...]] }
			return {
				embedding: responseBody.embeddings[0],
			}
		} else {
			// Default to Titan format
			return {
				embedding: responseBody.embedding,
				inputTextTokenCount: responseBody.inputTextTokenCount,
			}
		}
	}
	/**
	 * Validates the Bedrock embedder configuration by attempting a minimal embedding request
	 * @returns Promise resolving to validation result with success status and optional error message
	 */
	async validateConfiguration() {
		return (0, validation_helpers_1.withValidationErrorHandling)(async () => {
			try {
				// Test with a minimal embedding request
				const result = await this._invokeEmbeddingModel("test", this.defaultModelId)
				// Check if we got a valid response
				if (!result.embedding || result.embedding.length === 0) {
					return {
						valid: false,
						error: (0, i18n_1.t)("embeddings:bedrock.invalidResponseFormat"),
					}
				}
				return { valid: true }
			} catch (error) {
				// Check for specific AWS errors
				if (error.name === "UnrecognizedClientException") {
					return {
						valid: false,
						error: (0, i18n_1.t)("embeddings:bedrock.invalidCredentials"),
					}
				}
				if (error.name === "AccessDeniedException") {
					return {
						valid: false,
						error: (0, i18n_1.t)("embeddings:bedrock.accessDenied"),
					}
				}
				if (error.name === "ResourceNotFoundException") {
					return {
						valid: false,
						error: (0, i18n_1.t)("embeddings:bedrock.modelNotFound", { model: this.defaultModelId }),
					}
				}
				throw error
			}
		}, "bedrock")
	}
	get embedderInfo() {
		return {
			name: "bedrock",
		}
	}
}
exports.BedrockEmbedder = BedrockEmbedder
