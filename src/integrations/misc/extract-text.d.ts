/**
 * Returns the list of supported binary file formats that can be processed by extractTextFromFile
 */
export declare function getSupportedBinaryFormats(): string[]
/**
 * Result of extracting text with metadata about truncation
 */
export interface ExtractTextResult {
	/** The extracted content with line numbers */
	content: string
	/** Total lines in the file */
	totalLines: number
	/** Lines actually returned */
	returnedLines: number
	/** Whether output was truncated */
	wasTruncated: boolean
	/** Line range shown [start, end] (1-based) */
	linesShown?: [number, number]
}
/**
 * Extracts text content from a file with truncation support.
 * Returns structured result with metadata about truncation.
 *
 * @param filePath - Path to the file to extract text from
 * @param limit - Maximum lines to return (default: 2000)
 * @returns Promise resolving to extracted text with metadata
 * @throws {Error} If file not found or unsupported binary format
 */
export declare function extractTextFromFileWithMetadata(filePath: string, limit?: number): Promise<ExtractTextResult>
/**
 * Extracts text content from a file, with support for various formats including PDF, DOCX, XLSX, and plain text.
 * Now uses truncation to limit large files to DEFAULT_LINE_LIMIT lines.
 *
 * @param filePath - Path to the file to extract text from
 * @returns Promise resolving to the extracted text content with line numbers
 * @throws {Error} If file not found or unsupported binary format
 */
export declare function extractTextFromFile(filePath: string): Promise<string>
export declare function addLineNumbers(content: string, startLine?: number): string
export declare function everyLineHasLineNumbers(content: string): boolean
/**
 * Strips line numbers from content while preserving the actual content.
 *
 * @param content The content to process
 * @param aggressive When false (default): Only strips lines with clear number patterns like "123 | content"
 *                   When true: Uses a more lenient pattern that also matches lines with just a pipe character,
 *                   which can be useful when LLMs don't perfectly format the line numbers in diffs
 * @returns The content with line numbers removed
 */
export declare function stripLineNumbers(content: string, aggressive?: boolean): string
/**
 * Truncates multi-line output while preserving context from both the beginning and end.
 * When truncation is needed, it keeps 20% of the lines from the start and 80% from the end,
 * with a clear indicator of how many lines were omitted in between.
 *
 * IMPORTANT: Character limit takes precedence over line limit. This is because:
 * 1. Character limit provides a hard cap on memory usage and context window consumption
 * 2. A single line with millions of characters could bypass line limits and cause issues
 * 3. Character limit ensures consistent behavior regardless of line structure
 *
 * When both limits are specified:
 * - If content exceeds character limit, character-based truncation is applied (regardless of line count)
 * - If content is within character limit but exceeds line limit, line-based truncation is applied
 * - This prevents edge cases where extremely long lines could consume excessive resources
 *
 * @param content The multi-line string to truncate
 * @param lineLimit Optional maximum number of lines to keep. If not provided or 0, no line limit is applied
 * @param characterLimit Optional maximum number of characters to keep. If not provided or 0, no character limit is applied
 * @returns The truncated string with an indicator of omitted content, or the original content if no truncation needed
 *
 * @example
 * // With 10 line limit on 25 lines of content:
 * // - Keeps first 2 lines (20% of 10)
 * // - Keeps last 8 lines (80% of 10)
 * // - Adds "[...15 lines omitted...]" in between
 *
 * @example
 * // With character limit on long single line:
 * // - Keeps first 20% of characters
 * // - Keeps last 80% of characters
 * // - Adds "[...X characters omitted...]" in between
 *
 * @example
 * // Character limit takes precedence:
 * // content = "A".repeat(50000) + "\n" + "B".repeat(50000) // 2 lines, 100,002 chars
 * // truncateOutput(content, 10, 40000) // Uses character limit, not line limit
 * // Result: First ~8000 chars + "[...60002 characters omitted...]" + Last ~32000 chars
 */
export declare function truncateOutput(content: string, lineLimit?: number, characterLimit?: number): string
/**
 * Applies run-length encoding to compress repeated lines in text.
 * Only compresses when the compression description is shorter than the repeated content.
 *
 * @param content The text content to compress
 * @returns The compressed text with run-length encoding applied
 */
export declare function applyRunLengthEncoding(content: string): string
/**
 * Processes carriage returns (\r) in terminal output to simulate how a real terminal would display content.
 * This function is optimized for performance by using in-place string operations and avoiding memory-intensive
 * operations like split/join.
 *
 * Key features:
 * 1. Processes output line-by-line to maximize chunk processing
 * 2. Uses string indexes and substring operations instead of arrays
 * 3. Single-pass traversal of the entire input
 * 4. Special handling for multi-byte characters (like emoji) to prevent corruption
 * 5. Replacement of partially overwritten multi-byte characters with spaces
 *
 * @param input The terminal output to process
 * @returns The processed terminal output with carriage returns (\r) handled
 */
export declare function processCarriageReturns(input: string): string
/**
 * Processes backspace characters (\b) in terminal output using index operations.
 * Uses indexOf to efficiently locate and handle backspaces.
 *
 * Technically terminal only moves the cursor and overwrites in-place,
 * but we assume \b is destructive as an optimization which is acceptable
 * for all progress spinner cases and most terminal output cases.
 *
 * @param input The terminal output to process
 * @returns The processed output with backspaces handled
 */
export declare function processBackspaces(input: string): string
//# sourceMappingURL=extract-text.d.ts.map
