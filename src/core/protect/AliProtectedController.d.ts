export declare const SHIELD_SYMBOL = "\uD83D\uDEE1"
/**
 * Controls write access to Ali configuration files by enforcing protection patterns.
 * Prevents auto-approved modifications to sensitive Ali configuration files.
 */
export declare class AliProtectedController {
	private cwd
	private ignoreInstance
	private static readonly PROTECTED_PATTERNS
	constructor(cwd: string)
	/**
	 * Check if a file is write-protected
	 * @param filePath - Path to check (relative to cwd)
	 * @returns true if file is write-protected, false otherwise
	 */
	isWriteProtected(filePath: string): boolean
	/**
	 * Get set of write-protected files from a list
	 * @param paths - Array of paths to filter (relative to cwd)
	 * @returns Set of protected file paths
	 */
	getProtectedFiles(paths: string[]): Set<string>
	/**
	 * Filter an array of paths, marking which ones are protected
	 * @param paths - Array of paths to check (relative to cwd)
	 * @returns Array of objects with path and protection status
	 */
	annotatePathsWithProtection(paths: string[]): Array<{
		path: string
		isProtected: boolean
	}>
	/**
	 * Get display message for protected file operations
	 */
	getProtectionMessage(): string
	/**
	 * Get formatted instructions about protected files for the LLM
	 * @returns Formatted instructions about file protection
	 */
	getInstructions(): string
	/**
	 * Get the list of protected patterns (for testing/debugging)
	 */
	static getProtectedPatterns(): readonly string[]
}
//# sourceMappingURL=AliProtectedController.d.ts.map
