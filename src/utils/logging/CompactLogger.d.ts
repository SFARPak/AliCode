/**
 * @fileoverview Implementation of the compact logging system's main logger class
 */
import { ILogger, LogMeta } from "./types"
import { CompactTransport } from "./CompactTransport"
/**
 * Main logger implementation providing compact, efficient logging capabilities
 * @implements {ILogger}
 */
export declare class CompactLogger implements ILogger {
	private transport
	private parentMeta
	/**
	 * Creates a new CompactLogger instance
	 * @param transport - Optional custom transport instance
	 * @param parentMeta - Optional parent metadata for hierarchical logging
	 */
	constructor(transport?: CompactTransport, parentMeta?: LogMeta)
	/**
	 * Logs a debug level message
	 * @param message - The message to log
	 * @param meta - Optional metadata to include
	 */
	debug(message: string, meta?: LogMeta): void
	/**
	 * Logs an info level message
	 * @param message - The message to log
	 * @param meta - Optional metadata to include
	 */
	info(message: string, meta?: LogMeta): void
	/**
	 * Logs a warning level message
	 * @param message - The message to log
	 * @param meta - Optional metadata to include
	 */
	warn(message: string, meta?: LogMeta): void
	/**
	 * Logs an error level message
	 * @param message - The error message or Error object
	 * @param meta - Optional metadata to include
	 */
	error(message: string | Error, meta?: LogMeta): void
	/**
	 * Logs a fatal level message
	 * @param message - The error message or Error object
	 * @param meta - Optional metadata to include
	 */
	fatal(message: string | Error, meta?: LogMeta): void
	/**
	 * Creates a child logger inheriting this logger's metadata
	 * @param meta - Additional metadata for the child logger
	 * @returns A new logger instance with combined metadata
	 */
	child(meta: LogMeta): ILogger
	/**
	 * Closes the logger and its transport
	 */
	close(): void
	/**
	 * Handles logging of error and fatal messages with special error object processing
	 * @private
	 * @param level - The log level (error or fatal)
	 * @param message - The message or Error object to log
	 * @param meta - Optional metadata to include
	 */
	private handleErrorLog
	/**
	 * Combines parent and current metadata with proper context handling
	 * @private
	 * @param meta - The current metadata to combine with parent metadata
	 * @returns Combined metadata or undefined if no metadata exists
	 */
	private combineMeta
	/**
	 * Core logging function that processes and writes log entries
	 * @private
	 * @param level - The log level
	 * @param message - The message to log
	 * @param meta - Optional metadata to include
	 */
	private log
}
//# sourceMappingURL=CompactLogger.d.ts.map
