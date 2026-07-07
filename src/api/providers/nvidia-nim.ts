import { type NvidiaNimModelId, nvidiaNimDefaultModelId, nvidiaNimModels } from "@ali-code/types"

import type { ApiHandlerOptions } from "../../shared/api"

import { BaseOpenAiCompatibleProvider } from "./base-openai-compatible-provider"

export class NvidiaNimHandler extends BaseOpenAiCompatibleProvider<NvidiaNimModelId> {
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
}
