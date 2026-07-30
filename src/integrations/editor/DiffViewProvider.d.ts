import { Task } from "../../core/task/Task"
export declare const DIFF_VIEW_URI_SCHEME = "cline-diff"
export declare const DIFF_VIEW_LABEL_CHANGES = "Original \u2194 Ali's Changes"
export declare class DiffViewProvider {
	private cwd
	newProblemsMessage?: string
	userEdits?: string
	editType?: "create" | "modify"
	isEditing: boolean
	originalContent: string | undefined
	private createdDirs
	private documentWasOpen
	private relPath?
	private newContent?
	private activeDiffEditor?
	private fadedOverlayController?
	private activeLineController?
	private streamedLines
	private preDiagnostics
	private taskRef
	constructor(cwd: string, task: Task)
	open(relPath: string): Promise<void>
	update(accumulatedContent: string, isFinal: boolean): Promise<void>
	saveChanges(
		diagnosticsEnabled?: boolean,
		writeDelayMs?: number,
	): Promise<{
		newProblemsMessage: string | undefined
		userEdits: string | undefined
		finalContent: string | undefined
	}>
	/**
	 * Formats a standardized response for file write operations
	 *
	 * @param task Task instance to get protocol info
	 * @param cwd Current working directory for path resolution
	 * @param isNewFile Whether this is a new file or an existing file being modified
	 * @returns Formatted message (JSON)
	 */
	pushToolWriteResult(task: Task, cwd: string, isNewFile: boolean): Promise<string>
	revertChanges(): Promise<void>
	private closeAllDiffViews
	private openDiffEditor
	private scrollEditorToLine
	scrollToFirstDiff(): void
	private stripAllBOMs
	reset(): Promise<void>
	/**
	 * Directly save content to a file without showing diff view
	 * Used when preventFocusDisruption experiment is enabled
	 *
	 * @param relPath - Relative path to the file
	 * @param content - Content to write to the file
	 * @param openFile - Whether to show the file in editor (false = open in memory only for diagnostics)
	 * @returns Result of the save operation including any new problems detected
	 */
	saveDirectly(
		relPath: string,
		content: string,
		openFile?: boolean,
		diagnosticsEnabled?: boolean,
		writeDelayMs?: number,
	): Promise<{
		newProblemsMessage: string | undefined
		userEdits: string | undefined
		finalContent: string | undefined
	}>
}
//# sourceMappingURL=DiffViewProvider.d.ts.map
