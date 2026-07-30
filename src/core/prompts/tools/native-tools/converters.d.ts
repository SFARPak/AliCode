import type OpenAI from "openai"
import type Anthropic from "@anthropic-ai/sdk"
/**
 * Converts an OpenAI ChatCompletionTool to Anthropic's Tool format.
 *
 * OpenAI format wraps the tool definition in a `function` object with `parameters`,
 * while Anthropic uses a flatter structure with `input_schema`.
 *
 * @param tool - OpenAI ChatCompletionTool to convert
 * @returns Anthropic Tool definition
 *
 * @example
 * ```typescript
 * const openAITool = {
 *   type: "function",
 *   function: {
 *     name: "get_weather",
 *     description: "Get weather",
 *     parameters: { type: "object", properties: {...} }
 *   }
 * }
 *
 * const anthropicTool = convertOpenAIToolToAnthropic(openAITool)
 * // Returns: { name: "get_weather", description: "Get weather", input_schema: {...} }
 * ```
 */
export declare function convertOpenAIToolToAnthropic(tool: OpenAI.Chat.ChatCompletionTool): Anthropic.Tool
/**
 * Converts an array of OpenAI ChatCompletionTools to Anthropic's Tool format.
 *
 * @param tools - Array of OpenAI ChatCompletionTools to convert
 * @returns Array of Anthropic Tool definitions
 */
export declare function convertOpenAIToolsToAnthropic(tools: OpenAI.Chat.ChatCompletionTool[]): Anthropic.Tool[]
/**
 * Converts OpenAI tool_choice to Anthropic ToolChoice format.
 *
 * Maps OpenAI's tool_choice parameter to Anthropic's equivalent format:
 * - "none" → undefined (Anthropic doesn't have "none", just omit tools)
 * - "auto" → { type: "auto" }
 * - "required" → { type: "any" }
 * - { type: "function", function: { name } } → { type: "tool", name }
 *
 * @param toolChoice - OpenAI tool_choice parameter
 * @param parallelToolCalls - When true (default), allows parallel tool calls. When false, disables parallel tool calls.
 * @returns Anthropic ToolChoice or undefined if tools should be omitted
 *
 * @example
 * ```typescript
 * convertOpenAIToolChoiceToAnthropic("auto", false)
 * // Returns: { type: "auto", disable_parallel_tool_use: true }
 *
 * convertOpenAIToolChoiceToAnthropic({ type: "function", function: { name: "get_weather" } })
 * // Returns: { type: "tool", name: "get_weather", disable_parallel_tool_use: false }
 * ```
 */
export declare function convertOpenAIToolChoiceToAnthropic(
	toolChoice: OpenAI.Chat.ChatCompletionCreateParams["tool_choice"],
	parallelToolCalls?: boolean,
): Anthropic.Messages.MessageCreateParams["tool_choice"] | undefined
//# sourceMappingURL=converters.d.ts.map
