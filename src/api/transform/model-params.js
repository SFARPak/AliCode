"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.getModelParams = getModelParams
const api_1 = require("../../shared/api")
const reasoning_1 = require("./reasoning")
function getModelParams({ format, modelId, model, settings, defaultTemperature }) {
	const {
		modelMaxTokens: customMaxTokens,
		modelMaxThinkingTokens: customMaxThinkingTokens,
		modelTemperature: customTemperature,
		reasoningEffort: customReasoningEffort,
		verbosity: customVerbosity,
	} = settings
	// Use the centralized logic for computing maxTokens
	const maxTokens = (0, api_1.getModelMaxOutputTokens)({
		modelId,
		model,
		settings,
		format,
	})
	let temperature = customTemperature ?? model.defaultTemperature ?? defaultTemperature
	let reasoningBudget = undefined
	let reasoningEffort = undefined
	let verbosity = customVerbosity
	if ((0, api_1.shouldUseReasoningBudget)({ model, settings })) {
		// Check if this is a Gemini 2.5 Pro model
		const isGemini25Pro = modelId.includes("gemini-2.5-pro")
		// If `customMaxThinkingTokens` is not specified use the default.
		// For Gemini 2.5 Pro, default to 128 instead of 8192
		const defaultThinkingTokens = isGemini25Pro
			? api_1.GEMINI_25_PRO_MIN_THINKING_TOKENS
			: api_1.DEFAULT_HYBRID_REASONING_MODEL_THINKING_TOKENS
		reasoningBudget = customMaxThinkingTokens ?? defaultThinkingTokens
		// Reasoning cannot exceed 80% of the `maxTokens` value.
		// maxTokens should always be defined for reasoning budget models, but add a guard just in case
		if (maxTokens && reasoningBudget > Math.floor(maxTokens * 0.8)) {
			reasoningBudget = Math.floor(maxTokens * 0.8)
		}
		// Reasoning cannot be less than minimum tokens.
		// For Gemini 2.5 Pro models, the minimum is 128 tokens
		// For other models, the minimum is 1024 tokens
		const minThinkingTokens = isGemini25Pro ? api_1.GEMINI_25_PRO_MIN_THINKING_TOKENS : 1024
		if (reasoningBudget < minThinkingTokens) {
			reasoningBudget = minThinkingTokens
		}
		// Let's assume that "Hybrid" reasoning models require a temperature of
		// 1.0 since Anthropic does.
		temperature = 1.0
	} else if ((0, api_1.shouldUseReasoningEffort)({ model, settings })) {
		// "Traditional" reasoning models use the `reasoningEffort` parameter.
		// Only fallback to model default if user hasn't explicitly set a value.
		// If customReasoningEffort is "disable", don't fallback to model default.
		const effort = customReasoningEffort !== undefined ? customReasoningEffort : model.reasoningEffort
		// Capability and settings checks are handled by shouldUseReasoningEffort.
		// Here we simply propagate the resolved effort into the params, while
		// still treating "disable" as an omission.
		if (effort && effort !== "disable") {
			reasoningEffort = effort
		}
	}
	const params = { maxTokens, temperature, reasoningEffort, reasoningBudget, verbosity }
	if (format === "anthropic") {
		return {
			format,
			...params,
			reasoning: (0, reasoning_1.getAnthropicReasoning)({ model, reasoningBudget, reasoningEffort, settings }),
		}
	} else if (format === "openai") {
		// Special case for o1 and o3-mini, which don't support temperature.
		// TODO: Add a `supportsTemperature` field to the model info.
		if (modelId.startsWith("o1") || modelId.startsWith("o3-mini")) {
			params.temperature = undefined
		}
		return {
			format,
			...params,
			reasoning: (0, reasoning_1.getOpenAiReasoning)({ model, reasoningBudget, reasoningEffort, settings }),
			// Whether tools are included is determined by whether the caller provided tool definitions.
		}
	} else if (format === "gemini") {
		return {
			format,
			...params,
			reasoning: (0, reasoning_1.getGeminiReasoning)({ model, reasoningBudget, reasoningEffort, settings }),
		}
	} else {
		// Special case for o1-pro, which doesn't support temperature.
		// Note that OpenRouter's `supported_parameters` field includes
		// `temperature`, which is probably a bug.
		// TODO: Add a `supportsTemperature` field to the model info and populate
		// it appropriately in the OpenRouter fetcher.
		if (modelId === "openai/o1-pro") {
			params.temperature = undefined
		}
		return {
			format,
			...params,
			reasoning: (0, reasoning_1.getOpenRouterReasoning)({ model, reasoningBudget, reasoningEffort, settings }),
		}
	}
}
