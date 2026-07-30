/**
 * Efficiently counts lines in a file using streams without loading the entire file into memory
 *
 * @param filePath - Path to the file to count lines in
 * @returns A promise that resolves to the number of lines in the file
 */
export declare function countFileLines(filePath: string): Promise<number>
export interface LineAndTokenCountResult {
	/** Total number of lines counted */
	lineCount: number
	/** Estimated token count */
	tokenEstimate: number
	/** Whether the full file was scanned (false if early exit occurred) */
	complete: boolean
}
export interface LineAndTokenCountOptions {
	/** Maximum tokens allowed before early exit. If undefined, scans entire file */
	budgetTokens?: number
	/** Number of lines to buffer before running token estimation (default: 256) */
	chunkLines?: number
}
/**
 * Efficiently counts lines and estimates tokens in a file using streams with incremental token estimation.
 * Processes file in chunks to avoid memory issues and can early-exit when budget is exceeded.
 *
 * @param filePath - Path to the file to analyze
 * @param options - Configuration options for counting
 * @returns A promise that resolves to line count, token estimate, and completion status
 */
export declare function countFileLinesAndTokens(
	filePath: string,
	options?: LineAndTokenCountOptions,
): Promise<LineAndTokenCountResult>
//# sourceMappingURL=line-counter.d.ts.map
