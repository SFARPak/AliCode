import { ApiHandlerOptions } from "../../../shared/api"
import { EmbedderInfo, EmbeddingResponse, IEmbedder } from "../interfaces"
/**
 * Implements the IEmbedder interface using a local Ollama instance.
 */
export declare class CodeIndexOllamaEmbedder implements IEmbedder {
	private readonly baseUrl
	private readonly defaultModelId
	constructor(options: ApiHandlerOptions)
	/**
	 * Creates embeddings for the given texts using the specified Ollama model.
	 * @param texts - An array of strings to embed.
	 * @param model - Optional model ID to override the default.
	 * @returns A promise that resolves to an EmbeddingResponse containing the embeddings and usage data.
	 */
	createEmbeddings(texts: string[], model?: string): Promise<EmbeddingResponse>
	/**
	 * Validates the Ollama embedder configuration by checking service availability and model existence
	 * @returns Promise resolving to validation result with success status and optional error message
	 */
	validateConfiguration(): Promise<{
		valid: boolean
		error?: string
	}>
	get embedderInfo(): EmbedderInfo
}
//# sourceMappingURL=ollama.d.ts.map
