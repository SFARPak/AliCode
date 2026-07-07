type ApiHandlerOptions = { nvidiaNimApiKey?: string; apiKey?: string; nvidiaNimBaseUrl?: string }

type ModelInfo = { maxTokens: number }
type BaseOpenAiCompatibleProviderOptions<ModelName extends string> = ApiHandlerOptions & {
	providerName: string
	baseURL: string
	defaultProviderModelId: ModelName
	providerModels: Record<ModelName, ModelInfo>
	defaultTemperature?: number
}

class BaseOpenAiCompatibleProvider<ModelName extends string> {
	options: ApiHandlerOptions
	constructor({
		providerName,
		baseURL,
		defaultProviderModelId,
		providerModels,
		defaultTemperature,
		...options
	}: BaseOpenAiCompatibleProviderOptions<ModelName>) {
		this.options = options
		console.log("apiKey in options:", this.options.apiKey)
		console.log("options:", this.options)
	}
}

class NvidiaNimHandler extends BaseOpenAiCompatibleProvider<string> {
	constructor(options: ApiHandlerOptions) {
		super({
			...options,
			providerName: "NVIDIA NIM",
			baseURL: options.nvidiaNimBaseUrl || "https://integrate.api.nvidia.com/v1",
			apiKey: options.nvidiaNimApiKey ?? "not-provided",
			defaultProviderModelId: "default",
			providerModels: {},
			defaultTemperature: 0,
		})
	}
}

new NvidiaNimHandler({ nvidiaNimApiKey: "my-nvidia-key" })
