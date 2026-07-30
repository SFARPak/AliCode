/**
 * Utilities for sanitizing MCP server and tool names to conform to
 * API function name requirements across all providers.
 */
/**
 * Separator used between MCP prefix, server name, and tool name.
 * We use "--" (double hyphen) because:
 * 1. It's allowed by all providers (dashes are permitted in function names)
 * 2. It won't conflict with underscores in sanitized server/tool names
 * 3. It's unique enough to be a reliable delimiter for parsing
 */
export declare const MCP_TOOL_SEPARATOR = "--"
/**
 * Prefix for all MCP tool function names.
 */
export declare const MCP_TOOL_PREFIX = "mcp"
/**
 * Normalize a string for comparison by treating hyphens and underscores as equivalent.
 * This is used to match tool names when models convert hyphens to underscores.
 *
 * @param name - The name to normalize
 * @returns The normalized name with all hyphens converted to underscores
 */
export declare function normalizeForComparison(name: string): string
/**
 * Normalize an MCP tool name by converting underscore separators back to hyphens.
 * This handles the case where models (especially Claude) convert hyphens to underscores
 * in tool names when using native tool calling.
 *
 * For example: "mcp__server__tool" -> "mcp--server--tool"
 *
 * This function uses fuzzy matching - it treats hyphens and underscores as equivalent
 * when normalizing the separator pattern.
 *
 * @param toolName - The tool name that may have underscore separators
 * @returns The normalized tool name with hyphen separators
 */
export declare function normalizeMcpToolName(toolName: string): string
/**
 * Check if a tool name is an MCP tool (starts with the MCP prefix and separator).
 * Uses fuzzy matching to handle both hyphen and underscore separators.
 *
 * @param toolName - The tool name to check
 * @returns true if the tool name starts with "mcp--" or "mcp__", false otherwise
 */
export declare function isMcpTool(toolName: string): boolean
/**
 * Sanitize a name to be safe for use in API function names.
 * This removes special characters and ensures the name starts correctly.
 *
 * Note: Hyphens are preserved since they are valid in function names.
 * Models may convert hyphens to underscores, but we handle this with
 * fuzzy matching when parsing tool names.
 *
 * @param name - The original name (e.g., MCP server name or tool name)
 * @returns A sanitized name that conforms to API requirements
 */
export declare function sanitizeMcpName(name: string): string
/**
 * Build a full MCP tool function name from server and tool names.
 * The format is: mcp--{sanitized_server_name}--{sanitized_tool_name}
 *
 * The total length is capped at 64 characters to conform to API limits.
 *
 * @param serverName - The MCP server name
 * @param toolName - The tool name
 * @returns A sanitized function name in the format mcp--serverName--toolName
 */
export declare function buildMcpToolName(serverName: string, toolName: string): string
/**
 * Parse an MCP tool function name back into server and tool names.
 * This handles both hyphen and underscore separators using fuzzy matching.
 *
 * @param mcpToolName - The full MCP tool name (e.g., "mcp--weather--get_forecast" or "mcp__weather__get_forecast")
 * @returns An object with serverName and toolName, or null if parsing fails
 */
export declare function parseMcpToolName(mcpToolName: string): {
	serverName: string
	toolName: string
} | null
/**
 * Check if two tool names match using fuzzy comparison.
 * Treats hyphens and underscores as equivalent.
 *
 * @param name1 - First tool name
 * @param name2 - Second tool name
 * @returns true if the names match (treating - and _ as equivalent)
 */
export declare function toolNamesMatch(name1: string, name2: string): boolean
//# sourceMappingURL=mcp-name.d.ts.map
