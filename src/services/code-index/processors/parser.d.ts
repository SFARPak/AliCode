import { ICodeParser, CodeBlock } from "../interfaces"
/**
 * Implementation of the code parser interface
 */
export declare class CodeParser implements ICodeParser {
	private loadedParsers
	private pendingLoads
	/**
	 * Parses a code file into code blocks
	 * @param filePath Path to the file to parse
	 * @param options Optional parsing options
	 * @returns Promise resolving to array of code blocks
	 */
	parseFile(
		filePath: string,
		options?: {
			content?: string
			fileHash?: string
		},
	): Promise<CodeBlock[]>
	/**
	 * Checks if a language is supported
	 * @param extension File extension
	 * @returns Boolean indicating if the language is supported
	 */
	private isSupportedLanguage
	/**
	 * Creates a hash for a file
	 * @param content File content
	 * @returns Hash string
	 */
	private createFileHash
	/**
	 * Parses file content into code blocks
	 * @param filePath Path to the file
	 * @param content File content
	 * @param fileHash File hash
	 * @returns Array of code blocks
	 */
	private parseContent
	/**
	 * Common helper function to chunk text by lines, avoiding tiny remainders.
	 */
	private _chunkTextByLines
	private _performFallbackChunking
	private _chunkLeafNodeByLines
	/**
	 * Helper method to process markdown content sections with consistent chunking logic
	 */
	private processMarkdownSection
	private parseMarkdownContent
}
export declare const codeParser: CodeParser
//# sourceMappingURL=parser.d.ts.map
