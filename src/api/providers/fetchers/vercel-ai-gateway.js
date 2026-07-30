"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.parseVercelAiGatewayModel = void 0
exports.getVercelAiGatewayModels = getVercelAiGatewayModels
const axios_1 = __importDefault(require("axios"))
const zod_1 = require("zod")
const types_1 = require("@ali-code/types")
const cost_1 = require("../../../shared/cost")
/**
 * VercelAiGatewayPricing
 */
const vercelAiGatewayPricingSchema = zod_1.z.object({
	input: zod_1.z.string().optional(), // Image models don't have an input price.
	output: zod_1.z.string().optional(), // Embedding and image models don't have an output price.
	input_cache_write: zod_1.z.string().optional(),
	input_cache_read: zod_1.z.string().optional(),
	image: zod_1.z.string().optional(), // Only image models have an image price.
})
/**
 * VercelAiGatewayModel
 */
const vercelAiGatewayModelSchema = zod_1.z.object({
	id: zod_1.z.string(),
	object: zod_1.z.string(),
	created: zod_1.z.number(),
	owned_by: zod_1.z.string(),
	name: zod_1.z.string(),
	description: zod_1.z.string(),
	context_window: zod_1.z.number(),
	max_tokens: zod_1.z.number(),
	type: zod_1.z.string(),
	pricing: vercelAiGatewayPricingSchema,
})
/**
 * VercelAiGatewayModelsResponse
 */
const vercelAiGatewayModelsResponseSchema = zod_1.z.object({
	object: zod_1.z.string(),
	data: zod_1.z.array(vercelAiGatewayModelSchema),
})
/**
 * getVercelAiGatewayModels
 */
async function getVercelAiGatewayModels(options) {
	const models = {}
	const baseURL = "https://ai-gateway.vercel.sh/v1"
	try {
		const response = await axios_1.default.get(`${baseURL}/models`)
		const result = vercelAiGatewayModelsResponseSchema.safeParse(response.data)
		const data = result.success ? result.data.data : response.data.data
		if (!result.success) {
			console.error(`Vercel AI Gateway models response is invalid ${JSON.stringify(result.error.format())}`)
		}
		for (const model of data) {
			const { id } = model
			// Only include language models for chat inference.
			// Embedding models are statically defined in embeddingModels.ts.
			if (model.type !== "language") {
				continue
			}
			models[id] = (0, exports.parseVercelAiGatewayModel)({ id, model })
		}
	} catch (error) {
		console.error(
			`Error fetching Vercel AI Gateway models: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
		)
	}
	return models
}
/**
 * parseVercelAiGatewayModel
 */
const parseVercelAiGatewayModel = ({ id, model }) => {
	const cacheWritesPrice = model.pricing?.input_cache_write
		? (0, cost_1.parseApiPrice)(model.pricing?.input_cache_write)
		: undefined
	const cacheReadsPrice = model.pricing?.input_cache_read
		? (0, cost_1.parseApiPrice)(model.pricing?.input_cache_read)
		: undefined
	const supportsPromptCache = typeof cacheWritesPrice !== "undefined" && typeof cacheReadsPrice !== "undefined"
	const supportsImages =
		types_1.VERCEL_AI_GATEWAY_VISION_ONLY_MODELS.has(id) ||
		types_1.VERCEL_AI_GATEWAY_VISION_AND_TOOLS_MODELS.has(id)
	const modelInfo = {
		maxTokens: model.max_tokens,
		contextWindow: model.context_window,
		supportsImages,
		supportsPromptCache,
		inputPrice: (0, cost_1.parseApiPrice)(model.pricing?.input),
		outputPrice: (0, cost_1.parseApiPrice)(model.pricing?.output),
		cacheWritesPrice,
		cacheReadsPrice,
		description: model.description,
	}
	return modelInfo
}
exports.parseVercelAiGatewayModel = parseVercelAiGatewayModel
