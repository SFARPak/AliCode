import { EventEmitter } from "events"
import type { AliTerminalProcess, AliTerminalProcessEvents, ExitCodeDetails } from "./types"
export declare abstract class BaseTerminalProcess
	extends EventEmitter<AliTerminalProcessEvents>
	implements AliTerminalProcess
{
	command: string
	isHot: boolean
	protected hotTimer: NodeJS.Timeout | null
	protected isListening: boolean
	protected lastEmitTime_ms: number
	protected fullOutput: string
	protected lastRetrievedIndex: number
	static interpretExitCode(exitCode: number | undefined): ExitCodeDetails
	/**
	 * Runs a shell command.
	 * @param command The command to run
	 */
	abstract run(command: string): Promise<void>
	/**
	 * Continues the process in the background.
	 */
	abstract continue(): void
	/**
	 * Aborts the process via a SIGINT.
	 */
	abstract abort(): void
	/**
	 * Checks if this process has unretrieved output.
	 * @returns true if there is output that hasn't been fully retrieved yet
	 */
	abstract hasUnretrievedOutput(): boolean
	/**
	 * Returns complete lines with their carriage returns.
	 * The final line may lack a carriage return if the program didn't send one.
	 * @returns The unretrieved output
	 */
	abstract getUnretrievedOutput(): string
	/**
	 * Clears the internal output buffer when all content has been retrieved.
	 *
	 * This prevents unbounded memory growth when processing large
	 * command outputs by discarding data that has already been
	 * consumed by callers of `getUnretrievedOutput`.
	 *
	 * Called after command completion when `lastRetrievedIndex` has been
	 * set to `fullOutput.length` to indicate all output has been processed.
	 */
	trimRetrievedOutput(): void
	protected startHotTimer(data: string): void
	protected stopHotTimer(): void
	private static compilingMarkers
	private static compilingMarkerNullifiers
	private static isCompiling
}
//# sourceMappingURL=BaseTerminalProcess.d.ts.map
