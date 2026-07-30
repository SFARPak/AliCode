import type { ApiMessage } from "../task-persistence"
type Role = ApiMessage["role"]
/**
 * Non-destructively merges consecutive messages with the same role.
 *
 * Used for *API request shaping only* (do not use for storage), so rewind/edit operations
 * can still reference the original individual messages.
 */
export declare function mergeConsecutiveApiMessages(
	messages: ApiMessage[],
	options?: {
		roles?: Role[]
	},
): ApiMessage[]
export {}
//# sourceMappingURL=mergeConsecutiveApiMessages.d.ts.map
