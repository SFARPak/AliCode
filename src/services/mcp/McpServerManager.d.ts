import * as vscode from "vscode"
import { McpHub } from "./McpHub"
import { ClineProvider } from "../../core/webview/ClineProvider"
/**
 * Singleton manager for MCP server instances.
 * Ensures only one set of MCP servers runs across all webviews.
 */
export declare class McpServerManager {
	private static instance
	private static readonly GLOBAL_STATE_KEY
	private static providers
	private static initializationPromise
	/**
	 * Get the singleton McpHub instance.
	 * Creates a new instance if one doesn't exist.
	 * Thread-safe implementation using a promise-based lock.
	 */
	static getInstance(context: vscode.ExtensionContext, provider: ClineProvider): Promise<McpHub>
	/**
	 * Remove a provider from the tracked set.
	 * This is called when a webview is disposed.
	 */
	static unregisterProvider(provider: ClineProvider): void
	/**
	 * Notify all registered providers of server state changes.
	 */
	static notifyProviders(message: any): void
	/**
	 * Clean up the singleton instance and all its resources.
	 */
	static cleanup(context: vscode.ExtensionContext): Promise<void>
}
//# sourceMappingURL=McpServerManager.d.ts.map
