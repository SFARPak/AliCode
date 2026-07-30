import { AliTerminal, AliTerminalProvider } from "./types"
export declare class TerminalRegistry {
	private static terminals
	private static nextTerminalId
	private static disposables
	private static isInitialized
	static initialize(): void
	static createTerminal(cwd: string, provider: AliTerminalProvider): AliTerminal
	/**
	 * Gets an existing terminal or creates a new one for the given working
	 * directory.
	 *
	 * @param cwd The working directory path
	 * @param taskId Optional task ID to associate with the terminal
	 * @returns A Terminal instance
	 */
	static getOrCreateTerminal(cwd: string, taskId?: string, provider?: AliTerminalProvider): Promise<AliTerminal>
	/**
	 * Gets unretrieved output from a terminal process.
	 *
	 * @param id The terminal ID
	 * @returns The unretrieved output as a string, or empty string if terminal not found
	 */
	static getUnretrievedOutput(id: number): string
	/**
	 * Checks if a terminal process is "hot" (recently active).
	 *
	 * @param id The terminal ID
	 * @returns True if the process is hot, false otherwise
	 */
	static isProcessHot(id: number): boolean
	/**
	 * Gets terminals filtered by busy state and optionally by task id.
	 *
	 * @param busy Whether to get busy or non-busy terminals
	 * @param taskId Optional task ID to filter terminals by
	 * @returns Array of Terminal objects
	 */
	static getTerminals(busy: boolean, taskId?: string): AliTerminal[]
	/**
	 * Gets background terminals (taskId undefined) that have unretrieved output
	 * or are still running.
	 *
	 * @param busy Whether to get busy or non-busy terminals
	 * @returns Array of Terminal objects
	 */
	static getBackgroundTerminals(busy?: boolean): AliTerminal[]
	static cleanup(): void
	/**
	 * Releases all terminals associated with a task.
	 *
	 * @param taskId The task ID
	 */
	static releaseTerminalsForTask(taskId: string): void
	private static getAllTerminals
	private static getTerminalById
	/**
	 * Gets a terminal by its VSCode terminal instance
	 * @param terminal The VSCode terminal instance
	 * @returns The Terminal object, or undefined if not found
	 */
	private static getTerminalByVSCETerminal
	private static removeTerminal
}
//# sourceMappingURL=TerminalRegistry.d.ts.map
