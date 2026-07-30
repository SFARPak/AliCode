import type OpenAI from "openai"
export { getMcpServerTools } from "./mcp_server"
export { convertOpenAIToolToAnthropic, convertOpenAIToolsToAnthropic } from "./converters"
export type { ReadFileToolOptions } from "./read_file"
/**
 * Options for customizing the native tools array.
 */
export interface NativeToolsOptions {
	/** Whether the model supports image processing (default: false) */
	supportsImages?: boolean
}
/**
 * Get native tools array, optionally customizing based on settings.
 *
 * @param options - Configuration options for the tools
 * @returns Array of native tool definitions
 */
export declare function getNativeTools(options?: NativeToolsOptions): OpenAI.Chat.ChatCompletionTool[]
export declare const nativeTools: OpenAI.Chat.Completions.ChatCompletionTool[]
//# sourceMappingURL=index.d.ts.map
