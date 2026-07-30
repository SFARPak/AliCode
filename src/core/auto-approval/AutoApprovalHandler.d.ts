import { GlobalState, ClineMessage, ClineAsk } from "@ali-code/types"
import { ClineAskResponse } from "../../shared/WebviewMessage"
export interface AutoApprovalResult {
	shouldProceed: boolean
	requiresApproval: boolean
	approvalType?: "requests" | "cost"
	approvalCount?: number | string
}
export declare class AutoApprovalHandler {
	private lastResetMessageIndex
	private consecutiveAutoApprovedRequestsCount
	private consecutiveAutoApprovedCost
	/**
	 * Check if auto-approval limits have been reached and handle user approval if needed
	 */
	checkAutoApprovalLimits(
		state: GlobalState | undefined,
		messages: ClineMessage[],
		askForApproval: (
			type: ClineAsk,
			data: string,
		) => Promise<{
			response: ClineAskResponse
			text?: string
			images?: string[]
		}>,
	): Promise<AutoApprovalResult>
	/**
	 * Calculate request count and check if limit is exceeded
	 */
	private checkRequestLimit
	/**
	 * Calculate current cost and check if limit is exceeded
	 */
	private checkCostLimit
	/**
	 * Reset the tracking (typically called when starting a new task)
	 */
	resetRequestCount(): void
	/**
	 * Get current approval state for debugging/testing
	 */
	getApprovalState(): {
		requestCount: number
		currentCost: number
	}
}
//# sourceMappingURL=AutoApprovalHandler.d.ts.map
