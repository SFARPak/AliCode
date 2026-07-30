"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.OpenAiHandler = void 0
exports.getOpenAiModels = getOpenAiModels
const openai_1 = __importStar(require("openai"))
const axios_1 = __importDefault(require("axios"))
const types_1 = require("@ali-code/types")
const tag_matcher_1 = require("../../utils/tag-matcher")
const openai_format_1 = require("../transform/openai-format")
const r1_format_1 = require("../transform/r1-format")
const model_params_1 = require("../transform/model-params")
const constants_1 = require("./constants")
const base_provider_1 = require("./base-provider")
const timeout_config_1 = require("./utils/timeout-config")
const openai_error_handler_1 = require("./utils/openai-error-handler")
// TODO: Rename this to OpenAICompatibleHandler. Also, I think the
// `OpenAINativeHandler` can subclass from this, since it's obviously
// compatible with the OpenAI API. We can also rename it to `OpenAIHandler`.
class OpenAiHandler extends base_provider_1.BaseProvider {
	options
	client
	providerName = "OpenAI"
	constructor(options) {
		super()
		this.options = options
		const baseURL = this.options.openAiBaseUrl || "https://api.openai.com/v1"
		const apiKey = this.options.openAiApiKey ?? "not-provided"
		const isAzureAiInference = this._isAzureAiInference(this.options.openAiBaseUrl)
		const urlHost = this._getUrlHost(this.options.openAiBaseUrl)
		const isAzureOpenAi = urlHost === "azure.com" || urlHost.endsWith(".azure.com") || options.openAiUseAzure
		const headers = {
			...constants_1.DEFAULT_HEADERS,
			...(this.options.openAiHeaders || {}),
		}
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		if (isAzureAiInference) {
			// Azure AI Inference Service (e.g., for DeepSeek) uses a different path structure
			this.client = new openai_1.default({
				baseURL,
				apiKey,
				defaultHeaders: headers,
				defaultQuery: { "api-version": this.options.azureApiVersion || "2024-05-01-preview" },
				timeout,
			})
		} else if (isAzureOpenAi) {
			// Azure API shape slightly differs from the core API shape:
			// https://github.com/openai/openai-node?tab=readme-ov-file#microsoft-azure-openai
			this.client = new openai_1.AzureOpenAI({
				baseURL,
				apiKey,
				apiVersion: this.options.azureApiVersion || types_1.azureOpenAiDefaultApiVersion,
				defaultHeaders: headers,
				timeout,
			})
		} else {
			this.client = new openai_1.default({
				baseURL,
				apiKey,
				defaultHeaders: headers,
				timeout,
			})
		}
	}
	async *createMessage(systemPrompt, messages, metadata) {
		const { info: modelInfo, reasoning } = this.getModel()
		const modelUrl = this.options.openAiBaseUrl ?? ""
		const modelId = this.options.openAiModelId ?? ""
		const enabledR1Format = this.options.openAiR1FormatEnabled ?? false
		const isAzureAiInference = this._isAzureAiInference(modelUrl)
		const deepseekReasoner = modelId.includes("deepseek-reasoner") || enabledR1Format
		if (modelId.includes("o1") || modelId.includes("o3") || modelId.includes("o4")) {
			yield* this.handleO3FamilyMessage(modelId, systemPrompt, messages, metadata)
			return
		}
		let systemMessage = {
			role: "system",
			content: systemPrompt,
		}
		if (this.options.openAiStreamingEnabled ?? true) {
			let convertedMessages
			if (deepseekReasoner) {
				convertedMessages = (0, r1_format_1.convertToR1Format)([
					{ role: "user", content: systemPrompt },
					...messages,
				])
			} else {
				if (modelInfo.supportsPromptCache) {
					systemMessage = {
						role: "system",
						content: [
							{
								type: "text",
								text: systemPrompt,
								// @ts-ignore-next-line
								cache_control: { type: "ephemeral" },
							},
						],
					}
				}
				convertedMessages = [systemMessage, ...(0, openai_format_1.convertToOpenAiMessages)(messages)]
				if (modelInfo.supportsPromptCache) {
					// Note: the following logic is copied from openrouter:
					// Add cache_control to the last two user messages
					// (note: this works because we only ever add one user message at a time, but if we added multiple we'd need to mark the user message before the last assistant message)
					const lastTwoUserMessages = convertedMessages.filter((msg) => msg.role === "user").slice(-2)
					lastTwoUserMessages.forEach((msg) => {
						if (typeof msg.content === "string") {
							msg.content = [{ type: "text", text: msg.content }]
						}
						if (Array.isArray(msg.content)) {
							// NOTE: this is fine since env details will always be added at the end. but if it weren't there, and the user added a image_url type message, it would pop a text part before it and then move it after to the end.
							let lastTextPart = msg.content.filter((part) => part.type === "text").pop()
							if (!lastTextPart) {
								lastTextPart = { type: "text", text: "..." }
								msg.content.push(lastTextPart)
							}
							// @ts-ignore-next-line
							lastTextPart["cache_control"] = { type: "ephemeral" }
						}
					})
				}
			}
			const isGrokXAI = this._isGrokXAI(this.options.openAiBaseUrl)
			const requestOptions = {
				model: modelId,
				temperature:
					this.options.modelTemperature ?? (deepseekReasoner ? types_1.DEEP_SEEK_DEFAULT_TEMPERATURE : 0),
				messages: convertedMessages,
				stream: true,
				...(isGrokXAI ? {} : { stream_options: { include_usage: true } }),
				...(reasoning && reasoning),
				tools: this.convertToolsForOpenAI(metadata?.tools),
				tool_choice: metadata?.tool_choice,
				parallel_tool_calls: metadata?.parallelToolCalls ?? true,
			}
			// Add max_tokens if needed
			this.addMaxTokensIfNeeded(requestOptions, modelInfo)
			let stream
			try {
				stream = await this.client.chat.completions.create(
					requestOptions,
					isAzureAiInference ? { path: types_1.OPENAI_AZURE_AI_INFERENCE_PATH } : {},
				)
			} catch (error) {
				throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
			}
			const matcher = new tag_matcher_1.TagMatcher("think", (chunk) => ({
				type: chunk.matched ? "reasoning" : "text",
				text: chunk.data,
			}))
			let lastUsage
			const activeToolCallIds = new Set()
			for await (const chunk of stream) {
				const delta = chunk.choices?.[0]?.delta ?? {}
				const finishReason = chunk.choices?.[0]?.finish_reason
				if (delta.content) {
					for (const chunk of matcher.update(delta.content)) {
						yield chunk
					}
				}
				if ("reasoning_content" in delta && delta.reasoning_content) {
					yield {
						type: "reasoning",
						text: delta.reasoning_content || "",
					}
				}
				yield* this.processToolCalls(delta, finishReason, activeToolCallIds)
				if (chunk.usage) {
					lastUsage = chunk.usage
				}
			}
			for (const chunk of matcher.final()) {
				yield chunk
			}
			if (lastUsage) {
				yield this.processUsageMetrics(lastUsage, modelInfo)
			}
		} else {
			const requestOptions = {
				model: modelId,
				messages: deepseekReasoner
					? (0, r1_format_1.convertToR1Format)([{ role: "user", content: systemPrompt }, ...messages])
					: [systemMessage, ...(0, openai_format_1.convertToOpenAiMessages)(messages)],
				// Tools are always present (minimum ALWAYS_AVAILABLE_TOOLS)
				tools: this.convertToolsForOpenAI(metadata?.tools),
				tool_choice: metadata?.tool_choice,
				parallel_tool_calls: metadata?.parallelToolCalls ?? true,
			}
			// Add max_tokens if needed
			this.addMaxTokensIfNeeded(requestOptions, modelInfo)
			let response
			try {
				response = await this.client.chat.completions.create(
					requestOptions,
					this._isAzureAiInference(modelUrl) ? { path: types_1.OPENAI_AZURE_AI_INFERENCE_PATH } : {},
				)
			} catch (error) {
				throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
			}
			const message = response.choices?.[0]?.message
			if (message?.tool_calls) {
				for (const toolCall of message.tool_calls) {
					if (toolCall.type === "function") {
						yield {
							type: "tool_call",
							id: toolCall.id,
							name: toolCall.function.name,
							arguments: toolCall.function.arguments,
						}
					}
				}
			}
			yield {
				type: "text",
				text: message?.content || "",
			}
			yield this.processUsageMetrics(response.usage, modelInfo)
		}
	}
	processUsageMetrics(usage, _modelInfo) {
		return {
			type: "usage",
			inputTokens: usage?.prompt_tokens || 0,
			outputTokens: usage?.completion_tokens || 0,
			cacheWriteTokens: usage?.cache_creation_input_tokens || undefined,
			cacheReadTokens: usage?.cache_read_input_tokens || undefined,
		}
	}
	getModel() {
		const id = this.options.openAiModelId ?? ""
		const info = this.options.openAiCustomModelInfo ?? types_1.openAiModelInfoSaneDefaults
		const params = (0, model_params_1.getModelParams)({
			format: "openai",
			modelId: id,
			model: info,
			settings: this.options,
			defaultTemperature: 0,
		})
		return { id, info, ...params }
	}
	async completePrompt(prompt) {
		try {
			const isAzureAiInference = this._isAzureAiInference(this.options.openAiBaseUrl)
			const model = this.getModel()
			const modelInfo = model.info
			const requestOptions = {
				model: model.id,
				messages: [{ role: "user", content: prompt }],
			}
			// Add max_tokens if needed
			this.addMaxTokensIfNeeded(requestOptions, modelInfo)
			let response
			try {
				response = await this.client.chat.completions.create(
					requestOptions,
					isAzureAiInference ? { path: types_1.OPENAI_AZURE_AI_INFERENCE_PATH } : {},
				)
			} catch (error) {
				throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
			}
			return response.choices?.[0]?.message.content || ""
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`${this.providerName} completion error: ${error.message}`)
			}
			throw error
		}
	}
	async *handleO3FamilyMessage(modelId, systemPrompt, messages, metadata) {
		const modelInfo = this.getModel().info
		const methodIsAzureAiInference = this._isAzureAiInference(this.options.openAiBaseUrl)
		if (this.options.openAiStreamingEnabled ?? true) {
			const isGrokXAI = this._isGrokXAI(this.options.openAiBaseUrl)
			const requestOptions = {
				model: modelId,
				messages: [
					{
						role: "developer",
						content: `Formatting re-enabled\n${systemPrompt}`,
					},
					...(0, openai_format_1.convertToOpenAiMessages)(messages),
				],
				stream: true,
				...(isGrokXAI ? {} : { stream_options: { include_usage: true } }),
				reasoning_effort: modelInfo.reasoningEffort,
				temperature: undefined,
				// Tools are always present (minimum ALWAYS_AVAILABLE_TOOLS)
				tools: this.convertToolsForOpenAI(metadata?.tools),
				tool_choice: metadata?.tool_choice,
				parallel_tool_calls: metadata?.parallelToolCalls ?? true,
			}
			// O3 family models do not support the deprecated max_tokens parameter
			// but they do support max_completion_tokens (the modern OpenAI parameter)
			// This allows O3 models to limit response length when includeMaxTokens is enabled
			this.addMaxTokensIfNeeded(requestOptions, modelInfo)
			let stream
			try {
				stream = await this.client.chat.completions.create(
					requestOptions,
					methodIsAzureAiInference ? { path: types_1.OPENAI_AZURE_AI_INFERENCE_PATH } : {},
				)
			} catch (error) {
				throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
			}
			yield* this.handleStreamResponse(stream)
		} else {
			const requestOptions = {
				model: modelId,
				messages: [
					{
						role: "developer",
						content: `Formatting re-enabled\n${systemPrompt}`,
					},
					...(0, openai_format_1.convertToOpenAiMessages)(messages),
				],
				reasoning_effort: modelInfo.reasoningEffort,
				temperature: undefined,
				// Tools are always present (minimum ALWAYS_AVAILABLE_TOOLS)
				tools: this.convertToolsForOpenAI(metadata?.tools),
				tool_choice: metadata?.tool_choice,
				parallel_tool_calls: metadata?.parallelToolCalls ?? true,
			}
			// O3 family models do not support the deprecated max_tokens parameter
			// but they do support max_completion_tokens (the modern OpenAI parameter)
			// This allows O3 models to limit response length when includeMaxTokens is enabled
			this.addMaxTokensIfNeeded(requestOptions, modelInfo)
			let response
			try {
				response = await this.client.chat.completions.create(
					requestOptions,
					methodIsAzureAiInference ? { path: types_1.OPENAI_AZURE_AI_INFERENCE_PATH } : {},
				)
			} catch (error) {
				throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
			}
			const message = response.choices?.[0]?.message
			if (message?.tool_calls) {
				for (const toolCall of message.tool_calls) {
					if (toolCall.type === "function") {
						yield {
							type: "tool_call",
							id: toolCall.id,
							name: toolCall.function.name,
							arguments: toolCall.function.arguments,
						}
					}
				}
			}
			yield {
				type: "text",
				text: message?.content || "",
			}
			yield this.processUsageMetrics(response.usage)
		}
	}
	async *handleStreamResponse(stream) {
		const activeToolCallIds = new Set()
		for await (const chunk of stream) {
			const delta = chunk.choices?.[0]?.delta
			const finishReason = chunk.choices?.[0]?.finish_reason
			if (delta) {
				if (delta.content) {
					yield {
						type: "text",
						text: delta.content,
					}
				}
				yield* this.processToolCalls(delta, finishReason, activeToolCallIds)
			}
			if (chunk.usage) {
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
				}
			}
		}
	}
	/**
	 * Helper generator to process tool calls from a stream chunk.
	 * Tracks active tool call IDs and yields tool_call_partial and tool_call_end events.
	 * @param delta - The delta object from the stream chunk
	 * @param finishReason - The finish_reason from the stream chunk
	 * @param activeToolCallIds - Set to track active tool call IDs (mutated in place)
	 */
	*processToolCalls(delta, finishReason, activeToolCallIds) {
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
	}
	_getUrlHost(baseUrl) {
		try {
			return new URL(baseUrl ?? "").host
		} catch (error) {
			return ""
		}
	}
	_isGrokXAI(baseUrl) {
		const urlHost = this._getUrlHost(baseUrl)
		return urlHost.includes("x.ai")
	}
	_isAzureAiInference(baseUrl) {
		const urlHost = this._getUrlHost(baseUrl)
		return urlHost.endsWith(".services.ai.azure.com")
	}
	/**
	 * Adds max_completion_tokens to the request body if needed based on provider configuration
	 * Note: max_tokens is deprecated in favor of max_completion_tokens as per OpenAI documentation
	 * O3 family models handle max_tokens separately in handleO3FamilyMessage
	 */
	addMaxTokensIfNeeded(requestOptions, modelInfo) {
		// Only add max_completion_tokens if includeMaxTokens is true
		if (this.options.includeMaxTokens === true) {
			// Use user-configured modelMaxTokens if available, otherwise fall back to model's default maxTokens
			// Using max_completion_tokens as max_tokens is deprecated
			requestOptions.max_completion_tokens = this.options.modelMaxTokens || modelInfo.maxTokens
		}
	}
}
exports.OpenAiHandler = OpenAiHandler
async function getOpenAiModels(baseUrl, apiKey, openAiHeaders) {
	try {
		if (!baseUrl) {
			return []
		}
		// Trim whitespace from baseUrl to handle cases where users accidentally include spaces
		const trimmedBaseUrl = baseUrl.trim()
		if (!URL.canParse(trimmedBaseUrl)) {
			return []
		}
		const config = {}
		const headers = {
			...constants_1.DEFAULT_HEADERS,
			...(openAiHeaders || {}),
		}
		if (apiKey) {
			headers["Authorization"] = `Bearer ${apiKey}`
		}
		if (Object.keys(headers).length > 0) {
			config["headers"] = headers
		}
		const response = await axios_1.default.get(`${trimmedBaseUrl}/models`, config)
		const modelsArray = response.data?.data?.map((model) => model.id) || []
		return [...new Set(modelsArray)]
	} catch (error) {
		return []
	}
}
