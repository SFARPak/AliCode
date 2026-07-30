/**
 * WorktreeService
 *
 * Platform-agnostic service for git worktree operations.
 * Uses simple-git and native CLI commands - no VSCode dependencies.
 */
import type { BranchInfo, CreateWorktreeOptions, Worktree, WorktreeResult } from "./types.js"
/**
 * Service for managing git worktrees.
 * All methods are platform-agnostic and don't depend on VSCode APIs.
 */
export declare class WorktreeService {
	/**
	 * Check if git is installed on the system
	 */
	checkGitInstalled(): Promise<boolean>
	/**
	 * Check if a directory is a git repository.
	 */
	checkGitRepo(cwd: string): Promise<boolean>
	/**
	 * Get the git repository root path.
	 */
	getGitRootPath(cwd: string): Promise<string | null>
	/**
	 * Get the current worktree path.
	 */
	getCurrentWorktreePath(cwd: string): Promise<string | null>
	/**
	 * Get the current branch name.
	 */
	getCurrentBranch(cwd: string): Promise<string | null>
	/**
	 * List all worktrees in the repository
	 */
	listWorktrees(cwd: string): Promise<Worktree[]>
	/**
	 * Create a new worktree
	 */
	createWorktree(cwd: string, options: CreateWorktreeOptions): Promise<WorktreeResult>
	/**
	 * Delete a worktree
	 */
	deleteWorktree(cwd: string, worktreePath: string, force?: boolean): Promise<WorktreeResult>
	/**
	 * Get available branches
	 * @param cwd - Current working directory
	 * @param includeWorktreeBranches - If true, include branches already checked out in worktrees (useful for base branch selection)
	 */
	getAvailableBranches(cwd: string, includeWorktreeBranches?: boolean): Promise<BranchInfo>
	/**
	 * Checkout a branch in the current worktree
	 */
	checkoutBranch(cwd: string, branch: string): Promise<WorktreeResult>
	/**
	 * Parse git worktree list --porcelain output
	 */
	private parseWorktreeOutput
	/**
	 * Normalize a path for comparison (handle trailing slashes, etc.)
	 */
	private normalizePath
}
export declare const worktreeService: WorktreeService
//# sourceMappingURL=worktree-service.d.ts.map
