export declare class ShellIntegrationManager {
	static terminalTmpDirs: Map<number, string>
	/**
	 * Initialize a temporary directory for ZDOTDIR
	 * @param env The environment variables object to modify
	 * @returns The path to the temporary directory
	 */
	static zshInitTmpDir(env: Record<string, string>): string
	/**
	 * Clean up a temporary directory used for ZDOTDIR
	 */
	static zshCleanupTmpDir(terminalId: number): boolean
	static clear(): void
	/**
	 * Gets the path to the shell integration script for a given shell type
	 * @param shell The shell type
	 * @returns The path to the shell integration script
	 */
	private static getShellIntegrationPath
}
//# sourceMappingURL=ShellIntegrationManager.d.ts.map
