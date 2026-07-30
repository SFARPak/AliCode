import { CodeIndexConfigManager } from "./config-manager"
import { CodeIndexStateManager, IndexingState } from "./state-manager"
import { IFileWatcher, IVectorStore } from "./interfaces"
import { DirectoryScanner } from "./processors"
import { CacheManager } from "./cache-manager"
/**
 * Manages the code indexing workflow, coordinating between different services and managers.
 */
export declare class CodeIndexOrchestrator {
	private readonly configManager
	private readonly stateManager
	private readonly workspacePath
	private readonly cacheManager
	private readonly vectorStore
	private readonly scanner
	private readonly fileWatcher
	private _fileWatcherSubscriptions
	private _isProcessing
	private _abortController
	constructor(
		configManager: CodeIndexConfigManager,
		stateManager: CodeIndexStateManager,
		workspacePath: string,
		cacheManager: CacheManager,
		vectorStore: IVectorStore,
		scanner: DirectoryScanner,
		fileWatcher: IFileWatcher,
	)
	/**
	 * Starts the file watcher if not already running.
	 */
	private _startWatcher
	/**
	 * Updates the status of a file in the state manager.
	 */
	/**
	 * Initiates the indexing process (initial scan and starts watcher).
	 */
	startIndexing(): Promise<void>
	/**
	 * Stops any in-progress indexing by aborting the scan and stopping the file watcher.
	 */
	stopIndexing(): void
	/**
	 * Stops the file watcher and cleans up resources.
	 */
	stopWatcher(): void
	/**
	 * Clears all index data by stopping the watcher, clearing the vector store,
	 * and resetting the cache file.
	 */
	clearIndexData(): Promise<void>
	/**
	 * Gets the current state of the indexing system.
	 */
	get state(): IndexingState
}
//# sourceMappingURL=orchestrator.d.ts.map
