"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.getModelMaxOutputTokens =
	exports.GEMINI_25_PRO_MIN_THINKING_TOKENS =
	exports.DEFAULT_HYBRID_REASONING_MODEL_THINKING_TOKENS =
	exports.DEFAULT_HYBRID_REASONING_MODEL_MAX_TOKENS =
	exports.shouldUseReasoningEffort =
	exports.shouldUseReasoningBudget =
	exports.isRouterName =
		void 0
exports.toRouterName = toRouterName
const types_1 = require("@ali-code/types")
const isRouterName = (value) => (0, types_1.isDynamicProvider)(value) || (0, types_1.isLocalProvider)(value)
exports.isRouterName = isRouterName
function toRouterName(value) {
	if (value && (0, exports.isRouterName)(value)) {
		return value
	}
	throw new Error(`Invalid router name: ${value}`)
}
// Reasoning
const shouldUseReasoningBudget = ({ model, settings }) =>
	!!model.requiredReasoningBudget || (!!model.supportsReasoningBudget && !!settings?.enableReasoningEffort)
exports.shouldUseReasoningBudget = shouldUseReasoningBudget
const shouldUseReasoningEffort = ({ model, settings }) => {
	// Explicit off switch
	if (settings?.enableReasoningEffort === false) return false
	// Selected effort from settings or model default
	const selectedEffort = settings?.reasoningEffort ?? model.reasoningEffort
	// "disable" explicitly omits reasoning
	if (selectedEffort === "disable") return false
	const cap = model.supportsReasoningEffort
	// Capability array: use only if selected is included (treat "none"/"minimal" as valid)
	if (Array.isArray(cap)) {
		return !!selectedEffort && cap.includes(selectedEffort)
	}
	// Boolean capability: true → require a selected effort
	if (model.supportsReasoningEffort === true) {
		return !!selectedEffort
	}
	// Not explicitly supported: only allow when the model itself defines a default effort
	// Ignore settings-only selections when capability is absent/false
	const modelDefaultEffort = model.reasoningEffort
	return !!modelDefaultEffort
}
exports.shouldUseReasoningEffort = shouldUseReasoningEffort
exports.DEFAULT_HYBRID_REASONING_MODEL_MAX_TOKENS = 16_384
exports.DEFAULT_HYBRID_REASONING_MODEL_THINKING_TOKENS = 8_192
exports.GEMINI_25_PRO_MIN_THINKING_TOKENS = 128
// Max Tokens
const getModelMaxOutputTokens = ({ modelId, model, settings, format }) => {
	if ((0, exports.shouldUseReasoningBudget)({ model, settings })) {
		return settings?.modelMaxTokens || exports.DEFAULT_HYBRID_REASONING_MODEL_MAX_TOKENS
	}
	const isAnthropicContext =
		modelId.includes("claude") ||
		format === "anthropic" ||
		(format === "openrouter" && modelId.startsWith("anthropic/"))
	// For "Hybrid" reasoning models, discard the model's actual maxTokens for Anthropic contexts
	if (model.supportsReasoningBudget && isAnthropicContext) {
		return types_1.ANTHROPIC_DEFAULT_MAX_TOKENS
	}
	// For Anthropic contexts, always ensure a maxTokens value is set
	if (isAnthropicContext && (!model.maxTokens || model.maxTokens === 0)) {
		return types_1.ANTHROPIC_DEFAULT_MAX_TOKENS
	}
	// If model has explicit maxTokens, clamp it to 20% of the context window
	// Exception: GPT-5 models should use their exact configured max output tokens
	if (model.maxTokens) {
		// Check if this is a GPT-5 model (case-insensitive)
		const isGpt5Model = modelId.toLowerCase().includes("gpt-5")
		// GPT-5 models bypass the 20% cap and use their full configured max tokens
		if (isGpt5Model) {
			return model.maxTokens
		}
		// All other models are clamped to 20% of context window
		return Math.min(model.maxTokens, Math.ceil(model.contextWindow * 0.2))
	}
	// For non-Anthropic formats without explicit maxTokens, return undefined
	if (format) {
		return undefined
	}
	// Default fallback
	return types_1.ANTHROPIC_DEFAULT_MAX_TOKENS
}
exports.getModelMaxOutputTokens = getModelMaxOutputTokens
// Exhaustive, value-level map for all dynamic providers.
// If a new dynamic provider is added in packages/types, this will fail to compile
// until a corresponding entry is added here.
const dynamicProviderExtras = {
	openrouter: {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
	"vercel-ai-gateway": {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
	litellm: {},
	requesty: {},
	unbound: {},
	ollama: {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
	lmstudio: {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
	poe: {},
}
