import type {
	AliTerminalProvider,
	AliTerminal,
	AliTerminalCallbacks,
	AliTerminalProcess,
	AliTerminalProcessResultPromise,
	ExitCodeDetails,
} from "./types"
export declare abstract class BaseTerminal implements AliTerminal {
	readonly provider: AliTerminalProvider
	readonly id: number
	readonly initialCwd: string
	busy: boolean
	running: boolean
	protected streamClosed: boolean
	taskId?: string
	process?: AliTerminalProcess
	completedProcesses: AliTerminalProcess[]
	constructor(provider: AliTerminalProvider, id: number, cwd: string)
	getCurrentWorkingDirectory(): string
	abstract isClosed(): boolean
	abstract runCommand(command: string, callbacks: AliTerminalCallbacks): AliTerminalProcessResultPromise
	/**
	 * Sets the active stream for this terminal and notifies the process
	 * @param stream The stream to set, or undefined to clean up
	 * @throws Error if process is undefined when a stream is provided
	 */
	setActiveStream(stream: AsyncIterable<string> | undefined, pid?: number): void
	/**
	 * Handles shell execution completion for this terminal.
	 * @param exitDetails The exit details of the shell execution
	 */
	shellExecutionComplete(exitDetails: ExitCodeDetails): void
	get isStreamClosed(): boolean
	/**
	 * Gets the last executed command
	 * @returns The last command string or empty string if none
	 */
	getLastCommand(): string
	/**
	 * Cleans the process queue by removing processes that no longer have unretrieved output
	 * or don't belong to the current task
	 */
	cleanCompletedProcessQueue(): void
	/**
	 * Gets all processes with unretrieved output
	 * @returns Array of processes with unretrieved output
	 */
	getProcessesWithOutput(): AliTerminalProcess[]
	/**
	 * Gets all unretrieved output from both active and completed processes
	 * @returns Combined unretrieved output from all processes
	 */
	getUnretrievedOutput(): string
	static defaultShellIntegrationTimeout: number
	private static shellIntegrationTimeout
	private static shellIntegrationDisabled
	private static commandDelay
	private static powershellCounter
	private static terminalZshClearEolMark
	private static terminalZshOhMy
	private static terminalZshP10k
	private static terminalZdotdir
	private static execaShellPath
	/**
	 * Compresses terminal output by applying run-length encoding and truncating to line limit
	 * @param input The terminal output to compress
	 * @returns The compressed terminal output
	 */
	static setShellIntegrationTimeout(timeoutMs: number): void
	static getShellIntegrationTimeout(): number
	static setShellIntegrationDisabled(disabled: boolean): void
	static getShellIntegrationDisabled(): boolean
	/**
	 * Sets the command delay in milliseconds
	 * @param delayMs The delay in milliseconds
	 */
	static setCommandDelay(delayMs: number): void
	/**
	 * Gets the command delay in milliseconds
	 * @returns The command delay in milliseconds
	 */
	static getCommandDelay(): number
	/**
	 * Sets whether to use the PowerShell counter workaround
	 * @param enabled Whether to enable the PowerShell counter workaround
	 */
	static setPowershellCounter(enabled: boolean): void
	/**
	 * Gets whether to use the PowerShell counter workaround
	 * @returns Whether the PowerShell counter workaround is enabled
	 */
	static getPowershellCounter(): boolean
	/**
	 * Sets whether to clear the ZSH EOL mark
	 * @param enabled Whether to clear the ZSH EOL mark
	 */
	static setTerminalZshClearEolMark(enabled: boolean): void
	/**
	 * Gets whether to clear the ZSH EOL mark
	 * @returns Whether the ZSH EOL mark clearing is enabled
	 */
	static getTerminalZshClearEolMark(): boolean
	/**
	 * Sets whether to enable Oh My Zsh shell integration
	 * @param enabled Whether to enable Oh My Zsh shell integration
	 */
	static setTerminalZshOhMy(enabled: boolean): void
	/**
	 * Gets whether Oh My Zsh shell integration is enabled
	 * @returns Whether Oh My Zsh shell integration is enabled
	 */
	static getTerminalZshOhMy(): boolean
	/**
	 * Sets whether to enable Powerlevel10k shell integration
	 * @param enabled Whether to enable Powerlevel10k shell integration
	 */
	static setTerminalZshP10k(enabled: boolean): void
	/**
	 * Gets whether Powerlevel10k shell integration is enabled
	 * @returns Whether Powerlevel10k shell integration is enabled
	 */
	static getTerminalZshP10k(): boolean
	/**
	 * Compresses terminal output by applying run-length encoding and truncating to reasonable limits.
	 * Uses hardcoded defaults: 500 lines, 50K characters - these are UI display limits to prevent
	 * memory issues, not LLM context limits (which are controlled by terminalOutputPreviewSize).
	 * @param input The terminal output to compress
	 * @returns The compressed terminal output
	 */
	static compressTerminalOutput(input: string): string
	/**
	 * Sets whether to enable ZDOTDIR handling for zsh
	 * @param enabled Whether to enable ZDOTDIR handling
	 */
	static setTerminalZdotdir(enabled: boolean): void
	/**
	 * Gets whether ZDOTDIR handling is enabled
	 * @returns Whether ZDOTDIR handling is enabled
	 */
	static getTerminalZdotdir(): boolean
	static setExecaShellPath(shellPath: string | undefined): void
	static getExecaShellPath(): string | undefined
}
//# sourceMappingURL=BaseTerminal.d.ts.map
