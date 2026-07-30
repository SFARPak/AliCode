"use strict"
/**
 * @fileoverview Implementation of the compact logging transport system with file output capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true })
exports.CompactTransport = void 0
const fs_1 = require("fs")
const path_1 = require("path")
const types_1 = require("./types")
/**
 * Default configuration for the transport
 */
const DEFAULT_CONFIG = {
	level: "debug",
	fileOutput: {
		enabled: true,
		path: "./logs/app.log",
	},
}
/**
 * Determines if a log entry should be processed based on configured minimum level
 * @param configLevel - The minimum log level from configuration
 * @param entryLevel - The level of the current log entry
 * @returns Whether the entry should be processed
 */
function isLevelEnabled(configLevel, entryLevel) {
	const configIdx = types_1.LOG_LEVELS.indexOf(configLevel)
	const entryIdx = types_1.LOG_LEVELS.indexOf(entryLevel)
	return entryIdx >= configIdx
}
/**
 * Implements the compact logging transport with file output support
 * @implements {ICompactTransport}
 */
class CompactTransport {
	config
	sessionStart
	lastTimestamp
	filePath
	initialized = false
	/**
	 * Creates a new CompactTransport instance
	 * @param config - Optional transport configuration
	 */
	constructor(config = DEFAULT_CONFIG) {
		this.config = config
		this.sessionStart = Date.now()
		this.lastTimestamp = this.sessionStart
		if (config.fileOutput?.enabled) {
			this.filePath = config.fileOutput.path
		}
	}
	/**
	 * Ensures the log file is initialized with proper directory structure and session start marker
	 * @private
	 * @throws {Error} If file initialization fails
	 */
	ensureInitialized() {
		if (this.initialized || !this.filePath) return
		try {
			;(0, fs_1.mkdirSync)((0, path_1.dirname)(this.filePath), { recursive: true })
			;(0, fs_1.writeFileSync)(this.filePath, "", { flag: "w" })
			const sessionStart = {
				t: 0,
				l: "info",
				m: "Log session started",
				d: { timestamp: new Date(this.sessionStart).toISOString() },
			}
			;(0, fs_1.writeFileSync)(this.filePath, JSON.stringify(sessionStart) + "\n", { flag: "w" })
			this.initialized = true
		} catch (err) {
			throw new Error(`Failed to initialize log file: ${err.message}`)
		}
	}
	/**
	 * Writes a log entry to configured outputs (console and/or file)
	 * @param entry - The log entry to write
	 */
	write(entry) {
		const deltaT = entry.t - this.lastTimestamp
		this.lastTimestamp = entry.t
		const compact = {
			...entry,
			t: deltaT,
		}
		const output = JSON.stringify(compact) + "\n"
		// Write to console if level is enabled
		if (this.config.level && isLevelEnabled(this.config.level, entry.l)) {
			process.stdout.write(output)
		}
		// Write to file if enabled
		if (this.filePath) {
			this.ensureInitialized()
			;(0, fs_1.writeFileSync)(this.filePath, output, { flag: "a" })
		}
	}
	/**
	 * Closes the transport and writes session end marker
	 */
	close() {
		if (this.filePath && this.initialized) {
			const sessionEnd = {
				t: Date.now() - this.lastTimestamp,
				l: "info",
				m: "Log session ended",
				d: { timestamp: new Date().toISOString() },
			}
			;(0, fs_1.writeFileSync)(this.filePath, JSON.stringify(sessionEnd) + "\n", { flag: "a" })
		}
	}
}
exports.CompactTransport = CompactTransport
