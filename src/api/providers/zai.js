"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.ZAiHandler = void 0
const types_1 = require("@ali-code/types")
const api_1 = require("../../shared/api")
const zai_format_1 = require("../transform/zai-format")
const base_openai_compatible_provider_1 = require("./base-openai-compatible-provider")
class ZAiHandler extends base_openai_compatible_provider_1.BaseOpenAiCompatibleProvider {
	constructor(options) {
		const isChina = types_1.zaiApiLineConfigs[options.zaiApiLine ?? "international_coding"].isChina
		const models = isChina ? types_1.mainlandZAiModels : types_1.internationalZAiModels
		const defaultModelId = isChina ? types_1.mainlandZAiDefaultModelId : types_1.internationalZAiDefaultModelId
		super({
			...options,
			providerName: "Z.ai",
			baseURL: types_1.zaiApiLineConfigs[options.zaiApiLine ?? "international_coding"].baseUrl,
			apiKey: options.zaiApiKey ?? "not-provided",
			defaultProviderModelId: defaultModelId,
			providerModels: models,
			defaultTemperature: types_1.ZAI_DEFAULT_TEMPERATURE,
		})
	}
	/**
	 * Override createStream to handle GLM-4.7's thinking mode.
	 * GLM-4.7 has thinking enabled by default in the API, so we need to
	 * explicitly send { type: "disabled" } when the user turns off reasoning.
	 */
	createStream(systemPrompt, messages, metadata, requestOptions) {
		const { id: modelId, info } = this.getModel()
		// Check if this is a model with thinking support (e.g. GLM-4.7, GLM-5)
		const isThinkingModel = Array.isArray(info.supportsReasoningEffort)
		if (isThinkingModel) {
			// For GLM-4.7, thinking is ON by default in the API.
			// We need to explicitly disable it when reasoning is off.
			const useReasoning = (0, api_1.shouldUseReasoningEffort)({ model: info, settings: this.options })
			// Create the stream with our custom thinking parameter
			return this.createStreamWithThinking(systemPrompt, messages, metadata, useReasoning)
		}
		// For non-thinking models, use the default behavior
		return super.createStream(systemPrompt, messages, metadata, requestOptions)
	}
	/**
	 * Creates a stream with explicit thinking control for GLM-4.7
	 */
	createStreamWithThinking(systemPrompt, messages, metadata, useReasoning) {
		const { id: model, info } = this.getModel()
		const max_tokens =
			(0, api_1.getModelMaxOutputTokens)({
				modelId: model,
				model: info,
				settings: this.options,
				format: "openai",
			}) ?? undefined
		const temperature = this.options.modelTemperature ?? this.defaultTemperature
		// Use Z.ai format to preserve reasoning_content and merge post-tool text into tool messages
		const convertedMessages = (0, zai_format_1.convertToZAiFormat)(messages, { mergeToolResultText: true })
		const params = {
			model,
			max_tokens,
			temperature,
			messages: [{ role: "system", content: systemPrompt }, ...convertedMessages],
			stream: true,
			stream_options: { include_usage: true },
			// For GLM-4.7: thinking is ON by default, so we explicitly disable when needed
			thinking: useReasoning ? { type: "enabled" } : { type: "disabled" },
			tools: this.convertToolsForOpenAI(metadata?.tools),
			tool_choice: metadata?.tool_choice,
			parallel_tool_calls: metadata?.parallelToolCalls ?? true,
		}
		return this.client.chat.completions.create(params)
	}
}
exports.ZAiHandler = ZAiHandler
