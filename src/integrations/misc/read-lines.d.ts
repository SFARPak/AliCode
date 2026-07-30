/**
 * Reads a range of lines from a file.
 *
 * @param filepath - Path to the file to read
 * @param endLine - Optional. The line number to stop reading at (inclusive). If undefined, reads to the end of file.
 * @param startLine - Optional. The line number to start reading from (inclusive). If undefined, starts from line 0.
 * @returns Promise resolving to a string containing the read lines joined with newlines
 * @throws {RangeError} If line numbers are invalid or out of range
 */
export declare function readLines(filepath: string, endLine?: number, startLine?: number): Promise<string>
//# sourceMappingURL=read-lines.d.ts.map
