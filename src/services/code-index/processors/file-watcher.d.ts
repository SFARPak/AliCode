import * as vscode from "vscode"
import { AliIgnoreController } from "../../../core/ignore/AliIgnoreController"
import { Ignore } from "ignore"
import { IFileWatcher, FileProcessingResult, IEmbedder, IVectorStore, BatchProcessingSummary } from "../interfaces"
import { CacheManager } from "../cache-manager"
/**
 * Implementation of the file watcher interface
 */
export declare class FileWatcher implements IFileWatcher {
	private workspacePath
	private context
	private readonly cacheManager
	private embedder?
	private vectorStore?
	private ignoreInstance?
	private fileWatcher?
	private ignoreController
	private accumulatedEvents
	private batchProcessDebounceTimer?
	private readonly BATCH_DEBOUNCE_DELAY_MS
	private readonly FILE_PROCESSING_CONCURRENCY_LIMIT
	private readonly batchSegmentThreshold
	private readonly _onDidStartBatchProcessing
	private readonly _onBatchProgressUpdate
	private readonly _onDidFinishBatchProcessing
	/**
	 * Event emitted when a batch of files begins processing
	 */
	readonly onDidStartBatchProcessing: vscode.Event<string[]>
	/**
	 * Event emitted to report progress during batch processing
	 */
	readonly onBatchProgressUpdate: vscode.Event<{
		processedInBatch: number
		totalInBatch: number
		currentFile?: string
	}>
	/**
	 * Event emitted when a batch of files has finished processing
	 */
	readonly onDidFinishBatchProcessing: vscode.Event<BatchProcessingSummary>
	/**
	 * Creates a new file watcher
	 * @param workspacePath Path to the workspace
	 * @param context VS Code extension context
	 * @param embedder Optional embedder
	 * @param vectorStore Optional vector store
	 * @param cacheManager Cache manager
	 */
	constructor(
		workspacePath: string,
		context: vscode.ExtensionContext,
		cacheManager: CacheManager,
		embedder?: IEmbedder | undefined,
		vectorStore?: IVectorStore | undefined,
		ignoreInstance?: Ignore,
		ignoreController?: AliIgnoreController,
		batchSegmentThreshold?: number,
	)
	/**
	 * Initializes the file watcher
	 */
	initialize(): Promise<void>
	/**
	 * Disposes the file watcher
	 */
	dispose(): void
	/**
	 * Handles file creation events
	 * @param uri URI of the created file
	 */
	private handleFileCreated
	/**
	 * Handles file change events
	 * @param uri URI of the changed file
	 */
	private handleFileChanged
	/**
	 * Handles file deletion events
	 * @param uri URI of the deleted file
	 */
	private handleFileDeleted
	/**
	 * Schedules batch processing with debounce
	 */
	private scheduleBatchProcessing
	/**
	 * Triggers processing of accumulated events
	 */
	private triggerBatchProcessing
	/**
	 * Processes a batch of accumulated events
	 * @param eventsToProcess Map of events to process
	 */
	private _handleBatchDeletions
	private _processFilesAndPrepareUpserts
	private _executeBatchUpsertOperations
	private processBatch
	/**
	 * Processes a file
	 * @param filePath Path to the file to process
	 * @returns Promise resolving to processing result
	 */
	processFile(filePath: string): Promise<FileProcessingResult>
}
//# sourceMappingURL=file-watcher.d.ts.map
