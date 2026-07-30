import { Anthropic } from "@anthropic-ai/sdk"
import { type ReasoningEffortExtended } from "@ali-code/types"
import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
export type OpenAiCodexModel = ReturnType<OpenAiCodexHandler["getModel"]>
/**
 * OpenAiCodexHandler - Uses OpenAI Responses API with OAuth authentication
 *
 * Key differences from OpenAiNativeHandler:
 * - Uses OAuth Bearer tokens instead of API keys
 * - Routes requests to Codex backend (chatgpt.com/backend-api/codex)
 * - Subscription-based pricing (no per-token costs)
 * - Limited model subset
 * - Custom headers for Codex backend
 */
export declare class OpenAiCodexHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private readonly providerName
	private client?
	private lastResponseOutput
	private lastResponseId
	private abortController?
	private readonly sessionId
	/**
	 * Some Codex/Responses streams emit tool-call argument deltas without stable call id/name.
	 * Track the last observed tool identity from output_item events so we can still
	 * emit `tool_call_partial` chunks (tool-call-only streams).
	 */
	private pendingToolCallId
	private pendingToolCallName
	private sawTextOutputInCurrentResponse
	private sawTextDeltaInCurrentResponse
	private streamedToolCallIds
	private readonly coreHandledEventTypes
	constructor(options: ApiHandlerOptions)
	private normalizeUsage
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	private handleResponsesApiMessage
	private buildRequestBody
	private executeRequest
	private formatFullConversation
	private makeCodexRequest
	private handleStreamResponse
	private processEvent
	private getReasoningEffort
	getModel(): {
		format: "openai"
		reasoning: import("../transform/reasoning").OpenAiReasoningParams | undefined
		maxTokens: number | undefined
		temperature: number | undefined
		reasoningEffort: ReasoningEffortExtended | undefined
		reasoningBudget: number | undefined
		verbosity: import("@ali-code/types").VerbosityLevel | undefined
		tools?: boolean
		id:
			| "gpt-5.1-codex-max"
			| "gpt-5.4"
			| "gpt-5.4-mini"
			| "gpt-5.2"
			| "gpt-5.2-codex"
			| "gpt-5.3-codex"
			| "gpt-5.1"
			| "gpt-5.1-codex"
			| "gpt-5.1-codex-mini"
			| "gpt-5"
			| "gpt-5-codex"
			| "gpt-5.3-codex-spark"
			| "gpt-5-codex-mini"
			| "gpt-5.5"
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
	getEncryptedContent():
		| {
				encrypted_content: string
				id?: string
		  }
		| undefined
	getResponseId(): string | undefined
	completePrompt(prompt: string): Promise<string>
}
//# sourceMappingURL=openai-codex.d.ts.map
