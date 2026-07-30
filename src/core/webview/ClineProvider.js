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
exports.ClineProvider = void 0
const os_1 = __importDefault(require("os"))
const path = __importStar(require("path"))
const promises_1 = __importDefault(require("fs/promises"))
const events_1 = __importDefault(require("events"))
const delay_1 = __importDefault(require("delay"))
const axios_1 = __importDefault(require("axios"))
const p_wait_for_1 = __importDefault(require("p-wait-for"))
const vscode = __importStar(require("vscode"))
const types_1 = require("@ali-code/types")
const aggregateTaskCosts_1 = require("./aggregateTaskCosts")
const package_1 = require("../../shared/package")
const array_1 = require("../../shared/array")
const support_prompt_1 = require("../../shared/support-prompt")
const globalFileNames_1 = require("../../shared/globalFileNames")
const modes_1 = require("../../shared/modes")
const experiments_1 = require("../../shared/experiments")
const language_1 = require("../../shared/language")
const embeddingModels_1 = require("../../shared/embeddingModels")
const ProfileValidator_1 = require("../../shared/ProfileValidator")
const Terminal_1 = require("../../integrations/terminal/Terminal")
const export_markdown_1 = require("../../integrations/misc/export-markdown")
const export_1 = require("../../utils/export")
const getTheme_1 = require("../../integrations/theme/getTheme")
const WorkspaceTracker_1 = __importDefault(require("../../integrations/workspace/WorkspaceTracker"))
const McpServerManager_1 = require("../../services/mcp/McpServerManager")
const ShadowCheckpointService_1 = require("../../services/checkpoints/ShadowCheckpointService")
const manager_1 = require("../../services/code-index/manager")
const SkillsManager_1 = require("../../services/skills/SkillsManager")
const fs_1 = require("../../utils/fs")
const tts_1 = require("../../utils/tts")
const path_1 = require("../../utils/path")
const errors_1 = require("../../utils/errors")
const registerCommands_1 = require("../../activate/registerCommands")
const i18n_1 = require("../../i18n")
const lmstudio_1 = require("../../api/providers/fetchers/lmstudio")
const ProviderSettingsManager_1 = require("../config/ProviderSettingsManager")
const CustomModesManager_1 = require("../config/CustomModesManager")
const Task_1 = require("../task/Task")
const webviewMessageHandler_1 = require("./webviewMessageHandler")
const task_persistence_1 = require("../task-persistence")
const taskMessages_1 = require("../task-persistence/taskMessages")
const getNonce_1 = require("./getNonce")
const getUri_1 = require("./getUri")
const requesty_1 = require("../../shared/utils/requesty")
const validateToolResultIds_1 = require("../task/validateToolResultIds")
class ClineProvider extends events_1.default {
	context
	outputChannel
	renderContext
	contextProxy
	// Used in package.json as the view's id. This value cannot be changed due
	// to how VSCode caches views based on their id, and updating the id would
	// break existing instances of the extension.
	static sideBarId = `${package_1.Package.name}.SidebarProvider`
	static tabPanelId = `${package_1.Package.name}.TabPanelProvider`
	static activeInstances = new Set()
	disposables = []
	webviewDisposables = []
	view
	clineStack = []
	codeIndexStatusSubscription
	codeIndexManager
	_workspaceTracker // workSpaceTracker read-only for access outside this class
	mcpHub // Change from private to protected
	skillsManager
	taskCreationCallback
	taskEventListeners = new WeakMap()
	currentWorkspacePath
	_disposed = false
	recentTasksCache
	taskHistoryStore
	taskHistoryStoreInitialized = false
	globalStateWriteThroughTimer = null
	static GLOBAL_STATE_WRITE_THROUGH_DEBOUNCE_MS = 5000 // 5 seconds
	pendingOperations = new Map()
	static PENDING_OPERATION_TIMEOUT_MS = 30000 // 30 seconds
	/**
	 * Monotonically increasing sequence number for clineMessages state pushes.
	 * Used by the frontend to reject stale state that arrives out-of-order.
	 */
	clineMessagesSeq = 0
	isViewLaunched = false
	settingsImportedAt
	latestAnnouncementId = "may-2026-final-ali-code-release" // Final AliCode release announcement.
	providerSettingsManager
	customModesManager
	constructor(context, outputChannel, renderContext = "sidebar", contextProxy) {
		super()
		this.context = context
		this.outputChannel = outputChannel
		this.renderContext = renderContext
		this.contextProxy = contextProxy
		this.currentWorkspacePath = (0, path_1.getWorkspacePath)()
		ClineProvider.activeInstances.add(this)
		this.updateGlobalState("codebaseIndexModels", embeddingModels_1.EMBEDDING_MODEL_PROFILES)
		// Initialize the per-task file-based history store.
		// The globalState write-through is debounced separately (not on every mutation)
		// since per-task files are authoritative and globalState is only for downgrade compat.
		this.taskHistoryStore = new task_persistence_1.TaskHistoryStore(this.contextProxy.globalStorageUri.fsPath, {
			onWrite: async () => {
				this.scheduleGlobalStateWriteThrough()
			},
		})
		this.initializeTaskHistoryStore().catch((error) => {
			this.log(`Failed to initialize TaskHistoryStore: ${error}`)
		})
		this._workspaceTracker = new WorkspaceTracker_1.default(this)
		this.providerSettingsManager = new ProviderSettingsManager_1.ProviderSettingsManager(this.context)
		this.customModesManager = new CustomModesManager_1.CustomModesManager(this.context, async () => {
			await this.postStateToWebviewWithoutClineMessages()
		})
		// Initialize MCP Hub through the singleton manager
		McpServerManager_1.McpServerManager.getInstance(this.context, this)
			.then((hub) => {
				this.mcpHub = hub
				this.mcpHub.registerClient()
			})
			.catch((error) => {
				this.log(`Failed to initialize MCP Hub: ${error}`)
			})
		// Initialize Skills Manager for skill discovery
		this.skillsManager = new SkillsManager_1.SkillsManager(this)
		this.skillsManager.initialize().catch((error) => {
			this.log(`Failed to initialize Skills Manager: ${error}`)
		})
		// Forward <most> task events to the provider.
		// We do something fairly similar for the IPC-based API.
		this.taskCreationCallback = (instance) => {
			this.emit(types_1.AliCodeEventName.TaskCreated, instance)
			// Create named listener functions so we can remove them later.
			const onTaskStarted = () => this.emit(types_1.AliCodeEventName.TaskStarted, instance.taskId)
			const onTaskCompleted = (taskId, tokenUsage, toolUsage) =>
				this.emit(types_1.AliCodeEventName.TaskCompleted, taskId, tokenUsage, toolUsage)
			const onTaskAborted = async () => {
				this.emit(types_1.AliCodeEventName.TaskAborted, instance.taskId)
				try {
					// Only rehydrate on genuine streaming failures.
					// User-initiated cancels are handled by cancelTask().
					if (instance.abortReason === "streaming_failed") {
						// Defensive safeguard: if another path already replaced this instance, skip
						const current = this.getCurrentTask()
						if (current && current.instanceId !== instance.instanceId) {
							this.log(
								`[onTaskAborted] Skipping rehydrate: current instance ${current.instanceId} != aborted ${instance.instanceId}`,
							)
							return
						}
						const { historyItem } = await this.getTaskWithId(instance.taskId)
						const rootTask = instance.rootTask
						const parentTask = instance.parentTask
						await this.createTaskWithHistoryItem({ ...historyItem, rootTask, parentTask })
					}
				} catch (error) {
					this.log(
						`[onTaskAborted] Failed to rehydrate after streaming failure: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}
			const onTaskFocused = () => this.emit(types_1.AliCodeEventName.TaskFocused, instance.taskId)
			const onTaskUnfocused = () => this.emit(types_1.AliCodeEventName.TaskUnfocused, instance.taskId)
			const onTaskActive = (taskId) => this.emit(types_1.AliCodeEventName.TaskActive, taskId)
			const onTaskInteractive = (taskId) => this.emit(types_1.AliCodeEventName.TaskInteractive, taskId)
			const onTaskResumable = (taskId) => this.emit(types_1.AliCodeEventName.TaskResumable, taskId)
			const onTaskIdle = (taskId) => this.emit(types_1.AliCodeEventName.TaskIdle, taskId)
			const onTaskPaused = (taskId) => this.emit(types_1.AliCodeEventName.TaskPaused, taskId)
			const onTaskUnpaused = (taskId) => this.emit(types_1.AliCodeEventName.TaskUnpaused, taskId)
			const onTaskSpawned = (taskId) => this.emit(types_1.AliCodeEventName.TaskSpawned, taskId)
			const onTaskUserMessage = (taskId) => this.emit(types_1.AliCodeEventName.TaskUserMessage, taskId)
			const onTaskTokenUsageUpdated = (taskId, tokenUsage, toolUsage) =>
				this.emit(types_1.AliCodeEventName.TaskTokenUsageUpdated, taskId, tokenUsage, toolUsage)
			// Attach the listeners.
			instance.on(types_1.AliCodeEventName.TaskStarted, onTaskStarted)
			instance.on(types_1.AliCodeEventName.TaskCompleted, onTaskCompleted)
			instance.on(types_1.AliCodeEventName.TaskAborted, onTaskAborted)
			instance.on(types_1.AliCodeEventName.TaskFocused, onTaskFocused)
			instance.on(types_1.AliCodeEventName.TaskUnfocused, onTaskUnfocused)
			instance.on(types_1.AliCodeEventName.TaskActive, onTaskActive)
			instance.on(types_1.AliCodeEventName.TaskInteractive, onTaskInteractive)
			instance.on(types_1.AliCodeEventName.TaskResumable, onTaskResumable)
			instance.on(types_1.AliCodeEventName.TaskIdle, onTaskIdle)
			instance.on(types_1.AliCodeEventName.TaskPaused, onTaskPaused)
			instance.on(types_1.AliCodeEventName.TaskUnpaused, onTaskUnpaused)
			instance.on(types_1.AliCodeEventName.TaskSpawned, onTaskSpawned)
			instance.on(types_1.AliCodeEventName.TaskUserMessage, onTaskUserMessage)
			instance.on(types_1.AliCodeEventName.TaskTokenUsageUpdated, onTaskTokenUsageUpdated)
			// Store the cleanup functions for later removal.
			this.taskEventListeners.set(instance, [
				() => instance.off(types_1.AliCodeEventName.TaskStarted, onTaskStarted),
				() => instance.off(types_1.AliCodeEventName.TaskCompleted, onTaskCompleted),
				() => instance.off(types_1.AliCodeEventName.TaskAborted, onTaskAborted),
				() => instance.off(types_1.AliCodeEventName.TaskFocused, onTaskFocused),
				() => instance.off(types_1.AliCodeEventName.TaskUnfocused, onTaskUnfocused),
				() => instance.off(types_1.AliCodeEventName.TaskActive, onTaskActive),
				() => instance.off(types_1.AliCodeEventName.TaskInteractive, onTaskInteractive),
				() => instance.off(types_1.AliCodeEventName.TaskResumable, onTaskResumable),
				() => instance.off(types_1.AliCodeEventName.TaskIdle, onTaskIdle),
				() => instance.off(types_1.AliCodeEventName.TaskUserMessage, onTaskUserMessage),
				() => instance.off(types_1.AliCodeEventName.TaskPaused, onTaskPaused),
				() => instance.off(types_1.AliCodeEventName.TaskUnpaused, onTaskUnpaused),
				() => instance.off(types_1.AliCodeEventName.TaskSpawned, onTaskSpawned),
				() => instance.off(types_1.AliCodeEventName.TaskTokenUsageUpdated, onTaskTokenUsageUpdated),
			])
		}
	}
	/**
	 * Initialize the TaskHistoryStore and migrate from globalState if needed.
	 */
	async initializeTaskHistoryStore() {
		try {
			await this.taskHistoryStore.initialize()
			// Migration: backfill per-task files from globalState on first run
			const migrationKey = "taskHistoryMigratedToFiles"
			const alreadyMigrated = this.context.globalState.get(migrationKey)
			if (!alreadyMigrated) {
				const legacyHistory = this.context.globalState.get("taskHistory") ?? []
				if (legacyHistory.length > 0) {
					this.log(`[initializeTaskHistoryStore] Migrating ${legacyHistory.length} entries from globalState`)
					await this.taskHistoryStore.migrateFromGlobalState(legacyHistory)
				}
				await this.context.globalState.update(migrationKey, true)
				this.log("[initializeTaskHistoryStore] Migration complete")
			}
			this.taskHistoryStoreInitialized = true
		} catch (error) {
			this.log(`[initializeTaskHistoryStore] Error: ${error instanceof Error ? error.message : String(error)}`)
		}
	}
	/**
	 * Override EventEmitter's on method to match TaskProviderLike interface
	 */
	on(event, listener) {
		return super.on(event, listener)
	}
	/**
	 * Override EventEmitter's off method to match TaskProviderLike interface
	 */
	off(event, listener) {
		return super.off(event, listener)
	}
	// Adds a new Task instance to clineStack, marking the start of a new task.
	// The instance is pushed to the top of the stack (LIFO order).
	// When the task is completed, the top instance is removed, reactivating the
	// previous task.
	async addClineToStack(task) {
		// Add this cline instance into the stack that represents the order of
		// all the called tasks.
		this.clineStack.push(task)
		task.emit(types_1.AliCodeEventName.TaskFocused)
		// Perform special setup provider specific tasks.
		await this.performPreparationTasks(task)
		// Ensure getState() resolves correctly.
		const state = await this.getState()
		if (!state || typeof state.mode !== "string") {
			throw new Error((0, i18n_1.t)("common:errors.retrieve_current_mode"))
		}
	}
	async performPreparationTasks(cline) {
		// LMStudio: We need to force model loading in order to read its context
		// size; we do it now since we're starting a task with that model selected.
		if (cline.apiConfiguration && cline.apiConfiguration.apiProvider === "lmstudio") {
			try {
				if (!(0, lmstudio_1.hasLoadedFullDetails)(cline.apiConfiguration.lmStudioModelId)) {
					await (0, lmstudio_1.forceFullModelDetailsLoad)(
						cline.apiConfiguration.lmStudioBaseUrl ?? "http://localhost:1234",
						cline.apiConfiguration.lmStudioModelId,
					)
				}
			} catch (error) {
				this.log(`Failed to load full model details for LM Studio: ${error}`)
				vscode.window.showErrorMessage(error.message)
			}
		}
	}
	// Removes and destroys the top Cline instance (the current finished task),
	// activating the previous one (resuming the parent task).
	async removeClineFromStack(options) {
		if (this.clineStack.length === 0) {
			return
		}
		// Pop the top Cline instance from the stack.
		let task = this.clineStack.pop()
		if (task) {
			// Capture delegation metadata before abort/dispose, since abortTask(true)
			// is async and the task reference is cleared afterwards.
			const childTaskId = task.taskId
			const parentTaskId = task.parentTaskId
			task.emit(types_1.AliCodeEventName.TaskUnfocused)
			try {
				// Abort the running task and set isAbandoned to true so
				// all running promises will exit as well.
				await task.abortTask(true)
			} catch (e) {
				this.log(
					`[ClineProvider#removeClineFromStack] abortTask() failed ${task.taskId}.${task.instanceId}: ${e.message}`,
				)
			}
			// Remove event listeners before clearing the reference.
			const cleanupFunctions = this.taskEventListeners.get(task)
			if (cleanupFunctions) {
				cleanupFunctions.forEach((cleanup) => cleanup())
				this.taskEventListeners.delete(task)
			}
			// Make sure no reference kept, once promises end it will be
			// garbage collected.
			task = undefined
			// Delegation-aware parent metadata repair:
			// If the popped task was a delegated child, repair the parent's metadata
			// so it transitions from "delegated" back to "active" and becomes resumable
			// from the task history list.
			// Skip when called from delegateParentAndOpenChild() during nested delegation
			// transitions (A→B→C), where the caller intentionally replaces the active
			// child and will update the parent to point at the new child.
			if (parentTaskId && childTaskId && !options?.skipDelegationRepair) {
				try {
					const { historyItem: parentHistory } = await this.getTaskWithId(parentTaskId)
					if (parentHistory.status === "delegated" && parentHistory.awaitingChildId === childTaskId) {
						await this.updateTaskHistory({
							...parentHistory,
							status: "active",
							awaitingChildId: undefined,
						})
						this.log(
							`[ClineProvider#removeClineFromStack] Repaired parent ${parentTaskId} metadata: delegated → active (child ${childTaskId} removed)`,
						)
					}
				} catch (err) {
					// Non-fatal: log but do not block the pop operation.
					this.log(
						`[ClineProvider#removeClineFromStack] Failed to repair parent metadata for ${parentTaskId} (non-fatal): ${err instanceof Error ? err.message : String(err)}`,
					)
				}
			}
		}
	}
	getTaskStackSize() {
		return this.clineStack.length
	}
	getCurrentTaskStack() {
		return this.clineStack.map((cline) => cline.taskId)
	}
	// Pending Edit Operations Management
	/**
	 * Sets a pending edit operation with automatic timeout cleanup
	 */
	setPendingEditOperation(operationId, editData) {
		// Clear any existing operation with the same ID
		this.clearPendingEditOperation(operationId)
		// Create timeout for automatic cleanup
		const timeoutId = setTimeout(() => {
			this.clearPendingEditOperation(operationId)
			this.log(`[setPendingEditOperation] Automatically cleared stale pending operation: ${operationId}`)
		}, ClineProvider.PENDING_OPERATION_TIMEOUT_MS)
		// Store the operation
		this.pendingOperations.set(operationId, {
			...editData,
			timeoutId,
			createdAt: Date.now(),
		})
		this.log(`[setPendingEditOperation] Set pending operation: ${operationId}`)
	}
	/**
	 * Gets a pending edit operation by ID
	 */
	getPendingEditOperation(operationId) {
		return this.pendingOperations.get(operationId)
	}
	/**
	 * Clears a specific pending edit operation
	 */
	clearPendingEditOperation(operationId) {
		const operation = this.pendingOperations.get(operationId)
		if (operation) {
			clearTimeout(operation.timeoutId)
			this.pendingOperations.delete(operationId)
			this.log(`[clearPendingEditOperation] Cleared pending operation: ${operationId}`)
			return true
		}
		return false
	}
	/**
	 * Clears all pending edit operations
	 */
	clearAllPendingEditOperations() {
		for (const [operationId, operation] of this.pendingOperations) {
			clearTimeout(operation.timeoutId)
		}
		this.pendingOperations.clear()
		this.log(`[clearAllPendingEditOperations] Cleared all pending operations`)
	}
	/*
    VSCode extensions use the disposable pattern to clean up resources when the sidebar/editor tab is closed by the user or system. This applies to event listening, commands, interacting with the UI, etc.
    - https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/
    - https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/src/extension.ts
    */
	clearWebviewResources() {
		while (this.webviewDisposables.length) {
			const x = this.webviewDisposables.pop()
			if (x) {
				x.dispose()
			}
		}
	}
	async dispose() {
		if (this._disposed) {
			return
		}
		this._disposed = true
		this.log("Disposing ClineProvider...")
		// Clear all tasks from the stack.
		while (this.clineStack.length > 0) {
			await this.removeClineFromStack()
		}
		this.log("Cleared all tasks")
		// Clear all pending edit operations to prevent memory leaks
		this.clearAllPendingEditOperations()
		this.log("Cleared pending operations")
		if (this.view && "dispose" in this.view) {
			this.view.dispose()
			this.log("Disposed webview")
		}
		this.clearWebviewResources()
		while (this.disposables.length) {
			const x = this.disposables.pop()
			if (x) {
				x.dispose()
			}
		}
		this._workspaceTracker?.dispose()
		this._workspaceTracker = undefined
		await this.mcpHub?.unregisterClient()
		this.mcpHub = undefined
		await this.skillsManager?.dispose()
		this.skillsManager = undefined
		this.customModesManager?.dispose()
		this.taskHistoryStore.dispose()
		this.flushGlobalStateWriteThrough()
		this.log("Disposed all disposables")
		ClineProvider.activeInstances.delete(this)
		// Clean up any event listeners attached to this provider
		this.removeAllListeners()
		McpServerManager_1.McpServerManager.unregisterProvider(this)
	}
	static getVisibleInstance() {
		return (0, array_1.findLast)(Array.from(this.activeInstances), (instance) => instance.view?.visible === true)
	}
	static async getInstance() {
		let visibleProvider = ClineProvider.getVisibleInstance()
		// If no visible provider, try to show the sidebar view
		if (!visibleProvider) {
			await vscode.commands.executeCommand(`${package_1.Package.name}.SidebarProvider.focus`)
			// Wait briefly for the view to become visible
			await (0, delay_1.default)(100)
			visibleProvider = ClineProvider.getVisibleInstance()
		}
		// If still no visible provider, return
		if (!visibleProvider) {
			return
		}
		return visibleProvider
	}
	static async isActiveTask() {
		const visibleProvider = await ClineProvider.getInstance()
		if (!visibleProvider) {
			return false
		}
		// Check if there is a cline instance in the stack (if this provider has an active task)
		if (visibleProvider.getCurrentTask()) {
			return true
		}
		return false
	}
	static async handleCodeAction(command, promptType, params) {
		const visibleProvider = await ClineProvider.getInstance()
		if (!visibleProvider) {
			return
		}
		const { customSupportPrompts } = await visibleProvider.getState()
		// TODO: Improve type safety for promptType.
		const prompt = support_prompt_1.supportPrompt.create(promptType, params, customSupportPrompts)
		if (command === "addToContext") {
			await visibleProvider.postMessageToWebview({
				type: "invoke",
				invoke: "setChatBoxMessage",
				text: `${prompt}\n\n`,
			})
			await visibleProvider.postMessageToWebview({ type: "action", action: "focusInput" })
			return
		}
		await visibleProvider.createTask(prompt)
	}
	static async handleTerminalAction(command, promptType, params) {
		const visibleProvider = await ClineProvider.getInstance()
		if (!visibleProvider) {
			return
		}
		const { customSupportPrompts } = await visibleProvider.getState()
		const prompt = support_prompt_1.supportPrompt.create(promptType, params, customSupportPrompts)
		if (command === "terminalAddToContext") {
			await visibleProvider.postMessageToWebview({
				type: "invoke",
				invoke: "setChatBoxMessage",
				text: `${prompt}\n\n`,
			})
			await visibleProvider.postMessageToWebview({ type: "action", action: "focusInput" })
			return
		}
		try {
			await visibleProvider.createTask(prompt)
		} catch (error) {
			if (error instanceof errors_1.OrganizationAllowListViolationError) {
				// Errors from terminal commands seem to get swallowed / ignored.
				vscode.window.showErrorMessage(error.message)
			}
			throw error
		}
	}
	async resolveWebviewView(webviewView) {
		this.view = webviewView
		const inTabMode = "onDidChangeViewState" in webviewView
		if (inTabMode) {
			;(0, registerCommands_1.setPanel)(webviewView, "tab")
		} else if ("onDidChangeVisibility" in webviewView) {
			;(0, registerCommands_1.setPanel)(webviewView, "sidebar")
		}
		// Initialize out-of-scope variables that need to receive persistent
		// global state values.
		this.getState().then(
			({
				terminalShellIntegrationTimeout = Terminal_1.Terminal.defaultShellIntegrationTimeout,
				terminalShellIntegrationDisabled = false,
				terminalCommandDelay = 0,
				terminalZshClearEolMark = true,
				terminalZshOhMy = false,
				terminalZshP10k = false,
				terminalPowershellCounter = false,
				terminalZdotdir = false,
				ttsEnabled,
				ttsSpeed,
			}) => {
				Terminal_1.Terminal.setShellIntegrationTimeout(terminalShellIntegrationTimeout)
				Terminal_1.Terminal.setShellIntegrationDisabled(terminalShellIntegrationDisabled)
				Terminal_1.Terminal.setCommandDelay(terminalCommandDelay)
				Terminal_1.Terminal.setTerminalZshClearEolMark(terminalZshClearEolMark)
				Terminal_1.Terminal.setTerminalZshOhMy(terminalZshOhMy)
				Terminal_1.Terminal.setTerminalZshP10k(terminalZshP10k)
				Terminal_1.Terminal.setPowershellCounter(terminalPowershellCounter)
				Terminal_1.Terminal.setTerminalZdotdir(terminalZdotdir)
				;(0, tts_1.setTtsEnabled)(ttsEnabled ?? false)
				;(0, tts_1.setTtsSpeed)(ttsSpeed ?? 1)
			},
		)
		// Set up webview options with proper resource roots
		const resourceRoots = [this.contextProxy.extensionUri]
		// Add workspace folders to allow access to workspace files
		if (vscode.workspace.workspaceFolders) {
			resourceRoots.push(...vscode.workspace.workspaceFolders.map((folder) => folder.uri))
		}
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: resourceRoots,
		}
		webviewView.webview.html =
			this.contextProxy.extensionMode === vscode.ExtensionMode.Development
				? await this.getHMRHtmlContent(webviewView.webview)
				: await this.getHtmlContent(webviewView.webview)
		// Sets up an event listener to listen for messages passed from the webview view context
		// and executes code based on the message that is received.
		this.setWebviewMessageListener(webviewView.webview)
		// Initialize code index status subscription for the current workspace.
		this.updateCodeIndexStatusSubscription()
		// Listen for active editor changes to update code index status for the
		// current workspace.
		const activeEditorSubscription = vscode.window.onDidChangeActiveTextEditor(() => {
			// Update subscription when workspace might have changed.
			this.updateCodeIndexStatusSubscription()
		})
		this.webviewDisposables.push(activeEditorSubscription)
		// Listen for when the panel becomes visible.
		// https://github.com/microsoft/vscode-discussions/discussions/840
		if ("onDidChangeViewState" in webviewView) {
			// WebviewView and WebviewPanel have all the same properties except
			// for this visibility listener panel.
			const viewStateDisposable = webviewView.onDidChangeViewState(() => {
				if (this.view?.visible) {
					this.postMessageToWebview({ type: "action", action: "didBecomeVisible" })
				}
			})
			this.webviewDisposables.push(viewStateDisposable)
		} else if ("onDidChangeVisibility" in webviewView) {
			// sidebar
			const visibilityDisposable = webviewView.onDidChangeVisibility(() => {
				if (this.view?.visible) {
					this.postMessageToWebview({ type: "action", action: "didBecomeVisible" })
				}
			})
			this.webviewDisposables.push(visibilityDisposable)
		}
		// Listen for when the view is disposed
		// This happens when the user closes the view or when the view is closed programmatically
		webviewView.onDidDispose(
			async () => {
				if (inTabMode) {
					this.log("Disposing ClineProvider instance for tab view")
					await this.dispose()
				} else {
					this.log("Clearing webview resources for sidebar view")
					this.clearWebviewResources()
					// Reset current workspace manager reference when view is disposed
					this.codeIndexManager = undefined
				}
			},
			null,
			this.disposables,
		)
		// Listen for when color changes
		const configDisposable = vscode.workspace.onDidChangeConfiguration(async (e) => {
			if (e && e.affectsConfiguration("workbench.colorTheme")) {
				// Sends latest theme name to webview
				await this.postMessageToWebview({
					type: "theme",
					text: JSON.stringify(await (0, getTheme_1.getTheme)()),
				})
			}
		})
		this.webviewDisposables.push(configDisposable)
		// If the extension is starting a new session, clear previous task state.
		// But don't clear if there's already an active task (e.g., resumed via IPC/bridge).
		const currentTask = this.getCurrentTask()
		if (!currentTask || currentTask.abandoned || currentTask.abort) {
			await this.removeClineFromStack()
		}
	}
	async createTaskWithHistoryItem(historyItem, options) {
		const isCliRuntime = process.env.ROO_CLI_RUNTIME === "1"
		// CLI injects runtime provider settings from command flags/env at startup.
		// Restoring provider profiles from task history can overwrite those
		// runtime settings with stale/incomplete persisted profiles.
		const skipProfileRestoreFromHistory = isCliRuntime
		// Check if we're rehydrating the current task to avoid flicker
		const currentTask = this.getCurrentTask()
		const isRehydratingCurrentTask = currentTask && currentTask.taskId === historyItem.id
		if (!isRehydratingCurrentTask) {
			await this.removeClineFromStack()
		}
		// If the history item has a saved mode, restore it and its associated API configuration.
		if (historyItem.mode) {
			// Validate that the mode still exists
			const customModes = await this.customModesManager.getCustomModes()
			const modeExists = (0, modes_1.getModeBySlug)(historyItem.mode, customModes) !== undefined
			if (!modeExists) {
				// Mode no longer exists, fall back to default mode.
				this.log(
					`Mode '${historyItem.mode}' from history no longer exists. Falling back to default mode '${modes_1.defaultModeSlug}'.`,
				)
				historyItem.mode = modes_1.defaultModeSlug
			}
			await this.updateGlobalState("mode", historyItem.mode)
			// Load the saved API config for the restored mode if it exists.
			// Skip mode-based profile activation if historyItem.apiConfigName exists,
			// since the task's specific provider profile will override it anyway.
			const lockApiConfigAcrossModes = this.context.workspaceState.get("lockApiConfigAcrossModes", false)
			if (!historyItem.apiConfigName && !lockApiConfigAcrossModes && !skipProfileRestoreFromHistory) {
				const savedConfigId = await this.providerSettingsManager.getModeConfigId(historyItem.mode)
				const listApiConfig = await this.providerSettingsManager.listConfig()
				// Update listApiConfigMeta first to ensure UI has latest data.
				await this.updateGlobalState("listApiConfigMeta", listApiConfig)
				// If this mode has a saved config, use it.
				if (savedConfigId) {
					const profile = listApiConfig.find(({ id }) => id === savedConfigId)
					if (profile?.name) {
						try {
							// Check if the profile has actual API configuration (not just an id).
							// In CLI mode, the ProviderSettingsManager may return empty default profiles
							// that only contain 'id' and 'name' fields. Activating such a profile would
							// overwrite the CLI's working API configuration with empty settings.
							const fullProfile = await this.providerSettingsManager.getProfile({ name: profile.name })
							const hasActualSettings = !!fullProfile.apiProvider
							if (hasActualSettings) {
								await this.activateProviderProfile({ name: profile.name })
							} else {
								// The task will continue with the current/default configuration.
							}
						} catch (error) {
							// Log the error but continue with task restoration.
							this.log(
								`Failed to restore API configuration for mode '${historyItem.mode}': ${error instanceof Error ? error.message : String(error)}. Continuing with default configuration.`,
							)
							// The task will continue with the current/default configuration.
						}
					}
				}
			}
		}
		// If the history item has a saved API config name (provider profile), restore it.
		// This overrides any mode-based config restoration above, because the task's
		// specific provider profile takes precedence over mode defaults.
		if (historyItem.apiConfigName && !skipProfileRestoreFromHistory) {
			const listApiConfig = await this.providerSettingsManager.listConfig()
			// Keep global state/UI in sync with latest profiles for parity with mode restoration above.
			await this.updateGlobalState("listApiConfigMeta", listApiConfig)
			const profile = listApiConfig.find(({ name }) => name === historyItem.apiConfigName)
			if (profile?.name) {
				try {
					await this.activateProviderProfile(
						{ name: profile.name },
						{ persistModeConfig: false, persistTaskHistory: false },
					)
				} catch (error) {
					// Log the error but continue with task restoration.
					this.log(
						`Failed to restore API configuration '${historyItem.apiConfigName}' for task: ${error instanceof Error ? error.message : String(error)}. Continuing with current configuration.`,
					)
				}
			} else {
				// Profile no longer exists, log warning but continue
				this.log(
					`Provider profile '${historyItem.apiConfigName}' from history no longer exists. Using current configuration.`,
				)
			}
		} else if (historyItem.apiConfigName && skipProfileRestoreFromHistory) {
			this.log(
				`Skipping restore of provider profile '${historyItem.apiConfigName}' for task ${historyItem.id} in CLI runtime.`,
			)
		}
		const { apiConfiguration, enableCheckpoints, checkpointTimeout, experiments } = await this.getState()
		const task = new Task_1.Task({
			provider: this,
			apiConfiguration,
			enableCheckpoints,
			checkpointTimeout,
			consecutiveMistakeLimit: apiConfiguration.consecutiveMistakeLimit,
			historyItem,
			experiments,
			rootTask: historyItem.rootTask,
			parentTask: historyItem.parentTask,
			taskNumber: historyItem.number,
			workspacePath: historyItem.workspace,
			onCreated: this.taskCreationCallback,
			startTask: options?.startTask ?? true,
			// Preserve the status from the history item to avoid overwriting it when the task saves messages
			initialStatus: historyItem.status,
		})
		if (isRehydratingCurrentTask) {
			// Replace the current task in-place to avoid UI flicker
			const stackIndex = this.clineStack.length - 1
			// Properly dispose of the old task to ensure garbage collection
			const oldTask = this.clineStack[stackIndex]
			// Abort the old task to stop running processes and mark as abandoned
			try {
				await oldTask.abortTask(true)
			} catch (e) {
				this.log(
					`[createTaskWithHistoryItem] abortTask() failed for old task ${oldTask.taskId}.${oldTask.instanceId}: ${e.message}`,
				)
			}
			// Remove event listeners from the old task
			const cleanupFunctions = this.taskEventListeners.get(oldTask)
			if (cleanupFunctions) {
				cleanupFunctions.forEach((cleanup) => cleanup())
				this.taskEventListeners.delete(oldTask)
			}
			// Replace the task in the stack
			this.clineStack[stackIndex] = task
			task.emit(types_1.AliCodeEventName.TaskFocused)
			// Perform preparation tasks and set up event listeners
			await this.performPreparationTasks(task)
			this.log(
				`[createTaskWithHistoryItem] rehydrated task ${task.taskId}.${task.instanceId} in-place (flicker-free)`,
			)
		} else {
			await this.addClineToStack(task)
			this.log(
				`[createTaskWithHistoryItem] ${task.parentTask ? "child" : "parent"} task ${task.taskId}.${task.instanceId} instantiated`,
			)
		}
		// Check if there's a pending edit after checkpoint restoration
		const operationId = `task-${task.taskId}`
		const pendingEdit = this.getPendingEditOperation(operationId)
		if (pendingEdit) {
			this.clearPendingEditOperation(operationId) // Clear the pending edit
			this.log(`[createTaskWithHistoryItem] Processing pending edit after checkpoint restoration`)
			// Process the pending edit after a short delay to ensure the task is fully initialized
			setTimeout(async () => {
				try {
					// Find the message index in the restored state
					const { messageIndex, apiConversationHistoryIndex } = (() => {
						const messageIndex = task.clineMessages.findIndex((msg) => msg.ts === pendingEdit.messageTs)
						const apiConversationHistoryIndex = task.apiConversationHistory.findIndex(
							(msg) => msg.ts === pendingEdit.messageTs,
						)
						return { messageIndex, apiConversationHistoryIndex }
					})()
					if (messageIndex !== -1) {
						// Remove the target message and all subsequent messages
						await task.overwriteClineMessages(task.clineMessages.slice(0, messageIndex))
						if (apiConversationHistoryIndex !== -1) {
							await task.overwriteApiConversationHistory(
								task.apiConversationHistory.slice(0, apiConversationHistoryIndex),
							)
						}
						// Process the edited message
						await task.handleWebviewAskResponse(
							"messageResponse",
							pendingEdit.editedContent,
							pendingEdit.images,
						)
					}
				} catch (error) {
					this.log(`[createTaskWithHistoryItem] Error processing pending edit: ${error}`)
				}
			}, 100) // Small delay to ensure task is fully ready
		}
		return task
	}
	async postMessageToWebview(message) {
		if (this._disposed) {
			return
		}
		try {
			await this.view?.webview.postMessage(message)
		} catch {
			// View disposed, drop message silently
		}
	}
	async getHMRHtmlContent(webview) {
		let localPort = "5173"
		try {
			const fs = require("fs")
			const path = require("path")
			const portFilePath = path.resolve(__dirname, "../../.vite-port")
			if (fs.existsSync(portFilePath)) {
				localPort = fs.readFileSync(portFilePath, "utf8").trim()
				console.log(`[ClineProvider:Vite] Using Vite server port from ${portFilePath}: ${localPort}`)
			} else {
				console.log(
					`[ClineProvider:Vite] Port file not found at ${portFilePath}, using default port: ${localPort}`,
				)
			}
		} catch (err) {
			console.error("[ClineProvider:Vite] Failed to read Vite port file:", err)
		}
		const localServerUrl = `localhost:${localPort}`
		// Check if local dev server is running.
		try {
			await axios_1.default.get(`http://${localServerUrl}`)
		} catch (error) {
			vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.hmr_not_running"))
			return this.getHtmlContent(webview)
		}
		const nonce = (0, getNonce_1.getNonce)()
		// Get the OpenRouter base URL from configuration
		const { apiConfiguration } = await this.getState()
		const openRouterBaseUrl = apiConfiguration.openRouterBaseUrl || "https://openrouter.ai"
		// Extract the domain for CSP
		const openRouterDomain = openRouterBaseUrl.match(/^(https?:\/\/[^\/]+)/)?.[1] || "https://openrouter.ai"
		const stylesUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, [
			"webview-ui",
			"build",
			"assets",
			"index.css",
		])
		const codiconsUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, [
			"assets",
			"codicons",
			"codicon.css",
		])
		const materialIconsUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, [
			"assets",
			"vscode-material-icons",
			"icons",
		])
		const imagesUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, ["assets", "images"])
		const audioUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, ["webview-ui", "audio"])
		const file = "src/index.tsx"
		const scriptUri = `http://${localServerUrl}/${file}`
		const reactRefresh = /*html*/ `
			<script nonce="${nonce}" type="module">
				import RefreshRuntime from "http://localhost:${localPort}/@react-refresh"
				RefreshRuntime.injectIntoGlobalHook(window)
				window.$RefreshReg$ = () => {}
				window.$RefreshSig$ = () => (type) => type
				window.__vite_plugin_react_preamble_installed__ = true
			</script>
		`
		const csp = [
			"default-src 'none'",
			`font-src ${webview.cspSource} data:`,
			`style-src ${webview.cspSource} 'unsafe-inline' https://* http://${localServerUrl} http://0.0.0.0:${localPort}`,
			`img-src ${webview.cspSource} https://storage.googleapis.com https://img.clerk.com data:`,
			`media-src ${webview.cspSource}`,
			`script-src 'unsafe-eval' ${webview.cspSource} https://* http://${localServerUrl} http://0.0.0.0:${localPort} 'nonce-${nonce}'`,
			`connect-src ${webview.cspSource} ${openRouterDomain} https://* ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort}`,
		]
		return /*html*/ `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
					<meta http-equiv="Content-Security-Policy" content="${csp.join("; ")}">
					<link rel="stylesheet" type="text/css" href="${stylesUri}">
					<link href="${codiconsUri}" rel="stylesheet" />
					<script nonce="${nonce}">
						window.IMAGES_BASE_URI = "${imagesUri}"
						window.AUDIO_BASE_URI = "${audioUri}"
						window.MATERIAL_ICONS_BASE_URI = "${materialIconsUri}"
					</script>
					<title>AliCode</title>
				</head>
				<body>
					<div id="root"></div>
					${reactRefresh}
					<script type="module" src="${scriptUri}"></script>
				</body>
			</html>
		`
	}
	/**
	 * Defines and returns the HTML that should be rendered within the webview panel.
	 *
	 * @remarks This is also the place where references to the React webview build files
	 * are created and inserted into the webview HTML.
	 *
	 * @param webview A reference to the extension webview
	 * @param extensionUri The URI of the directory containing the extension
	 * @returns A template string literal containing the HTML that should be
	 * rendered within the webview panel
	 */
	async getHtmlContent(webview) {
		// Get the local path to main script run in the webview,
		// then convert it to a uri we can use in the webview.
		// The CSS file from the React build output
		const stylesUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, [
			"webview-ui",
			"build",
			"assets",
			"index.css",
		])
		const scriptUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, [
			"webview-ui",
			"build",
			"assets",
			"index.js",
		])
		const codiconsUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, [
			"assets",
			"codicons",
			"codicon.css",
		])
		const materialIconsUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, [
			"assets",
			"vscode-material-icons",
			"icons",
		])
		const imagesUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, ["assets", "images"])
		const audioUri = (0, getUri_1.getUri)(webview, this.contextProxy.extensionUri, ["webview-ui", "audio"])
		// Use a nonce to only allow a specific script to be run.
		/*
        content security policy of your webview to only allow scripts that have a specific nonce
        create a content security policy meta tag so that only loading scripts with a nonce is allowed
        As your extension grows you will likely want to add custom styles, fonts, and/or images to your webview. If you do, you will need to update the content security policy meta tag to explicitly allow for these resources. E.g.
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
        - 'unsafe-inline' is required for styles due to vscode-webview-toolkit's dynamic style injection
        - since we pass base64 images to the webview, we need to specify img-src ${webview.cspSource} data:;

        in meta tag we add nonce attribute: A cryptographic nonce (only used once) to allow scripts. The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource's policy is otherwise trivial.
        */
		const nonce = (0, getNonce_1.getNonce)()
		// Get the OpenRouter base URL from configuration
		const { apiConfiguration } = await this.getState()
		const openRouterBaseUrl = apiConfiguration.openRouterBaseUrl || "https://openrouter.ai"
		// Extract the domain for CSP
		const openRouterDomain = openRouterBaseUrl.match(/^(https?:\/\/[^\/]+)/)?.[1] || "https://openrouter.ai"
		// Tip: Install the es6-string-html VS Code extension to enable code highlighting below
		return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
            <meta name="theme-color" content="#000000">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https://storage.googleapis.com https://img.clerk.com data:; media-src ${webview.cspSource}; script-src ${webview.cspSource} 'wasm-unsafe-eval' 'nonce-${nonce}' 'strict-dynamic'; connect-src ${webview.cspSource} ${openRouterDomain} https://api.requesty.ai;">
            <link rel="stylesheet" type="text/css" href="${stylesUri}">
			<link href="${codiconsUri}" rel="stylesheet" />
			<script nonce="${nonce}">
				window.IMAGES_BASE_URI = "${imagesUri}"
				window.AUDIO_BASE_URI = "${audioUri}"
				window.MATERIAL_ICONS_BASE_URI = "${materialIconsUri}"
			</script>
            <title>AliCode</title>
          </head>
          <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
          </body>
        </html>
      `
	}
	/**
	 * Sets up an event listener to listen for messages passed from the webview context and
	 * executes code based on the message that is received.
	 *
	 * @param webview A reference to the extension webview
	 */
	setWebviewMessageListener(webview) {
		const onReceiveMessage = async (message) => (0, webviewMessageHandler_1.webviewMessageHandler)(this, message)
		const messageDisposable = webview.onDidReceiveMessage(onReceiveMessage)
		this.webviewDisposables.push(messageDisposable)
	}
	/**
	 * Handle switching to a new mode, including updating the associated API configuration
	 * @param newMode The mode to switch to
	 */
	async handleModeSwitch(newMode) {
		const task = this.getCurrentTask()
		if (task) {
			task.emit(types_1.AliCodeEventName.TaskModeSwitched, task.taskId, newMode)
			try {
				// Update the task history with the new mode first.
				const taskHistoryItem =
					this.taskHistoryStore.get(task.taskId) ??
					(this.getGlobalState("taskHistory") ?? []).find((item) => item.id === task.taskId)
				if (taskHistoryItem) {
					await this.updateTaskHistory({ ...taskHistoryItem, mode: newMode })
				}
				// Only update the task's mode after successful persistence.
				task._taskMode = newMode
			} catch (error) {
				// If persistence fails, log the error but don't update the in-memory state.
				this.log(
					`Failed to persist mode switch for task ${task.taskId}: ${error instanceof Error ? error.message : String(error)}`,
				)
				// This ensures the in-memory state remains consistent with persisted state.
				throw error
			}
		}
		await this.updateGlobalState("mode", newMode)
		this.emit(types_1.AliCodeEventName.ModeChanged, newMode)
		// If workspace lock is on, keep the current API config — don't load mode-specific config
		const lockApiConfigAcrossModes = this.context.workspaceState.get("lockApiConfigAcrossModes", false)
		if (lockApiConfigAcrossModes) {
			await this.postStateToWebview()
			return
		}
		// Load the saved API config for the new mode if it exists.
		const savedConfigId = await this.providerSettingsManager.getModeConfigId(newMode)
		const listApiConfig = await this.providerSettingsManager.listConfig()
		// Update listApiConfigMeta first to ensure UI has latest data.
		await this.updateGlobalState("listApiConfigMeta", listApiConfig)
		// If this mode has a saved config, use it.
		if (savedConfigId) {
			const profile = listApiConfig.find(({ id }) => id === savedConfigId)
			if (profile?.name) {
				// Check if the profile has actual API configuration (not just an id).
				// In CLI mode, the ProviderSettingsManager may return empty default profiles
				// that only contain 'id' and 'name' fields. Activating such a profile would
				// overwrite the CLI's working API configuration with empty settings.
				// Skip activation if the profile has no apiProvider set - this indicates
				// an unconfigured/empty profile.
				const fullProfile = await this.providerSettingsManager.getProfile({ name: profile.name })
				const hasActualSettings = !!fullProfile.apiProvider
				if (hasActualSettings) {
					await this.activateProviderProfile({ name: profile.name })
				} else {
					// The task will continue with the current/default configuration.
				}
			} else {
				// The task will continue with the current/default configuration.
			}
		} else {
			// If no saved config for this mode, save current config as default.
			const currentApiConfigNameAfter = this.getGlobalState("currentApiConfigName")
			if (currentApiConfigNameAfter) {
				const config = listApiConfig.find((c) => c.name === currentApiConfigNameAfter)
				if (config?.id) {
					await this.providerSettingsManager.setModeConfig(newMode, config.id)
				}
			}
		}
		await this.postStateToWebview()
	}
	// Provider Profile Management
	/**
	 * Updates the current task's API handler.
	 * Rebuilds when:
	 * - provider or model changes, OR
	 * - explicitly forced (e.g., user-initiated profile switch/save to apply changed settings like headers/baseUrl/tier).
	 * Always synchronizes task.apiConfiguration with latest provider settings.
	 * @param providerSettings The new provider settings to apply
	 * @param options.forceRebuild Force rebuilding the API handler regardless of provider/model equality
	 */
	updateTaskApiHandlerIfNeeded(providerSettings, options = {}) {
		const task = this.getCurrentTask()
		if (!task) return
		const { forceRebuild = false } = options
		// Determine if we need to rebuild using the previous configuration snapshot
		const prevConfig = task.apiConfiguration
		const prevProvider = prevConfig?.apiProvider
		const prevModelId = prevConfig ? (0, types_1.getModelId)(prevConfig) : undefined
		const newProvider = providerSettings.apiProvider
		const newModelId = (0, types_1.getModelId)(providerSettings)
		const needsRebuild = forceRebuild || prevProvider !== newProvider || prevModelId !== newModelId
		if (needsRebuild) {
			// Use updateApiConfiguration which handles both API handler rebuild and parser sync.
			// Note: updateApiConfiguration is declared async but has no actual async operations,
			// so we can safely call it without awaiting.
			task.updateApiConfiguration(providerSettings)
		} else {
			// No rebuild needed, just sync apiConfiguration
			task.apiConfiguration = providerSettings
		}
	}
	getProviderProfileEntries() {
		return this.contextProxy.getValues().listApiConfigMeta || []
	}
	getProviderProfileEntry(name) {
		return this.getProviderProfileEntries().find((profile) => profile.name === name)
	}
	hasProviderProfileEntry(name) {
		return !!this.getProviderProfileEntry(name)
	}
	async upsertProviderProfile(name, providerSettings, activate = true) {
		try {
			// TODO: Do we need to be calling `activateProfile`? It's not
			// clear to me what the source of truth should be; in some cases
			// we rely on the `ContextProxy`'s data store and in other cases
			// we rely on the `ProviderSettingsManager`'s data store. It might
			// be simpler to unify these two.
			const id = await this.providerSettingsManager.saveConfig(name, providerSettings)
			if (activate) {
				const { mode } = await this.getState()
				// These promises do the following:
				// 1. Adds or updates the list of provider profiles.
				// 2. Sets the current provider profile.
				// 3. Sets the current mode's provider profile.
				// 4. Copies the provider settings to the context.
				//
				// Note: 1, 2, and 4 can be done in one `ContextProxy` call:
				// this.contextProxy.setValues({ ...providerSettings, listApiConfigMeta: ..., currentApiConfigName: ... })
				// We should probably switch to that and verify that it works.
				// I left the original implementation in just to be safe.
				await Promise.all([
					this.updateGlobalState("listApiConfigMeta", await this.providerSettingsManager.listConfig()),
					this.updateGlobalState("currentApiConfigName", name),
					this.providerSettingsManager.setModeConfig(mode, id),
					this.contextProxy.setProviderSettings(providerSettings),
				])
				// Change the provider for the current task.
				// TODO: We should rename `buildApiHandler` for clarity (e.g. `getProviderClient`).
				this.updateTaskApiHandlerIfNeeded(providerSettings, { forceRebuild: true })
				// Keep the current task's sticky provider profile in sync with the newly-activated profile.
				await this.persistStickyProviderProfileToCurrentTask(name)
			} else {
				await this.updateGlobalState("listApiConfigMeta", await this.providerSettingsManager.listConfig())
			}
			await this.postStateToWebview()
			return id
		} catch (error) {
			this.log(
				`Error create new api configuration: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
			)
			vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.create_api_config"))
			return undefined
		}
	}
	async deleteProviderProfile(profileToDelete) {
		const globalSettings = this.contextProxy.getValues()
		let profileToActivate = globalSettings.currentApiConfigName
		if (profileToDelete.name === profileToActivate) {
			profileToActivate = this.getProviderProfileEntries().find(({ name }) => name !== profileToDelete.name)?.name
		}
		if (!profileToActivate) {
			throw new Error("You cannot delete the last profile")
		}
		const entries = this.getProviderProfileEntries().filter(({ name }) => name !== profileToDelete.name)
		await this.contextProxy.setValues({
			...globalSettings,
			currentApiConfigName: profileToActivate,
			listApiConfigMeta: entries,
		})
		await this.postStateToWebview()
	}
	async persistStickyProviderProfileToCurrentTask(apiConfigName) {
		const task = this.getCurrentTask()
		if (!task) {
			return
		}
		try {
			// Update in-memory state immediately so sticky behavior works even before the task has
			// been persisted into taskHistory (it will be captured on the next save).
			task.setTaskApiConfigName(apiConfigName)
			const taskHistoryItem =
				this.taskHistoryStore.get(task.taskId) ??
				(this.getGlobalState("taskHistory") ?? []).find((item) => item.id === task.taskId)
			if (taskHistoryItem) {
				await this.updateTaskHistory({ ...taskHistoryItem, apiConfigName })
			}
		} catch (error) {
			// If persistence fails, log the error but don't fail the profile switch.
			this.log(
				`Failed to persist provider profile switch for task ${task.taskId}: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}
	async activateProviderProfile(args, options) {
		const { name, id, ...providerSettings } = await this.providerSettingsManager.activateProfile(args)
		const persistModeConfig = options?.persistModeConfig ?? true
		const persistTaskHistory = options?.persistTaskHistory ?? true
		// See `upsertProviderProfile` for a description of what this is doing.
		await Promise.all([
			this.contextProxy.setValue("listApiConfigMeta", await this.providerSettingsManager.listConfig()),
			this.contextProxy.setValue("currentApiConfigName", name),
			this.contextProxy.setProviderSettings(providerSettings),
		])
		const { mode } = await this.getState()
		if (id && persistModeConfig) {
			await this.providerSettingsManager.setModeConfig(mode, id)
		}
		// Change the provider for the current task.
		this.updateTaskApiHandlerIfNeeded(providerSettings, { forceRebuild: true })
		// Update the current task's sticky provider profile, unless this activation is
		// being used purely as a non-persisting restoration (e.g., reopening a task from history).
		if (persistTaskHistory) {
			await this.persistStickyProviderProfileToCurrentTask(name)
		}
		await this.postStateToWebview()
		if (providerSettings.apiProvider) {
			this.emit(types_1.AliCodeEventName.ProviderProfileChanged, { name, provider: providerSettings.apiProvider })
		}
	}
	async updateCustomInstructions(instructions) {
		// User may be clearing the field.
		await this.updateGlobalState("customInstructions", instructions || undefined)
		await this.postStateToWebview()
	}
	// MCP
	async ensureMcpServersDirectoryExists() {
		// Get platform-specific application data directory
		let mcpServersDir
		if (process.platform === "win32") {
			// Windows: %APPDATA%\Ali-Code\MCP
			mcpServersDir = path.join(os_1.default.homedir(), "AppData", "Roaming", "Ali-Code", "MCP")
		} else if (process.platform === "darwin") {
			// macOS: ~/Documents/Cline/MCP
			mcpServersDir = path.join(os_1.default.homedir(), "Documents", "Cline", "MCP")
		} else {
			// Linux: ~/.local/share/Cline/MCP
			mcpServersDir = path.join(os_1.default.homedir(), ".local", "share", "Ali-Code", "MCP")
		}
		try {
			await promises_1.default.mkdir(mcpServersDir, { recursive: true })
		} catch (error) {
			// Fallback to a relative path if directory creation fails
			return path.join(os_1.default.homedir(), ".ali-code", "mcp")
		}
		return mcpServersDir
	}
	async ensureSettingsDirectoryExists() {
		const { getSettingsDirectoryPath } = await import("../../utils/storage")
		const globalStoragePath = this.contextProxy.globalStorageUri.fsPath
		return getSettingsDirectoryPath(globalStoragePath)
	}
	// OpenRouter
	async handleOpenRouterCallback(code) {
		let { apiConfiguration, currentApiConfigName = "default" } = await this.getState()
		let apiKey
		try {
			const baseUrl = apiConfiguration.openRouterBaseUrl || "https://openrouter.ai/api/v1"
			// Extract the base domain for the auth endpoint.
			const baseUrlDomain = baseUrl.match(/^(https?:\/\/[^\/]+)/)?.[1] || "https://openrouter.ai"
			const response = await axios_1.default.post(`${baseUrlDomain}/api/v1/auth/keys`, { code })
			if (response.data && response.data.key) {
				apiKey = response.data.key
			} else {
				throw new Error("Invalid response from OpenRouter API")
			}
		} catch (error) {
			this.log(
				`Error exchanging code for API key: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
			)
			throw error
		}
		const newConfiguration = {
			...apiConfiguration,
			apiProvider: "openrouter",
			openRouterApiKey: apiKey,
			openRouterModelId: apiConfiguration?.openRouterModelId || types_1.openRouterDefaultModelId,
		}
		await this.upsertProviderProfile(currentApiConfigName, newConfiguration)
	}
	// Requesty
	async handleRequestyCallback(code, baseUrl) {
		let { apiConfiguration } = await this.getState()
		const newConfiguration = {
			...apiConfiguration,
			apiProvider: "requesty",
			requestyApiKey: code,
			requestyModelId: apiConfiguration?.requestyModelId || types_1.requestyDefaultModelId,
		}
		// set baseUrl as undefined if we don't provide one
		// or if it is the default requesty url
		if (!baseUrl || baseUrl === requesty_1.REQUESTY_BASE_URL) {
			newConfiguration.requestyBaseUrl = undefined
		} else {
			newConfiguration.requestyBaseUrl = baseUrl
		}
		const profileName = `Requesty (${new Date().toLocaleString()})`
		await this.upsertProviderProfile(profileName, newConfiguration)
	}
	// Task history
	async getTaskWithId(id) {
		const historyItem =
			this.taskHistoryStore.get(id) ?? (this.getGlobalState("taskHistory") ?? []).find((item) => item.id === id)
		if (!historyItem) {
			throw new Error("Task not found")
		}
		const { getTaskDirectoryPath } = await import("../../utils/storage")
		const globalStoragePath = this.contextProxy.globalStorageUri.fsPath
		const taskDirPath = await getTaskDirectoryPath(globalStoragePath, id)
		const apiConversationHistoryFilePath = path.join(
			taskDirPath,
			globalFileNames_1.GlobalFileNames.apiConversationHistory,
		)
		const uiMessagesFilePath = path.join(taskDirPath, globalFileNames_1.GlobalFileNames.uiMessages)
		const fileExists = await (0, fs_1.fileExistsAtPath)(apiConversationHistoryFilePath)
		let apiConversationHistory = []
		if (fileExists) {
			try {
				apiConversationHistory = JSON.parse(
					await promises_1.default.readFile(apiConversationHistoryFilePath, "utf8"),
				)
			} catch (error) {
				console.warn(
					`[getTaskWithId] api_conversation_history.json corrupted for task ${id}, returning empty history: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
		} else {
			console.warn(
				`[getTaskWithId] api_conversation_history.json missing for task ${id}, returning empty history`,
			)
		}
		return {
			historyItem,
			taskDirPath,
			apiConversationHistoryFilePath,
			uiMessagesFilePath,
			apiConversationHistory,
		}
	}
	async getTaskWithAggregatedCosts(taskId) {
		const { historyItem } = await this.getTaskWithId(taskId)
		const aggregatedCosts = await (0, aggregateTaskCosts_1.aggregateTaskCostsRecursive)(taskId, async (id) => {
			const result = await this.getTaskWithId(id)
			return result.historyItem
		})
		return { historyItem, aggregatedCosts }
	}
	async showTaskWithId(id) {
		if (id !== this.getCurrentTask()?.taskId) {
			// Non-current task.
			const { historyItem } = await this.getTaskWithId(id)
			await this.createTaskWithHistoryItem(historyItem) // Clears existing task.
		}
		await this.postMessageToWebview({ type: "action", action: "chatButtonClicked" })
	}
	/**
	 * Renames a task in the task history by updating its `task` (title) field.
	 * Broadcasts the updated history item to the webview so the UI reflects the new title.
	 *
	 * @param id The task id to rename.
	 * @param title The new title for the task.
	 */
	async renameTaskWithId(id, title) {
		const trimmed = (title ?? "").trim()
		if (!trimmed) {
			return
		}
		const existing =
			this.taskHistoryStore.get(id) ?? (this.getGlobalState("taskHistory") ?? []).find((item) => item.id === id)
		if (!existing) {
			this.log(`[renameTaskWithId] task ${id} not found`)
			return
		}
		await this.updateTaskHistory({ ...existing, task: trimmed })
	}
	async exportTaskWithId(id) {
		const { historyItem, apiConversationHistory } = await this.getTaskWithId(id)
		const fileName = (0, export_markdown_1.getTaskFileName)(historyItem.ts)
		const defaultUri = await (0, export_1.resolveDefaultSaveUri)(
			this.contextProxy,
			"lastTaskExportPath",
			fileName,
			{
				useWorkspace: false,
				fallbackDir: path.join(os_1.default.homedir(), "Downloads"),
			},
		)
		const saveUri = await (0, export_markdown_1.downloadTask)(historyItem.ts, apiConversationHistory, defaultUri)
		if (saveUri) {
			await (0, export_1.saveLastExportPath)(this.contextProxy, "lastTaskExportPath", saveUri)
		}
	}
	/* Condenses a task's message history to use fewer tokens. */
	async condenseTaskContext(taskId) {
		let task
		for (let i = this.clineStack.length - 1; i >= 0; i--) {
			if (this.clineStack[i].taskId === taskId) {
				task = this.clineStack[i]
				break
			}
		}
		if (!task) {
			throw new Error(`Task with id ${taskId} not found in stack`)
		}
		await task.condenseContext()
		await this.postMessageToWebview({ type: "condenseTaskContextResponse", text: taskId })
	}
	// this function deletes a task from task history, and deletes its checkpoints and delete the task folder
	// If the task has subtasks (childIds), they will also be deleted recursively
	async deleteTaskWithId(id, cascadeSubtasks = true) {
		try {
			// get the task directory full path and history item
			const { taskDirPath, historyItem } = await this.getTaskWithId(id)
			// Collect all task IDs to delete (parent + all subtasks)
			const allIdsToDelete = [id]
			if (cascadeSubtasks) {
				// Recursively collect all child IDs
				const collectChildIds = async (taskId) => {
					try {
						const { historyItem: item } = await this.getTaskWithId(taskId)
						if (item.childIds && item.childIds.length > 0) {
							for (const childId of item.childIds) {
								allIdsToDelete.push(childId)
								await collectChildIds(childId)
							}
						}
					} catch (error) {
						// Child task may already be deleted or not found, continue
						console.log(`[deleteTaskWithId] child task ${taskId} not found, skipping`)
					}
				}
				await collectChildIds(id)
			}
			// Remove from stack if any of the tasks to delete are in the current task stack
			for (const taskId of allIdsToDelete) {
				if (taskId === this.getCurrentTask()?.taskId) {
					// Close the current task instance; delegation flows will be handled via metadata if applicable.
					await this.removeClineFromStack()
					break
				}
			}
			// Delete all tasks from state in one batch
			await this.taskHistoryStore.deleteMany(allIdsToDelete)
			this.recentTasksCache = undefined
			// Delete associated shadow repositories or branches and task directories
			const globalStorageDir = this.contextProxy.globalStorageUri.fsPath
			const workspaceDir = this.cwd
			const { getTaskDirectoryPath } = await import("../../utils/storage")
			const globalStoragePath = this.contextProxy.globalStorageUri.fsPath
			for (const taskId of allIdsToDelete) {
				try {
					await ShadowCheckpointService_1.ShadowCheckpointService.deleteTask({
						taskId,
						globalStorageDir,
						workspaceDir,
					})
				} catch (error) {
					console.error(
						`[deleteTaskWithId${taskId}] failed to delete associated shadow repository or branch: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
				// Delete the task directory
				try {
					const dirPath = await getTaskDirectoryPath(globalStoragePath, taskId)
					await promises_1.default.rm(dirPath, { recursive: true, force: true })
					console.log(`[deleteTaskWithId${taskId}] removed task directory`)
				} catch (error) {
					console.error(
						`[deleteTaskWithId${taskId}] failed to remove task directory: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}
			await this.postStateToWebview()
		} catch (error) {
			// If task is not found, just remove it from state
			if (error instanceof Error && error.message === "Task not found") {
				await this.deleteTaskFromState(id)
				return
			}
			throw error
		}
	}
	async deleteTaskFromState(id) {
		await this.taskHistoryStore.delete(id)
		this.recentTasksCache = undefined
		await this.postStateToWebview()
	}
	async refreshWorkspace() {
		this.currentWorkspacePath = (0, path_1.getWorkspacePath)()
		await this.postStateToWebview()
	}
	async postStateToWebview() {
		const state = await this.getStateToPostToWebview()
		this.clineMessagesSeq++
		state.clineMessagesSeq = this.clineMessagesSeq
		this.postMessageToWebview({ type: "state", state })
	}
	/**
	 * Like postStateToWebview but intentionally omits taskHistory.
	 *
	 * Rationale:
	 * - taskHistory can be large and was being resent on every chat message update.
	 * - The webview maintains taskHistory in-memory and receives updates via
	 *   `taskHistoryUpdated` / `taskHistoryItemUpdated`.
	 */
	async postStateToWebviewWithoutTaskHistory() {
		const state = await this.getStateToPostToWebview()
		this.clineMessagesSeq++
		state.clineMessagesSeq = this.clineMessagesSeq
		const { taskHistory: _omit, ...rest } = state
		this.postMessageToWebview({ type: "state", state: rest })
	}
	/**
	 * Like postStateToWebview but intentionally omits both clineMessages and taskHistory.
	 *
	 * Rationale:
	 * - Settings and mode changes trigger state pushes
	 *   that have nothing to do with chat messages. Including clineMessages in these pushes
	 *   creates race conditions where a stale snapshot of clineMessages (captured during async
	 *   getStateToPostToWebview) overwrites newer messages the task has streamed in the meantime.
	 * - This method ensures non-message events only push the state fields they actually affect
	 *   without interfering with task message streaming.
	 */
	async postStateToWebviewWithoutClineMessages() {
		const state = await this.getStateToPostToWebview()
		const { clineMessages: _omitMessages, taskHistory: _omitHistory, ...rest } = state
		this.postMessageToWebview({ type: "state", state: rest })
	}
	/**
	 * Merges allowed commands from global state and workspace configuration
	 * with proper validation and deduplication
	 */
	mergeAllowedCommands(globalStateCommands) {
		return this.mergeCommandLists("allowedCommands", "allowed", globalStateCommands)
	}
	/**
	 * Merges denied commands from global state and workspace configuration
	 * with proper validation and deduplication
	 */
	mergeDeniedCommands(globalStateCommands) {
		return this.mergeCommandLists("deniedCommands", "denied", globalStateCommands)
	}
	/**
	 * Common utility for merging command lists from global state and workspace configuration.
	 * Implements the Command Denylist feature's merging strategy with proper validation.
	 *
	 * @param configKey - VSCode workspace configuration key
	 * @param commandType - Type of commands for error logging
	 * @param globalStateCommands - Commands from global state
	 * @returns Merged and deduplicated command list
	 */
	mergeCommandLists(configKey, commandType, globalStateCommands) {
		try {
			// Validate and sanitize global state commands
			const validGlobalCommands = Array.isArray(globalStateCommands)
				? globalStateCommands.filter((cmd) => typeof cmd === "string" && cmd.trim().length > 0)
				: []
			// Get workspace configuration commands
			const workspaceCommands = vscode.workspace.getConfiguration(package_1.Package.name).get(configKey) || []
			// Validate and sanitize workspace commands
			const validWorkspaceCommands = Array.isArray(workspaceCommands)
				? workspaceCommands.filter((cmd) => typeof cmd === "string" && cmd.trim().length > 0)
				: []
			// Combine and deduplicate commands
			// Global state takes precedence over workspace configuration
			const mergedCommands = [...new Set([...validGlobalCommands, ...validWorkspaceCommands])]
			return mergedCommands
		} catch (error) {
			console.error(`Error merging ${commandType} commands:`, error)
			// Return empty array as fallback to prevent crashes
			return []
		}
	}
	async getStateToPostToWebview() {
		// Ensure the store is initialized before reading task history
		await this.taskHistoryStore.initialized
		const {
			apiConfiguration,
			lastShownAnnouncementId,
			customInstructions,
			alwaysAllowReadOnly,
			alwaysAllowReadOnlyOutsideWorkspace,
			alwaysAllowWrite,
			alwaysAllowWriteOutsideWorkspace,
			alwaysAllowWriteProtected,
			alwaysAllowExecute,
			allowedCommands,
			deniedCommands,
			alwaysAllowMcp,
			alwaysAllowModeSwitch,
			alwaysAllowSubtasks,
			allowedMaxRequests,
			allowedMaxCost,
			autoCondenseContext,
			autoCondenseContextPercent,
			soundEnabled,
			ttsEnabled,
			ttsSpeed,
			enableCheckpoints,
			checkpointTimeout,
			taskHistory,
			soundVolume,
			writeDelayMs,
			terminalShellIntegrationTimeout,
			terminalShellIntegrationDisabled,
			terminalCommandDelay,
			terminalPowershellCounter,
			terminalZshClearEolMark,
			terminalZshOhMy,
			terminalZshP10k,
			terminalZdotdir,
			mcpEnabled,
			currentApiConfigName,
			listApiConfigMeta,
			pinnedApiConfigs,
			mode,
			customModePrompts,
			customSupportPrompts,
			enhancementApiConfigId,
			autoApprovalEnabled,
			customModes,
			experiments,
			maxOpenTabsContext,
			maxWorkspaceFiles,
			disabledTools,
			showAliIgnoredFiles,
			enableSubfolderRules,
			language,
			maxImageFileSize,
			maxTotalImageSize,
			historyPreviewCollapsed,
			reasoningBlockCollapsed,
			enterBehavior,
			organizationAllowList,
			customCondensingPrompt,
			codebaseIndexConfig,
			codebaseIndexModels,
			profileThresholds,
			alwaysAllowFollowupQuestions,
			followupAutoApproveTimeoutMs,
			includeDiagnosticMessages,
			maxDiagnosticMessages,
			includeTaskHistoryInEnhance,
			includeCurrentTime,
			includeCurrentCost,
			maxGitStatusFiles,
			imageGenerationProvider,
			openRouterImageApiKey,
			openRouterImageGenerationSelectedModel,
			lockApiConfigAcrossModes,
		} = await this.getState()
		const mergedAllowedCommands = this.mergeAllowedCommands(allowedCommands)
		const mergedDeniedCommands = this.mergeDeniedCommands(deniedCommands)
		const cwd = this.cwd
		const currentTask = this.getCurrentTask()
		return {
			version: this.context.extension?.packageJSON?.version ?? "",
			apiConfiguration,
			customInstructions,
			alwaysAllowReadOnly: alwaysAllowReadOnly ?? false,
			alwaysAllowReadOnlyOutsideWorkspace: alwaysAllowReadOnlyOutsideWorkspace ?? false,
			alwaysAllowWrite: alwaysAllowWrite ?? false,
			alwaysAllowWriteOutsideWorkspace: alwaysAllowWriteOutsideWorkspace ?? false,
			alwaysAllowWriteProtected: alwaysAllowWriteProtected ?? false,
			alwaysAllowExecute: alwaysAllowExecute ?? false,
			alwaysAllowMcp: alwaysAllowMcp ?? false,
			alwaysAllowModeSwitch: alwaysAllowModeSwitch ?? false,
			alwaysAllowSubtasks: alwaysAllowSubtasks ?? false,
			allowedMaxRequests,
			allowedMaxCost,
			autoCondenseContext: autoCondenseContext ?? true,
			autoCondenseContextPercent: autoCondenseContextPercent ?? 100,
			uriScheme: vscode.env.uriScheme,
			currentTaskId: currentTask?.taskId,
			currentTaskItem: currentTask?.taskId ? this.taskHistoryStore.get(currentTask.taskId) : undefined,
			clineMessages: currentTask?.clineMessages || [],
			currentTaskTodos: currentTask?.todoList || [],
			messageQueue: currentTask?.messageQueueService?.messages,
			taskHistory: this.taskHistoryStore.getAll().filter((item) => item.ts && item.task),
			soundEnabled: soundEnabled ?? false,
			ttsEnabled: ttsEnabled ?? false,
			ttsSpeed: ttsSpeed ?? 1.0,
			enableCheckpoints: enableCheckpoints ?? true,
			checkpointTimeout: checkpointTimeout ?? types_1.DEFAULT_CHECKPOINT_TIMEOUT_SECONDS,
			shouldShowAnnouncement: lastShownAnnouncementId !== this.latestAnnouncementId,
			allowedCommands: mergedAllowedCommands,
			deniedCommands: mergedDeniedCommands,
			soundVolume: soundVolume ?? 0.5,
			writeDelayMs: writeDelayMs ?? types_1.DEFAULT_WRITE_DELAY_MS,
			terminalShellIntegrationTimeout:
				terminalShellIntegrationTimeout ?? Terminal_1.Terminal.defaultShellIntegrationTimeout,
			terminalShellIntegrationDisabled: terminalShellIntegrationDisabled ?? true,
			terminalCommandDelay: terminalCommandDelay ?? 0,
			terminalPowershellCounter: terminalPowershellCounter ?? false,
			terminalZshClearEolMark: terminalZshClearEolMark ?? true,
			terminalZshOhMy: terminalZshOhMy ?? false,
			terminalZshP10k: terminalZshP10k ?? false,
			terminalZdotdir: terminalZdotdir ?? false,
			mcpEnabled: mcpEnabled ?? true,
			currentApiConfigName: currentApiConfigName ?? "default",
			listApiConfigMeta: listApiConfigMeta ?? [],
			pinnedApiConfigs: pinnedApiConfigs ?? {},
			mode: mode ?? modes_1.defaultModeSlug,
			customModePrompts: customModePrompts ?? {},
			customSupportPrompts: customSupportPrompts ?? {},
			enhancementApiConfigId,
			autoApprovalEnabled: autoApprovalEnabled ?? false,
			customModes,
			experiments: experiments ?? experiments_1.experimentDefault,
			mcpServers: this.mcpHub?.getAllServers() ?? [],
			maxOpenTabsContext: maxOpenTabsContext ?? 20,
			maxWorkspaceFiles: maxWorkspaceFiles ?? 200,
			cwd,
			disabledTools,
			showAliIgnoredFiles: showAliIgnoredFiles ?? false,
			enableSubfolderRules: enableSubfolderRules ?? false,
			language: language ?? (0, language_1.formatLanguage)(vscode.env.language),
			renderContext: this.renderContext,
			maxImageFileSize: maxImageFileSize ?? 5,
			maxTotalImageSize: maxTotalImageSize ?? 20,
			settingsImportedAt: this.settingsImportedAt,
			historyPreviewCollapsed: historyPreviewCollapsed ?? false,
			reasoningBlockCollapsed: reasoningBlockCollapsed ?? true,
			enterBehavior: enterBehavior ?? "send",
			organizationAllowList,
			customCondensingPrompt,
			codebaseIndexModels: codebaseIndexModels ?? embeddingModels_1.EMBEDDING_MODEL_PROFILES,
			codebaseIndexConfig: {
				codebaseIndexEnabled: codebaseIndexConfig?.codebaseIndexEnabled ?? false,
				codebaseIndexQdrantUrl: codebaseIndexConfig?.codebaseIndexQdrantUrl ?? "http://localhost:6333",
				codebaseIndexEmbedderProvider: codebaseIndexConfig?.codebaseIndexEmbedderProvider ?? "openai",
				codebaseIndexEmbedderBaseUrl: codebaseIndexConfig?.codebaseIndexEmbedderBaseUrl ?? "",
				codebaseIndexEmbedderModelId: codebaseIndexConfig?.codebaseIndexEmbedderModelId ?? "",
				codebaseIndexEmbedderModelDimension: codebaseIndexConfig?.codebaseIndexEmbedderModelDimension ?? 1536,
				codebaseIndexOpenAiCompatibleBaseUrl: codebaseIndexConfig?.codebaseIndexOpenAiCompatibleBaseUrl,
				codebaseIndexSearchMaxResults: codebaseIndexConfig?.codebaseIndexSearchMaxResults,
				codebaseIndexSearchMinScore: codebaseIndexConfig?.codebaseIndexSearchMinScore,
				codebaseIndexBedrockRegion: codebaseIndexConfig?.codebaseIndexBedrockRegion,
				codebaseIndexBedrockProfile: codebaseIndexConfig?.codebaseIndexBedrockProfile,
				codebaseIndexOpenRouterSpecificProvider: codebaseIndexConfig?.codebaseIndexOpenRouterSpecificProvider,
			},
			profileThresholds: profileThresholds ?? {},
			hasOpenedModeSelector: this.getGlobalState("hasOpenedModeSelector") ?? false,
			lockApiConfigAcrossModes: lockApiConfigAcrossModes ?? false,
			alwaysAllowFollowupQuestions: alwaysAllowFollowupQuestions ?? false,
			followupAutoApproveTimeoutMs: followupAutoApproveTimeoutMs ?? 60000,
			includeDiagnosticMessages: includeDiagnosticMessages ?? true,
			maxDiagnosticMessages: maxDiagnosticMessages ?? 50,
			includeTaskHistoryInEnhance: includeTaskHistoryInEnhance ?? true,
			includeCurrentTime: includeCurrentTime ?? true,
			includeCurrentCost: includeCurrentCost ?? true,
			maxGitStatusFiles: maxGitStatusFiles ?? 0,
			imageGenerationProvider,
			openRouterImageApiKey,
			openRouterImageGenerationSelectedModel,
			openAiCodexIsAuthenticated: await (async () => {
				try {
					const { openAiCodexOAuthManager } = await import("../../integrations/openai-codex/oauth")
					return await openAiCodexOAuthManager.isAuthenticated()
				} catch {
					return false
				}
			})(),
			debug: vscode.workspace.getConfiguration(package_1.Package.name).get("debug", false),
		}
	}
	/**
	 * Storage
	 * https://dev.to/kompotkot/how-to-use-secretstorage-in-your-vscode-extensions-2hco
	 * https://www.eliostruyf.com/devhack-code-extension-storage-options/
	 */
	async getState() {
		const stateValues = this.contextProxy.getValues()
		const customModes = await this.customModesManager.getCustomModes()
		// Determine apiProvider with the same logic as before, while filtering retired providers.
		const apiProvider =
			stateValues.apiProvider && !(0, types_1.isRetiredProvider)(stateValues.apiProvider)
				? stateValues.apiProvider
				: "openrouter"
		// Build the apiConfiguration object combining state values and secrets.
		const providerSettings = this.contextProxy.getProviderSettings()
		// Ensure apiProvider is set properly if not already in state
		if (!providerSettings.apiProvider) {
			providerSettings.apiProvider = apiProvider
		}
		if (providerSettings.apiProvider === "openrouter" && !providerSettings.openRouterModelId) {
			providerSettings.openRouterModelId = types_1.openRouterDefaultModelId
		}
		const organizationAllowList = types_1.ORGANIZATION_ALLOW_ALL
		// Return the same structure as before.
		return {
			apiConfiguration: providerSettings,
			lastShownAnnouncementId: stateValues.lastShownAnnouncementId,
			customInstructions: stateValues.customInstructions,
			apiModelId: stateValues.apiModelId,
			alwaysAllowReadOnly: stateValues.alwaysAllowReadOnly ?? false,
			alwaysAllowReadOnlyOutsideWorkspace: stateValues.alwaysAllowReadOnlyOutsideWorkspace ?? false,
			alwaysAllowWrite: stateValues.alwaysAllowWrite ?? false,
			alwaysAllowWriteOutsideWorkspace: stateValues.alwaysAllowWriteOutsideWorkspace ?? false,
			alwaysAllowWriteProtected: stateValues.alwaysAllowWriteProtected ?? false,
			alwaysAllowExecute: stateValues.alwaysAllowExecute ?? false,
			alwaysAllowMcp: stateValues.alwaysAllowMcp ?? false,
			alwaysAllowModeSwitch: stateValues.alwaysAllowModeSwitch ?? false,
			alwaysAllowSubtasks: stateValues.alwaysAllowSubtasks ?? false,
			alwaysAllowFollowupQuestions: stateValues.alwaysAllowFollowupQuestions ?? false,
			followupAutoApproveTimeoutMs: stateValues.followupAutoApproveTimeoutMs ?? 60000,
			diagnosticsEnabled: stateValues.diagnosticsEnabled ?? true,
			allowedMaxRequests: stateValues.allowedMaxRequests,
			allowedMaxCost: stateValues.allowedMaxCost,
			autoCondenseContext: stateValues.autoCondenseContext ?? true,
			autoCondenseContextPercent: stateValues.autoCondenseContextPercent ?? 100,
			taskHistory: this.taskHistoryStore.getAll(),
			allowedCommands: stateValues.allowedCommands,
			deniedCommands: stateValues.deniedCommands,
			soundEnabled: stateValues.soundEnabled ?? false,
			ttsEnabled: stateValues.ttsEnabled ?? false,
			ttsSpeed: stateValues.ttsSpeed ?? 1.0,
			enableCheckpoints: stateValues.enableCheckpoints ?? true,
			checkpointTimeout: stateValues.checkpointTimeout ?? types_1.DEFAULT_CHECKPOINT_TIMEOUT_SECONDS,
			soundVolume: stateValues.soundVolume,
			writeDelayMs: stateValues.writeDelayMs ?? types_1.DEFAULT_WRITE_DELAY_MS,
			terminalShellIntegrationTimeout:
				stateValues.terminalShellIntegrationTimeout ?? Terminal_1.Terminal.defaultShellIntegrationTimeout,
			terminalShellIntegrationDisabled: stateValues.terminalShellIntegrationDisabled ?? true,
			terminalCommandDelay: stateValues.terminalCommandDelay ?? 0,
			terminalPowershellCounter: stateValues.terminalPowershellCounter ?? false,
			terminalZshClearEolMark: stateValues.terminalZshClearEolMark ?? true,
			terminalZshOhMy: stateValues.terminalZshOhMy ?? false,
			terminalZshP10k: stateValues.terminalZshP10k ?? false,
			terminalZdotdir: stateValues.terminalZdotdir ?? false,
			mode: stateValues.mode ?? modes_1.defaultModeSlug,
			language: stateValues.language ?? (0, language_1.formatLanguage)(vscode.env.language),
			mcpEnabled: stateValues.mcpEnabled ?? true,
			mcpServers: this.mcpHub?.getAllServers() ?? [],
			currentApiConfigName: stateValues.currentApiConfigName ?? "default",
			listApiConfigMeta: stateValues.listApiConfigMeta ?? [],
			pinnedApiConfigs: stateValues.pinnedApiConfigs ?? {},
			modeApiConfigs: stateValues.modeApiConfigs ?? {},
			customModePrompts: stateValues.customModePrompts ?? {},
			customSupportPrompts: stateValues.customSupportPrompts ?? {},
			enhancementApiConfigId: stateValues.enhancementApiConfigId,
			experiments: stateValues.experiments ?? experiments_1.experimentDefault,
			autoApprovalEnabled: stateValues.autoApprovalEnabled ?? false,
			customModes,
			maxOpenTabsContext: stateValues.maxOpenTabsContext ?? 20,
			maxWorkspaceFiles: stateValues.maxWorkspaceFiles ?? 200,
			disabledTools: stateValues.disabledTools,
			showAliIgnoredFiles: stateValues.showAliIgnoredFiles ?? false,
			enableSubfolderRules: stateValues.enableSubfolderRules ?? false,
			maxImageFileSize: stateValues.maxImageFileSize ?? 5,
			maxTotalImageSize: stateValues.maxTotalImageSize ?? 20,
			historyPreviewCollapsed: stateValues.historyPreviewCollapsed ?? false,
			reasoningBlockCollapsed: stateValues.reasoningBlockCollapsed ?? true,
			enterBehavior: stateValues.enterBehavior ?? "send",
			organizationAllowList,
			customCondensingPrompt: stateValues.customCondensingPrompt,
			codebaseIndexModels: stateValues.codebaseIndexModels ?? embeddingModels_1.EMBEDDING_MODEL_PROFILES,
			codebaseIndexConfig: {
				codebaseIndexEnabled: stateValues.codebaseIndexConfig?.codebaseIndexEnabled ?? false,
				codebaseIndexQdrantUrl:
					stateValues.codebaseIndexConfig?.codebaseIndexQdrantUrl ?? "http://localhost:6333",
				codebaseIndexEmbedderProvider:
					stateValues.codebaseIndexConfig?.codebaseIndexEmbedderProvider ?? "openai",
				codebaseIndexEmbedderBaseUrl: stateValues.codebaseIndexConfig?.codebaseIndexEmbedderBaseUrl ?? "",
				codebaseIndexEmbedderModelId: stateValues.codebaseIndexConfig?.codebaseIndexEmbedderModelId ?? "",
				codebaseIndexEmbedderModelDimension:
					stateValues.codebaseIndexConfig?.codebaseIndexEmbedderModelDimension,
				codebaseIndexOpenAiCompatibleBaseUrl:
					stateValues.codebaseIndexConfig?.codebaseIndexOpenAiCompatibleBaseUrl,
				codebaseIndexSearchMaxResults: stateValues.codebaseIndexConfig?.codebaseIndexSearchMaxResults,
				codebaseIndexSearchMinScore: stateValues.codebaseIndexConfig?.codebaseIndexSearchMinScore,
				codebaseIndexBedrockRegion: stateValues.codebaseIndexConfig?.codebaseIndexBedrockRegion,
				codebaseIndexBedrockProfile: stateValues.codebaseIndexConfig?.codebaseIndexBedrockProfile,
				codebaseIndexOpenRouterSpecificProvider:
					stateValues.codebaseIndexConfig?.codebaseIndexOpenRouterSpecificProvider,
			},
			profileThresholds: stateValues.profileThresholds ?? {},
			lockApiConfigAcrossModes: this.context.workspaceState.get("lockApiConfigAcrossModes", false),
			includeDiagnosticMessages: stateValues.includeDiagnosticMessages ?? true,
			maxDiagnosticMessages: stateValues.maxDiagnosticMessages ?? 50,
			includeTaskHistoryInEnhance: stateValues.includeTaskHistoryInEnhance ?? true,
			includeCurrentTime: stateValues.includeCurrentTime ?? true,
			includeCurrentCost: stateValues.includeCurrentCost ?? true,
			maxGitStatusFiles: stateValues.maxGitStatusFiles ?? 0,
			imageGenerationProvider: stateValues.imageGenerationProvider,
			openRouterImageApiKey: stateValues.openRouterImageApiKey,
			openRouterImageGenerationSelectedModel: stateValues.openRouterImageGenerationSelectedModel,
		}
	}
	/**
	 * Updates a task in the task history and optionally broadcasts the updated history to the webview.
	 * Now delegates to TaskHistoryStore for per-task file persistence.
	 *
	 * @param item The history item to update or add
	 * @param options.broadcast Whether to broadcast the updated history to the webview (default: true)
	 * @returns The updated task history array
	 */
	async updateTaskHistory(item, options = {}) {
		const { broadcast = true } = options
		const history = await this.taskHistoryStore.upsert(item)
		this.recentTasksCache = undefined
		// Broadcast the updated history to the webview if requested.
		// Prefer per-item updates to avoid repeatedly cloning/sending the full history.
		if (broadcast && this.isViewLaunched) {
			const updatedItem = this.taskHistoryStore.get(item.id) ?? item
			await this.postMessageToWebview({ type: "taskHistoryItemUpdated", taskHistoryItem: updatedItem })
		}
		return history
	}
	/**
	 * Schedule a debounced write-through of task history to globalState.
	 * Only used for backward compatibility during the transition period.
	 * Per-task files are authoritative; globalState is the downgrade fallback.
	 */
	scheduleGlobalStateWriteThrough() {
		if (this.globalStateWriteThroughTimer) {
			clearTimeout(this.globalStateWriteThroughTimer)
		}
		this.globalStateWriteThroughTimer = setTimeout(async () => {
			this.globalStateWriteThroughTimer = null
			try {
				const items = this.taskHistoryStore.getAll()
				await this.updateGlobalState("taskHistory", items)
			} catch (err) {
				this.log(
					`[scheduleGlobalStateWriteThrough] Failed: ${err instanceof Error ? err.message : String(err)}`,
				)
			}
		}, ClineProvider.GLOBAL_STATE_WRITE_THROUGH_DEBOUNCE_MS)
	}
	/**
	 * Flush any pending debounced globalState write-through immediately.
	 */
	flushGlobalStateWriteThrough() {
		if (this.globalStateWriteThroughTimer) {
			clearTimeout(this.globalStateWriteThroughTimer)
			this.globalStateWriteThroughTimer = null
		}
		const items = this.taskHistoryStore.getAll()
		this.updateGlobalState("taskHistory", items).catch((err) => {
			this.log(`[flushGlobalStateWriteThrough] Failed: ${err instanceof Error ? err.message : String(err)}`)
		})
	}
	/**
	 * Broadcasts a task history update to the webview.
	 * This sends a lightweight message with just the task history, rather than the full state.
	 * @param history The task history to broadcast (if not provided, reads from the store)
	 */
	async broadcastTaskHistoryUpdate(history) {
		if (!this.isViewLaunched) {
			return
		}
		const taskHistory = history ?? this.taskHistoryStore.getAll()
		// Sort and filter the history the same way as getStateToPostToWebview
		const sortedHistory = taskHistory.filter((item) => item.ts && item.task).sort((a, b) => b.ts - a.ts)
		await this.postMessageToWebview({
			type: "taskHistoryUpdated",
			taskHistory: sortedHistory,
		})
	}
	// ContextProxy
	// @deprecated - Use `ContextProxy#setValue` instead.
	async updateGlobalState(key, value) {
		await this.contextProxy.setValue(key, value)
	}
	// @deprecated - Use `ContextProxy#getValue` instead.
	getGlobalState(key) {
		return this.contextProxy.getValue(key)
	}
	async setValue(key, value) {
		await this.contextProxy.setValue(key, value)
	}
	getValue(key) {
		return this.contextProxy.getValue(key)
	}
	getValues() {
		return this.contextProxy.getValues()
	}
	async setValues(values) {
		await this.contextProxy.setValues(values)
	}
	// dev
	async resetState() {
		const answer = await vscode.window.showInformationMessage(
			(0, i18n_1.t)("common:confirmation.reset_state"),
			{ modal: true },
			(0, i18n_1.t)("common:answers.yes"),
		)
		if (answer !== (0, i18n_1.t)("common:answers.yes")) {
			return
		}
		await this.contextProxy.resetAllState()
		await this.providerSettingsManager.resetAllConfigs()
		await this.customModesManager.resetCustomModes()
		await this.removeClineFromStack()
		await this.postStateToWebview()
		await this.postMessageToWebview({ type: "action", action: "chatButtonClicked" })
	}
	// logging
	log(message) {
		this.outputChannel.appendLine(message)
		console.log(message)
	}
	// getters
	get workspaceTracker() {
		return this._workspaceTracker
	}
	get viewLaunched() {
		return this.isViewLaunched
	}
	get messages() {
		return this.getCurrentTask()?.clineMessages || []
	}
	getMcpHub() {
		return this.mcpHub
	}
	getSkillsManager() {
		return this.skillsManager
	}
	/**
	 * Gets the CodeIndexManager for the current active workspace
	 * @returns CodeIndexManager instance for the current workspace or the default one
	 */
	getCurrentWorkspaceCodeIndexManager() {
		return manager_1.CodeIndexManager.getInstance(this.context)
	}
	/**
	 * Updates the code index status subscription to listen to the current workspace manager
	 */
	updateCodeIndexStatusSubscription() {
		// Get the current workspace manager
		const currentManager = this.getCurrentWorkspaceCodeIndexManager()
		// If the manager hasn't changed, no need to update subscription
		if (currentManager === this.codeIndexManager) {
			return
		}
		// Dispose the old subscription if it exists
		if (this.codeIndexStatusSubscription) {
			this.codeIndexStatusSubscription.dispose()
			this.codeIndexStatusSubscription = undefined
		}
		// Update the current workspace manager reference
		this.codeIndexManager = currentManager
		// Subscribe to the new manager's progress updates if it exists
		if (currentManager) {
			this.codeIndexStatusSubscription = currentManager.onProgressUpdate((update) => {
				// Only send updates if this manager is still the current one
				if (currentManager === this.getCurrentWorkspaceCodeIndexManager()) {
					// Get the full status from the manager to ensure we have all fields correctly formatted
					const fullStatus = currentManager.getCurrentStatus()
					this.postMessageToWebview({
						type: "indexingStatusUpdate",
						values: fullStatus,
					})
				}
			})
			if (this.view) {
				this.webviewDisposables.push(this.codeIndexStatusSubscription)
			}
			// Send initial status for the current workspace
			this.postMessageToWebview({
				type: "indexingStatusUpdate",
				values: currentManager.getCurrentStatus(),
			})
		}
	}
	/**
	 * TaskProviderLike
	 */
	getCurrentTask() {
		if (this.clineStack.length === 0) {
			return undefined
		}
		return this.clineStack[this.clineStack.length - 1]
	}
	getRecentTasks() {
		if (this.recentTasksCache) {
			return this.recentTasksCache
		}
		const history = this.taskHistoryStore.getAll()
		const workspaceTasks = []
		for (const item of history) {
			if (!item.ts || !item.task || item.workspace !== this.cwd) {
				continue
			}
			workspaceTasks.push(item)
		}
		if (workspaceTasks.length === 0) {
			this.recentTasksCache = []
			return this.recentTasksCache
		}
		workspaceTasks.sort((a, b) => b.ts - a.ts)
		let recentTaskIds = []
		if (workspaceTasks.length >= 100) {
			// If we have at least 100 tasks, return tasks from the last 7 days.
			const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
			for (const item of workspaceTasks) {
				// Stop when we hit tasks older than 7 days.
				if (item.ts < sevenDaysAgo) {
					break
				}
				recentTaskIds.push(item.id)
			}
		} else {
			// Otherwise, return the most recent 100 tasks (or all if less than 100).
			recentTaskIds = workspaceTasks.slice(0, Math.min(100, workspaceTasks.length)).map((item) => item.id)
		}
		this.recentTasksCache = recentTaskIds
		return this.recentTasksCache
	}
	// When initializing a new task, (not from history but from a tool command
	// new_task) there is no need to remove the previous task since the new
	// task is a subtask of the previous one, and when it finishes it is removed
	// from the stack and the caller is resumed in this way we can have a chain
	// of tasks, each one being a sub task of the previous one until the main
	// task is finished.
	async createTask(text, images, parentTask, options = {}, configuration = {}) {
		if (configuration) {
			await this.setValues(configuration)
			if (configuration.allowedCommands) {
				await vscode.workspace
					.getConfiguration(package_1.Package.name)
					.update("allowedCommands", configuration.allowedCommands, vscode.ConfigurationTarget.Global)
			}
			if (configuration.deniedCommands) {
				await vscode.workspace
					.getConfiguration(package_1.Package.name)
					.update("deniedCommands", configuration.deniedCommands, vscode.ConfigurationTarget.Global)
			}
			if (configuration.commandExecutionTimeout !== undefined) {
				await vscode.workspace
					.getConfiguration(package_1.Package.name)
					.update(
						"commandExecutionTimeout",
						configuration.commandExecutionTimeout,
						vscode.ConfigurationTarget.Global,
					)
			}
			if (configuration.currentApiConfigName) {
				await this.setProviderProfile(configuration.currentApiConfigName)
			}
			// Register custom modes so the CustomModesManager knows about them.
			// setValues writes to global state, but the manager overwrites that
			// when it merges .alimodes + global settings on refresh.  Persisting
			// via updateCustomMode ensures modes survive the merge cycle.
			if (configuration.customModes?.length) {
				for (const mode of configuration.customModes) {
					await this.customModesManager.updateCustomMode(mode.slug, mode)
				}
			}
		}
		const { apiConfiguration, organizationAllowList, enableCheckpoints, checkpointTimeout, experiments } =
			await this.getState()
		// Single-open-task invariant: always enforce for user-initiated top-level tasks
		if (!parentTask) {
			try {
				await this.removeClineFromStack()
			} catch {
				// Non-fatal
			}
		}
		if (!ProfileValidator_1.ProfileValidator.isProfileAllowed(apiConfiguration, organizationAllowList)) {
			throw new errors_1.OrganizationAllowListViolationError(
				(0, i18n_1.t)("common:errors.violated_organization_allowlist"),
			)
		}
		const task = new Task_1.Task({
			provider: this,
			apiConfiguration,
			enableCheckpoints,
			checkpointTimeout,
			consecutiveMistakeLimit: apiConfiguration.consecutiveMistakeLimit,
			task: text,
			images,
			experiments,
			rootTask: this.clineStack.length > 0 ? this.clineStack[0] : undefined,
			parentTask,
			taskNumber: this.clineStack.length + 1,
			onCreated: this.taskCreationCallback,
			initialTodos: options.initialTodos,
			// Ensure this task is present in clineStack before startTask() emits
			// its initial state update, so state.currentTaskId is available ASAP.
			startTask: false,
			...options,
		})
		await this.addClineToStack(task)
		task.start()
		this.log(
			`[createTask] ${task.parentTask ? "child" : "parent"} task ${task.taskId}.${task.instanceId} instantiated`,
		)
		return task
	}
	async cancelTask() {
		const task = this.getCurrentTask()
		if (!task) {
			return
		}
		console.log(`[cancelTask] cancelling task ${task.taskId}.${task.instanceId}`)
		let historyItem
		try {
			const history = await this.getTaskWithId(task.taskId)
			historyItem = history.historyItem
		} catch (error) {
			// During task startup there is a short window where currentTask exists
			// but task history has not been persisted yet. Cancelling should still
			// abort safely; we just skip post-cancel rehydration in that case.
			if (error instanceof Error && error.message === "Task not found") {
				this.log(`[cancelTask] task history missing for ${task.taskId}; skipping rehydrate`)
			} else {
				throw error
			}
		}
		// Preserve parent and root task information for history item.
		const rootTask = task.rootTask
		const parentTask = task.parentTask
		// Mark this as a user-initiated cancellation so provider-only rehydration can occur
		task.abortReason = "user_cancelled"
		// Capture the current instance to detect if rehydrate already occurred elsewhere
		const originalInstanceId = task.instanceId
		// Immediately cancel the underlying HTTP request if one is in progress
		// This ensures the stream fails quickly rather than waiting for network timeout
		task.cancelCurrentRequest()
		// Begin abort (non-blocking)
		task.abortTask()
		// Immediately mark the original instance as abandoned to prevent any residual activity
		task.abandoned = true
		await (0, p_wait_for_1.default)(
			() =>
				this.getCurrentTask() === undefined ||
				this.getCurrentTask().isStreaming === false ||
				this.getCurrentTask().didFinishAbortingStream ||
				// If only the first chunk is processed, then there's no
				// need to wait for graceful abort (closes edits, browser,
				// etc).
				this.getCurrentTask().isWaitingForFirstChunk,
			{
				timeout: 3_000,
			},
		).catch(() => {
			console.error("Failed to abort task")
		})
		// Defensive safeguard: if current instance already changed, skip rehydrate
		const current = this.getCurrentTask()
		if (current && current.instanceId !== originalInstanceId) {
			this.log(
				`[cancelTask] Skipping rehydrate: current instance ${current.instanceId} != original ${originalInstanceId}`,
			)
			return
		}
		// Final race check before rehydrate to avoid duplicate rehydration
		{
			const currentAfterCheck = this.getCurrentTask()
			if (currentAfterCheck && currentAfterCheck.instanceId !== originalInstanceId) {
				this.log(
					`[cancelTask] Skipping rehydrate after final check: current instance ${currentAfterCheck.instanceId} != original ${originalInstanceId}`,
				)
				return
			}
		}
		if (!historyItem) {
			return
		}
		// Clears task again, so we need to abortTask manually above.
		await this.createTaskWithHistoryItem({ ...historyItem, rootTask, parentTask })
	}
	// Clear the current task without treating it as a subtask.
	// This is used when the user cancels a task that is not a subtask.
	async clearTask() {
		if (this.clineStack.length > 0) {
			const task = this.clineStack[this.clineStack.length - 1]
			console.log(`[clearTask] clearing task ${task.taskId}.${task.instanceId}`)
			await this.removeClineFromStack()
		}
	}
	resumeTask(taskId) {
		// Use the existing showTaskWithId method which handles both current and
		// historical tasks.
		this.showTaskWithId(taskId).catch((error) => {
			this.log(`Failed to resume task ${taskId}: ${error.message}`)
		})
	}
	// Modes
	async getModes() {
		try {
			const customModes = await this.customModesManager.getCustomModes()
			return [...types_1.DEFAULT_MODES, ...customModes].map(({ slug, name }) => ({ slug, name }))
		} catch (error) {
			return types_1.DEFAULT_MODES.map(({ slug, name }) => ({ slug, name }))
		}
	}
	async getMode() {
		const { mode } = await this.getState()
		return mode
	}
	async setMode(mode) {
		await this.setValues({ mode })
	}
	// Provider Profiles
	async getProviderProfiles() {
		const { listApiConfigMeta = [] } = await this.getState()
		return listApiConfigMeta.map((profile) => ({ name: profile.name, provider: profile.apiProvider }))
	}
	async getProviderProfile() {
		const { currentApiConfigName = "default" } = await this.getState()
		return currentApiConfigName
	}
	async setProviderProfile(name) {
		await this.activateProviderProfile({ name })
	}
	get cwd() {
		return this.currentWorkspacePath || (0, path_1.getWorkspacePath)()
	}
	/**
	 * Delegate parent task and open child task.
	 *
	 * - Enforce single-open invariant
	 * - Persist parent delegation metadata
	 * - Emit TaskDelegated (task-level; API forwards to provider/bridge)
	 * - Create child as sole active and switch mode to child's mode
	 */
	async delegateParentAndOpenChild(params) {
		const { parentTaskId, message, initialTodos, mode } = params
		// Metadata-driven delegation is always enabled
		// 1) Get parent (must be current task)
		const parent = this.getCurrentTask()
		if (!parent) {
			throw new Error("[delegateParentAndOpenChild] No current task")
		}
		if (parent.taskId !== parentTaskId) {
			throw new Error(
				`[delegateParentAndOpenChild] Parent mismatch: expected ${parentTaskId}, current ${parent.taskId}`,
			)
		}
		// 2) Flush pending tool results to API history BEFORE disposing the parent.
		//    This is critical: when tools are called before new_task,
		//    their tool_result blocks are in userMessageContent but not yet saved to API history.
		//    If we don't flush them, the parent's API conversation will be incomplete and
		//    cause 400 errors when resumed (missing tool_result for tool_use blocks).
		//
		//    NOTE: We do NOT pass the assistant message here because the assistant message
		//    is already added to apiConversationHistory by the normal flow in
		//    recursivelyMakeClineRequests BEFORE tools start executing. We only need to
		//    flush the pending user message with tool_results.
		try {
			const flushSuccess = await parent.flushPendingToolResultsToHistory()
			if (!flushSuccess) {
				console.warn(`[delegateParentAndOpenChild] Flush failed for parent ${parentTaskId}, retrying...`)
				const retrySuccess = await parent.retrySaveApiConversationHistory()
				if (!retrySuccess) {
					console.error(
						`[delegateParentAndOpenChild] CRITICAL: Parent ${parentTaskId} API history not persisted to disk. Child return may produce stale state.`,
					)
					vscode.window.showWarningMessage(
						"Warning: Parent task state could not be saved. The parent task may lose recent context when resumed.",
					)
				}
			}
		} catch (error) {
			this.log(
				`[delegateParentAndOpenChild] Error flushing pending tool results (non-fatal): ${error instanceof Error ? error.message : String(error)}`,
			)
		}
		// 3) Enforce single-open invariant by closing/disposing the parent first
		//    This ensures we never have >1 tasks open at any time during delegation.
		//    Await abort completion to ensure clean disposal and prevent unhandled rejections.
		try {
			await this.removeClineFromStack({ skipDelegationRepair: true })
		} catch (error) {
			this.log(
				`[delegateParentAndOpenChild] Error during parent disposal (non-fatal): ${error instanceof Error ? error.message : String(error)}`,
			)
			// Non-fatal: proceed with child creation even if parent cleanup had issues
		}
		// 3) Switch provider mode to child's requested mode BEFORE creating the child task
		//    This ensures the child's system prompt and configuration are based on the correct mode.
		//    The mode switch must happen before createTask() because the Task constructor
		//    initializes its mode from provider.getState() during initializeTaskMode().
		try {
			await this.handleModeSwitch(mode)
		} catch (e) {
			this.log(
				`[delegateParentAndOpenChild] handleModeSwitch failed for mode '${mode}': ${e?.message ?? String(e)}`,
			)
		}
		// 4) Create child as sole active (parent reference preserved for lineage)
		// Pass initialStatus: "active" to ensure the child task's historyItem is created
		// with status from the start, avoiding race conditions where the task might
		// call attempt_completion before status is persisted separately.
		//
		// Pass startTask: false to prevent the child from beginning its task loop
		// (and writing to globalState via saveClineMessages → updateTaskHistory)
		// before we persist the parent's delegation metadata in step 5.
		// Without this, the child's fire-and-forget startTask() races with step 5,
		// and the last writer to globalState overwrites the other's changes—
		// causing the parent's delegation fields to be lost.
		const child = await this.createTask(message, undefined, parent, {
			initialTodos,
			initialStatus: "active",
			startTask: false,
		})
		// 5) Persist parent delegation metadata BEFORE the child starts writing.
		try {
			const { historyItem } = await this.getTaskWithId(parentTaskId)
			const childIds = Array.from(new Set([...(historyItem.childIds ?? []), child.taskId]))
			const updatedHistory = {
				...historyItem,
				status: "delegated",
				delegatedToId: child.taskId,
				awaitingChildId: child.taskId,
				childIds,
			}
			await this.updateTaskHistory(updatedHistory)
		} catch (err) {
			this.log(
				`[delegateParentAndOpenChild] Failed to persist parent metadata for ${parentTaskId} -> ${child.taskId}: ${err?.message ?? String(err)}`,
			)
		}
		// 6) Start the child task now that parent metadata is safely persisted.
		child.start()
		// 7) Emit TaskDelegated (provider-level)
		try {
			this.emit(types_1.AliCodeEventName.TaskDelegated, parentTaskId, child.taskId)
		} catch {
			// non-fatal
		}
		return child
	}
	/**
	 * Reopen parent task from delegation with write-back and events.
	 */
	async reopenParentFromDelegation(params) {
		const { parentTaskId, childTaskId, completionResultSummary } = params
		const globalStoragePath = this.contextProxy.globalStorageUri.fsPath
		// 1) Load parent from history and current persisted messages
		const { historyItem } = await this.getTaskWithId(parentTaskId)
		let parentClineMessages = []
		try {
			parentClineMessages = await (0, taskMessages_1.readTaskMessages)({
				taskId: parentTaskId,
				globalStoragePath,
			})
		} catch {
			parentClineMessages = []
		}
		let parentApiMessages = []
		try {
			parentApiMessages = await (0, task_persistence_1.readApiMessages)({
				taskId: parentTaskId,
				globalStoragePath,
			})
		} catch {
			parentApiMessages = []
		}
		// 2) Inject synthetic records: UI subtask_result and update API tool_result
		const ts = Date.now()
		// Defensive: ensure arrays
		if (!Array.isArray(parentClineMessages)) parentClineMessages = []
		if (!Array.isArray(parentApiMessages)) parentApiMessages = []
		const subtaskUiMessage = {
			type: "say",
			say: "subtask_result",
			text: completionResultSummary,
			ts,
		}
		parentClineMessages.push(subtaskUiMessage)
		await (0, task_persistence_1.saveTaskMessages)({
			messages: parentClineMessages,
			taskId: parentTaskId,
			globalStoragePath,
		})
		// Find the tool_use_id from the last assistant message's new_task tool_use
		let toolUseId
		for (let i = parentApiMessages.length - 1; i >= 0; i--) {
			const msg = parentApiMessages[i]
			if (msg.role === "assistant" && Array.isArray(msg.content)) {
				for (const block of msg.content) {
					if (block.type === "tool_use" && block.name === "new_task") {
						toolUseId = block.id
						break
					}
				}
				if (toolUseId) break
			}
		}
		// Preferred: if the parent history contains the native tool_use for new_task,
		// inject a matching tool_result for the Anthropic message contract:
		// user → assistant (tool_use) → user (tool_result)
		if (toolUseId) {
			// Check if the last message is already a user message with a tool_result for this tool_use_id
			// (in case this is a retry or the history was already updated)
			const lastMsg = parentApiMessages[parentApiMessages.length - 1]
			let alreadyHasToolResult = false
			if (lastMsg?.role === "user" && Array.isArray(lastMsg.content)) {
				for (const block of lastMsg.content) {
					if (block.type === "tool_result" && block.tool_use_id === toolUseId) {
						// Update the existing tool_result content
						block.content = `Subtask ${childTaskId} completed.\n\nResult:\n${completionResultSummary}`
						alreadyHasToolResult = true
						break
					}
				}
			}
			// If no existing tool_result found, create a NEW user message with the tool_result
			if (!alreadyHasToolResult) {
				parentApiMessages.push({
					role: "user",
					content: [
						{
							type: "tool_result",
							tool_use_id: toolUseId,
							content: `Subtask ${childTaskId} completed.\n\nResult:\n${completionResultSummary}`,
						},
					],
					ts,
				})
			}
			// Validate the newly injected tool_result against the preceding assistant message.
			// This ensures the tool_result's tool_use_id matches a tool_use in the immediately
			// preceding assistant message (Anthropic API requirement).
			const lastMessage = parentApiMessages[parentApiMessages.length - 1]
			if (lastMessage?.role === "user") {
				const validatedMessage = (0, validateToolResultIds_1.validateAndFixToolResultIds)(
					lastMessage,
					parentApiMessages.slice(0, -1),
				)
				parentApiMessages[parentApiMessages.length - 1] = validatedMessage
			}
		} else {
			// If there is no corresponding tool_use in the parent API history, we cannot emit a
			// tool_result. Fall back to a plain user text note so the parent can still resume.
			parentApiMessages.push({
				role: "user",
				content: [
					{
						type: "text",
						text: `Subtask ${childTaskId} completed.\n\nResult:\n${completionResultSummary}`,
					},
				],
				ts,
			})
		}
		await (0, task_persistence_1.saveApiMessages)({
			messages: parentApiMessages,
			taskId: parentTaskId,
			globalStoragePath,
		})
		// 3) Close child instance if still open (single-open-task invariant).
		//    This MUST happen BEFORE updating the child's status to "completed" because
		//    removeClineFromStack() → abortTask(true) → saveClineMessages() writes
		//    the historyItem with initialStatus (typically "active"), which would
		//    overwrite a "completed" status set earlier.
		const current = this.getCurrentTask()
		if (current?.taskId === childTaskId) {
			await this.removeClineFromStack()
		}
		// 4) Update child metadata to "completed" status.
		//    This runs after the abort so it overwrites the stale "active" status
		//    that saveClineMessages() may have written during step 3.
		try {
			const { historyItem: childHistory } = await this.getTaskWithId(childTaskId)
			await this.updateTaskHistory({
				...childHistory,
				status: "completed",
			})
		} catch (err) {
			this.log(
				`[reopenParentFromDelegation] Failed to persist child completed status for ${childTaskId}: ${err?.message ?? String(err)}`,
			)
		}
		// 5) Update parent metadata and persist BEFORE emitting completion event
		const childIds = Array.from(new Set([...(historyItem.childIds ?? []), childTaskId]))
		const updatedHistory = {
			...historyItem,
			status: "active",
			completedByChildId: childTaskId,
			completionResultSummary,
			awaitingChildId: undefined,
			childIds,
		}
		await this.updateTaskHistory(updatedHistory)
		// 6) Emit TaskDelegationCompleted (provider-level)
		try {
			this.emit(
				types_1.AliCodeEventName.TaskDelegationCompleted,
				parentTaskId,
				childTaskId,
				completionResultSummary,
			)
		} catch {
			// non-fatal
		}
		// 7) Reopen the parent from history as the sole active task (restores saved mode)
		//    IMPORTANT: startTask=false to suppress resume-from-history ask scheduling
		const parentInstance = await this.createTaskWithHistoryItem(updatedHistory, { startTask: false })
		// 8) Inject restored histories into the in-memory instance before resuming
		if (parentInstance) {
			try {
				await parentInstance.overwriteClineMessages(parentClineMessages)
			} catch {
				// non-fatal
			}
			try {
				await parentInstance.overwriteApiConversationHistory(parentApiMessages)
			} catch {
				// non-fatal
			}
			// Auto-resume parent without ask("resume_task")
			await parentInstance.resumeAfterDelegation()
		}
		// 9) Emit TaskDelegationResumed (provider-level)
		try {
			this.emit(types_1.AliCodeEventName.TaskDelegationResumed, parentTaskId, childTaskId)
		} catch {
			// non-fatal
		}
	}
	/**
	 * Convert a file path to a webview-accessible URI
	 * This method safely converts file paths to URIs that can be loaded in the webview
	 *
	 * @param filePath - The absolute file path to convert
	 * @returns The webview URI string, or the original file URI if conversion fails
	 * @throws {Error} When webview is not available
	 * @throws {TypeError} When file path is invalid
	 */
	convertToWebviewUri(filePath) {
		try {
			const fileUri = vscode.Uri.file(filePath)
			// Check if we have a webview available
			if (this.view?.webview) {
				const webviewUri = this.view.webview.asWebviewUri(fileUri)
				return webviewUri.toString()
			}
			// Specific error for no webview available
			const error = new Error("No webview available for URI conversion")
			console.error(error.message)
			// Fallback to file URI if no webview available
			return fileUri.toString()
		} catch (error) {
			// More specific error handling
			if (error instanceof TypeError) {
				console.error("Invalid file path provided for URI conversion:", error)
			} else {
				console.error("Failed to convert to webview URI:", error)
			}
			// Return file URI as fallback
			return vscode.Uri.file(filePath).toString()
		}
	}
}
exports.ClineProvider = ClineProvider
