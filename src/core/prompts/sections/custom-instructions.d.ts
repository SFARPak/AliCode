import type { SystemPromptSettings } from "../types"
/**
 * Load rule files from global, project-local, and optionally subfolder directories
 * Rules are loaded in order: global first, then project-local, then subfolders (alphabetically)
 *
 * @param cwd - Current working directory (project root)
 * @param enableSubfolderRules - Whether to include rules from subdirectories (default: false)
 */
export declare function loadRuleFiles(cwd: string, enableSubfolderRules?: boolean): Promise<string>
export declare function addCustomInstructions(
	modeCustomInstructions: string,
	globalCustomInstructions: string,
	cwd: string,
	mode: string,
	options?: {
		language?: string
		rooIgnoreInstructions?: string
		settings?: SystemPromptSettings
	},
): Promise<string>
//# sourceMappingURL=custom-instructions.d.ts.map
