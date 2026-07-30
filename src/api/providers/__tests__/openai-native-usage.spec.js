"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const openai_native_1 = require("../openai-native")
const types_1 = require("@ali-code/types")
;(0, vitest_1.describe)("OpenAiNativeHandler - normalizeUsage", () => {
	let handler
	const mockModel = {
		id: "gpt-4o",
		info: types_1.openAiNativeModels["gpt-4o"],
	}
	const gpt54Model = {
		id: "gpt-5.4",
		info: types_1.openAiNativeModels["gpt-5.4"],
	}
	;(0, vitest_1.beforeEach)(() => {
		handler = new openai_native_1.OpenAiNativeHandler({
			openAiNativeApiKey: "test-key",
		})
	})
	;(0, vitest_1.describe)("detailed token shapes (Responses API)", () => {
		;(0, vitest_1.it)("should handle detailed shapes with cached and miss tokens", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
				input_tokens_details: {
					cached_tokens: 30,
					cache_miss_tokens: 70,
				},
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 30,
				cacheWriteTokens: 0, // miss tokens are NOT cache writes
			})
		})
		;(0, vitest_1.it)("should derive total input tokens from details when totals are missing", () => {
			const usage = {
				// No input_tokens or prompt_tokens
				output_tokens: 50,
				input_tokens_details: {
					cached_tokens: 30,
					cache_miss_tokens: 70,
				},
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100, // Derived from 30 + 70
				outputTokens: 50,
				cacheReadTokens: 30,
				cacheWriteTokens: 0, // miss tokens are NOT cache writes
			})
		})
		;(0, vitest_1.it)("should handle prompt_tokens_details variant", () => {
			const usage = {
				prompt_tokens: 100,
				completion_tokens: 50,
				prompt_tokens_details: {
					cached_tokens: 30,
					cache_miss_tokens: 70,
				},
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 30,
				cacheWriteTokens: 0, // miss tokens are NOT cache writes
			})
		})
		;(0, vitest_1.it)("should handle cache_creation_input_tokens for actual cache writes", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
				cache_creation_input_tokens: 20,
				input_tokens_details: {
					cached_tokens: 30,
					cache_miss_tokens: 50, // 50 miss + 30 cached + 20 creation = 100 total
				},
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 30,
				cacheWriteTokens: 20, // Actual cache writes from cache_creation_input_tokens
			})
		})
		;(0, vitest_1.it)("should handle reasoning tokens in output details", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 150,
				output_tokens_details: {
					reasoning_tokens: 50,
				},
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 150,
				reasoningTokens: 50,
			})
		})
	})
	;(0, vitest_1.describe)("legacy field names", () => {
		;(0, vitest_1.it)("should handle cache_creation_input_tokens and cache_read_input_tokens", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
				cache_creation_input_tokens: 20,
				cache_read_input_tokens: 30,
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 30,
				cacheWriteTokens: 20,
			})
		})
		;(0, vitest_1.it)("should handle cache_write_tokens and cache_read_tokens", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
				cache_write_tokens: 20,
				cache_read_tokens: 30,
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 30,
				cacheWriteTokens: 20,
			})
		})
		;(0, vitest_1.it)("should handle cached_tokens field", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
				cached_tokens: 30,
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 30,
			})
		})
		;(0, vitest_1.it)("should handle prompt_tokens and completion_tokens", () => {
			const usage = {
				prompt_tokens: 100,
				completion_tokens: 50,
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
			})
		})
	})
	;(0, vitest_1.describe)("SSE-only events", () => {
		;(0, vitest_1.it)("should handle SSE events with minimal usage data", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
			})
		})
		;(0, vitest_1.it)("should handle SSE events with no cache information", () => {
			const usage = {
				prompt_tokens: 100,
				completion_tokens: 50,
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
			})
		})
	})
	;(0, vitest_1.describe)("edge cases", () => {
		;(0, vitest_1.it)("should handle undefined usage", () => {
			const result = handler.normalizeUsage(undefined, mockModel)
			;(0, vitest_1.expect)(result).toBeUndefined()
		})
		;(0, vitest_1.it)("should handle null usage", () => {
			const result = handler.normalizeUsage(null, mockModel)
			;(0, vitest_1.expect)(result).toBeUndefined()
		})
		;(0, vitest_1.it)("should handle empty usage object", () => {
			const usage = {}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 0,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
			})
		})
		;(0, vitest_1.it)("should handle missing details but with cache fields", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
				cache_read_input_tokens: 30,
				// No input_tokens_details
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 30,
				cacheWriteTokens: 0,
			})
		})
		;(0, vitest_1.it)("should use all available cache information with proper fallbacks", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
				cached_tokens: 20, // Legacy field (will be used as fallback)
				input_tokens_details: {
					cached_tokens: 30, // Detailed shape
					cache_miss_tokens: 70,
				},
			}
			const result = handler.normalizeUsage(usage, mockModel)
			// The implementation uses nullish coalescing, so it will use the first non-nullish value:
			// cache_read_input_tokens ?? cache_read_tokens ?? cached_tokens ?? cachedFromDetails
			// Since none of the first two exist, it falls back to cached_tokens (20) before cachedFromDetails
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 20, // From cached_tokens (legacy field comes before details in fallback chain)
				cacheWriteTokens: 0, // miss tokens are NOT cache writes
			})
		})
		;(0, vitest_1.it)("should use detailed shapes when legacy fields are not present", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
				// No cached_tokens legacy field
				input_tokens_details: {
					cached_tokens: 30,
					cache_miss_tokens: 70,
				},
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100,
				outputTokens: 50,
				cacheReadTokens: 30, // From details since no legacy field exists
				cacheWriteTokens: 0, // miss tokens are NOT cache writes
			})
		})
		;(0, vitest_1.it)("should handle totals missing with only partial details", () => {
			const usage = {
				// No input_tokens or prompt_tokens
				output_tokens: 50,
				input_tokens_details: {
					cached_tokens: 30,
					// No cache_miss_tokens
				},
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 30, // Derived from cached_tokens only
				outputTokens: 50,
				cacheReadTokens: 30,
				cacheWriteTokens: 0,
			})
		})
	})
	;(0, vitest_1.describe)("OpenAiNativeHandler - prompt cache retention", () => {
		let handler
		;(0, vitest_1.beforeEach)(() => {
			handler = new openai_native_1.OpenAiNativeHandler({
				openAiNativeApiKey: "test-key",
			})
		})
		const buildRequestBodyForModel = (modelId) => {
			// Force the handler to use the requested model ID
			handler.options.apiModelId = modelId
			const model = handler.getModel()
			// Minimal formatted input/systemPrompt/verbosity/metadata for building the body
			return handler.buildRequestBody(model, [], "", model.verbosity, undefined, undefined)
		}
		;(0, vitest_1.it)(
			"should set prompt_cache_retention=24h for gpt-5.1 models that support prompt caching",
			() => {
				const body = buildRequestBodyForModel("gpt-5.1")
				;(0, vitest_1.expect)(body.prompt_cache_retention).toBe("24h")
				const codexBody = buildRequestBodyForModel("gpt-5.1-codex")
				;(0, vitest_1.expect)(codexBody.prompt_cache_retention).toBe("24h")
				const codexMiniBody = buildRequestBodyForModel("gpt-5.1-codex-mini")
				;(0, vitest_1.expect)(codexMiniBody.prompt_cache_retention).toBe("24h")
			},
		)
		;(0, vitest_1.it)(
			"should not set prompt_cache_retention for non-gpt-5.1 models even if they support prompt caching",
			() => {
				const body = buildRequestBodyForModel("gpt-5")
				;(0, vitest_1.expect)(body.prompt_cache_retention).toBeUndefined()
				const fourOBody = buildRequestBodyForModel("gpt-4o")
				;(0, vitest_1.expect)(fourOBody.prompt_cache_retention).toBeUndefined()
				const gpt54Body = buildRequestBodyForModel("gpt-5.4")
				;(0, vitest_1.expect)(gpt54Body.prompt_cache_retention).toBeUndefined()
				const chatModelBody = buildRequestBodyForModel("gpt-5.3-chat-latest")
				;(0, vitest_1.expect)(chatModelBody.prompt_cache_retention).toBeUndefined()
			},
		)
		;(0, vitest_1.it)(
			"should not set prompt_cache_retention when the model does not support prompt caching",
			() => {
				const modelId = "codex-mini-latest"
				;(0, vitest_1.expect)(types_1.openAiNativeModels[modelId].supportsPromptCache).toBe(false)
				const body = buildRequestBodyForModel(modelId)
				;(0, vitest_1.expect)(body.prompt_cache_retention).toBeUndefined()
			},
		)
	})
	;(0, vitest_1.describe)("cost calculation", () => {
		;(0, vitest_1.it)("should pass total input tokens to calculateApiCostOpenAI", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
				cache_read_input_tokens: 30,
				cache_creation_input_tokens: 20,
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toHaveProperty("totalCost")
			;(0, vitest_1.expect)(result.totalCost).toBeGreaterThan(0)
			// calculateApiCostOpenAI handles subtracting cache tokens internally
			// It will compute: 100 - 30 - 20 = 50 uncached input tokens
		})
		;(0, vitest_1.it)("should handle cost calculation with no cache reads", () => {
			const usage = {
				input_tokens: 100,
				output_tokens: 50,
			}
			const result = handler.normalizeUsage(usage, mockModel)
			;(0, vitest_1.expect)(result).toHaveProperty("totalCost")
			;(0, vitest_1.expect)(result.totalCost).toBeGreaterThan(0)
			// Cost should be calculated with full input tokens since no cache reads
		})
		;(0, vitest_1.it)("should use standard GPT-5.4 pricing within the base context threshold", () => {
			const usage = {
				input_tokens: 100_000,
				output_tokens: 1_000,
				cache_read_input_tokens: 20_000,
			}
			const result = handler.normalizeUsage(usage, gpt54Model)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 100_000,
				outputTokens: 1_000,
				cacheReadTokens: 20_000,
			})
			;(0, vitest_1.expect)(result.totalCost).toBeCloseTo(0.22, 6)
		})
		;(0, vitest_1.it)("should apply GPT-5.4 long-context pricing above the threshold", () => {
			const usage = {
				input_tokens: 300_000,
				output_tokens: 1_000,
				cache_read_input_tokens: 100_000,
			}
			const result = handler.normalizeUsage(usage, gpt54Model)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 300_000,
				outputTokens: 1_000,
				cacheReadTokens: 100_000,
			})
			;(0, vitest_1.expect)(result.totalCost).toBeCloseTo(1.0475, 6)
		})
		;(0, vitest_1.it)("should not apply GPT-5.4 long-context pricing to priority tier", () => {
			handler = new openai_native_1.OpenAiNativeHandler({
				openAiNativeApiKey: "test-key",
				openAiNativeServiceTier: "priority",
			})
			const usage = {
				input_tokens: 300_000,
				output_tokens: 1_000,
				cache_read_input_tokens: 100_000,
			}
			const result = handler.normalizeUsage(usage, gpt54Model)
			;(0, vitest_1.expect)(result).toMatchObject({
				type: "usage",
				inputTokens: 300_000,
				outputTokens: 1_000,
				cacheReadTokens: 100_000,
			})
			;(0, vitest_1.expect)(result.totalCost).toBeCloseTo(1.08, 6)
		})
	})
})
