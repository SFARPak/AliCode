import { Anthropic } from "@anthropic-ai/sdk"
/**
 * Merges text content (like environment_details) that follows tool_result blocks
 * into the last tool_result's content. This preserves reasoning continuity for
 * thinking models by avoiding separate user messages after tool results.
 *
 * Key behavior:
 * - User messages with ONLY tool_result blocks: keep as-is
 * - User messages with ONLY text/image: keep as-is
 * - User messages with tool_result blocks AND text blocks: merge the text blocks
 *   into the last tool_result's content
 *
 * @param messages Array of Anthropic messages
 * @returns Modified messages with text merged into tool_result content
 */
export declare function mergeEnvironmentDetailsForMiniMax(
	messages: Anthropic.Messages.MessageParam[],
): Anthropic.Messages.MessageParam[]
/**
 * @deprecated Use mergeEnvironmentDetailsForMiniMax instead. This function extracted
 * environment_details to the system prompt, but the new approach merges them into
 * tool_result content like r1-format does with mergeToolResultText.
 */
export declare function extractEnvironmentDetailsForMiniMax(messages: Anthropic.Messages.MessageParam[]): {
	messages: Anthropic.Messages.MessageParam[]
	extractedSystemContent: string[]
}
//# sourceMappingURL=minimax-format.d.ts.map
