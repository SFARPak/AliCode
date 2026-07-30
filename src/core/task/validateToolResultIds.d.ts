import { Anthropic } from "@anthropic-ai/sdk"
/**
 * Custom error class for tool result ID mismatches.
 * Used for structured error tracking via external service.
 */
export declare class ToolResultIdMismatchError extends Error {
	readonly toolResultIds: string[]
	readonly toolUseIds: string[]
	constructor(message: string, toolResultIds: string[], toolUseIds: string[])
}
/**
 * Custom error class for missing tool results.
 * Used for structured error tracking via external service when tool_use blocks
 * don't have corresponding tool_result blocks.
 */
export declare class MissingToolResultError extends Error {
	readonly missingToolUseIds: string[]
	readonly existingToolResultIds: string[]
	constructor(message: string, missingToolUseIds: string[], existingToolResultIds: string[])
}
/**
 * Validates and fixes tool_result IDs in a user message against the previous assistant message.
 *
 * This is a centralized validation that catches all tool_use/tool_result issues
 * before messages are added to the API conversation history. It handles scenarios like:
 * - Race conditions during streaming
 * - Message editing scenarios
 * - Resume/delegation scenarios
 * - Missing tool_result blocks for tool_use calls
 *
 * @param userMessage - The user message being added to history
 * @param apiConversationHistory - The conversation history to find the previous assistant message from
 * @returns The validated user message with corrected tool_use_ids and any missing tool_results added
 */
export declare function validateAndFixToolResultIds(
	userMessage: Anthropic.MessageParam,
	apiConversationHistory: Anthropic.MessageParam[],
): Anthropic.MessageParam
//# sourceMappingURL=validateToolResultIds.d.ts.map
