/**
 * Network Proxy Configuration Module
 *
 * Provides proxy configuration for all outbound HTTP/HTTPS requests from the AliCode extension.
 * When running in debug mode (F5), a proxy can be enabled for outbound traffic.
 * Optionally, TLS certificate verification can be disabled (debug only) to allow
 * MITM proxy inspection.
 *
 * Uses global-agent to globally route all HTTP/HTTPS traffic through the proxy,
 * which works with axios, fetch, and most SDKs that use native Node.js http/https.
 */
import * as vscode from "vscode"
/**
 * Proxy configuration state
 */
export interface ProxyConfig {
	/** Whether the debug proxy is enabled */
	enabled: boolean
	/** The proxy server URL (e.g., http://127.0.0.1:8888) */
	serverUrl: string
	/** Accept self-signed/insecure TLS certificates from the proxy (required for MITM) */
	tlsInsecure: boolean
	/** Whether running in debug/development mode */
	isDebugMode: boolean
}
/**
 * Initialize the network proxy module with the extension context.
 * Must be called early in extension activation before any network requests.
 *
 * @param context The VS Code extension context
 * @param channel Optional output channel for logging
 */
export declare function initializeNetworkProxy(
	context: vscode.ExtensionContext,
	channel?: vscode.OutputChannel,
): Promise<void>
/**
 * Get the current proxy configuration based on VS Code settings and extension mode.
 */
export declare function getProxyConfig(): ProxyConfig
/**
 * Check if a proxy is currently configured and active.
 */
export declare function isProxyEnabled(): boolean
/**
 * Check if we're running in debug mode.
 */
export declare function isDebugMode(): boolean
//# sourceMappingURL=networkProxy.d.ts.map
