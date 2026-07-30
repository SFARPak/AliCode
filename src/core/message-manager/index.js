"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
exports.MessageManager = void 0
const path = __importStar(require("path"))
const condense_1 = require("../condense")
const OutputInterceptor_1 = require("../../integrations/terminal/OutputInterceptor")
const storage_1 = require("../../utils/storage")
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
class MessageManager {
	task
	constructor(task) {
		this.task = task
	}
	/**
	 * Rewind conversation to a specific timestamp.
	 * This is the SINGLE entry point for all message deletion operations.
	 *
	 * @param ts - The timestamp to rewind to
	 * @param options - Rewind options
	 * @throws Error if timestamp not found in clineMessages
	 */
	async rewindToTimestamp(ts, options = {}) {
		const { includeTargetMessage = false, skipCleanup = false } = options
		// Find the index in clineMessages
		const clineIndex = this.task.clineMessages.findIndex((m) => m.ts === ts)
		if (clineIndex === -1) {
			throw new Error(`Message with timestamp ${ts} not found in clineMessages`)
		}
		// Calculate the actual cutoff index
		const cutoffIndex = includeTargetMessage ? clineIndex + 1 : clineIndex
		await this.performRewind(cutoffIndex, ts, { skipCleanup })
	}
	/**
	 * Rewind conversation to a specific index in clineMessages.
	 * Keeps messages [0, toIndex) and removes [toIndex, end].
	 *
	 * @param toIndex - The index to rewind to (exclusive)
	 * @param options - Rewind options
	 */
	async rewindToIndex(toIndex, options = {}) {
		const cutoffTs = this.task.clineMessages[toIndex]?.ts ?? Date.now()
		await this.performRewind(toIndex, cutoffTs, options)
	}
	/**
	 * Internal method that performs the actual rewind operation.
	 */
	async performRewind(toIndex, cutoffTs, options) {
		const { skipCleanup = false } = options
		// Step 1: Collect context event IDs from messages being removed
		const removedIds = this.collectRemovedContextEventIds(toIndex)
		// Step 2: Truncate clineMessages
		await this.truncateClineMessages(toIndex)
		// Step 3: Truncate and clean API history (combined with cleanup for efficiency)
		await this.truncateApiHistoryWithCleanup(cutoffTs, removedIds, skipCleanup)
	}
	/**
	 * Collect condenseIds and truncationIds from context-management events
	 * that will be removed during the rewind.
	 *
	 * This is critical for maintaining the linkage between:
	 * - condense_context (clineMessage) ↔ Summary (apiMessage)
	 * - sliding_window_truncation (clineMessage) ↔ Truncation marker (apiMessage)
	 */
	collectRemovedContextEventIds(fromIndex) {
		const condenseIds = new Set()
		const truncationIds = new Set()
		for (let i = fromIndex; i < this.task.clineMessages.length; i++) {
			const msg = this.task.clineMessages[i]
			// Collect condenseIds from condense_context events
			if (msg.say === "condense_context" && msg.contextCondense?.condenseId) {
				condenseIds.add(msg.contextCondense.condenseId)
				console.log(`[MessageManager] Found condense_context to remove: ${msg.contextCondense.condenseId}`)
			}
			// Collect truncationIds from sliding_window_truncation events
			if (msg.say === "sliding_window_truncation" && msg.contextTruncation?.truncationId) {
				truncationIds.add(msg.contextTruncation.truncationId)
				console.log(
					`[MessageManager] Found sliding_window_truncation to remove: ${msg.contextTruncation.truncationId}`,
				)
			}
		}
		return { condenseIds, truncationIds }
	}
	/**
	 * Truncate clineMessages to the specified index.
	 */
	async truncateClineMessages(toIndex) {
		await this.task.overwriteClineMessages(this.task.clineMessages.slice(0, toIndex))
	}
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
	async truncateApiHistoryWithCleanup(cutoffTs, removedIds, skipCleanup) {
		const originalHistory = this.task.apiConversationHistory
		let apiHistory = [...originalHistory]
		// Step 1: Determine the actual cutoff timestamp
		// Check if there's an API message with an exact timestamp match
		const hasExactMatch = apiHistory.some((m) => m.ts === cutoffTs)
		// Check if there are any messages before the cutoff that would be preserved
		const hasMessageBeforeCutoff = apiHistory.some((m) => m.ts !== undefined && m.ts < cutoffTs)
		let actualCutoff = cutoffTs
		if (!hasExactMatch && hasMessageBeforeCutoff) {
			// No exact match but there are earlier messages means we might have a race
			// condition where the clineMessage timestamp is earlier than any API message
			// due to async execution. In this case, look for the first API user message
			// at or after the cutoff to use as the actual boundary.
			// This ensures assistant messages that preceded the user's response are preserved.
			const firstUserMsgIndexToRemove = apiHistory.findIndex(
				(m) => m.ts !== undefined && m.ts >= cutoffTs && m.role === "user",
			)
			if (firstUserMsgIndexToRemove !== -1) {
				// Use the user message's timestamp as the actual cutoff
				actualCutoff = apiHistory[firstUserMsgIndexToRemove].ts
			}
			// else: no user message found, use original cutoffTs (fallback)
		}
		// Step 2: Filter by the actual cutoff timestamp
		apiHistory = apiHistory.filter((m) => !m.ts || m.ts < actualCutoff)
		// Step 3: Remove Summaries whose condense_context was removed
		if (removedIds.condenseIds.size > 0) {
			apiHistory = apiHistory.filter((msg) => {
				if (msg.isSummary && msg.condenseId && removedIds.condenseIds.has(msg.condenseId)) {
					console.log(`[MessageManager] Removing orphaned Summary with condenseId: ${msg.condenseId}`)
					return false
				}
				return true
			})
		}
		// Step 4: Remove truncation markers whose sliding_window_truncation was removed
		if (removedIds.truncationIds.size > 0) {
			apiHistory = apiHistory.filter((msg) => {
				if (msg.isTruncationMarker && msg.truncationId && removedIds.truncationIds.has(msg.truncationId)) {
					console.log(
						`[MessageManager] Removing orphaned truncation marker with truncationId: ${msg.truncationId}`,
					)
					return false
				}
				return true
			})
		}
		// Step 5: Cleanup orphaned tags (unless skipped)
		if (!skipCleanup) {
			apiHistory = (0, condense_1.cleanupAfterTruncation)(apiHistory)
		}
		// Step 6: Cleanup orphaned command output artifacts
		// Collect timestamps from remaining messages to identify valid artifact IDs
		// Artifacts whose IDs don't match any remaining message timestamp will be removed
		if (!skipCleanup) {
			const validIds = new Set()
			// Collect timestamps from remaining clineMessages
			for (const msg of this.task.clineMessages) {
				if (msg.ts) {
					validIds.add(String(msg.ts))
				}
			}
			// Collect timestamps from remaining apiHistory
			for (const msg of apiHistory) {
				if (msg.ts) {
					validIds.add(String(msg.ts))
				}
			}
			// Cleanup artifacts asynchronously (fire-and-forget with error handling)
			this.cleanupOrphanedArtifacts(validIds).catch((error) => {
				console.error("[MessageManager] Error cleaning up orphaned command output artifacts:", error)
			})
		}
		// Only write if the history actually changed
		const historyChanged =
			apiHistory.length !== originalHistory.length || apiHistory.some((msg, i) => msg !== originalHistory[i])
		if (historyChanged) {
			await this.task.overwriteApiConversationHistory(apiHistory)
		}
	}
	/**
	 * Cleanup orphaned command output artifacts.
	 * Removes artifact files whose execution IDs don't match any remaining message timestamps.
	 */
	async cleanupOrphanedArtifacts(validIds) {
		try {
			// Access globalStoragePath and taskId through the task reference
			const task = this.task // Access private member
			const globalStoragePath = task.globalStoragePath
			const taskId = task.taskId
			if (!globalStoragePath || !taskId) {
				return
			}
			const taskDir = await (0, storage_1.getTaskDirectoryPath)(globalStoragePath, taskId)
			const outputDir = path.join(taskDir, "command-output")
			await OutputInterceptor_1.OutputInterceptor.cleanupByIds(outputDir, validIds)
		} catch (error) {
			// Silently fail - cleanup is best-effort
			console.debug("[MessageManager] Artifact cleanup skipped:", error)
		}
	}
}
exports.MessageManager = MessageManager
