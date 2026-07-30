import { Anthropic } from "@anthropic-ai/sdk"
import { type ModelInfo, type ProviderSettings, type BedrockModelId } from "@ali-code/types"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
interface ContentBlockStartEvent {
	start?: {
		text?: string
		thinking?: string
		toolUse?: {
			toolUseId?: string
			name?: string
		}
	}
	contentBlockIndex?: number
	content_block?: {
		type?: string
		thinking?: string
	}
	contentBlock?: {
		type?: string
		thinking?: string
		reasoningContent?: {
			text?: string
		}
		toolUse?: {
			toolUseId?: string
			name?: string
		}
	}
}
interface ContentBlockDeltaEvent {
	delta?: {
		text?: string
		thinking?: string
		type?: string
		reasoningContent?: {
			text?: string
		}
		toolUse?: {
			input?: string
		}
	}
	contentBlockIndex?: number
}
export interface StreamEvent {
	messageStart?: {
		role?: string
	}
	messageStop?: {
		stopReason?: "end_turn" | "tool_use" | "max_tokens" | "stop_sequence"
		additionalModelResponseFields?: Record<string, unknown>
	}
	contentBlockStart?: ContentBlockStartEvent
	contentBlockDelta?: ContentBlockDeltaEvent
	metadata?: {
		usage?: {
			inputTokens: number
			outputTokens: number
			totalTokens?: number
			cacheReadInputTokens?: number
			cacheWriteInputTokens?: number
			cacheReadInputTokenCount?: number
			cacheWriteInputTokenCount?: number
		}
		metrics?: {
			latencyMs: number
		}
	}
	trace?: {
		promptRouter?: {
			invokedModelId?: string
			usage?: {
				inputTokens: number
				outputTokens: number
				totalTokens?: number
				cacheReadTokens?: number
				cacheWriteTokens?: number
				cacheReadInputTokenCount?: number
				cacheWriteInputTokenCount?: number
			}
		}
	}
}
export type UsageType = {
	inputTokens?: number
	outputTokens?: number
	cacheReadInputTokens?: number
	cacheWriteInputTokens?: number
	cacheReadInputTokenCount?: number
	cacheWriteInputTokenCount?: number
}
/************************************************************************************
 *
 *     PROVIDER
 *
 *************************************************************************************/
export declare class AwsBedrockHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ProviderSettings
	private client
	private arnInfo
	private readonly providerName
	constructor(options: ProviderSettings)
	private guessModelInfoFromId
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata & {
			thinking?: {
				enabled: boolean
				maxTokens?: number
				maxThinkingTokens?: number
			}
		},
	): ApiStream
	completePrompt(prompt: string): Promise<string>
	/**
	 * Convert Anthropic messages to Bedrock Converse format
	 */
	private convertToBedrockConverseMessages
	/************************************************************************************
	 *
	 *     MODEL IDENTIFICATION
	 *
	 *************************************************************************************/
	private costModelConfig
	private parseArn
	private parseBaseModelId
	getModelById(
		modelId: string,
		modelType?: string,
	): {
		id: BedrockModelId | string
		info: ModelInfo
	}
	getModel(): {
		id: BedrockModelId | string
		info: ModelInfo
		maxTokens?: number
		temperature?: number
		reasoning?: any
		reasoningBudget?: number
	}
	/************************************************************************************
	 *
	 *     CACHE
	 *
	 *************************************************************************************/
	private previousCachePointPlacements
	private supportsAwsPromptCache
	/**
	 * Removes any existing cachePoint nodes from content blocks
	 */
	private removeCachePoints
	/************************************************************************************
	 *
	 *     NATIVE TOOLS
	 *
	 *************************************************************************************/
	/**
	 * Convert OpenAI tool definitions to Bedrock Converse format
	 * Transforms JSON Schema to draft 2020-12 compliant format required by Claude models.
	 * @param tools Array of OpenAI ChatCompletionTool definitions
	 * @returns Array of Bedrock Tool definitions
	 */
	private convertToolsForBedrock
	/**
	 * Convert OpenAI tool_choice to Bedrock ToolChoice format
	 * @param toolChoice OpenAI tool_choice parameter
	 * @returns Bedrock ToolChoice configuration
	 */
	private convertToolChoiceForBedrock
	/************************************************************************************
	 *
	 *     AMAZON REGIONS
	 *
	 *************************************************************************************/
	private static getPrefixForRegion
	private static isSystemInferenceProfile
	/************************************************************************************
	 *
	 *     ERROR HANDLING
	 *
	 *************************************************************************************/
	/**
	 * Error type definitions for Bedrock API errors
	 */
	private static readonly ERROR_TYPES
	/**
	 * Determines the error type based on the error message or name
	 */
	private getErrorType
	/**
	 * Formats an error message based on the error type and context
	 */
	private formatErrorMessage
	/**
	 * Handles Bedrock API errors and generates appropriate error messages
	 * @param error The error that occurred
	 * @param isStreamContext Whether the error occurred in a streaming context (true) or not (false)
	 * @returns Error message string for non-streaming context or array of stream chunks for streaming context
	 */
	private handleBedrockError
}
export {}
//# sourceMappingURL=bedrock.d.ts.map
