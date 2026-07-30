"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.checkExistKey = checkExistKey
const types_1 = require("@ali-code/types")
function checkExistKey(config) {
	if (!config) {
		return false
	}
	// Special case for fake-ai, openai-codex, qwen-code, and roo providers which don't need any configuration.
	if (config.apiProvider && ["fake-ai", "openai-codex", "qwen-code"].includes(config.apiProvider)) {
		return true
	}
	// Check all secret keys from the centralized SECRET_STATE_KEYS array.
	// Filter out keys that are not part of ProviderSettings (global secrets are stored separately)
	const providerSecretKeys = types_1.SECRET_STATE_KEYS.filter((key) => !types_1.GLOBAL_SECRET_KEYS.includes(key))
	const hasSecretKey = providerSecretKeys.some((key) => config[key] !== undefined)
	// Check additional non-secret configuration properties
	const hasOtherConfig = [
		config.awsRegion,
		config.vertexProjectId,
		config.ollamaModelId,
		config.lmStudioModelId,
		config.vsCodeLmModelSelector,
	].some((value) => value !== undefined)
	return hasSecretKey || hasOtherConfig
}
