import { Anthropic } from "@anthropic-ai/sdk"
import { type ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
export declare class PoeHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private poe
	constructor(options: ApiHandlerOptions)
	getModel(): {
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
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	completePrompt(prompt: string): Promise<string>
}
//# sourceMappingURL=poe.d.ts.map
