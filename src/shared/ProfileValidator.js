"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.ProfileValidator = void 0
class ProfileValidator {
	static isProfileAllowed(profile, allowList) {
		if (allowList.allowAll) {
			return true
		}
		if (!profile.apiProvider) {
			return false
		}
		if (!this.isProviderAllowed(profile.apiProvider, allowList)) {
			return false
		}
		const modelId = this.getModelIdFromProfile(profile)
		if (!modelId) {
			return allowList.providers[profile.apiProvider]?.allowAll === true
		}
		return this.isModelAllowed(profile.apiProvider, modelId, allowList)
	}
	static isProviderAllowed(providerName, allowList) {
		if (allowList.allowAll) {
			return true
		}
		return providerName in allowList.providers
	}
	static isModelAllowed(providerName, modelId, allowList) {
		if (allowList.allowAll) {
			return true
		}
		const providerAllowList = allowList.providers[providerName]
		if (!providerAllowList) {
			return false
		}
		if (providerAllowList.allowAll) {
			return true
		}
		return providerAllowList.models?.includes(modelId) ?? false
	}
	static getModelIdFromProfile(profile) {
		switch (profile.apiProvider) {
			case "openai":
				return profile.openAiModelId
			case "anthropic":
			case "openai-native":
			case "bedrock":
			case "vertex":
			case "gemini":
			case "mistral":
			case "deepseek":
			case "xai":
			case "sambanova":
			case "fireworks":
				return profile.apiModelId
			case "litellm":
				return profile.litellmModelId
			case "lmstudio":
				return profile.lmStudioModelId
			case "vscode-lm":
				// We probably need something more flexible for this one, if we need to really support it here.
				return profile.vsCodeLmModelSelector?.id
			case "openrouter":
				return profile.openRouterModelId
			case "ollama":
				return profile.ollamaModelId
			case "requesty":
				return profile.requestyModelId
			case "unbound":
				return profile.unboundModelId
			case "fake-ai":
			default:
				return undefined
		}
	}
}
exports.ProfileValidator = ProfileValidator
