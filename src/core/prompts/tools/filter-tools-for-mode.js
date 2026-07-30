"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.resolveToolAlias = resolveToolAlias
exports.applyToolAliases = applyToolAliases
exports.getToolAliasGroup = getToolAliasGroup
exports.applyModelToolCustomization = applyModelToolCustomization
exports.filterNativeToolsForMode = filterNativeToolsForMode
exports.isToolAllowedInMode = isToolAllowedInMode
exports.getAvailableToolsInGroup = getAvailableToolsInGroup
exports.filterMcpToolsForMode = filterMcpToolsForMode
const modes_1 = require("../../../shared/modes")
const tools_1 = require("../../../shared/tools")
const modes_2 = require("../../../shared/modes")
const validateToolUse_1 = require("../../../core/tools/validateToolUse")
/**
 * Reverse lookup map - maps alias name to canonical tool name.
 * Built once at module load from the central TOOL_ALIASES constant.
 */
const ALIAS_TO_CANONICAL = new Map(Object.entries(tools_1.TOOL_ALIASES).map(([alias, canonical]) => [alias, canonical]))
/**
 * Canonical to aliases map - maps canonical tool name to array of alias names.
 * Built once at module load from the central TOOL_ALIASES constant.
 */
const CANONICAL_TO_ALIASES = new Map()
// Build the reverse mapping (canonical -> aliases)
for (const [alias, canonical] of Object.entries(tools_1.TOOL_ALIASES)) {
	const existing = CANONICAL_TO_ALIASES.get(canonical) ?? []
	existing.push(alias)
	CANONICAL_TO_ALIASES.set(canonical, existing)
}
/**
 * Pre-computed alias groups map - maps any tool name (canonical or alias) to its full group.
 * Built once at module load for O(1) lookup.
 */
const ALIAS_GROUPS = new Map()
// Build alias groups for all tools
for (const [canonical, aliases] of CANONICAL_TO_ALIASES.entries()) {
	const group = Object.freeze([canonical, ...aliases])
	// Map canonical to group
	ALIAS_GROUPS.set(canonical, group)
	// Map each alias to the same group
	for (const alias of aliases) {
		ALIAS_GROUPS.set(alias, group)
	}
}
/**
 * Cache for renamed tool definitions.
 * Maps "canonicalName:aliasName" to the pre-built tool definition.
 * This avoids creating new objects via spread operators on every assistant message.
 */
const RENAMED_TOOL_CACHE = new Map()
/**
 * Gets or creates a renamed tool definition with the alias name.
 * Uses RENAMED_TOOL_CACHE to avoid repeated object allocation.
 *
 * @param tool - The original tool definition
 * @param aliasName - The alias name to use
 * @returns Cached or newly created renamed tool definition
 */
function getOrCreateRenamedTool(tool, aliasName) {
	if (!("function" in tool) || !tool.function) {
		return tool
	}
	const cacheKey = `${tool.function.name}:${aliasName}`
	let renamedTool = RENAMED_TOOL_CACHE.get(cacheKey)
	if (!renamedTool) {
		renamedTool = {
			...tool,
			function: {
				...tool.function,
				name: aliasName,
			},
		}
		RENAMED_TOOL_CACHE.set(cacheKey, renamedTool)
	}
	return renamedTool
}
/**
 * Resolves a tool name to its canonical name.
 * If the tool name is an alias, returns the canonical tool name.
 * If it's already a canonical name or unknown, returns as-is.
 *
 * @param toolName - The tool name to resolve (may be an alias)
 * @returns The canonical tool name
 */
function resolveToolAlias(toolName) {
	const canonical = ALIAS_TO_CANONICAL.get(toolName)
	return canonical ?? toolName
}
/**
 * Applies tool alias resolution to a set of allowed tools.
 * Resolves any aliases to their canonical tool names.
 *
 * @param allowedTools - Set of tools that may contain aliases
 * @returns Set with aliases resolved to canonical names
 */
function applyToolAliases(allowedTools) {
	const result = new Set()
	for (const tool of allowedTools) {
		// Resolve alias to canonical name
		result.add(resolveToolAlias(tool))
	}
	return result
}
/**
 * Gets all tools in an alias group (including the canonical tool).
 * Uses pre-computed ALIAS_GROUPS map for O(1) lookup.
 *
 * @param toolName - Any tool name in the alias group
 * @returns Array of all tool names in the alias group, or just the tool if not aliased
 */
function getToolAliasGroup(toolName) {
	return ALIAS_GROUPS.get(toolName) ?? [toolName]
}
function applyModelToolCustomization(allowedTools, modeConfig, modelInfo) {
	if (!modelInfo) {
		return { allowedTools, aliasRenames: new Map() }
	}
	const result = new Set(allowedTools)
	const aliasRenames = new Map()
	// Apply excluded tools (remove from allowed set)
	if (modelInfo.excludedTools && modelInfo.excludedTools.length > 0) {
		modelInfo.excludedTools.forEach((tool) => {
			const resolvedTool = resolveToolAlias(tool)
			result.delete(resolvedTool)
		})
	}
	// Apply included tools (add to allowed set, but only if they belong to an allowed group)
	if (modelInfo.includedTools && modelInfo.includedTools.length > 0) {
		// Build a map of tool -> group for all tools in TOOL_GROUPS (including customTools)
		const toolToGroup = new Map()
		for (const [groupName, groupConfig] of Object.entries(tools_1.TOOL_GROUPS)) {
			// Add regular tools
			groupConfig.tools.forEach((tool) => {
				toolToGroup.set(tool, groupName)
			})
			// Add customTools (opt-in only tools)
			if (groupConfig.customTools) {
				groupConfig.customTools.forEach((tool) => {
					toolToGroup.set(tool, groupName)
				})
			}
		}
		// Get the list of allowed groups for this mode
		const allowedGroups = new Set(
			modeConfig.groups.map((groupEntry) => (Array.isArray(groupEntry) ? groupEntry[0] : groupEntry)),
		)
		// Add included tools only if they belong to an allowed group
		// If the tool was specified as an alias, track the rename
		modelInfo.includedTools.forEach((tool) => {
			const resolvedTool = resolveToolAlias(tool)
			const toolGroup = toolToGroup.get(resolvedTool)
			if (toolGroup && allowedGroups.has(toolGroup)) {
				result.add(resolvedTool)
				// If the tool was specified as an alias, rename it in the API
				if (tool !== resolvedTool) {
					aliasRenames.set(resolvedTool, tool)
				}
			}
		})
	}
	return { allowedTools: result, aliasRenames }
}
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
function filterNativeToolsForMode(nativeTools, mode, customModes, experiments, codeIndexManager, settings, mcpHub) {
	// Get mode configuration and all tools for this mode
	const modeSlug = mode ?? modes_2.defaultModeSlug
	let modeConfig = (0, modes_1.getModeBySlug)(modeSlug, customModes)
	// Fallback to default mode if current mode config is not found
	// This ensures the agent always has functional tools even if a custom mode is deleted
	// or configuration becomes corrupted
	if (!modeConfig) {
		modeConfig = (0, modes_1.getModeBySlug)(modes_2.defaultModeSlug, customModes)
	}
	// Get all tools for this mode (including always-available tools)
	const allToolsForMode = (0, modes_1.getToolsForMode)(modeConfig.groups)
	// Filter to only tools that pass permission checks
	let allowedToolNames = new Set(
		allToolsForMode.filter((tool) =>
			(0, validateToolUse_1.isToolAllowedForMode)(
				tool,
				modeSlug,
				customModes ?? [],
				undefined,
				undefined,
				experiments ?? {},
			),
		),
	)
	// Apply model-specific tool customization
	const modelInfo = settings?.modelInfo
	const { allowedTools: customizedTools, aliasRenames } = applyModelToolCustomization(
		allowedToolNames,
		modeConfig,
		modelInfo,
	)
	allowedToolNames = customizedTools
	// Conditionally exclude codebase_search if feature is disabled or not configured
	if (
		!codeIndexManager ||
		!(codeIndexManager.isFeatureEnabled && codeIndexManager.isFeatureConfigured && codeIndexManager.isInitialized)
	) {
		allowedToolNames.delete("codebase_search")
	}
	// Conditionally exclude update_todo_list if disabled in settings
	if (settings?.todoListEnabled === false) {
		allowedToolNames.delete("update_todo_list")
	}
	// Conditionally exclude generate_image if experiment is not enabled
	if (!experiments?.imageGeneration) {
		allowedToolNames.delete("generate_image")
	}
	// Conditionally exclude run_slash_command if experiment is not enabled
	if (!experiments?.runSlashCommand) {
		allowedToolNames.delete("run_slash_command")
	}
	// Remove tools that are explicitly disabled via the disabledTools setting
	if (settings?.disabledTools?.length) {
		for (const toolName of settings.disabledTools) {
			// Normalize aliases so disabling a legacy alias (e.g. "search_and_replace")
			// also disables the canonical tool (e.g. "edit").
			const resolvedToolName = resolveToolAlias(toolName)
			allowedToolNames.delete(resolvedToolName)
		}
	}
	// Conditionally exclude access_mcp_resource if MCP is not enabled or there are no resources
	if (!mcpHub || !hasAnyMcpResources(mcpHub)) {
		allowedToolNames.delete("access_mcp_resource")
	}
	// Filter native tools based on allowed tool names and apply alias renames
	const filteredTools = []
	for (const tool of nativeTools) {
		// Handle both ChatCompletionTool and ChatCompletionCustomTool
		if ("function" in tool && tool.function) {
			const toolName = tool.function.name
			if (allowedToolNames.has(toolName)) {
				// Check if this tool should be renamed to an alias
				const aliasName = aliasRenames.get(toolName)
				if (aliasName) {
					// Use cached renamed tool definition to avoid per-message object allocation
					filteredTools.push(getOrCreateRenamedTool(tool, aliasName))
				} else {
					filteredTools.push(tool)
				}
			}
		}
	}
	return filteredTools
}
/**
 * Helper function to check if any MCP server has resources available
 */
function hasAnyMcpResources(mcpHub) {
	const servers = mcpHub.getServers()
	return servers.some((server) => server.resources && server.resources.length > 0)
}
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
function isToolAllowedInMode(toolName, mode, customModes, experiments, codeIndexManager, settings) {
	const modeSlug = mode ?? modes_2.defaultModeSlug
	// Check if it's an always-available tool
	if (tools_1.ALWAYS_AVAILABLE_TOOLS.includes(toolName)) {
		// But still check for conditional exclusions
		if (toolName === "codebase_search") {
			return !!(
				codeIndexManager &&
				codeIndexManager.isFeatureEnabled &&
				codeIndexManager.isFeatureConfigured &&
				codeIndexManager.isInitialized
			)
		}
		if (toolName === "update_todo_list") {
			return settings?.todoListEnabled !== false
		}
		if (toolName === "generate_image") {
			return experiments?.imageGeneration === true
		}
		if (toolName === "run_slash_command") {
			return experiments?.runSlashCommand === true
		}
		return true
	}
	// Check if the tool is allowed by the mode's groups
	// Resolve to canonical name and check that single value
	const canonicalTool = resolveToolAlias(toolName)
	return (0, validateToolUse_1.isToolAllowedForMode)(
		canonicalTool,
		modeSlug,
		customModes ?? [],
		undefined,
		undefined,
		experiments ?? {},
	)
}
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
function getAvailableToolsInGroup(groupName, mode, customModes, experiments, codeIndexManager, settings) {
	const toolGroup = tools_1.TOOL_GROUPS[groupName]
	if (!toolGroup) {
		return []
	}
	return toolGroup.tools.filter((tool) =>
		isToolAllowedInMode(tool, mode, customModes, experiments, codeIndexManager, settings),
	)
}
/**
 * Filters MCP tools based on whether use_mcp_tool is allowed in the current mode.
 *
 * @param mcpTools - Array of MCP tools
 * @param mode - Current mode slug
 * @param customModes - Custom mode configurations
 * @param experiments - Experiment flags
 * @returns Filtered array of MCP tools if use_mcp_tool is allowed, empty array otherwise
 */
function filterMcpToolsForMode(mcpTools, mode, customModes, experiments) {
	const modeSlug = mode ?? modes_2.defaultModeSlug
	// MCP tools are always in the mcp group, check if use_mcp_tool is allowed
	const isMcpAllowed = (0, validateToolUse_1.isToolAllowedForMode)(
		"use_mcp_tool",
		modeSlug,
		customModes ?? [],
		undefined,
		undefined,
		experiments ?? {},
	)
	return isMcpAllowed ? mcpTools : []
}
