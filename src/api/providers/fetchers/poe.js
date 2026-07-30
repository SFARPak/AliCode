"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.getPoeModels = getPoeModels
const code_1 = require("ai-sdk-provider-poe/code")
async function getPoeModels(apiKey, baseURL) {
	try {
		// fetchPoeModels populates the internal model store, then getModels()
		// returns only code-capable models with camelCase fields.
		await (0, code_1.fetchPoeModels)({ apiKey, baseURL })
		const poeModels = (0, code_1.getModels)()
		const models = {}
		for (const m of poeModels) {
			// The library's applyReasoningFallbacks workaround sets
			// supportsReasoningEffort to boolean `true` for any model that
			// supports /v1/responses, even when the model has no actual
			// reasoning capability (e.g. Haiku 3/3.5). Only trust the value
			// when it is an explicit array of effort levels.
			const effort = Array.isArray(m.supportsReasoningEffort) ? m.supportsReasoningEffort : undefined
			const info = {
				contextWindow: m.contextWindow,
				maxTokens: m.maxOutputTokens,
				supportsImages: m.supportsImages,
				supportsPromptCache: m.supportsPromptCache,
				...(m.supportsReasoningBudget && { supportsReasoningBudget: m.supportsReasoningBudget }),
				...(effort && {
					supportsReasoningEffort: effort,
				}),
				...(m.pricing?.inputPerMillion != null && { inputPrice: m.pricing.inputPerMillion }),
				...(m.pricing?.outputPerMillion != null && { outputPrice: m.pricing.outputPerMillion }),
				...(m.pricing?.cacheReadPerMillion != null && { cacheReadsPrice: m.pricing.cacheReadPerMillion }),
				...(m.pricing?.cacheWritePerMillion != null && { cacheWritesPrice: m.pricing.cacheWritePerMillion }),
			}
			models[m.id] = info
		}
		return models
	} catch (error) {
		console.error(`[Poe] Error fetching models: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`)
		return {}
	}
}
