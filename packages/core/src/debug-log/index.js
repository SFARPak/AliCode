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
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
const DEBUG_LOG_PATH = path.join(os.homedir(), ".ali", "cli-debug.log")
let debugLogEnabled = false
/**
 * Enable or disable file-based debug logging.
 * Logging is disabled by default and should only be enabled in dev/debug mode.
 */
export function setDebugLogEnabled(enabled) {
	debugLogEnabled = enabled
}
/**
 * Simple file-based debug log function.
 * Writes timestamped entries to ~/.ali/cli-debug.log
 * Only writes when enabled via setDebugLogEnabled(true).
 */
export function debugLog(message, data) {
	if (!debugLogEnabled) {
		return
	}
	try {
		const logDir = path.dirname(DEBUG_LOG_PATH)
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true })
		}
		const timestamp = new Date().toISOString()
		const entry = data
			? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}\n`
			: `[${timestamp}] ${message}\n`
		fs.appendFileSync(DEBUG_LOG_PATH, entry)
	} catch {
		// NO-OP - don't let logging errors break functionality
	}
}
/**
 * Debug logger with component context.
 * Prefixes all messages with the component name.
 */
export class DebugLogger {
	component
	constructor(component) {
		this.component = component
	}
	/**
	 * Log a debug message with optional data
	 */
	debug(message, data) {
		debugLog(`[${this.component}] ${message}`, data)
	}
	/**
	 * Alias for debug
	 */
	info(message, data) {
		this.debug(message, data)
	}
	/**
	 * Log a warning
	 */
	warn(message, data) {
		debugLog(`[${this.component}] WARN: ${message}`, data)
	}
	/**
	 * Log an error
	 */
	error(message, data) {
		debugLog(`[${this.component}] ERROR: ${message}`, data)
	}
}
/**
 * Pre-configured logger for provider/mode debugging
 */
export const providerDebugLog = new DebugLogger("ProviderSettings")
