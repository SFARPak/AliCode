import {
	type ModelInfo,
	type ProviderSettings,
	type VerbosityLevel,
	type ReasoningEffortExtended,
} from "@ali-code/types"
import {
	type AnthropicReasoningParams,
	type OpenAiReasoningParams,
	type GeminiReasoningParams,
	type OpenRouterReasoningParams,
} from "./reasoning"
type Format = "anthropic" | "openai" | "gemini" | "openrouter"
type GetModelParamsOptions<T extends Format> = {
	format: T
	modelId: string
	model: ModelInfo
	settings: ProviderSettings
	defaultTemperature: number
}
type BaseModelParams = {
	maxTokens: number | undefined
	temperature: number | undefined
	reasoningEffort: ReasoningEffortExtended | undefined
	reasoningBudget: number | undefined
	verbosity: VerbosityLevel | undefined
	tools?: boolean
}
type AnthropicModelParams = {
	format: "anthropic"
	reasoning: AnthropicReasoningParams | undefined
} & BaseModelParams
type OpenAiModelParams = {
	format: "openai"
	reasoning: OpenAiReasoningParams | undefined
} & BaseModelParams
type GeminiModelParams = {
	format: "gemini"
	reasoning: GeminiReasoningParams | undefined
} & BaseModelParams
type OpenRouterModelParams = {
	format: "openrouter"
	reasoning: OpenRouterReasoningParams | undefined
} & BaseModelParams
export type ModelParams = AnthropicModelParams | OpenAiModelParams | GeminiModelParams | OpenRouterModelParams
export declare function getModelParams(options: GetModelParamsOptions<"anthropic">): AnthropicModelParams
export declare function getModelParams(options: GetModelParamsOptions<"openai">): OpenAiModelParams
export declare function getModelParams(options: GetModelParamsOptions<"gemini">): GeminiModelParams
export declare function getModelParams(options: GetModelParamsOptions<"openrouter">): OpenRouterModelParams
export {}
//# sourceMappingURL=model-params.d.ts.map
