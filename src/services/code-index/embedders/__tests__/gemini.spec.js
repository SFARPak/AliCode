"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const gemini_1 = require("../gemini")
const openai_compatible_1 = require("../openai-compatible")
// Mock the OpenAICompatibleEmbedder
vitest_1.vitest.mock("../openai-compatible")
const MockedOpenAICompatibleEmbedder = openai_compatible_1.OpenAICompatibleEmbedder
;(0, vitest_1.describe)("GeminiEmbedder", () => {
	let embedder
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vitest.clearAllMocks()
	})
	;(0, vitest_1.describe)("constructor", () => {
		;(0, vitest_1.it)("should create an instance with default model when no model specified", () => {
			// Arrange
			const apiKey = "test-gemini-api-key"
			// Act
			embedder = new gemini_1.GeminiEmbedder(apiKey)
			// Assert
			;(0, vitest_1.expect)(MockedOpenAICompatibleEmbedder).toHaveBeenCalledWith(
				"https://generativelanguage.googleapis.com/v1beta/openai/",
				apiKey,
				"gemini-embedding-001",
				2048,
			)
		})
		;(0, vitest_1.it)("should create an instance with specified model", () => {
			// Arrange
			const apiKey = "test-gemini-api-key"
			const modelId = "gemini-embedding-001"
			// Act
			embedder = new gemini_1.GeminiEmbedder(apiKey, modelId)
			// Assert
			;(0, vitest_1.expect)(MockedOpenAICompatibleEmbedder).toHaveBeenCalledWith(
				"https://generativelanguage.googleapis.com/v1beta/openai/",
				apiKey,
				"gemini-embedding-001",
				2048,
			)
		})
		;(0, vitest_1.it)("should migrate deprecated text-embedding-004 to gemini-embedding-001", () => {
			// Arrange
			const apiKey = "test-gemini-api-key"
			const deprecatedModelId = "text-embedding-004"
			// Act
			embedder = new gemini_1.GeminiEmbedder(apiKey, deprecatedModelId)
			// Assert - should be migrated to gemini-embedding-001
			;(0, vitest_1.expect)(MockedOpenAICompatibleEmbedder).toHaveBeenCalledWith(
				"https://generativelanguage.googleapis.com/v1beta/openai/",
				apiKey,
				"gemini-embedding-001",
				2048,
			)
		})
		;(0, vitest_1.it)("should throw error when API key is not provided", () => {
			// Act & Assert
			;(0, vitest_1.expect)(() => new gemini_1.GeminiEmbedder("")).toThrow("validation.apiKeyRequired")
			;(0, vitest_1.expect)(() => new gemini_1.GeminiEmbedder(null)).toThrow("validation.apiKeyRequired")
			;(0, vitest_1.expect)(() => new gemini_1.GeminiEmbedder(undefined)).toThrow("validation.apiKeyRequired")
		})
	})
	;(0, vitest_1.describe)("embedderInfo", () => {
		;(0, vitest_1.it)("should return correct embedder info", () => {
			// Arrange
			embedder = new gemini_1.GeminiEmbedder("test-api-key")
			// Act
			const info = embedder.embedderInfo
			// Assert
			;(0, vitest_1.expect)(info).toEqual({
				name: "gemini",
			})
		})
		;(0, vitest_1.describe)("createEmbeddings", () => {
			let mockCreateEmbeddings
			;(0, vitest_1.beforeEach)(() => {
				mockCreateEmbeddings = vitest_1.vitest.fn()
				MockedOpenAICompatibleEmbedder.prototype.createEmbeddings = mockCreateEmbeddings
			})
			;(0, vitest_1.it)("should use instance model when no model parameter provided", async () => {
				// Arrange
				embedder = new gemini_1.GeminiEmbedder("test-api-key")
				const texts = ["test text 1", "test text 2"]
				const mockResponse = {
					embeddings: [
						[0.1, 0.2],
						[0.3, 0.4],
					],
				}
				mockCreateEmbeddings.mockResolvedValue(mockResponse)
				// Act
				const result = await embedder.createEmbeddings(texts)
				// Assert
				;(0, vitest_1.expect)(mockCreateEmbeddings).toHaveBeenCalledWith(texts, "gemini-embedding-001")
				;(0, vitest_1.expect)(result).toEqual(mockResponse)
			})
			;(0, vitest_1.it)("should use provided model parameter when specified", async () => {
				// Arrange - even with deprecated model in constructor, the runtime parameter takes precedence
				embedder = new gemini_1.GeminiEmbedder("test-api-key", "gemini-embedding-001")
				const texts = ["test text 1", "test text 2"]
				const mockResponse = {
					embeddings: [
						[0.1, 0.2],
						[0.3, 0.4],
					],
				}
				mockCreateEmbeddings.mockResolvedValue(mockResponse)
				// Act - specify a different model at runtime
				const result = await embedder.createEmbeddings(texts, "gemini-embedding-001")
				// Assert
				;(0, vitest_1.expect)(mockCreateEmbeddings).toHaveBeenCalledWith(texts, "gemini-embedding-001")
				;(0, vitest_1.expect)(result).toEqual(mockResponse)
			})
			;(0, vitest_1.it)("should handle errors from OpenAICompatibleEmbedder", async () => {
				// Arrange
				embedder = new gemini_1.GeminiEmbedder("test-api-key")
				const texts = ["test text"]
				const error = new Error("Embedding failed")
				mockCreateEmbeddings.mockRejectedValue(error)
				// Act & Assert
				await (0, vitest_1.expect)(embedder.createEmbeddings(texts)).rejects.toThrow("Embedding failed")
			})
		})
	})
	;(0, vitest_1.describe)("validateConfiguration", () => {
		let mockValidateConfiguration
		;(0, vitest_1.beforeEach)(() => {
			mockValidateConfiguration = vitest_1.vitest.fn()
			MockedOpenAICompatibleEmbedder.prototype.validateConfiguration = mockValidateConfiguration
		})
		;(0, vitest_1.it)("should delegate validation to OpenAICompatibleEmbedder", async () => {
			// Arrange
			embedder = new gemini_1.GeminiEmbedder("test-api-key")
			mockValidateConfiguration.mockResolvedValue({ valid: true })
			// Act
			const result = await embedder.validateConfiguration()
			// Assert
			;(0, vitest_1.expect)(mockValidateConfiguration).toHaveBeenCalled()
			;(0, vitest_1.expect)(result).toEqual({ valid: true })
		})
		;(0, vitest_1.it)("should pass through validation errors from OpenAICompatibleEmbedder", async () => {
			// Arrange
			embedder = new gemini_1.GeminiEmbedder("test-api-key")
			mockValidateConfiguration.mockResolvedValue({
				valid: false,
				error: "embeddings:validation.authenticationFailed",
			})
			// Act
			const result = await embedder.validateConfiguration()
			// Assert
			;(0, vitest_1.expect)(mockValidateConfiguration).toHaveBeenCalled()
			;(0, vitest_1.expect)(result).toEqual({
				valid: false,
				error: "embeddings:validation.authenticationFailed",
			})
		})
		;(0, vitest_1.it)("should handle validation exceptions", async () => {
			// Arrange
			embedder = new gemini_1.GeminiEmbedder("test-api-key")
			mockValidateConfiguration.mockRejectedValue(new Error("Validation failed"))
			// Act & Assert
			await (0, vitest_1.expect)(embedder.validateConfiguration()).rejects.toThrow("Validation failed")
		})
	})
})
