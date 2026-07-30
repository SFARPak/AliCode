/**
 * Fuzzy sequence matching for the apply_patch tool.
 * Implements multi-pass sequence matching (exact, trim-end, trim, Unicode-normalized)
 * to locate old_lines and change_context within a file.
 */
/**
 * Attempt to find the sequence of pattern lines within lines beginning at or after start.
 * Returns the starting index of the match or null if not found.
 *
 * Matches are attempted with decreasing strictness:
 * 1. Exact match
 * 2. Ignoring trailing whitespace
 * 3. Ignoring leading and trailing whitespace
 * 4. Unicode-normalized (handles typographic characters)
 *
 * When eof is true, first try starting at the end-of-file (so that patterns
 * intended to match file endings are applied at the end), and fall back to
 * searching from start if needed.
 *
 * Special cases handled defensively:
 * - Empty pattern → returns start (no-op match)
 * - pattern.length > lines.length → returns null (cannot match)
 *
 * @param lines - The file lines to search in
 * @param pattern - The pattern lines to find
 * @param start - The starting index to search from
 * @param eof - Whether this chunk should match at end of file
 * @returns The starting index of the match, or null if not found
 */
export declare function seekSequence(lines: string[], pattern: string[], start: number, eof: boolean): number | null
//# sourceMappingURL=seek-sequence.d.ts.map
