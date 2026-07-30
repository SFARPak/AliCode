"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.AnthropicVertexHandler = void 0
const vertex_sdk_1 = require("@anthropic-ai/vertex-sdk")
const google_auth_library_1 = require("google-auth-library")
const types_1 = require("@ali-code/types")
const core_1 = require("@ali-code/core")
const vertex_1 = require("../transform/caching/vertex")
const model_params_1 = require("../transform/model-params")
const anthropic_filter_1 = require("../transform/anthropic-filter")
const converters_1 = require("../../core/prompts/tools/native-tools/converters")
const base_provider_1 = require("./base-provider")
// https://docs.anthropic.com/en/api/claude-on-vertex-ai
class AnthropicVertexHandler extends base_provider_1.BaseProvider {
	options
	client
	constructor(options) {
		super()
		this.options = options
		// https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude#regions
		const projectId = this.options.vertexProjectId ?? "not-provided"
		const region = this.options.vertexRegion ?? "us-east5"
		if (this.options.vertexJsonCredentials) {
			this.client = new vertex_sdk_1.AnthropicVertex({
				projectId,
				region,
				googleAuth: new google_auth_library_1.GoogleAuth({
					scopes: ["https://www.googleapis.com/auth/cloud-platform"],
					credentials: (0, core_1.safeJsonParse)(this.options.vertexJsonCredentials, undefined),
				}),
			})
		} else if (this.options.vertexKeyFile) {
			this.client = new vertex_sdk_1.AnthropicVertex({
				projectId,
				region,
				googleAuth: new google_auth_library_1.GoogleAuth({
					scopes: ["https://www.googleapis.com/auth/cloud-platform"],
					keyFile: this.options.vertexKeyFile,
				}),
			})
		} else {
			this.client = new vertex_sdk_1.AnthropicVertex({ projectId, region })
		}
	}
	async *createMessage(systemPrompt, messages, metadata) {
		let { id, info, temperature, maxTokens, reasoning: thinking, betas } = this.getModel()
		const { supportsPromptCache } = info
		// Filter out non-Anthropic blocks (reasoning, thoughtSignature, etc.) before sending to the API
		const sanitizedMessages = (0, anthropic_filter_1.filterNonAnthropicBlocks)(messages)
		const nativeToolParams = {
			tools: (0, converters_1.convertOpenAIToolsToAnthropic)(metadata?.tools ?? []),
			tool_choice: (0, converters_1.convertOpenAIToolChoiceToAnthropic)(
				metadata?.tool_choice,
				metadata?.parallelToolCalls,
			),
		}
		/**
		 * Vertex API has specific limitations for prompt caching:
		 * 1. Maximum of 4 blocks can have cache_control
		 * 2. Only text blocks can be cached (images and other content types cannot)
		 * 3. Cache control can only be applied to user messages, not assistant messages
		 *
		 * Our caching strategy:
		 * - Cache the system prompt (1 block)
		 * - Cache the last text block of the second-to-last user message (1 block)
		 * - Cache the last text block of the last user message (1 block)
		 * This ensures we stay under the 4-block limit while maintaining effective caching
		 * for the most relevant context.
		 */
		const params = {
			model: id,
			max_tokens: maxTokens ?? types_1.ANTHROPIC_DEFAULT_MAX_TOKENS,
			temperature,
			thinking,
			// Cache the system prompt if caching is enabled.
			system: supportsPromptCache
				? [{ text: systemPrompt, type: "text", cache_control: { type: "ephemeral" } }]
				: systemPrompt,
			messages: supportsPromptCache ? (0, vertex_1.addCacheBreakpoints)(sanitizedMessages) : sanitizedMessages,
			stream: true,
			...nativeToolParams,
		}
		// and prompt caching
		const requestOptions = betas?.length ? { headers: { "anthropic-beta": betas.join(",") } } : undefined
		const stream = await this.client.messages.create(params, requestOptions)
		for await (const chunk of stream) {
			switch (chunk.type) {
				case "message_start": {
					const usage = chunk.message.usage
					yield {
						type: "usage",
						inputTokens: usage.input_tokens || 0,
						outputTokens: usage.output_tokens || 0,
						cacheWriteTokens: usage.cache_creation_input_tokens || undefined,
						cacheReadTokens: usage.cache_read_input_tokens || undefined,
					}
					break
				}
				case "message_delta": {
					yield {
						type: "usage",
						inputTokens: 0,
						outputTokens: chunk.usage.output_tokens || 0,
					}
					break
				}
				case "content_block_start": {
					switch (chunk.content_block.type) {
						case "text": {
							if (chunk.index > 0) {
								yield { type: "text", text: "\n" }
							}
							yield { type: "text", text: chunk.content_block.text }
							break
						}
						case "thinking": {
							if (chunk.index > 0) {
								yield { type: "reasoning", text: "\n" }
							}
							yield { type: "reasoning", text: chunk.content_block.thinking }
							break
						}
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
				}
				case "content_block_delta": {
					switch (chunk.delta.type) {
						case "text_delta": {
							yield { type: "text", text: chunk.delta.text }
							break
						}
						case "thinking_delta": {
							yield { type: "reasoning", text: chunk.delta.thinking }
							break
						}
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
				}
				case "content_block_stop": {
					// Block complete - no action needed for now.
					// NativeToolCallParser handles tool call completion
					// Note: Signature for multi-turn thinking would require using stream.finalMessage()
					// after iteration completes, which requires restructuring the streaming approach.
					break
				}
			}
		}
	}
	getModel() {
		const modelId = this.options.apiModelId
		let id = modelId && modelId in types_1.vertexModels ? modelId : types_1.vertexDefaultModelId
		let info = types_1.vertexModels[id]
		// Check if 1M context beta should be enabled for supported models
		const supports1MContext = types_1.VERTEX_1M_CONTEXT_MODEL_IDS.includes(id)
		const enable1MContext = supports1MContext && this.options.vertex1MContext
		// If 1M context beta is enabled, update the model info with tier pricing
		if (enable1MContext) {
			const tier = info.tiers?.[0]
			if (tier) {
				info = {
					...info,
					contextWindow: tier.contextWindow,
					inputPrice: tier.inputPrice,
					outputPrice: tier.outputPrice,
					cacheWritesPrice: tier.cacheWritesPrice,
					cacheReadsPrice: tier.cacheReadsPrice,
				}
			}
		}
		const params = (0, model_params_1.getModelParams)({
			format: "anthropic",
			modelId: id,
			model: info,
			settings: this.options,
			defaultTemperature: 0,
		})
		// Build betas array for request headers
		const betas = []
		// Add 1M context beta flag if enabled for supported models
		if (enable1MContext) {
			betas.push("context-1m-2025-08-07")
		}
		// The `:thinking` suffix indicates that the model is a "Hybrid"
		// reasoning model and that reasoning is required to be enabled.
		// The actual model ID honored by Anthropic's API does not have this
		// suffix.
		return {
			id: id.endsWith(":thinking") ? id.replace(":thinking", "") : id,
			info,
			betas: betas.length > 0 ? betas : undefined,
			...params,
		}
	}
	async completePrompt(prompt) {
		try {
			let {
				id,
				info: { supportsPromptCache },
				temperature,
				maxTokens = types_1.ANTHROPIC_DEFAULT_MAX_TOKENS,
				reasoning: thinking,
			} = this.getModel()
			const params = {
				model: id,
				max_tokens: maxTokens,
				temperature,
				thinking,
				messages: [
					{
						role: "user",
						content: supportsPromptCache
							? [{ type: "text", text: prompt, cache_control: { type: "ephemeral" } }]
							: prompt,
					},
				],
				stream: false,
			}
			const response = await this.client.messages.create(params)
			const content = response.content[0]
			if (content.type === "text") {
				return content.text
			}
			return ""
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Vertex completion error: ${error.message}`)
			}
			throw error
		}
	}
}
exports.AnthropicVertexHandler = AnthropicVertexHandler
