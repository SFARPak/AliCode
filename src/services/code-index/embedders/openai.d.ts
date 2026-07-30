import { OpenAiNativeHandler } from "../../../api/providers/openai-native"
import { ApiHandlerOptions } from "../../../shared/api"
import { IEmbedder, EmbeddingResponse, EmbedderInfo } from "../interfaces"
/**
 * OpenAI implementation of the embedder interface with batching and rate limiting
 */
export declare class OpenAiEmbedder extends OpenAiNativeHandler implements IEmbedder {
	private embeddingsClient
	private readonly defaultModelId
	/**
	 * Creates a new OpenAI embedder
	 * @param options API handler options
	 */
	constructor(
		options: ApiHandlerOptions & {
			openAiEmbeddingModelId?: string
		},
	)
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
	 * Validates the OpenAI embedder configuration by attempting a minimal embedding request
	 * @returns Promise resolving to validation result with success status and optional error message
	 */
	validateConfiguration(): Promise<{
		valid: boolean
		error?: string
	}>
	get embedderInfo(): EmbedderInfo
}
//# sourceMappingURL=openai.d.ts.map
