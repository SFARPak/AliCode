import * as vscode from "vscode"
import type { AliTerminalCallbacks, AliTerminalProcessResultPromise } from "./types"
import { BaseTerminal } from "./BaseTerminal"
export declare class Terminal extends BaseTerminal {
	terminal: vscode.Terminal
	cmdCounter: number
	constructor(id: number, terminal: vscode.Terminal | undefined, cwd: string)
	/**
	 * Gets the current working directory from shell integration or falls back to initial cwd.
	 * @returns The current working directory
	 */
	getCurrentWorkingDirectory(): string
	/**
	 * The exit status of the terminal will be undefined while the terminal is
	 * active. (This value is set when onDidCloseTerminal is fired.)
	 */
	isClosed(): boolean
	runCommand(command: string, callbacks: AliTerminalCallbacks): AliTerminalProcessResultPromise
	/**
	 * Gets the terminal contents based on the number of commands to include
	 * @param commands Number of previous commands to include (-1 for all)
	 * @returns The selected terminal contents
	 */
	static getTerminalContents(commands?: number): Promise<string>
	static getEnv(): Record<string, string>
}
//# sourceMappingURL=Terminal.d.ts.map
