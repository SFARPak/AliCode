/**
 * Core patch application logic for the apply_patch tool.
 * Transforms file contents using parsed hunks.
 */
import type { Hunk, UpdateFileChunk } from "./parser"
/**
 * Error during patch application.
 */
export declare class ApplyPatchError extends Error {
	constructor(message: string)
}
/**
 * Result of applying a patch to a file.
 */
export interface ApplyPatchFileChange {
	type: "add" | "delete" | "update"
	/** Original path of the file */
	path: string
	/** New path if the file was moved/renamed */
	movePath?: string
	/** Original content (for delete/update) */
	originalContent?: string
	/** New content (for add/update) */
	newContent?: string
}
/**
 * Apply chunks to file content, returning the new content.
 *
 * @param originalContent - The original file content
 * @param filePath - The file path (for error messages)
 * @param chunks - The update chunks to apply
 * @returns The new file content
 */
export declare function applyChunksToContent(
	originalContent: string,
	filePath: string,
	chunks: UpdateFileChunk[],
): string
/**
 * Process a single hunk and return the file change.
 *
 * @param hunk - The hunk to process
 * @param readFile - Function to read file contents
 * @returns The file change result
 */
export declare function processHunk(
	hunk: Hunk,
	readFile: (path: string) => Promise<string>,
): Promise<ApplyPatchFileChange>
/**
 * Process all hunks in a patch.
 *
 * @param hunks - The hunks to process
 * @param readFile - Function to read file contents
 * @returns Array of file changes
 */
export declare function processAllHunks(
	hunks: Hunk[],
	readFile: (path: string) => Promise<string>,
): Promise<ApplyPatchFileChange[]>
//# sourceMappingURL=apply.d.ts.map
