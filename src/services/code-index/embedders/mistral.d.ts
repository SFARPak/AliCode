import { IEmbedder, EmbeddingResponse, EmbedderInfo } from "../interfaces/embedder"
/**
 * Mistral embedder implementation that wraps the OpenAI Compatible embedder
 * with configuration for Mistral's embedding API.
 *
 * Supported models:
 * - codestral-embed-2505 (dimension: 1536)
 */
export declare class MistralEmbedder implements IEmbedder {
	private readonly openAICompatibleEmbedder
	private static readonly MISTRAL_BASE_URL
	private static readonly DEFAULT_MODEL
	private readonly modelId
	/**
	 * Creates a new Mistral embedder
	 * @param apiKey The Mistral API key for authentication
	 * @param modelId The model ID to use (defaults to codestral-embed-2505)
	 */
	constructor(apiKey: string, modelId?: string)
	/**
	 * Creates embeddings for the given texts using Mistral's embedding API
	 * @param texts Array of text strings to embed
	 * @param model Optional model identifier (uses constructor model if not provided)
	 * @returns Promise resolving to embedding response
	 */
	createEmbeddings(texts: string[], model?: string): Promise<EmbeddingResponse>
	/**
	 * Validates the Mistral embedder configuration by delegating to the underlying OpenAI-compatible embedder
	 * @returns Promise resolving to validation result with success status and optional error message
	 */
	validateConfiguration(): Promise<{
		valid: boolean
		error?: string
	}>
	/**
	 * Returns information about this embedder
	 */
	get embedderInfo(): EmbedderInfo
}
//# sourceMappingURL=mistral.d.ts.map
