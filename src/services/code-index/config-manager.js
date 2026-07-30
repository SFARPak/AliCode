"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.CodeIndexConfigManager = void 0
const constants_1 = require("./constants")
const embeddingModels_1 = require("../../shared/embeddingModels")
/**
 * Manages configuration state and validation for the code indexing feature.
 * Handles loading, validating, and providing access to configuration values.
 */
class CodeIndexConfigManager {
	contextProxy
	codebaseIndexEnabled = false
	embedderProvider = "openai"
	modelId
	modelDimension
	openAiOptions
	ollamaOptions
	openAiCompatibleOptions
	geminiOptions
	mistralOptions
	vercelAiGatewayOptions
	bedrockOptions
	openRouterOptions
	qdrantUrl = "http://localhost:6333"
	qdrantApiKey
	searchMinScore
	searchMaxResults
	constructor(contextProxy) {
		this.contextProxy = contextProxy
		// Initialize with current configuration to avoid false restart triggers
		this._loadAndSetConfiguration()
	}
	/**
	 * Gets the context proxy instance
	 */
	getContextProxy() {
		return this.contextProxy
	}
	/**
	 * Private method that handles loading configuration from storage and updating instance variables.
	 * This eliminates code duplication between initializeWithCurrentConfig() and loadConfiguration().
	 */
	_loadAndSetConfiguration() {
		// Load configuration from storage
		const codebaseIndexConfig = this.contextProxy?.getGlobalState("codebaseIndexConfig") ?? {
			codebaseIndexEnabled: false,
			codebaseIndexQdrantUrl: "http://localhost:6333",
			codebaseIndexEmbedderProvider: "openai",
			codebaseIndexEmbedderBaseUrl: "",
			codebaseIndexEmbedderModelId: "",
			codebaseIndexSearchMinScore: undefined,
			codebaseIndexSearchMaxResults: undefined,
			codebaseIndexBedrockRegion: "us-east-1",
			codebaseIndexBedrockProfile: "",
		}
		const {
			codebaseIndexEnabled,
			codebaseIndexQdrantUrl,
			codebaseIndexEmbedderProvider,
			codebaseIndexEmbedderBaseUrl,
			codebaseIndexEmbedderModelId,
			codebaseIndexSearchMinScore,
			codebaseIndexSearchMaxResults,
		} = codebaseIndexConfig
		const openAiKey = this.contextProxy?.getSecret("codeIndexOpenAiKey") ?? ""
		const qdrantApiKey = this.contextProxy?.getSecret("codeIndexQdrantApiKey") ?? ""
		// Fix: Read OpenAI Compatible settings from the correct location within codebaseIndexConfig
		const openAiCompatibleBaseUrl = codebaseIndexConfig.codebaseIndexOpenAiCompatibleBaseUrl ?? ""
		const openAiCompatibleApiKey = this.contextProxy?.getSecret("codebaseIndexOpenAiCompatibleApiKey") ?? ""
		const geminiApiKey = this.contextProxy?.getSecret("codebaseIndexGeminiApiKey") ?? ""
		const mistralApiKey = this.contextProxy?.getSecret("codebaseIndexMistralApiKey") ?? ""
		const vercelAiGatewayApiKey = this.contextProxy?.getSecret("codebaseIndexVercelAiGatewayApiKey") ?? ""
		const bedrockRegion = codebaseIndexConfig.codebaseIndexBedrockRegion ?? "us-east-1"
		const bedrockProfile = codebaseIndexConfig.codebaseIndexBedrockProfile ?? ""
		const openRouterApiKey = this.contextProxy?.getSecret("codebaseIndexOpenRouterApiKey") ?? ""
		const openRouterSpecificProvider = codebaseIndexConfig.codebaseIndexOpenRouterSpecificProvider ?? ""
		// Update instance variables with configuration
		this.codebaseIndexEnabled = codebaseIndexEnabled ?? false
		this.qdrantUrl = codebaseIndexQdrantUrl
		this.qdrantApiKey = qdrantApiKey ?? ""
		this.searchMinScore = codebaseIndexSearchMinScore
		this.searchMaxResults = codebaseIndexSearchMaxResults
		// Validate and set model dimension
		const rawDimension = codebaseIndexConfig.codebaseIndexEmbedderModelDimension
		if (rawDimension !== undefined && rawDimension !== null) {
			const dimension = Number(rawDimension)
			if (!isNaN(dimension) && dimension > 0) {
				this.modelDimension = dimension
			} else {
				console.warn(
					`Invalid codebaseIndexEmbedderModelDimension value: ${rawDimension}. Must be a positive number.`,
				)
				this.modelDimension = undefined
			}
		} else {
			this.modelDimension = undefined
		}
		this.openAiOptions = { openAiNativeApiKey: openAiKey }
		// Set embedder provider with support for openai-compatible
		if (codebaseIndexEmbedderProvider === "ollama") {
			this.embedderProvider = "ollama"
		} else if (codebaseIndexEmbedderProvider === "openai-compatible") {
			this.embedderProvider = "openai-compatible"
		} else if (codebaseIndexEmbedderProvider === "gemini") {
			this.embedderProvider = "gemini"
		} else if (codebaseIndexEmbedderProvider === "mistral") {
			this.embedderProvider = "mistral"
		} else if (codebaseIndexEmbedderProvider === "vercel-ai-gateway") {
			this.embedderProvider = "vercel-ai-gateway"
		} else if (codebaseIndexEmbedderProvider === "bedrock") {
			this.embedderProvider = "bedrock"
		} else if (codebaseIndexEmbedderProvider === "openrouter") {
			this.embedderProvider = "openrouter"
		} else {
			this.embedderProvider = "openai"
		}
		this.modelId = codebaseIndexEmbedderModelId || undefined
		this.ollamaOptions = {
			ollamaBaseUrl: codebaseIndexEmbedderBaseUrl,
		}
		this.openAiCompatibleOptions =
			openAiCompatibleBaseUrl && openAiCompatibleApiKey
				? {
						baseUrl: openAiCompatibleBaseUrl,
						apiKey: openAiCompatibleApiKey,
					}
				: undefined
		this.geminiOptions = geminiApiKey ? { apiKey: geminiApiKey } : undefined
		this.mistralOptions = mistralApiKey ? { apiKey: mistralApiKey } : undefined
		this.vercelAiGatewayOptions = vercelAiGatewayApiKey ? { apiKey: vercelAiGatewayApiKey } : undefined
		this.openRouterOptions = openRouterApiKey
			? { apiKey: openRouterApiKey, specificProvider: openRouterSpecificProvider || undefined }
			: undefined
		// Set bedrockOptions if region is provided (profile is optional)
		this.bedrockOptions = bedrockRegion
			? { region: bedrockRegion, profile: bedrockProfile || undefined }
			: undefined
	}
	/**
	 * Loads persisted configuration from globalState.
	 */
	async loadConfiguration() {
		// Capture the ACTUAL previous state before loading new configuration
		const previousConfigSnapshot = {
			enabled: this.codebaseIndexEnabled,
			configured: this.isConfigured(),
			embedderProvider: this.embedderProvider,
			modelId: this.modelId,
			modelDimension: this.modelDimension,
			openAiKey: this.openAiOptions?.openAiNativeApiKey ?? "",
			ollamaBaseUrl: this.ollamaOptions?.ollamaBaseUrl ?? "",
			openAiCompatibleBaseUrl: this.openAiCompatibleOptions?.baseUrl ?? "",
			openAiCompatibleApiKey: this.openAiCompatibleOptions?.apiKey ?? "",
			geminiApiKey: this.geminiOptions?.apiKey ?? "",
			mistralApiKey: this.mistralOptions?.apiKey ?? "",
			vercelAiGatewayApiKey: this.vercelAiGatewayOptions?.apiKey ?? "",
			bedrockRegion: this.bedrockOptions?.region ?? "",
			bedrockProfile: this.bedrockOptions?.profile ?? "",
			openRouterApiKey: this.openRouterOptions?.apiKey ?? "",
			openRouterSpecificProvider: this.openRouterOptions?.specificProvider ?? "",
			qdrantUrl: this.qdrantUrl ?? "",
			qdrantApiKey: this.qdrantApiKey ?? "",
		}
		// Refresh secrets from VSCode storage to ensure we have the latest values
		await this.contextProxy.refreshSecrets()
		// Load new configuration from storage and update instance variables
		this._loadAndSetConfiguration()
		const requiresRestart = this.doesConfigChangeRequireRestart(previousConfigSnapshot)
		return {
			configSnapshot: previousConfigSnapshot,
			currentConfig: {
				isConfigured: this.isConfigured(),
				embedderProvider: this.embedderProvider,
				modelId: this.modelId,
				modelDimension: this.modelDimension,
				openAiOptions: this.openAiOptions,
				ollamaOptions: this.ollamaOptions,
				openAiCompatibleOptions: this.openAiCompatibleOptions,
				geminiOptions: this.geminiOptions,
				mistralOptions: this.mistralOptions,
				vercelAiGatewayOptions: this.vercelAiGatewayOptions,
				bedrockOptions: this.bedrockOptions,
				openRouterOptions: this.openRouterOptions,
				qdrantUrl: this.qdrantUrl,
				qdrantApiKey: this.qdrantApiKey,
				searchMinScore: this.currentSearchMinScore,
			},
			requiresRestart,
		}
	}
	/**
	 * Checks if the service is properly configured based on the embedder type.
	 */
	isConfigured() {
		if (this.embedderProvider === "openai") {
			const openAiKey = this.openAiOptions?.openAiNativeApiKey
			const qdrantUrl = this.qdrantUrl
			return !!(openAiKey && qdrantUrl)
		} else if (this.embedderProvider === "ollama") {
			// Ollama model ID has a default, so only base URL is strictly required for config
			const ollamaBaseUrl = this.ollamaOptions?.ollamaBaseUrl
			const qdrantUrl = this.qdrantUrl
			return !!(ollamaBaseUrl && qdrantUrl)
		} else if (this.embedderProvider === "openai-compatible") {
			const baseUrl = this.openAiCompatibleOptions?.baseUrl
			const apiKey = this.openAiCompatibleOptions?.apiKey
			const qdrantUrl = this.qdrantUrl
			const isConfigured = !!(baseUrl && apiKey && qdrantUrl)
			return isConfigured
		} else if (this.embedderProvider === "gemini") {
			const apiKey = this.geminiOptions?.apiKey
			const qdrantUrl = this.qdrantUrl
			const isConfigured = !!(apiKey && qdrantUrl)
			return isConfigured
		} else if (this.embedderProvider === "mistral") {
			const apiKey = this.mistralOptions?.apiKey
			const qdrantUrl = this.qdrantUrl
			const isConfigured = !!(apiKey && qdrantUrl)
			return isConfigured
		} else if (this.embedderProvider === "vercel-ai-gateway") {
			const apiKey = this.vercelAiGatewayOptions?.apiKey
			const qdrantUrl = this.qdrantUrl
			const isConfigured = !!(apiKey && qdrantUrl)
			return isConfigured
		} else if (this.embedderProvider === "bedrock") {
			// Only region is required for Bedrock (profile is optional)
			const region = this.bedrockOptions?.region
			const qdrantUrl = this.qdrantUrl
			const isConfigured = !!(region && qdrantUrl)
			return isConfigured
		} else if (this.embedderProvider === "openrouter") {
			const apiKey = this.openRouterOptions?.apiKey
			const qdrantUrl = this.qdrantUrl
			const isConfigured = !!(apiKey && qdrantUrl)
			return isConfigured
		}
		return false // Should not happen if embedderProvider is always set correctly
	}
	/**
	 * Determines if a configuration change requires restarting the indexing process.
	 * Simplified logic: only restart for critical changes that affect service functionality.
	 *
	 * CRITICAL CHANGES (require restart):
	 * - Provider changes (openai -> ollama, etc.)
	 * - Authentication changes (API keys, base URLs)
	 * - Vector dimension changes (model changes that affect embedding size)
	 * - Qdrant connection changes (URL, API key)
	 * - Feature enable/disable transitions
	 *
	 * MINOR CHANGES (no restart needed):
	 * - Search minimum score adjustments
	 * - UI-only settings
	 * - Non-functional configuration tweaks
	 */
	doesConfigChangeRequireRestart(prev) {
		const nowConfigured = this.isConfigured()
		// Handle null/undefined values safely
		const prevEnabled = prev?.enabled ?? false
		const prevConfigured = prev?.configured ?? false
		const prevProvider = prev?.embedderProvider ?? "openai"
		const prevOpenAiKey = prev?.openAiKey ?? ""
		const prevOllamaBaseUrl = prev?.ollamaBaseUrl ?? ""
		const prevOpenAiCompatibleBaseUrl = prev?.openAiCompatibleBaseUrl ?? ""
		const prevOpenAiCompatibleApiKey = prev?.openAiCompatibleApiKey ?? ""
		const prevModelDimension = prev?.modelDimension
		const prevGeminiApiKey = prev?.geminiApiKey ?? ""
		const prevMistralApiKey = prev?.mistralApiKey ?? ""
		const prevVercelAiGatewayApiKey = prev?.vercelAiGatewayApiKey ?? ""
		const prevBedrockRegion = prev?.bedrockRegion ?? ""
		const prevBedrockProfile = prev?.bedrockProfile ?? ""
		const prevOpenRouterApiKey = prev?.openRouterApiKey ?? ""
		const prevOpenRouterSpecificProvider = prev?.openRouterSpecificProvider ?? ""
		const prevQdrantUrl = prev?.qdrantUrl ?? ""
		const prevQdrantApiKey = prev?.qdrantApiKey ?? ""
		// 1. Transition from disabled/unconfigured to enabled/configured
		if ((!prevEnabled || !prevConfigured) && this.codebaseIndexEnabled && nowConfigured) {
			return true
		}
		// 2. Transition from enabled to disabled
		if (prevEnabled && !this.codebaseIndexEnabled) {
			return true
		}
		// 3. If wasn't ready before and isn't ready now, no restart needed
		if ((!prevEnabled || !prevConfigured) && (!this.codebaseIndexEnabled || !nowConfigured)) {
			return false
		}
		// 4. CRITICAL CHANGES - Always restart for these
		// Only check for critical changes if feature is enabled
		if (!this.codebaseIndexEnabled) {
			return false
		}
		// Provider change
		if (prevProvider !== this.embedderProvider) {
			return true
		}
		// Authentication changes (API keys)
		const currentOpenAiKey = this.openAiOptions?.openAiNativeApiKey ?? ""
		const currentOllamaBaseUrl = this.ollamaOptions?.ollamaBaseUrl ?? ""
		const currentOpenAiCompatibleBaseUrl = this.openAiCompatibleOptions?.baseUrl ?? ""
		const currentOpenAiCompatibleApiKey = this.openAiCompatibleOptions?.apiKey ?? ""
		const currentModelDimension = this.modelDimension
		const currentGeminiApiKey = this.geminiOptions?.apiKey ?? ""
		const currentMistralApiKey = this.mistralOptions?.apiKey ?? ""
		const currentVercelAiGatewayApiKey = this.vercelAiGatewayOptions?.apiKey ?? ""
		const currentBedrockRegion = this.bedrockOptions?.region ?? ""
		const currentBedrockProfile = this.bedrockOptions?.profile ?? ""
		const currentOpenRouterApiKey = this.openRouterOptions?.apiKey ?? ""
		const currentOpenRouterSpecificProvider = this.openRouterOptions?.specificProvider ?? ""
		const currentQdrantUrl = this.qdrantUrl ?? ""
		const currentQdrantApiKey = this.qdrantApiKey ?? ""
		if (prevOpenAiKey !== currentOpenAiKey) {
			return true
		}
		if (prevOllamaBaseUrl !== currentOllamaBaseUrl) {
			return true
		}
		if (
			prevOpenAiCompatibleBaseUrl !== currentOpenAiCompatibleBaseUrl ||
			prevOpenAiCompatibleApiKey !== currentOpenAiCompatibleApiKey
		) {
			return true
		}
		if (prevGeminiApiKey !== currentGeminiApiKey) {
			return true
		}
		if (prevMistralApiKey !== currentMistralApiKey) {
			return true
		}
		if (prevVercelAiGatewayApiKey !== currentVercelAiGatewayApiKey) {
			return true
		}
		if (prevBedrockRegion !== currentBedrockRegion || prevBedrockProfile !== currentBedrockProfile) {
			return true
		}
		if (prevOpenRouterApiKey !== currentOpenRouterApiKey) {
			return true
		}
		// OpenRouter specific provider change
		if (prevOpenRouterSpecificProvider !== currentOpenRouterSpecificProvider) {
			return true
		}
		// Check for model dimension changes (generic for all providers)
		if (prevModelDimension !== currentModelDimension) {
			return true
		}
		if (prevQdrantUrl !== currentQdrantUrl || prevQdrantApiKey !== currentQdrantApiKey) {
			return true
		}
		// Vector dimension changes (still important for compatibility)
		if (this._hasVectorDimensionChanged(prevProvider, prev?.modelId)) {
			return true
		}
		return false
	}
	/**
	 * Checks if model changes result in vector dimension changes that require restart.
	 */
	_hasVectorDimensionChanged(prevProvider, prevModelId) {
		const currentProvider = this.embedderProvider
		const currentModelId = this.modelId ?? (0, embeddingModels_1.getDefaultModelId)(currentProvider)
		const resolvedPrevModelId = prevModelId ?? (0, embeddingModels_1.getDefaultModelId)(prevProvider)
		// If model IDs are the same and provider is the same, no dimension change
		if (prevProvider === currentProvider && resolvedPrevModelId === currentModelId) {
			return false
		}
		// Get vector dimensions for both models
		const prevDimension = (0, embeddingModels_1.getModelDimension)(prevProvider, resolvedPrevModelId)
		const currentDimension = (0, embeddingModels_1.getModelDimension)(currentProvider, currentModelId)
		// If we can't determine dimensions, be safe and restart
		if (prevDimension === undefined || currentDimension === undefined) {
			return true
		}
		// Only restart if dimensions actually changed
		return prevDimension !== currentDimension
	}
	/**
	 * Gets the current configuration state.
	 */
	getConfig() {
		return {
			isConfigured: this.isConfigured(),
			embedderProvider: this.embedderProvider,
			modelId: this.modelId,
			modelDimension: this.modelDimension,
			openAiOptions: this.openAiOptions,
			ollamaOptions: this.ollamaOptions,
			openAiCompatibleOptions: this.openAiCompatibleOptions,
			geminiOptions: this.geminiOptions,
			mistralOptions: this.mistralOptions,
			vercelAiGatewayOptions: this.vercelAiGatewayOptions,
			bedrockOptions: this.bedrockOptions,
			openRouterOptions: this.openRouterOptions,
			qdrantUrl: this.qdrantUrl,
			qdrantApiKey: this.qdrantApiKey,
			searchMinScore: this.currentSearchMinScore,
			searchMaxResults: this.currentSearchMaxResults,
		}
	}
	/**
	 * Gets whether the code indexing feature is enabled
	 */
	get isFeatureEnabled() {
		return this.codebaseIndexEnabled
	}
	/**
	 * Gets whether the code indexing feature is properly configured
	 */
	get isFeatureConfigured() {
		return this.isConfigured()
	}
	/**
	 * Gets the current embedder type (openai or ollama)
	 */
	get currentEmbedderProvider() {
		return this.embedderProvider
	}
	/**
	 * Gets the current Qdrant configuration
	 */
	get qdrantConfig() {
		return {
			url: this.qdrantUrl,
			apiKey: this.qdrantApiKey,
		}
	}
	/**
	 * Gets the current model ID being used for embeddings.
	 */
	get currentModelId() {
		return this.modelId
	}
	/**
	 * Gets the current model dimension being used for embeddings.
	 * Returns the model's built-in dimension if available, otherwise falls back to custom dimension.
	 */
	get currentModelDimension() {
		// First try to get the model-specific dimension
		const modelId = this.modelId ?? (0, embeddingModels_1.getDefaultModelId)(this.embedderProvider)
		const modelDimension = (0, embeddingModels_1.getModelDimension)(this.embedderProvider, modelId)
		// Only use custom dimension if model doesn't have a built-in dimension
		if (!modelDimension && this.modelDimension && this.modelDimension > 0) {
			return this.modelDimension
		}
		return modelDimension
	}
	/**
	 * Gets the configured minimum search score based on user setting, model-specific threshold, or fallback.
	 * Priority: 1) User setting, 2) Model-specific threshold, 3) Default DEFAULT_SEARCH_MIN_SCORE constant.
	 */
	get currentSearchMinScore() {
		// First check if user has configured a custom score threshold
		if (this.searchMinScore !== undefined) {
			return this.searchMinScore
		}
		// Fall back to model-specific threshold
		const currentModelId = this.modelId ?? (0, embeddingModels_1.getDefaultModelId)(this.embedderProvider)
		const modelSpecificThreshold = (0, embeddingModels_1.getModelScoreThreshold)(
			this.embedderProvider,
			currentModelId,
		)
		return modelSpecificThreshold ?? constants_1.DEFAULT_SEARCH_MIN_SCORE
	}
	/**
	 * Gets the configured maximum search results.
	 * Returns user setting if configured, otherwise returns default.
	 */
	get currentSearchMaxResults() {
		return this.searchMaxResults ?? constants_1.DEFAULT_MAX_SEARCH_RESULTS
	}
}
exports.CodeIndexConfigManager = CodeIndexConfigManager
