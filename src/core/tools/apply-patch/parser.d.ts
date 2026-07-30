/**
 * Parser for the apply_patch tool format.
 * Converts patch text into structured hunks following the Codex apply_patch specification.
 *
 * Grammar:
 * Patch := Begin { FileOp } End
 * Begin := "*** Begin Patch" NEWLINE
 * End := "*** End Patch" NEWLINE
 * FileOp := AddFile | DeleteFile | UpdateFile
 * AddFile := "*** Add File: " path NEWLINE { "+" line NEWLINE }
 * DeleteFile := "*** Delete File: " path NEWLINE
 * UpdateFile := "*** Update File: " path NEWLINE [ MoveTo ] { Hunk }
 * MoveTo := "*** Move to: " newPath NEWLINE
 * Hunk := "@@" [ header ] NEWLINE { HunkLine } [ "*** End of File" NEWLINE ]
 * HunkLine := (" " | "-" | "+") text NEWLINE
 */
/**
 * Represents an error during patch parsing.
 */
export declare class ParseError extends Error {
	lineNumber?: number | undefined
	constructor(message: string, lineNumber?: number | undefined)
}
/**
 * A chunk within an UpdateFile hunk.
 */
export interface UpdateFileChunk {
	/** Optional context line (e.g., class or function name) to narrow search */
	changeContext: string | null
	/** Lines to find and replace (context + removed lines) */
	oldLines: string[]
	/** Lines to replace with (context + added lines) */
	newLines: string[]
	/** If true, old_lines must match at end of file */
	isEndOfFile: boolean
}
/**
 * Represents a file operation in a patch.
 */
export type Hunk =
	| {
			type: "AddFile"
			path: string
			contents: string
	  }
	| {
			type: "DeleteFile"
			path: string
	  }
	| {
			type: "UpdateFile"
			path: string
			movePath: string | null
			chunks: UpdateFileChunk[]
	  }
/**
 * Result of parsing a patch.
 */
export interface ApplyPatchArgs {
	hunks: Hunk[]
	patch: string
}
/**
 * Parse a patch string into structured hunks.
 *
 * @param patch - The patch text to parse
 * @returns Parsed patch with hunks
 * @throws ParseError if the patch is invalid
 */
export declare function parsePatch(patch: string): ApplyPatchArgs
//# sourceMappingURL=parser.d.ts.map
