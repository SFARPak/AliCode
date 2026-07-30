import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { z } from "zod"
import type { McpResourceResponse, McpServer, McpToolCallResponse } from "@ali-code/types"
import { ClineProvider } from "../../core/webview/ClineProvider"
export type ConnectedMcpConnection = {
	type: "connected"
	server: McpServer
	client: Client
	transport: StdioClientTransport | SSEClientTransport | StreamableHTTPClientTransport
}
export type DisconnectedMcpConnection = {
	type: "disconnected"
	server: McpServer
	client: null
	transport: null
}
export type McpConnection = ConnectedMcpConnection | DisconnectedMcpConnection
export declare enum DisableReason {
	MCP_DISABLED = "mcpDisabled",
	SERVER_DISABLED = "serverDisabled",
}
export declare const ServerConfigSchema: z.ZodUnion<
	[
		z.ZodEffects<
			z.ZodEffects<
				z.ZodObject<
					{
						disabled: z.ZodOptional<z.ZodBoolean>
						timeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>
						alwaysAllow: z.ZodDefault<z.ZodArray<z.ZodString, "many">>
						watchPaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
						disabledTools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>
					} & {
						type: z.ZodOptional<z.ZodEnum<["stdio"]>>
						command: z.ZodString
						args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
						cwd: z.ZodDefault<z.ZodString>
						env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
						url: z.ZodOptional<z.ZodUndefined>
						headers: z.ZodOptional<z.ZodUndefined>
					},
					"strip",
					z.ZodTypeAny,
					{
						command: string
						disabledTools: string[]
						timeout: number
						cwd: string
						alwaysAllow: string[]
						type?: "stdio" | undefined
						url?: undefined
						env?: Record<string, string> | undefined
						headers?: undefined
						args?: string[] | undefined
						disabled?: boolean | undefined
						watchPaths?: string[] | undefined
					},
					{
						command: string
						type?: "stdio" | undefined
						url?: undefined
						disabledTools?: string[] | undefined
						timeout?: number | undefined
						env?: Record<string, string> | undefined
						cwd?: string | undefined
						headers?: undefined
						args?: string[] | undefined
						disabled?: boolean | undefined
						alwaysAllow?: string[] | undefined
						watchPaths?: string[] | undefined
					}
				>,
				{
					type: "stdio"
					command: string
					disabledTools: string[]
					timeout: number
					cwd: string
					alwaysAllow: string[]
					url?: undefined
					env?: Record<string, string> | undefined
					headers?: undefined
					args?: string[] | undefined
					disabled?: boolean | undefined
					watchPaths?: string[] | undefined
				},
				{
					command: string
					type?: "stdio" | undefined
					url?: undefined
					disabledTools?: string[] | undefined
					timeout?: number | undefined
					env?: Record<string, string> | undefined
					cwd?: string | undefined
					headers?: undefined
					args?: string[] | undefined
					disabled?: boolean | undefined
					alwaysAllow?: string[] | undefined
					watchPaths?: string[] | undefined
				}
			>,
			{
				type: "stdio"
				command: string
				disabledTools: string[]
				timeout: number
				cwd: string
				alwaysAllow: string[]
				url?: undefined
				env?: Record<string, string> | undefined
				headers?: undefined
				args?: string[] | undefined
				disabled?: boolean | undefined
				watchPaths?: string[] | undefined
			},
			{
				command: string
				type?: "stdio" | undefined
				url?: undefined
				disabledTools?: string[] | undefined
				timeout?: number | undefined
				env?: Record<string, string> | undefined
				cwd?: string | undefined
				headers?: undefined
				args?: string[] | undefined
				disabled?: boolean | undefined
				alwaysAllow?: string[] | undefined
				watchPaths?: string[] | undefined
			}
		>,
		z.ZodEffects<
			z.ZodEffects<
				z.ZodObject<
					{
						disabled: z.ZodOptional<z.ZodBoolean>
						timeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>
						alwaysAllow: z.ZodDefault<z.ZodArray<z.ZodString, "many">>
						watchPaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
						disabledTools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>
					} & {
						type: z.ZodOptional<z.ZodEnum<["sse"]>>
						url: z.ZodString
						headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
						command: z.ZodOptional<z.ZodUndefined>
						args: z.ZodOptional<z.ZodUndefined>
						env: z.ZodOptional<z.ZodUndefined>
					},
					"strip",
					z.ZodTypeAny,
					{
						url: string
						disabledTools: string[]
						timeout: number
						alwaysAllow: string[]
						command?: undefined
						type?: "sse" | undefined
						env?: undefined
						headers?: Record<string, string> | undefined
						args?: undefined
						disabled?: boolean | undefined
						watchPaths?: string[] | undefined
					},
					{
						url: string
						command?: undefined
						type?: "sse" | undefined
						disabledTools?: string[] | undefined
						timeout?: number | undefined
						env?: undefined
						headers?: Record<string, string> | undefined
						args?: undefined
						disabled?: boolean | undefined
						alwaysAllow?: string[] | undefined
						watchPaths?: string[] | undefined
					}
				>,
				{
					type: "sse"
					url: string
					disabledTools: string[]
					timeout: number
					alwaysAllow: string[]
					command?: undefined
					env?: undefined
					headers?: Record<string, string> | undefined
					args?: undefined
					disabled?: boolean | undefined
					watchPaths?: string[] | undefined
				},
				{
					url: string
					command?: undefined
					type?: "sse" | undefined
					disabledTools?: string[] | undefined
					timeout?: number | undefined
					env?: undefined
					headers?: Record<string, string> | undefined
					args?: undefined
					disabled?: boolean | undefined
					alwaysAllow?: string[] | undefined
					watchPaths?: string[] | undefined
				}
			>,
			{
				type: "sse"
				url: string
				disabledTools: string[]
				timeout: number
				alwaysAllow: string[]
				command?: undefined
				env?: undefined
				headers?: Record<string, string> | undefined
				args?: undefined
				disabled?: boolean | undefined
				watchPaths?: string[] | undefined
			},
			{
				url: string
				command?: undefined
				type?: "sse" | undefined
				disabledTools?: string[] | undefined
				timeout?: number | undefined
				env?: undefined
				headers?: Record<string, string> | undefined
				args?: undefined
				disabled?: boolean | undefined
				alwaysAllow?: string[] | undefined
				watchPaths?: string[] | undefined
			}
		>,
		z.ZodEffects<
			z.ZodEffects<
				z.ZodObject<
					{
						disabled: z.ZodOptional<z.ZodBoolean>
						timeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>
						alwaysAllow: z.ZodDefault<z.ZodArray<z.ZodString, "many">>
						watchPaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
						disabledTools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>
					} & {
						type: z.ZodOptional<z.ZodEnum<["streamable-http"]>>
						url: z.ZodString
						headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
						command: z.ZodOptional<z.ZodUndefined>
						args: z.ZodOptional<z.ZodUndefined>
						env: z.ZodOptional<z.ZodUndefined>
					},
					"strip",
					z.ZodTypeAny,
					{
						url: string
						disabledTools: string[]
						timeout: number
						alwaysAllow: string[]
						command?: undefined
						type?: "streamable-http" | undefined
						env?: undefined
						headers?: Record<string, string> | undefined
						args?: undefined
						disabled?: boolean | undefined
						watchPaths?: string[] | undefined
					},
					{
						url: string
						command?: undefined
						type?: "streamable-http" | undefined
						disabledTools?: string[] | undefined
						timeout?: number | undefined
						env?: undefined
						headers?: Record<string, string> | undefined
						args?: undefined
						disabled?: boolean | undefined
						alwaysAllow?: string[] | undefined
						watchPaths?: string[] | undefined
					}
				>,
				{
					type: "streamable-http"
					url: string
					disabledTools: string[]
					timeout: number
					alwaysAllow: string[]
					command?: undefined
					env?: undefined
					headers?: Record<string, string> | undefined
					args?: undefined
					disabled?: boolean | undefined
					watchPaths?: string[] | undefined
				},
				{
					url: string
					command?: undefined
					type?: "streamable-http" | undefined
					disabledTools?: string[] | undefined
					timeout?: number | undefined
					env?: undefined
					headers?: Record<string, string> | undefined
					args?: undefined
					disabled?: boolean | undefined
					alwaysAllow?: string[] | undefined
					watchPaths?: string[] | undefined
				}
			>,
			{
				type: "streamable-http"
				url: string
				disabledTools: string[]
				timeout: number
				alwaysAllow: string[]
				command?: undefined
				env?: undefined
				headers?: Record<string, string> | undefined
				args?: undefined
				disabled?: boolean | undefined
				watchPaths?: string[] | undefined
			},
			{
				url: string
				command?: undefined
				type?: "streamable-http" | undefined
				disabledTools?: string[] | undefined
				timeout?: number | undefined
				env?: undefined
				headers?: Record<string, string> | undefined
				args?: undefined
				disabled?: boolean | undefined
				alwaysAllow?: string[] | undefined
				watchPaths?: string[] | undefined
			}
		>,
	]
>
export declare class McpHub {
	private providerRef
	private disposables
	private settingsWatcher?
	private fileWatchers
	private projectMcpWatcher?
	private isDisposed
	connections: McpConnection[]
	isConnecting: boolean
	private refCount
	private configChangeDebounceTimers
	private isProgrammaticUpdate
	private flagResetTimer?
	private sanitizedNameRegistry
	private initializationPromise
	constructor(provider: ClineProvider)
	/**
	 * Waits until all MCP servers have finished their initial connection attempts.
	 * Each server individually handles its own timeout, so this will not block indefinitely.
	 */
	waitUntilReady(): Promise<void>
	/**
	 * Registers a client (e.g., ClineProvider) using this hub.
	 * Increments the reference count.
	 */
	registerClient(): void
	/**
	 * Unregisters a client. Decrements the reference count.
	 * If the count reaches zero, disposes the hub.
	 */
	unregisterClient(): Promise<void>
	/**
	 * Validates and normalizes server configuration
	 * @param config The server configuration to validate
	 * @param serverName Optional server name for error messages
	 * @returns The validated configuration
	 * @throws Error if the configuration is invalid
	 */
	private validateServerConfig
	/**
	 * Formats and displays error messages to the user
	 * @param message The error message prefix
	 * @param error The error object
	 */
	private showErrorMessage
	setupWorkspaceFoldersWatcher(): void
	/**
	 * Debounced wrapper for handling config file changes
	 */
	private debounceConfigChange
	private handleConfigFileChange
	private watchProjectMcpFile
	private updateProjectMcpServers
	private cleanupProjectMcpServers
	getServers(): McpServer[]
	getAllServers(): McpServer[]
	getMcpServersPath(): Promise<string>
	getMcpSettingsFilePath(): Promise<string>
	private watchMcpSettingsFile
	private initializeMcpServers
	private initializeGlobalMcpServers
	private getProjectMcpPath
	private initializeProjectMcpServers
	/**
	 * Creates a placeholder connection for disabled servers or when MCP is globally disabled
	 * @param name The server name
	 * @param config The server configuration
	 * @param source The source of the server (global or project)
	 * @param reason The reason for creating a placeholder (mcpDisabled or serverDisabled)
	 * @returns A placeholder DisconnectedMcpConnection object
	 */
	private createPlaceholderConnection
	/**
	 * Checks if MCP is globally enabled
	 * @returns Promise<boolean> indicating if MCP is enabled
	 */
	private isMcpEnabled
	private connectToServer
	private appendErrorMessage
	/**
	 * Helper method to find a connection by server name and source
	 * @param serverName The name of the server to find
	 * @param source Optional source to filter by (global or project)
	 * @returns The matching connection or undefined if not found
	 */
	private findConnection
	/**
	 * Find a connection by sanitized server name.
	 * This is used when parsing MCP tool responses where the server name has been
	 * sanitized (e.g., hyphens replaced with underscores) for API compliance.
	 * Uses fuzzy matching to handle cases where models convert hyphens to underscores.
	 * @param sanitizedServerName The sanitized server name from the API tool call
	 * @returns The original server name if found, or null if no match
	 */
	findServerNameBySanitizedName(sanitizedServerName: string): string | null
	private fetchToolsList
	private fetchResourcesList
	private fetchResourceTemplatesList
	deleteConnection(name: string, source?: "global" | "project"): Promise<void>
	updateServerConnections(
		newServers: Record<string, any>,
		source?: "global" | "project",
		manageConnectingState?: boolean,
	): Promise<void>
	private setupFileWatcher
	private removeAllFileWatchers
	private removeFileWatchersForServer
	restartConnection(serverName: string, source?: "global" | "project"): Promise<void>
	refreshAllConnections(): Promise<void>
	private notifyWebviewOfServerChanges
	toggleServerDisabled(serverName: string, disabled: boolean, source?: "global" | "project"): Promise<void>
	/**
	 * Helper method to read a server's configuration from the appropriate settings file
	 * @param serverName The name of the server to read
	 * @param source Whether to read from the global or project config
	 * @returns The validated server configuration
	 */
	private readServerConfigFromFile
	/**
	 * Helper method to update a server's configuration in the appropriate settings file
	 * @param serverName The name of the server to update
	 * @param configUpdate The configuration updates to apply
	 * @param source Whether to update the global or project config
	 */
	private updateServerConfig
	updateServerTimeout(serverName: string, timeout: number, source?: "global" | "project"): Promise<void>
	deleteServer(serverName: string, source?: "global" | "project"): Promise<void>
	readResource(serverName: string, uri: string, source?: "global" | "project"): Promise<McpResourceResponse>
	callTool(
		serverName: string,
		toolName: string,
		toolArguments?: Record<string, unknown>,
		source?: "global" | "project",
	): Promise<McpToolCallResponse>
	/**
	 * Helper method to update a specific tool list (alwaysAllow or disabledTools)
	 * in the appropriate settings file.
	 * @param serverName The name of the server to update
	 * @param source Whether to update the global or project config
	 * @param toolName The name of the tool to add or remove
	 * @param listName The name of the list to modify ("alwaysAllow" or "disabledTools")
	 * @param addTool Whether to add (true) or remove (false) the tool from the list
	 */
	private updateServerToolList
	toggleToolAlwaysAllow(
		serverName: string,
		source: "global" | "project",
		toolName: string,
		shouldAllow: boolean,
	): Promise<void>
	toggleToolEnabledForPrompt(
		serverName: string,
		source: "global" | "project",
		toolName: string,
		isEnabled: boolean,
	): Promise<void>
	/**
	 * Handles enabling/disabling MCP globally
	 * @param enabled Whether MCP should be enabled or disabled
	 * @returns Promise<void>
	 */
	handleMcpEnabledChange(enabled: boolean): Promise<void>
	dispose(): Promise<void>
}
//# sourceMappingURL=McpHub.d.ts.map
