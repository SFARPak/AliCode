/**
 * OpenAI Responses API maximum length for call_id field.
 * This limit applies to both function_call and function_call_output items.
 */
export declare const OPENAI_CALL_ID_MAX_LENGTH = 64
/**
 * Sanitize a tool_use ID to match API validation pattern: ^[a-zA-Z0-9_-]+$
 * Replaces any invalid character with underscore.
 */
export declare function sanitizeToolUseId(id: string): string
/**
 * Truncate a call_id to fit within OpenAI's 64-character limit.
 * Uses a hash suffix to maintain uniqueness when truncation is needed.
 *
 * @param id - The original call_id
 * @param maxLength - Maximum length (defaults to OpenAI's 64-char limit)
 * @returns The truncated ID, or original if already within limits
 */
export declare function truncateOpenAiCallId(id: string, maxLength?: number): string
/**
 * Sanitize and truncate a tool call ID for OpenAI's Responses API.
 * This combines character sanitization with length truncation.
 *
 * @param id - The original call_id
 * @param maxLength - Maximum length (defaults to OpenAI's 64-char limit)
 * @returns The sanitized and truncated ID
 */
export declare function sanitizeOpenAiCallId(id: string, maxLength?: number): string
//# sourceMappingURL=tool-id.d.ts.map
