import { Task } from "../task/Task"
export interface RewindOptions {
	/** Whether to include the target message in deletion (edit=true, delete=false) */
	includeTargetMessage?: boolean
	/** Skip cleanup for special cases (default: false) */
	skipCleanup?: boolean
}
/**
 * MessageManager provides centralized handling for all conversation rewind operations.
 *
 * This ensures that whenever UI chat history is rewound (delete, edit, checkpoint restore, etc.),
 * the API conversation history is properly maintained, including:
 * - Removing orphaned Summary messages when their condense_context is removed
 * - Removing orphaned truncation markers when their sliding_window_truncation is removed
 * - Cleaning up orphaned condenseParent/truncationParent tags
 *
 * Usage (always access via Task.messageManager getter):
 * ```typescript
 * await task.messageManager.rewindToTimestamp(messageTs, { includeTargetMessage: false })
 * ```
 *
 * @see Task.messageManager - The getter that provides lazy-initialized access to this manager
 */
export declare class MessageManager {
	private task
	constructor(task: Task)
	/**
	 * Rewind conversation to a specific timestamp.
	 * This is the SINGLE entry point for all message deletion operations.
	 *
	 * @param ts - The timestamp to rewind to
	 * @param options - Rewind options
	 * @throws Error if timestamp not found in clineMessages
	 */
	rewindToTimestamp(ts: number, options?: RewindOptions): Promise<void>
	/**
	 * Rewind conversation to a specific index in clineMessages.
	 * Keeps messages [0, toIndex) and removes [toIndex, end].
	 *
	 * @param toIndex - The index to rewind to (exclusive)
	 * @param options - Rewind options
	 */
	rewindToIndex(toIndex: number, options?: RewindOptions): Promise<void>
	/**
	 * Internal method that performs the actual rewind operation.
	 */
	private performRewind
	/**
	 * Collect condenseIds and truncationIds from context-management events
	 * that will be removed during the rewind.
	 *
	 * This is critical for maintaining the linkage between:
	 * - condense_context (clineMessage) ↔ Summary (apiMessage)
	 * - sliding_window_truncation (clineMessage) ↔ Truncation marker (apiMessage)
	 */
	private collectRemovedContextEventIds
	/**
	 * Truncate clineMessages to the specified index.
	 */
	private truncateClineMessages
	/**
	 * Truncate API history by timestamp, remove orphaned summaries/markers,
	 * and clean up orphaned tags - all in a single write operation.
	 *
	 * This combined approach:
	 * 1. Avoids multiple writes to API history
	 * 2. Only writes if the history actually changed
	 * 3. Handles both truncation and cleanup atomically
	 *
	 * Note on timestamp handling:
	 * Due to async execution during streaming, clineMessage timestamps may not
	 * perfectly align with API message timestamps. Specifically, a "user_feedback"
	 * clineMessage can have a timestamp BEFORE the assistant API message that
	 * triggered it (because tool execution happens concurrently with stream
	 * completion). To handle this race condition, we find the first API user
	 * message at or after the cutoff and use its timestamp as the actual boundary.
	 */
	private truncateApiHistoryWithCleanup
	/**
	 * Cleanup orphaned command output artifacts.
	 * Removes artifact files whose execution IDs don't match any remaining message timestamps.
	 */
	private cleanupOrphanedArtifacts
}
//# sourceMappingURL=index.d.ts.map
