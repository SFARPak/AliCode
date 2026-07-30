/**
 * @fileoverview Implementation of the compact logging transport system with file output capabilities
 */
import { CompactTransportConfig, ICompactTransport, CompactLogEntry } from "./types"
/**
 * Implements the compact logging transport with file output support
 * @implements {ICompactTransport}
 */
export declare class CompactTransport implements ICompactTransport {
	readonly config: CompactTransportConfig
	private sessionStart
	private lastTimestamp
	private filePath?
	private initialized
	/**
	 * Creates a new CompactTransport instance
	 * @param config - Optional transport configuration
	 */
	constructor(config?: CompactTransportConfig)
	/**
	 * Ensures the log file is initialized with proper directory structure and session start marker
	 * @private
	 * @throws {Error} If file initialization fails
	 */
	private ensureInitialized
	/**
	 * Writes a log entry to configured outputs (console and/or file)
	 * @param entry - The log entry to write
	 */
	write(entry: CompactLogEntry): void
	/**
	 * Closes the transport and writes session end marker
	 */
	close(): void
}
//# sourceMappingURL=CompactTransport.d.ts.map
