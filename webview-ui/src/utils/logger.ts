import { vscode } from "./vscode"

/**
 * Logger utility for webview UI debugging
 * Uses file-based logging to avoid interfering with the webview UI
 */
class Logger {
	private readonly logFilePath: string = "/tmp/webview-ui-debug.log"
	private readonly enabled: boolean = process.env.NODE_ENV === "development" || process.env.WEBVIEW_DEBUG === "true"

	private log(message: string, data?: unknown): void {
		if (!this.enabled) return

		const timestamp = new Date().toISOString()
		const logEntry = data
			? `[${timestamp}] ${message}: ${this.safeJsonStringify(data, null, 2)}\n`
			: `[${timestamp}] ${message}\n`

		try {
			// In a real implementation, we would use fs.appendFileSync
			// But since we don't have direct file access in webview, we'll use postMessage to extension
			// which can then write to file
			if (vscode) {
				vscode.postMessage({
					type: "log",
					message: logEntry,
				})
			}

			// Also log to console for immediate feedback during development
			console.log(`[Webview UI Debug] ${message}`, data || "")
		} catch (e) {
			// Fallback to console if posting fails
			console.error("Failed to log:", e)
			console.log(`[Webview UI Debug] ${message}`, data || "")
		}
	}

	/**
	 * Safely stringify a value, handling circular references by replacing them with "[Circular]"
	 */
	private safeJsonStringify(
		value: any,
		replacer?: (this: any, key: string, value: any) => any,
		space?: string | number,
	): string {
		const seen = new WeakSet()
		return JSON.stringify(
			value,
			(key, value) => {
				if (typeof value === "object" && value !== null) {
					if (seen.has(value)) {
						return "[Circular]"
					}
					seen.add(value)
				}
				return replacer ? replacer.call(this, key, value) : value
			},
			space,
		)
	}

	info(message: string, data?: unknown): void {
		this.log(`[INFO] ${message}`, data)
	}

	warn(message: string, data?: unknown): void {
		this.log(`[WARN] ${message}`, data)
	}

	error(message: string, data?: unknown): void {
		this.log(`[ERROR] ${message}`, data)
	}

	debug(message: string, data?: unknown): void {
		this.log(`[DEBUG] ${message}`, data)
	}
}

export const logger = new Logger()
