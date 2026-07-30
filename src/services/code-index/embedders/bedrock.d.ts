import { IEmbedder, EmbeddingResponse, EmbedderInfo } from "../interfaces"
/**
 * Amazon Bedrock implementation of the embedder interface with batching and rate limiting
 */
export declare class BedrockEmbedder implements IEmbedder {
	private readonly region
	private readonly profile?
	private bedrockClient
	private readonly defaultModelId
	/**
	 * Creates a new Amazon Bedrock embedder
	 * @param region AWS region for Bedrock service (required)
	 * @param profile AWS profile name for credentials (optional - uses default credential chain if not provided)
	 * @param modelId Optional model ID override
	 */
	constructor(region: string, profile?: string | undefined, modelId?: string)
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
	 * Invokes the embedding model for a single text
	 * @param text The text to embed
	 * @param model The model identifier to use
	 * @returns Promise resolving to embedding and token count
	 */
	private _invokeEmbeddingModel
	/**
	 * Validates the Bedrock embedder configuration by attempting a minimal embedding request
	 * @returns Promise resolving to validation result with success status and optional error message
	 */
	validateConfiguration(): Promise<{
		valid: boolean
		error?: string
	}>
	get embedderInfo(): EmbedderInfo
}
//# sourceMappingURL=bedrock.d.ts.map
