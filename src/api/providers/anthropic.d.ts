import { Anthropic } from "@anthropic-ai/sdk"
import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
export declare class AnthropicHandler extends BaseProvider implements SingleCompletionHandler {
	private options
	private client
	private readonly providerName
	constructor(options: ApiHandlerOptions)
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	getModel(): {
		format: "anthropic"
		reasoning: import("../transform/reasoning").AnthropicReasoningParams | undefined
		maxTokens: number | undefined
		temperature: number | undefined
		reasoningEffort: import("@ali-code/types").ReasoningEffortExtended | undefined
		reasoningBudget: number | undefined
		verbosity: import("@ali-code/types").VerbosityLevel | undefined
		tools?: boolean
		id:
			| "claude-sonnet-4-6"
			| "claude-sonnet-4-5"
			| "claude-sonnet-4-20250514"
			| "claude-opus-4-6"
			| "claude-opus-4-5-20251101"
			| "claude-opus-4-1-20250805"
			| "claude-opus-4-20250514"
			| "claude-3-7-sonnet-20250219"
			| "claude-3-5-sonnet-20241022"
			| "claude-3-5-haiku-20241022"
			| "claude-3-opus-20240229"
			| "claude-3-haiku-20240307"
			| "claude-haiku-4-5-20251001"
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
		betas: string[] | undefined
	}
	completePrompt(prompt: string): Promise<string>
}
//# sourceMappingURL=anthropic.d.ts.map
