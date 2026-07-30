import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
/**
 * Type for OpenRouter's reasoning detail elements.
 * @see https://openrouter.ai/docs/use-cases/reasoning-tokens#streaming-response
 */
export type ReasoningDetail = {
	/**
	 * Type of reasoning detail.
	 * @see https://openrouter.ai/docs/use-cases/reasoning-tokens#reasoning-detail-types
	 */
	type: string
	text?: string
	summary?: string
	data?: string
	signature?: string | null
	id?: string | null
	/**
	 * Format of the reasoning detail:
	 * - "unknown" - Format is not specified
	 * - "openai-responses-v1" - OpenAI responses format version 1
	 * - "anthropic-claude-v1" - Anthropic Claude format version 1 (default)
	 * - "google-gemini-v1" - Google Gemini format version 1
	 * - "xai-responses-v1" - xAI responses format version 1
	 */
	format?: string
	index?: number
}
/**
 * Consolidates reasoning_details by grouping by index and type.
 * - Filters out corrupted encrypted blocks (missing `data` field)
 * - For text blocks: concatenates text, keeps last signature/id/format
 * - For encrypted blocks: keeps only the last one per index
 *
 * @param reasoningDetails - Array of reasoning detail objects
 * @returns Consolidated array of reasoning details
 * @see https://github.com/cline/cline/issues/8214
 */
export declare function consolidateReasoningDetails(reasoningDetails: ReasoningDetail[]): ReasoningDetail[]
/**
 * Sanitizes OpenAI messages for Gemini models by filtering reasoning_details
 * to only include entries that match the tool call IDs.
 *
 * Gemini models require thought signatures for tool calls. When switching providers
 * mid-conversation, historical tool calls may not include Gemini reasoning details,
 * which can poison the next request. This function:
 * 1. Filters reasoning_details to only include entries matching tool call IDs
 * 2. Drops tool_calls that lack any matching reasoning_details
 * 3. Removes corresponding tool result messages for dropped tool calls
 *
 * @param messages - Array of OpenAI chat completion messages
 * @param modelId - The model ID to check if sanitization is needed
 * @returns Sanitized array of messages (unchanged if not a Gemini model)
 * @see https://github.com/cline/cline/issues/8214
 */
export declare function sanitizeGeminiMessages(
	messages: OpenAI.Chat.ChatCompletionMessageParam[],
	modelId: string,
): OpenAI.Chat.ChatCompletionMessageParam[]
/**
 * Options for converting Anthropic messages to OpenAI format.
 */
export interface ConvertToOpenAiMessagesOptions {
	/**
	 * Optional function to normalize tool call IDs for providers with strict ID requirements.
	 * When provided, this function will be applied to all tool_use IDs and tool_result tool_use_ids.
	 * This allows callers to declare provider-specific ID format requirements.
	 */
	normalizeToolCallId?: (id: string) => string
	/**
	 * If true, merge text content after tool_results into the last tool message
	 * instead of creating a separate user message. This is critical for providers
	 * with reasoning/thinking models (like DeepSeek-reasoner, GLM-4.7, etc.) where
	 * a user message after tool results causes the model to drop all previous
	 * reasoning_content. Default is false for backward compatibility.
	 */
	mergeToolResultText?: boolean
}
export declare function convertToOpenAiMessages(
	anthropicMessages: Anthropic.Messages.MessageParam[],
	options?: ConvertToOpenAiMessagesOptions,
): OpenAI.Chat.ChatCompletionMessageParam[]
//# sourceMappingURL=openai-format.d.ts.map
