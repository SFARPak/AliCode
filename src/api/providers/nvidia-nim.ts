import { type NvidiaNimModelId, nvidiaNimDefaultModelId, nvidiaNimModels } from "@ali-code/types"

import type { ApiHandlerOptions } from "../../shared/api"

import { BaseOpenAiCompatibleProvider } from "./base-openai-compatible-provider"

export class NvidiaNimHandler extends BaseOpenAiCompatibleProvider<NvidiaNimModelId> {
	/**
	 * NVIDIA NIM provider supports the full catalog of model identifiers.
	 * It forwards the model name from the request payload directly to the NVIDIA endpoint.
	 */
	constructor(options: ApiHandlerOptions) {
		super({
			...options,
			providerName: "NVIDIA NIM",
			baseURL: options.nvidiaNimBaseUrl || "https://integrate.api.nvidia.com/v1",
			apiKey: options.nvidiaNimApiKey ?? "not-provided",
			defaultProviderModelId: nvidiaNimDefaultModelId,
			providerModels: nvidiaNimModels,
			defaultTemperature: 0,
		})
	}

	/**
	 * Override model resolution to allow any model identifier.
	 * If an explicit apiModelId is provided, it is used verbatim, bypassing the predefined list.
	 */
	override getModel() {
		const id = (this.options.apiModelId as string) || (this.defaultProviderModelId as string)
		// Return a generic ModelInfo shape if the model is not in the known list.
		const info = (this.providerModels as Record<string, any>)[id] || {}
		return { id, info }
	}
}
