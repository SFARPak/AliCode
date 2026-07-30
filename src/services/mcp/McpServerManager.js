"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.McpServerManager = void 0
const McpHub_1 = require("./McpHub")
/**
 * Singleton manager for MCP server instances.
 * Ensures only one set of MCP servers runs across all webviews.
 */
class McpServerManager {
	static instance = null
	static GLOBAL_STATE_KEY = "mcpHubInstanceId"
	static providers = new Set()
	static initializationPromise = null
	/**
	 * Get the singleton McpHub instance.
	 * Creates a new instance if one doesn't exist.
	 * Thread-safe implementation using a promise-based lock.
	 */
	static async getInstance(context, provider) {
		// Register the provider
		this.providers.add(provider)
		// If we already have an instance, return it
		if (this.instance) {
			return this.instance
		}
		// If initialization is in progress, wait for it
		if (this.initializationPromise) {
			return this.initializationPromise
		}
		// Create a new initialization promise
		this.initializationPromise = (async () => {
			try {
				// Double-check instance in case it was created while we were waiting
				if (!this.instance) {
					const hub = new McpHub_1.McpHub(provider)
					// Wait for all MCP servers to finish connecting (or timing out)
					await hub.waitUntilReady()
					this.instance = hub
					// Store a unique identifier in global state to track the primary instance
					await context.globalState.update(this.GLOBAL_STATE_KEY, Date.now().toString())
				}
				return this.instance
			} finally {
				// Clear the initialization promise after completion or error
				this.initializationPromise = null
			}
		})()
		return this.initializationPromise
	}
	/**
	 * Remove a provider from the tracked set.
	 * This is called when a webview is disposed.
	 */
	static unregisterProvider(provider) {
		this.providers.delete(provider)
	}
	/**
	 * Notify all registered providers of server state changes.
	 */
	static notifyProviders(message) {
		this.providers.forEach((provider) => {
			provider.postMessageToWebview(message).catch((error) => {
				console.error("Failed to notify provider:", error)
			})
		})
	}
	/**
	 * Clean up the singleton instance and all its resources.
	 */
	static async cleanup(context) {
		if (this.instance) {
			await this.instance.dispose()
			this.instance = null
			await context.globalState.update(this.GLOBAL_STATE_KEY, undefined)
		}
		this.providers.clear()
	}
}
exports.McpServerManager = McpServerManager
