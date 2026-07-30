/**
 * Worktree Module
 *
 * VSCode-specific handlers for git worktree management.
 * Bridges webview messages to the platform-agnostic core services.
 */
export {
	handleListWorktrees,
	handleCreateWorktree,
	handleDeleteWorktree,
	handleSwitchWorktree,
	handleGetAvailableBranches,
	handleGetWorktreeDefaults,
	handleGetWorktreeIncludeStatus,
	handleCheckBranchWorktreeInclude,
	handleCreateWorktreeInclude,
	handleCheckoutBranch,
} from "./handlers"
export type { WorktreeListResponse, WorktreeDefaultsResponse } from "@ali-code/types"
//# sourceMappingURL=index.d.ts.map
