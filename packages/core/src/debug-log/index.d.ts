/**
 * File-based debug logging utility
 *
 * This writes logs to ~/.ali/cli-debug.log, avoiding stdout/stderr
 * which would break TUI applications. The log format is timestamped JSON.
 *
 * Usage:
 *   import { debugLog, DebugLogger } from "@ali-code/core/cli"
 *
 *   // Simple logging
 *   debugLog("handleModeSwitch", { mode: newMode, configId })
 *
 *   // Or create a named logger for a component
 *   const log = new DebugLogger("ClineProvider")
 *   log.info("handleModeSwitch", { mode: newMode })
 */
/**
 * Enable or disable file-based debug logging.
 * Logging is disabled by default and should only be enabled in dev/debug mode.
 */
export declare function setDebugLogEnabled(enabled: boolean): void
/**
 * Simple file-based debug log function.
 * Writes timestamped entries to ~/.ali/cli-debug.log
 * Only writes when enabled via setDebugLogEnabled(true).
 */
export declare function debugLog(message: string, data?: unknown): void
/**
 * Debug logger with component context.
 * Prefixes all messages with the component name.
 */
export declare class DebugLogger {
	private component
	constructor(component: string)
	/**
	 * Log a debug message with optional data
	 */
	debug(message: string, data?: unknown): void
	/**
	 * Alias for debug
	 */
	info(message: string, data?: unknown): void
	/**
	 * Log a warning
	 */
	warn(message: string, data?: unknown): void
	/**
	 * Log an error
	 */
	error(message: string, data?: unknown): void
}
/**
 * Pre-configured logger for provider/mode debugging
 */
export declare const providerDebugLog: DebugLogger
//# sourceMappingURL=index.d.ts.map
