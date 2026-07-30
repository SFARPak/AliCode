import { z } from "zod"
/**
 * Maximum number of MCP tools that can be enabled before showing a warning.
 * LLMs tend to perform poorly when given too many tools to choose from.
 */
export const MAX_MCP_TOOLS_THRESHOLD = 60
/**
 * McpExecutionStatus
 */
export const mcpExecutionStatusSchema = z.discriminatedUnion("status", [
	z.object({
		executionId: z.string(),
		status: z.literal("started"),
		serverName: z.string(),
		toolName: z.string(),
	}),
	z.object({
		executionId: z.string(),
		status: z.literal("output"),
		response: z.string(),
	}),
	z.object({
		executionId: z.string(),
		status: z.literal("completed"),
		response: z.string().optional(),
	}),
	z.object({
		executionId: z.string(),
		status: z.literal("error"),
		error: z.string().optional(),
	}),
])
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
export function countEnabledMcpTools(servers) {
	let serverCount = 0
	let toolCount = 0
	for (const server of servers) {
		// Skip disabled servers
		if (server.disabled) continue
		// Skip servers that are not connected
		if (server.status !== "connected") continue
		serverCount++
		// Count enabled tools on this server
		if (server.tools) {
			for (const tool of server.tools) {
				// Tool is enabled if enabledForPrompt is undefined (default) or true
				if (tool.enabledForPrompt !== false) {
					toolCount++
				}
			}
		}
	}
	return { enabledToolCount: toolCount, enabledServerCount: serverCount }
}
