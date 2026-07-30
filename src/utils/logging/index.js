"use strict"
/**
 * @fileoverview Main entry point for the compact logging system
 * Provides a default logger instance with Jest environment detection
 */
Object.defineProperty(exports, "__esModule", { value: true })
exports.logger = void 0
const CompactLogger_1 = require("./CompactLogger")
/**
 * No-operation logger implementation for production environments
 */
const noopLogger = {
	debug: () => {},
	info: () => {},
	warn: () => {},
	error: () => {},
	fatal: () => {},
	child: () => noopLogger,
	close: () => {},
}
/**
 * Default logger instance
 * Uses CompactLogger for normal operation, switches to noop logger in Jest test environment
 */
exports.logger = process.env.NODE_ENV === "test" ? new CompactLogger_1.CompactLogger() : noopLogger
