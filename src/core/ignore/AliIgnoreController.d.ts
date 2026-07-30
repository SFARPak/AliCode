export declare const LOCK_TEXT_SYMBOL = "\uD83D\uDD12"
/**
 * Controls LLM access to files by enforcing ignore patterns.
 * Designed to be instantiated once in Cline.ts and passed to file manipulation services.
 * Uses the 'ignore' library to support standard .gitignore syntax in .aliignore files.
 */
export declare class AliIgnoreController {
	private cwd
	private ignoreInstance
	private disposables
	rooIgnoreContent: string | undefined
	constructor(cwd: string)
	/**
	 * Initialize the controller by loading custom patterns
	 * Must be called after construction and before using the controller
	 */
	initialize(): Promise<void>
	/**
	 * Set up the file watcher for .aliignore changes
	 */
	private setupFileWatcher
	/**
	 * Load custom patterns from .aliignore if it exists
	 */
	private loadAliIgnore
	/**
	 * Check if a file should be accessible to the LLM
	 * Automatically resolves symlinks
	 * @param filePath - Path to check (relative to cwd)
	 * @returns true if file is accessible, false if ignored
	 */
	validateAccess(filePath: string): boolean
	/**
	 * Check if a terminal command should be allowed to execute based on file access patterns
	 * @param command - Terminal command to validate
	 * @returns path of file that is being accessed if it is being accessed, undefined if command is allowed
	 */
	validateCommand(command: string): string | undefined
	/**
	 * Filter an array of paths, removing those that should be ignored
	 * @param paths - Array of paths to filter (relative to cwd)
	 * @returns Array of allowed paths
	 */
	filterPaths(paths: string[]): string[]
	/**
	 * Clean up resources when the controller is no longer needed
	 */
	dispose(): void
	/**
	 * Get formatted instructions about the .aliignore file for the LLM
	 * @returns Formatted instructions or undefined if .aliignore doesn't exist
	 */
	getInstructions(): string | undefined
}
//# sourceMappingURL=AliIgnoreController.d.ts.map
