"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.getMcpServerTools = getMcpServerTools
const mcp_name_1 = require("../../../../utils/mcp-name")
const json_schema_1 = require("../../../../utils/json-schema")
/**
 * Dynamically generates native tool definitions for all enabled tools across connected MCP servers.
 * Tools are deduplicated by name to prevent API errors. When the same server exists in both
 * global and project configs, project servers take priority (handled by McpHub.getServers()).
 *
 * @param mcpHub The McpHub instance containing connected servers.
 * @returns An array of OpenAI.Chat.ChatCompletionTool definitions.
 */
function getMcpServerTools(mcpHub) {
	if (!mcpHub) {
		return []
	}
	const servers = mcpHub.getServers()
	const tools = []
	// Track seen tool names to prevent duplicates (e.g., when same server exists in both global and project configs)
	const seenToolNames = new Set()
	for (const server of servers) {
		if (!server.tools) {
			continue
		}
		for (const tool of server.tools) {
			// Filter tools where tool.enabledForPrompt is not explicitly false
			if (tool.enabledForPrompt === false) {
				continue
			}
			// Build sanitized tool name for API compliance
			// The name is sanitized to conform to API requirements (e.g., Gemini's function name restrictions)
			const toolName = (0, mcp_name_1.buildMcpToolName)(server.name, tool.name)
			// Skip duplicate tool names - first occurrence wins (project servers come before global servers)
			if (seenToolNames.has(toolName)) {
				continue
			}
			seenToolNames.add(toolName)
			const originalSchema = tool.inputSchema
			// Normalize schema for JSON Schema 2020-12 compliance (type arrays → anyOf)
			let parameters
			if (originalSchema) {
				parameters = (0, json_schema_1.normalizeToolSchema)(originalSchema)
			} else {
				// No schema provided - create a minimal valid schema
				parameters = { type: "object", additionalProperties: false }
			}
			const toolDefinition = {
				type: "function",
				function: {
					name: toolName,
					description: tool.description,
					parameters: parameters,
				},
			}
			tools.push(toolDefinition)
		}
	}
	return tools
}
