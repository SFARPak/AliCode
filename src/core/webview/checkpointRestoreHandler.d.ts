import { Task } from "../task/Task"
import { ClineProvider } from "./ClineProvider"
export interface CheckpointRestoreConfig {
	provider: ClineProvider
	currentCline: Task
	messageTs: number
	messageIndex: number
	checkpoint: {
		hash: string
	}
	operation: "delete" | "edit"
	editData?: {
		editedContent: string
		images?: string[]
		apiConversationHistoryIndex: number
	}
}
/**
 * Handles checkpoint restoration for both delete and edit operations.
 * This consolidates the common logic while handling operation-specific behavior.
 */
export declare function handleCheckpointRestoreOperation(config: CheckpointRestoreConfig): Promise<void>
/**
 * Common checkpoint restore validation and initialization utility.
 * This can be used by any checkpoint restore flow that needs to wait for initialization.
 */
export declare function waitForClineInitialization(provider: ClineProvider, timeoutMs?: number): Promise<boolean>
//# sourceMappingURL=checkpointRestoreHandler.d.ts.map
