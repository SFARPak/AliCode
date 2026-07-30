"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.BaseTerminal = void 0
const extract_text_1 = require("../misc/extract-text")
class BaseTerminal {
	provider
	id
	initialCwd
	busy
	running
	streamClosed
	taskId
	process
	completedProcesses = []
	constructor(provider, id, cwd) {
		this.provider = provider
		this.id = id
		this.initialCwd = cwd
		this.busy = false
		this.running = false
		this.streamClosed = false
	}
	getCurrentWorkingDirectory() {
		return this.initialCwd
	}
	/**
	 * Sets the active stream for this terminal and notifies the process
	 * @param stream The stream to set, or undefined to clean up
	 * @throws Error if process is undefined when a stream is provided
	 */
	setActiveStream(stream, pid) {
		if (stream) {
			if (!this.process) {
				this.running = false
				console.warn(
					`[Terminal ${this.provider}/${this.id}] process is undefined, so cannot set terminal stream (probably user-initiated non-Ali command)`,
				)
				return
			}
			this.running = true
			this.streamClosed = false
			this.process.emit("shell_execution_started", pid)
			this.process.emit("stream_available", stream)
		} else {
			this.streamClosed = true
		}
	}
	/**
	 * Handles shell execution completion for this terminal.
	 * @param exitDetails The exit details of the shell execution
	 */
	shellExecutionComplete(exitDetails) {
		this.busy = false
		this.running = false
		if (this.process) {
			// Add to the front of the queue (most recent first).
			if (this.process.hasUnretrievedOutput()) {
				this.completedProcesses.unshift(this.process)
			}
			this.process.emit("shell_execution_complete", exitDetails)
			this.process = undefined
		}
	}
	get isStreamClosed() {
		return this.streamClosed
	}
	/**
	 * Gets the last executed command
	 * @returns The last command string or empty string if none
	 */
	getLastCommand() {
		// Return the command from the active process or the most recent process in the queue
		if (this.process) {
			return this.process.command || ""
		} else if (this.completedProcesses.length > 0) {
			return this.completedProcesses[0].command || ""
		}
		return ""
	}
	/**
	 * Cleans the process queue by removing processes that no longer have unretrieved output
	 * or don't belong to the current task
	 */
	cleanCompletedProcessQueue() {
		// Trim retrieved output from each process to free memory, then keep only those with remaining output
		this.completedProcesses = this.completedProcesses.filter((process) => {
			process.trimRetrievedOutput()
			return process.hasUnretrievedOutput()
		})
	}
	/**
	 * Gets all processes with unretrieved output
	 * @returns Array of processes with unretrieved output
	 */
	getProcessesWithOutput() {
		// Clean the queue first to remove any processes without output
		this.cleanCompletedProcessQueue()
		return [...this.completedProcesses]
	}
	/**
	 * Gets all unretrieved output from both active and completed processes
	 * @returns Combined unretrieved output from all processes
	 */
	getUnretrievedOutput() {
		let output = ""
		// First check completed processes to maintain chronological order
		for (const process of this.completedProcesses) {
			const processOutput = process.getUnretrievedOutput()
			if (processOutput) {
				output += processOutput
			}
		}
		// Then check active process for most recent output
		const activeOutput = this.process?.getUnretrievedOutput()
		if (activeOutput) {
			output += activeOutput
		}
		this.cleanCompletedProcessQueue()
		return output
	}
	static defaultShellIntegrationTimeout = 5_000
	static shellIntegrationTimeout = BaseTerminal.defaultShellIntegrationTimeout
	static shellIntegrationDisabled = false
	static commandDelay = 0
	static powershellCounter = false
	static terminalZshClearEolMark = true
	static terminalZshOhMy = false
	static terminalZshP10k = false
	static terminalZdotdir = false
	static execaShellPath = undefined
	/**
	 * Compresses terminal output by applying run-length encoding and truncating to line limit
	 * @param input The terminal output to compress
	 * @returns The compressed terminal output
	 */
	static setShellIntegrationTimeout(timeoutMs) {
		BaseTerminal.shellIntegrationTimeout = timeoutMs
	}
	static getShellIntegrationTimeout() {
		return BaseTerminal.shellIntegrationTimeout
	}
	static setShellIntegrationDisabled(disabled) {
		BaseTerminal.shellIntegrationDisabled = disabled
	}
	static getShellIntegrationDisabled() {
		return BaseTerminal.shellIntegrationDisabled
	}
	/**
	 * Sets the command delay in milliseconds
	 * @param delayMs The delay in milliseconds
	 */
	static setCommandDelay(delayMs) {
		BaseTerminal.commandDelay = delayMs
	}
	/**
	 * Gets the command delay in milliseconds
	 * @returns The command delay in milliseconds
	 */
	static getCommandDelay() {
		return BaseTerminal.commandDelay
	}
	/**
	 * Sets whether to use the PowerShell counter workaround
	 * @param enabled Whether to enable the PowerShell counter workaround
	 */
	static setPowershellCounter(enabled) {
		BaseTerminal.powershellCounter = enabled
	}
	/**
	 * Gets whether to use the PowerShell counter workaround
	 * @returns Whether the PowerShell counter workaround is enabled
	 */
	static getPowershellCounter() {
		return BaseTerminal.powershellCounter
	}
	/**
	 * Sets whether to clear the ZSH EOL mark
	 * @param enabled Whether to clear the ZSH EOL mark
	 */
	static setTerminalZshClearEolMark(enabled) {
		BaseTerminal.terminalZshClearEolMark = enabled
	}
	/**
	 * Gets whether to clear the ZSH EOL mark
	 * @returns Whether the ZSH EOL mark clearing is enabled
	 */
	static getTerminalZshClearEolMark() {
		return BaseTerminal.terminalZshClearEolMark
	}
	/**
	 * Sets whether to enable Oh My Zsh shell integration
	 * @param enabled Whether to enable Oh My Zsh shell integration
	 */
	static setTerminalZshOhMy(enabled) {
		BaseTerminal.terminalZshOhMy = enabled
	}
	/**
	 * Gets whether Oh My Zsh shell integration is enabled
	 * @returns Whether Oh My Zsh shell integration is enabled
	 */
	static getTerminalZshOhMy() {
		return BaseTerminal.terminalZshOhMy
	}
	/**
	 * Sets whether to enable Powerlevel10k shell integration
	 * @param enabled Whether to enable Powerlevel10k shell integration
	 */
	static setTerminalZshP10k(enabled) {
		BaseTerminal.terminalZshP10k = enabled
	}
	/**
	 * Gets whether Powerlevel10k shell integration is enabled
	 * @returns Whether Powerlevel10k shell integration is enabled
	 */
	static getTerminalZshP10k() {
		return BaseTerminal.terminalZshP10k
	}
	/**
	 * Compresses terminal output by applying run-length encoding and truncating to reasonable limits.
	 * Uses hardcoded defaults: 500 lines, 50K characters - these are UI display limits to prevent
	 * memory issues, not LLM context limits (which are controlled by terminalOutputPreviewSize).
	 * @param input The terminal output to compress
	 * @returns The compressed terminal output
	 */
	static compressTerminalOutput(input) {
		// Hardcoded UI display limits - these prevent unbounded memory growth
		// in the chat display, separate from the LLM context limits
		const LINE_LIMIT = 500
		const CHARACTER_LIMIT = 50_000
		return (0, extract_text_1.truncateOutput)(
			(0, extract_text_1.applyRunLengthEncoding)(input),
			LINE_LIMIT,
			CHARACTER_LIMIT,
		)
	}
	/**
	 * Sets whether to enable ZDOTDIR handling for zsh
	 * @param enabled Whether to enable ZDOTDIR handling
	 */
	static setTerminalZdotdir(enabled) {
		BaseTerminal.terminalZdotdir = enabled
	}
	/**
	 * Gets whether ZDOTDIR handling is enabled
	 * @returns Whether ZDOTDIR handling is enabled
	 */
	static getTerminalZdotdir() {
		return BaseTerminal.terminalZdotdir
	}
	static setExecaShellPath(shellPath) {
		BaseTerminal.execaShellPath = shellPath
	}
	static getExecaShellPath() {
		return BaseTerminal.execaShellPath
	}
}
exports.BaseTerminal = BaseTerminal
