import { Anthropic } from "@anthropic-ai/sdk"
import { type ReasoningEffortExtended } from "@ali-code/types"
import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
export type OpenAiNativeModel = ReturnType<OpenAiNativeHandler["getModel"]>
export declare class OpenAiNativeHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private client
	private readonly providerName
	private readonly sessionId
	/**
	 * Some Responses streams emit tool-call argument deltas without stable call id/name.
	 * Track the last observed tool identity from output_item events so we can still
	 * emit `tool_call_partial` chunks (tool-call-only streams).
	 */
	private pendingToolCallId
	private pendingToolCallName
	private sawTextOutputInCurrentResponse
	private sawTextDeltaInCurrentResponse
	private streamedToolCallIds
	private lastServiceTier
	private lastResponseOutput
	private lastResponseId
	private abortController?
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
	private makeResponsesApiRequest
	/**
	 * Handles the streaming response from the Responses API.
	 *
	 * This function iterates through the Server-Sent Events (SSE) stream, parses each event,
	 * and yields structured data chunks (`ApiStream`). It handles a wide variety of event types,
	 * including text deltas, reasoning, usage data, and various status/tool events.
	 */
	private handleStreamResponse
	/**
	 * Shared processor for Responses API events.
	 */
	private processEvent
	private getReasoningEffort
	/**
	 * Returns the appropriate prompt cache retention policy for the given model, if any.
	 *
	 * The policy is driven by ModelInfo.promptCacheRetention so that model-specific details
	 * live in the shared types layer rather than this provider. When set to "24h" and the
	 * model supports prompt caching, extended prompt cache retention is requested.
	 */
	private getPromptCacheRetention
	/**
	 * Returns a shallow-cloned ModelInfo with pricing overridden for the given tier, if available.
	 * If no tier or no overrides exist, the original ModelInfo is returned.
	 */
	private applyServiceTierPricing
	getModel(): {
		verbosity: "low" | "medium" | "high" | undefined
		format: "openai"
		reasoning: import("../transform/reasoning").OpenAiReasoningParams | undefined
		maxTokens: number | undefined
		temperature: number | undefined
		reasoningEffort: ReasoningEffortExtended | undefined
		reasoningBudget: number | undefined
		tools?: boolean
		id:
			| "gpt-5.1-codex-max"
			| "gpt-5.4"
			| "gpt-5.4-mini"
			| "gpt-5.4-nano"
			| "gpt-5.2"
			| "gpt-5.2-codex"
			| "gpt-5.3-codex"
			| "gpt-5.2-chat-latest"
			| "gpt-5.3-chat-latest"
			| "gpt-5.1"
			| "gpt-5.1-codex"
			| "gpt-5.1-codex-mini"
			| "gpt-5"
			| "gpt-5-mini"
			| "gpt-5-codex"
			| "gpt-5-nano"
			| "gpt-5-chat-latest"
			| "gpt-4.1"
			| "gpt-4.1-mini"
			| "gpt-4.1-nano"
			| "o3"
			| "o3-high"
			| "o3-low"
			| "o4-mini"
			| "o4-mini-high"
			| "o4-mini-low"
			| "o3-mini"
			| "o3-mini-high"
			| "o3-mini-low"
			| "o1"
			| "o1-preview"
			| "o1-mini"
			| "gpt-4o"
			| "gpt-4o-mini"
			| "codex-mini-latest"
			| "gpt-5-2025-08-07"
			| "gpt-5-mini-2025-08-07"
			| "gpt-5-nano-2025-08-07"
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
	/**
	 * Extracts encrypted_content and id from the first reasoning item in the output array.
	 * This is the minimal data needed for stateless API continuity.
	 *
	 * @returns Object with encrypted_content and id, or undefined if not available
	 */
	getEncryptedContent():
		| {
				encrypted_content: string
				id?: string
		  }
		| undefined
	getResponseId(): string | undefined
	completePrompt(prompt: string): Promise<string>
}
//# sourceMappingURL=openai-native.d.ts.map
