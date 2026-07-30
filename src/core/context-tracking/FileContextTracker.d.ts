import { ContextProxy } from "../config/ContextProxy"
import type { RecordSource, TaskMetadata } from "./FileContextTrackerTypes"
import { ClineProvider } from "../webview/ClineProvider"
export declare class FileContextTracker {
	readonly taskId: string
	private providerRef
	private fileWatchers
	private recentlyModifiedFiles
	private recentlyEditedByAli
	private checkpointPossibleFiles
	constructor(provider: ClineProvider, taskId: string)
	private getCwd
	setupFileWatcher(filePath: string): Promise<void>
	trackFileContext(filePath: string, operation: RecordSource): Promise<void>
	getContextProxy(): ContextProxy | undefined
	getTaskMetadata(taskId: string): Promise<TaskMetadata>
	saveTaskMetadata(taskId: string, metadata: TaskMetadata): Promise<void>
	addFileToFileContextTracker(taskId: string, filePath: string, source: RecordSource): Promise<void>
	getAndClearRecentlyModifiedFiles(): string[]
	/**
	 * Gets a list of unique file paths that Ali has read during this task.
	 * Files are sorted by most recently read first, so if there's a character
	 * budget during folded context generation, the most relevant (recent) files
	 * are prioritized.
	 *
	 * @param sinceTimestamp - Optional timestamp to filter files read after this time
	 * @returns Array of unique file paths that have been read, most recent first
	 */
	getFilesReadByAli(sinceTimestamp?: number): Promise<string[]>
	getAndClearCheckpointPossibleFile(): string[]
	markFileAsEditedByAli(filePath: string): void
	dispose(): void
}
//# sourceMappingURL=FileContextTracker.d.ts.map
