/**
 * Worktree Handlers
 *
 * VSCode-specific handlers that bridge webview messages to the core worktree services.
 * These handlers handle VSCode-specific logic like opening folders and managing state.
 */
import type {
	WorktreeResult,
	BranchInfo,
	WorktreeIncludeStatus,
	WorktreeListResponse,
	WorktreeDefaultsResponse,
} from "@ali-code/types"
import { type CopyProgressCallback } from "@ali-code/core"
import type { ClineProvider } from "../ClineProvider"
export declare function handleListWorktrees(provider: ClineProvider): Promise<WorktreeListResponse>
export declare function handleCreateWorktree(
	provider: ClineProvider,
	options: {
		path: string
		branch?: string
		baseBranch?: string
		createNewBranch?: boolean
	},
	onCopyProgress?: CopyProgressCallback,
): Promise<WorktreeResult>
export declare function handleDeleteWorktree(
	provider: ClineProvider,
	worktreePath: string,
	force?: boolean,
): Promise<WorktreeResult>
export declare function handleSwitchWorktree(
	provider: ClineProvider,
	worktreePath: string,
	newWindow: boolean,
): Promise<WorktreeResult>
export declare function handleGetAvailableBranches(provider: ClineProvider): Promise<BranchInfo>
export declare function handleGetWorktreeDefaults(provider: ClineProvider): Promise<WorktreeDefaultsResponse>
export declare function handleGetWorktreeIncludeStatus(provider: ClineProvider): Promise<WorktreeIncludeStatus>
export declare function handleCheckBranchWorktreeInclude(provider: ClineProvider, branch: string): Promise<boolean>
export declare function handleCreateWorktreeInclude(provider: ClineProvider, content: string): Promise<WorktreeResult>
export declare function handleCheckoutBranch(provider: ClineProvider, branch: string): Promise<WorktreeResult>
//# sourceMappingURL=handlers.d.ts.map
