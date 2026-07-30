/**
 * Tests for duplicate tool_use ID prevention.
 *
 * These tests verify the fix for API 400 error "tool_use ids must be unique"
 * that can occur when:
 * 1. Stream retries/reconnections cause duplicate tool_call_start events
 * 2. Multiple tool_use blocks with the same ID accumulate in assistantMessageContent
 *
 * The fix implements two layers of protection:
 * - Layer 1: Guard in streaming handler (streamingToolCallIndices check)
 * - Layer 2: Pre-flight deduplication when building API request content
 */
export {}
//# sourceMappingURL=duplicate-tool-use-ids.spec.d.ts.map
