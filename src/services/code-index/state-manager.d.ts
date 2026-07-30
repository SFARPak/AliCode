import * as vscode from "vscode"
export type IndexingState = "Standby" | "Indexing" | "Indexed" | "Error" | "Stopping"
export declare class CodeIndexStateManager {
	private _systemStatus
	private _statusMessage
	private _processedItems
	private _totalItems
	private _currentItemUnit
	private _progressEmitter
	readonly onProgressUpdate: vscode.Event<{
		systemStatus: IndexingState
		message: string
		processedItems: number
		totalItems: number
		currentItemUnit: string
	}>
	get state(): IndexingState
	getCurrentStatus(): {
		systemStatus: IndexingState
		message: string
		processedItems: number
		totalItems: number
		currentItemUnit: string
	}
	setSystemState(newState: IndexingState, message?: string): void
	reportBlockIndexingProgress(processedItems: number, totalItems: number): void
	reportFileQueueProgress(processedFiles: number, totalFiles: number, currentFileBasename?: string): void
	dispose(): void
}
//# sourceMappingURL=state-manager.d.ts.map
