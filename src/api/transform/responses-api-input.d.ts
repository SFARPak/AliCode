import { Anthropic } from "@anthropic-ai/sdk"
/**
 * Converts Anthropic-format messages to the OpenAI Responses API input format.
 *
 * Key differences from Chat Completions format:
 * - Content parts use { type: "input_text" } instead of { type: "text" }
 * - Images use { type: "input_image" } instead of { type: "image_url" }
 * - Tool results use { type: "function_call_output", call_id } instead of { role: "tool", tool_call_id }
 * - Tool uses become { type: "function_call", call_id, name, arguments } items
 * - System prompt goes via the `instructions` parameter, not as a message
 *
 * @param messages - Array of Anthropic MessageParam objects
 * @returns Array of Responses API input items
 */
export declare function convertToResponsesApiInput(messages: Anthropic.Messages.MessageParam[]): any[]
//# sourceMappingURL=responses-api-input.d.ts.map
