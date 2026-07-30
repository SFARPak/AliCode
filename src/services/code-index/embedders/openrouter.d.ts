import { IEmbedder, EmbeddingResponse, EmbedderInfo } from "../interfaces/embedder"
export declare const OPENROUTER_DEFAULT_PROVIDER_NAME = "[default]"
/**
 * OpenRouter implementation of the embedder interface with batching and rate limiting.
 * OpenRouter provides an OpenAI-compatible API that gives access to hundreds of models
 * through a single endpoint, automatically handling fallbacks and cost optimization.
 */
export declare class OpenRouterEmbedder implements IEmbedder {
	private embeddingsClient
	private readonly defaultModelId
	private readonly apiKey
	private readonly maxItemTokens
	private readonly baseUrl
	private readonly specificProvider?
	private static globalRateLimitState
	/**
	 * Creates a new OpenRouter embedder
	 * @param apiKey The API key for authentication
	 * @param modelId Optional model identifier (defaults to "openai/text-embedding-3-large")
	 * @param maxItemTokens Optional maximum tokens per item (defaults to MAX_ITEM_TOKENS)
	 * @param specificProvider Optional specific provider to route requests to
	 */
	constructor(apiKey: string, modelId?: string, maxItemTokens?: number, specificProvider?: string)
	/**
	 * Creates embeddings for the given texts with batching and rate limiting
	 * @param texts Array of text strings to embed
	 * @param model Optional model identifier
	 * @returns Promise resolving to embedding response
	 */
	createEmbeddings(texts: string[], model?: string): Promise<EmbeddingResponse>
	/**
	 * Helper method to handle batch embedding with retries and exponential backoff
	 * @param batchTexts Array of texts to embed in this batch
	 * @param model Model identifier to use
	 * @returns Promise resolving to embeddings and usage statistics
	 */
	private _embedBatchWithRetries
	/**
	 * Validates the OpenRouter embedder configuration by testing API connectivity
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
	/**
	 * Waits if there's an active global rate limit
	 */
	private waitForGlobalRateLimit
	/**
	 * Updates global rate limit state when a 429 error occurs
	 */
	private updateGlobalRateLimitState
	/**
	 * Gets the current global rate limit delay
	 */
	private getGlobalRateLimitDelay
}
//# sourceMappingURL=openrouter.d.ts.map
