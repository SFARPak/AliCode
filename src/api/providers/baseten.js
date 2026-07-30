"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.BasetenHandler = void 0
const types_1 = require("@ali-code/types")
const base_openai_compatible_provider_1 = require("./base-openai-compatible-provider")
class BasetenHandler extends base_openai_compatible_provider_1.BaseOpenAiCompatibleProvider {
	constructor(options) {
		super({
			...options,
			providerName: "Baseten",
			baseURL: "https://inference.baseten.co/v1",
			apiKey: options.basetenApiKey,
			defaultProviderModelId: types_1.basetenDefaultModelId,
			providerModels: types_1.basetenModels,
			defaultTemperature: 0.5,
		})
	}
}
exports.BasetenHandler = BasetenHandler
