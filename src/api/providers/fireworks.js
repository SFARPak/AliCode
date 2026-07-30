"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.FireworksHandler = void 0
const types_1 = require("@ali-code/types")
const base_openai_compatible_provider_1 = require("./base-openai-compatible-provider")
class FireworksHandler extends base_openai_compatible_provider_1.BaseOpenAiCompatibleProvider {
	constructor(options) {
		super({
			...options,
			providerName: "Fireworks",
			baseURL: "https://api.fireworks.ai/inference/v1",
			apiKey: options.fireworksApiKey,
			defaultProviderModelId: types_1.fireworksDefaultModelId,
			providerModels: types_1.fireworksModels,
			defaultTemperature: 0.5,
		})
	}
}
exports.FireworksHandler = FireworksHandler
