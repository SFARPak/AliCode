import type { HistoryItem } from "@ali-code/types"
export interface AggregatedCosts {
	ownCost: number
	childrenCost: number
	totalCost: number
	childBreakdown?: {
		[childId: string]: AggregatedCosts
	}
}
/**
 * Recursively aggregate costs for a task and all its subtasks.
 *
 * @param taskId - The task ID to aggregate costs for
 * @param getTaskHistory - Function to load HistoryItem by task ID
 * @param visited - Set to prevent circular references
 * @returns Aggregated cost information
 */
export declare function aggregateTaskCostsRecursive(
	taskId: string,
	getTaskHistory: (id: string) => Promise<HistoryItem | undefined>,
	visited?: Set<string>,
): Promise<AggregatedCosts>
//# sourceMappingURL=aggregateTaskCosts.d.ts.map
