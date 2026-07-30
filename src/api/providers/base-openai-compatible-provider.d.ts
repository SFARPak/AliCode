import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import type { ModelInfo } from "@ali-code/types"
import { type ApiHandlerOptions } from "../../shared/api"
import { ApiStream, ApiStreamUsageChunk } from "../transform/stream"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { BaseProvider } from "./base-provider"
type BaseOpenAiCompatibleProviderOptions<ModelName extends string> = ApiHandlerOptions & {
	providerName: string
	baseURL: string
	defaultProviderModelId: ModelName
	providerModels: Record<ModelName, ModelInfo>
	defaultTemperature?: number
}
export declare abstract class BaseOpenAiCompatibleProvider<ModelName extends string>
	extends BaseProvider
	implements SingleCompletionHandler
{
	protected readonly providerName: string
	protected readonly baseURL: string
	protected readonly defaultTemperature: number
	protected readonly defaultProviderModelId: ModelName
	protected readonly providerModels: Record<ModelName, ModelInfo>
	protected readonly options: ApiHandlerOptions
	protected client: OpenAI
	constructor({
		providerName,
		baseURL,
		defaultProviderModelId,
		providerModels,
		defaultTemperature,
		...options
	}: BaseOpenAiCompatibleProviderOptions<ModelName>)
	protected createStream(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
		requestOptions?: OpenAI.RequestOptions,
	): import("openai").APIPromise<
		import("openai/core/streaming.js").Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
	>
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	protected processUsageMetrics(usage: any, modelInfo?: any): ApiStreamUsageChunk
	completePrompt(prompt: string): Promise<string>
	getModel(): {
		id: ModelName
		info: Record<
			ModelName,
			{
				contextWindow: number
				supportsPromptCache: boolean
				maxTokens?: number | null | undefined
				maxThinkingTokens?: number | null | undefined
				supportsImages?: boolean | undefined
				promptCacheRetention?: "in_memory" | "24h" | undefined
				supportsVerbosity?: boolean | undefined
				supportsReasoningBudget?: boolean | undefined
				supportsReasoningBinary?: boolean | undefined
				supportsTemperature?: boolean | undefined
				defaultTemperature?: number | undefined
				requiredReasoningBudget?: boolean | undefined
				supportsReasoningEffort?:
					| boolean
					| ("disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh")[]
					| undefined
				requiredReasoningEffort?: boolean | undefined
				preserveReasoning?: boolean | undefined
				supportedParameters?: ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[] | undefined
				inputPrice?: number | undefined
				outputPrice?: number | undefined
				cacheWritesPrice?: number | undefined
				cacheReadsPrice?: number | undefined
				longContextPricing?:
					| {
							thresholdTokens: number
							inputPriceMultiplier?: number | undefined
							outputPriceMultiplier?: number | undefined
							cacheWritesPriceMultiplier?: number | undefined
							cacheReadsPriceMultiplier?: number | undefined
							appliesToServiceTiers?: ("default" | "flex" | "priority")[] | undefined
					  }
					| undefined
				description?: string | undefined
				reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				minTokensPerCachePoint?: number | undefined
				maxCachePoints?: number | undefined
				cachableFields?: string[] | undefined
				deprecated?: boolean | undefined
				isStealthModel?: boolean | undefined
				isFree?: boolean | undefined
				excludedTools?: string[] | undefined
				includedTools?: string[] | undefined
				tiers?:
					| {
							contextWindow: number
							inputPrice?: number | undefined
							outputPrice?: number | undefined
							cacheWritesPrice?: number | undefined
							cacheReadsPrice?: number | undefined
							name?: "default" | "flex" | "priority" | undefined
					  }[]
					| undefined
			}
		>[ModelName]
	}
}
export {}
//# sourceMappingURL=base-openai-compatible-provider.d.ts.map
