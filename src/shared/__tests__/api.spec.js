"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const types_1 = require("@ali-code/types")
const api_1 = require("../api")
describe("getModelMaxOutputTokens", () => {
	const mockModel = {
		maxTokens: 8192,
		contextWindow: 200000,
		supportsPromptCache: true,
	}
	test("should return model maxTokens when maxTokens is within 20% of context window", () => {
		const settings = {
			apiProvider: "anthropic",
		}
		// mockModel has maxTokens: 8192 and contextWindow: 200000
		// 8192 is 4.096% of 200000, which is <= 20%, so it should use model.maxTokens
		const result = (0, api_1.getModelMaxOutputTokens)({
			modelId: "claude-3-5-sonnet-20241022",
			model: mockModel,
			settings,
		})
		expect(result).toBe(8192)
	})
	test("should handle reasoning budget models correctly", () => {
		const reasoningModel = {
			...mockModel,
			supportsReasoningBudget: true,
			requiredReasoningBudget: true,
		}
		const settings = {
			apiProvider: "anthropic",
			enableReasoningEffort: true,
			modelMaxTokens: 32000,
		}
		const result = (0, api_1.getModelMaxOutputTokens)({
			modelId: "claude-3-7-sonnet-20250219",
			model: reasoningModel,
			settings,
		})
		expect(result).toBe(32000)
	})
	test("should return default of 8192 when maxTokens is undefined", () => {
		const modelWithoutMaxTokens = {
			contextWindow: 100000,
			supportsPromptCache: true,
		}
		const result = (0, api_1.getModelMaxOutputTokens)({
			modelId: "some-model",
			model: modelWithoutMaxTokens,
			settings: {},
		})
		expect(result).toBe(8192)
	})
	test("should return ANTHROPIC_DEFAULT_MAX_TOKENS for Anthropic models that support reasoning budget but aren't using it", () => {
		const anthropicModelId = "claude-sonnet-4-20250514"
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			supportsReasoningBudget: true,
			maxTokens: 64_000, // This should be ignored
		}
		const settings = {
			apiProvider: "anthropic",
			enableReasoningEffort: false, // Not using reasoning
		}
		const result = (0, api_1.getModelMaxOutputTokens)({ modelId: anthropicModelId, model, settings })
		expect(result).toBe(types_1.ANTHROPIC_DEFAULT_MAX_TOKENS) // Should be 8192, not 64_000
	})
	test("should return model.maxTokens for non-Anthropic models that support reasoning budget but aren't using it", () => {
		const geminiModelId = "gemini-2.5-flash-preview-04-17"
		const model = {
			contextWindow: 1_048_576,
			supportsPromptCache: false,
			supportsReasoningBudget: true,
			maxTokens: 65_535, // 65_535 is ~6.25% of 1_048_576, which is <= 20%
		}
		const settings = {
			apiProvider: "gemini",
			enableReasoningEffort: false, // Not using reasoning
		}
		const result = (0, api_1.getModelMaxOutputTokens)({ modelId: geminiModelId, model, settings })
		expect(result).toBe(65_535) // Should use model.maxTokens since it's within 20% threshold
	})
	test("should clamp maxTokens to 20% of context window when maxTokens exceeds threshold", () => {
		const model = {
			contextWindow: 100_000,
			supportsPromptCache: false,
			maxTokens: 50_000, // 50% of context window, exceeds 20% threshold
		}
		const settings = {
			apiProvider: "openai",
		}
		const result = (0, api_1.getModelMaxOutputTokens)({
			modelId: "gpt-4",
			model,
			settings,
			format: "openai",
		})
		// Should clamp to 20% of context window: 100_000 * 0.2 = 20_000
		expect(result).toBe(20_000)
	})
	test("should clamp maxTokens to 20% of context window for Anthropic models when maxTokens exceeds threshold", () => {
		const model = {
			contextWindow: 100_000,
			supportsPromptCache: true,
			maxTokens: 50_000, // 50% of context window, exceeds 20% threshold
		}
		const settings = {
			apiProvider: "anthropic",
		}
		const result = (0, api_1.getModelMaxOutputTokens)({
			modelId: "claude-3-5-sonnet-20241022",
			model,
			settings,
		})
		// Should clamp to 20% of context window: 100_000 * 0.2 = 20_000
		expect(result).toBe(20_000)
	})
	test("should use model.maxTokens when exactly at 20% threshold", () => {
		const model = {
			contextWindow: 100_000,
			supportsPromptCache: false,
			maxTokens: 20_000, // Exactly 20% of context window
		}
		const settings = {
			apiProvider: "openai",
		}
		const result = (0, api_1.getModelMaxOutputTokens)({
			modelId: "gpt-4",
			model,
			settings,
			format: "openai",
		})
		expect(result).toBe(20_000) // Should use model.maxTokens since it's exactly at 20%
	})
	test("should bypass 20% cap for GPT-5 models and use exact configured max tokens", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: false,
			maxTokens: 128_000, // 64% of context window, normally would be capped
		}
		const settings = {
			apiProvider: "openai",
		}
		// Test various GPT-5 model IDs
		const gpt5ModelIds = ["gpt-5", "gpt-5-turbo", "GPT-5", "openai/gpt-5-preview", "gpt-5-32k", "GPT-5-TURBO"]
		gpt5ModelIds.forEach((modelId) => {
			const result = (0, api_1.getModelMaxOutputTokens)({
				modelId,
				model,
				settings,
				format: "openai",
			})
			// Should use full 128k tokens, not capped to 20% (40k)
			expect(result).toBe(128_000)
		})
	})
	test("should still apply 20% cap to non-GPT-5 models", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: false,
			maxTokens: 128_000, // 64% of context window, should be capped
		}
		const settings = {
			apiProvider: "openai",
		}
		// Test non-GPT-5 model IDs
		const nonGpt5ModelIds = ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "claude-3-5-sonnet", "gemini-pro"]
		nonGpt5ModelIds.forEach((modelId) => {
			const result = (0, api_1.getModelMaxOutputTokens)({
				modelId,
				model,
				settings,
				format: "openai",
			})
			// Should be capped to 20% of context window: 200_000 * 0.2 = 40_000
			expect(result).toBe(40_000)
		})
	})
	test("should handle GPT-5 models with various max token configurations", () => {
		const testCases = [
			{
				maxTokens: 128_000,
				contextWindow: 200_000,
				expected: 128_000, // Uses full 128k
			},
			{
				maxTokens: 64_000,
				contextWindow: 200_000,
				expected: 64_000, // Uses configured 64k
			},
			{
				maxTokens: 256_000,
				contextWindow: 400_000,
				expected: 256_000, // Uses full 256k even though it's 64% of context
			},
		]
		testCases.forEach(({ maxTokens, contextWindow, expected }) => {
			const model = {
				contextWindow,
				supportsPromptCache: false,
				maxTokens,
			}
			const result = (0, api_1.getModelMaxOutputTokens)({
				modelId: "gpt-5-turbo",
				model,
				settings: { apiProvider: "openai" },
				format: "openai",
			})
			expect(result).toBe(expected)
		})
	})
	test("should return modelMaxTokens from settings when reasoning budget is required", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			requiredReasoningBudget: true,
			maxTokens: 8000,
		}
		const settings = {
			modelMaxTokens: 4000,
		}
		expect((0, api_1.getModelMaxOutputTokens)({ modelId: "test", model, settings })).toBe(4000)
	})
	test("should return default 16_384 for reasoning budget models when modelMaxTokens not provided", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			requiredReasoningBudget: true,
			maxTokens: 8000,
		}
		const settings = {}
		expect((0, api_1.getModelMaxOutputTokens)({ modelId: "test", model, settings })).toBe(16_384)
	})
})
describe("shouldUseReasoningBudget", () => {
	test("should return true when model has requiredReasoningBudget", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			requiredReasoningBudget: true,
		}
		// Should return true regardless of settings
		expect((0, api_1.shouldUseReasoningBudget)({ model })).toBe(true)
		expect((0, api_1.shouldUseReasoningBudget)({ model, settings: {} })).toBe(true)
		expect((0, api_1.shouldUseReasoningBudget)({ model, settings: { enableReasoningEffort: false } })).toBe(true)
	})
	test("should return true when model supports reasoning budget and settings enable reasoning effort", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			supportsReasoningBudget: true,
		}
		const settings = {
			enableReasoningEffort: true,
		}
		expect((0, api_1.shouldUseReasoningBudget)({ model, settings })).toBe(true)
	})
	test("should return false when model supports reasoning budget but settings don't enable reasoning effort", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			supportsReasoningBudget: true,
		}
		const settings = {
			enableReasoningEffort: false,
		}
		expect((0, api_1.shouldUseReasoningBudget)({ model, settings })).toBe(false)
		expect((0, api_1.shouldUseReasoningBudget)({ model, settings: {} })).toBe(false)
		expect((0, api_1.shouldUseReasoningBudget)({ model })).toBe(false)
	})
	test("should return false when model doesn't support reasoning budget", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
		}
		const settings = {
			enableReasoningEffort: true,
		}
		expect((0, api_1.shouldUseReasoningBudget)({ model, settings })).toBe(false)
		expect((0, api_1.shouldUseReasoningBudget)({ model })).toBe(false)
	})
})
describe("shouldUseReasoningEffort", () => {
	test("should return true when model has reasoningEffort property", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			reasoningEffort: "medium",
		}
		expect((0, api_1.shouldUseReasoningEffort)({ model })).toBe(true)
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings: {} })).toBe(true)
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings: { reasoningEffort: undefined } })).toBe(true)
	})
	test("should return false when enableReasoningEffort is false, even if reasoningEffort is set", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			supportsReasoningEffort: true,
		}
		const settings = {
			enableReasoningEffort: false,
			reasoningEffort: "medium",
		}
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings })).toBe(false)
	})
	test("should return false when enableReasoningEffort is false, even if model has reasoningEffort property", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			reasoningEffort: "medium",
		}
		const settings = {
			enableReasoningEffort: false,
		}
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings })).toBe(false)
	})
	test("should return true when model supports reasoning effort and settings provide reasoning effort", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			supportsReasoningEffort: true,
		}
		const settings = {
			reasoningEffort: "high",
		}
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings })).toBe(true)
	})
	test("should return false when model supports reasoning effort but settings don't provide reasoning effort", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			supportsReasoningEffort: true,
		}
		const settings = {
			reasoningEffort: undefined,
		}
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings })).toBe(false)
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings: {} })).toBe(false)
		expect((0, api_1.shouldUseReasoningEffort)({ model })).toBe(false)
	})
	test("should return false when model doesn't support reasoning effort and has no default", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
		}
		const settings = {
			reasoningEffort: "high",
		}
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings })).toBe(false)
		expect((0, api_1.shouldUseReasoningEffort)({ model })).toBe(false)
	})
	test("should handle different reasoning effort values", () => {
		const model = {
			contextWindow: 200_000,
			supportsPromptCache: true,
			supportsReasoningEffort: true,
		}
		const settingsLow = { reasoningEffort: "low" }
		const settingsMedium = { reasoningEffort: "medium" }
		const settingsHigh = { reasoningEffort: "high" }
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings: settingsLow })).toBe(true)
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings: settingsMedium })).toBe(true)
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings: settingsHigh })).toBe(true)
	})
	// New cases for extended capability surface
	test("array capability includes 'disable' with selection 'disable' -> false", () => {
		const model = {
			contextWindow: 100_000,
			supportsPromptCache: true,
			supportsReasoningEffort: ["disable", "low", "medium", "high"],
		}
		const settings = { enableReasoningEffort: true, reasoningEffort: "disable" }
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings })).toBe(false)
	})
	test("array capability includes 'none' with settings.reasoningEffort='none' -> true", () => {
		const model = {
			contextWindow: 100_000,
			supportsPromptCache: true,
			supportsReasoningEffort: ["none", "minimal", "low", "medium", "high"],
		}
		const settings = { enableReasoningEffort: true, reasoningEffort: "none" }
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings })).toBe(true)
	})
	test("array capability includes 'minimal' with settings.reasoningEffort='minimal' -> true", () => {
		const model = {
			contextWindow: 100_000,
			supportsPromptCache: true,
			supportsReasoningEffort: ["none", "minimal", "low", "medium", "high"],
		}
		const settings = { enableReasoningEffort: true, reasoningEffort: "minimal" }
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings })).toBe(true)
	})
	test("boolean true with 'none' and 'minimal' -> true", () => {
		const model = {
			contextWindow: 100_000,
			supportsPromptCache: true,
			supportsReasoningEffort: true,
		}
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings: { reasoningEffort: "none" } })).toBe(true)
		expect((0, api_1.shouldUseReasoningEffort)({ model, settings: { reasoningEffort: "minimal" } })).toBe(true)
	})
})
