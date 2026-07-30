"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.GeminiEmbedder = void 0
const openai_compatible_1 = require("./openai-compatible")
const constants_1 = require("../constants")
const i18n_1 = require("../../../i18n")
/**
 * Gemini embedder implementation that wraps the OpenAI Compatible embedder
 * with configuration for Google's Gemini embedding API.
 *
 * Supported models:
 * - gemini-embedding-001 (dimension: 3072)
 *
 * Note: text-embedding-004 has been deprecated and is automatically
 * migrated to gemini-embedding-001 for backward compatibility.
 */
class GeminiEmbedder {
	openAICompatibleEmbedder
	static GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
	static DEFAULT_MODEL = "gemini-embedding-001"
	/**
	 * Deprecated models that are automatically migrated to their replacements.
	 * Users with these models configured will be silently migrated without interruption.
	 */
	static DEPRECATED_MODEL_MIGRATIONS = {
		"text-embedding-004": "gemini-embedding-001",
	}
	modelId
	/**
	 * Migrates deprecated model IDs to their replacements.
	 * @param modelId The model ID to potentially migrate
	 * @returns The migrated model ID, or the original if no migration is needed
	 */
	static migrateModelId(modelId) {
		return GeminiEmbedder.DEPRECATED_MODEL_MIGRATIONS[modelId] ?? modelId
	}
	/**
	 * Creates a new Gemini embedder
	 * @param apiKey The Gemini API key for authentication
	 * @param modelId The model ID to use (defaults to gemini-embedding-001)
	 */
	constructor(apiKey, modelId) {
		if (!apiKey) {
			throw new Error((0, i18n_1.t)("embeddings:validation.apiKeyRequired"))
		}
		// Migrate deprecated models to their replacements silently
		const migratedModelId = modelId ? GeminiEmbedder.migrateModelId(modelId) : undefined
		// Use provided model (after migration) or default
		this.modelId = migratedModelId || GeminiEmbedder.DEFAULT_MODEL
		// Create an OpenAI Compatible embedder with Gemini's configuration
		this.openAICompatibleEmbedder = new openai_compatible_1.OpenAICompatibleEmbedder(
			GeminiEmbedder.GEMINI_BASE_URL,
			apiKey,
			this.modelId,
			constants_1.GEMINI_MAX_ITEM_TOKENS,
		)
	}
	/**
	 * Creates embeddings for the given texts using Gemini's embedding API
	 * @param texts Array of text strings to embed
	 * @param model Optional model identifier (uses constructor model if not provided)
	 * @returns Promise resolving to embedding response
	 */
	async createEmbeddings(texts, model) {
		// Use the provided model or fall back to the instance's model
		const modelToUse = model || this.modelId
		return this.openAICompatibleEmbedder.createEmbeddings(texts, modelToUse)
	}
	/**
	 * Validates the Gemini embedder configuration by delegating to the underlying OpenAI-compatible embedder
	 * @returns Promise resolving to validation result with success status and optional error message
	 */
	async validateConfiguration() {
		// Delegate validation to the OpenAI-compatible embedder
		// The error messages will be specific to Gemini since we're using Gemini's base URL
		return this.openAICompatibleEmbedder.validateConfiguration()
	}
	/**
	 * Returns information about this embedder
	 */
	get embedderInfo() {
		return {
			name: "gemini",
		}
	}
}
exports.GeminiEmbedder = GeminiEmbedder
