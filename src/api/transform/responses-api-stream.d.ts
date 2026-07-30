import type { ApiStream, ApiStreamUsageChunk } from "./stream"
/**
 * Processes Responses API stream events and yields ApiStreamChunks.
 *
 * This is a shared utility for providers that use OpenAI's Responses API
 * (POST /v1/responses with stream: true). It handles the core event types:
 *
 * - Text deltas (response.output_text.delta)
 * - Reasoning deltas (response.reasoning_text.delta, response.reasoning_summary_text.delta)
 * - Tool/function calls (response.output_item.done with function_call type)
 * - Usage data (response.completed)
 *
 * Provider-specific concerns (WebSocket mode, SSE fallback, duplicate detection,
 * pending tool tracking) are intentionally left to individual providers.
 *
 * @param stream - AsyncIterable of Responses API stream events
 * @param normalizeUsage - Provider-specific function to normalize usage data into ApiStreamUsageChunk
 */
export declare function processResponsesApiStream(
	stream: AsyncIterable<any>,
	normalizeUsage: (usage: any) => ApiStreamUsageChunk | undefined,
): ApiStream
/**
 * Creates a standard usage normalizer for providers with per-token pricing.
 * Extracts input/output tokens, cache tokens, reasoning tokens, and computes cost.
 *
 * @param calculateCost - Optional function to compute total cost from token counts
 */
export declare function createUsageNormalizer(
	calculateCost?: (inputTokens: number, outputTokens: number, cacheReadTokens: number) => number,
): (usage: any) => ApiStreamUsageChunk | undefined
//# sourceMappingURL=responses-api-stream.d.ts.map
