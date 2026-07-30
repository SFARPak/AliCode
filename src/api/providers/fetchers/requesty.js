"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.getRequestyModels = getRequestyModels
const axios_1 = __importDefault(require("axios"))
const cost_1 = require("../../../shared/cost")
const requesty_1 = require("../../../shared/utils/requesty")
async function getRequestyModels(baseUrl, apiKey) {
	const models = {}
	try {
		const headers = {}
		if (apiKey) {
			headers["Authorization"] = `Bearer ${apiKey}`
		}
		const resolvedBaseUrl = (0, requesty_1.toRequestyServiceUrl)(baseUrl)
		const modelsUrl = new URL("v1/models", resolvedBaseUrl)
		const response = await axios_1.default.get(modelsUrl.toString(), { headers })
		const rawModels = response.data.data
		for (const rawModel of rawModels) {
			const reasoningBudget =
				rawModel.supports_reasoning &&
				(rawModel.id.includes("claude") ||
					rawModel.id.includes("coding/gemini-2.5") ||
					rawModel.id.includes("vertex/gemini-2.5"))
			const reasoningEffort =
				rawModel.supports_reasoning &&
				(rawModel.id.includes("openai") || rawModel.id.includes("google/gemini-2.5"))
			const modelInfo = {
				maxTokens: rawModel.max_output_tokens,
				contextWindow: rawModel.context_window,
				supportsPromptCache: rawModel.supports_caching,
				supportsImages: rawModel.supports_vision,
				supportsReasoningBudget: reasoningBudget,
				supportsReasoningEffort: reasoningEffort,
				inputPrice: (0, cost_1.parseApiPrice)(rawModel.input_price),
				outputPrice: (0, cost_1.parseApiPrice)(rawModel.output_price),
				description: rawModel.description,
				cacheWritesPrice: (0, cost_1.parseApiPrice)(rawModel.caching_price),
				cacheReadsPrice: (0, cost_1.parseApiPrice)(rawModel.cached_price),
			}
			models[rawModel.id] = modelInfo
		}
	} catch (error) {
		console.error(`Error fetching Requesty models: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`)
	}
	return models
}
