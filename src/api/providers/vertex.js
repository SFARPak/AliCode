"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.VertexHandler = void 0
const types_1 = require("@ali-code/types")
const model_params_1 = require("../transform/model-params")
const gemini_1 = require("./gemini")
class VertexHandler extends gemini_1.GeminiHandler {
	constructor(options) {
		super({ ...options, isVertex: true })
	}
	getModel() {
		const modelId = this.options.apiModelId
		let id = modelId && modelId in types_1.vertexModels ? modelId : types_1.vertexDefaultModelId
		let info = types_1.vertexModels[id]
		const params = (0, model_params_1.getModelParams)({
			format: "gemini",
			modelId: id,
			model: info,
			settings: this.options,
			defaultTemperature: info.defaultTemperature ?? 1,
		})
		// Vertex Gemini models perform better with the edit tool instead of apply_diff.
		info = {
			...info,
			excludedTools: [...new Set([...(info.excludedTools || []), "apply_diff"])],
			includedTools: [...new Set([...(info.includedTools || []), "edit"])],
		}
		// The `:thinking` suffix indicates that the model is a "Hybrid"
		// reasoning model and that reasoning is required to be enabled.
		// The actual model ID honored by Gemini's API does not have this
		// suffix.
		return { id: id.endsWith(":thinking") ? id.replace(":thinking", "") : id, info, ...params }
	}
}
exports.VertexHandler = VertexHandler
