"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.parseOpenRouterModel = exports.openRouterModelEndpointSchema = exports.openRouterModelSchema = void 0
exports.getOpenRouterModels = getOpenRouterModels
exports.getOpenRouterModelEndpoints = getOpenRouterModelEndpoints
const axios_1 = __importDefault(require("axios"))
const zod_1 = require("zod")
const types_1 = require("@ali-code/types")
const cost_1 = require("../../../shared/cost")
/**
 * OpenRouterBaseModel
 */
const openRouterArchitectureSchema = zod_1.z.object({
	input_modalities: zod_1.z.array(zod_1.z.string()).nullish(),
	output_modalities: zod_1.z.array(zod_1.z.string()).nullish(),
	tokenizer: zod_1.z.string().nullish(),
})
const openRouterPricingSchema = zod_1.z.object({
	prompt: zod_1.z.string().nullish(),
	completion: zod_1.z.string().nullish(),
	input_cache_write: zod_1.z.string().nullish(),
	input_cache_read: zod_1.z.string().nullish(),
})
const modelRouterBaseModelSchema = zod_1.z.object({
	name: zod_1.z.string(),
	description: zod_1.z.string().optional(),
	context_length: zod_1.z.number(),
	max_completion_tokens: zod_1.z.number().nullish(),
	pricing: openRouterPricingSchema.optional(),
})
/**
 * OpenRouterModel
 */
exports.openRouterModelSchema = modelRouterBaseModelSchema.extend({
	id: zod_1.z.string(),
	architecture: openRouterArchitectureSchema.optional(),
	top_provider: zod_1.z.object({ max_completion_tokens: zod_1.z.number().nullish() }).optional(),
	supported_parameters: zod_1.z.array(zod_1.z.string()).optional(),
})
/**
 * OpenRouterModelEndpoint
 */
exports.openRouterModelEndpointSchema = modelRouterBaseModelSchema.extend({
	provider_name: zod_1.z.string(),
	tag: zod_1.z.string().optional(),
})
/**
 * OpenRouterModelsResponse
 */
const openRouterModelsResponseSchema = zod_1.z.object({
	data: zod_1.z.array(exports.openRouterModelSchema),
})
/**
 * OpenRouterModelEndpointsResponse
 */
const openRouterModelEndpointsResponseSchema = zod_1.z.object({
	data: zod_1.z.object({
		id: zod_1.z.string(),
		name: zod_1.z.string(),
		description: zod_1.z.string().optional(),
		architecture: openRouterArchitectureSchema.optional(),
		supported_parameters: zod_1.z.array(zod_1.z.string()).optional(),
		endpoints: zod_1.z.array(exports.openRouterModelEndpointSchema),
	}),
})
/**
 * getOpenRouterModels
 */
async function getOpenRouterModels(options) {
	const models = {}
	const baseURL = options?.openRouterBaseUrl || "https://openrouter.ai/api/v1"
	try {
		const response = await axios_1.default.get(`${baseURL}/models`)
		const result = openRouterModelsResponseSchema.safeParse(response.data)
		const data = result.success ? result.data.data : response.data.data
		if (!result.success) {
			console.error("OpenRouter models response is invalid", result.error.format())
		}
		for (const model of data) {
			const { id, architecture, top_provider, supported_parameters = [] } = model
			// Skip image generation models (models that output images)
			if (architecture?.output_modalities?.includes("image")) {
				continue
			}
			const parsedModel = (0, exports.parseOpenRouterModel)({
				id,
				model,
				inputModality: architecture?.input_modalities,
				outputModality: architecture?.output_modalities,
				maxTokens: top_provider?.max_completion_tokens,
				supportedParameters: supported_parameters,
			})
			models[id] = parsedModel
		}
	} catch (error) {
		console.error(
			`Error fetching OpenRouter models: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
		)
	}
	return models
}
/**
 * getOpenRouterModelEndpoints
 */
async function getOpenRouterModelEndpoints(modelId, options) {
	const models = {}
	const baseURL = options?.openRouterBaseUrl || "https://openrouter.ai/api/v1"
	try {
		const response = await axios_1.default.get(`${baseURL}/models/${modelId}/endpoints`)
		const result = openRouterModelEndpointsResponseSchema.safeParse(response.data)
		const data = result.success ? result.data.data : response.data.data
		if (!result.success) {
			console.error("OpenRouter model endpoints response is invalid", result.error.format())
		}
		const { id, architecture, endpoints } = data
		// Skip image generation models (models that output images)
		if (architecture?.output_modalities?.includes("image")) {
			return models
		}
		for (const endpoint of endpoints) {
			models[endpoint.tag ?? endpoint.provider_name] = (0, exports.parseOpenRouterModel)({
				id,
				model: endpoint,
				inputModality: architecture?.input_modalities,
				outputModality: architecture?.output_modalities,
				maxTokens: endpoint.max_completion_tokens,
			})
		}
	} catch (error) {
		console.error(
			`Error fetching OpenRouter model endpoints: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
		)
	}
	return models
}
/**
 * parseOpenRouterModel
 */
const parseOpenRouterModel = ({ id, model, inputModality, outputModality, maxTokens, supportedParameters }) => {
	const cacheWritesPrice = model.pricing?.input_cache_write
		? (0, cost_1.parseApiPrice)(model.pricing?.input_cache_write)
		: undefined
	const cacheReadsPrice = model.pricing?.input_cache_read
		? (0, cost_1.parseApiPrice)(model.pricing?.input_cache_read)
		: undefined
	const supportsPromptCache = typeof cacheReadsPrice !== "undefined" // some models support caching but don't charge a cacheWritesPrice, e.g. GPT-5
	const modelInfo = {
		maxTokens: maxTokens || Math.ceil(model.context_length * 0.2),
		contextWindow: model.context_length,
		supportsImages: inputModality?.includes("image") ?? false,
		supportsPromptCache,
		inputPrice: (0, cost_1.parseApiPrice)(model.pricing?.prompt),
		outputPrice: (0, cost_1.parseApiPrice)(model.pricing?.completion),
		cacheWritesPrice,
		cacheReadsPrice,
		description: model.description,
		supportsReasoningEffort: supportedParameters ? supportedParameters.includes("reasoning") : undefined,
		supportedParameters: supportedParameters ? supportedParameters.filter(types_1.isModelParameter) : undefined,
	}
	if (types_1.OPEN_ROUTER_REASONING_BUDGET_MODELS.has(id)) {
		modelInfo.supportsReasoningBudget = true
	}
	if (types_1.OPEN_ROUTER_REQUIRED_REASONING_BUDGET_MODELS.has(id)) {
		modelInfo.requiredReasoningBudget = true
	}
	// For backwards compatibility with the old model definitions we will
	// continue to disable extending thinking for anthropic/claude-3.7-sonnet
	// and force it for anthropic/claude-3.7-sonnet:thinking.
	if (id === "anthropic/claude-3.7-sonnet") {
		modelInfo.maxTokens = types_1.anthropicModels["claude-3-7-sonnet-20250219"].maxTokens
		modelInfo.supportsReasoningBudget = false
		modelInfo.supportsReasoningEffort = false
	}
	if (id === "anthropic/claude-3.7-sonnet:thinking") {
		modelInfo.maxTokens = types_1.anthropicModels["claude-3-7-sonnet-20250219:thinking"].maxTokens
	}
	// Set claude-sonnet-4.6 model to use the correct configuration
	if (id === "anthropic/claude-sonnet-4.6") {
		modelInfo.maxTokens = types_1.anthropicModels["claude-sonnet-4-6"].maxTokens
	}
	// Set claude-opus-4.1 model to use the correct configuration
	if (id === "anthropic/claude-opus-4.1") {
		modelInfo.maxTokens = types_1.anthropicModels["claude-opus-4-1-20250805"].maxTokens
	}
	// Set claude-opus-4.5 model to use the correct configuration
	if (id === "anthropic/claude-opus-4.5") {
		modelInfo.maxTokens = types_1.anthropicModels["claude-opus-4-5-20251101"].maxTokens
	}
	// Set claude-opus-4.6 model to use the correct configuration
	if (id === "anthropic/claude-opus-4.6") {
		modelInfo.maxTokens = types_1.anthropicModels["claude-opus-4-6"].maxTokens
	}
	// Ensure correct reasoning handling for Claude Haiku 4.5 on OpenRouter
	// Use budget control and disable effort-based reasoning fallback
	if (id === "anthropic/claude-haiku-4.5") {
		modelInfo.supportsReasoningBudget = true
		modelInfo.supportsReasoningEffort = false
	}
	// Set horizon-alpha model to 32k max tokens
	if (id === "openrouter/horizon-alpha") {
		modelInfo.maxTokens = 32768
	}
	// Set horizon-beta model to 32k max tokens
	if (id === "openrouter/horizon-beta") {
		modelInfo.maxTokens = 32768
	}
	return modelInfo
}
exports.parseOpenRouterModel = parseOpenRouterModel
