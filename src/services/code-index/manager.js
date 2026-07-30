"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.CodeIndexManager = void 0
const vscode = __importStar(require("vscode"))
const config_manager_1 = require("./config-manager")
const state_manager_1 = require("./state-manager")
const service_factory_1 = require("./service-factory")
const search_service_1 = require("./search-service")
const orchestrator_1 = require("./orchestrator")
const cache_manager_1 = require("./cache-manager")
const AliIgnoreController_1 = require("../../core/ignore/AliIgnoreController")
const promises_1 = __importDefault(require("fs/promises"))
const ignore_1 = __importDefault(require("ignore"))
const path_1 = __importDefault(require("path"))
class CodeIndexManager {
	// --- Singleton Implementation ---
	static instances = new Map() // Map workspace path to instance
	// Specialized class instances
	_configManager
	_stateManager
	_serviceFactory
	_orchestrator
	_searchService
	_cacheManager
	// Flag to prevent race conditions during error recovery
	_isRecoveringFromError = false
	static getInstance(context, workspacePath) {
		// Resolve the workspace folder to get both fsPath and the real URI
		let folder
		if (workspacePath) {
			folder = vscode.workspace.workspaceFolders?.find((f) => f.uri.fsPath === workspacePath)
		} else {
			const activeEditor = vscode.window.activeTextEditor
			if (activeEditor) {
				folder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri)
			}
			if (!folder) {
				const workspaceFolders = vscode.workspace.workspaceFolders
				if (!workspaceFolders || workspaceFolders.length === 0) {
					return undefined
				}
				folder = workspaceFolders[0]
			}
			workspacePath = folder.uri.fsPath
		}
		if (!CodeIndexManager.instances.has(workspacePath)) {
			// folder may be undefined when workspacePath was provided but doesn't match
			// any workspace folder (e.g. cwd passed from a tool). Fall back to file:// URI.
			const folderUri = folder?.uri ?? {
				fsPath: workspacePath,
				scheme: "file",
				authority: "",
				path: workspacePath,
				toString: () => `file://${workspacePath}`,
			}
			CodeIndexManager.instances.set(workspacePath, new CodeIndexManager(workspacePath, folderUri, context))
		}
		return CodeIndexManager.instances.get(workspacePath)
	}
	static getAllInstances() {
		return Array.from(CodeIndexManager.instances.values())
	}
	static disposeAll() {
		for (const instance of CodeIndexManager.instances.values()) {
			instance.dispose()
		}
		CodeIndexManager.instances.clear()
	}
	workspacePath
	_folderUri
	context
	// Private constructor for singleton pattern
	constructor(workspacePath, folderUri, context) {
		this.workspacePath = workspacePath
		this._folderUri = folderUri
		this.context = context
		this._stateManager = new state_manager_1.CodeIndexStateManager()
	}
	// --- Public API ---
	/**
	 * Returns the workspaceState key for per-folder indexing enablement,
	 * keyed by the real workspace folder URI so local/remote schemes cannot collide.
	 */
	_workspaceEnabledKey() {
		return "codeIndexWorkspaceEnabled:" + this._folderUri.toString(true)
	}
	get isWorkspaceEnabled() {
		const explicit = this.context.workspaceState.get(this._workspaceEnabledKey(), undefined)
		if (explicit !== undefined) return explicit
		return this.autoEnableDefault
	}
	async setWorkspaceEnabled(enabled) {
		await this.context.workspaceState.update(this._workspaceEnabledKey(), enabled)
	}
	get autoEnableDefault() {
		return this.context.globalState.get("codeIndexAutoEnableDefault", true)
	}
	async setAutoEnableDefault(enabled) {
		await this.context.globalState.update("codeIndexAutoEnableDefault", enabled)
	}
	get onProgressUpdate() {
		return this._stateManager.onProgressUpdate
	}
	assertInitialized() {
		if (!this._configManager || !this._orchestrator || !this._searchService || !this._cacheManager) {
			throw new Error("CodeIndexManager not initialized. Call initialize() first.")
		}
	}
	get state() {
		if (!this.isFeatureEnabled) {
			return "Standby"
		}
		this.assertInitialized()
		return this._orchestrator.state
	}
	get isFeatureEnabled() {
		return this._configManager?.isFeatureEnabled ?? false
	}
	get isFeatureConfigured() {
		return this._configManager?.isFeatureConfigured ?? false
	}
	get isInitialized() {
		try {
			this.assertInitialized()
			return true
		} catch (error) {
			return false
		}
	}
	/**
	 * Initializes the manager with configuration and dependent services.
	 * Must be called before using any other methods.
	 * @returns Object indicating if a restart is needed
	 */
	async initialize(contextProxy) {
		// 1. ConfigManager Initialization and Configuration Loading
		if (!this._configManager) {
			this._configManager = new config_manager_1.CodeIndexConfigManager(contextProxy)
		}
		// Load configuration once to get current state and restart requirements
		const { requiresRestart } = await this._configManager.loadConfiguration()
		// 2. Check if feature is enabled
		if (!this.isFeatureEnabled) {
			if (this._orchestrator) {
				this._orchestrator.stopWatcher()
			}
			return { requiresRestart }
		}
		// 3. Check if workspace is available
		const workspacePath = this.workspacePath
		if (!workspacePath) {
			this._stateManager.setSystemState("Standby", "No workspace folder open")
			return { requiresRestart }
		}
		// 4. Check workspace-level enablement (before creating expensive services)
		if (!this.isWorkspaceEnabled) {
			this._stateManager.setSystemState("Standby", "Indexing not enabled for this workspace")
			return { requiresRestart }
		}
		// 5. CacheManager Initialization
		if (!this._cacheManager) {
			this._cacheManager = new cache_manager_1.CacheManager(this.context, this.workspacePath)
			await this._cacheManager.initialize()
		}
		// 6. Determine if Core Services Need Recreation
		const needsServiceRecreation = !this._serviceFactory || requiresRestart
		if (needsServiceRecreation) {
			await this._recreateServices()
		}
		// 7. Handle Indexing Start/Restart
		const shouldStartOrRestartIndexing =
			requiresRestart ||
			(needsServiceRecreation && (!this._orchestrator || this._orchestrator.state !== "Indexing"))
		if (shouldStartOrRestartIndexing) {
			this._orchestrator?.startIndexing()
		}
		return { requiresRestart }
	}
	/**
	 * Initiates the indexing process (initial scan and starts watcher).
	 * Automatically recovers from error state if needed before starting.
	 *
	 * @important This method should NEVER be awaited as it starts a long-running background process.
	 * The indexing will continue asynchronously and progress will be reported through events.
	 */
	async startIndexing() {
		if (!this.isFeatureEnabled || !this.isWorkspaceEnabled) {
			return
		}
		// Check if we're in error state and recover if needed
		const currentStatus = this.getCurrentStatus()
		if (currentStatus.systemStatus === "Error") {
			await this.recoverFromError()
			// After recovery, we need to reinitialize since recoverFromError clears all services
			// This will be handled by the caller (webviewMessageHandler) checking isInitialized
			return
		}
		this.assertInitialized()
		await this._orchestrator.startIndexing()
	}
	/**
	 * Stops any in-progress indexing operation and the file watcher.
	 */
	stopIndexing() {
		if (this._orchestrator) {
			this._orchestrator.stopIndexing()
		}
	}
	/**
	 * Stops the file watcher and potentially cleans up resources.
	 */
	stopWatcher() {
		if (!this.isFeatureEnabled) {
			return
		}
		if (this._orchestrator) {
			this._orchestrator.stopWatcher()
		}
	}
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
	async recoverFromError() {
		// Prevent race conditions from multiple rapid recovery attempts
		if (this._isRecoveringFromError) {
			return
		}
		this._isRecoveringFromError = true
		try {
			// Clear error state
			this._stateManager.setSystemState("Standby", "")
		} catch (error) {
			// Log error but continue with recovery - clearing service instances is more important
			console.error("Failed to clear error state during recovery:", error)
		} finally {
			// Force re-initialization by clearing service instances
			// This ensures a clean slate even if state update failed
			this._configManager = undefined
			this._serviceFactory = undefined
			this._orchestrator = undefined
			this._searchService = undefined
			// Reset the flag after recovery is complete
			this._isRecoveringFromError = false
		}
	}
	/**
	 * Cleans up the manager instance.
	 */
	dispose() {
		this.stopIndexing()
		this._stateManager.dispose()
	}
	/**
	 * Clears all index data by stopping the watcher, clearing the Qdrant collection,
	 * and deleting the cache file.
	 */
	async clearIndexData() {
		if (!this.isFeatureEnabled) {
			return
		}
		this.assertInitialized()
		await this._orchestrator.clearIndexData()
		await this._cacheManager.clearCacheFile()
	}
	// --- Private Helpers ---
	getCurrentStatus() {
		const status = this._stateManager.getCurrentStatus()
		return {
			...status,
			workspacePath: this.workspacePath,
			workspaceEnabled: this.isWorkspaceEnabled,
			autoEnableDefault: this.autoEnableDefault,
		}
	}
	async searchIndex(query, directoryPrefix) {
		if (!this.isFeatureEnabled) {
			return []
		}
		this.assertInitialized()
		return this._searchService.searchIndex(query, directoryPrefix)
	}
	/**
	 * Private helper method to recreate services with current configuration.
	 * Used by both initialize() and handleSettingsChange().
	 */
	async _recreateServices() {
		// Stop watcher if it exists
		if (this._orchestrator) {
			this.stopWatcher()
		}
		// Clear existing services to ensure clean state
		this._orchestrator = undefined
		this._searchService = undefined
		// (Re)Initialize service factory
		this._serviceFactory = new service_factory_1.CodeIndexServiceFactory(
			this._configManager,
			this.workspacePath,
			this._cacheManager,
		)
		const ignoreInstance = (0, ignore_1.default)()
		const workspacePath = this.workspacePath
		if (!workspacePath) {
			this._stateManager.setSystemState("Standby", "")
			return
		}
		// Create .gitignore instance
		const ignorePath = path_1.default.join(workspacePath, ".gitignore")
		try {
			const content = await promises_1.default.readFile(ignorePath, "utf8")
			ignoreInstance.add(content)
			ignoreInstance.add(".gitignore")
		} catch (error) {
			// Should never happen: reading file failed even though it exists
			console.error("Unexpected error loading .gitignore:", error)
		}
		// Create AliIgnoreController instance
		const aliIgnoreController = new AliIgnoreController_1.AliIgnoreController(workspacePath)
		await aliIgnoreController.initialize()
		// (Re)Create shared service instances
		const { embedder, vectorStore, scanner, fileWatcher } = this._serviceFactory.createServices(
			this.context,
			this._cacheManager,
			ignoreInstance,
			aliIgnoreController,
		)
		// Validate embedder configuration before proceeding
		const validationResult = await this._serviceFactory.validateEmbedder(embedder)
		if (!validationResult.valid) {
			const errorMessage = validationResult.error || "Embedder configuration validation failed"
			this._stateManager.setSystemState("Error", errorMessage)
			throw new Error(errorMessage)
		}
		// (Re)Initialize orchestrator
		this._orchestrator = new orchestrator_1.CodeIndexOrchestrator(
			this._configManager,
			this._stateManager,
			this.workspacePath,
			this._cacheManager,
			vectorStore,
			scanner,
			fileWatcher,
		)
		// (Re)Initialize search service
		this._searchService = new search_service_1.CodeIndexSearchService(
			this._configManager,
			this._stateManager,
			embedder,
			vectorStore,
		)
		// Clear any error state after successful recreation
		this._stateManager.setSystemState("Standby", "")
	}
	/**
	 * Handle code index settings changes.
	 * This method should be called when code index settings are updated
	 * to ensure the CodeIndexConfigManager picks up the new configuration.
	 * If the configuration changes require a restart, the service will be restarted.
	 */
	async handleSettingsChange() {
		if (this._configManager) {
			const { requiresRestart } = await this._configManager.loadConfiguration()
			const isFeatureEnabled = this.isFeatureEnabled
			const isFeatureConfigured = this.isFeatureConfigured
			// If feature is disabled, stop the service (including any active scan)
			if (!isFeatureEnabled) {
				this.stopIndexing()
				this._stateManager.setSystemState("Standby", "Code indexing is disabled")
				return
			}
			if (requiresRestart && isFeatureEnabled && isFeatureConfigured) {
				try {
					// Ensure cacheManager is initialized before recreating services
					if (!this._cacheManager) {
						this._cacheManager = new cache_manager_1.CacheManager(this.context, this.workspacePath)
						await this._cacheManager.initialize()
					}
					// Recreate services with new configuration
					await this._recreateServices()
				} catch (error) {
					// Error state already set in _recreateServices
					console.error("Failed to recreate services:", error)
					// Re-throw the error so the caller knows validation failed
					throw error
				}
			}
		}
	}
}
exports.CodeIndexManager = CodeIndexManager
