import { IEmbedder, EmbeddingResponse, EmbedderInfo } from "../interfaces/embedder"
/**
 * OpenAI Compatible implementation of the embedder interface with batching and rate limiting.
 * This embedder allows using any OpenAI-compatible API endpoint by specifying a custom baseURL.
 */
export declare class OpenAICompatibleEmbedder implements IEmbedder {
	private embeddingsClient
	private readonly defaultModelId
	private readonly baseUrl
	private readonly apiKey
	private readonly isFullUrl
	private readonly maxItemTokens
	private static globalRateLimitState
	/**
	 * Creates a new OpenAI Compatible embedder
	 * @param baseUrl The base URL for the OpenAI-compatible API endpoint
	 * @param apiKey The API key for authentication
	 * @param modelId Optional model identifier (defaults to "text-embedding-3-small")
	 * @param maxItemTokens Optional maximum tokens per item (defaults to MAX_ITEM_TOKENS)
	 */
	constructor(baseUrl: string, apiKey: string, modelId?: string, maxItemTokens?: number)
	/**
	 * Creates embeddings for the given texts with batching and rate limiting
	 * @param texts Array of text strings to embed
	 * @param model Optional model identifier
	 * @returns Promise resolving to embedding response
	 */
	createEmbeddings(texts: string[], model?: string): Promise<EmbeddingResponse>
	/**
	 * Determines if the provided URL is a full endpoint URL or a base URL that needs the endpoint appended by the SDK.
	 * Uses smart pattern matching for known providers while accepting we can't cover all possible patterns.
	 * @param url The URL to check
	 * @returns true if it's a full endpoint URL, false if it's a base URL
	 */
	private isFullEndpointUrl
	/**
	 * Makes a direct HTTP request to the embeddings endpoint
	 * Used when the user provides a full endpoint URL (e.g., Azure OpenAI with query parameters)
	 * @param url The full endpoint URL
	 * @param batchTexts Array of texts to embed
	 * @param model Model identifier to use
	 * @returns Promise resolving to OpenAI-compatible response
	 */
	private makeDirectEmbeddingRequest
	/**
	 * Helper method to handle batch embedding with retries and exponential backoff
	 * @param batchTexts Array of texts to embed in this batch
	 * @param model Model identifier to use
	 * @returns Promise resolving to embeddings and usage statistics
	 */
	private _embedBatchWithRetries
	/**
	 * Validates the OpenAI-compatible embedder configuration by testing endpoint connectivity and API key
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
//# sourceMappingURL=openai-compatible.d.ts.map
