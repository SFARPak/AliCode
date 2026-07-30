import type OpenAI from "openai"
import type { ModeConfig, ToolName, ToolGroup, ModelInfo } from "@ali-code/types"
import type { CodeIndexManager } from "../../../services/code-index/manager"
import type { McpHub } from "../../../services/mcp/McpHub"
/**
 * Resolves a tool name to its canonical name.
 * If the tool name is an alias, returns the canonical tool name.
 * If it's already a canonical name or unknown, returns as-is.
 *
 * @param toolName - The tool name to resolve (may be an alias)
 * @returns The canonical tool name
 */
export declare function resolveToolAlias(toolName: string): string
/**
 * Applies tool alias resolution to a set of allowed tools.
 * Resolves any aliases to their canonical tool names.
 *
 * @param allowedTools - Set of tools that may contain aliases
 * @returns Set with aliases resolved to canonical names
 */
export declare function applyToolAliases(allowedTools: Set<string>): Set<string>
/**
 * Gets all tools in an alias group (including the canonical tool).
 * Uses pre-computed ALIAS_GROUPS map for O(1) lookup.
 *
 * @param toolName - Any tool name in the alias group
 * @returns Array of all tool names in the alias group, or just the tool if not aliased
 */
export declare function getToolAliasGroup(toolName: string): readonly string[]
/**
 * Apply model-specific tool customization to a set of allowed tools.
 *
 * This function filters tools based on model configuration:
 * 1. Removes tools specified in modelInfo.excludedTools
 * 2. Adds tools from modelInfo.includedTools (only if they belong to allowed groups)
 *
 * @param allowedTools - Set of tools already allowed by mode configuration
 * @param modeConfig - Current mode configuration to check tool groups
 * @param modelInfo - Model configuration with tool customization
 * @returns Modified set of tools after applying model customization
 */
/**
 * Result of applying model tool customization.
 * Contains the set of allowed tools and any alias renames to apply.
 */
interface ModelToolCustomizationResult {
	allowedTools: Set<string>
	/** Maps canonical tool name to alias name for tools that should be renamed */
	aliasRenames: Map<string, string>
}
export declare function applyModelToolCustomization(
	allowedTools: Set<string>,
	modeConfig: ModeConfig,
	modelInfo?: ModelInfo,
): ModelToolCustomizationResult
/**
 * Filters native tools based on mode restrictions and model customization.
 * This ensures native tools are filtered consistently with mode/tool permissions.
 *
 * @param nativeTools - Array of all available native tools
 * @param mode - Current mode slug
 * @param customModes - Custom mode configurations
 * @param experiments - Experiment flags
 * @param codeIndexManager - Code index manager for codebase_search feature check
 * @param settings - Additional settings for tool filtering (includes modelInfo for model-specific customization)
 * @param mcpHub - MCP hub for checking available resources
 * @returns Filtered array of tools allowed for the mode
 */
export declare function filterNativeToolsForMode(
	nativeTools: OpenAI.Chat.ChatCompletionTool[],
	mode: string | undefined,
	customModes: ModeConfig[] | undefined,
	experiments: Record<string, boolean> | undefined,
	codeIndexManager?: CodeIndexManager,
	settings?: Record<string, any>,
	mcpHub?: McpHub,
): OpenAI.Chat.ChatCompletionTool[]
/**
 * Checks if a specific tool is allowed in the current mode.
 * This is useful for dynamically filtering system prompt content.
 *
 * @param toolName - Name of the tool to check
 * @param mode - Current mode slug
 * @param customModes - Custom mode configurations
 * @param experiments - Experiment flags
 * @param codeIndexManager - Code index manager for codebase_search feature check
 * @param settings - Additional settings for tool filtering
 * @returns true if the tool is allowed in the mode, false otherwise
 */
export declare function isToolAllowedInMode(
	toolName: ToolName,
	mode: string | undefined,
	customModes: ModeConfig[] | undefined,
	experiments: Record<string, boolean> | undefined,
	codeIndexManager?: CodeIndexManager,
	settings?: Record<string, any>,
): boolean
/**
 * Gets the list of available tools from a specific tool group for the current mode.
 * This is useful for dynamically building system prompt content based on available tools.
 *
 * @param groupName - Name of the tool group to check
 * @param mode - Current mode slug
 * @param customModes - Custom mode configurations
 * @param experiments - Experiment flags
 * @param codeIndexManager - Code index manager for codebase_search feature check
 * @param settings - Additional settings for tool filtering
 * @returns Array of tool names that are available from the group
 */
export declare function getAvailableToolsInGroup(
	groupName: ToolGroup,
	mode: string | undefined,
	customModes: ModeConfig[] | undefined,
	experiments: Record<string, boolean> | undefined,
	codeIndexManager?: CodeIndexManager,
	settings?: Record<string, any>,
): ToolName[]
/**
 * Filters MCP tools based on whether use_mcp_tool is allowed in the current mode.
 *
 * @param mcpTools - Array of MCP tools
 * @param mode - Current mode slug
 * @param customModes - Custom mode configurations
 * @param experiments - Experiment flags
 * @returns Filtered array of MCP tools if use_mcp_tool is allowed, empty array otherwise
 */
export declare function filterMcpToolsForMode(
	mcpTools: OpenAI.Chat.ChatCompletionTool[],
	mode: string | undefined,
	customModes: ModeConfig[] | undefined,
	experiments: Record<string, boolean> | undefined,
): OpenAI.Chat.ChatCompletionTool[]
export {}
//# sourceMappingURL=filter-tools-for-mode.d.ts.map
