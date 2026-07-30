import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
type AssistantMessage = OpenAI.Chat.ChatCompletionAssistantMessageParam
type Message = OpenAI.Chat.ChatCompletionMessageParam
type AnthropicMessage = Anthropic.Messages.MessageParam
/**
 * Extended assistant message type to support DeepSeek's interleaved thinking.
 * DeepSeek's API returns reasoning_content alongside content and tool_calls,
 * and requires it to be passed back in subsequent requests within the same turn.
 */
export type DeepSeekAssistantMessage = AssistantMessage & {
	reasoning_content?: string
}
/**
 * Converts Anthropic messages to OpenAI format while merging consecutive messages with the same role.
 * This is required for DeepSeek Reasoner which does not support successive messages with the same role.
 *
 * For DeepSeek's interleaved thinking mode:
 * - Preserves reasoning_content on assistant messages for tool call continuations
 * - Tool result messages are converted to OpenAI tool messages
 * - reasoning_content from previous assistant messages is preserved until a new user turn
 * - Text content after tool_results (like environment_details) is merged into the last tool message
 *   to avoid creating user messages that would cause reasoning_content to be dropped
 *
 * @param messages Array of Anthropic messages
 * @param options Optional configuration for message conversion
 * @param options.mergeToolResultText If true, merge text content after tool_results into the last
 *                                     tool message instead of creating a separate user message.
 *                                     This is critical for DeepSeek's interleaved thinking mode.
 * @returns Array of OpenAI messages where consecutive messages with the same role are combined
 */
export declare function convertToR1Format(
	messages: AnthropicMessage[],
	options?: {
		mergeToolResultText?: boolean
	},
): Message[]
export {}
//# sourceMappingURL=r1-format.d.ts.map
