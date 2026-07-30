"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.MoonshotHandler = void 0
const types_1 = require("@ali-code/types")
const model_params_1 = require("../transform/model-params")
const openai_compatible_1 = require("./openai-compatible")
class MoonshotHandler extends openai_compatible_1.OpenAICompatibleHandler {
	constructor(options) {
		const modelId = options.apiModelId ?? types_1.moonshotDefaultModelId
		const modelInfo = types_1.moonshotModels[modelId] || types_1.moonshotModels[types_1.moonshotDefaultModelId]
		const config = {
			providerName: "moonshot",
			baseURL: options.moonshotBaseUrl || "https://api.moonshot.ai/v1",
			apiKey: options.moonshotApiKey ?? "not-provided",
			modelId,
			modelInfo,
			modelMaxTokens: options.modelMaxTokens ?? undefined,
			temperature: options.modelTemperature ?? undefined,
		}
		super(options, config)
	}
	getModel() {
		const id = this.options.apiModelId ?? types_1.moonshotDefaultModelId
		const info = types_1.moonshotModels[id] || types_1.moonshotModels[types_1.moonshotDefaultModelId]
		const params = (0, model_params_1.getModelParams)({
			format: "openai",
			modelId: id,
			model: info,
			settings: this.options,
			defaultTemperature: 0,
		})
		return { id, info, ...params }
	}
	/**
	 * Override to handle Moonshot's usage metrics, including caching.
	 * Moonshot returns cached_tokens in a different location than standard OpenAI.
	 */
	processUsageMetrics(usage) {
		// Moonshot uses cached_tokens at the top level of raw usage data
		const rawUsage = usage.raw
		return {
			type: "usage",
			inputTokens: usage.inputTokens || 0,
			outputTokens: usage.outputTokens || 0,
			cacheWriteTokens: 0,
			cacheReadTokens: rawUsage?.cached_tokens ?? usage.details?.cachedInputTokens,
		}
	}
	/**
	 * Override to always include max_tokens for Moonshot (not max_completion_tokens).
	 * Moonshot requires max_tokens parameter to be sent.
	 */
	getMaxOutputTokens() {
		const modelInfo = this.config.modelInfo
		// Moonshot always requires max_tokens
		return this.options.modelMaxTokens || modelInfo.maxTokens || undefined
	}
}
exports.MoonshotHandler = MoonshotHandler
