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
exports.getCheckpointService = getCheckpointService
exports.checkpointSave = checkpointSave
exports.checkpointRestore = checkpointRestore
exports.checkpointDiff = checkpointDiff
const p_wait_for_1 = __importDefault(require("p-wait-for"))
const vscode = __importStar(require("vscode"))
const path_1 = require("../../utils/path")
const git_1 = require("../../utils/git")
const i18n_1 = require("../../i18n")
const getApiMetrics_1 = require("../../shared/getApiMetrics")
const DiffViewProvider_1 = require("../../integrations/editor/DiffViewProvider")
const checkpoints_1 = require("../../services/checkpoints")
const WARNING_THRESHOLD_MS = 5000
function sendCheckpointInitWarn(task, type, timeout) {
	task.providerRef.deref()?.postMessageToWebview({
		type: "checkpointInitWarning",
		checkpointWarning: type && timeout ? { type, timeout } : undefined,
	})
}
async function getCheckpointService(task, { interval = 250 } = {}) {
	if (!task.enableCheckpoints) {
		return undefined
	}
	if (task.checkpointService) {
		return task.checkpointService
	}
	const provider = task.providerRef.deref()
	// Get checkpoint timeout from task settings (converted to milliseconds)
	const checkpointTimeoutMs = task.checkpointTimeout * 1000
	const log = (message) => {
		console.log(message)
		try {
			provider?.log(message)
		} catch (err) {
			// NO-OP
		}
	}
	console.log("[Task#getCheckpointService] initializing checkpoints service")
	try {
		const workspaceDir = task.cwd || (0, path_1.getWorkspacePath)()
		if (!workspaceDir) {
			log("[Task#getCheckpointService] workspace folder not found, disabling checkpoints")
			task.enableCheckpoints = false
			return undefined
		}
		const globalStorageDir = provider?.context.globalStorageUri.fsPath
		if (!globalStorageDir) {
			log("[Task#getCheckpointService] globalStorageDir not found, disabling checkpoints")
			task.enableCheckpoints = false
			return undefined
		}
		const options = {
			taskId: task.taskId,
			workspaceDir,
			shadowDir: globalStorageDir,
			log,
		}
		if (task.checkpointServiceInitializing) {
			const checkpointInitStartTime = Date.now()
			let warningShown = false
			await (0, p_wait_for_1.default)(
				() => {
					const elapsed = Date.now() - checkpointInitStartTime
					// Show warning if we're past the threshold and haven't shown it yet
					if (!warningShown && elapsed >= WARNING_THRESHOLD_MS) {
						warningShown = true
						sendCheckpointInitWarn(task, "WAIT_TIMEOUT", WARNING_THRESHOLD_MS / 1000)
					}
					console.log(
						`[Task#getCheckpointService] waiting for service to initialize (${Math.round(elapsed / 1000)}s)`,
					)
					return !!task.checkpointService && !!task?.checkpointService?.isInitialized
				},
				{ interval, timeout: checkpointTimeoutMs },
			)
			if (!task?.checkpointService) {
				sendCheckpointInitWarn(task, "INIT_TIMEOUT", task.checkpointTimeout)
				task.enableCheckpoints = false
				return undefined
			} else {
				sendCheckpointInitWarn(task)
			}
			return task.checkpointService
		}
		if (!task.enableCheckpoints) {
			return undefined
		}
		const service = checkpoints_1.RepoPerTaskCheckpointService.create(options)
		task.checkpointServiceInitializing = true
		await checkGitInstallation(task, service, log, provider)
		task.checkpointService = service
		if (task.enableCheckpoints) {
			sendCheckpointInitWarn(task)
		}
		return service
	} catch (err) {
		if (err.name === "TimeoutError" && task.enableCheckpoints) {
			sendCheckpointInitWarn(task, "INIT_TIMEOUT", task.checkpointTimeout)
		}
		log(`[Task#getCheckpointService] ${err.message}`)
		task.enableCheckpoints = false
		task.checkpointServiceInitializing = false
		return undefined
	}
}
async function checkGitInstallation(task, service, log, provider) {
	try {
		const gitInstalled = await (0, git_1.checkGitInstalled)()
		if (!gitInstalled) {
			log("[Task#getCheckpointService] Git is not installed, disabling checkpoints")
			task.enableCheckpoints = false
			task.checkpointServiceInitializing = false
			// Show user-friendly notification
			const selection = await vscode.window.showWarningMessage(
				(0, i18n_1.t)("common:errors.git_not_installed"),
				(0, i18n_1.t)("common:buttons.learn_more"),
			)
			if (selection === (0, i18n_1.t)("common:buttons.learn_more")) {
				await vscode.env.openExternal(vscode.Uri.parse("https://git-scm.com/downloads"))
			}
			return
		}
		// Git is installed, proceed with initialization
		service.on("initialize", () => {
			log("[Task#getCheckpointService] service initialized")
			task.checkpointServiceInitializing = false
		})
		service.on("checkpoint", ({ fromHash: from, toHash: to, suppressMessage }) => {
			try {
				sendCheckpointInitWarn(task)
				// Always update the current checkpoint hash in the webview, including the suppress flag
				provider?.postMessageToWebview({
					type: "currentCheckpointUpdated",
					text: to,
					suppressMessage: !!suppressMessage,
				})
				// Always create the chat message but include the suppress flag in the payload
				// so the chatview can choose not to render it while keeping it in history.
				task.say(
					"checkpoint_saved",
					to,
					undefined,
					undefined,
					{ from, to, suppressMessage: !!suppressMessage },
					undefined,
					{ isNonInteractive: true },
				).catch((err) => {
					log("[Task#getCheckpointService] caught unexpected error in say('checkpoint_saved')")
					console.error(err)
				})
			} catch (err) {
				log("[Task#getCheckpointService] caught unexpected error in on('checkpoint'), disabling checkpoints")
				console.error(err)
				task.enableCheckpoints = false
			}
		})
		log("[Task#getCheckpointService] initializing shadow git")
		try {
			await service.initShadowGit()
		} catch (err) {
			log(`[Task#getCheckpointService] initShadowGit -> ${err.message}`)
			task.enableCheckpoints = false
		}
	} catch (err) {
		log(`[Task#getCheckpointService] Unexpected error during Git check: ${err.message}`)
		console.error("Git check error:", err)
		task.enableCheckpoints = false
		task.checkpointServiceInitializing = false
	}
}
async function checkpointSave(task, force = false, suppressMessage = false) {
	const service = await getCheckpointService(task)
	if (!service) {
		return
	}
	// Start the checkpoint process in the background.
	return service
		.saveCheckpoint(`Task: ${task.taskId}, Time: ${Date.now()}`, { allowEmpty: force, suppressMessage })
		.catch((err) => {
			console.error("[Task#checkpointSave] caught unexpected error, disabling checkpoints", err)
			task.enableCheckpoints = false
		})
}
async function checkpointRestore(task, { ts, commitHash, mode, operation = "delete" }) {
	const service = await getCheckpointService(task)
	if (!service) {
		return
	}
	const index = task.clineMessages.findIndex((m) => m.ts === ts)
	if (index === -1) {
		return
	}
	const provider = task.providerRef.deref()
	try {
		await service.restoreCheckpoint(commitHash)
		await provider?.postMessageToWebview({ type: "currentCheckpointUpdated", text: commitHash })
		if (mode === "restore") {
			// Calculate metrics from messages that will be deleted (must be done before rewind)
			const deletedMessages = task.clineMessages.slice(index + 1)
			const { totalTokensIn, totalTokensOut, totalCacheWrites, totalCacheReads, totalCost } = (0,
			getApiMetrics_1.getApiMetrics)(task.combineMessages(deletedMessages))
			// Use MessageManager to properly handle context-management events
			// This ensures orphaned Summary messages and truncation markers are cleaned up
			await task.messageManager.rewindToTimestamp(ts, {
				includeTargetMessage: operation === "edit",
			})
			// Report the deleted API request metrics
			await task.say(
				"api_req_deleted",
				JSON.stringify({
					tokensIn: totalTokensIn,
					tokensOut: totalTokensOut,
					cacheWrites: totalCacheWrites,
					cacheReads: totalCacheReads,
					cost: totalCost,
				}),
			)
		}
		// The task is already cancelled by the provider beforehand, but we
		// need to re-init to get the updated messages.
		//
		// This was taken from Cline's implementation of the checkpoints
		// feature. The task instance will hang if we don't cancel twice,
		// so this is currently necessary, but it seems like a complicated
		// and hacky solution to a problem that I don't fully understand.
		// I'd like to revisit this in the future and try to improve the
		// task flow and the communication between the webview and the
		// `Task` instance.
		provider?.cancelTask()
	} catch (err) {
		provider?.log("[checkpointRestore] disabling checkpoints for this task")
		task.enableCheckpoints = false
	}
}
async function checkpointDiff(task, { ts, previousCommitHash, commitHash, mode }) {
	const service = await getCheckpointService(task)
	if (!service) {
		return
	}
	let fromHash
	let toHash
	let title
	const checkpoints = task.clineMessages.filter(({ say }) => say === "checkpoint_saved").map(({ text }) => text)
	if (["from-init", "full"].includes(mode) && checkpoints.length < 1) {
		vscode.window.showInformationMessage((0, i18n_1.t)("common:errors.checkpoint_no_first"))
		return
	}
	const idx = checkpoints.indexOf(commitHash)
	switch (mode) {
		case "checkpoint":
			fromHash = commitHash
			toHash = idx !== -1 && idx < checkpoints.length - 1 ? checkpoints[idx + 1] : undefined
			title = (0, i18n_1.t)("common:errors.checkpoint_diff_with_next")
			break
		case "from-init":
			fromHash = checkpoints[0]
			toHash = commitHash
			title = (0, i18n_1.t)("common:errors.checkpoint_diff_since_first")
			break
		case "to-current":
			fromHash = commitHash
			toHash = undefined
			title = (0, i18n_1.t)("common:errors.checkpoint_diff_to_current")
			break
		case "full":
			fromHash = checkpoints[0]
			toHash = undefined
			title = (0, i18n_1.t)("common:errors.checkpoint_diff_since_first")
			break
	}
	if (!fromHash) {
		vscode.window.showInformationMessage((0, i18n_1.t)("common:errors.checkpoint_no_previous"))
		return
	}
	try {
		const changes = await service.getDiff({ from: fromHash, to: toHash })
		if (!changes?.length) {
			vscode.window.showInformationMessage((0, i18n_1.t)("common:errors.checkpoint_no_changes"))
			return
		}
		await vscode.commands.executeCommand(
			"vscode.changes",
			title,
			changes.map((change) => [
				vscode.Uri.file(change.paths.absolute),
				vscode.Uri.parse(`${DiffViewProvider_1.DIFF_VIEW_URI_SCHEME}:${change.paths.relative}`).with({
					query: Buffer.from(change.content.before ?? "").toString("base64"),
				}),
				vscode.Uri.parse(`${DiffViewProvider_1.DIFF_VIEW_URI_SCHEME}:${change.paths.relative}`).with({
					query: Buffer.from(change.content.after ?? "").toString("base64"),
				}),
			]),
		)
	} catch (err) {
		const provider = task.providerRef.deref()
		provider?.log("[checkpointDiff] disabling checkpoints for this task")
		task.enableCheckpoints = false
	}
}
