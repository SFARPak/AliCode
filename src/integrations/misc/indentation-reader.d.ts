/**
 * Indentation-based semantic code block extraction.
 *
 * Inspired by Codex's indentation mode, this module extracts meaningful code blocks
 * based on indentation hierarchy rather than arbitrary line ranges.
 *
 * The algorithm uses bidirectional expansion from an anchor line:
 * 1. Parse the file to determine indentation level of each line
 * 2. Compute effective indents (blank lines inherit previous non-blank line's indent)
 * 3. Expand up and down from anchor simultaneously
 * 4. Apply sibling exclusion counters to limit scope
 * 5. Trim empty lines from edges
 * 6. Apply line limit
 */
export interface LineRecord {
	/** 1-based line number */
	lineNumber: number
	/** Original line content */
	content: string
	/** Computed indentation level (number of leading whitespace units) */
	indentLevel: number
	/** Whether this line is blank (empty or whitespace only) */
	isBlank: boolean
	/** Whether this line starts a new block (has content followed by colon, brace, etc.) */
	isBlockStart: boolean
}
export interface IndentationReadOptions {
	/** 1-based anchor line number */
	anchorLine: number
	/** Maximum indentation levels to include above anchor (0 = unlimited, default: 0) */
	maxLevels?: number
	/** Include sibling blocks at the same indentation level (default: false) */
	includeSiblings?: boolean
	/** Include file header content (imports, comments at top) (default: true) */
	includeHeader?: boolean
	/** Maximum lines to return from bidirectional expansion (default: 2000) */
	limit?: number
	/** Hard cap on lines returned, separate from limit (optional) */
	maxLines?: number
}
export interface IndentationReadResult {
	/** The extracted content with line numbers */
	content: string
	/** Line ranges that were included [start, end] tuples (1-based) */
	includedRanges: Array<[number, number]>
	/** Total lines in the file */
	totalLines: number
	/** Lines actually returned */
	returnedLines: number
	/** Whether output was truncated due to limit */
	wasTruncated: boolean
}
/**
 * Parse a file's lines into LineRecord objects with indentation information.
 */
export declare function parseLines(content: string): LineRecord[]
/**
 * Compute effective indents where blank lines inherit the previous non-blank line's indent.
 * This matches the Codex algorithm behavior.
 */
export declare function computeEffectiveIndents(lines: LineRecord[]): number[]
/**
 * Format lines with line numbers, applying truncation to long lines.
 */
export declare function formatWithLineNumbers(lines: LineRecord[], maxLineLength?: number): string
/**
 * Read a file using indentation-based semantic extraction (Codex algorithm).
 *
 * Uses bidirectional expansion from the anchor line with sibling exclusion counters.
 *
 * @param content - The file content to process
 * @param options - Extraction options
 * @returns The extracted content with metadata
 */
export declare function readWithIndentation(content: string, options: IndentationReadOptions): IndentationReadResult
/**
 * Simple slice mode reading - read lines with offset/limit.
 *
 * @param content - The file content to process
 * @param offset - 0-based line offset to start from (default: 0)
 * @param limit - Maximum lines to return (default: 2000)
 * @returns The extracted content with metadata
 */
export declare function readWithSlice(content: string, offset?: number, limit?: number): IndentationReadResult
//# sourceMappingURL=indentation-reader.d.ts.map
