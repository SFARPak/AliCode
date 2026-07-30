import * as vscode from "vscode"
import {
	type GroupEntry,
	type ModeConfig,
	type CustomModePrompts,
	type ToolGroup,
	type PromptComponent,
} from "@ali-code/types"
export type Mode = string
export declare function getGroupName(group: GroupEntry): ToolGroup
export declare function getToolsForMode(groups: readonly GroupEntry[]): string[]
export declare const modes: readonly {
	name: string
	slug: string
	roleDefinition: string
	groups: (
		| "command"
		| "read"
		| "edit"
		| "mcp"
		| "modes"
		| [
				"command" | "read" | "edit" | "mcp" | "modes",
				{
					description?: string | undefined
					fileRegex?: string | undefined
				},
		  ]
	)[]
	description?: string | undefined
	source?: "global" | "project" | undefined
	whenToUse?: string | undefined
	customInstructions?: string | undefined
}[]
export declare const defaultModeSlug: string
export declare function getModeBySlug(slug: string, customModes?: ModeConfig[]): ModeConfig | undefined
export declare function getModeConfig(slug: string, customModes?: ModeConfig[]): ModeConfig
export declare function getAllModes(customModes?: ModeConfig[]): ModeConfig[]
export declare function isCustomMode(slug: string, customModes?: ModeConfig[]): boolean
/**
 * Find a mode by its slug, don't fall back to built-in modes
 */
export declare function findModeBySlug(slug: string, modes: readonly ModeConfig[] | undefined): ModeConfig | undefined
/**
 * Get the mode selection based on the provided mode slug, prompt component, and custom modes.
 * If a custom mode is found, it takes precedence over the built-in modes.
 * If no custom mode is found, the built-in mode is used with partial merging from promptComponent.
 * If neither is found, the default mode is used.
 */
export declare function getModeSelection(
	mode: string,
	promptComponent?: PromptComponent,
	customModes?: ModeConfig[],
): {
	roleDefinition: string
	baseInstructions: string
	description: string
}
export declare class FileRestrictionError extends Error {
	constructor(mode: string, pattern: string, description: string | undefined, filePath: string, tool?: string)
}
export declare const defaultPrompts: Readonly<CustomModePrompts>
export declare function getAllModesWithPrompts(context: vscode.ExtensionContext): Promise<ModeConfig[]>
export declare function getFullModeDetails(
	modeSlug: string,
	customModes?: ModeConfig[],
	customModePrompts?: CustomModePrompts,
	options?: {
		cwd?: string
		globalCustomInstructions?: string
		language?: string
	},
): Promise<ModeConfig>
export declare function getRoleDefinition(modeSlug: string, customModes?: ModeConfig[]): string
export declare function getDescription(modeSlug: string, customModes?: ModeConfig[]): string
export declare function getWhenToUse(modeSlug: string, customModes?: ModeConfig[]): string
export declare function getCustomInstructions(modeSlug: string, customModes?: ModeConfig[]): string
//# sourceMappingURL=modes.d.ts.map
