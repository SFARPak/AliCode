import { type ModelInfo, type ProviderSettings, type DynamicProvider, type LocalProvider } from "@ali-code/types"
export type ApiHandlerOptions = Omit<ProviderSettings, "apiProvider"> & {
	/**
	 * When true and using OpenAI Responses API models that support reasoning summaries,
	 * include reasoning.summary: "auto" so the API returns summaries (we already parse
	 * and surface them). Defaults to true; set to false to disable summaries.
	 */
	enableResponsesReasoningSummary?: boolean
	/**
	 * Optional override for Ollama's num_ctx parameter.
	 * When set, this value will be used in Ollama chat requests.
	 * When undefined, Ollama will use the model's default num_ctx from the Modelfile.
	 */
	ollamaNumCtx?: number
}
export type RouterName = DynamicProvider | LocalProvider
export declare const isRouterName: (value: string) => value is RouterName
export declare function toRouterName(value?: string): RouterName
export declare const shouldUseReasoningBudget: ({
	model,
	settings,
}: {
	model: ModelInfo
	settings?: ProviderSettings
}) => boolean
export declare const shouldUseReasoningEffort: ({
	model,
	settings,
}: {
	model: ModelInfo
	settings?: ProviderSettings
}) => boolean
export declare const DEFAULT_HYBRID_REASONING_MODEL_MAX_TOKENS = 16384
export declare const DEFAULT_HYBRID_REASONING_MODEL_THINKING_TOKENS = 8192
export declare const GEMINI_25_PRO_MIN_THINKING_TOKENS = 128
export declare const getModelMaxOutputTokens: ({
	modelId,
	model,
	settings,
	format,
}: {
	modelId: string
	model: ModelInfo
	settings?: ProviderSettings
	format?: "anthropic" | "openai" | "gemini" | "openrouter"
}) => number | undefined
type CommonFetchParams = {
	apiKey?: string
	baseUrl?: string
}
declare const dynamicProviderExtras: {
	readonly openrouter: {}
	readonly "vercel-ai-gateway": {}
	readonly litellm: {
		apiKey: string
		baseUrl: string
	}
	readonly requesty: {
		apiKey?: string
		baseUrl?: string
	}
	readonly unbound: {
		apiKey?: string
	}
	readonly ollama: {}
	readonly lmstudio: {}
	readonly poe: {
		apiKey?: string
		baseUrl?: string
	}
}
export type GetModelsOptions = {
	[P in keyof typeof dynamicProviderExtras]: ({
		provider: P
	} & (typeof dynamicProviderExtras)[P]) &
		CommonFetchParams
}[RouterName]
export {}
//# sourceMappingURL=api.d.ts.map
