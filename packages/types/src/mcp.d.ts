import { z } from "zod"
/**
 * Maximum number of MCP tools that can be enabled before showing a warning.
 * LLMs tend to perform poorly when given too many tools to choose from.
 */
export declare const MAX_MCP_TOOLS_THRESHOLD = 60
/**
 * McpServerUse
 */
export interface McpServerUse {
	type: string
	serverName: string
	toolName?: string
	uri?: string
}
/**
 * McpExecutionStatus
 */
export declare const mcpExecutionStatusSchema: z.ZodDiscriminatedUnion<
	"status",
	[
		z.ZodObject<
			{
				executionId: z.ZodString
				status: z.ZodLiteral<"started">
				serverName: z.ZodString
				toolName: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				status: "started"
				executionId: string
				serverName: string
				toolName: string
			},
			{
				status: "started"
				executionId: string
				serverName: string
				toolName: string
			}
		>,
		z.ZodObject<
			{
				executionId: z.ZodString
				status: z.ZodLiteral<"output">
				response: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				status: "output"
				executionId: string
				response: string
			},
			{
				status: "output"
				executionId: string
				response: string
			}
		>,
		z.ZodObject<
			{
				executionId: z.ZodString
				status: z.ZodLiteral<"completed">
				response: z.ZodOptional<z.ZodString>
			},
			"strip",
			z.ZodTypeAny,
			{
				status: "completed"
				executionId: string
				response?: string | undefined
			},
			{
				status: "completed"
				executionId: string
				response?: string | undefined
			}
		>,
		z.ZodObject<
			{
				executionId: z.ZodString
				status: z.ZodLiteral<"error">
				error: z.ZodOptional<z.ZodString>
			},
			"strip",
			z.ZodTypeAny,
			{
				status: "error"
				executionId: string
				error?: string | undefined
			},
			{
				status: "error"
				executionId: string
				error?: string | undefined
			}
		>,
	]
>
export type McpExecutionStatus = z.infer<typeof mcpExecutionStatusSchema>
/**
 * McpServer
 */
export type McpServer = {
	name: string
	config: string
	status: "connected" | "connecting" | "disconnected"
	error?: string
	errorHistory?: McpErrorEntry[]
	tools?: McpTool[]
	resources?: McpResource[]
	resourceTemplates?: McpResourceTemplate[]
	disabled?: boolean
	timeout?: number
	source?: "global" | "project"
	projectPath?: string
	instructions?: string
}
export type McpTool = {
	name: string
	description?: string
	inputSchema?: object
	alwaysAllow?: boolean
	enabledForPrompt?: boolean
}
export type McpResource = {
	uri: string
	name: string
	mimeType?: string
	description?: string
}
export type McpResourceTemplate = {
	uriTemplate: string
	name: string
	description?: string
	mimeType?: string
}
export type McpResourceResponse = {
	_meta?: Record<string, any>
	contents: Array<{
		uri: string
		mimeType?: string
		text?: string
		blob?: string
	}>
}
export type McpToolCallResponse = {
	_meta?: Record<string, any>
	content: Array<
		| {
				type: "text"
				text: string
		  }
		| {
				type: "image"
				data: string
				mimeType: string
		  }
		| {
				type: "audio"
				data: string
				mimeType: string
		  }
		| {
				type: "resource"
				resource: {
					uri: string
					mimeType?: string
					text?: string
					blob?: string
				}
		  }
	>
	isError?: boolean
}
export type McpErrorEntry = {
	message: string
	timestamp: number
	level: "error" | "warn" | "info"
}
/**
 * Result of counting enabled MCP tools across servers.
 */
export interface EnabledMcpToolsCount {
	/** Number of enabled and connected MCP servers */
	enabledServerCount: number
	/** Total number of enabled tools across all enabled servers */
	enabledToolCount: number
}
/**
 * Count the number of enabled MCP tools across all enabled and connected servers.
 * This is a pure function that can be used in both backend and frontend contexts.
 *
 * @param servers - Array of MCP server objects
 * @returns Object with enabledToolCount and enabledServerCount
 *
 * @example
 * const { enabledToolCount, enabledServerCount } = countEnabledMcpTools(mcpServers)
 * if (enabledToolCount > MAX_MCP_TOOLS_THRESHOLD) {
 *   // Show warning
 * }
 */
export declare function countEnabledMcpTools(servers: McpServer[]): EnabledMcpToolsCount
//# sourceMappingURL=mcp.d.ts.map
