/**
 * WorktreeIncludeService
 *
 * Platform-agnostic service for handling .worktreeinclude files.
 * Used to copy untracked files (like node_modules) when creating worktrees.
 */
import type { WorktreeIncludeStatus } from "./types.js"
/**
 * Progress info for copy tracking.
 * Shows activity without trying to predict total size (which is inaccurate).
 */
export interface CopyProgress {
	/** Current bytes copied */
	bytesCopied: number
	/** Name of current item being copied */
	itemName: string
}
/**
 * Callback for reporting copy progress during worktree file copying.
 */
export type CopyProgressCallback = (progress: CopyProgress) => void
/**
 * Service for managing .worktreeinclude files and copying files to new worktrees.
 * All methods are platform-agnostic and don't depend on VSCode APIs.
 */
export declare class WorktreeIncludeService {
	/**
	 * Check if .worktreeinclude exists in a directory
	 */
	hasWorktreeInclude(dir: string): Promise<boolean>
	/**
	 * Check if a specific branch has .worktreeinclude file (in git, not local filesystem)
	 * @param cwd - Current working directory (git repo)
	 * @param branch - Branch name to check
	 */
	branchHasWorktreeInclude(cwd: string, branch: string): Promise<boolean>
	/**
	 * Get the status of .worktreeinclude and .gitignore
	 */
	getStatus(dir: string): Promise<WorktreeIncludeStatus>
	/**
	 * Create a .worktreeinclude file with the specified content
	 */
	createWorktreeInclude(dir: string, content: string): Promise<void>
	/**
	 * Copy files matching .worktreeinclude patterns from source to target.
	 * Only copies files that are ALSO in .gitignore (to avoid copying tracked files).
	 *
	 * @param sourceDir - The source directory containing the files to copy
	 * @param targetDir - The target directory where files will be copied
	 * @param onProgress - Optional callback to report copy progress (size-based)
	 * @returns Array of copied file/directory paths
	 */
	copyWorktreeIncludeFiles(sourceDir: string, targetDir: string, onProgress?: CopyProgressCallback): Promise<string[]>
	/**
	 * Get the size on disk of a file (accounts for filesystem block allocation).
	 * Uses blksize to calculate actual disk usage including block overhead.
	 */
	private getSizeOnDisk
	/**
	 * Get the total size on disk of a file or directory (recursively).
	 * Uses native Node.js fs operations for cross-platform compatibility.
	 */
	private getPathSize
	/**
	 * Recursively calculate directory size on disk using Node.js fs.
	 * Uses parallel processing for better performance on large directories.
	 */
	private getDirectorySizeRecursive
	/**
	 * Get the current size of a directory (for progress tracking).
	 */
	private getCurrentDirectorySize
	/**
	 * Copy directory with progress polling using native cp command.
	 * Starts native copy and polls target directory size to report progress.
	 * Returns the updated bytesCopied count.
	 */
	private copyDirectoryWithProgress
	/**
	 * Parse a .gitignore-style file and return the patterns
	 */
	private parseIgnoreFile
	/**
	 * Find items in sourceDir that match both matchers
	 */
	private findMatchingItems
}
export declare const worktreeIncludeService: WorktreeIncludeService
//# sourceMappingURL=worktree-include.d.ts.map
