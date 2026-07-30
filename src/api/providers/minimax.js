"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.MiniMaxHandler = void 0
const sdk_1 = require("@anthropic-ai/sdk")
const types_1 = require("@ali-code/types")
const model_params_1 = require("../transform/model-params")
const minimax_format_1 = require("../transform/minimax-format")
const base_provider_1 = require("./base-provider")
const cost_1 = require("../../shared/cost")
const converters_1 = require("../../core/prompts/tools/native-tools/converters")
/**
 * Converts OpenAI tool_choice to Anthropic ToolChoice format
 */
function convertOpenAIToolChoice(toolChoice) {
	if (!toolChoice) {
		return undefined
	}
	if (typeof toolChoice === "string") {
		switch (toolChoice) {
			case "none":
				return undefined // Anthropic doesn't have "none", just omit tools
			case "auto":
				return { type: "auto" }
			case "required":
				return { type: "any" }
			default:
				return { type: "auto" }
		}
	}
	// Handle object form { type: "function", function: { name: string } }
	if (typeof toolChoice === "object" && "function" in toolChoice) {
		return {
			type: "tool",
			name: toolChoice.function.name,
		}
	}
	return { type: "auto" }
}
class MiniMaxHandler extends base_provider_1.BaseProvider {
	options
	client
	constructor(options) {
		super()
		this.options = options
		// Use Anthropic-compatible endpoint
		// Default to international endpoint: https://api.minimax.io/anthropic
		// China endpoint: https://api.minimaxi.com/anthropic
		let baseURL = options.minimaxBaseUrl || "https://api.minimax.io/anthropic"
		// If user provided a /v1 endpoint, convert to /anthropic
		if (baseURL.endsWith("/v1")) {
			baseURL = baseURL.replace(/\/v1$/, "/anthropic")
		} else if (!baseURL.endsWith("/anthropic")) {
			baseURL = `${baseURL.replace(/\/$/, "")}/anthropic`
		}
		this.client = new sdk_1.Anthropic({
			baseURL,
			apiKey: options.minimaxApiKey,
		})
	}
	async *createMessage(systemPrompt, messages, metadata) {
		let stream
		const cacheControl = { type: "ephemeral" }
		const { id: modelId, info, maxTokens, temperature } = this.getModel()
		// MiniMax M2 models support prompt caching
		const supportsPromptCache = info.supportsPromptCache ?? false
		// Merge environment_details from messages that follow tool_result blocks
		// into the tool_result content. This preserves reasoning continuity for
		// thinking models by preventing user messages from interrupting the
		// reasoning context after tool use (similar to r1-format's mergeToolResultText).
		const processedMessages = (0, minimax_format_1.mergeEnvironmentDetailsForMiniMax)(messages)
		// Build the system blocks array
		const systemBlocks = [
			supportsPromptCache
				? { text: systemPrompt, type: "text", cache_control: cacheControl }
				: { text: systemPrompt, type: "text" },
		]
		// Prepare request parameters
		const requestParams = {
			model: modelId,
			max_tokens: maxTokens ?? 16_384,
			temperature: temperature ?? 1.0,
			system: systemBlocks,
			messages: supportsPromptCache ? this.addCacheControl(processedMessages, cacheControl) : processedMessages,
			stream: true,
			tools: (0, converters_1.convertOpenAIToolsToAnthropic)(metadata?.tools ?? []),
			tool_choice: convertOpenAIToolChoice(metadata?.tool_choice),
		}
		stream = await this.client.messages.create(requestParams)
		let inputTokens = 0
		let outputTokens = 0
		let cacheWriteTokens = 0
		let cacheReadTokens = 0
		for await (const chunk of stream) {
			switch (chunk.type) {
				case "message_start": {
					// Tells us cache reads/writes/input/output.
					const {
						input_tokens = 0,
						output_tokens = 0,
						cache_creation_input_tokens,
						cache_read_input_tokens,
					} = chunk.message.usage
					yield {
						type: "usage",
						inputTokens: input_tokens,
						outputTokens: output_tokens,
						cacheWriteTokens: cache_creation_input_tokens || undefined,
						cacheReadTokens: cache_read_input_tokens || undefined,
					}
					inputTokens += input_tokens
					outputTokens += output_tokens
					cacheWriteTokens += cache_creation_input_tokens || 0
					cacheReadTokens += cache_read_input_tokens || 0
					break
				}
				case "message_delta":
					// Tells us stop_reason, stop_sequence, and output tokens
					yield {
						type: "usage",
						inputTokens: 0,
						outputTokens: chunk.usage.output_tokens || 0,
					}
					break
				case "message_stop":
					// No usage data, just an indicator that the message is done.
					break
				case "content_block_start":
					switch (chunk.content_block.type) {
						case "thinking":
							// Yield thinking/reasoning content
							if (chunk.index > 0) {
								yield { type: "reasoning", text: "\n" }
							}
							yield { type: "reasoning", text: chunk.content_block.thinking }
							break
						case "text":
							// We may receive multiple text blocks
							if (chunk.index > 0) {
								yield { type: "text", text: "\n" }
							}
							yield { type: "text", text: chunk.content_block.text }
							break
						case "tool_use": {
							// Emit initial tool call partial with id and name
							yield {
								type: "tool_call_partial",
								index: chunk.index,
								id: chunk.content_block.id,
								name: chunk.content_block.name,
								arguments: undefined,
							}
							break
						}
					}
					break
				case "content_block_delta":
					switch (chunk.delta.type) {
						case "thinking_delta":
							yield { type: "reasoning", text: chunk.delta.thinking }
							break
						case "text_delta":
							yield { type: "text", text: chunk.delta.text }
							break
						case "input_json_delta": {
							// Emit tool call partial chunks as arguments stream in
							yield {
								type: "tool_call_partial",
								index: chunk.index,
								id: undefined,
								name: undefined,
								arguments: chunk.delta.partial_json,
							}
							break
						}
					}
					break
				case "content_block_stop":
					// Block is complete - no action needed, NativeToolCallParser handles completion
					break
			}
		}
		// Calculate and yield final cost
		if (inputTokens > 0 || outputTokens > 0 || cacheWriteTokens > 0 || cacheReadTokens > 0) {
			const { totalCost } = (0, cost_1.calculateApiCostAnthropic)(
				this.getModel().info,
				inputTokens,
				outputTokens,
				cacheWriteTokens,
				cacheReadTokens,
			)
			yield {
				type: "usage",
				inputTokens: 0,
				outputTokens: 0,
				totalCost,
			}
		}
	}
	/**
	 * Add cache control to the last two user messages for prompt caching
	 */
	addCacheControl(messages, cacheControl) {
		const userMsgIndices = messages.reduce((acc, msg, index) => (msg.role === "user" ? [...acc, index] : acc), [])
		const lastUserMsgIndex = userMsgIndices[userMsgIndices.length - 1] ?? -1
		const secondLastMsgUserIndex = userMsgIndices[userMsgIndices.length - 2] ?? -1
		return messages.map((message, index) => {
			if (index === lastUserMsgIndex || index === secondLastMsgUserIndex) {
				return {
					...message,
					content:
						typeof message.content === "string"
							? [{ type: "text", text: message.content, cache_control: cacheControl }]
							: message.content.map((content, contentIndex) =>
									contentIndex === message.content.length - 1
										? { ...content, cache_control: cacheControl }
										: content,
								),
				}
			}
			return message
		})
	}
	getModel() {
		const modelId = this.options.apiModelId
		const id = modelId && modelId in types_1.minimaxModels ? modelId : types_1.minimaxDefaultModelId
		const info = types_1.minimaxModels[id]
		const params = (0, model_params_1.getModelParams)({
			format: "anthropic",
			modelId: id,
			model: info,
			settings: this.options,
			defaultTemperature: 1.0,
		})
		return {
			id,
			info,
			...params,
		}
	}
	async completePrompt(prompt) {
		const { id: model, temperature } = this.getModel()
		const message = await this.client.messages.create({
			model,
			max_tokens: 16_384,
			temperature: temperature ?? 1.0,
			messages: [{ role: "user", content: prompt }],
			stream: false,
		})
		const content = message.content.find(({ type }) => type === "text")
		return content?.type === "text" ? content.text : ""
	}
}
exports.MiniMaxHandler = MiniMaxHandler
