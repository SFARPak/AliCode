import { IEmbedder, EmbeddingResponse, EmbedderInfo } from "../interfaces/embedder"
/**
 * Vercel AI Gateway embedder implementation that wraps the OpenAI Compatible embedder
 * with configuration for Vercel AI Gateway's embedding API.
 *
 * Supported models:
 * - openai/text-embedding-3-small (dimension: 1536)
 * - openai/text-embedding-3-large (dimension: 3072)
 * - openai/text-embedding-ada-002 (dimension: 1536)
 * - cohere/embed-v4.0 (dimension: 1024)
 * - google/gemini-embedding-001 (dimension: 768)
 * - google/text-embedding-005 (dimension: 768)
 * - google/text-multilingual-embedding-002 (dimension: 768)
 * - amazon/titan-embed-text-v2 (dimension: 1024)
 * - mistral/codestral-embed (dimension: 1536)
 * - mistral/mistral-embed (dimension: 1024)
 */
export declare class VercelAiGatewayEmbedder implements IEmbedder {
	private readonly openAICompatibleEmbedder
	private static readonly VERCEL_AI_GATEWAY_BASE_URL
	private static readonly DEFAULT_MODEL
	private readonly modelId
	/**
	 * Creates a new Vercel AI Gateway embedder
	 * @param apiKey The Vercel AI Gateway API key for authentication
	 * @param modelId The model ID to use (defaults to mistral/codestral-embed)
	 */
	constructor(apiKey: string, modelId?: string)
	/**
	 * Creates embeddings for the given texts using Vercel AI Gateway's embedding API
	 * @param texts Array of text strings to embed
	 * @param model Optional model identifier (uses constructor model if not provided)
	 * @returns Promise resolving to embedding response
	 */
	createEmbeddings(texts: string[], model?: string): Promise<EmbeddingResponse>
	/**
	 * Validates the Vercel AI Gateway embedder configuration by delegating to the underlying OpenAI-compatible embedder
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
//# sourceMappingURL=vercel-ai-gateway.d.ts.map
