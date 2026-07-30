"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.XAIHandler = void 0
const openai_1 = __importDefault(require("openai"))
const types_1 = require("@ali-code/types")
const responses_api_input_1 = require("../transform/responses-api-input")
const responses_api_stream_1 = require("../transform/responses-api-stream")
const model_params_1 = require("../transform/model-params")
const constants_1 = require("./constants")
const base_provider_1 = require("./base-provider")
const openai_error_handler_1 = require("./utils/openai-error-handler")
const mcp_name_1 = require("../../utils/mcp-name")
const XAI_DEFAULT_TEMPERATURE = 0
class XAIHandler extends base_provider_1.BaseProvider {
	options
	client
	providerName = "xAI"
	constructor(options) {
		super()
		this.options = options
		const apiKey = this.options.xaiApiKey ?? "not-provided"
		this.client = new openai_1.default({
			baseURL: "https://api.x.ai/v1",
			apiKey: apiKey,
			defaultHeaders: constants_1.DEFAULT_HEADERS,
		})
	}
	getModel() {
		const id =
			this.options.apiModelId && this.options.apiModelId in types_1.xaiModels
				? this.options.apiModelId
				: types_1.xaiDefaultModelId
		const info = types_1.xaiModels[id]
		const params = (0, model_params_1.getModelParams)({
			format: "openai",
			modelId: id,
			model: info,
			settings: this.options,
			defaultTemperature: XAI_DEFAULT_TEMPERATURE,
		})
		return { id, info, ...params }
	}
	/**
	 * Convert tools from OpenAI Chat Completions format to Responses API format.
	 * Chat Completions: { type: "function", function: { name, description, parameters } }
	 * Responses API: { type: "function", name, description, parameters }
	 *
	 * Uses base provider's convertToolSchemaForOpenAI() for schema hardening
	 * (additionalProperties: false, ensureAllRequired) and handles MCP tools.
	 */
	mapResponseTools(tools) {
		const converted = this.convertToolsForOpenAI(tools)
		if (!converted?.length) {
			return undefined
		}
		return converted
			.filter((tool) => tool?.type === "function")
			.map((tool) => {
				const isMcp = (0, mcp_name_1.isMcpTool)(tool.function.name)
				return {
					type: "function",
					name: tool.function.name,
					description: tool.function.description,
					parameters: isMcp
						? tool.function.parameters
						: this.convertToolSchemaForOpenAI(tool.function.parameters),
					strict: !isMcp,
				}
			})
	}
	async *createMessage(systemPrompt, messages, metadata) {
		const model = this.getModel()
		// Convert directly from Anthropic format to Responses API input format
		const input = (0, responses_api_input_1.convertToResponsesApiInput)(messages)
		const responseTools = this.mapResponseTools(metadata?.tools)
		// Build request options
		const requestBody = {
			model: model.id,
			instructions: systemPrompt,
			input: input,
			stream: true,
			store: false, // Don't store responses server-side for privacy
			include: ["reasoning.encrypted_content"],
		}
		if (model.maxTokens) {
			requestBody.max_output_tokens = model.maxTokens
		}
		if (model.temperature !== undefined) {
			requestBody.temperature = model.temperature
		}
		if (responseTools) {
			requestBody.tools = responseTools
			// Cast tool_choice since metadata uses Chat Completions types but Responses API has its own type
			requestBody.tool_choice = metadata?.tool_choice ?? "auto"
			requestBody.parallel_tool_calls = metadata?.parallelToolCalls ?? true
		}
		// Pass reasoning effort for models that support it (e.g., mini models)
		if (model.reasoning) {
			requestBody.reasoning = model.reasoning
		}
		let stream
		try {
			stream = await this.client.responses.create({
				...requestBody,
				stream: true,
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
		}
		const normalizeUsage = (0, responses_api_stream_1.createUsageNormalizer)()
		yield* (0, responses_api_stream_1.processResponsesApiStream)(stream, normalizeUsage)
	}
	async completePrompt(prompt) {
		const model = this.getModel()
		try {
			const response = await this.client.responses.create({
				model: model.id,
				input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
				store: false,
			})
			// output_text is a convenience field on the Responses API response
			return response.output_text || ""
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			throw (0, openai_error_handler_1.handleOpenAIError)(error, this.providerName)
		}
	}
}
exports.XAIHandler = XAIHandler
