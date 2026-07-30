"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const mistral_1 = require("../mistral")
const openai_compatible_1 = require("../openai-compatible")
// Mock the OpenAICompatibleEmbedder
vitest.mock("../openai-compatible")
const MockedOpenAICompatibleEmbedder = openai_compatible_1.OpenAICompatibleEmbedder
describe("MistralEmbedder", () => {
	let embedder
	beforeEach(() => {
		vitest.clearAllMocks()
	})
	describe("constructor", () => {
		it("should create an instance with default model when no model specified", () => {
			// Arrange
			const apiKey = "test-mistral-api-key"
			// Act
			embedder = new mistral_1.MistralEmbedder(apiKey)
			// Assert
			expect(MockedOpenAICompatibleEmbedder).toHaveBeenCalledWith(
				"https://api.mistral.ai/v1",
				apiKey,
				"codestral-embed-2505",
				8191,
			)
		})
		it("should create an instance with specified model", () => {
			// Arrange
			const apiKey = "test-mistral-api-key"
			const modelId = "custom-embed-model"
			// Act
			embedder = new mistral_1.MistralEmbedder(apiKey, modelId)
			// Assert
			expect(MockedOpenAICompatibleEmbedder).toHaveBeenCalledWith(
				"https://api.mistral.ai/v1",
				apiKey,
				"custom-embed-model",
				8191,
			)
		})
		it("should throw error when API key is not provided", () => {
			// Act & Assert
			expect(() => new mistral_1.MistralEmbedder("")).toThrow("validation.apiKeyRequired")
			expect(() => new mistral_1.MistralEmbedder(null)).toThrow("validation.apiKeyRequired")
			expect(() => new mistral_1.MistralEmbedder(undefined)).toThrow("validation.apiKeyRequired")
		})
	})
	describe("embedderInfo", () => {
		it("should return correct embedder info", () => {
			// Arrange
			embedder = new mistral_1.MistralEmbedder("test-api-key")
			// Act
			const info = embedder.embedderInfo
			// Assert
			expect(info).toEqual({
				name: "mistral",
			})
		})
		describe("createEmbeddings", () => {
			let mockCreateEmbeddings
			beforeEach(() => {
				mockCreateEmbeddings = vitest.fn()
				MockedOpenAICompatibleEmbedder.prototype.createEmbeddings = mockCreateEmbeddings
			})
			it("should use instance model when no model parameter provided", async () => {
				// Arrange
				embedder = new mistral_1.MistralEmbedder("test-api-key")
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
				expect(mockCreateEmbeddings).toHaveBeenCalledWith(texts, "codestral-embed-2505")
				expect(result).toEqual(mockResponse)
			})
			it("should use provided model parameter when specified", async () => {
				// Arrange
				embedder = new mistral_1.MistralEmbedder("test-api-key", "custom-embed-model")
				const texts = ["test text 1", "test text 2"]
				const mockResponse = {
					embeddings: [
						[0.1, 0.2],
						[0.3, 0.4],
					],
				}
				mockCreateEmbeddings.mockResolvedValue(mockResponse)
				// Act
				const result = await embedder.createEmbeddings(texts, "codestral-embed-2505")
				// Assert
				expect(mockCreateEmbeddings).toHaveBeenCalledWith(texts, "codestral-embed-2505")
				expect(result).toEqual(mockResponse)
			})
			it("should handle errors from OpenAICompatibleEmbedder", async () => {
				// Arrange
				embedder = new mistral_1.MistralEmbedder("test-api-key")
				const texts = ["test text"]
				const error = new Error("Embedding failed")
				mockCreateEmbeddings.mockRejectedValue(error)
				// Act & Assert
				await expect(embedder.createEmbeddings(texts)).rejects.toThrow("Embedding failed")
			})
		})
	})
	describe("validateConfiguration", () => {
		let mockValidateConfiguration
		beforeEach(() => {
			mockValidateConfiguration = vitest.fn()
			MockedOpenAICompatibleEmbedder.prototype.validateConfiguration = mockValidateConfiguration
		})
		it("should delegate validation to OpenAICompatibleEmbedder", async () => {
			// Arrange
			embedder = new mistral_1.MistralEmbedder("test-api-key")
			mockValidateConfiguration.mockResolvedValue({ valid: true })
			// Act
			const result = await embedder.validateConfiguration()
			// Assert
			expect(mockValidateConfiguration).toHaveBeenCalled()
			expect(result).toEqual({ valid: true })
		})
		it("should pass through validation errors from OpenAICompatibleEmbedder", async () => {
			// Arrange
			embedder = new mistral_1.MistralEmbedder("test-api-key")
			mockValidateConfiguration.mockResolvedValue({
				valid: false,
				error: "embeddings:validation.authenticationFailed",
			})
			// Act
			const result = await embedder.validateConfiguration()
			// Assert
			expect(mockValidateConfiguration).toHaveBeenCalled()
			expect(result).toEqual({
				valid: false,
				error: "embeddings:validation.authenticationFailed",
			})
		})
		it("should handle validation exceptions", async () => {
			// Arrange
			embedder = new mistral_1.MistralEmbedder("test-api-key")
			mockValidateConfiguration.mockRejectedValue(new Error("Validation failed"))
			// Act & Assert
			await expect(embedder.validateConfiguration()).rejects.toThrow("Validation failed")
		})
	})
})
