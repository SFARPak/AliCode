"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.BaseOpenAiCompatibleProvider = void 0
const openai_1 = __importDefault(require("openai"))
const api_1 = require("../../shared/api")
const tag_matcher_1 = require("../../utils/tag-matcher")
const openai_format_1 = require("../transform/openai-format")
const constants_1 = require("./constants")
const base_provider_1 = require("./base-provider")
const openai_error_handler_1 = require("./utils/openai-error-handler")
const cost_1 = require("../../shared/cost")
const timeout_config_1 = require("./utils/timeout-config")
class BaseOpenAiCompatibleProvider extends base_provider_1.BaseProvider {
	providerName
	baseURL
	defaultTemperature
	defaultProviderModelId
	providerModels
	options
	client
	constructor({ providerName, baseURL, defaultProviderModelId, providerModels, defaultTemperature, ...options }) {
		super()
		this.providerName = providerName
		this.baseURL = baseURL
		this.defaultProviderModelId = defaultProviderModelId
		this.providerModels = providerModels
		this.defaultTemperature = defaultTemperature ?? 0
		this.options = options
		if (!this.options.apiKey) {
			throw new Error("API key is required")
		}
		this.client = new openai_1.default({
			baseURL,
			apiKey: this.options.apiKey,
			defaultHeaders: constants_1.DEFAULT_HEADERS,
			timeout: (0, timeout_config_1.getApiRequestTimeout)(),
		})
	}
	createStream(systemPrompt, messages, metadata, requestOptions) {
		const { id: model, info } = this.getModel()
		// Centralized cap: clamp to 20% of the context window (unless provider-specific exceptions apply)
		const max_tokens =
			(0, api_1.getModelMaxOutputTokens)({
				modelId: model,
				model: info,
				settings: this.options,
				format: "openai",
			}) ?? undefined
		const temperature = this.options.modelTemperature ?? info.defaultTemperature ?? this.defaultTemperature
		const params = {
			model,
			max_tokens,
			temperature,
			messages: [
				{ role: "system", content: systemPrompt },
				...(0, openai_format_1.convertToOpenAiMessages)(messages),
			],
			stream: true,
			stream_options: { include_usage: true },
			tools: this.convertToolsForOpenAI(metadata?.tools),
			tool_choice: metadata?.tool_choice,
			parallel_tool_calls: metadata?.parallelToolCalls ?? true,
		}
		// Add thinking parameter if reasoning is enabled and model supports it
		if (this.options.enableReasoningEffort && info.supportsReasoningBinary) {
			params.thinking = { type: "enabled" }
		}
		try {
			return this.client.chat.completions.create(params, requestOptions)
		} catch (error) {
			throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
		}
	}
	async *createMessage(systemPrompt, messages, metadata) {
		const stream = await this.createStream(systemPrompt, messages, metadata)
		const matcher = new tag_matcher_1.TagMatcher("think", (chunk) => ({
			type: chunk.matched ? "reasoning" : "text",
			text: chunk.data,
		}))
		let lastUsage
		const activeToolCallIds = new Set()
		for await (const chunk of stream) {
			// Check for provider-specific error responses (e.g., MiniMax base_resp)
			const chunkAny = chunk
			if (chunkAny.base_resp?.status_code && chunkAny.base_resp.status_code !== 0) {
				throw new Error(
					`${this.providerName} API Error (${chunkAny.base_resp.status_code}): ${chunkAny.base_resp.status_msg || "Unknown error"}`,
				)
			}
			const delta = chunk.choices?.[0]?.delta
			const finishReason = chunk.choices?.[0]?.finish_reason
			if (delta?.content) {
				for (const processedChunk of matcher.update(delta.content)) {
					yield processedChunk
				}
			}
			if (delta) {
				for (const key of ["reasoning_content", "reasoning"]) {
					if (key in delta) {
						const reasoning_content = delta[key] || ""
						if (reasoning_content?.trim()) {
							yield { type: "reasoning", text: reasoning_content }
						}
						break
					}
				}
			}
			// Emit raw tool call chunks - NativeToolCallParser handles state management
			if (delta?.tool_calls) {
				for (const toolCall of delta.tool_calls) {
					if (toolCall.id) {
						activeToolCallIds.add(toolCall.id)
					}
					yield {
						type: "tool_call_partial",
						index: toolCall.index,
						id: toolCall.id,
						name: toolCall.function?.name,
						arguments: toolCall.function?.arguments,
					}
				}
			}
			// Emit tool_call_end events when finish_reason is "tool_calls"
			// This ensures tool calls are finalized even if the stream doesn't properly close
			if (finishReason === "tool_calls" && activeToolCallIds.size > 0) {
				for (const id of activeToolCallIds) {
					yield { type: "tool_call_end", id }
				}
				activeToolCallIds.clear()
			}
			if (chunk.usage) {
				lastUsage = chunk.usage
			}
		}
		if (lastUsage) {
			yield this.processUsageMetrics(lastUsage, this.getModel().info)
		}
		// Process any remaining content
		for (const processedChunk of matcher.final()) {
			yield processedChunk
		}
	}
	processUsageMetrics(usage, modelInfo) {
		const inputTokens = usage?.prompt_tokens || 0
		const outputTokens = usage?.completion_tokens || 0
		const cacheWriteTokens = usage?.prompt_tokens_details?.cache_write_tokens || 0
		const cacheReadTokens = usage?.prompt_tokens_details?.cached_tokens || 0
		const { totalCost } = modelInfo
			? (0, cost_1.calculateApiCostOpenAI)(
					modelInfo,
					inputTokens,
					outputTokens,
					cacheWriteTokens,
					cacheReadTokens,
				)
			: { totalCost: 0 }
		return {
			type: "usage",
			inputTokens,
			outputTokens,
			cacheWriteTokens: cacheWriteTokens || undefined,
			cacheReadTokens: cacheReadTokens || undefined,
			totalCost,
		}
	}
	async completePrompt(prompt) {
		const { id: modelId, info: modelInfo } = this.getModel()
		const params = {
			model: modelId,
			messages: [{ role: "user", content: prompt }],
		}
		// Add thinking parameter if reasoning is enabled and model supports it
		if (this.options.enableReasoningEffort && modelInfo.supportsReasoningBinary) {
			params.thinking = { type: "enabled" }
		}
		try {
			const response = await this.client.chat.completions.create(params)
			// Check for provider-specific error responses (e.g., MiniMax base_resp)
			const responseAny = response
			if (responseAny.base_resp?.status_code && responseAny.base_resp.status_code !== 0) {
				throw new Error(
					`${this.providerName} API Error (${responseAny.base_resp.status_code}): ${responseAny.base_resp.status_msg || "Unknown error"}`,
				)
			}
			return response.choices?.[0]?.message.content || ""
		} catch (error) {
			throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
		}
	}
	getModel() {
		const id =
			this.options.apiModelId && this.options.apiModelId in this.providerModels
				? this.options.apiModelId
				: this.defaultProviderModelId
		return { id, info: this.providerModels[id] }
	}
}
exports.BaseOpenAiCompatibleProvider = BaseOpenAiCompatibleProvider
