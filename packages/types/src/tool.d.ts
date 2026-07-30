import { z } from "zod"
/**
 * ToolGroup
 */
export declare const toolGroups: readonly ["read", "edit", "command", "mcp", "modes"]
export declare const toolGroupsSchema: z.ZodEnum<["read", "edit", "command", "mcp", "modes"]>
/**
 * Tool groups that have been removed but may still exist in user config files.
 * Used by schema preprocessing to silently strip these before validation,
 * preventing errors for users with older configs.
 */
export declare const deprecatedToolGroups: readonly string[]
export type ToolGroup = z.infer<typeof toolGroupsSchema>
/**
 * ToolName
 */
export declare const toolNames: readonly [
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
export declare const toolNamesSchema: z.ZodEnum<
	[
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
>
export type ToolName = z.infer<typeof toolNamesSchema>
/**
 * ToolUsage
 */
export declare const toolUsageSchema: z.ZodRecord<
	z.ZodEnum<
		[
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
	>,
	z.ZodObject<
		{
			attempts: z.ZodNumber
			failures: z.ZodNumber
		},
		"strip",
		z.ZodTypeAny,
		{
			attempts: number
			failures: number
		},
		{
			attempts: number
			failures: number
		}
	>
>
export type ToolUsage = z.infer<typeof toolUsageSchema>
//# sourceMappingURL=tool.d.ts.map
