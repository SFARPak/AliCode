import { ApiHandlerOptions } from "../../shared/api"
import { ContextProxy } from "../../core/config/ContextProxy"
import { EmbedderProvider } from "./interfaces/manager"
import { CodeIndexConfig, PreviousConfigSnapshot } from "./interfaces/config"
/**
 * Manages configuration state and validation for the code indexing feature.
 * Handles loading, validating, and providing access to configuration values.
 */
export declare class CodeIndexConfigManager {
	private readonly contextProxy
	private codebaseIndexEnabled
	private embedderProvider
	private modelId?
	private modelDimension?
	private openAiOptions?
	private ollamaOptions?
	private openAiCompatibleOptions?
	private geminiOptions?
	private mistralOptions?
	private vercelAiGatewayOptions?
	private bedrockOptions?
	private openRouterOptions?
	private qdrantUrl?
	private qdrantApiKey?
	private searchMinScore?
	private searchMaxResults?
	constructor(contextProxy: ContextProxy)
	/**
	 * Gets the context proxy instance
	 */
	getContextProxy(): ContextProxy
	/**
	 * Private method that handles loading configuration from storage and updating instance variables.
	 * This eliminates code duplication between initializeWithCurrentConfig() and loadConfiguration().
	 */
	private _loadAndSetConfiguration
	/**
	 * Loads persisted configuration from globalState.
	 */
	loadConfiguration(): Promise<{
		configSnapshot: PreviousConfigSnapshot
		currentConfig: {
			isConfigured: boolean
			embedderProvider: EmbedderProvider
			modelId?: string
			modelDimension?: number
			openAiOptions?: ApiHandlerOptions
			ollamaOptions?: ApiHandlerOptions
			openAiCompatibleOptions?: {
				baseUrl: string
				apiKey: string
			}
			geminiOptions?: {
				apiKey: string
			}
			mistralOptions?: {
				apiKey: string
			}
			vercelAiGatewayOptions?: {
				apiKey: string
			}
			bedrockOptions?: {
				region: string
				profile?: string
			}
			openRouterOptions?: {
				apiKey: string
			}
			qdrantUrl?: string
			qdrantApiKey?: string
			searchMinScore?: number
		}
		requiresRestart: boolean
	}>
	/**
	 * Checks if the service is properly configured based on the embedder type.
	 */
	isConfigured(): boolean
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
	doesConfigChangeRequireRestart(prev: PreviousConfigSnapshot): boolean
	/**
	 * Checks if model changes result in vector dimension changes that require restart.
	 */
	private _hasVectorDimensionChanged
	/**
	 * Gets the current configuration state.
	 */
	getConfig(): CodeIndexConfig
	/**
	 * Gets whether the code indexing feature is enabled
	 */
	get isFeatureEnabled(): boolean
	/**
	 * Gets whether the code indexing feature is properly configured
	 */
	get isFeatureConfigured(): boolean
	/**
	 * Gets the current embedder type (openai or ollama)
	 */
	get currentEmbedderProvider(): EmbedderProvider
	/**
	 * Gets the current Qdrant configuration
	 */
	get qdrantConfig(): {
		url?: string
		apiKey?: string
	}
	/**
	 * Gets the current model ID being used for embeddings.
	 */
	get currentModelId(): string | undefined
	/**
	 * Gets the current model dimension being used for embeddings.
	 * Returns the model's built-in dimension if available, otherwise falls back to custom dimension.
	 */
	get currentModelDimension(): number | undefined
	/**
	 * Gets the configured minimum search score based on user setting, model-specific threshold, or fallback.
	 * Priority: 1) User setting, 2) Model-specific threshold, 3) Default DEFAULT_SEARCH_MIN_SCORE constant.
	 */
	get currentSearchMinScore(): number
	/**
	 * Gets the configured maximum search results.
	 * Returns user setting if configured, otherwise returns default.
	 */
	get currentSearchMaxResults(): number
}
//# sourceMappingURL=config-manager.d.ts.map
