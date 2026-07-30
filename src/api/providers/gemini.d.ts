import type { Anthropic } from "@anthropic-ai/sdk"
import { type ModelInfo } from "@ali-code/types"
import type { ApiHandlerOptions } from "../../shared/api"
import type { ApiStream } from "../transform/stream"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { BaseProvider } from "./base-provider"
type GeminiHandlerOptions = ApiHandlerOptions & {
	isVertex?: boolean
}
export declare class GeminiHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private client
	private lastThoughtSignature?
	private lastResponseId?
	private readonly providerName
	constructor({ isVertex, ...options }: GeminiHandlerOptions)
	createMessage(
		systemInstruction: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	getModel(): {
		format: "gemini"
		reasoning: import("../transform/reasoning").GeminiReasoningParams | undefined
		maxTokens: number | undefined
		temperature: number | undefined
		reasoningEffort: import("@ali-code/types").ReasoningEffortExtended | undefined
		reasoningBudget: number | undefined
		verbosity: import("@ali-code/types").VerbosityLevel | undefined
		tools?: boolean
		id: string
		info: {
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
	}
	private extractGroundingSources
	private extractCitationsOnly
	completePrompt(prompt: string): Promise<string>
	getThoughtSignature(): string | undefined
	getResponseId(): string | undefined
	calculateCost({
		info,
		inputTokens,
		outputTokens,
		cacheReadTokens,
		reasoningTokens,
	}: {
		info: ModelInfo
		inputTokens: number
		outputTokens: number
		cacheReadTokens?: number
		reasoningTokens?: number
	}): number | undefined
}
export {}
//# sourceMappingURL=gemini.d.ts.map
