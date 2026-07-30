import type OpenAI from "openai"
/** Default maximum lines to return per file (Codex-inspired predictable limit) */
export declare const DEFAULT_LINE_LIMIT = 2000
/** Maximum characters per line before truncation */
export declare const MAX_LINE_LENGTH = 2000
/** Default indentation levels to include above anchor (0 = unlimited) */
export declare const DEFAULT_MAX_LEVELS = 0
/**
 * Options for creating the read_file tool definition.
 */
export interface ReadFileToolOptions {
	/** Whether the model supports image processing (default: false) */
	supportsImages?: boolean
}
/**
 * Creates the read_file tool definition with Codex-inspired modes.
 *
 * Two reading modes are supported:
 *
 * 1. **Slice Mode** (default): Simple offset/limit reading
 *    - Reads contiguous lines starting from `offset` (1-based, default: 1)
 *    - Limited to `limit` lines (default: 2000)
 *    - Predictable and efficient for agent planning
 *
 * 2. **Indentation Mode**: Semantic code block extraction
 *    - Anchored on a specific line number (1-based)
 *    - Extracts the block containing that line plus context
 *    - Respects code structure based on indentation hierarchy
 *    - Useful for extracting functions, classes, or logical blocks
 *
 * @param options - Configuration options for the tool
 * @returns Native tool definition for read_file
 */
export declare function createReadFileTool(options?: ReadFileToolOptions): OpenAI.Chat.ChatCompletionTool
/**
 * Default read_file tool with all parameters
 */
export declare const read_file: OpenAI.Chat.Completions.ChatCompletionTool
//# sourceMappingURL=read_file.d.ts.map
