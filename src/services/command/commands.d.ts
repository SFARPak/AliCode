export interface Command {
	name: string
	content: string
	source: "global" | "project" | "built-in"
	filePath: string
	description?: string
	argumentHint?: string
	mode?: string
}
/**
 * Get all available commands from built-in, global, and project directories
 * Priority order: project > global > built-in (later sources override earlier ones)
 */
export declare function getCommands(cwd: string): Promise<Command[]>
/**
 * Get a specific command by name (optimized to avoid scanning all commands)
 * Priority order: project > global > built-in
 */
export declare function getCommand(cwd: string, name: string): Promise<Command | undefined>
/**
 * Get command names for autocomplete
 */
export declare function getCommandNames(cwd: string): Promise<string[]>
/**
 * Extract command name from filename (strip .md extension only)
 */
export declare function getCommandNameFromFile(filename: string): string
/**
 * Check if a file is a markdown file
 */
export declare function isMarkdownFile(filename: string): boolean
//# sourceMappingURL=commands.d.ts.map
