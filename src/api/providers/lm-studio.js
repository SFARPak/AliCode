"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.LmStudioHandler = void 0
exports.getLmStudioModels = getLmStudioModels
const openai_1 = __importDefault(require("openai"))
const axios_1 = __importDefault(require("axios"))
const types_1 = require("@ali-code/types")
const NativeToolCallParser_1 = require("../../core/assistant-message/NativeToolCallParser")
const tag_matcher_1 = require("../../utils/tag-matcher")
const openai_format_1 = require("../transform/openai-format")
const base_provider_1 = require("./base-provider")
const modelCache_1 = require("./fetchers/modelCache")
const timeout_config_1 = require("./utils/timeout-config")
const openai_error_handler_1 = require("./utils/openai-error-handler")
class LmStudioHandler extends base_provider_1.BaseProvider {
	options
	client
	providerName = "LM Studio"
	constructor(options) {
		super()
		this.options = options
		// LM Studio uses "noop" as a placeholder API key
		const apiKey = "noop"
		this.client = new openai_1.default({
			baseURL: (this.options.lmStudioBaseUrl || "http://localhost:1234") + "/v1",
			apiKey: apiKey,
			timeout: (0, timeout_config_1.getApiRequestTimeout)(),
		})
	}
	async *createMessage(systemPrompt, messages, metadata) {
		const openAiMessages = [
			{ role: "system", content: systemPrompt },
			...(0, openai_format_1.convertToOpenAiMessages)(messages),
		]
		// -------------------------
		// Track token usage
		// -------------------------
		const toContentBlocks = (blocks) => {
			if (typeof blocks === "string") {
				return [{ type: "text", text: blocks }]
			}
			const result = []
			for (const msg of blocks) {
				if (typeof msg.content === "string") {
					result.push({ type: "text", text: msg.content })
				} else if (Array.isArray(msg.content)) {
					for (const part of msg.content) {
						if (part.type === "text") {
							result.push({ type: "text", text: part.text })
						}
					}
				}
			}
			return result
		}
		let inputTokens = 0
		try {
			inputTokens = await this.countTokens([{ type: "text", text: systemPrompt }, ...toContentBlocks(messages)])
		} catch (err) {
			console.error("[LmStudio] Failed to count input tokens:", err)
			inputTokens = 0
		}
		let assistantText = ""
		try {
			const params = {
				model: this.getModel().id,
				messages: openAiMessages,
				temperature: this.options.modelTemperature ?? types_1.LMSTUDIO_DEFAULT_TEMPERATURE,
				stream: true,
				tools: this.convertToolsForOpenAI(metadata?.tools),
				tool_choice: metadata?.tool_choice,
				parallel_tool_calls: metadata?.parallelToolCalls ?? true,
			}
			if (this.options.lmStudioSpeculativeDecodingEnabled && this.options.lmStudioDraftModelId) {
				params.draft_model = this.options.lmStudioDraftModelId
			}
			let results
			try {
				results = await this.client.chat.completions.create(params)
			} catch (error) {
				throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
			}
			const matcher = new tag_matcher_1.TagMatcher("think", (chunk) => ({
				type: chunk.matched ? "reasoning" : "text",
				text: chunk.data,
			}))
			for await (const chunk of results) {
				const delta = chunk.choices[0]?.delta
				const finishReason = chunk.choices[0]?.finish_reason
				if (delta?.content) {
					assistantText += delta.content
					for (const processedChunk of matcher.update(delta.content)) {
						yield processedChunk
					}
				}
				// Handle tool calls in stream - emit partial chunks for NativeToolCallParser
				if (delta?.tool_calls) {
					for (const toolCall of delta.tool_calls) {
						yield {
							type: "tool_call_partial",
							index: toolCall.index,
							id: toolCall.id,
							name: toolCall.function?.name,
							arguments: toolCall.function?.arguments,
						}
					}
				}
				// Process finish_reason to emit tool_call_end events
				if (finishReason) {
					const endEvents = NativeToolCallParser_1.NativeToolCallParser.processFinishReason(finishReason)
					for (const event of endEvents) {
						yield event
					}
				}
			}
			for (const processedChunk of matcher.final()) {
				yield processedChunk
			}
			let outputTokens = 0
			try {
				outputTokens = await this.countTokens([{ type: "text", text: assistantText }])
			} catch (err) {
				console.error("[LmStudio] Failed to count output tokens:", err)
				outputTokens = 0
			}
			yield {
				type: "usage",
				inputTokens,
				outputTokens,
			}
		} catch (error) {
			throw new Error(
				"Please check the LM Studio developer logs to debug what went wrong. You may need to load the model with a larger context length to work with AliCode's prompts.",
			)
		}
	}
	getModel() {
		const models = (0, modelCache_1.getModelsFromCache)("lmstudio")
		if (models && this.options.lmStudioModelId && models[this.options.lmStudioModelId]) {
			return {
				id: this.options.lmStudioModelId,
				info: models[this.options.lmStudioModelId],
			}
		} else {
			return {
				id: this.options.lmStudioModelId || "",
				info: types_1.openAiModelInfoSaneDefaults,
			}
		}
	}
	async completePrompt(prompt) {
		try {
			// Create params object with optional draft model
			const params = {
				model: this.getModel().id,
				messages: [{ role: "user", content: prompt }],
				temperature: this.options.modelTemperature ?? types_1.LMSTUDIO_DEFAULT_TEMPERATURE,
				stream: false,
			}
			// Add draft model if speculative decoding is enabled and a draft model is specified
			if (this.options.lmStudioSpeculativeDecodingEnabled && this.options.lmStudioDraftModelId) {
				params.draft_model = this.options.lmStudioDraftModelId
			}
			let response
			try {
				response = await this.client.chat.completions.create(params)
			} catch (error) {
				throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
			}
			return response.choices[0]?.message.content || ""
		} catch (error) {
			throw new Error(
				"Please check the LM Studio developer logs to debug what went wrong. You may need to load the model with a larger context length to work with AliCode's prompts.",
			)
		}
	}
}
exports.LmStudioHandler = LmStudioHandler
async function getLmStudioModels(baseUrl = "http://localhost:1234") {
	try {
		if (!URL.canParse(baseUrl)) {
			return []
		}
		const response = await axios_1.default.get(`${baseUrl}/v1/models`)
		const modelsArray = response.data?.data?.map((model) => model.id) || []
		return [...new Set(modelsArray)]
	} catch (error) {
		return []
	}
}
