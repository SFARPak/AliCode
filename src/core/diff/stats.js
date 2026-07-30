"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.sanitizeUnifiedDiff = sanitizeUnifiedDiff
exports.computeUnifiedDiffStats = computeUnifiedDiffStats
exports.computeDiffStats = computeDiffStats
exports.convertNewFileToUnifiedDiff = convertNewFileToUnifiedDiff
const diff_1 = require("diff")
/**
 * Remove non-semantic diff noise like "No newline at end of file"
 */
function sanitizeUnifiedDiff(diff) {
	if (!diff) return diff
	return diff.replace(/\r\n/g, "\n").replace(/(^|\n)[ \t]*(?:\\ )?No newline at end of file[ \t]*(?=\n|$)/gi, "$1")
}
/**
 * Compute +/− counts from a unified diff (ignores headers/hunk lines)
 */
function computeUnifiedDiffStats(diff) {
	if (!diff) return null
	try {
		const patches = (0, diff_1.parsePatch)(diff)
		if (!patches || patches.length === 0) return null
		let added = 0
		let removed = 0
		for (const p of patches) {
			for (const h of p.hunks ?? []) {
				for (const l of h.lines ?? []) {
					const ch = l[0]
					if (ch === "+") added++
					else if (ch === "-") removed++
				}
			}
		}
		if (added > 0 || removed > 0) return { added, removed }
		return { added: 0, removed: 0 }
	} catch {
		// If parsing fails for any reason, signal no stats
		return null
	}
}
/**
 * Compute diff stats from any supported diff format (unified or search-replace)
 * Tries unified diff format first, then falls back to search-replace format
 */
function computeDiffStats(diff) {
	if (!diff) return null
	return computeUnifiedDiffStats(diff)
}
/**
 * Build a unified diff for a brand new file (all content lines are additions).
 * Trailing newline is ignored for line counting and emission.
 */
function convertNewFileToUnifiedDiff(content, filePath) {
	const newFileName = filePath || "file"
	// Normalize EOLs; rely on library for unified patch formatting
	const normalized = (content || "").replace(/\r\n/g, "\n")
	// Old file is empty (/dev/null), new file has content; zero context to show all lines as additions
	return (0, diff_1.createTwoFilesPatch)("/dev/null", newFileName, "", normalized, undefined, undefined, {
		context: 0,
	})
}
