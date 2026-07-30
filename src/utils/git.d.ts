import type { GitRepositoryInfo, GitCommit } from "@ali-code/types"
/**
 * Extracts git repository information from the workspace's .git directory
 * @param workspaceRoot The root path of the workspace
 * @returns Git repository information or empty object if not a git repository
 */
export declare function getGitRepositoryInfo(workspaceRoot: string): Promise<GitRepositoryInfo>
/**
 * Converts a git URL to HTTPS format
 * @param url The git URL to convert
 * @returns The URL in HTTPS format, or the original URL if conversion is not possible
 */
export declare function convertGitUrlToHttps(url: string): string
/**
 * Sanitizes a git URL to remove sensitive information like tokens
 * @param url The original git URL
 * @returns Sanitized URL
 */
export declare function sanitizeGitUrl(url: string): string
/**
 * Extracts repository name from a git URL
 * @param url The git URL
 * @returns Repository name or undefined
 */
export declare function extractRepositoryName(url: string): string
/**
 * Gets git repository information for the current VSCode workspace
 * @returns Git repository information or empty object if not available
 */
export declare function getWorkspaceGitInfo(): Promise<GitRepositoryInfo>
/**
 * Checks if Git is installed on the system by attempting to run git --version
 * @returns {Promise<boolean>} True if Git is installed and accessible, false otherwise
 * @example
 * const isGitInstalled = await checkGitInstalled();
 * if (!isGitInstalled) {
 *   console.log("Git is not installed");
 * }
 */
export declare function checkGitInstalled(): Promise<boolean>
export declare function searchCommits(query: string, cwd: string): Promise<GitCommit[]>
export declare function getCommitInfo(hash: string, cwd: string): Promise<string>
export declare function getWorkingState(cwd: string): Promise<string>
/**
 * Gets git status output with configurable file limit
 * @param cwd The working directory to check git status in
 * @param maxFiles Maximum number of file entries to include (0 = disabled)
 * @returns Git status string or null if not a git repository
 */
export declare function getGitStatus(cwd: string, maxFiles?: number): Promise<string | null>
//# sourceMappingURL=git.d.ts.map
