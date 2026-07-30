/**
 * Markdown parser that returns headers and section line ranges
 * This is a special case implementation that doesn't use tree-sitter
 * but is compatible with the parseFile function's capture processing
 */
import { QueryCapture } from "web-tree-sitter"
/**
 * Parse a markdown file and extract headers and section line ranges
 *
 * @param content - The content of the markdown file
 * @returns An array of mock captures compatible with tree-sitter captures
 */
export declare function parseMarkdown(content: string): QueryCapture[]
/**
 * Format markdown captures into the same string format as parseFile
 * This is used for backward compatibility
 *
 * @param captures - The array of query captures
 * @param minSectionLines - Minimum number of lines for a section to be included
 * @returns A formatted string with headers and section line ranges
 */
export declare function formatMarkdownCaptures(captures: QueryCapture[], minSectionLines?: number): string | null
//# sourceMappingURL=markdownParser.d.ts.map
