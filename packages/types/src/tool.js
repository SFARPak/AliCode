import { z } from "zod"
/**
 * ToolGroup
 */
export const toolGroups = ["read", "edit", "command", "mcp", "modes"]
export const toolGroupsSchema = z.enum(toolGroups)
/**
 * Tool groups that have been removed but may still exist in user config files.
 * Used by schema preprocessing to silently strip these before validation,
 * preventing errors for users with older configs.
 */
export const deprecatedToolGroups = ["browser"]
/**
 * ToolName
 */
export const toolNames = [
	"execute_command",
	"read_file",
	"read_command_output",
	"write_to_file",
	"apply_diff",
	"edit",
	"search_and_replace",
	"search_replace",
	"edit_file",
	"apply_patch",
	"search_files",
	"list_files",
	"use_mcp_tool",
	"access_mcp_resource",
	"ask_followup_question",
	"attempt_completion",
	"switch_mode",
	"new_task",
	"codebase_search",
	"update_todo_list",
	"run_slash_command",
	"skill",
	"generate_image",
	"custom_tool",
]
export const toolNamesSchema = z.enum(toolNames)
/**
 * ToolUsage
 */
export const toolUsageSchema = z.record(
	toolNamesSchema,
	z.object({
		attempts: z.number(),
		failures: z.number(),
	}),
)
