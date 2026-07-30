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
exports.Terminal = void 0
const vscode = __importStar(require("vscode"))
const p_wait_for_1 = __importDefault(require("p-wait-for"))
const BaseTerminal_1 = require("./BaseTerminal")
const TerminalProcess_1 = require("./TerminalProcess")
const ShellIntegrationManager_1 = require("./ShellIntegrationManager")
const mergePromise_1 = require("./mergePromise")
class Terminal extends BaseTerminal_1.BaseTerminal {
	terminal
	cmdCounter = 0
	constructor(id, terminal, cwd) {
		super("vscode", id, cwd)
		const env = Terminal.getEnv()
		const iconPath = new vscode.ThemeIcon("rocket")
		this.terminal = terminal ?? vscode.window.createTerminal({ cwd, name: "AliCode", iconPath, env })
		if (Terminal.getTerminalZdotdir()) {
			ShellIntegrationManager_1.ShellIntegrationManager.terminalTmpDirs.set(id, env.ZDOTDIR)
		}
	}
	/**
	 * Gets the current working directory from shell integration or falls back to initial cwd.
	 * @returns The current working directory
	 */
	getCurrentWorkingDirectory() {
		return this.terminal.shellIntegration?.cwd ? this.terminal.shellIntegration.cwd.fsPath : this.initialCwd
	}
	/**
	 * The exit status of the terminal will be undefined while the terminal is
	 * active. (This value is set when onDidCloseTerminal is fired.)
	 */
	isClosed() {
		return this.terminal.exitStatus !== undefined
	}
	runCommand(command, callbacks) {
		// We set busy before the command is running because the terminal may be
		// waiting on terminal integration, and we must prevent another instance
		// from selecting the terminal for use during that time.
		this.busy = true
		const process = new TerminalProcess_1.TerminalProcess(this)
		process.command = command
		this.process = process
		// Set up event handlers from callbacks before starting process.
		// This ensures that we don't miss any events because they are
		// configured before the process starts.
		process.on("line", (line) => callbacks.onLine(line, process))
		process.once("completed", (output) => callbacks.onCompleted(output, process))
		process.once("shell_execution_started", (pid) => callbacks.onShellExecutionStarted(pid, process))
		process.once("shell_execution_complete", (details) => callbacks.onShellExecutionComplete(details, process))
		process.once("no_shell_integration", (msg) => callbacks.onNoShellIntegration?.(msg, process))
		const promise = new Promise((resolve, reject) => {
			// Set up event handlers
			process.once("continue", () => resolve())
			process.once("error", (error) => {
				console.error(`[Terminal ${this.id}] error:`, error)
				reject(error)
			})
			// Wait for shell integration before executing the command
			;(0, p_wait_for_1.default)(() => this.terminal.shellIntegration !== undefined, {
				timeout: Terminal.getShellIntegrationTimeout(),
			})
				.then(() => {
					// Clean up temporary directory if shell integration is available, zsh did its job:
					ShellIntegrationManager_1.ShellIntegrationManager.zshCleanupTmpDir(this.id)
					// Run the command in the terminal
					process.run(command)
				})
				.catch(() => {
					console.log(`[Terminal ${this.id}] Shell integration not available. Command execution aborted.`)
					// Clean up temporary directory if shell integration is not available
					ShellIntegrationManager_1.ShellIntegrationManager.zshCleanupTmpDir(this.id)
					process.emit(
						"no_shell_integration",
						`Shell integration initialization sequence '\\x1b]633;A' was not received within ${Terminal.getShellIntegrationTimeout() / 1000}s. Shell integration has been disabled for this terminal instance. Increase the timeout in the settings if necessary.`,
					)
				})
		})
		return (0, mergePromise_1.mergePromise)(process, promise)
	}
	/**
	 * Gets the terminal contents based on the number of commands to include
	 * @param commands Number of previous commands to include (-1 for all)
	 * @returns The selected terminal contents
	 */
	static async getTerminalContents(commands = -1) {
		// Save current clipboard content
		const tempCopyBuffer = await vscode.env.clipboard.readText()
		try {
			// Select terminal content
			if (commands < 0) {
				await vscode.commands.executeCommand("workbench.action.terminal.selectAll")
			} else {
				for (let i = 0; i < commands; i++) {
					await vscode.commands.executeCommand("workbench.action.terminal.selectToPreviousCommand")
				}
			}
			// Copy selection and clear it
			await vscode.commands.executeCommand("workbench.action.terminal.copySelection")
			await vscode.commands.executeCommand("workbench.action.terminal.clearSelection")
			// Get copied content
			let terminalContents = (await vscode.env.clipboard.readText()).trim()
			// Restore original clipboard content
			await vscode.env.clipboard.writeText(tempCopyBuffer)
			if (tempCopyBuffer === terminalContents) {
				// No terminal content was copied
				return ""
			}
			// Process multi-line content
			const lines = terminalContents.split("\n")
			const lastLine = lines.pop()?.trim()
			if (lastLine) {
				let i = lines.length - 1
				while (i >= 0 && !lines[i].trim().startsWith(lastLine)) {
					i--
				}
				terminalContents = lines.slice(Math.max(i, 0)).join("\n")
			}
			return terminalContents
		} catch (error) {
			// Ensure clipboard is restored even if an error occurs
			await vscode.env.clipboard.writeText(tempCopyBuffer)
			throw error
		}
	}
	static getEnv() {
		const env = {
			ROO_ACTIVE: "true",
			PAGER: process.platform === "win32" ? "" : "cat",
			// VTE must be disabled because it prevents the prompt command from executing
			// See https://wiki.gnome.org/Apps/Terminal/VTE
			VTE_VERSION: "0",
		}
		// Set Oh My Zsh shell integration if enabled
		if (Terminal.getTerminalZshOhMy()) {
			env.ITERM_SHELL_INTEGRATION_INSTALLED = "Yes"
		}
		// Set Powerlevel10k shell integration if enabled
		if (Terminal.getTerminalZshP10k()) {
			env.POWERLEVEL9K_TERM_SHELL_INTEGRATION = "true"
		}
		// VSCode bug#237208: Command output can be lost due to a race between completion
		// sequences and consumers. Add delay via PROMPT_COMMAND to ensure the
		// \x1b]633;D escape sequence arrives after command output is processed.
		// Only add this if commandDelay is not zero
		if (Terminal.getCommandDelay() > 0) {
			env.PROMPT_COMMAND = `sleep ${Terminal.getCommandDelay() / 1000}`
		}
		// Clear the ZSH EOL mark to prevent issues with command output interpretation
		// when output ends with special characters like '%'
		if (Terminal.getTerminalZshClearEolMark()) {
			env.PROMPT_EOL_MARK = ""
		}
		// Handle ZDOTDIR for zsh if enabled
		if (Terminal.getTerminalZdotdir()) {
			env.ZDOTDIR = ShellIntegrationManager_1.ShellIntegrationManager.zshInitTmpDir(env)
		}
		return env
	}
}
exports.Terminal = Terminal
