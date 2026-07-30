"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const embeddingModels_1 = require("../embeddingModels")
;(0, vitest_1.describe)("embeddingModels", () => {
	;(0, vitest_1.describe)("EMBEDDING_MODEL_PROFILES", () => {
		;(0, vitest_1.it)("should have gemini provider with gemini-embedding-001 model", () => {
			const geminiProfiles = embeddingModels_1.EMBEDDING_MODEL_PROFILES.gemini
			;(0, vitest_1.expect)(geminiProfiles).toBeDefined()
			;(0, vitest_1.expect)(geminiProfiles["gemini-embedding-001"]).toBeDefined()
			;(0, vitest_1.expect)(geminiProfiles["gemini-embedding-001"].dimension).toBe(3072)
		})
		;(0, vitest_1.it)(
			"should have deprecated text-embedding-004 in gemini profiles for backward compatibility",
			() => {
				// This is critical for backward compatibility:
				// Users with text-embedding-004 configured need dimension lookup to work
				// even though the model is migrated to gemini-embedding-001 in GeminiEmbedder
				const geminiProfiles = embeddingModels_1.EMBEDDING_MODEL_PROFILES.gemini
				;(0, vitest_1.expect)(geminiProfiles).toBeDefined()
				;(0, vitest_1.expect)(geminiProfiles["text-embedding-004"]).toBeDefined()
				;(0, vitest_1.expect)(geminiProfiles["text-embedding-004"].dimension).toBe(3072)
			},
		)
	})
	;(0, vitest_1.describe)("getModelDimension", () => {
		;(0, vitest_1.it)("should return dimension for gemini-embedding-001", () => {
			const dimension = (0, embeddingModels_1.getModelDimension)("gemini", "gemini-embedding-001")
			;(0, vitest_1.expect)(dimension).toBe(3072)
		})
		;(0, vitest_1.it)("should return dimension for deprecated text-embedding-004", () => {
			// This ensures createVectorStore() works for users with text-embedding-004 configured
			// The dimension should be 3072 (matching gemini-embedding-001) because:
			// 1. GeminiEmbedder migrates text-embedding-004 to gemini-embedding-001
			// 2. gemini-embedding-001 produces 3072-dimensional embeddings
			// 3. Vector store dimension must match the actual embedding dimension
			const dimension = (0, embeddingModels_1.getModelDimension)("gemini", "text-embedding-004")
			;(0, vitest_1.expect)(dimension).toBe(3072)
		})
		;(0, vitest_1.it)("should return undefined for unknown model", () => {
			const dimension = (0, embeddingModels_1.getModelDimension)("gemini", "unknown-model")
			;(0, vitest_1.expect)(dimension).toBeUndefined()
		})
		;(0, vitest_1.it)("should return undefined for unknown provider", () => {
			const dimension = (0, embeddingModels_1.getModelDimension)("unknown-provider", "some-model")
			;(0, vitest_1.expect)(dimension).toBeUndefined()
		})
		;(0, vitest_1.it)("should return correct dimensions for openai models", () => {
			;(0, vitest_1.expect)((0, embeddingModels_1.getModelDimension)("openai", "text-embedding-3-small")).toBe(
				1536,
			)
			;(0, vitest_1.expect)((0, embeddingModels_1.getModelDimension)("openai", "text-embedding-3-large")).toBe(
				3072,
			)
			;(0, vitest_1.expect)((0, embeddingModels_1.getModelDimension)("openai", "text-embedding-ada-002")).toBe(
				1536,
			)
		})
	})
	;(0, vitest_1.describe)("getModelScoreThreshold", () => {
		;(0, vitest_1.it)("should return score threshold for gemini-embedding-001", () => {
			const threshold = (0, embeddingModels_1.getModelScoreThreshold)("gemini", "gemini-embedding-001")
			;(0, vitest_1.expect)(threshold).toBe(0.4)
		})
		;(0, vitest_1.it)("should return score threshold for deprecated text-embedding-004", () => {
			const threshold = (0, embeddingModels_1.getModelScoreThreshold)("gemini", "text-embedding-004")
			;(0, vitest_1.expect)(threshold).toBe(0.4)
		})
		;(0, vitest_1.it)("should return undefined for unknown model", () => {
			const threshold = (0, embeddingModels_1.getModelScoreThreshold)("gemini", "unknown-model")
			;(0, vitest_1.expect)(threshold).toBeUndefined()
		})
	})
	;(0, vitest_1.describe)("getDefaultModelId", () => {
		;(0, vitest_1.it)("should return gemini-embedding-001 for gemini provider", () => {
			const defaultModel = (0, embeddingModels_1.getDefaultModelId)("gemini")
			;(0, vitest_1.expect)(defaultModel).toBe("gemini-embedding-001")
		})
		;(0, vitest_1.it)("should return text-embedding-3-small for openai provider", () => {
			const defaultModel = (0, embeddingModels_1.getDefaultModelId)("openai")
			;(0, vitest_1.expect)(defaultModel).toBe("text-embedding-3-small")
		})
		;(0, vitest_1.it)("should return codestral-embed-2505 for mistral provider", () => {
			const defaultModel = (0, embeddingModels_1.getDefaultModelId)("mistral")
			;(0, vitest_1.expect)(defaultModel).toBe("codestral-embed-2505")
		})
	})
})
