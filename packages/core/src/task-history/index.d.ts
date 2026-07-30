import type { HistoryItem } from "@ali-code/types"
export interface TaskSessionEntry {
	id: string
	task: string
	ts: number
	workspace?: string
	mode?: string
	status?: HistoryItem["status"]
}
export declare function readTaskSessionsFromStoragePath(storageBasePath: string): Promise<TaskSessionEntry[]>
//# sourceMappingURL=index.d.ts.map
