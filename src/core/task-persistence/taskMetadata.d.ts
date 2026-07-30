import type { ClineMessage } from "@ali-code/types"
export type TaskMetadataOptions = {
	taskId: string
	rootTaskId?: string
	parentTaskId?: string
	taskNumber: number
	messages: ClineMessage[]
	globalStoragePath: string
	workspace: string
	mode?: string
	/** Provider profile name for the task (sticky profile feature) */
	apiConfigName?: string
	/** Initial status for the task (e.g., "active" for child tasks) */
	initialStatus?: "active" | "delegated" | "completed"
}
export declare function taskMetadata({
	taskId: id,
	rootTaskId,
	parentTaskId,
	taskNumber,
	messages,
	globalStoragePath,
	workspace,
	mode,
	apiConfigName,
	initialStatus,
}: TaskMetadataOptions): Promise<{
	historyItem: {
		number: number
		ts: number
		totalCost: number
		id: string
		task: string
		tokensIn: number
		tokensOut: number
		status?: "active" | "completed" | "delegated" | undefined
		rootTaskId?: string | undefined
		parentTaskId?: string | undefined
		cacheWrites?: number | undefined
		cacheReads?: number | undefined
		size?: number | undefined
		workspace?: string | undefined
		mode?: string | undefined
		apiConfigName?: string | undefined
		delegatedToId?: string | undefined
		childIds?: string[] | undefined
		awaitingChildId?: string | undefined
		completedByChildId?: string | undefined
		completionResultSummary?: string | undefined
	}
	tokenUsage: {
		totalTokensIn: number
		totalTokensOut: number
		totalCost: number
		contextTokens: number
		totalCacheWrites?: number | undefined
		totalCacheReads?: number | undefined
	}
}>
//# sourceMappingURL=taskMetadata.d.ts.map
