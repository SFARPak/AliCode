import type { AliTerminal } from "./types"
import { BaseTerminalProcess } from "./BaseTerminalProcess"
export declare class ExecaTerminalProcess extends BaseTerminalProcess {
	private terminalRef
	private aborted
	private pid?
	private subprocess?
	private pidUpdatePromise?
	constructor(terminal: AliTerminal)
	get terminal(): AliTerminal
	run(command: string): Promise<void>
	continue(): void
	abort(): void
	hasUnretrievedOutput(): boolean
	getUnretrievedOutput(): string
	private emitRemainingBufferIfListening
}
//# sourceMappingURL=ExecaTerminalProcess.d.ts.map
