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
exports.API = void 0
const events_1 = require("events")
const promises_1 = __importDefault(require("fs/promises"))
const path = __importStar(require("path"))
const os = __importStar(require("os"))
const vscode = __importStar(require("vscode"))
const p_wait_for_1 = __importDefault(require("p-wait-for"))
const types_1 = require("@ali-code/types")
const ipc_1 = require("@ali-code/ipc")
const package_1 = require("../shared/package")
const registerCommands_1 = require("../activate/registerCommands")
const commands_1 = require("../services/command/commands")
const modelCache_1 = require("../api/providers/fetchers/modelCache")
class API extends events_1.EventEmitter {
	outputChannel
	sidebarProvider
	context
	ipc
	log
	logfile
	constructor(outputChannel, provider, socketPath, enableLogging = false) {
		super()
		this.outputChannel = outputChannel
		this.sidebarProvider = provider
		this.context = provider.context
		if (enableLogging) {
			this.log = (...args) => {
				this.outputChannelLog(...args)
				console.log(args)
			}
			this.logfile = path.join(os.tmpdir(), "ali-code-messages.log")
		} else {
			this.log = () => {}
		}
		this.registerListeners(this.sidebarProvider)
		if (socketPath) {
			const ipc = (this.ipc = new ipc_1.IpcServer(socketPath, this.log))
			ipc.listen()
			this.log(`[API] ipc server started: socketPath=${socketPath}, pid=${process.pid}, ppid=${process.ppid}`)
			ipc.on(types_1.IpcMessageType.TaskCommand, async (clientId, command) => {
				const sendResponse = (eventName, payload) => {
					ipc.send(clientId, {
						type: types_1.IpcMessageType.TaskEvent,
						origin: types_1.IpcOrigin.Server,
						data: { eventName, payload },
					})
				}
				switch (command.commandName) {
					case types_1.TaskCommandName.StartNewTask:
						this.log(
							`[API] StartNewTask -> ${command.data.text}, ${JSON.stringify(command.data.configuration)}`,
						)
						await this.startNewTask(command.data)
						break
					case types_1.TaskCommandName.CancelTask:
						this.log(`[API] CancelTask`)
						await this.cancelCurrentTask()
						break
					case types_1.TaskCommandName.CloseTask:
						this.log(`[API] CloseTask`)
						await vscode.commands.executeCommand("workbench.action.files.saveFiles")
						await vscode.commands.executeCommand("workbench.action.closeWindow")
						break
					case types_1.TaskCommandName.ResumeTask:
						this.log(`[API] ResumeTask -> ${command.data}`)
						try {
							await this.resumeTask(command.data)
						} catch (error) {
							const errorMessage = error instanceof Error ? error.message : String(error)
							this.log(`[API] ResumeTask failed for taskId ${command.data}: ${errorMessage}`)
							// Don't rethrow - we want to prevent IPC server crashes.
							// The error is logged for debugging purposes.
						}
						break
					case types_1.TaskCommandName.SendMessage:
						this.log(`[API] SendMessage -> ${command.data.text}`)
						await this.sendMessage(command.data.text, command.data.images)
						break
					case types_1.TaskCommandName.GetCommands:
						try {
							const commands = await (0, commands_1.getCommands)(this.sidebarProvider.cwd)
							sendResponse(types_1.AliCodeEventName.CommandsResponse, [
								commands.map((cmd) => ({
									name: cmd.name,
									source: cmd.source,
									filePath: cmd.filePath,
									description: cmd.description,
									argumentHint: cmd.argumentHint,
								})),
							])
						} catch (error) {
							sendResponse(types_1.AliCodeEventName.CommandsResponse, [[]])
						}
						break
					case types_1.TaskCommandName.GetModes:
						try {
							const modes = await this.sidebarProvider.getModes()
							sendResponse(types_1.AliCodeEventName.ModesResponse, [modes])
						} catch (error) {
							sendResponse(types_1.AliCodeEventName.ModesResponse, [[]])
						}
						break
					case types_1.TaskCommandName.GetModels:
						try {
							const models = await (0, modelCache_1.getModels)({
								provider: "openrouter",
							})
							sendResponse(types_1.AliCodeEventName.ModelsResponse, [
								models || { [types_1.openRouterDefaultModelId]: {} },
							])
						} catch (error) {
							sendResponse(types_1.AliCodeEventName.ModelsResponse, [{}])
						}
						break
					case types_1.TaskCommandName.DeleteQueuedMessage:
						this.log(`[API] DeleteQueuedMessage -> ${command.data}`)
						try {
							this.deleteQueuedMessage(command.data)
						} catch (error) {
							const errorMessage = error instanceof Error ? error.message : String(error)
							this.log(`[API] DeleteQueuedMessage failed for messageId ${command.data}: ${errorMessage}`)
						}
						break
				}
			})
		}
	}
	emit(eventName, ...args) {
		const data = { eventName: eventName, payload: args }
		this.ipc?.broadcast({ type: types_1.IpcMessageType.TaskEvent, origin: types_1.IpcOrigin.Server, data })
		return super.emit(eventName, ...args)
	}
	async startNewTask({ configuration, text, images, newTab }) {
		let provider
		if (newTab) {
			await vscode.commands.executeCommand("workbench.action.files.revert")
			await vscode.commands.executeCommand("workbench.action.closeAllEditors")
			provider = await (0, registerCommands_1.openClineInNewTab)({
				context: this.context,
				outputChannel: this.outputChannel,
			})
			this.registerListeners(provider)
		} else {
			await vscode.commands.executeCommand(`${package_1.Package.name}.SidebarProvider.focus`)
			provider = this.sidebarProvider
		}
		await provider.removeClineFromStack()
		await provider.postStateToWebview()
		await provider.postMessageToWebview({ type: "action", action: "chatButtonClicked" })
		await provider.postMessageToWebview({ type: "invoke", invoke: "newChat", text, images })
		const options = {
			consecutiveMistakeLimit: Number.MAX_SAFE_INTEGER,
		}
		const task = await provider.createTask(text, images, undefined, options, configuration)
		if (!task) {
			throw new Error("Failed to create task due to policy restrictions")
		}
		return task.taskId
	}
	async resumeTask(taskId) {
		await vscode.commands.executeCommand(`${package_1.Package.name}.SidebarProvider.focus`)
		await this.waitForWebviewLaunch(5_000)
		const { historyItem } = await this.sidebarProvider.getTaskWithId(taskId)
		await this.sidebarProvider.createTaskWithHistoryItem(historyItem)
		if (this.sidebarProvider.viewLaunched) {
			await this.sidebarProvider.postMessageToWebview({ type: "action", action: "chatButtonClicked" })
		} else {
			this.log(
				`[API#resumeTask] webview not launched after resume for task ${taskId}; continuing in headless mode`,
			)
		}
	}
	async isTaskInHistory(taskId) {
		try {
			await this.sidebarProvider.getTaskWithId(taskId)
			return true
		} catch {
			return false
		}
	}
	getCurrentTaskStack() {
		return this.sidebarProvider.getCurrentTaskStack()
	}
	async clearCurrentTask(_lastMessage) {
		// Legacy finishSubTask removed; clear current by closing active task instance.
		await this.sidebarProvider.removeClineFromStack()
		await this.sidebarProvider.postStateToWebview()
	}
	async cancelCurrentTask() {
		await this.sidebarProvider.cancelTask()
	}
	async sendMessage(text, images) {
		const currentTask = this.sidebarProvider.getCurrentTask()
		// In headless/sandbox flows the webview may not be launched, so routing
		// through invoke=sendMessage drops the message. Deliver directly to the
		// task ask-response channel instead.
		if (!this.sidebarProvider.viewLaunched) {
			if (!currentTask) {
				this.log("[API#sendMessage] no current task in headless mode; message dropped")
				return
			}
			await currentTask.submitUserMessage(text ?? "", images)
			return
		}
		await this.sidebarProvider.postMessageToWebview({ type: "invoke", invoke: "sendMessage", text, images })
	}
	deleteQueuedMessage(messageId) {
		const currentTask = this.sidebarProvider.getCurrentTask()
		if (!currentTask) {
			this.log(`[API#deleteQueuedMessage] no current task; ignoring delete for messageId ${messageId}`)
			return
		}
		currentTask.messageQueueService.removeMessage(messageId)
	}
	async pressPrimaryButton() {
		await this.sidebarProvider.postMessageToWebview({ type: "invoke", invoke: "primaryButtonClick" })
	}
	async pressSecondaryButton() {
		await this.sidebarProvider.postMessageToWebview({ type: "invoke", invoke: "secondaryButtonClick" })
	}
	isReady() {
		return this.sidebarProvider.viewLaunched
	}
	async waitForWebviewLaunch(timeoutMs) {
		try {
			await (0, p_wait_for_1.default)(() => this.sidebarProvider.viewLaunched, {
				timeout: timeoutMs,
				interval: 50,
			})
			return true
		} catch {
			this.log(`[API#waitForWebviewLaunch] webview did not launch within ${timeoutMs}ms`)
			return false
		}
	}
	registerListeners(provider) {
		provider.on(types_1.AliCodeEventName.TaskCreated, (task) => {
			// Task Lifecycle
			task.on(types_1.AliCodeEventName.TaskStarted, async () => {
				this.emit(types_1.AliCodeEventName.TaskStarted, task.taskId)
				await this.fileLog(`[${new Date().toISOString()}] taskStarted -> ${task.taskId}\n`)
			})
			task.on(types_1.AliCodeEventName.TaskCompleted, async (_, tokenUsage, toolUsage) => {
				this.emit(types_1.AliCodeEventName.TaskCompleted, task.taskId, tokenUsage, toolUsage, {
					isSubtask: !!task.parentTaskId,
				})
				await this.fileLog(
					`[${new Date().toISOString()}] taskCompleted -> ${task.taskId} | ${JSON.stringify(tokenUsage, null, 2)} | ${JSON.stringify(toolUsage, null, 2)}\n`,
				)
			})
			task.on(types_1.AliCodeEventName.TaskAborted, () => {
				this.emit(types_1.AliCodeEventName.TaskAborted, task.taskId)
			})
			task.on(types_1.AliCodeEventName.TaskFocused, () => {
				this.emit(types_1.AliCodeEventName.TaskFocused, task.taskId)
			})
			task.on(types_1.AliCodeEventName.TaskUnfocused, () => {
				this.emit(types_1.AliCodeEventName.TaskUnfocused, task.taskId)
			})
			task.on(types_1.AliCodeEventName.TaskActive, () => {
				this.emit(types_1.AliCodeEventName.TaskActive, task.taskId)
			})
			task.on(types_1.AliCodeEventName.TaskInteractive, () => {
				this.emit(types_1.AliCodeEventName.TaskInteractive, task.taskId)
			})
			task.on(types_1.AliCodeEventName.TaskResumable, () => {
				this.emit(types_1.AliCodeEventName.TaskResumable, task.taskId)
			})
			task.on(types_1.AliCodeEventName.TaskIdle, () => {
				this.emit(types_1.AliCodeEventName.TaskIdle, task.taskId)
			})
			// Subtask Lifecycle
			task.on(types_1.AliCodeEventName.TaskPaused, () => {
				this.emit(types_1.AliCodeEventName.TaskPaused, task.taskId)
			})
			task.on(types_1.AliCodeEventName.TaskUnpaused, () => {
				this.emit(types_1.AliCodeEventName.TaskUnpaused, task.taskId)
			})
			task.on(types_1.AliCodeEventName.TaskSpawned, (childTaskId) => {
				this.emit(types_1.AliCodeEventName.TaskSpawned, task.taskId, childTaskId)
			})
			task.on(types_1.AliCodeEventName.TaskDelegated, (childTaskId) => {
				this.emit(types_1.AliCodeEventName.TaskDelegated, task.taskId, childTaskId)
			})
			task.on(types_1.AliCodeEventName.TaskDelegationCompleted, (childTaskId, summary) => {
				this.emit(types_1.AliCodeEventName.TaskDelegationCompleted, task.taskId, childTaskId, summary)
			})
			task.on(types_1.AliCodeEventName.TaskDelegationResumed, (childTaskId) => {
				this.emit(types_1.AliCodeEventName.TaskDelegationResumed, task.taskId, childTaskId)
			})
			// Task Execution
			task.on(types_1.AliCodeEventName.Message, async (message) => {
				this.emit(types_1.AliCodeEventName.Message, { taskId: task.taskId, ...message })
				if (message.message.partial !== true) {
					await this.fileLog(`[${new Date().toISOString()}] ${JSON.stringify(message.message, null, 2)}\n`)
				}
			})
			task.on(types_1.AliCodeEventName.TaskModeSwitched, (taskId, mode) => {
				this.emit(types_1.AliCodeEventName.TaskModeSwitched, taskId, mode)
			})
			task.on(types_1.AliCodeEventName.TaskAskResponded, () => {
				this.emit(types_1.AliCodeEventName.TaskAskResponded, task.taskId)
			})
			task.on(types_1.AliCodeEventName.QueuedMessagesUpdated, (taskId, messages) => {
				this.emit(types_1.AliCodeEventName.QueuedMessagesUpdated, taskId, messages)
			})
			// Task Analytics
			task.on(types_1.AliCodeEventName.TaskToolFailed, (taskId, tool, error) => {
				this.emit(types_1.AliCodeEventName.TaskToolFailed, taskId, tool, error)
			})
			task.on(types_1.AliCodeEventName.TaskTokenUsageUpdated, (_, tokenUsage, toolUsage) => {
				this.emit(types_1.AliCodeEventName.TaskTokenUsageUpdated, task.taskId, tokenUsage, toolUsage)
			})
			// Let's go!
			this.emit(types_1.AliCodeEventName.TaskCreated, task.taskId)
		})
	}
	// Logging
	outputChannelLog(...args) {
		for (const arg of args) {
			if (arg === null) {
				this.outputChannel.appendLine("null")
			} else if (arg === undefined) {
				this.outputChannel.appendLine("undefined")
			} else if (typeof arg === "string") {
				this.outputChannel.appendLine(arg)
			} else if (arg instanceof Error) {
				this.outputChannel.appendLine(`Error: ${arg.message}\n${arg.stack || ""}`)
			} else {
				try {
					this.outputChannel.appendLine(
						JSON.stringify(
							arg,
							(key, value) => {
								if (typeof value === "bigint") return `BigInt(${value})`
								if (typeof value === "function") return `Function: ${value.name || "anonymous"}`
								if (typeof value === "symbol") return value.toString()
								return value
							},
							2,
						),
					)
				} catch (error) {
					this.outputChannel.appendLine(`[Non-serializable object: ${Object.prototype.toString.call(arg)}]`)
				}
			}
		}
	}
	async fileLog(message) {
		if (!this.logfile) {
			return
		}
		try {
			await promises_1.default.appendFile(this.logfile, message, "utf8")
		} catch (_) {
			this.logfile = undefined
		}
	}
	// Global Settings Management
	getConfiguration() {
		return Object.fromEntries(
			Object.entries(this.sidebarProvider.getValues()).filter(([key]) => !(0, types_1.isSecretStateKey)(key)),
		)
	}
	async setConfiguration(values) {
		await this.sidebarProvider.contextProxy.setValues(values)
		await this.sidebarProvider.providerSettingsManager.saveConfig(values.currentApiConfigName || "default", values)
		await this.sidebarProvider.postStateToWebview()
	}
	// Provider Profile Management
	getProfiles() {
		return this.sidebarProvider.getProviderProfileEntries().map(({ name }) => name)
	}
	getProfileEntry(name) {
		return this.sidebarProvider.getProviderProfileEntry(name)
	}
	async createProfile(name, profile, activate = true) {
		const entry = this.getProfileEntry(name)
		if (entry) {
			throw new Error(`Profile with name "${name}" already exists`)
		}
		const id = await this.sidebarProvider.upsertProviderProfile(name, profile ?? {}, activate)
		if (!id) {
			throw new Error(`Failed to create profile with name "${name}"`)
		}
		return id
	}
	async updateProfile(name, profile, activate = true) {
		const entry = this.getProfileEntry(name)
		if (!entry) {
			throw new Error(`Profile with name "${name}" does not exist`)
		}
		const id = await this.sidebarProvider.upsertProviderProfile(name, profile, activate)
		if (!id) {
			throw new Error(`Failed to update profile with name "${name}"`)
		}
		return id
	}
	async upsertProfile(name, profile, activate = true) {
		const id = await this.sidebarProvider.upsertProviderProfile(name, profile, activate)
		if (!id) {
			throw new Error(`Failed to upsert profile with name "${name}"`)
		}
		return id
	}
	async deleteProfile(name) {
		const entry = this.getProfileEntry(name)
		if (!entry) {
			throw new Error(`Profile with name "${name}" does not exist`)
		}
		await this.sidebarProvider.deleteProviderProfile(entry)
	}
	getActiveProfile() {
		return this.getConfiguration().currentApiConfigName
	}
	async setActiveProfile(name) {
		const entry = this.getProfileEntry(name)
		if (!entry) {
			throw new Error(`Profile with name "${name}" does not exist`)
		}
		await this.sidebarProvider.activateProviderProfile({ name })
		return this.getActiveProfile()
	}
}
exports.API = API
