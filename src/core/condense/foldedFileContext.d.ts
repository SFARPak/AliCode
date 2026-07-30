import { AliIgnoreController } from "../ignore/AliIgnoreController"
/**
 * Result of generating folded file context.
 */
export interface FoldedFileContextResult {
	/** The formatted string containing all folded file definitions (joined) */
	content: string
	/** Individual file sections, each in its own <system-reminder> block */
	sections: string[]
	/** Number of files successfully processed */
	filesProcessed: number
	/** Number of files that failed or were skipped */
	filesSkipped: number
	/** Total character count of the folded content */
	characterCount: number
}
/**
 * Options for generating folded file context.
 */
export interface FoldedFileContextOptions {
	/** Maximum total characters for the folded content (default: 50000) */
	maxCharacters?: number
	/** The current working directory for resolving relative paths */
	cwd: string
	/** Optional AliIgnoreController for file access validation */
	aliIgnoreController?: AliIgnoreController
}
/**
 * Generates folded (signatures-only) file context for a list of files using tree-sitter.
 *
 * This function takes file paths that were read during a conversation and produces
 * a condensed representation showing only function signatures, class declarations,
 * and other important structural definitions - hiding implementation bodies.
 *
 * Each file is wrapped in its own `<system-reminder>` block during context condensation,
 * allowing the model to retain awareness of file structure without consuming excessive tokens.
 *
 * @param filePaths - Array of file paths to process (relative to cwd)
 * @param options - Configuration options including cwd and max characters
 * @returns FoldedFileContextResult with the formatted content and statistics
 *
 * @example
 * ```typescript
 * const result = await generateFoldedFileContext(
 *   ['src/utils/helpers.ts', 'src/api/client.ts'],
 *   { cwd: '/project', maxCharacters: 30000 }
 * )
 * // result.content contains individual <system-reminder> blocks for each file:
 * // <system-reminder>
 * // ## File Context: src/utils/helpers.ts
 * // 1--15 | export function formatDate(...)
 * // 17--45 | export class DateHelper {...}
 * // </system-reminder>
 * // <system-reminder>
 * // ## File Context: src/api/client.ts
 * // ...
 * // </system-reminder>
 * ```
 */
export declare function generateFoldedFileContext(
	filePaths: string[],
	options: FoldedFileContextOptions,
): Promise<FoldedFileContextResult>
//# sourceMappingURL=foldedFileContext.d.ts.map
