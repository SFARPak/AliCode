"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.SambaNovaHandler = void 0
const types_1 = require("@ali-code/types")
const base_openai_compatible_provider_1 = require("./base-openai-compatible-provider")
class SambaNovaHandler extends base_openai_compatible_provider_1.BaseOpenAiCompatibleProvider {
	constructor(options) {
		super({
			...options,
			providerName: "SambaNova",
			baseURL: "https://api.sambanova.ai/v1",
			apiKey: options.sambaNovaApiKey,
			defaultProviderModelId: types_1.sambaNovaDefaultModelId,
			providerModels: types_1.sambaNovaModels,
			defaultTemperature: 0.7,
		})
	}
}
exports.SambaNovaHandler = SambaNovaHandler
