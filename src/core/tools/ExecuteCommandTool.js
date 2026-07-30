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
exports.executeCommandTool = exports.ExecuteCommandTool = void 0
exports.resolveAgentTimeoutMs = resolveAgentTimeoutMs
exports.executeCommandInTerminal = executeCommandInTerminal
const promises_1 = __importDefault(require("fs/promises"))
const path = __importStar(require("path"))
const vscode = __importStar(require("vscode"))
const delay_1 = __importDefault(require("delay"))
const types_1 = require("@ali-code/types")
const responses_1 = require("../prompts/responses")
const text_normalization_1 = require("../../utils/text-normalization")
const TerminalRegistry_1 = require("../../integrations/terminal/TerminalRegistry")
const Terminal_1 = require("../../integrations/terminal/Terminal")
const OutputInterceptor_1 = require("../../integrations/terminal/OutputInterceptor")
const package_1 = require("../../shared/package")
const i18n_1 = require("../../i18n")
const storage_1 = require("../../utils/storage")
const BaseTool_1 = require("./BaseTool")
class ShellIntegrationError extends Error {}
function resolveAgentTimeoutMs(timeoutSeconds) {
	const requestedAgentTimeout = typeof timeoutSeconds === "number" && timeoutSeconds > 0 ? timeoutSeconds * 1000 : 0
	// In CLI runtime, stdin harnesses expect command lifetime to be governed
	// solely by commandExecutionTimeout (user setting), not model-provided
	// background timeouts.
	return process.env.ROO_CLI_RUNTIME === "1" ? 0 : requestedAgentTimeout
}
class ExecuteCommandTool extends BaseTool_1.BaseTool {
	name = "execute_command"
	async execute(params, task, callbacks) {
		const { command, cwd: customCwd, timeout: timeoutSeconds } = params
		const { handleError, pushToolResult, askApproval } = callbacks
		try {
			if (!command) {
				task.consecutiveMistakeCount++
				task.recordToolError("execute_command")
				pushToolResult(await task.sayAndCreateMissingParamError("execute_command", "command"))
				return
			}
			const canonicalCommand = (0, text_normalization_1.unescapeHtmlEntities)(command)
			const ignoredFileAttemptedToAccess = task.aliIgnoreController?.validateCommand(canonicalCommand)
			if (ignoredFileAttemptedToAccess) {
				await task.say("rooignore_error", ignoredFileAttemptedToAccess)
				pushToolResult(responses_1.formatResponse.rooIgnoreError(ignoredFileAttemptedToAccess))
				return
			}
			task.consecutiveMistakeCount = 0
			const didApprove = await askApproval("command", canonicalCommand)
			if (!didApprove) {
				return
			}
			const executionId = task.lastMessageTs?.toString() ?? Date.now().toString()
			const provider = await task.providerRef.deref()
			const providerState = await provider?.getState()
			const { terminalShellIntegrationDisabled = true } = providerState ?? {}
			// Get command execution timeout from VSCode configuration (in seconds)
			const commandExecutionTimeoutSeconds = vscode.workspace
				.getConfiguration(package_1.Package.name)
				.get("commandExecutionTimeout", 0)
			// Get command timeout allowlist from VSCode configuration
			const commandTimeoutAllowlist = vscode.workspace
				.getConfiguration(package_1.Package.name)
				.get("commandTimeoutAllowlist", [])
			// Check if command matches any prefix in the allowlist
			const isCommandAllowlisted = commandTimeoutAllowlist.some((prefix) =>
				canonicalCommand.startsWith(prefix.trim()),
			)
			// Convert seconds to milliseconds for internal use, but skip timeout if command is allowlisted
			const commandExecutionTimeout = isCommandAllowlisted ? 0 : commandExecutionTimeoutSeconds * 1000
			// Convert agent-specified timeout from seconds to milliseconds
			const agentTimeout = resolveAgentTimeoutMs(timeoutSeconds)
			const options = {
				executionId,
				command: canonicalCommand,
				customCwd,
				terminalShellIntegrationDisabled,
				commandExecutionTimeout,
				agentTimeout,
			}
			try {
				const [rejected, result] = await executeCommandInTerminal(task, options)
				if (rejected) {
					task.didRejectTool = true
				}
				pushToolResult(result)
			} catch (error) {
				const status = { executionId, status: "fallback" }
				provider?.postMessageToWebview({ type: "commandExecutionStatus", text: JSON.stringify(status) })
				await task.say("shell_integration_warning")
				// Invalidate pending ask from first execution to prevent race condition
				task.supersedePendingAsk()
				if (error instanceof ShellIntegrationError) {
					const [rejected, result] = await executeCommandInTerminal(task, {
						...options,
						terminalShellIntegrationDisabled: true,
					})
					if (rejected) {
						task.didRejectTool = true
					}
					pushToolResult(result)
				} else {
					pushToolResult(`Command failed to execute in terminal due to a shell integration error.`)
				}
			}
			return
		} catch (error) {
			await handleError("executing command", error)
			return
		}
	}
	async handlePartial(task, block) {
		const command = block.params.command
		await task.ask("command", command ?? "", block.partial).catch(() => {})
	}
}
exports.ExecuteCommandTool = ExecuteCommandTool
async function executeCommandInTerminal(
	task,
	{
		executionId,
		command,
		customCwd,
		terminalShellIntegrationDisabled = true,
		commandExecutionTimeout = 0,
		agentTimeout = 0,
	},
) {
	// Convert milliseconds back to seconds for display purposes.
	const commandExecutionTimeoutSeconds = commandExecutionTimeout / 1000
	let workingDir
	if (!customCwd) {
		workingDir = task.cwd
	} else if (path.isAbsolute(customCwd)) {
		workingDir = customCwd
	} else {
		workingDir = path.resolve(task.cwd, customCwd)
	}
	try {
		await promises_1.default.access(workingDir)
	} catch (error) {
		return [false, `Working directory '${workingDir}' does not exist.`]
	}
	let message
	let runInBackground = false
	let completed = false
	let result = ""
	let persistedResult
	let exitDetails
	let shellIntegrationError
	let hasAskedForCommandOutput = false
	const terminalProvider = terminalShellIntegrationDisabled ? "execa" : "vscode"
	const provider = await task.providerRef.deref()
	// Get global storage path for persisted output artifacts
	const globalStoragePath = provider?.context?.globalStorageUri?.fsPath
	let interceptor
	// Create OutputInterceptor if we have storage available
	if (globalStoragePath) {
		const taskDir = await (0, storage_1.getTaskDirectoryPath)(globalStoragePath, task.taskId)
		const storageDir = path.join(taskDir, "command-output")
		const providerState = await provider?.getState()
		const terminalOutputPreviewSize =
			providerState?.terminalOutputPreviewSize ?? types_1.DEFAULT_TERMINAL_OUTPUT_PREVIEW_SIZE
		interceptor = new OutputInterceptor_1.OutputInterceptor({
			executionId,
			taskId: task.taskId,
			command,
			storageDir,
			previewSize: terminalOutputPreviewSize,
		})
	}
	let accumulatedOutput = ""
	// Bound accumulated output buffer size to prevent unbounded memory growth for long-running commands.
	// The interceptor preserves full output; this buffer is only for UI display (100KB limit).
	const maxAccumulatedOutputSize = 100_000
	const commandOutputStreamThrottleMs = 150
	let latestCompressedOutput = ""
	let lastQueuedCommandOutput = ""
	let lastCommandOutputEmitAt = 0
	let pendingCommandOutputEmitTimer
	let commandOutputSayChain = Promise.resolve()
	const queueCommandOutputMessage = (text, partial, force = false) => {
		if (!force && text === lastQueuedCommandOutput) {
			return commandOutputSayChain
		}
		lastQueuedCommandOutput = text
		commandOutputSayChain = commandOutputSayChain
			.then(async () => {
				await task.say("command_output", text, undefined, partial, undefined, undefined, {
					isNonInteractive: true,
				})
			})
			.catch((error) => {
				console.error("[ExecuteCommandTool] Failed to publish command output:", error)
			})
		return commandOutputSayChain
	}
	const schedulePartialCommandOutputUpdate = () => {
		if (!latestCompressedOutput || completed) {
			return
		}
		const emitUpdate = () => {
			pendingCommandOutputEmitTimer = undefined
			lastCommandOutputEmitAt = Date.now()
			void queueCommandOutputMessage(latestCompressedOutput, true)
		}
		const elapsed = Date.now() - lastCommandOutputEmitAt
		if (elapsed >= commandOutputStreamThrottleMs) {
			emitUpdate()
			return
		}
		if (!pendingCommandOutputEmitTimer) {
			pendingCommandOutputEmitTimer = setTimeout(emitUpdate, commandOutputStreamThrottleMs - elapsed)
		}
	}
	// Track when onCompleted callback finishes to avoid race condition.
	// The callback is async but Terminal/ExecaTerminal don't await it, so we track completion
	// explicitly to ensure persistedResult is set before we use it.
	let onCompletedPromise
	let resolveOnCompleted
	onCompletedPromise = new Promise((resolve) => {
		resolveOnCompleted = resolve
	})
	const callbacks = {
		onLine: async (lines, process) => {
			accumulatedOutput += lines
			// Trim accumulated output to prevent unbounded memory growth
			if (accumulatedOutput.length > maxAccumulatedOutputSize) {
				accumulatedOutput = accumulatedOutput.slice(-maxAccumulatedOutputSize)
			}
			// Write to interceptor for persisted output
			interceptor?.write(lines)
			// Continue sending compressed output to webview for UI display (unchanged behavior)
			const compressedOutput = Terminal_1.Terminal.compressTerminalOutput(accumulatedOutput)
			latestCompressedOutput = compressedOutput
			const status = { executionId, status: "output", output: compressedOutput }
			provider?.postMessageToWebview({ type: "commandExecutionStatus", text: JSON.stringify(status) })
			schedulePartialCommandOutputUpdate()
			if (runInBackground || hasAskedForCommandOutput) {
				return
			}
			// Mark that we've asked to prevent multiple concurrent asks
			hasAskedForCommandOutput = true
			try {
				const { response, text, images } = await task.ask("command_output", "")
				runInBackground = true
				if (response === "messageResponse") {
					message = { text, images }
					process.continue()
				}
			} catch (_error) {
				// Silently handle ask errors (e.g., "Current ask promise was ignored")
			}
		},
		onCompleted: async (output) => {
			try {
				clearTimeout(pendingCommandOutputEmitTimer)
				pendingCommandOutputEmitTimer = undefined
				// Finalize interceptor and get persisted result.
				// We await finalize() to ensure the artifact file is fully flushed
				// before we advertise the artifact_id to the LLM.
				if (interceptor) {
					persistedResult = await interceptor.finalize()
				}
				// Continue using compressed output for UI display
				result = Terminal_1.Terminal.compressTerminalOutput(output ?? "")
				latestCompressedOutput = result
				// Preserve order: wait for queued partial updates, then emit the final
				// non-partial command_output update.
				await commandOutputSayChain
				await queueCommandOutputMessage(result, false, true)
				completed = true
			} finally {
				// Signal that onCompleted has finished, so the main code can safely use persistedResult
				resolveOnCompleted?.()
			}
		},
		onShellExecutionStarted: (pid) => {
			const status = { executionId, status: "started", pid, command }
			provider?.postMessageToWebview({ type: "commandExecutionStatus", text: JSON.stringify(status) })
		},
		onShellExecutionComplete: (details) => {
			const status = { executionId, status: "exited", exitCode: details.exitCode }
			provider?.postMessageToWebview({ type: "commandExecutionStatus", text: JSON.stringify(status) })
			exitDetails = details
		},
	}
	const terminal = await TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal(
		workingDir,
		task.taskId,
		terminalProvider,
	)
	if (terminal instanceof Terminal_1.Terminal) {
		terminal.terminal.show(true)
		// Update the working directory in case the terminal we asked for has
		// a different working directory so that the model will know where the
		// command actually executed.
		workingDir = terminal.getCurrentWorkingDirectory()
	}
	const process = terminal.runCommand(command, callbacks)
	task.terminalProcess = process
	// Dual-timeout logic:
	// - Agent timeout: transitions the command to background (continues running)
	// - User timeout: aborts the command (kills it)
	// Both timers run independently — the user timeout remains active as a safety net
	// even after the agent timeout moves the command to the background.
	let agentTimeoutId
	let userTimeoutId
	let isUserTimedOut = false
	try {
		const racers = [process]
		// Agent timeout: transition to background (command keeps running)
		if (agentTimeout > 0) {
			racers.push(
				new Promise((resolve) => {
					agentTimeoutId = setTimeout(() => {
						runInBackground = true
						process.continue()
						task.supersedePendingAsk()
						resolve()
					}, agentTimeout)
				}),
			)
		}
		// User timeout: abort the command (existing behavior)
		if (commandExecutionTimeout > 0) {
			racers.push(
				new Promise((_, reject) => {
					userTimeoutId = setTimeout(() => {
						isUserTimedOut = true
						task.terminalProcess?.abort()
						reject(new Error(`Command execution timed out after ${commandExecutionTimeout}ms`))
					}, commandExecutionTimeout)
				}),
			)
		}
		await Promise.race(racers)
	} catch (error) {
		if (isUserTimedOut) {
			const status = { executionId, status: "timeout" }
			provider?.postMessageToWebview({ type: "commandExecutionStatus", text: JSON.stringify(status) })
			await task.say(
				"error",
				(0, i18n_1.t)("common:errors:command_timeout", { seconds: commandExecutionTimeoutSeconds }),
			)
			task.didToolFailInCurrentTurn = true
			task.terminalProcess = undefined
			return [
				false,
				`The command was terminated after exceeding a user-configured ${commandExecutionTimeoutSeconds}s timeout. Do not try to re-run the command.`,
			]
		}
		throw error
	} finally {
		clearTimeout(agentTimeoutId)
		clearTimeout(userTimeoutId)
		clearTimeout(pendingCommandOutputEmitTimer)
		task.terminalProcess = undefined
	}
	if (shellIntegrationError) {
		throw new ShellIntegrationError(shellIntegrationError)
	}
	// Wait for a short delay to ensure all messages are sent to the webview.
	// This delay allows time for non-awaited promises to be created and
	// for their associated messages to be sent to the webview, maintaining
	// the correct order of messages (although the webview is smart about
	// grouping command_output messages despite any gaps anyways).
	await (0, delay_1.default)(50)
	// Wait for onCompleted callback to finish if shell execution completed.
	// This ensures persistedResult is set before we try to use it, fixing the race
	// condition where exitDetails is set (sync) before the async onCompleted finishes.
	if (exitDetails && onCompletedPromise) {
		await onCompletedPromise
	}
	if (message) {
		const { text, images } = message
		await task.say("user_feedback", text, images)
		return [
			true,
			responses_1.formatResponse.toolResult(
				[
					`Command is still running in terminal from '${terminal.getCurrentWorkingDirectory().toPosix()}'.`,
					result.length > 0 ? `Here's the output so far:\n${result}\n` : "\n",
					`<user_message>\n${text}\n</user_message>`,
				].join("\n"),
				images,
			),
		]
	} else if (completed || exitDetails) {
		const currentWorkingDir = terminal.getCurrentWorkingDirectory().toPosix()
		// Use persisted output format when output was truncated and spilled to disk
		if (persistedResult?.truncated) {
			return [false, formatPersistedOutput(persistedResult, exitDetails, currentWorkingDir)]
		}
		// Use inline format for small outputs (original behavior with exit status)
		let exitStatus = ""
		if (exitDetails !== undefined) {
			if (exitDetails.signalName) {
				exitStatus = `Process terminated by signal ${exitDetails.signalName}`
				if (exitDetails.coreDumpPossible) {
					exitStatus += " - core dump possible"
				}
			} else if (exitDetails.exitCode === undefined) {
				result += "<VSCE exit code is undefined: terminal output and command execution status is unknown.>"
				exitStatus = `Exit code: <undefined, notify user>`
			} else {
				if (exitDetails.exitCode !== 0) {
					exitStatus += "Command execution was not successful, inspect the cause and adjust as needed.\n"
				}
				exitStatus += `Exit code: ${exitDetails.exitCode}`
			}
		} else {
			result += "<VSCE exitDetails == undefined: terminal output and command execution status is unknown.>"
			exitStatus = `Exit code: <undefined, notify user>`
		}
		return [
			false,
			`Command executed in terminal within working directory '${currentWorkingDir}'. ${exitStatus}\nOutput:\n${result}`,
		]
	} else {
		return [
			false,
			[
				`Command is still running in terminal ${workingDir ? ` from '${workingDir.toPosix()}'` : ""}.`,
				result.length > 0 ? `Here's the output so far:\n${result}\n` : "\n",
				"You will be updated on the terminal status and new output in the future.",
			].join("\n"),
		]
	}
}
/**
 * Format exit status from ExitCodeDetails
 */
function formatExitStatus(exitDetails) {
	if (exitDetails === undefined) {
		return "Exit code: <undefined, notify user>"
	}
	if (exitDetails.signalName) {
		let status = `Process terminated by signal ${exitDetails.signalName}`
		if (exitDetails.coreDumpPossible) {
			status += " - core dump possible"
		}
		return status
	}
	if (exitDetails.exitCode === undefined) {
		return "Exit code: <undefined, notify user>"
	}
	let status = ""
	if (exitDetails.exitCode !== 0) {
		status += "Command execution was not successful, inspect the cause and adjust as needed.\n"
	}
	status += `Exit code: ${exitDetails.exitCode}`
	return status
}
/**
 * Format persisted output result for tool response when output was truncated
 */
function formatPersistedOutput(result, exitDetails, workingDir) {
	const exitStatus = formatExitStatus(exitDetails)
	const sizeStr = formatBytes(result.totalBytes)
	const artifactId = result.artifactPath ? path.basename(result.artifactPath) : ""
	return [
		`Command executed in '${workingDir}'. ${exitStatus}`,
		"",
		`Output (${sizeStr}) persisted. Artifact ID: ${artifactId}`,
		"",
		"Preview:",
		result.preview,
		"",
		"Use read_command_output tool to view full output if needed.",
	].join("\n")
}
/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
	if (bytes < 1024) {
		return `${bytes}B`
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)}KB`
	}
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
exports.executeCommandTool = new ExecuteCommandTool()
