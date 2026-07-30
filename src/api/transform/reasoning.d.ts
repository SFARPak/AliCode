import { BetaThinkingConfigParam } from "@anthropic-ai/sdk/resources/beta"
import OpenAI from "openai"
import type { GenerateContentConfig } from "@google/genai"
import type { ModelInfo, ProviderSettings, ReasoningEffortExtended } from "@ali-code/types"
export type OpenRouterReasoningParams = {
	effort?: ReasoningEffortExtended
	max_tokens?: number
	exclude?: boolean
}
export type AliReasoningParams = {
	enabled?: boolean
	effort?: ReasoningEffortExtended
}
export type AnthropicReasoningParams = BetaThinkingConfigParam
export type OpenAiReasoningParams = {
	reasoning_effort: OpenAI.Chat.ChatCompletionCreateParams["reasoning_effort"]
}
declare const GEMINI_THINKING_LEVELS: readonly ["minimal", "low", "medium", "high"]
export type GeminiThinkingLevel = (typeof GEMINI_THINKING_LEVELS)[number]
export declare function isGeminiThinkingLevel(value: unknown): value is GeminiThinkingLevel
export type GeminiReasoningParams = GenerateContentConfig["thinkingConfig"] & {
	thinkingLevel?: GeminiThinkingLevel
}
export type GetModelReasoningOptions = {
	model: ModelInfo
	reasoningBudget: number | undefined
	reasoningEffort: ReasoningEffortExtended | "disable" | undefined
	settings: ProviderSettings
}
export declare const getOpenRouterReasoning: ({
	model,
	reasoningBudget,
	reasoningEffort,
	settings,
}: GetModelReasoningOptions) => OpenRouterReasoningParams | undefined
export declare const getAliReasoning: ({
	model,
	reasoningEffort,
	settings,
}: GetModelReasoningOptions) => AliReasoningParams | undefined
export declare const getAnthropicReasoning: ({
	model,
	reasoningBudget,
	settings,
}: GetModelReasoningOptions) => AnthropicReasoningParams | undefined
export declare const getOpenAiReasoning: ({
	model,
	reasoningEffort,
	settings,
}: GetModelReasoningOptions) => OpenAiReasoningParams | undefined
export declare const getGeminiReasoning: ({
	model,
	reasoningBudget,
	reasoningEffort,
	settings,
}: GetModelReasoningOptions) => GeminiReasoningParams | undefined
export {}
//# sourceMappingURL=reasoning.d.ts.map
