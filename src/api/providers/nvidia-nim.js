"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.NvidiaNimHandler = void 0
const types_1 = require("@ali-code/types")
const base_openai_compatible_provider_1 = require("./base-openai-compatible-provider")
class NvidiaNimHandler extends base_openai_compatible_provider_1.BaseOpenAiCompatibleProvider {
	/**
	 * NVIDIA NIM provider supports the full catalog of model identifiers.
	 * It forwards the model name from the request payload directly to the NVIDIA endpoint.
	 */
	constructor(options) {
		super({
			...options,
			providerName: "NVIDIA NIM",
			baseURL: options.nvidiaNimBaseUrl || "https://integrate.api.nvidia.com/v1",
			apiKey: options.nvidiaNimApiKey ?? "not-provided",
			defaultProviderModelId: types_1.nvidiaNimDefaultModelId,
			providerModels: types_1.nvidiaNimModels,
			defaultTemperature: 0,
		})
	}
	/**
	 * Override model resolution to allow any model identifier.
	 * If an explicit apiModelId is provided, it is used verbatim, bypassing the predefined list.
	 */
	getModel() {
		const id = this.options.apiModelId || this.defaultProviderModelId
		// Return a generic ModelInfo shape if the model is not in the known list.
		const info = this.providerModels[id] || {}
		return { id, info }
	}
}
exports.NvidiaNimHandler = NvidiaNimHandler
