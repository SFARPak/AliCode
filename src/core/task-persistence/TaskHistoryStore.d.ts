import type { HistoryItem } from "@ali-code/types"
/**
 * TaskHistoryStore encapsulates all task history persistence logic.
 *
 * Each task's HistoryItem is stored as an individual JSON file in its
 * existing task directory (`globalStorage/tasks/<taskId>/history_item.json`).
 * A single index file (`globalStorage/tasks/_index.json`) is maintained
 * as a cache for fast list reads at startup.
 *
 * Cross-process safety comes from `safeWriteJson`'s `proper-lockfile`
 * on per-task file writes. Within a single extension host process,
 * an in-process write lock serializes mutations.
 */
/**
 * Options for TaskHistoryStore constructor.
 */
export interface TaskHistoryStoreOptions {
	/**
	 * Optional callback invoked inside the write lock after each mutation
	 * (upsert, delete, deleteMany). Used for serialized write-through to
	 * globalState during the transition period.
	 */
	onWrite?: (items: HistoryItem[]) => Promise<void>
}
export declare class TaskHistoryStore {
	private readonly globalStoragePath
	private readonly onWrite?
	private cache
	private writeLock
	private indexWriteTimer
	private fsWatcher
	private reconcileTimer
	private disposed
	/**
	 * Promise that resolves when initialization is complete.
	 * Callers can await this to ensure the store is ready before reading.
	 */
	readonly initialized: Promise<void>
	private resolveInitialized
	/** Debounce window for index writes in milliseconds. */
	private static readonly INDEX_WRITE_DEBOUNCE_MS
	/** Periodic reconciliation interval in milliseconds. */
	private static readonly RECONCILE_INTERVAL_MS
	constructor(globalStoragePath: string, options?: TaskHistoryStoreOptions)
	/**
	 * Load index, reconcile if needed, start watchers.
	 */
	initialize(): Promise<void>
	/**
	 * Flush pending writes, clear watchers, release resources.
	 */
	dispose(): void
	/**
	 * Get a single history item by task ID.
	 */
	get(taskId: string): HistoryItem | undefined
	/**
	 * Get all history items, sorted by timestamp descending (newest first).
	 */
	getAll(): HistoryItem[]
	/**
	 * Get history items filtered by workspace path.
	 */
	getByWorkspace(workspace: string): HistoryItem[]
	/**
	 * Insert or update a history item.
	 *
	 * Writes the per-task file immediately (source of truth),
	 * updates the in-memory Map, and schedules a debounced index write.
	 */
	upsert(item: HistoryItem): Promise<HistoryItem[]>
	/**
	 * Delete a single task's history item.
	 */
	delete(taskId: string): Promise<void>
	/**
	 * Delete multiple tasks' history items in a batch.
	 */
	deleteMany(taskIds: string[]): Promise<void>
	/**
	 * Scan task directories vs index and fix any drift.
	 *
	 * - Tasks on disk but missing from cache: read and add
	 * - Tasks in cache but missing from disk: remove
	 */
	reconcile(): Promise<void>
	/**
	 * Invalidate a single task's cache entry (re-read from disk on next access).
	 */
	invalidate(taskId: string): Promise<void>
	/**
	 * Clear all in-memory cache and reload from index.
	 */
	invalidateAll(): void
	/**
	 * Migrate from globalState taskHistory array to per-task files.
	 *
	 * For each entry in the globalState array, writes a `history_item.json`
	 * file if one doesn't already exist. This is idempotent and safe to re-run.
	 */
	migrateFromGlobalState(taskHistoryEntries: HistoryItem[]): Promise<void>
	/**
	 * Load the `_index.json` file into the in-memory cache.
	 */
	private loadIndex
	/**
	 * Write the full index to disk.
	 */
	private writeIndex
	/**
	 * Schedule a debounced index write.
	 */
	private scheduleIndexWrite
	/**
	 * Force an immediate index write (called on dispose/shutdown).
	 */
	flushIndex(): Promise<void>
	/**
	 * Write a HistoryItem to its per-task `history_item.json` file.
	 */
	private writeTaskFile
	/**
	 * Read a HistoryItem from its per-task `history_item.json` file.
	 */
	private readTaskFile
	/**
	 * Watch the tasks directory for changes from other instances.
	 */
	private startWatcher
	/**
	 * Start periodic reconciliation as a defensive fallback for platforms
	 * where fs.watch is unreliable.
	 */
	private startPeriodicReconciliation
	/**
	 * Serializes all read-modify-write operations within a single extension
	 * host process to prevent concurrent interleaving.
	 */
	private withLock
	/**
	 * Get the tasks base directory path, resolving custom storage paths.
	 */
	private getTasksDir
	/**
	 * Get the path to a task's `history_item.json` file.
	 */
	private getTaskFilePath
	/**
	 * Get the path to the `_index.json` file.
	 */
	private getIndexPath
}
//# sourceMappingURL=TaskHistoryStore.d.ts.map
