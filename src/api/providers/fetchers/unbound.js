"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.getUnboundModels = getUnboundModels
const axios_1 = __importDefault(require("axios"))
const cost_1 = require("../../../shared/cost")
async function getUnboundModels(apiKey) {
	const models = {}
	try {
		const headers = {}
		if (apiKey) {
			headers["Authorization"] = `Bearer ${apiKey}`
		}
		const response = await axios_1.default.get("https://api.getunbound.ai/models", { headers })
		const rawModels = response.data?.data ?? response.data
		for (const rawModel of rawModels) {
			const modelInfo = {
				maxTokens: rawModel.max_output_tokens ?? 8192,
				contextWindow: rawModel.context_window ?? 200_000,
				supportsPromptCache: rawModel.supports_caching ?? false,
				supportsImages: rawModel.supports_vision ?? false,
				inputPrice: (0, cost_1.parseApiPrice)(rawModel.input_price),
				outputPrice: (0, cost_1.parseApiPrice)(rawModel.output_price),
				description: rawModel.description,
				cacheWritesPrice: (0, cost_1.parseApiPrice)(rawModel.caching_price),
				cacheReadsPrice: (0, cost_1.parseApiPrice)(rawModel.cached_price),
			}
			models[rawModel.id] = modelInfo
		}
	} catch (error) {
		console.error(`Error fetching Unbound models: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`)
	}
	return models
}
