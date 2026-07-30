import * as vscode from "vscode"
import { ContextProxy } from "../../core/config/ContextProxy"
import { VectorStoreSearchResult } from "./interfaces"
import { IndexingState } from "./interfaces/manager"
export declare class CodeIndexManager {
	private static instances
	private _configManager
	private readonly _stateManager
	private _serviceFactory
	private _orchestrator
	private _searchService
	private _cacheManager
	private _isRecoveringFromError
	static getInstance(context: vscode.ExtensionContext, workspacePath?: string): CodeIndexManager | undefined
	static getAllInstances(): CodeIndexManager[]
	static disposeAll(): void
	private readonly workspacePath
	private readonly _folderUri
	private readonly context
	private constructor()
	/**
	 * Returns the workspaceState key for per-folder indexing enablement,
	 * keyed by the real workspace folder URI so local/remote schemes cannot collide.
	 */
	private _workspaceEnabledKey
	get isWorkspaceEnabled(): boolean
	setWorkspaceEnabled(enabled: boolean): Promise<void>
	get autoEnableDefault(): boolean
	setAutoEnableDefault(enabled: boolean): Promise<void>
	get onProgressUpdate(): vscode.Event<{
		systemStatus: import("./state-manager").IndexingState
		message: string
		processedItems: number
		totalItems: number
		currentItemUnit: string
	}>
	private assertInitialized
	get state(): IndexingState
	get isFeatureEnabled(): boolean
	get isFeatureConfigured(): boolean
	get isInitialized(): boolean
	/**
	 * Initializes the manager with configuration and dependent services.
	 * Must be called before using any other methods.
	 * @returns Object indicating if a restart is needed
	 */
	initialize(contextProxy: ContextProxy): Promise<{
		requiresRestart: boolean
	}>
	/**
	 * Initiates the indexing process (initial scan and starts watcher).
	 * Automatically recovers from error state if needed before starting.
	 *
	 * @important This method should NEVER be awaited as it starts a long-running background process.
	 * The indexing will continue asynchronously and progress will be reported through events.
	 */
	startIndexing(): Promise<void>
	/**
	 * Stops any in-progress indexing operation and the file watcher.
	 */
	stopIndexing(): void
	/**
	 * Stops the file watcher and potentially cleans up resources.
	 */
	stopWatcher(): void
	/**
	 * Recovers from error state by clearing the error and resetting internal state.
	 * This allows the manager to be re-initialized after a recoverable error.
	 *
	 * This method clears all service instances (configManager, serviceFactory, orchestrator, searchService)
	 * to force a complete re-initialization on the next operation. This ensures a clean slate
	 * after recovering from errors such as network failures or configuration issues.
	 *
	 * @remarks
	 * - Safe to call even when not in error state (idempotent)
	 * - Does not restart indexing automatically - call initialize() after recovery
	 * - Service instances will be recreated on next initialize() call
	 * - Prevents race conditions from multiple concurrent recovery attempts
	 */
	recoverFromError(): Promise<void>
	/**
	 * Cleans up the manager instance.
	 */
	dispose(): void
	/**
	 * Clears all index data by stopping the watcher, clearing the Qdrant collection,
	 * and deleting the cache file.
	 */
	clearIndexData(): Promise<void>
	getCurrentStatus(): {
		workspacePath: string
		workspaceEnabled: boolean
		autoEnableDefault: boolean
		systemStatus: import("./state-manager").IndexingState
		message: string
		processedItems: number
		totalItems: number
		currentItemUnit: string
	}
	searchIndex(query: string, directoryPrefix?: string): Promise<VectorStoreSearchResult[]>
	/**
	 * Private helper method to recreate services with current configuration.
	 * Used by both initialize() and handleSettingsChange().
	 */
	private _recreateServices
	/**
	 * Handle code index settings changes.
	 * This method should be called when code index settings are updated
	 * to ensure the CodeIndexConfigManager picks up the new configuration.
	 * If the configuration changes require a restart, the service will be restarted.
	 */
	handleSettingsChange(): Promise<void>
}
//# sourceMappingURL=manager.d.ts.map
