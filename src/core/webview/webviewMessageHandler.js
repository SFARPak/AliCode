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
exports.webviewMessageHandler = void 0
const safeWriteJson_1 = require("../../utils/safeWriteJson")
const path = __importStar(require("path"))
const os = __importStar(require("os"))
const fs = __importStar(require("fs/promises"))
const index_js_1 = require("../../services/ali-config/index.js")
const p_wait_for_1 = __importDefault(require("p-wait-for"))
const vscode = __importStar(require("vscode"))
const types_1 = require("@ali-code/types")
const core_1 = require("@ali-code/core")
const task_persistence_1 = require("../task-persistence")
const checkpointRestoreHandler_1 = require("./checkpointRestoreHandler")
const diagnosticsHandler_1 = require("./diagnosticsHandler")
const skillsMessageHandler_1 = require("./skillsMessageHandler")
const i18n_1 = require("../../i18n")
const package_1 = require("../../shared/package")
const api_1 = require("../../shared/api")
const messageEnhancer_1 = require("./messageEnhancer")
const manager_1 = require("../../services/code-index/manager")
const checkExistApiConfig_1 = require("../../shared/checkExistApiConfig")
const experiments_1 = require("../../shared/experiments")
const Terminal_1 = require("../../integrations/terminal/Terminal")
const open_file_1 = require("../../integrations/misc/open-file")
const image_handler_1 = require("../../integrations/misc/image-handler")
const process_images_1 = require("../../integrations/misc/process-images")
const getTheme_1 = require("../../integrations/theme/getTheme")
const file_search_1 = require("../../services/search/file-search")
const fs_1 = require("../../utils/fs")
const tts_1 = require("../../utils/tts")
const git_1 = require("../../utils/git")
const importExport_1 = require("../config/importExport")
const openai_1 = require("../../api/providers/openai")
const vscode_lm_1 = require("../../api/providers/vscode-lm")
const mentions_1 = require("../mentions")
const resolveImageMentions_1 = require("../mentions/resolveImageMentions")
const AliIgnoreController_1 = require("../ignore/AliIgnoreController")
const path_1 = require("../../utils/path")
const pathUtils_1 = require("../../utils/pathUtils")
const modes_1 = require("../../shared/modes")
const modelCache_1 = require("../../api/providers/fetchers/modelCache")
const generateSystemPrompt_1 = require("./generateSystemPrompt")
const export_1 = require("../../utils/export")
const commands_1 = require("../../utils/commands")
const ALLOWED_VSCODE_SETTINGS = new Set(["terminal.integrated.inheritEnv"])
const UpdateTodoListTool_1 = require("../tools/UpdateTodoListTool")
const worktree_1 = require("./worktree")
const webviewMessageHandler = async (provider, message) => {
	// Utility functions provided for concise get/update of global state via contextProxy API.
	const getGlobalState = (key) => provider.contextProxy.getValue(key)
	const updateGlobalState = async (key, value) => await provider.contextProxy.setValue(key, value)
	const getCurrentCwd = () => {
		return provider.getCurrentTask()?.cwd || provider.cwd
	}
	const getCurrentMode = async () => {
		const currentTask = provider.getCurrentTask()
		if (currentTask) {
			try {
				return await currentTask.getTaskMode()
			} catch (error) {
				provider.log(
					`Error resolving current task mode for command discovery: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
				)
			}
		}
		try {
			const state = await provider.getState()
			if (typeof state.mode === "string" && state.mode.length > 0) {
				return state.mode
			}
		} catch (error) {
			provider.log(
				`Error resolving global mode for command discovery: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
			)
		}
		return modes_1.defaultModeSlug
	}
	const getDiscoveredCommands = async () => {
		const { getCommands } = await import("../../services/command/commands")
		const commands = await getCommands(getCurrentCwd())
		const commandList = commands.map((command) => ({
			name: command.name,
			source: command.source,
			filePath: command.filePath,
			description: command.description,
			argumentHint: command.argumentHint,
		}))
		const existingCommandNames = new Set(commandList.map((command) => command.name))
		const skillsManager = provider.getSkillsManager()
		if (!skillsManager) {
			return commandList
		}
		const currentMode = await getCurrentMode()
		const availableSkills = skillsManager.getSkillsForMode(currentMode)
		for (const skill of availableSkills) {
			if (existingCommandNames.has(skill.name)) {
				continue
			}
			existingCommandNames.add(skill.name)
			commandList.push({
				name: skill.name,
				source: skill.source,
				filePath: skill.path,
				description: skill.description,
			})
		}
		return commandList
	}
	/**
	 * Resolves image file mentions in incoming messages.
	 * Matches read_file behavior: respects size limits and model capabilities.
	 */
	const resolveIncomingImages = async (payload) => {
		const text = payload.text ?? ""
		const images = payload.images
		const currentTask = provider.getCurrentTask()
		const state = await provider.getState()
		const resolved = await (0, resolveImageMentions_1.resolveImageMentions)({
			text,
			images,
			cwd: getCurrentCwd(),
			aliIgnoreController: currentTask?.aliIgnoreController,
			maxImageFileSize: state.maxImageFileSize,
			maxTotalImageSize: state.maxTotalImageSize,
		})
		return resolved
	}
	/**
	 * Shared utility to find message indices based on timestamp.
	 * When multiple messages share the same timestamp (e.g., after condense),
	 * this function prefers non-summary messages to ensure user operations
	 * target the intended message rather than the summary.
	 */
	const findMessageIndices = (messageTs, currentCline) => {
		// Find the exact message by timestamp, not the first one after a cutoff
		const messageIndex = currentCline.clineMessages.findIndex((msg) => msg.ts === messageTs)
		// Find all matching API messages by timestamp
		const allApiMatches = currentCline.apiConversationHistory
			.map((msg, idx) => ({ msg, idx }))
			.filter(({ msg }) => msg.ts === messageTs)
		// Prefer non-summary message if multiple matches exist (handles timestamp collision after condense)
		const preferred = allApiMatches.find(({ msg }) => !msg.isSummary) || allApiMatches[0]
		const apiConversationHistoryIndex = preferred?.idx ?? -1
		return { messageIndex, apiConversationHistoryIndex }
	}
	/**
	 * Fallback: find first API history index at or after a timestamp.
	 * Used when the exact user message isn't present in apiConversationHistory (e.g., after condense).
	 */
	const findFirstApiIndexAtOrAfter = (ts, currentCline) => {
		if (typeof ts !== "number") return -1
		return currentCline.apiConversationHistory.findIndex((msg) => typeof msg?.ts === "number" && msg.ts >= ts)
	}
	/**
	 * Handles message deletion operations with user confirmation
	 */
	const handleDeleteOperation = async (messageTs) => {
		// Check if there's a checkpoint before this message
		const currentCline = provider.getCurrentTask()
		let hasCheckpoint = false
		if (!currentCline) {
			await vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.message.no_active_task_to_delete"))
			return
		}
		const { messageIndex } = findMessageIndices(messageTs, currentCline)
		if (messageIndex !== -1) {
			// Find the last checkpoint before this message
			const checkpoints = currentCline.clineMessages.filter(
				(msg) => msg.say === "checkpoint_saved" && msg.ts > messageTs,
			)
			hasCheckpoint = checkpoints.length > 0
		}
		// Send message to webview to show delete confirmation dialog
		await provider.postMessageToWebview({
			type: "showDeleteMessageDialog",
			messageTs,
			hasCheckpoint,
		})
	}
	/**
	 * Handles confirmed message deletion from webview dialog
	 */
	const handleDeleteMessageConfirm = async (messageTs, restoreCheckpoint) => {
		const currentCline = provider.getCurrentTask()
		if (!currentCline) {
			console.error("[handleDeleteMessageConfirm] No current cline available")
			return
		}
		const { messageIndex, apiConversationHistoryIndex } = findMessageIndices(messageTs, currentCline)
		// Determine API truncation index with timestamp fallback if exact match not found
		let apiIndexToUse = apiConversationHistoryIndex
		const tsThreshold = currentCline.clineMessages[messageIndex]?.ts
		if (apiIndexToUse === -1 && typeof tsThreshold === "number") {
			apiIndexToUse = findFirstApiIndexAtOrAfter(tsThreshold, currentCline)
		}
		if (messageIndex === -1) {
			await vscode.window.showErrorMessage(
				(0, i18n_1.t)("common:errors.message.message_not_found", { messageTs }),
			)
			return
		}
		try {
			const targetMessage = currentCline.clineMessages[messageIndex]
			// If checkpoint restoration is requested, find and restore to the last checkpoint before this message
			if (restoreCheckpoint) {
				// Find the last checkpoint before this message
				const checkpoints = currentCline.clineMessages.filter(
					(msg) => msg.say === "checkpoint_saved" && msg.ts > messageTs,
				)
				const nextCheckpoint = checkpoints[0]
				if (nextCheckpoint && nextCheckpoint.text) {
					await (0, checkpointRestoreHandler_1.handleCheckpointRestoreOperation)({
						provider,
						currentCline,
						messageTs: targetMessage.ts,
						messageIndex,
						checkpoint: { hash: nextCheckpoint.text },
						operation: "delete",
					})
				} else {
					// No checkpoint found before this message
					console.log("[handleDeleteMessageConfirm] No checkpoint found before message")
					vscode.window.showWarningMessage("No checkpoint found before this message")
				}
			} else {
				// For non-checkpoint deletes, preserve checkpoint associations for remaining messages
				// Store checkpoints from messages that will be preserved
				const preservedCheckpoints = new Map()
				for (let i = 0; i < messageIndex; i++) {
					const msg = currentCline.clineMessages[i]
					if (msg?.checkpoint && msg.ts) {
						preservedCheckpoints.set(msg.ts, msg.checkpoint)
					}
				}
				// Delete this message and all subsequent messages using MessageManager
				await currentCline.messageManager.rewindToTimestamp(targetMessage.ts, { includeTargetMessage: false })
				// Restore checkpoint associations for preserved messages
				for (const [ts, checkpoint] of preservedCheckpoints) {
					const msgIndex = currentCline.clineMessages.findIndex((msg) => msg.ts === ts)
					if (msgIndex !== -1) {
						currentCline.clineMessages[msgIndex].checkpoint = checkpoint
					}
				}
				// Save the updated messages with restored checkpoints
				await (0, task_persistence_1.saveTaskMessages)({
					messages: currentCline.clineMessages,
					taskId: currentCline.taskId,
					globalStoragePath: provider.contextProxy.globalStorageUri.fsPath,
				})
				// Update the UI to reflect the deletion
				await provider.postStateToWebview()
			}
		} catch (error) {
			console.error("Error in delete message:", error)
			vscode.window.showErrorMessage(
				(0, i18n_1.t)("common:errors.message.error_deleting_message", {
					error: error instanceof Error ? error.message : String(error),
				}),
			)
		}
	}
	/**
	 * Handles message editing operations with user confirmation
	 */
	const handleEditOperation = async (messageTs, editedContent, images) => {
		// Check if there's a checkpoint before this message
		const currentCline = provider.getCurrentTask()
		let hasCheckpoint = false
		if (currentCline) {
			const { messageIndex } = findMessageIndices(messageTs, currentCline)
			if (messageIndex !== -1) {
				// Find the last checkpoint before this message
				const checkpoints = currentCline.clineMessages.filter(
					(msg) => msg.say === "checkpoint_saved" && msg.ts > messageTs,
				)
				hasCheckpoint = checkpoints.length > 0
			} else {
				console.log("[webviewMessageHandler] Edit - Message not found in clineMessages!")
			}
		} else {
			console.log("[webviewMessageHandler] Edit - No currentCline available!")
		}
		// Send message to webview to show edit confirmation dialog
		await provider.postMessageToWebview({
			type: "showEditMessageDialog",
			messageTs,
			text: editedContent,
			hasCheckpoint,
			images,
		})
	}
	/**
	 * Handles confirmed message editing from webview dialog
	 */
	const handleEditMessageConfirm = async (messageTs, editedContent, restoreCheckpoint, images) => {
		const currentCline = provider.getCurrentTask()
		if (!currentCline) {
			console.error("[handleEditMessageConfirm] No current cline available")
			return
		}
		// Use findMessageIndices to find messages based on timestamp
		const { messageIndex, apiConversationHistoryIndex } = findMessageIndices(messageTs, currentCline)
		if (messageIndex === -1) {
			const errorMessage = (0, i18n_1.t)("common:errors.message.message_not_found", { messageTs })
			console.error("[handleEditMessageConfirm]", errorMessage)
			await vscode.window.showErrorMessage(errorMessage)
			return
		}
		try {
			const targetMessage = currentCline.clineMessages[messageIndex]
			// If checkpoint restoration is requested, find and restore to the last checkpoint before this message
			if (restoreCheckpoint) {
				// Find the last checkpoint before this message
				const checkpoints = currentCline.clineMessages.filter(
					(msg) => msg.say === "checkpoint_saved" && msg.ts > messageTs,
				)
				const nextCheckpoint = checkpoints[0]
				if (nextCheckpoint && nextCheckpoint.text) {
					await (0, checkpointRestoreHandler_1.handleCheckpointRestoreOperation)({
						provider,
						currentCline,
						messageTs: targetMessage.ts,
						messageIndex,
						checkpoint: { hash: nextCheckpoint.text },
						operation: "edit",
						editData: {
							editedContent,
							images,
							apiConversationHistoryIndex,
						},
					})
					// The task will be cancelled and reinitialized by checkpointRestore
					// The pending edit will be processed in the reinitialized task
					return
				} else {
					// No checkpoint found before this message
					console.log("[handleEditMessageConfirm] No checkpoint found before message")
					vscode.window.showWarningMessage("No checkpoint found before this message")
					// Continue with non-checkpoint edit
				}
			}
			// For non-checkpoint edits, remove the ORIGINAL user message being edited and all subsequent messages
			// Determine the correct starting index to delete from (prefer the last preceding user_feedback message)
			let deleteFromMessageIndex = messageIndex
			let deleteFromApiIndex = apiConversationHistoryIndex
			// Find the nearest preceding user message to ensure we replace the original, not just the assistant reply
			for (let i = messageIndex; i >= 0; i--) {
				const m = currentCline.clineMessages[i]
				if (m?.say === "user_feedback") {
					deleteFromMessageIndex = i
					// Align API history truncation to the same user message timestamp if present
					const userTs = m.ts
					if (typeof userTs === "number") {
						const apiIdx = currentCline.apiConversationHistory.findIndex((am) => am.ts === userTs)
						if (apiIdx !== -1) {
							deleteFromApiIndex = apiIdx
						}
					}
					break
				}
			}
			// Timestamp fallback for API history when exact user message isn't present
			if (deleteFromApiIndex === -1) {
				const tsThresholdForEdit = currentCline.clineMessages[deleteFromMessageIndex]?.ts
				if (typeof tsThresholdForEdit === "number") {
					deleteFromApiIndex = findFirstApiIndexAtOrAfter(tsThresholdForEdit, currentCline)
				}
			}
			// Store checkpoints from messages that will be preserved
			const preservedCheckpoints = new Map()
			for (let i = 0; i < deleteFromMessageIndex; i++) {
				const msg = currentCline.clineMessages[i]
				if (msg?.checkpoint && msg.ts) {
					preservedCheckpoints.set(msg.ts, msg.checkpoint)
				}
			}
			// Delete the original (user) message and all subsequent messages using MessageManager
			const rewindTs = currentCline.clineMessages[deleteFromMessageIndex]?.ts
			if (rewindTs) {
				await currentCline.messageManager.rewindToTimestamp(rewindTs, { includeTargetMessage: false })
			}
			// Restore checkpoint associations for preserved messages
			for (const [ts, checkpoint] of preservedCheckpoints) {
				const msgIndex = currentCline.clineMessages.findIndex((msg) => msg.ts === ts)
				if (msgIndex !== -1) {
					currentCline.clineMessages[msgIndex].checkpoint = checkpoint
				}
			}
			// Save the updated messages with restored checkpoints
			await (0, task_persistence_1.saveTaskMessages)({
				messages: currentCline.clineMessages,
				taskId: currentCline.taskId,
				globalStoragePath: provider.contextProxy.globalStorageUri.fsPath,
			})
			// Update the UI to reflect the deletion
			await provider.postStateToWebview()
			await currentCline.submitUserMessage(editedContent, images)
		} catch (error) {
			console.error("Error in edit message:", error)
			vscode.window.showErrorMessage(
				(0, i18n_1.t)("common:errors.message.error_editing_message", {
					error: error instanceof Error ? error.message : String(error),
				}),
			)
		}
	}
	/**
	 * Handles message modification operations (delete or edit) with confirmation dialog
	 * @param messageTs Timestamp of the message to operate on
	 * @param operation Type of operation ('delete' or 'edit')
	 * @param editedContent New content for edit operations
	 * @returns Promise<void>
	 */
	const handleMessageModificationsOperation = async (messageTs, operation, editedContent, images) => {
		if (operation === "delete") {
			await handleDeleteOperation(messageTs)
		} else if (operation === "edit" && editedContent) {
			await handleEditOperation(messageTs, editedContent, images)
		}
	}
	switch (message.type) {
		case "webviewDidLaunch":
			// Load custom modes first
			const customModes = await provider.customModesManager.getCustomModes()
			await updateGlobalState("customModes", customModes)
			provider.postStateToWebview()
			provider.workspaceTracker?.initializeFilePaths() // Don't await.
			;(0, getTheme_1.getTheme)().then((theme) =>
				provider.postMessageToWebview({ type: "theme", text: JSON.stringify(theme) }),
			)
			// If MCP Hub is already initialized, update the webview with
			// current server list.
			const mcpHub = provider.getMcpHub()
			if (mcpHub) {
				provider.postMessageToWebview({ type: "mcpServers", mcpServers: mcpHub.getAllServers() })
			}
			provider.providerSettingsManager
				.listConfig()
				.then(async (listApiConfig) => {
					if (!listApiConfig) {
						return
					}
					if (listApiConfig.length === 1) {
						// Check if first time init then sync with exist config.
						if (!(0, checkExistApiConfig_1.checkExistKey)(listApiConfig[0])) {
							const { apiConfiguration } = await provider.getState()
							// Only save if the current configuration has meaningful settings
							// (e.g., API keys). This prevents saving a default "anthropic"
							// fallback when no real config exists, which can happen during
							// CLI initialization before provider settings are applied.
							if ((0, checkExistApiConfig_1.checkExistKey)(apiConfiguration)) {
								await provider.providerSettingsManager.saveConfig(
									listApiConfig[0].name ?? "default",
									apiConfiguration,
								)
								listApiConfig[0].apiProvider = apiConfiguration.apiProvider
							}
						}
					}
					const currentConfigName = getGlobalState("currentApiConfigName")
					if (currentConfigName) {
						if (!(await provider.providerSettingsManager.hasConfig(currentConfigName))) {
							// Current config name not valid, get first config in list.
							const name = listApiConfig[0]?.name
							await updateGlobalState("currentApiConfigName", name)
							if (name) {
								await provider.activateProviderProfile({ name })
								return
							}
						}
					}
					await Promise.all([
						await updateGlobalState("listApiConfigMeta", listApiConfig),
						await provider.postMessageToWebview({ type: "listApiConfig", listApiConfig }),
					])
				})
				.catch((error) =>
					provider.log(
						`Error list api configuration: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
					),
				)
			provider.isViewLaunched = true
			break
		case "newTask":
			// Initializing new instance of Cline will make sure that any
			// agentically running promises in old instance don't affect our new
			// task. This essentially creates a fresh slate for the new task.
			try {
				const resolved = await resolveIncomingImages({ text: message.text, images: message.images })
				await provider.createTask(
					resolved.text,
					resolved.images,
					undefined,
					{ taskId: message.taskId },
					message.taskConfiguration,
				)
				// Task created successfully - notify the UI to reset
				await provider.postMessageToWebview({ type: "invoke", invoke: "newChat" })
			} catch (error) {
				// For all errors, reset the UI and show error
				await provider.postMessageToWebview({ type: "invoke", invoke: "newChat" })
				// Show error to user
				vscode.window.showErrorMessage(
					`Failed to create task: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
			break
		case "customInstructions":
			await provider.updateCustomInstructions(message.text)
			break
		case "askResponse":
			{
				const resolved = await resolveIncomingImages({ text: message.text, images: message.images })
				provider.getCurrentTask()?.handleWebviewAskResponse(message.askResponse, resolved.text, resolved.images)
			}
			break
		case "updateSettings":
			if (message.updatedSettings) {
				for (const [key, value] of Object.entries(message.updatedSettings)) {
					let newValue = value
					if (key === "language") {
						newValue = value ?? "en"
						;(0, i18n_1.changeLanguage)(newValue)
					} else if (key === "allowedCommands") {
						const commands = value ?? []
						newValue = Array.isArray(commands)
							? commands.filter((cmd) => typeof cmd === "string" && cmd.trim().length > 0)
							: []
						await vscode.workspace
							.getConfiguration(package_1.Package.name)
							.update("allowedCommands", newValue, vscode.ConfigurationTarget.Global)
					} else if (key === "deniedCommands") {
						const commands = value ?? []
						newValue = Array.isArray(commands)
							? commands.filter((cmd) => typeof cmd === "string" && cmd.trim().length > 0)
							: []
						await vscode.workspace
							.getConfiguration(package_1.Package.name)
							.update("deniedCommands", newValue, vscode.ConfigurationTarget.Global)
					} else if (key === "ttsEnabled") {
						newValue = value ?? true
						;(0, tts_1.setTtsEnabled)(newValue)
					} else if (key === "ttsSpeed") {
						newValue = value ?? 1.0
						;(0, tts_1.setTtsSpeed)(newValue)
					} else if (key === "terminalShellIntegrationTimeout") {
						if (value !== undefined) {
							Terminal_1.Terminal.setShellIntegrationTimeout(value)
						}
					} else if (key === "terminalShellIntegrationDisabled") {
						if (value !== undefined) {
							Terminal_1.Terminal.setShellIntegrationDisabled(value)
						}
					} else if (key === "terminalCommandDelay") {
						if (value !== undefined) {
							Terminal_1.Terminal.setCommandDelay(value)
						}
					} else if (key === "terminalPowershellCounter") {
						if (value !== undefined) {
							Terminal_1.Terminal.setPowershellCounter(value)
						}
					} else if (key === "terminalZshClearEolMark") {
						if (value !== undefined) {
							Terminal_1.Terminal.setTerminalZshClearEolMark(value)
						}
					} else if (key === "terminalZshOhMy") {
						if (value !== undefined) {
							Terminal_1.Terminal.setTerminalZshOhMy(value)
						}
					} else if (key === "terminalZshP10k") {
						if (value !== undefined) {
							Terminal_1.Terminal.setTerminalZshP10k(value)
						}
					} else if (key === "terminalZdotdir") {
						if (value !== undefined) {
							Terminal_1.Terminal.setTerminalZdotdir(value)
						}
					} else if (key === "execaShellPath") {
						Terminal_1.Terminal.setExecaShellPath(value)
					} else if (key === "mcpEnabled") {
						newValue = value ?? true
						const mcpHub = provider.getMcpHub()
						if (mcpHub) {
							await mcpHub.handleMcpEnabledChange(newValue)
						}
					} else if (key === "experiments") {
						if (!value) {
							continue
						}
						newValue = {
							...(getGlobalState("experiments") ?? experiments_1.experimentDefault),
							...value,
						}
					} else if (key === "customSupportPrompts") {
						if (!value) {
							continue
						}
					}
					await provider.contextProxy.setValue(key, newValue)
				}
				await provider.postStateToWebview()
			}
			break
		case "terminalOperation":
			if (message.terminalOperation) {
				provider.getCurrentTask()?.handleTerminalOperation(message.terminalOperation)
			}
			break
		case "clearTask":
			// Clear task resets the current session. Delegation flows are
			// handled via metadata; parent resumption occurs through
			// reopenParentFromDelegation, not via finishSubTask.
			await provider.clearTask()
			await provider.postStateToWebview()
			break
		case "didShowAnnouncement":
			await updateGlobalState("lastShownAnnouncementId", provider.latestAnnouncementId)
			await provider.postStateToWebview()
			break
		case "selectImages":
			const images = await (0, process_images_1.selectImages)()
			await provider.postMessageToWebview({
				type: "selectedImages",
				images,
				context: message.context,
				messageTs: message.messageTs,
			})
			break
		case "exportCurrentTask":
			const currentTaskId = provider.getCurrentTask()?.taskId
			if (currentTaskId) {
				provider.exportTaskWithId(currentTaskId)
			}
			break
		case "showTaskWithId":
			provider.showTaskWithId(message.text)
			break
		case "renameTask":
			if (message.taskId && message.text !== undefined) {
				await provider.renameTaskWithId(message.taskId, message.text)
			}
			break
		case "condenseTaskContextRequest":
			provider.condenseTaskContext(message.text)
			break
		case "deleteTaskWithId":
			provider.deleteTaskWithId(message.text)
			break
		case "deleteMultipleTasksWithIds": {
			const ids = message.ids
			if (Array.isArray(ids)) {
				// Process in batches of 20 (or another reasonable number)
				const batchSize = 20
				const results = []
				// Only log start and end of the operation
				console.log(`Batch deletion started: ${ids.length} tasks total`)
				for (let i = 0; i < ids.length; i += batchSize) {
					const batch = ids.slice(i, i + batchSize)
					const batchPromises = batch.map(async (id) => {
						try {
							await provider.deleteTaskWithId(id)
							return { id, success: true }
						} catch (error) {
							// Keep error logging for debugging purposes
							console.log(
								`Failed to delete task ${id}: ${error instanceof Error ? error.message : String(error)}`,
							)
							return { id, success: false }
						}
					})
					// Process each batch in parallel but wait for completion before starting the next batch
					const batchResults = await Promise.all(batchPromises)
					results.push(...batchResults)
					// Update the UI after each batch to show progress
					await provider.postStateToWebview()
				}
				// Log final results
				const successCount = results.filter((r) => r.success).length
				const failCount = results.length - successCount
				console.log(
					`Batch deletion completed: ${successCount}/${ids.length} tasks successful, ${failCount} tasks failed`,
				)
			}
			break
		}
		case "exportTaskWithId":
			provider.exportTaskWithId(message.text)
			break
		case "getTaskWithAggregatedCosts": {
			try {
				const taskId = message.text
				if (!taskId) {
					throw new Error("Task ID is required")
				}
				const result = await provider.getTaskWithAggregatedCosts(taskId)
				await provider.postMessageToWebview({
					type: "taskWithAggregatedCosts",
					// IMPORTANT: ChatView stores aggregatedCostsMap keyed by message.text (taskId)
					// so we must include it here.
					text: taskId,
					historyItem: result.historyItem,
					aggregatedCosts: result.aggregatedCosts,
				})
			} catch (error) {
				console.error("Error getting task with aggregated costs:", error)
				await provider.postMessageToWebview({
					type: "taskWithAggregatedCosts",
					// Include taskId when available for correlation in UI logs.
					text: message.text,
					error: error instanceof Error ? error.message : String(error),
				})
			}
			break
		}
		case "importSettings": {
			await (0, importExport_1.importSettingsWithFeedback)({
				providerSettingsManager: provider.providerSettingsManager,
				contextProxy: provider.contextProxy,
				customModesManager: provider.customModesManager,
				provider: provider,
			})
			break
		}
		case "exportSettings":
			await (0, importExport_1.exportSettings)({
				providerSettingsManager: provider.providerSettingsManager,
				contextProxy: provider.contextProxy,
			})
			break
		case "resetState":
			await provider.resetState()
			break
		case "flushRouterModels":
			const routerNameFlush = (0, api_1.toRouterName)(message.text)
			// Note: flushRouterModels is a generic flush without credentials
			// For providers that need credentials, use their specific handlers
			await (0, modelCache_1.flushModels)({ provider: routerNameFlush }, true)
			break
		case "requestRouterModels":
			const { apiConfiguration } = await provider.getState()
			// Optional single provider filter from webview
			const requestedProvider = message?.values?.provider
			const providerFilter = requestedProvider ? (0, api_1.toRouterName)(requestedProvider) : undefined
			// Optional refresh flag to flush cache before fetching (useful for providers requiring credentials)
			const shouldRefresh = message?.values?.refresh === true
			const routerModels = providerFilter
				? {}
				: {
						openrouter: {},
						"vercel-ai-gateway": {},
						litellm: {},
						requesty: {},
						unbound: {},
						ollama: {},
						lmstudio: {},
						poe: {},
					}
			const safeGetModels = async (options) => {
				try {
					return await (0, modelCache_1.getModels)(options)
				} catch (error) {
					console.error(
						`Failed to fetch models in webviewMessageHandler requestRouterModels for ${options.provider}:`,
						error,
					)
					throw error // Re-throw to be caught by Promise.allSettled.
				}
			}
			// Base candidates (only those handled by this aggregate fetcher)
			const candidates = [
				{ key: "openrouter", options: { provider: "openrouter" } },
				{
					key: "requesty",
					options: {
						provider: "requesty",
						apiKey: apiConfiguration.requestyApiKey,
						baseUrl: apiConfiguration.requestyBaseUrl,
					},
				},
				{
					key: "unbound",
					options: {
						provider: "unbound",
						apiKey: apiConfiguration.unboundApiKey,
					},
				},
				{ key: "vercel-ai-gateway", options: { provider: "vercel-ai-gateway" } },
			]
			// LiteLLM is conditional on baseUrl+apiKey
			const litellmApiKey = apiConfiguration.litellmApiKey || message?.values?.litellmApiKey
			const litellmBaseUrl = apiConfiguration.litellmBaseUrl || message?.values?.litellmBaseUrl
			if (litellmApiKey && litellmBaseUrl) {
				// If explicit credentials are provided in message.values (from Refresh Models button),
				// flush the cache first to ensure we fetch fresh data with the new credentials
				if (message?.values?.litellmApiKey || message?.values?.litellmBaseUrl) {
					await (0, modelCache_1.flushModels)(
						{ provider: "litellm", apiKey: litellmApiKey, baseUrl: litellmBaseUrl },
						true,
					)
				}
				candidates.push({
					key: "litellm",
					options: { provider: "litellm", apiKey: litellmApiKey, baseUrl: litellmBaseUrl },
				})
			}
			// Poe is conditional on apiKey
			const poeApiKey = apiConfiguration.poeApiKey || message?.values?.poeApiKey
			const poeBaseUrl = apiConfiguration.poeBaseUrl || message?.values?.poeBaseUrl
			if (poeApiKey) {
				if (message?.values?.poeApiKey || message?.values?.poeBaseUrl) {
					await (0, modelCache_1.flushModels)(
						{ provider: "poe", apiKey: poeApiKey, baseUrl: poeBaseUrl },
						true,
					)
				}
				candidates.push({
					key: "poe",
					options: { provider: "poe", apiKey: poeApiKey, baseUrl: poeBaseUrl },
				})
			}
			// Apply single provider filter if specified
			const modelFetchPromises = providerFilter
				? candidates.filter(({ key }) => key === providerFilter)
				: candidates
			// If refresh flag is set and we have a specific provider, flush its cache first
			if (shouldRefresh && providerFilter && modelFetchPromises.length > 0) {
				const targetCandidate = modelFetchPromises[0]
				await (0, modelCache_1.flushModels)(targetCandidate.options, true)
			}
			const results = await Promise.allSettled(
				modelFetchPromises.map(async ({ key, options }) => {
					const models = await safeGetModels(options)
					return { key, models } // The key is `ProviderName` here.
				}),
			)
			results.forEach((result, index) => {
				const routerName = modelFetchPromises[index].key
				if (result.status === "fulfilled") {
					routerModels[routerName] = result.value.models
					// Ollama and LM Studio settings pages still need these events. They are not fetched here.
				} else {
					// Handle rejection: Post a specific error message for this provider.
					const errorMessage = result.reason instanceof Error ? result.reason.message : String(result.reason)
					console.error(`Error fetching models for ${routerName}:`, result.reason)
					routerModels[routerName] = {} // Ensure it's an empty object in the main routerModels message.
					provider.postMessageToWebview({
						type: "singleRouterModelFetchResponse",
						success: false,
						error: errorMessage,
						values: { provider: routerName },
					})
				}
			})
			provider.postMessageToWebview({
				type: "routerModels",
				routerModels,
				values: providerFilter ? { provider: requestedProvider } : undefined,
			})
			break
		case "requestOllamaModels": {
			// Specific handler for Ollama models only.
			const { apiConfiguration: ollamaApiConfig } = await provider.getState()
			try {
				const ollamaOptions = {
					provider: "ollama",
					baseUrl: ollamaApiConfig.ollamaBaseUrl,
					apiKey: ollamaApiConfig.ollamaApiKey,
				}
				// Flush cache and refresh to ensure fresh models.
				await (0, modelCache_1.flushModels)(ollamaOptions, true)
				const ollamaModels = await (0, modelCache_1.getModels)(ollamaOptions)
				if (Object.keys(ollamaModels).length > 0) {
					provider.postMessageToWebview({ type: "ollamaModels", ollamaModels: ollamaModels })
				}
			} catch (error) {
				// Silently fail - user hasn't configured Ollama yet
				console.debug("Ollama models fetch failed:", error)
			}
			break
		}
		case "requestLmStudioModels": {
			// Specific handler for LM Studio models only.
			const { apiConfiguration: lmStudioApiConfig } = await provider.getState()
			try {
				const lmStudioOptions = {
					provider: "lmstudio",
					baseUrl: lmStudioApiConfig.lmStudioBaseUrl,
				}
				// Flush cache and refresh to ensure fresh models.
				await (0, modelCache_1.flushModels)(lmStudioOptions, true)
				const lmStudioModels = await (0, modelCache_1.getModels)(lmStudioOptions)
				if (Object.keys(lmStudioModels).length > 0) {
					provider.postMessageToWebview({
						type: "lmStudioModels",
						lmStudioModels: lmStudioModels,
					})
				}
			} catch (error) {
				// Silently fail - user hasn't configured LM Studio yet.
				console.debug("LM Studio models fetch failed:", error)
			}
			break
		}
		case "requestOpenAiModels":
			if (message?.values?.baseUrl && message?.values?.apiKey) {
				const openAiModels = await (0, openai_1.getOpenAiModels)(
					message?.values?.baseUrl,
					message?.values?.apiKey,
					message?.values?.openAiHeaders,
				)
				provider.postMessageToWebview({ type: "openAiModels", openAiModels })
			}
			break
		case "requestVsCodeLmModels":
			const vsCodeLmModels = await (0, vscode_lm_1.getVsCodeLmModels)()
			// TODO: Cache like we do for OpenRouter, etc?
			provider.postMessageToWebview({ type: "vsCodeLmModels", vsCodeLmModels })
			break
		case "openImage":
			;(0, image_handler_1.openImage)(message.text, { values: message.values })
			break
		case "saveImage":
			if (message.dataUri) {
				const matches = message.dataUri.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
				if (!matches) {
					// Let saveImage handle invalid URI error
					;(0, image_handler_1.saveImage)(message.dataUri, vscode.Uri.file(""))
					break
				}
				const format = matches[1]
				const defaultFileName = `img_${Date.now()}.${format}`
				const defaultUri = await (0, export_1.resolveDefaultSaveUri)(
					provider.contextProxy,
					"lastImageSavePath",
					defaultFileName,
					{
						useWorkspace: false,
						fallbackDir: path.join(os.homedir(), "Downloads"),
					},
				)
				const savedUri = await (0, image_handler_1.saveImage)(message.dataUri, defaultUri)
				if (savedUri) {
					await (0, export_1.saveLastExportPath)(provider.contextProxy, "lastImageSavePath", savedUri)
				}
			}
			break
		case "openFile":
			let filePath = message.text
			if (!path.isAbsolute(filePath)) {
				filePath = path.join(getCurrentCwd(), filePath)
			}
			;(0, open_file_1.openFile)(filePath, message.values)
			break
		case "readFileContent": {
			const relPath = message.text || ""
			if (!relPath) {
				provider.postMessageToWebview({
					type: "fileContent",
					fileContent: { path: relPath, content: null, error: "No path provided" },
				})
				break
			}
			try {
				const cwd = getCurrentCwd()
				if (!cwd) {
					provider.postMessageToWebview({
						type: "fileContent",
						fileContent: { path: relPath, content: null, error: "No workspace path available" },
					})
					break
				}
				const absPath = path.resolve(cwd, relPath)
				// Workspace-boundary validation: prevent path traversal attacks
				if ((0, pathUtils_1.isPathOutsideWorkspace)(absPath)) {
					provider.postMessageToWebview({
						type: "fileContent",
						fileContent: { path: relPath, content: null, error: "Path is outside workspace" },
					})
					break
				}
				const content = await fs.readFile(absPath, "utf-8")
				provider.postMessageToWebview({ type: "fileContent", fileContent: { path: relPath, content } })
			} catch (err) {
				const errorMsg = err instanceof Error ? err.message : String(err)
				provider.postMessageToWebview({
					type: "fileContent",
					fileContent: { path: relPath, content: null, error: errorMsg },
				})
			}
			break
		}
		case "openMention":
			;(0, mentions_1.openMention)(getCurrentCwd(), message.text)
			break
		case "openExternal":
			if (message.url) {
				vscode.env.openExternal(vscode.Uri.parse(message.url))
			}
			break
		case "checkpointDiff":
			const result = types_1.checkoutDiffPayloadSchema.safeParse(message.payload)
			if (result.success) {
				await provider.getCurrentTask()?.checkpointDiff(result.data)
			}
			break
		case "checkpointRestore": {
			const result = types_1.checkoutRestorePayloadSchema.safeParse(message.payload)
			if (result.success) {
				await provider.cancelTask()
				try {
					await (0, p_wait_for_1.default)(() => provider.getCurrentTask()?.isInitialized === true, {
						timeout: 3_000,
					})
				} catch (error) {
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.checkpoint_timeout"))
				}
				try {
					await provider.getCurrentTask()?.checkpointRestore(result.data)
				} catch (error) {
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.checkpoint_failed"))
				}
			}
			break
		}
		case "cancelTask":
			await provider.cancelTask()
			break
		case "cancelAutoApproval":
			// Cancel any pending auto-approval timeout for the current task
			provider.getCurrentTask()?.cancelAutoApprovalTimeout()
			break
		case "allowedCommands": {
			// Validate and sanitize the commands array
			const commands = message.commands ?? []
			const validCommands = Array.isArray(commands)
				? commands.filter((cmd) => typeof cmd === "string" && cmd.trim().length > 0)
				: []
			await updateGlobalState("allowedCommands", validCommands)
			// Also update workspace settings.
			await vscode.workspace
				.getConfiguration(package_1.Package.name)
				.update("allowedCommands", validCommands, vscode.ConfigurationTarget.Global)
			break
		}
		case "deniedCommands": {
			// Validate and sanitize the commands array
			const commands = message.commands ?? []
			const validCommands = Array.isArray(commands)
				? commands.filter((cmd) => typeof cmd === "string" && cmd.trim().length > 0)
				: []
			await updateGlobalState("deniedCommands", validCommands)
			// Also update workspace settings.
			await vscode.workspace
				.getConfiguration(package_1.Package.name)
				.update("deniedCommands", validCommands, vscode.ConfigurationTarget.Global)
			break
		}
		case "openCustomModesSettings": {
			const customModesFilePath = await provider.customModesManager.getCustomModesFilePath()
			if (customModesFilePath) {
				;(0, open_file_1.openFile)(customModesFilePath)
			}
			break
		}
		case "openKeyboardShortcuts": {
			// Open VSCode keyboard shortcuts settings and optionally filter to show the AliCode commands
			const searchQuery = message.text || ""
			if (searchQuery) {
				// Open with a search query pre-filled
				await vscode.commands.executeCommand("workbench.action.openGlobalKeybindings", searchQuery)
			} else {
				// Just open the keyboard shortcuts settings
				await vscode.commands.executeCommand("workbench.action.openGlobalKeybindings")
			}
			break
		}
		case "openMcpSettings": {
			const mcpSettingsFilePath = await provider.getMcpHub()?.getMcpSettingsFilePath()
			if (mcpSettingsFilePath) {
				;(0, open_file_1.openFile)(mcpSettingsFilePath)
			}
			break
		}
		case "openProjectMcpSettings": {
			if (!vscode.workspace.workspaceFolders?.length) {
				vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.no_workspace"))
				return
			}
			const workspaceFolder = getCurrentCwd()
			const aliDir = path.join(workspaceFolder, ".ali")
			const mcpPath = path.join(aliDir, "mcp.json")
			try {
				await fs.mkdir(aliDir, { recursive: true })
				const exists = await (0, fs_1.fileExistsAtPath)(mcpPath)
				if (!exists) {
					await (0, safeWriteJson_1.safeWriteJson)(mcpPath, { mcpServers: {} }, { prettyPrint: true })
				}
				await (0, open_file_1.openFile)(mcpPath)
			} catch (error) {
				vscode.window.showErrorMessage((0, i18n_1.t)("mcp:errors.create_json", { error: `${error}` }))
			}
			break
		}
		case "deleteMcpServer": {
			if (!message.serverName) {
				break
			}
			try {
				provider.log(`Attempting to delete MCP server: ${message.serverName}`)
				await provider.getMcpHub()?.deleteServer(message.serverName, message.source)
				provider.log(`Successfully deleted MCP server: ${message.serverName}`)
				// Refresh the webview state
				await provider.postStateToWebview()
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				provider.log(`Failed to delete MCP server: ${errorMessage}`)
				// Error messages are already handled by McpHub.deleteServer
			}
			break
		}
		case "restartMcpServer": {
			try {
				await provider.getMcpHub()?.restartConnection(message.text, message.source)
			} catch (error) {
				provider.log(
					`Failed to retry connection for ${message.text}: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
				)
			}
			break
		}
		case "toggleToolAlwaysAllow": {
			try {
				await provider
					.getMcpHub()
					?.toggleToolAlwaysAllow(
						message.serverName,
						message.source,
						message.toolName,
						Boolean(message.alwaysAllow),
					)
			} catch (error) {
				provider.log(
					`Failed to toggle auto-approve for tool ${message.toolName}: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
				)
			}
			break
		}
		case "toggleToolEnabledForPrompt": {
			try {
				await provider
					.getMcpHub()
					?.toggleToolEnabledForPrompt(
						message.serverName,
						message.source,
						message.toolName,
						Boolean(message.isEnabled),
					)
			} catch (error) {
				provider.log(
					`Failed to toggle enabled for prompt for tool ${message.toolName}: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
				)
			}
			break
		}
		case "toggleMcpServer": {
			try {
				await provider.getMcpHub()?.toggleServerDisabled(message.serverName, message.disabled, message.source)
			} catch (error) {
				provider.log(
					`Failed to toggle MCP server ${message.serverName}: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
				)
			}
			break
		}
		case "refreshAllMcpServers": {
			const mcpHub = provider.getMcpHub()
			if (mcpHub) {
				await mcpHub.refreshAllConnections()
			}
			break
		}
		case "ttsEnabled":
			const ttsEnabled = message.bool ?? true
			await updateGlobalState("ttsEnabled", ttsEnabled)
			;(0, tts_1.setTtsEnabled)(ttsEnabled)
			await provider.postStateToWebview()
			break
		case "ttsSpeed":
			const ttsSpeed = message.value ?? 1.0
			await updateGlobalState("ttsSpeed", ttsSpeed)
			;(0, tts_1.setTtsSpeed)(ttsSpeed)
			await provider.postStateToWebview()
			break
		case "playTts":
			if (message.text) {
				;(0, tts_1.playTts)(message.text, {
					onStart: () => provider.postMessageToWebview({ type: "ttsStart", text: message.text }),
					onStop: () => provider.postMessageToWebview({ type: "ttsStop", text: message.text }),
				})
			}
			break
		case "stopTts":
			;(0, tts_1.stopTts)()
			break
		case "updateVSCodeSetting": {
			const { setting, value } = message
			if (setting !== undefined && value !== undefined) {
				if (ALLOWED_VSCODE_SETTINGS.has(setting)) {
					await vscode.workspace.getConfiguration().update(setting, value, true)
				} else {
					vscode.window.showErrorMessage(`Cannot update restricted VSCode setting: ${setting}`)
				}
			}
			break
		}
		case "getVSCodeSetting":
			const { setting } = message
			if (setting) {
				try {
					await provider.postMessageToWebview({
						type: "vsCodeSetting",
						setting,
						value: vscode.workspace.getConfiguration().get(setting),
					})
				} catch (error) {
					console.error(`Failed to get VSCode setting ${message.setting}:`, error)
					await provider.postMessageToWebview({
						type: "vsCodeSetting",
						setting,
						error: `Failed to get setting: ${error.message}`,
						value: undefined,
					})
				}
			}
			break
		case "mode":
			await provider.handleModeSwitch(message.text)
			break
		case "updatePrompt":
			if (message.promptMode && message.customPrompt !== undefined) {
				const existingPrompts = getGlobalState("customModePrompts") ?? {}
				const updatedPrompts = { ...existingPrompts, [message.promptMode]: message.customPrompt }
				await updateGlobalState("customModePrompts", updatedPrompts)
				const currentState = await provider.getStateToPostToWebview()
				const stateWithPrompts = {
					...currentState,
					customModePrompts: updatedPrompts,
					hasOpenedModeSelector: currentState.hasOpenedModeSelector ?? false,
				}
				provider.postMessageToWebview({ type: "state", state: stateWithPrompts })
			}
			break
		case "deleteMessage": {
			if (!provider.getCurrentTask()) {
				await vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.message.no_active_task_to_delete"))
				break
			}
			if (typeof message.value !== "number" || !message.value) {
				await vscode.window.showErrorMessage(
					(0, i18n_1.t)("common:errors.message.invalid_timestamp_for_deletion"),
				)
				break
			}
			await handleMessageModificationsOperation(message.value, "delete")
			break
		}
		case "submitEditedMessage": {
			if (
				provider.getCurrentTask() &&
				typeof message.value === "number" &&
				message.value &&
				message.editedMessageContent
			) {
				await handleMessageModificationsOperation(
					message.value,
					"edit",
					message.editedMessageContent,
					message.images,
				)
			}
			break
		}
		case "hasOpenedModeSelector":
			await updateGlobalState("hasOpenedModeSelector", message.bool ?? true)
			await provider.postStateToWebview()
			break
		case "lockApiConfigAcrossModes": {
			const enabled = message.bool ?? false
			await provider.context.workspaceState.update("lockApiConfigAcrossModes", enabled)
			await provider.postStateToWebview()
			break
		}
		case "toggleApiConfigPin":
			if (message.text) {
				const currentPinned = getGlobalState("pinnedApiConfigs") ?? {}
				const updatedPinned = { ...currentPinned }
				if (currentPinned[message.text]) {
					delete updatedPinned[message.text]
				} else {
					updatedPinned[message.text] = true
				}
				await updateGlobalState("pinnedApiConfigs", updatedPinned)
				await provider.postStateToWebview()
			}
			break
		case "enhancementApiConfigId":
			await updateGlobalState("enhancementApiConfigId", message.text)
			await provider.postStateToWebview()
			break
		case "autoApprovalEnabled":
			await updateGlobalState("autoApprovalEnabled", message.bool ?? false)
			await provider.postStateToWebview()
			break
		case "enhancePrompt":
			if (message.text) {
				try {
					const state = await provider.getState()
					const {
						apiConfiguration,
						customSupportPrompts,
						listApiConfigMeta = [],
						enhancementApiConfigId,
						includeTaskHistoryInEnhance,
					} = state
					const currentCline = provider.getCurrentTask()
					const result = await messageEnhancer_1.MessageEnhancer.enhanceMessage({
						text: message.text,
						apiConfiguration,
						customSupportPrompts,
						listApiConfigMeta,
						enhancementApiConfigId,
						includeTaskHistoryInEnhance,
						currentClineMessages: currentCline?.clineMessages,
						providerSettingsManager: provider.providerSettingsManager,
					})
					if (result.success && result.enhancedText) {
						await provider.postMessageToWebview({ type: "enhancedPrompt", text: result.enhancedText })
					} else {
						throw new Error(result.error || "Unknown error")
					}
				} catch (error) {
					provider.log(
						`Error enhancing prompt: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
					)
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.enhance_prompt"))
					await provider.postMessageToWebview({ type: "enhancedPrompt" })
				}
			}
			break
		case "getSystemPrompt":
			try {
				const systemPrompt = await (0, generateSystemPrompt_1.generateSystemPrompt)(provider, message)
				await provider.postMessageToWebview({
					type: "systemPrompt",
					text: systemPrompt,
					mode: message.mode,
				})
			} catch (error) {
				provider.log(
					`Error getting system prompt:  ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
				)
				vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.get_system_prompt"))
			}
			break
		case "copySystemPrompt":
			try {
				const systemPrompt = await (0, generateSystemPrompt_1.generateSystemPrompt)(provider, message)
				await vscode.env.clipboard.writeText(systemPrompt)
				await vscode.window.showInformationMessage((0, i18n_1.t)("common:info.clipboard_copy"))
			} catch (error) {
				provider.log(
					`Error getting system prompt:  ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
				)
				vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.get_system_prompt"))
			}
			break
		case "searchCommits": {
			const cwd = getCurrentCwd()
			if (cwd) {
				try {
					const commits = await (0, git_1.searchCommits)(message.query || "", cwd)
					await provider.postMessageToWebview({
						type: "commitSearchResults",
						commits,
					})
				} catch (error) {
					provider.log(
						`Error searching commits: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
					)
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.search_commits"))
				}
			}
			break
		}
		case "searchFiles": {
			const workspacePath = getCurrentCwd()
			if (!workspacePath) {
				// Handle case where workspace path is not available
				await provider.postMessageToWebview({
					type: "fileSearchResults",
					results: [],
					requestId: message.requestId,
					error: "No workspace path available",
				})
				break
			}
			try {
				// Call file search service with query from message
				const results = await (0, file_search_1.searchWorkspaceFiles)(message.query || "", workspacePath, 20)
				// Get the AliIgnoreController from the current task, or create a new one
				const currentTask = provider.getCurrentTask()
				let aliIgnoreController = currentTask?.aliIgnoreController
				let tempController
				// If no current task or no controller, create a temporary one
				if (!aliIgnoreController) {
					tempController = new AliIgnoreController_1.AliIgnoreController(workspacePath)
					await tempController.initialize()
					aliIgnoreController = tempController
				}
				try {
					// Get showAliIgnoredFiles setting from state
					const { showAliIgnoredFiles = false } = (await provider.getState()) ?? {}
					// Filter results using AliIgnoreController if showAliIgnoredFiles is false
					let filteredResults = results
					if (!showAliIgnoredFiles && aliIgnoreController) {
						const allowedPaths = aliIgnoreController.filterPaths(results.map((r) => r.path))
						filteredResults = results.filter((r) => allowedPaths.includes(r.path))
					}
					// Send results back to webview
					await provider.postMessageToWebview({
						type: "fileSearchResults",
						results: filteredResults,
						requestId: message.requestId,
					})
				} finally {
					// Dispose temporary controller to prevent resource leak
					tempController?.dispose()
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				// Send error response to webview
				await provider.postMessageToWebview({
					type: "fileSearchResults",
					results: [],
					error: errorMessage,
					requestId: message.requestId,
				})
			}
			break
		}
		case "updateTodoList": {
			const payload = message.payload
			const todos = payload?.todos
			if (Array.isArray(todos)) {
				await (0, UpdateTodoListTool_1.setPendingTodoList)(todos)
			}
			break
		}
		case "refreshCustomTools": {
			try {
				const toolDirs = (0, index_js_1.getAliDirectoriesForCwd)(getCurrentCwd()).map((dir) =>
					path.join(dir, "tools"),
				)
				await core_1.customToolRegistry.loadFromDirectories(toolDirs)
				await provider.postMessageToWebview({
					type: "customToolsResult",
					tools: core_1.customToolRegistry.getAllSerialized(),
				})
			} catch (error) {
				await provider.postMessageToWebview({
					type: "customToolsResult",
					tools: [],
					error: error instanceof Error ? error.message : String(error),
				})
			}
			break
		}
		case "saveApiConfiguration":
			if (message.text && message.apiConfiguration) {
				try {
					await provider.providerSettingsManager.saveConfig(message.text, message.apiConfiguration)
					const listApiConfig = await provider.providerSettingsManager.listConfig()
					await updateGlobalState("listApiConfigMeta", listApiConfig)
				} catch (error) {
					provider.log(
						`Error save api configuration: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
					)
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.save_api_config"))
				}
			}
			break
		case "upsertApiConfiguration":
			if (message.text && message.apiConfiguration) {
				await provider.upsertProviderProfile(message.text, message.apiConfiguration)
			}
			break
		case "renameApiConfiguration":
			if (message.values && message.apiConfiguration) {
				try {
					const { oldName, newName } = message.values
					if (oldName === newName) {
						break
					}
					// Load the old configuration to get its ID.
					const { id } = await provider.providerSettingsManager.getProfile({ name: oldName })
					// Create a new configuration with the new name and old ID.
					await provider.providerSettingsManager.saveConfig(newName, { ...message.apiConfiguration, id })
					// Delete the old configuration.
					await provider.providerSettingsManager.deleteConfig(oldName)
					// Re-activate to update the global settings related to the
					// currently activated provider profile.
					await provider.activateProviderProfile({ name: newName })
				} catch (error) {
					provider.log(
						`Error rename api configuration: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
					)
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.rename_api_config"))
				}
			}
			break
		case "loadApiConfiguration":
			if (message.text) {
				try {
					await provider.activateProviderProfile({ name: message.text })
				} catch (error) {
					provider.log(
						`Error load api configuration: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
					)
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.load_api_config"))
				}
			}
			break
		case "loadApiConfigurationById":
			if (message.text) {
				try {
					await provider.activateProviderProfile({ id: message.text })
				} catch (error) {
					provider.log(
						`Error load api configuration by ID: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
					)
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.load_api_config"))
				}
			}
			break
		case "deleteApiConfiguration":
			if (message.text) {
				const answer = await vscode.window.showInformationMessage(
					(0, i18n_1.t)("common:confirmation.delete_config_profile"),
					{ modal: true },
					(0, i18n_1.t)("common:answers.yes"),
				)
				if (answer !== (0, i18n_1.t)("common:answers.yes")) {
					break
				}
				const oldName = message.text
				const newName = (await provider.providerSettingsManager.listConfig()).filter(
					(c) => c.name !== oldName,
				)[0]?.name
				if (!newName) {
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.delete_api_config"))
					return
				}
				try {
					await provider.providerSettingsManager.deleteConfig(oldName)
					await provider.activateProviderProfile({ name: newName })
				} catch (error) {
					provider.log(
						`Error delete api configuration: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
					)
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.delete_api_config"))
				}
			}
			break
		case "deleteMessageConfirm":
			if (!message.messageTs) {
				await vscode.window.showErrorMessage(
					(0, i18n_1.t)("common:errors.message.cannot_delete_missing_timestamp"),
				)
				break
			}
			if (typeof message.messageTs !== "number") {
				await vscode.window.showErrorMessage(
					(0, i18n_1.t)("common:errors.message.cannot_delete_invalid_timestamp"),
				)
				break
			}
			await handleDeleteMessageConfirm(message.messageTs, message.restoreCheckpoint)
			break
		case "editMessageConfirm":
			if (message.messageTs && message.text) {
				const resolved = await resolveIncomingImages({ text: message.text, images: message.images })
				await handleEditMessageConfirm(
					message.messageTs,
					resolved.text,
					message.restoreCheckpoint,
					resolved.images,
				)
			}
			break
		case "getListApiConfiguration":
			try {
				const listApiConfig = await provider.providerSettingsManager.listConfig()
				await updateGlobalState("listApiConfigMeta", listApiConfig)
				provider.postMessageToWebview({ type: "listApiConfig", listApiConfig })
			} catch (error) {
				provider.log(
					`Error get list api configuration: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
				)
				vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.list_api_config"))
			}
			break
		case "updateMcpTimeout":
			if (message.serverName && typeof message.timeout === "number") {
				try {
					await provider.getMcpHub()?.updateServerTimeout(message.serverName, message.timeout, message.source)
				} catch (error) {
					provider.log(
						`Failed to update timeout for ${message.serverName}: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
					)
					vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.update_server_timeout"))
				}
			}
			break
		case "updateCustomMode":
			if (message.modeConfig) {
				try {
					// Check if this is a new mode or an update to an existing mode
					const existingModes = await provider.customModesManager.getCustomModes()
					const isNewMode = !existingModes.some((mode) => mode.slug === message.modeConfig?.slug)
					await provider.customModesManager.updateCustomMode(message.modeConfig.slug, message.modeConfig)
					// Update state after saving the mode
					const customModes = await provider.customModesManager.getCustomModes()
					await updateGlobalState("customModes", customModes)
					await updateGlobalState("mode", message.modeConfig.slug)
					await provider.postStateToWebview()
				} catch (error) {
					// Error already shown to user by updateCustomMode
					// Just prevent unhandled rejection and skip state updates
				}
			}
			break
		case "deleteCustomMode":
			if (message.slug) {
				// Get the mode details to determine source and rules folder path
				const customModes = await provider.customModesManager.getCustomModes()
				const modeToDelete = customModes.find((mode) => mode.slug === message.slug)
				if (!modeToDelete) {
					break
				}
				// Determine the scope based on source (project or global)
				const scope = modeToDelete.source || "global"
				// Determine the rules folder path
				let rulesFolderPath
				if (scope === "project") {
					const workspacePath = (0, path_1.getWorkspacePath)()
					if (workspacePath) {
						rulesFolderPath = path.join(workspacePath, ".ali", `rules-${message.slug}`)
					} else {
						rulesFolderPath = path.join(".ali", `rules-${message.slug}`)
					}
				} else {
					// Global scope - use OS home directory
					const homeDir = os.homedir()
					rulesFolderPath = path.join(homeDir, ".ali", `rules-${message.slug}`)
				}
				// Check if the rules folder exists
				const rulesFolderExists = await (0, fs_1.fileExistsAtPath)(rulesFolderPath)
				// If this is a check request, send back the folder info
				if (message.checkOnly) {
					await provider.postMessageToWebview({
						type: "deleteCustomModeCheck",
						slug: message.slug,
						rulesFolderPath: rulesFolderExists ? rulesFolderPath : undefined,
					})
					break
				}
				// Delete the mode
				await provider.customModesManager.deleteCustomMode(message.slug)
				// Delete the rules folder if it exists
				if (rulesFolderExists) {
					try {
						await fs.rm(rulesFolderPath, { recursive: true, force: true })
						provider.log(`Deleted rules folder for mode ${message.slug}: ${rulesFolderPath}`)
					} catch (error) {
						provider.log(`Failed to delete rules folder for mode ${message.slug}: ${error}`)
						// Notify the user about the failure
						vscode.window.showErrorMessage(
							(0, i18n_1.t)("common:errors.delete_rules_folder_failed", {
								rulesFolderPath,
								error: error instanceof Error ? error.message : String(error),
							}),
						)
						// Continue with mode deletion even if folder deletion fails
					}
				}
				// Switch back to default mode after deletion
				await updateGlobalState("mode", modes_1.defaultModeSlug)
				await provider.postStateToWebview()
			}
			break
		case "exportMode":
			if (message.slug) {
				try {
					// Get custom mode prompts to check if built-in mode has been customized
					const customModePrompts = getGlobalState("customModePrompts") || {}
					const customPrompt = customModePrompts[message.slug]
					// Export the mode with any customizations merged directly
					const result = await provider.customModesManager.exportModeWithRules(message.slug, customPrompt)
					if (result.success && result.yaml) {
						const defaultUri = await (0, export_1.resolveDefaultSaveUri)(
							provider.contextProxy,
							"lastModeExportPath",
							`${message.slug}-export.yaml`,
							{
								useWorkspace: true,
								fallbackDir: path.join(os.homedir(), "Downloads"),
							},
						)
						// Show save dialog
						const saveUri = await vscode.window.showSaveDialog({
							defaultUri,
							filters: {
								"YAML files": ["yaml", "yml"],
							},
							title: "Save mode export",
						})
						if (saveUri && result.yaml) {
							// Save the directory for next time
							await (0, export_1.saveLastExportPath)(provider.contextProxy, "lastModeExportPath", saveUri)
							// Write the file to the selected location
							await fs.writeFile(saveUri.fsPath, result.yaml, "utf-8")
							// Send success message to webview
							provider.postMessageToWebview({
								type: "exportModeResult",
								success: true,
								slug: message.slug,
							})
							// Show info message
							vscode.window.showInformationMessage(
								(0, i18n_1.t)("common:info.mode_exported", { mode: message.slug }),
							)
						} else {
							// User cancelled the save dialog
							provider.postMessageToWebview({
								type: "exportModeResult",
								success: false,
								error: "Export cancelled",
								slug: message.slug,
							})
						}
					} else {
						// Send error message to webview
						provider.postMessageToWebview({
							type: "exportModeResult",
							success: false,
							error: result.error,
							slug: message.slug,
						})
					}
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error)
					provider.log(`Failed to export mode ${message.slug}: ${errorMessage}`)
					// Send error message to webview
					provider.postMessageToWebview({
						type: "exportModeResult",
						success: false,
						error: errorMessage,
						slug: message.slug,
					})
				}
			}
			break
		case "importMode":
			try {
				// Get last used directory for import
				const lastImportPath = getGlobalState("lastModeImportPath")
				let defaultUri
				if (lastImportPath) {
					// Use the directory from the last import
					const lastDir = path.dirname(lastImportPath)
					defaultUri = vscode.Uri.file(lastDir)
				} else {
					// Default to workspace or home directory
					const workspaceFolders = vscode.workspace.workspaceFolders
					if (workspaceFolders && workspaceFolders.length > 0) {
						defaultUri = vscode.Uri.file(workspaceFolders[0].uri.fsPath)
					}
				}
				// Show file picker to select YAML file
				const fileUri = await vscode.window.showOpenDialog({
					canSelectFiles: true,
					canSelectFolders: false,
					canSelectMany: false,
					defaultUri,
					filters: {
						"YAML files": ["yaml", "yml"],
					},
					title: "Select mode export file to import",
				})
				if (fileUri && fileUri[0]) {
					// Save the directory for next time
					await updateGlobalState("lastModeImportPath", fileUri[0].fsPath)
					// Read the file content
					const yamlContent = await fs.readFile(fileUri[0].fsPath, "utf-8")
					// Import the mode with the specified source level
					const result = await provider.customModesManager.importModeWithRules(
						yamlContent,
						message.source || "project",
					)
					if (result.success) {
						// Update state after importing
						const customModes = await provider.customModesManager.getCustomModes()
						await updateGlobalState("customModes", customModes)
						await provider.postStateToWebview()
						// Send success message to webview, include the imported slug so UI can switch
						provider.postMessageToWebview({
							type: "importModeResult",
							success: true,
							slug: result.slug,
						})
						// Show success message
						vscode.window.showInformationMessage((0, i18n_1.t)("common:info.mode_imported"))
					} else {
						// Send error message to webview
						provider.postMessageToWebview({
							type: "importModeResult",
							success: false,
							error: result.error,
						})
						// Show error message
						vscode.window.showErrorMessage(
							(0, i18n_1.t)("common:errors.mode_import_failed", { error: result.error }),
						)
					}
				} else {
					// User cancelled the file dialog - reset the importing state
					provider.postMessageToWebview({
						type: "importModeResult",
						success: false,
						error: "cancelled",
					})
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				provider.log(`Failed to import mode: ${errorMessage}`)
				// Send error message to webview
				provider.postMessageToWebview({
					type: "importModeResult",
					success: false,
					error: errorMessage,
				})
				// Show error message
				vscode.window.showErrorMessage(
					(0, i18n_1.t)("common:errors.mode_import_failed", { error: errorMessage }),
				)
			}
			break
		case "checkRulesDirectory":
			if (message.slug) {
				const hasContent = await provider.customModesManager.checkRulesDirectoryHasContent(message.slug)
				provider.postMessageToWebview({
					type: "checkRulesDirectoryResult",
					slug: message.slug,
					hasContent: hasContent,
				})
			}
			break
		case "debugSetting": {
			await vscode.workspace
				.getConfiguration(package_1.Package.name)
				.update("debug", message.bool ?? false, vscode.ConfigurationTarget.Global)
			await provider.postStateToWebview()
			break
		}
		case "openAiCodexSignIn": {
			try {
				const { openAiCodexOAuthManager } = await import("../../integrations/openai-codex/oauth")
				const authUrl = openAiCodexOAuthManager.startAuthorizationFlow()
				// Open the authorization URL in the browser
				await vscode.env.openExternal(vscode.Uri.parse(authUrl))
				// Wait for the callback in a separate promise (non-blocking)
				openAiCodexOAuthManager
					.waitForCallback()
					.then(async () => {
						vscode.window.showInformationMessage("Successfully signed in to OpenAI Codex")
						await provider.postStateToWebview()
					})
					.catch((error) => {
						provider.log(`OpenAI Codex OAuth callback failed: ${error}`)
						if (!String(error).includes("timed out")) {
							vscode.window.showErrorMessage(`OpenAI Codex sign in failed: ${error.message || error}`)
						}
					})
			} catch (error) {
				provider.log(`OpenAI Codex OAuth failed: ${error}`)
				vscode.window.showErrorMessage("OpenAI Codex sign in failed.")
			}
			break
		}
		case "openAiCodexSignOut": {
			try {
				const { openAiCodexOAuthManager } = await import("../../integrations/openai-codex/oauth")
				await openAiCodexOAuthManager.clearCredentials()
				vscode.window.showInformationMessage("Signed out from OpenAI Codex")
				await provider.postStateToWebview()
			} catch (error) {
				provider.log(`OpenAI Codex sign out failed: ${error}`)
				vscode.window.showErrorMessage("OpenAI Codex sign out failed.")
			}
			break
		}
		case "saveCodeIndexSettingsAtomic": {
			if (!message.codeIndexSettings) {
				break
			}
			const settings = message.codeIndexSettings
			try {
				// Check if embedder provider has changed
				const currentConfig = getGlobalState("codebaseIndexConfig") || {}
				const embedderProviderChanged =
					currentConfig.codebaseIndexEmbedderProvider !== settings.codebaseIndexEmbedderProvider
				// Save global state settings atomically
				const globalStateConfig = {
					...currentConfig,
					codebaseIndexEnabled: settings.codebaseIndexEnabled,
					codebaseIndexQdrantUrl: settings.codebaseIndexQdrantUrl,
					codebaseIndexEmbedderProvider: settings.codebaseIndexEmbedderProvider,
					codebaseIndexEmbedderBaseUrl: settings.codebaseIndexEmbedderBaseUrl,
					codebaseIndexEmbedderModelId: settings.codebaseIndexEmbedderModelId,
					codebaseIndexEmbedderModelDimension: settings.codebaseIndexEmbedderModelDimension, // Generic dimension
					codebaseIndexOpenAiCompatibleBaseUrl: settings.codebaseIndexOpenAiCompatibleBaseUrl,
					codebaseIndexBedrockRegion: settings.codebaseIndexBedrockRegion,
					codebaseIndexBedrockProfile: settings.codebaseIndexBedrockProfile,
					codebaseIndexSearchMaxResults: settings.codebaseIndexSearchMaxResults,
					codebaseIndexSearchMinScore: settings.codebaseIndexSearchMinScore,
					codebaseIndexOpenRouterSpecificProvider: settings.codebaseIndexOpenRouterSpecificProvider,
				}
				// Save global state first
				await updateGlobalState("codebaseIndexConfig", globalStateConfig)
				// Save secrets directly using context proxy
				if (settings.codeIndexOpenAiKey !== undefined) {
					await provider.contextProxy.storeSecret("codeIndexOpenAiKey", settings.codeIndexOpenAiKey)
				}
				if (settings.codeIndexQdrantApiKey !== undefined) {
					await provider.contextProxy.storeSecret("codeIndexQdrantApiKey", settings.codeIndexQdrantApiKey)
				}
				if (settings.codebaseIndexOpenAiCompatibleApiKey !== undefined) {
					await provider.contextProxy.storeSecret(
						"codebaseIndexOpenAiCompatibleApiKey",
						settings.codebaseIndexOpenAiCompatibleApiKey,
					)
				}
				if (settings.codebaseIndexGeminiApiKey !== undefined) {
					await provider.contextProxy.storeSecret(
						"codebaseIndexGeminiApiKey",
						settings.codebaseIndexGeminiApiKey,
					)
				}
				if (settings.codebaseIndexMistralApiKey !== undefined) {
					await provider.contextProxy.storeSecret(
						"codebaseIndexMistralApiKey",
						settings.codebaseIndexMistralApiKey,
					)
				}
				if (settings.codebaseIndexVercelAiGatewayApiKey !== undefined) {
					await provider.contextProxy.storeSecret(
						"codebaseIndexVercelAiGatewayApiKey",
						settings.codebaseIndexVercelAiGatewayApiKey,
					)
				}
				if (settings.codebaseIndexOpenRouterApiKey !== undefined) {
					await provider.contextProxy.storeSecret(
						"codebaseIndexOpenRouterApiKey",
						settings.codebaseIndexOpenRouterApiKey,
					)
				}
				// Send success response first - settings are saved regardless of validation
				await provider.postMessageToWebview({
					type: "codeIndexSettingsSaved",
					success: true,
					settings: globalStateConfig,
				})
				// Update webview state
				await provider.postStateToWebview()
				// Then handle validation and initialization for the current workspace
				const currentCodeIndexManager = provider.getCurrentWorkspaceCodeIndexManager()
				if (currentCodeIndexManager) {
					// If embedder provider changed, perform proactive validation
					if (embedderProviderChanged) {
						try {
							// Force handleSettingsChange which will trigger validation
							await currentCodeIndexManager.handleSettingsChange()
						} catch (error) {
							// Validation failed - the error state is already set by handleSettingsChange
							provider.log(
								`Embedder validation failed after provider change: ${error instanceof Error ? error.message : String(error)}`,
							)
							// Send validation error to webview
							await provider.postMessageToWebview({
								type: "indexingStatusUpdate",
								values: currentCodeIndexManager.getCurrentStatus(),
							})
							// Exit early - don't try to start indexing with invalid configuration
							break
						}
					} else {
						// No provider change, just handle settings normally
						try {
							await currentCodeIndexManager.handleSettingsChange()
						} catch (error) {
							// Log but don't fail - settings are saved
							provider.log(
								`Settings change handling error: ${error instanceof Error ? error.message : String(error)}`,
							)
						}
					}
					// Wait a bit more to ensure everything is ready
					await new Promise((resolve) => setTimeout(resolve, 200))
					// Auto-start indexing if now enabled and configured
					if (currentCodeIndexManager.isFeatureEnabled && currentCodeIndexManager.isFeatureConfigured) {
						if (!currentCodeIndexManager.isInitialized) {
							try {
								await currentCodeIndexManager.initialize(provider.contextProxy)
								provider.log(`Code index manager initialized after settings save`)
							} catch (error) {
								provider.log(
									`Code index initialization failed: ${error instanceof Error ? error.message : String(error)}`,
								)
								// Send error status to webview
								await provider.postMessageToWebview({
									type: "indexingStatusUpdate",
									values: currentCodeIndexManager.getCurrentStatus(),
								})
							}
						}
					}
				} else {
					// No workspace open - send error status
					provider.log("Cannot save code index settings: No workspace folder open")
					await provider.postMessageToWebview({
						type: "indexingStatusUpdate",
						values: {
							systemStatus: "Error",
							message: (0, i18n_1.t)("embeddings:orchestrator.indexingRequiresWorkspace"),
							processedItems: 0,
							totalItems: 0,
							currentItemUnit: "items",
						},
					})
				}
			} catch (error) {
				provider.log(`Error saving code index settings: ${error.message || error}`)
				await provider.postMessageToWebview({
					type: "codeIndexSettingsSaved",
					success: false,
					error: error.message || "Failed to save settings",
				})
			}
			break
		}
		case "requestIndexingStatus": {
			const manager = provider.getCurrentWorkspaceCodeIndexManager()
			if (!manager) {
				// No workspace open - send error status
				provider.postMessageToWebview({
					type: "indexingStatusUpdate",
					values: {
						systemStatus: "Error",
						message: (0, i18n_1.t)("embeddings:orchestrator.indexingRequiresWorkspace"),
						processedItems: 0,
						totalItems: 0,
						currentItemUnit: "items",
						workerspacePath: undefined,
					},
				})
				return
			}
			const status = manager
				? manager.getCurrentStatus()
				: {
						systemStatus: "Standby",
						message: "No workspace folder open",
						processedItems: 0,
						totalItems: 0,
						currentItemUnit: "items",
						workspacePath: undefined,
					}
			provider.postMessageToWebview({
				type: "indexingStatusUpdate",
				values: status,
			})
			break
		}
		case "requestCodeIndexSecretStatus": {
			// Check if secrets are set using the VSCode context directly for async access
			const hasOpenAiKey = !!(await provider.context.secrets.get("codeIndexOpenAiKey"))
			const hasQdrantApiKey = !!(await provider.context.secrets.get("codeIndexQdrantApiKey"))
			const hasOpenAiCompatibleApiKey = !!(await provider.context.secrets.get(
				"codebaseIndexOpenAiCompatibleApiKey",
			))
			const hasGeminiApiKey = !!(await provider.context.secrets.get("codebaseIndexGeminiApiKey"))
			const hasMistralApiKey = !!(await provider.context.secrets.get("codebaseIndexMistralApiKey"))
			const hasVercelAiGatewayApiKey = !!(await provider.context.secrets.get(
				"codebaseIndexVercelAiGatewayApiKey",
			))
			const hasOpenRouterApiKey = !!(await provider.context.secrets.get("codebaseIndexOpenRouterApiKey"))
			provider.postMessageToWebview({
				type: "codeIndexSecretStatus",
				values: {
					hasOpenAiKey,
					hasQdrantApiKey,
					hasOpenAiCompatibleApiKey,
					hasGeminiApiKey,
					hasMistralApiKey,
					hasVercelAiGatewayApiKey,
					hasOpenRouterApiKey,
				},
			})
			break
		}
		case "startIndexing": {
			try {
				const manager = provider.getCurrentWorkspaceCodeIndexManager()
				if (!manager) {
					provider.postMessageToWebview({
						type: "indexingStatusUpdate",
						values: {
							systemStatus: "Error",
							message: (0, i18n_1.t)("embeddings:orchestrator.indexingRequiresWorkspace"),
							processedItems: 0,
							totalItems: 0,
							currentItemUnit: "items",
						},
					})
					provider.log("Cannot start indexing: No workspace folder open")
					return
				}
				// "Start Indexing" implicitly enables the workspace
				await manager.setWorkspaceEnabled(true)
				if (manager.isFeatureEnabled && manager.isFeatureConfigured) {
					await manager.initialize(provider.contextProxy)
					const currentState = manager.state
					if (currentState === "Standby" || currentState === "Error") {
						manager.startIndexing()
						if (!manager.isInitialized) {
							await manager.initialize(provider.contextProxy)
							if (manager.state === "Standby" || manager.state === "Error") {
								manager.startIndexing()
							}
						}
					}
				}
			} catch (error) {
				provider.log(`Error starting indexing: ${error instanceof Error ? error.message : String(error)}`)
			}
			break
		}
		case "stopIndexing": {
			try {
				const manager = provider.getCurrentWorkspaceCodeIndexManager()
				if (!manager) {
					provider.log("Cannot stop indexing: No workspace folder open")
					return
				}
				manager.stopIndexing()
				provider.postMessageToWebview({
					type: "indexingStatusUpdate",
					values: manager.getCurrentStatus(),
				})
			} catch (error) {
				provider.log(`Error stopping indexing: ${error instanceof Error ? error.message : String(error)}`)
			}
			break
		}
		case "toggleWorkspaceIndexing": {
			try {
				const manager = provider.getCurrentWorkspaceCodeIndexManager()
				if (!manager) {
					provider.log("Cannot toggle workspace indexing: No workspace folder open")
					return
				}
				const enabled = message.bool ?? false
				await manager.setWorkspaceEnabled(enabled)
				if (enabled && manager.isFeatureEnabled && manager.isFeatureConfigured) {
					await manager.initialize(provider.contextProxy)
					manager.startIndexing()
				} else if (!enabled) {
					manager.stopIndexing()
				}
				provider.postMessageToWebview({
					type: "indexingStatusUpdate",
					values: manager.getCurrentStatus(),
				})
			} catch (error) {
				provider.log(
					`Error toggling workspace indexing: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
			break
		}
		case "setAutoEnableDefault": {
			try {
				const manager = provider.getCurrentWorkspaceCodeIndexManager()
				if (!manager) {
					provider.log("Cannot set auto-enable default: No workspace folder open")
					return
				}
				// Capture prior state for every manager before persisting the global change
				const allManagers = manager_1.CodeIndexManager.getAllInstances()
				const priorStates = new Map(allManagers.map((m) => [m, m.isWorkspaceEnabled]))
				await manager.setAutoEnableDefault(message.bool ?? true)
				// Apply stop/start to every affected manager
				for (const m of allManagers) {
					const wasEnabled = priorStates.get(m)
					const isNowEnabled = m.isWorkspaceEnabled
					if (wasEnabled && !isNowEnabled) {
						m.stopIndexing()
					} else if (!wasEnabled && isNowEnabled && m.isFeatureEnabled && m.isFeatureConfigured) {
						await m.initialize(provider.contextProxy)
						m.startIndexing()
					}
				}
				provider.postMessageToWebview({
					type: "indexingStatusUpdate",
					values: manager.getCurrentStatus(),
				})
			} catch (error) {
				provider.log(
					`Error setting auto-enable default: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
			break
		}
		case "clearIndexData": {
			try {
				const manager = provider.getCurrentWorkspaceCodeIndexManager()
				if (!manager) {
					provider.log("Cannot clear index data: No workspace folder open")
					provider.postMessageToWebview({
						type: "indexCleared",
						values: {
							success: false,
							error: (0, i18n_1.t)("embeddings:orchestrator.indexingRequiresWorkspace"),
						},
					})
					return
				}
				await manager.clearIndexData()
				provider.postMessageToWebview({ type: "indexCleared", values: { success: true } })
			} catch (error) {
				provider.log(`Error clearing index data: ${error instanceof Error ? error.message : String(error)}`)
				provider.postMessageToWebview({
					type: "indexCleared",
					values: {
						success: false,
						error: error instanceof Error ? error.message : String(error),
					},
				})
			}
			break
		}
		case "focusPanelRequest": {
			// Execute the focusPanel command to focus the WebView
			await vscode.commands.executeCommand((0, commands_1.getCommand)("focusPanel"))
			break
		}
		case "switchTab": {
			if (message.tab) {
				await provider.postMessageToWebview({
					type: "action",
					action: "switchTab",
					tab: message.tab,
					values: message.values,
				})
			}
			break
		}
		case "requestCommands": {
			try {
				const commandList = await getDiscoveredCommands()
				await provider.postMessageToWebview({ type: "commands", commands: commandList })
			} catch (error) {
				provider.log(`Error fetching commands: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`)
				await provider.postMessageToWebview({ type: "commands", commands: [] })
			}
			break
		}
		case "requestModes": {
			try {
				const modes = await provider.getModes()
				await provider.postMessageToWebview({ type: "modes", modes })
			} catch (error) {
				provider.log(`Error fetching modes: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`)
				await provider.postMessageToWebview({ type: "modes", modes: [] })
			}
			break
		}
		case "requestSkills": {
			await (0, skillsMessageHandler_1.handleRequestSkills)(provider)
			break
		}
		case "createSkill": {
			await (0, skillsMessageHandler_1.handleCreateSkill)(provider, message)
			break
		}
		case "deleteSkill": {
			await (0, skillsMessageHandler_1.handleDeleteSkill)(provider, message)
			break
		}
		case "moveSkill": {
			await (0, skillsMessageHandler_1.handleMoveSkill)(provider, message)
			break
		}
		case "updateSkillModes": {
			await (0, skillsMessageHandler_1.handleUpdateSkillModes)(provider, message)
			break
		}
		case "openSkillFile": {
			await (0, skillsMessageHandler_1.handleOpenSkillFile)(provider, message)
			break
		}
		case "openCommandFile": {
			try {
				if (message.text) {
					const { getCommand } = await import("../../services/command/commands")
					const command = await getCommand(getCurrentCwd(), message.text)
					if (command && command.filePath) {
						;(0, open_file_1.openFile)(command.filePath)
					} else {
						vscode.window.showErrorMessage(
							(0, i18n_1.t)("common:errors.command_not_found", { name: message.text }),
						)
					}
				}
			} catch (error) {
				provider.log(
					`Error opening command file: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
				)
				vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.open_command_file"))
			}
			break
		}
		case "deleteCommand": {
			try {
				if (message.text && message.values?.source) {
					const { getCommand } = await import("../../services/command/commands")
					const command = await getCommand(getCurrentCwd(), message.text)
					if (command && command.filePath) {
						// Delete the command file
						await fs.unlink(command.filePath)
						provider.log(`Deleted command file: ${command.filePath}`)
					} else {
						vscode.window.showErrorMessage(
							(0, i18n_1.t)("common:errors.command_not_found", { name: message.text }),
						)
					}
				}
			} catch (error) {
				provider.log(`Error deleting command: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`)
				vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.delete_command"))
			}
			break
		}
		case "createCommand": {
			try {
				const source = message.values?.source
				const fileName = message.text // Custom filename from user input
				if (!source) {
					provider.log("Missing source for createCommand")
					break
				}
				// Determine the commands directory based on source
				let commandsDir
				if (source === "global") {
					const globalConfigDir = path.join(os.homedir(), ".ali")
					commandsDir = path.join(globalConfigDir, "commands")
				} else {
					if (!vscode.workspace.workspaceFolders?.length) {
						vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.no_workspace"))
						return
					}
					// Project commands
					const workspaceRoot = getCurrentCwd()
					if (!workspaceRoot) {
						vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.no_workspace_for_project_command"))
						break
					}
					commandsDir = path.join(workspaceRoot, ".ali", "commands")
				}
				// Ensure the commands directory exists
				await fs.mkdir(commandsDir, { recursive: true })
				// Use provided filename or generate a unique one
				let commandName
				if (fileName && fileName.trim()) {
					let cleanFileName = fileName.trim()
					// Strip leading slash if present
					if (cleanFileName.startsWith("/")) {
						cleanFileName = cleanFileName.substring(1)
					}
					// Remove .md extension if present BEFORE slugification
					if (cleanFileName.toLowerCase().endsWith(".md")) {
						cleanFileName = cleanFileName.slice(0, -3)
					}
					// Slugify the command name: lowercase, replace spaces with dashes, remove special characters
					commandName = cleanFileName
						.toLowerCase()
						.replace(/\s+/g, "-") // Replace spaces with dashes
						.replace(/[^a-z0-9-]/g, "") // Remove special characters except dashes
						.replace(/-+/g, "-") // Replace multiple dashes with single dash
						.replace(/^-|-$/g, "") // Remove leading/trailing dashes
					// Ensure we have a valid command name
					if (!commandName || commandName.length === 0) {
						commandName = "new-command"
					}
				} else {
					// Generate a unique command name
					commandName = "new-command"
					let counter = 1
					let filePath = path.join(commandsDir, `${commandName}.md`)
					while (
						await fs
							.access(filePath)
							.then(() => true)
							.catch(() => false)
					) {
						commandName = `new-command-${counter}`
						filePath = path.join(commandsDir, `${commandName}.md`)
						counter++
					}
				}
				const filePath = path.join(commandsDir, `${commandName}.md`)
				// Check if file already exists
				if (
					await fs
						.access(filePath)
						.then(() => true)
						.catch(() => false)
				) {
					vscode.window.showErrorMessage(
						(0, i18n_1.t)("common:errors.command_already_exists", { commandName }),
					)
					break
				}
				// Create the command file with template content
				const templateContent = (0, i18n_1.t)("common:errors.command_template_content")
				await fs.writeFile(filePath, templateContent, "utf8")
				provider.log(`Created new command file: ${filePath}`)
				// Open the new file in the editor
				;(0, open_file_1.openFile)(filePath)
				// Refresh commands list
				const { getCommands } = await import("../../services/command/commands")
				const commands = await getCommands(getCurrentCwd() || "")
				const commandList = commands.map((command) => ({
					name: command.name,
					source: command.source,
					filePath: command.filePath,
					description: command.description,
					argumentHint: command.argumentHint,
				}))
				await provider.postMessageToWebview({
					type: "commands",
					commands: commandList,
				})
			} catch (error) {
				provider.log(`Error creating command: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`)
				vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.create_command_failed"))
			}
			break
		}
		case "insertTextIntoTextarea": {
			const text = message.text
			if (text) {
				// Send message to insert text into the chat textarea
				await provider.postMessageToWebview({
					type: "insertTextIntoTextarea",
					text: text,
				})
			}
			break
		}
		/**
		 * Chat Message Queue
		 */
		case "queueMessage": {
			const resolved = await resolveIncomingImages({ text: message.text, images: message.images })
			provider.getCurrentTask()?.messageQueueService.addMessage(resolved.text, resolved.images)
			break
		}
		case "removeQueuedMessage": {
			provider.getCurrentTask()?.messageQueueService.removeMessage(message.text ?? "")
			break
		}
		case "editQueuedMessage": {
			if (message.payload) {
				const { id, text, images } = message.payload
				provider.getCurrentTask()?.messageQueueService.updateMessage(id, text, images)
			}
			break
		}
		case "dismissUpsell": {
			if (message.upsellId) {
				try {
					// Get current list of dismissed upsells
					const dismissedUpsells = getGlobalState("dismissedUpsells") || []
					// Add the new upsell ID if not already present
					let updatedList = dismissedUpsells
					if (!dismissedUpsells.includes(message.upsellId)) {
						updatedList = [...dismissedUpsells, message.upsellId]
						await updateGlobalState("dismissedUpsells", updatedList)
					}
					// Send updated list back to webview (use the already computed updatedList)
					await provider.postMessageToWebview({
						type: "dismissedUpsells",
						list: updatedList,
					})
				} catch (error) {
					// Fail silently as per Bruno's comment - it's OK to fail silently in this case
					provider.log(`Failed to dismiss upsell: ${error instanceof Error ? error.message : String(error)}`)
				}
			}
			break
		}
		case "getDismissedUpsells": {
			// Send the current list of dismissed upsells to the webview
			const dismissedUpsells = getGlobalState("dismissedUpsells") || []
			await provider.postMessageToWebview({
				type: "dismissedUpsells",
				list: dismissedUpsells,
			})
			break
		}
		case "openMarkdownPreview": {
			if (message.text) {
				try {
					const tmpDir = os.tmpdir()
					const timestamp = Date.now()
					const tempFileName = `roo-preview-${timestamp}.md`
					const tempFilePath = path.join(tmpDir, tempFileName)
					await fs.writeFile(tempFilePath, message.text, "utf8")
					const doc = await vscode.workspace.openTextDocument(tempFilePath)
					await vscode.commands.executeCommand("markdown.showPreview", doc.uri)
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error)
					provider.log(`Error opening markdown preview: ${errorMessage}`)
					vscode.window.showErrorMessage(`Failed to open markdown preview: ${errorMessage}`)
				}
			}
			break
		}
		case "requestOpenAiCodexRateLimits": {
			try {
				const { openAiCodexOAuthManager } = await import("../../integrations/openai-codex/oauth")
				const accessToken = await openAiCodexOAuthManager.getAccessToken()
				if (!accessToken) {
					provider.postMessageToWebview({
						type: "openAiCodexRateLimits",
						error: "Not authenticated with OpenAI Codex",
					})
					break
				}
				const accountId = await openAiCodexOAuthManager.getAccountId()
				const { fetchOpenAiCodexRateLimitInfo } = await import("../../integrations/openai-codex/rate-limits")
				const rateLimits = await fetchOpenAiCodexRateLimitInfo(accessToken, { accountId })
				provider.postMessageToWebview({
					type: "openAiCodexRateLimits",
					values: rateLimits,
				})
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				provider.log(`Error fetching OpenAI Codex rate limits: ${errorMessage}`)
				provider.postMessageToWebview({
					type: "openAiCodexRateLimits",
					error: errorMessage,
				})
			}
			break
		}
		case "openDebugApiHistory":
		case "openDebugUiHistory": {
			const currentTask = provider.getCurrentTask()
			if (!currentTask) {
				vscode.window.showErrorMessage("No active task to view history for")
				break
			}
			try {
				const { getTaskDirectoryPath } = await import("../../utils/storage")
				const globalStoragePath = provider.contextProxy.globalStorageUri.fsPath
				const taskDirPath = await getTaskDirectoryPath(globalStoragePath, currentTask.taskId)
				const fileName =
					message.type === "openDebugApiHistory" ? "api_conversation_history.json" : "ui_messages.json"
				const sourceFilePath = path.join(taskDirPath, fileName)
				// Check if file exists
				if (!(await (0, fs_1.fileExistsAtPath)(sourceFilePath))) {
					vscode.window.showErrorMessage(`File not found: ${fileName}`)
					break
				}
				// Read the source file
				const content = await fs.readFile(sourceFilePath, "utf8")
				let jsonContent
				try {
					jsonContent = JSON.parse(content)
				} catch {
					vscode.window.showErrorMessage(`Failed to parse ${fileName}`)
					break
				}
				// Prettify the JSON
				const prettifiedContent = JSON.stringify(jsonContent, null, 2)
				// Create a temporary file
				const tmpDir = os.tmpdir()
				const timestamp = Date.now()
				const tempFileName = `roo-debug-${message.type === "openDebugApiHistory" ? "api" : "ui"}-${currentTask.taskId.slice(0, 8)}-${timestamp}.json`
				const tempFilePath = path.join(tmpDir, tempFileName)
				await fs.writeFile(tempFilePath, prettifiedContent, "utf8")
				// Open the temp file in VS Code
				const doc = await vscode.workspace.openTextDocument(tempFilePath)
				await vscode.window.showTextDocument(doc, { preview: true })
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				provider.log(`Error opening debug history: ${errorMessage}`)
				vscode.window.showErrorMessage(`Failed to open debug history: ${errorMessage}`)
			}
			break
		}
		case "downloadErrorDiagnostics": {
			const currentTask = provider.getCurrentTask()
			if (!currentTask) {
				vscode.window.showErrorMessage("No active task to generate diagnostics for")
				break
			}
			await (0, diagnosticsHandler_1.generateErrorDiagnostics)({
				taskId: currentTask.taskId,
				globalStoragePath: provider.contextProxy.globalStorageUri.fsPath,
				values: message.values,
				log: (msg) => provider.log(msg),
			})
			break
		}
		/**
		 * Git Worktree Management
		 */
		case "listWorktrees": {
			try {
				const { worktrees, isGitRepo, isMultiRoot, isSubfolder, gitRootPath, error } = await (0,
				worktree_1.handleListWorktrees)(provider)
				await provider.postMessageToWebview({
					type: "worktreeList",
					worktrees,
					isGitRepo,
					isMultiRoot,
					isSubfolder,
					gitRootPath,
					error,
				})
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				await provider.postMessageToWebview({
					type: "worktreeList",
					worktrees: [],
					isGitRepo: false,
					isMultiRoot: false,
					isSubfolder: false,
					gitRootPath: "",
					error: errorMessage,
				})
			}
			break
		}
		case "createWorktree": {
			try {
				const { success, message: text } = await (0, worktree_1.handleCreateWorktree)(
					provider,
					{
						path: message.worktreePath,
						branch: message.worktreeBranch,
						baseBranch: message.worktreeBaseBranch,
						createNewBranch: message.worktreeCreateNewBranch,
					},
					(progress) => {
						provider.postMessageToWebview({
							type: "worktreeCopyProgress",
							copyProgressBytesCopied: progress.bytesCopied,
							copyProgressItemName: progress.itemName,
						})
					},
				)
				await provider.postMessageToWebview({ type: "worktreeResult", success, text })
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				await provider.postMessageToWebview({ type: "worktreeResult", success: false, text: errorMessage })
			}
			break
		}
		case "deleteWorktree": {
			try {
				const { success, message: text } = await (0, worktree_1.handleDeleteWorktree)(
					provider,
					message.worktreePath,
					message.worktreeForce ?? false,
				)
				await provider.postMessageToWebview({ type: "worktreeResult", success, text })
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				await provider.postMessageToWebview({ type: "worktreeResult", success: false, text: errorMessage })
			}
			break
		}
		case "switchWorktree": {
			try {
				const { success, message: text } = await (0, worktree_1.handleSwitchWorktree)(
					provider,
					message.worktreePath,
					message.worktreeNewWindow ?? true,
				)
				await provider.postMessageToWebview({ type: "worktreeResult", success, text })
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				await provider.postMessageToWebview({ type: "worktreeResult", success: false, text: errorMessage })
			}
			break
		}
		case "getAvailableBranches": {
			try {
				const { localBranches, remoteBranches, currentBranch } = await (0,
				worktree_1.handleGetAvailableBranches)(provider)
				await provider.postMessageToWebview({
					type: "branchList",
					localBranches,
					remoteBranches,
					currentBranch,
				})
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				await provider.postMessageToWebview({
					type: "branchList",
					localBranches: [],
					remoteBranches: [],
					currentBranch: "",
					error: errorMessage,
				})
			}
			break
		}
		case "getWorktreeDefaults": {
			try {
				const { suggestedBranch, suggestedPath } = await (0, worktree_1.handleGetWorktreeDefaults)(provider)
				await provider.postMessageToWebview({ type: "worktreeDefaults", suggestedBranch, suggestedPath })
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				await provider.postMessageToWebview({
					type: "worktreeDefaults",
					suggestedBranch: "",
					suggestedPath: "",
					error: errorMessage,
				})
			}
			break
		}
		case "getWorktreeIncludeStatus": {
			try {
				const worktreeIncludeStatus = await (0, worktree_1.handleGetWorktreeIncludeStatus)(provider)
				await provider.postMessageToWebview({ type: "worktreeIncludeStatus", worktreeIncludeStatus })
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				await provider.postMessageToWebview({
					type: "worktreeIncludeStatus",
					worktreeIncludeStatus: {
						exists: false,
						hasGitignore: false,
						gitignoreContent: undefined,
					},
					error: errorMessage,
				})
			}
			break
		}
		case "checkBranchWorktreeInclude": {
			try {
				const branch = message.worktreeBranch
				if (!branch) {
					await provider.postMessageToWebview({
						type: "branchWorktreeIncludeResult",
						hasWorktreeInclude: false,
						error: "No branch specified",
					})
					break
				}
				const hasWorktreeInclude = await (0, worktree_1.handleCheckBranchWorktreeInclude)(provider, branch)
				await provider.postMessageToWebview({
					type: "branchWorktreeIncludeResult",
					branch,
					hasWorktreeInclude,
				})
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				await provider.postMessageToWebview({
					type: "branchWorktreeIncludeResult",
					hasWorktreeInclude: false,
					error: errorMessage,
				})
			}
			break
		}
		case "createWorktreeInclude": {
			try {
				const { success, message: text } = await (0, worktree_1.handleCreateWorktreeInclude)(
					provider,
					message.worktreeIncludeContent ?? "",
				)
				await provider.postMessageToWebview({ type: "worktreeResult", success, text })
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				provider.log(`Error creating worktree include: ${errorMessage}`)
				await provider.postMessageToWebview({ type: "worktreeResult", success: false, text: errorMessage })
			}
			break
		}
		case "checkoutBranch": {
			try {
				const { success, message: text } = await (0, worktree_1.handleCheckoutBranch)(
					provider,
					message.worktreeBranch,
				)
				await provider.postMessageToWebview({ type: "worktreeResult", success, text })
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				await provider.postMessageToWebview({ type: "worktreeResult", success: false, text: errorMessage })
			}
			break
		}
		case "browseForWorktreePath": {
			try {
				const options = {
					canSelectFiles: false,
					canSelectFolders: true,
					canSelectMany: false,
					openLabel: (0, i18n_1.t)("worktrees:selectWorktreeLocation"),
					title: (0, i18n_1.t)("worktrees:selectFolderForWorktree"),
					defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri
						? vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, "..")
						: undefined,
				}
				const result = await vscode.window.showOpenDialog(options)
				if (result && result[0]) {
					await provider.postMessageToWebview({
						type: "folderSelected",
						path: result[0].fsPath,
					})
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				provider.log(`Error opening folder picker: ${errorMessage}`)
			}
			break
		}
		default: {
			// console.log(`Unhandled message type: ${message.type}`)
			//
			// Currently unhandled:
			//
			// "currentApiConfigName" |
			// "codebaseIndexEnabled" |
			// "enhancedPrompt" |
			// "systemPrompt" |
			// "exportModeResult" |
			// "importModeResult" |
			// "checkRulesDirectoryResult" |
			// "browserConnectionResult" |
			// "vsCodeSetting" |
			// "indexingStatusUpdate" |
			// "indexCleared" |
			// "shareTaskSuccess" |
			// "playSound" |
			// "draggedImages" |
			// "setApiConfigPassword" |
			// "setopenAiCustomModelInfo" |
			// "imageGenerationSettings"
			break
		}
	}
}
exports.webviewMessageHandler = webviewMessageHandler
