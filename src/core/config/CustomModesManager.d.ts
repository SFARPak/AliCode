import * as vscode from "vscode"
import { type ModeConfig, type PromptComponent } from "@ali-code/types"
interface ExportResult {
	success: boolean
	yaml?: string
	error?: string
}
interface ImportResult {
	success: boolean
	slug?: string
	error?: string
}
export declare class CustomModesManager {
	private readonly context
	private readonly onUpdate
	private static readonly cacheTTL
	private disposables
	private isWriting
	private writeQueue
	private cachedModes
	private cachedAt
	constructor(context: vscode.ExtensionContext, onUpdate: () => Promise<void>)
	private queueWrite
	private processWriteQueue
	private getWorkspaceRoomodes
	/**
	 * Regex pattern for problematic characters that need to be cleaned from YAML content
	 * Includes:
	 * - \u00A0: Non-breaking space
	 * - \u200B-\u200D: Zero-width spaces and joiners
	 * - \u2010-\u2015, \u2212: Various dash characters
	 * - \u2018-\u2019: Smart single quotes
	 * - \u201C-\u201D: Smart double quotes
	 */
	private static readonly PROBLEMATIC_CHARS_REGEX
	/**
	 * Clean invisible and problematic characters from YAML content
	 */
	private cleanInvisibleCharacters
	/**
	 * Parse YAML content with enhanced error handling and preprocessing
	 */
	private parseYamlSafely
	private loadModesFromFile
	private mergeCustomModes
	getCustomModesFilePath(): Promise<string>
	private watchCustomModesFiles
	getCustomModes(): Promise<ModeConfig[]>
	updateCustomMode(slug: string, config: ModeConfig): Promise<void>
	private updateModesInFile
	private refreshMergedState
	deleteCustomMode(slug: string): Promise<void>
	/**
	 * Deletes the rules folder for a specific mode
	 * @param slug - The mode slug
	 * @param mode - The mode configuration to determine the scope
	 */
	private deleteRulesFolder
	resetCustomModes(): Promise<void>
	/**
	 * Checks if a mode has associated rules files in the .ali/rules-{slug}/ directory
	 * @param slug - The mode identifier to check
	 * @returns True if the mode has rules files with content, false otherwise
	 */
	checkRulesDirectoryHasContent(slug: string): Promise<boolean>
	/**
	 * Exports a mode configuration with its associated rules files into a shareable YAML format
	 * @param slug - The mode identifier to export
	 * @param customPrompts - Optional custom prompts to merge into the export
	 * @returns Success status with YAML content or error message
	 */
	exportModeWithRules(slug: string, customPrompts?: PromptComponent): Promise<ExportResult>
	/**
	 * Helper method to import rules files for a mode
	 * @param importMode - The mode being imported
	 * @param rulesFiles - The rules files to import
	 * @param source - The import source ("global" or "project")
	 */
	private importRulesFiles
	/**
	 * Imports modes from YAML content, including their associated rules files
	 * @param yamlContent - The YAML content containing mode configurations
	 * @param source - Target level for import: "global" (all projects) or "project" (current workspace only)
	 * @returns Success status with optional error message
	 */
	importModeWithRules(yamlContent: string, source?: "global" | "project"): Promise<ImportResult>
	private clearCache
	dispose(): void
}
export {}
//# sourceMappingURL=CustomModesManager.d.ts.map
