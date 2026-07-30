/**
 * Diff utilities for backend (extension) use.
 * Source of truth for diff normalization and stats.
 */
export interface DiffStats {
	added: number
	removed: number
}
/**
 * Remove non-semantic diff noise like "No newline at end of file"
 */
export declare function sanitizeUnifiedDiff(diff: string): string
/**
 * Compute +/− counts from a unified diff (ignores headers/hunk lines)
 */
export declare function computeUnifiedDiffStats(diff?: string): DiffStats | null
/**
 * Compute diff stats from any supported diff format (unified or search-replace)
 * Tries unified diff format first, then falls back to search-replace format
 */
export declare function computeDiffStats(diff?: string): DiffStats | null
/**
 * Build a unified diff for a brand new file (all content lines are additions).
 * Trailing newline is ignored for line counting and emission.
 */
export declare function convertNewFileToUnifiedDiff(content: string, filePath?: string): string
//# sourceMappingURL=stats.d.ts.map
