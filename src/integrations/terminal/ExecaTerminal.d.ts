import type { AliTerminalCallbacks, AliTerminalProcessResultPromise } from "./types"
import { BaseTerminal } from "./BaseTerminal"
export declare class ExecaTerminal extends BaseTerminal {
	constructor(id: number, cwd: string)
	/**
	 * Unlike the VSCode terminal, this is never closed.
	 */
	isClosed(): boolean
	runCommand(command: string, callbacks: AliTerminalCallbacks): AliTerminalProcessResultPromise
}
//# sourceMappingURL=ExecaTerminal.d.ts.map
