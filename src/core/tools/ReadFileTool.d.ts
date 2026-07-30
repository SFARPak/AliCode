import type { ReadFileParams, ReadFileToolParams } from "@ali-code/types"
import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
export declare class ReadFileTool extends BaseTool<"read_file"> {
	readonly name: "read_file"
	execute(params: ReadFileToolParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	/**
	 * Execute new single-file format with slice/indentation mode support.
	 */
	private executeNew
	/**
	 * Process a text file according to the requested mode.
	 */
	private processTextFile
	/**
	 * Handle binary file processing (images, PDF, DOCX, etc.).
	 */
	private handleBinaryFile
	/**
	 * Request user approval for file reads.
	 */
	private requestApproval
	/**
	 * Get the starting line number for navigation purposes.
	 */
	private getStartLine
	/**
	 * Generate a human-readable line snippet for approval messages.
	 */
	private getLineSnippet
	/**
	 * Build and push the final result to the tool output.
	 */
	private buildAndPushResult
	getReadFileToolDescription(
		blockName: string,
		blockParams: {
			path?: string
		},
	): string
	getReadFileToolDescription(blockName: string, nativeArgs: ReadFileParams): string
	handlePartial(task: Task, block: ToolUse<"read_file">): Promise<void>
	/**
	 * Execute legacy multi-file format for backward compatibility.
	 * This handles the old format: { files: [{ path: string, lineRanges?: [...] }] }
	 */
	private executeLegacy
}
export declare const readFileTool: ReadFileTool
//# sourceMappingURL=ReadFileTool.d.ts.map
