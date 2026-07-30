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
Object.defineProperty(exports, "__esModule", { value: true })
exports.TerminalRegistry = void 0
const vscode = __importStar(require("vscode"))
const path_1 = require("../../utils/path")
const TerminalProcess_1 = require("./TerminalProcess")
const Terminal_1 = require("./Terminal")
const ExecaTerminal_1 = require("./ExecaTerminal")
const ShellIntegrationManager_1 = require("./ShellIntegrationManager")
// Although vscode.window.terminals provides a list of all open terminals,
// there's no way to know whether they're busy or not (exitStatus does not
// provide useful information for most commands). In order to prevent creating
// too many terminals, we need to keep track of terminals through the life of
// the extension, as well as session specific terminals for the life of a task
// (to get latest unretrieved output).
// Since we have promises keeping track of terminal processes, we get the added
// benefit of keep track of busy terminals even after a task is closed.
class TerminalRegistry {
	static terminals = []
	static nextTerminalId = 1
	static disposables = []
	static isInitialized = false
	static initialize() {
		if (this.isInitialized) {
			throw new Error("TerminalRegistry.initialize() should only be called once")
		}
		this.isInitialized = true
		// TODO: This initialization code is VSCode specific, and therefore
		// should probably live elsewhere.
		// Register handler for terminal close events to clean up temporary
		// directories.
		const closeDisposable = vscode.window.onDidCloseTerminal((vsceTerminal) => {
			const terminal = this.getTerminalByVSCETerminal(vsceTerminal)
			if (terminal) {
				ShellIntegrationManager_1.ShellIntegrationManager.zshCleanupTmpDir(terminal.id)
			}
		})
		this.disposables.push(closeDisposable)
		try {
			const startDisposable = vscode.window.onDidStartTerminalShellExecution?.(async (e) => {
				// Get a handle to the stream as early as possible:
				const stream = e.execution.read()
				const terminal = this.getTerminalByVSCETerminal(e.terminal)
				console.info("[onDidStartTerminalShellExecution]", {
					command: e.execution?.commandLine?.value,
					terminalId: terminal?.id,
				})
				if (terminal) {
					terminal.setActiveStream(stream)
					terminal.busy = true // Mark terminal as busy when shell execution starts
				} else {
					console.error(
						"[onDidStartTerminalShellExecution] Shell execution started, but not from a Ali-registered terminal:",
						e,
					)
				}
			})
			if (startDisposable) {
				this.disposables.push(startDisposable)
			}
			const endDisposable = vscode.window.onDidEndTerminalShellExecution?.(async (e) => {
				const terminal = this.getTerminalByVSCETerminal(e.terminal)
				const process = terminal?.process
				const exitDetails = TerminalProcess_1.TerminalProcess.interpretExitCode(e.exitCode)
				console.info("[onDidEndTerminalShellExecution]", {
					command: e.execution?.commandLine?.value,
					terminalId: terminal?.id,
					...exitDetails,
				})
				if (!terminal) {
					console.error(
						"[onDidEndTerminalShellExecution] Shell execution ended, but not from a Ali-registered terminal:",
						e,
					)
					return
				}
				if (!terminal.running) {
					console.error(
						"[TerminalRegistry] Shell execution end event received, but process is not running for terminal:",
						{ terminalId: terminal?.id, command: process?.command, exitCode: e.exitCode },
					)
					terminal.busy = false
					return
				}
				if (!process) {
					console.error(
						"[TerminalRegistry] Shell execution end event received on running terminal, but process is undefined:",
						{ terminalId: terminal.id, exitCode: e.exitCode },
					)
					return
				}
				// Signal completion to any waiting processes.
				terminal.shellExecutionComplete(exitDetails)
				terminal.busy = false // Mark terminal as not busy when shell execution ends
			})
			if (endDisposable) {
				this.disposables.push(endDisposable)
			}
		} catch (error) {
			console.error("[TerminalRegistry] Error setting up shell execution handlers:", error)
		}
	}
	static createTerminal(cwd, provider) {
		let newTerminal
		if (provider === "vscode") {
			newTerminal = new Terminal_1.Terminal(this.nextTerminalId++, undefined, cwd)
		} else {
			newTerminal = new ExecaTerminal_1.ExecaTerminal(this.nextTerminalId++, cwd)
		}
		this.terminals.push(newTerminal)
		return newTerminal
	}
	/**
	 * Gets an existing terminal or creates a new one for the given working
	 * directory.
	 *
	 * @param cwd The working directory path
	 * @param taskId Optional task ID to associate with the terminal
	 * @returns A Terminal instance
	 */
	static async getOrCreateTerminal(cwd, taskId, provider = "vscode") {
		const terminals = this.getAllTerminals()
		let terminal
		// First priority: Find a terminal already assigned to this task with
		// matching directory.
		if (taskId) {
			terminal = terminals.find((t) => {
				if (t.busy || t.taskId !== taskId || t.provider !== provider) {
					return false
				}
				const terminalCwd = t.getCurrentWorkingDirectory()
				if (!terminalCwd) {
					return false
				}
				return (0, path_1.arePathsEqual)(vscode.Uri.file(cwd).fsPath, terminalCwd)
			})
		}
		// Second priority: Find any available terminal with matching directory.
		if (!terminal) {
			terminal = terminals.find((t) => {
				if (t.busy || t.provider !== provider) {
					return false
				}
				const terminalCwd = t.getCurrentWorkingDirectory()
				if (!terminalCwd) {
					return false
				}
				return (0, path_1.arePathsEqual)(vscode.Uri.file(cwd).fsPath, terminalCwd)
			})
		}
		// If no suitable terminal found, create a new one.
		if (!terminal) {
			terminal = this.createTerminal(cwd, provider)
		}
		terminal.taskId = taskId
		return terminal
	}
	/**
	 * Gets unretrieved output from a terminal process.
	 *
	 * @param id The terminal ID
	 * @returns The unretrieved output as a string, or empty string if terminal not found
	 */
	static getUnretrievedOutput(id) {
		return this.getTerminalById(id)?.getUnretrievedOutput() ?? ""
	}
	/**
	 * Checks if a terminal process is "hot" (recently active).
	 *
	 * @param id The terminal ID
	 * @returns True if the process is hot, false otherwise
	 */
	static isProcessHot(id) {
		return this.getTerminalById(id)?.process?.isHot ?? false
	}
	/**
	 * Gets terminals filtered by busy state and optionally by task id.
	 *
	 * @param busy Whether to get busy or non-busy terminals
	 * @param taskId Optional task ID to filter terminals by
	 * @returns Array of Terminal objects
	 */
	static getTerminals(busy, taskId) {
		return this.getAllTerminals().filter((t) => {
			// Filter by busy state.
			if (t.busy !== busy) {
				return false
			}
			// If taskId is provided, also filter by taskId.
			if (taskId !== undefined && t.taskId !== taskId) {
				return false
			}
			return true
		})
	}
	/**
	 * Gets background terminals (taskId undefined) that have unretrieved output
	 * or are still running.
	 *
	 * @param busy Whether to get busy or non-busy terminals
	 * @returns Array of Terminal objects
	 */
	static getBackgroundTerminals(busy) {
		return this.getAllTerminals().filter((t) => {
			// Only get background terminals (taskId undefined).
			if (t.taskId !== undefined) {
				return false
			}
			// If busy is undefined, return all background terminals.
			if (busy === undefined) {
				return t.getProcessesWithOutput().length > 0 || t.process?.hasUnretrievedOutput()
			}
			// Filter by busy state.
			return t.busy === busy
		})
	}
	static cleanup() {
		// Clean up all temporary directories.
		ShellIntegrationManager_1.ShellIntegrationManager.clear()
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []
	}
	/**
	 * Releases all terminals associated with a task.
	 *
	 * @param taskId The task ID
	 */
	static releaseTerminalsForTask(taskId) {
		this.terminals.forEach((terminal) => {
			if (terminal.taskId === taskId) {
				terminal.taskId = undefined
			}
		})
	}
	static getAllTerminals() {
		this.terminals = this.terminals.filter((t) => !t.isClosed())
		return this.terminals
	}
	static getTerminalById(id) {
		const terminal = this.terminals.find((t) => t.id === id)
		if (terminal?.isClosed()) {
			this.removeTerminal(id)
			return undefined
		}
		return terminal
	}
	/**
	 * Gets a terminal by its VSCode terminal instance
	 * @param terminal The VSCode terminal instance
	 * @returns The Terminal object, or undefined if not found
	 */
	static getTerminalByVSCETerminal(vsceTerminal) {
		const found = this.terminals.find((t) => t instanceof Terminal_1.Terminal && t.terminal === vsceTerminal)
		if (found?.isClosed()) {
			this.removeTerminal(found.id)
			return undefined
		}
		return found
	}
	static removeTerminal(id) {
		ShellIntegrationManager_1.ShellIntegrationManager.zshCleanupTmpDir(id)
		this.terminals = this.terminals.filter((t) => t.id !== id)
	}
}
exports.TerminalRegistry = TerminalRegistry
