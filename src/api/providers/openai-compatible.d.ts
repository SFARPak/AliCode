/**
 * OpenAI-compatible provider base class using Vercel AI SDK.
 * This provides a parallel implementation to OpenAiHandler using @ai-sdk/openai-compatible.
 */
import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { LanguageModel } from "ai"
import type { ModelInfo } from "@ali-code/types"
import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream, ApiStreamUsageChunk } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
/**
 * Configuration options for creating an OpenAI-compatible provider.
 */
export interface OpenAICompatibleConfig {
	/** Provider name for identification */
	providerName: string
	/** Base URL for the API endpoint */
	baseURL: string
	/** API key for authentication */
	apiKey: string
	/** Model ID to use */
	modelId: string
	/** Model information */
	modelInfo: ModelInfo
	/** Optional custom headers */
	headers?: Record<string, string>
	/** Whether to include max_tokens in requests (default: false uses max_completion_tokens) */
	useMaxTokens?: boolean
	/** User-configured max tokens override */
	modelMaxTokens?: number
	/** Temperature setting */
	temperature?: number
}
/**
 * Base class for OpenAI-compatible API providers using Vercel AI SDK.
 * Extends BaseProvider and implements SingleCompletionHandler.
 */
export declare abstract class OpenAICompatibleHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	protected config: OpenAICompatibleConfig
	protected provider: ReturnType<typeof createOpenAICompatible>
	constructor(options: ApiHandlerOptions, config: OpenAICompatibleConfig)
	/**
	 * Get the language model for the configured model ID.
	 */
	protected getLanguageModel(): LanguageModel
	/**
	 * Get the model information. Must be implemented by subclasses.
	 */
	abstract getModel(): {
		id: string
		info: ModelInfo
		maxTokens?: number
		temperature?: number
	}
	/**
	 * Process usage metrics from the AI SDK response.
	 * Can be overridden by subclasses to handle provider-specific usage formats.
	 */
	protected processUsageMetrics(usage: {
		inputTokens?: number
		outputTokens?: number
		details?: {
			cachedInputTokens?: number
			reasoningTokens?: number
		}
		raw?: Record<string, unknown>
	}): ApiStreamUsageChunk
	/**
	 * Map OpenAI tool_choice to AI SDK toolChoice format.
	 */
	protected mapToolChoice(toolChoice: OpenAI.Chat.ChatCompletionCreateParams["tool_choice"]):
		| "auto"
		| "none"
		| "required"
		| {
				type: "tool"
				toolName: string
		  }
		| undefined
	/**
	 * Get the max tokens parameter to include in the request.
	 */
	protected getMaxOutputTokens(): number | undefined
	/**
	 * Create a message stream using the AI SDK.
	 */
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	/**
	 * Complete a prompt using the AI SDK generateText.
	 */
	completePrompt(prompt: string): Promise<string>
}
//# sourceMappingURL=openai-compatible.d.ts.map
