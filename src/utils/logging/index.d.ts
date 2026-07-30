/**
 * @fileoverview Main entry point for the compact logging system
 * Provides a default logger instance with Jest environment detection
 */
import { CompactLogger } from "./CompactLogger"
/**
 * Default logger instance
 * Uses CompactLogger for normal operation, switches to noop logger in Jest test environment
 */
export declare const logger:
	| CompactLogger
	| {
			debug: () => void
			info: () => void
			warn: () => void
			error: () => void
			fatal: () => void
			child: () => /*elided*/ any
			close: () => void
	  }
//# sourceMappingURL=index.d.ts.map
