import EventEmitter from "events"
export type AliTerminalProvider = "vscode" | "execa"
export interface AliTerminal {
	provider: AliTerminalProvider
	id: number
	busy: boolean
	running: boolean
	taskId?: string
	process?: AliTerminalProcess
	getCurrentWorkingDirectory(): string
	isClosed: () => boolean
	runCommand: (command: string, callbacks: AliTerminalCallbacks) => AliTerminalProcessResultPromise
	setActiveStream(stream: AsyncIterable<string> | undefined, pid?: number): void
	shellExecutionComplete(exitDetails: ExitCodeDetails): void
	getProcessesWithOutput(): AliTerminalProcess[]
	getUnretrievedOutput(): string
	getLastCommand(): string
	cleanCompletedProcessQueue(): void
}
export interface AliTerminalCallbacks {
	onLine: (line: string, process: AliTerminalProcess) => void
	onCompleted: (output: string | undefined, process: AliTerminalProcess) => void | Promise<void>
	onShellExecutionStarted: (pid: number | undefined, process: AliTerminalProcess) => void
	onShellExecutionComplete: (details: ExitCodeDetails, process: AliTerminalProcess) => void
	onNoShellIntegration?: (message: string, process: AliTerminalProcess) => void
}
export interface AliTerminalProcess extends EventEmitter<AliTerminalProcessEvents> {
	command: string
	isHot: boolean
	run: (command: string) => Promise<void>
	continue: () => void
	abort: () => void
	hasUnretrievedOutput: () => boolean
	getUnretrievedOutput: () => string
	trimRetrievedOutput: () => void
}
export type AliTerminalProcessResultPromise = AliTerminalProcess & Promise<void>
export interface AliTerminalProcessEvents {
	line: [line: string]
	continue: []
	completed: [output?: string]
	stream_available: [stream: AsyncIterable<string>]
	shell_execution_started: [pid: number | undefined]
	shell_execution_complete: [exitDetails: ExitCodeDetails]
	error: [error: Error]
	no_shell_integration: [message: string]
}
export interface ExitCodeDetails {
	exitCode: number | undefined
	signal?: number | undefined
	signalName?: string
	coreDumpPossible?: boolean
}
//# sourceMappingURL=types.d.ts.map
