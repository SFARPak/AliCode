import { VectorStoreSearchResult } from "./interfaces"
import { IEmbedder } from "./interfaces/embedder"
import { IVectorStore } from "./interfaces/vector-store"
import { CodeIndexConfigManager } from "./config-manager"
import { CodeIndexStateManager } from "./state-manager"
/**
 * Service responsible for searching the code index.
 */
export declare class CodeIndexSearchService {
	private readonly configManager
	private readonly stateManager
	private readonly embedder
	private readonly vectorStore
	constructor(
		configManager: CodeIndexConfigManager,
		stateManager: CodeIndexStateManager,
		embedder: IEmbedder,
		vectorStore: IVectorStore,
	)
	/**
	 * Searches the code index for relevant content.
	 * @param query The search query
	 * @param limit Maximum number of results to return
	 * @param directoryPrefix Optional directory path to filter results by
	 * @returns Array of search results
	 * @throws Error if the service is not properly configured or ready
	 */
	searchIndex(query: string, directoryPrefix?: string): Promise<VectorStoreSearchResult[]>
}
//# sourceMappingURL=search-service.d.ts.map
