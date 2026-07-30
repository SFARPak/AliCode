"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const openai_1 = require("openai")
const openrouter_1 = require("../openrouter")
const embeddingModels_1 = require("../../../../shared/embeddingModels")
// Mock the OpenAI SDK
vitest_1.vi.mock("openai")
// Mock i18n
vitest_1.vi.mock("../../../../i18n", () => ({
	t: (key, params) => {
		const translations = {
			"embeddings:validation.apiKeyRequired": "validation.apiKeyRequired",
			"embeddings:authenticationFailed":
				"Failed to create embeddings: Authentication failed. Please check your OpenRouter API key.",
			"embeddings:failedWithStatus": `Failed to create embeddings after ${params?.attempts} attempts: HTTP ${params?.statusCode} - ${params?.errorMessage}`,
			"embeddings:failedWithError": `Failed to create embeddings after ${params?.attempts} attempts: ${params?.errorMessage}`,
			"embeddings:failedMaxAttempts": `Failed to create embeddings after ${params?.attempts} attempts`,
			"embeddings:textExceedsTokenLimit": `Text at index ${params?.index} exceeds maximum token limit (${params?.itemTokens} > ${params?.maxTokens}). Skipping.`,
			"embeddings:rateLimitRetry": `Rate limit hit, retrying in ${params?.delayMs}ms (attempt ${params?.attempt}/${params?.maxRetries})`,
		}
		return translations[key] || key
	},
}))
const MockedOpenAI = openai_1.OpenAI
;(0, vitest_1.describe)("OpenRouterEmbedder", () => {
	const mockApiKey = "test-api-key"
	let mockEmbeddingsCreate
	let mockOpenAIInstance
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		vitest_1.vi.spyOn(console, "warn").mockImplementation(() => {})
		vitest_1.vi.spyOn(console, "error").mockImplementation(() => {})
		// Setup mock OpenAI instance
		mockEmbeddingsCreate = vitest_1.vi.fn()
		mockOpenAIInstance = {
			embeddings: {
				create: mockEmbeddingsCreate,
			},
		}
		MockedOpenAI.mockImplementation(() => mockOpenAIInstance)
	})
	afterEach(() => {
		vitest_1.vi.restoreAllMocks()
	})
	;(0, vitest_1.describe)("constructor", () => {
		;(0, vitest_1.it)("should create an instance with valid API key", () => {
			const embedder = new openrouter_1.OpenRouterEmbedder(mockApiKey)
			;(0, vitest_1.expect)(embedder).toBeInstanceOf(openrouter_1.OpenRouterEmbedder)
		})
		;(0, vitest_1.it)("should throw error with empty API key", () => {
			;(0, vitest_1.expect)(() => new openrouter_1.OpenRouterEmbedder("")).toThrow("validation.apiKeyRequired")
		})
		;(0, vitest_1.it)("should use default model when none specified", () => {
			const embedder = new openrouter_1.OpenRouterEmbedder(mockApiKey)
			const expectedDefault = (0, embeddingModels_1.getDefaultModelId)("openrouter")
			;(0, vitest_1.expect)(embedder.embedderInfo.name).toBe("openrouter")
		})
		;(0, vitest_1.it)("should use custom model when specified", () => {
			const customModel = "openai/text-embedding-3-small"
			const embedder = new openrouter_1.OpenRouterEmbedder(mockApiKey, customModel)
			;(0, vitest_1.expect)(embedder.embedderInfo.name).toBe("openrouter")
		})
		;(0, vitest_1.it)("should initialize OpenAI client with correct headers", () => {
			new openrouter_1.OpenRouterEmbedder(mockApiKey)
			;(0, vitest_1.expect)(MockedOpenAI).toHaveBeenCalledWith({
				baseURL: "https://openrouter.ai/api/v1",
				apiKey: mockApiKey,
				defaultHeaders: {
					"HTTP-Referer": "https://github.com/AliCodeInc/Roo-Code",
					"X-Title": "AliCode",
				},
			})
		})
		;(0, vitest_1.it)("should accept specificProvider parameter", () => {
			const embedder = new openrouter_1.OpenRouterEmbedder(mockApiKey, undefined, undefined, "together")
			;(0, vitest_1.expect)(embedder).toBeInstanceOf(openrouter_1.OpenRouterEmbedder)
		})
		;(0, vitest_1.it)("should ignore default provider name as specificProvider", () => {
			const embedder = new openrouter_1.OpenRouterEmbedder(
				mockApiKey,
				undefined,
				undefined,
				openrouter_1.OPENROUTER_DEFAULT_PROVIDER_NAME,
			)
			;(0, vitest_1.expect)(embedder).toBeInstanceOf(openrouter_1.OpenRouterEmbedder)
		})
	})
	;(0, vitest_1.describe)("embedderInfo", () => {
		;(0, vitest_1.it)("should return correct embedder info", () => {
			const embedder = new openrouter_1.OpenRouterEmbedder(mockApiKey)
			;(0, vitest_1.expect)(embedder.embedderInfo).toEqual({
				name: "openrouter",
			})
		})
	})
	;(0, vitest_1.describe)("createEmbeddings", () => {
		let embedder
		;(0, vitest_1.beforeEach)(() => {
			embedder = new openrouter_1.OpenRouterEmbedder(mockApiKey)
		})
		;(0, vitest_1.it)("should create embeddings successfully", async () => {
			// Create base64 encoded embedding with values that can be exactly represented in Float32
			const testEmbedding = new Float32Array([0.25, 0.5, 0.75])
			const base64String = Buffer.from(testEmbedding.buffer).toString("base64")
			const mockResponse = {
				data: [
					{
						embedding: base64String,
					},
				],
				usage: {
					prompt_tokens: 5,
					total_tokens: 5,
				},
			}
			mockEmbeddingsCreate.mockResolvedValue(mockResponse)
			const result = await embedder.createEmbeddings(["test text"])
			;(0, vitest_1.expect)(mockEmbeddingsCreate).toHaveBeenCalledWith({
				input: ["test text"],
				model: "openai/text-embedding-3-large",
				encoding_format: "base64",
			})
			;(0, vitest_1.expect)(result.embeddings).toHaveLength(1)
			;(0, vitest_1.expect)(result.embeddings[0]).toEqual([0.25, 0.5, 0.75])
			;(0, vitest_1.expect)(result.usage?.promptTokens).toBe(5)
			;(0, vitest_1.expect)(result.usage?.totalTokens).toBe(5)
		})
		;(0, vitest_1.it)("should handle multiple texts", async () => {
			const embedding1 = new Float32Array([0.25, 0.5])
			const embedding2 = new Float32Array([0.75, 1.0])
			const base64String1 = Buffer.from(embedding1.buffer).toString("base64")
			const base64String2 = Buffer.from(embedding2.buffer).toString("base64")
			const mockResponse = {
				data: [
					{
						embedding: base64String1,
					},
					{
						embedding: base64String2,
					},
				],
				usage: {
					prompt_tokens: 10,
					total_tokens: 10,
				},
			}
			mockEmbeddingsCreate.mockResolvedValue(mockResponse)
			const result = await embedder.createEmbeddings(["text1", "text2"])
			;(0, vitest_1.expect)(result.embeddings).toHaveLength(2)
			;(0, vitest_1.expect)(result.embeddings[0]).toEqual([0.25, 0.5])
			;(0, vitest_1.expect)(result.embeddings[1]).toEqual([0.75, 1.0])
		})
		;(0, vitest_1.it)("should use custom model when provided", async () => {
			const customModel = "mistralai/mistral-embed-2312"
			const embedderWithCustomModel = new openrouter_1.OpenRouterEmbedder(mockApiKey, customModel)
			const testEmbedding = new Float32Array([0.25, 0.5])
			const base64String = Buffer.from(testEmbedding.buffer).toString("base64")
			const mockResponse = {
				data: [
					{
						embedding: base64String,
					},
				],
				usage: {
					prompt_tokens: 5,
					total_tokens: 5,
				},
			}
			mockEmbeddingsCreate.mockResolvedValue(mockResponse)
			await embedderWithCustomModel.createEmbeddings(["test"])
			// Verify the embeddings.create was called with the custom model
			;(0, vitest_1.expect)(mockEmbeddingsCreate).toHaveBeenCalledWith({
				input: ["test"],
				model: customModel,
				encoding_format: "base64",
			})
		})
		;(0, vitest_1.it)("should include provider routing when specificProvider is set", async () => {
			const specificProvider = "together"
			const embedderWithProvider = new openrouter_1.OpenRouterEmbedder(
				mockApiKey,
				undefined,
				undefined,
				specificProvider,
			)
			const testEmbedding = new Float32Array([0.25, 0.5])
			const base64String = Buffer.from(testEmbedding.buffer).toString("base64")
			const mockResponse = {
				data: [
					{
						embedding: base64String,
					},
				],
				usage: {
					prompt_tokens: 5,
					total_tokens: 5,
				},
			}
			mockEmbeddingsCreate.mockResolvedValue(mockResponse)
			await embedderWithProvider.createEmbeddings(["test"])
			// Verify the embeddings.create was called with provider routing
			;(0, vitest_1.expect)(mockEmbeddingsCreate).toHaveBeenCalledWith({
				input: ["test"],
				model: "openai/text-embedding-3-large",
				encoding_format: "base64",
				provider: {
					order: [specificProvider],
					only: [specificProvider],
					allow_fallbacks: false,
				},
			})
		})
		;(0, vitest_1.it)("should not include provider routing when specificProvider is default", async () => {
			const embedderWithDefaultProvider = new openrouter_1.OpenRouterEmbedder(
				mockApiKey,
				undefined,
				undefined,
				openrouter_1.OPENROUTER_DEFAULT_PROVIDER_NAME,
			)
			const testEmbedding = new Float32Array([0.25, 0.5])
			const base64String = Buffer.from(testEmbedding.buffer).toString("base64")
			const mockResponse = {
				data: [
					{
						embedding: base64String,
					},
				],
				usage: {
					prompt_tokens: 5,
					total_tokens: 5,
				},
			}
			mockEmbeddingsCreate.mockResolvedValue(mockResponse)
			await embedderWithDefaultProvider.createEmbeddings(["test"])
			// Verify the embeddings.create was called without provider routing
			;(0, vitest_1.expect)(mockEmbeddingsCreate).toHaveBeenCalledWith({
				input: ["test"],
				model: "openai/text-embedding-3-large",
				encoding_format: "base64",
			})
		})
	})
	;(0, vitest_1.describe)("validateConfiguration", () => {
		let embedder
		;(0, vitest_1.beforeEach)(() => {
			embedder = new openrouter_1.OpenRouterEmbedder(mockApiKey)
		})
		;(0, vitest_1.it)("should validate configuration successfully", async () => {
			const testEmbedding = new Float32Array([0.25, 0.5])
			const base64String = Buffer.from(testEmbedding.buffer).toString("base64")
			const mockResponse = {
				data: [
					{
						embedding: base64String,
					},
				],
				usage: {
					prompt_tokens: 1,
					total_tokens: 1,
				},
			}
			mockEmbeddingsCreate.mockResolvedValue(mockResponse)
			const result = await embedder.validateConfiguration()
			;(0, vitest_1.expect)(result.valid).toBe(true)
			;(0, vitest_1.expect)(result.error).toBeUndefined()
			;(0, vitest_1.expect)(mockEmbeddingsCreate).toHaveBeenCalledWith({
				input: ["test"],
				model: "openai/text-embedding-3-large",
				encoding_format: "base64",
			})
		})
		;(0, vitest_1.it)("should handle validation failure", async () => {
			const authError = new Error("Invalid API key")
			authError.status = 401
			mockEmbeddingsCreate.mockRejectedValue(authError)
			const result = await embedder.validateConfiguration()
			;(0, vitest_1.expect)(result.valid).toBe(false)
			;(0, vitest_1.expect)(result.error).toBe("embeddings:validation.authenticationFailed")
		})
		;(0, vitest_1.it)("should validate configuration with specificProvider", async () => {
			const specificProvider = "openai"
			const embedderWithProvider = new openrouter_1.OpenRouterEmbedder(
				mockApiKey,
				undefined,
				undefined,
				specificProvider,
			)
			const testEmbedding = new Float32Array([0.25, 0.5])
			const base64String = Buffer.from(testEmbedding.buffer).toString("base64")
			const mockResponse = {
				data: [
					{
						embedding: base64String,
					},
				],
				usage: {
					prompt_tokens: 1,
					total_tokens: 1,
				},
			}
			mockEmbeddingsCreate.mockResolvedValue(mockResponse)
			const result = await embedderWithProvider.validateConfiguration()
			;(0, vitest_1.expect)(result.valid).toBe(true)
			;(0, vitest_1.expect)(result.error).toBeUndefined()
			;(0, vitest_1.expect)(mockEmbeddingsCreate).toHaveBeenCalledWith({
				input: ["test"],
				model: "openai/text-embedding-3-large",
				encoding_format: "base64",
				provider: {
					order: [specificProvider],
					only: [specificProvider],
					allow_fallbacks: false,
				},
			})
		})
	})
	;(0, vitest_1.describe)("integration with shared models", () => {
		;(0, vitest_1.it)("should work with defined OpenRouter models", () => {
			const openRouterModels = [
				"openai/text-embedding-3-small",
				"openai/text-embedding-3-large",
				"openai/text-embedding-ada-002",
				"google/gemini-embedding-001",
				"mistralai/mistral-embed-2312",
				"mistralai/codestral-embed-2505",
				"qwen/qwen3-embedding-0.6b",
				"qwen/qwen3-embedding-4b",
				"qwen/qwen3-embedding-8b",
			]
			openRouterModels.forEach((model) => {
				const dimension = (0, embeddingModels_1.getModelDimension)("openrouter", model)
				;(0, vitest_1.expect)(dimension).toBeDefined()
				;(0, vitest_1.expect)(dimension).toBeGreaterThan(0)
				const embedder = new openrouter_1.OpenRouterEmbedder(mockApiKey, model)
				;(0, vitest_1.expect)(embedder.embedderInfo.name).toBe("openrouter")
			})
		})
		;(0, vitest_1.it)("should use correct default model", () => {
			const defaultModel = (0, embeddingModels_1.getDefaultModelId)("openrouter")
			;(0, vitest_1.expect)(defaultModel).toBe("openai/text-embedding-3-large")
			const dimension = (0, embeddingModels_1.getModelDimension)("openrouter", defaultModel)
			;(0, vitest_1.expect)(dimension).toBe(3072)
		})
	})
})
