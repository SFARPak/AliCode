"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.PoeHandler = void 0
const ai_sdk_provider_poe_1 = require("ai-sdk-provider-poe")
const code_1 = require("ai-sdk-provider-poe/code")
const ai_1 = require("ai")
const types_1 = require("@ali-code/types")
const api_1 = require("../../shared/api")
const ai_sdk_1 = require("../transform/ai-sdk")
const base_provider_1 = require("./base-provider")
const modelCache_1 = require("./fetchers/modelCache")
const DEFAULT_THINKING_BUDGET = 8192
class PoeHandler extends base_provider_1.BaseProvider {
	options
	poe
	constructor(options) {
		super()
		this.options = options
		this.poe = (0, ai_sdk_provider_poe_1.createPoe)({
			apiKey: options.poeApiKey ?? "not-provided",
			baseURL: options.poeBaseUrl || undefined,
		})
	}
	getModel() {
		const id = this.options.apiModelId ?? types_1.poeDefaultModelId
		const cached = (0, modelCache_1.getModelsFromCache)("poe")
		const info = cached?.[id] ?? (0, types_1.getPoeDefaultModelInfo)()
		return { id, info }
	}
	async *createMessage(systemPrompt, messages, metadata) {
		const { id, info } = this.getModel()
		const languageModel = this.poe(id)
		const aiSdkMessages = (0, ai_sdk_1.convertToAiSdkMessages)(messages)
		const openAiTools = this.convertToolsForOpenAI(metadata?.tools)
		const aiSdkTools = (0, ai_sdk_1.convertToolsForAiSdk)(openAiTools)
		const useBudget = (0, api_1.shouldUseReasoningBudget)({ model: info, settings: this.options })
		const useEffort = !useBudget && (0, api_1.shouldUseReasoningEffort)({ model: info, settings: this.options })
		// Only pass temperature when the user explicitly configured it.
		let temperature = this.options.modelTemperature ?? undefined
		let maxOutputTokens
		const providerOptions = {}
		if (useBudget) {
			const requestedBudget = this.options.modelMaxThinkingTokens ?? DEFAULT_THINKING_BUDGET
			// maxOutputTokens is the text-only budget; reasoningBudgetTokens is
			// separate, so total output = maxOutputTokens + reasoningBudgetTokens.
			maxOutputTokens = this.options.modelMaxTokens ?? Math.max(0, (info.maxTokens ?? 0) - requestedBudget)
			providerOptions.poe = {
				reasoningBudgetTokens: requestedBudget,
			}
			temperature = 1.0
		} else if (useEffort) {
			let effort = this.options.reasoningEffort ?? info.reasoningEffort ?? "medium"
			// Validate that the effort level is actually supported by the current model
			const supportedEfforts = info.supportsReasoningEffort
			if (Array.isArray(supportedEfforts) && !supportedEfforts.includes(effort)) {
				effort = info.reasoningEffort ?? "medium"
			}
			providerOptions.poe = {
				reasoningEffort: effort,
				reasoningSummary: "auto",
			}
			if (this.options.modelMaxTokens) {
				maxOutputTokens = this.options.modelMaxTokens
			}
		}
		let result
		try {
			result = (0, ai_1.streamText)({
				model: languageModel,
				system: systemPrompt,
				messages: aiSdkMessages,
				temperature,
				maxOutputTokens,
				tools: aiSdkTools,
				toolChoice: (0, code_1.mapToolChoice)(metadata?.tool_choice),
				...(Object.keys(providerOptions).length > 0 && { providerOptions }),
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			throw new Error(`Poe completion error: ${errorMessage}`)
		}
		try {
			for await (const part of result.fullStream) {
				for (const chunk of (0, ai_sdk_1.processAiSdkStreamPart)(part)) {
					yield chunk
				}
			}
			const usage = await result.usage
			if (usage) {
				const metrics = (0, code_1.extractUsageMetrics)(usage)
				yield {
					type: "usage",
					inputTokens: metrics.inputTokens,
					outputTokens: metrics.outputTokens,
					cacheReadTokens: metrics.cacheReadTokens,
					cacheWriteTokens: metrics.cacheWriteTokens,
					reasoningTokens: metrics.reasoningTokens,
				}
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			throw new Error(`Poe streaming error: ${errorMessage}`)
		}
	}
	async completePrompt(prompt) {
		const { id } = this.getModel()
		try {
			const { text } = await (0, ai_1.generateText)({
				model: this.poe(id),
				prompt,
			})
			return text
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			throw new Error(`Poe completion error: ${errorMessage}`)
		}
	}
}
exports.PoeHandler = PoeHandler
