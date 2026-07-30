"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.aggregateTaskCostsRecursive = aggregateTaskCostsRecursive
/**
 * Recursively aggregate costs for a task and all its subtasks.
 *
 * @param taskId - The task ID to aggregate costs for
 * @param getTaskHistory - Function to load HistoryItem by task ID
 * @param visited - Set to prevent circular references
 * @returns Aggregated cost information
 */
async function aggregateTaskCostsRecursive(taskId, getTaskHistory, visited = new Set()) {
	// Prevent infinite loops
	if (visited.has(taskId)) {
		console.warn(`[aggregateTaskCostsRecursive] Circular reference detected: ${taskId}`)
		return { ownCost: 0, childrenCost: 0, totalCost: 0 }
	}
	visited.add(taskId)
	// Load this task's history
	const history = await getTaskHistory(taskId)
	if (!history) {
		console.warn(`[aggregateTaskCostsRecursive] Task ${taskId} not found`)
		return { ownCost: 0, childrenCost: 0, totalCost: 0 }
	}
	const ownCost = history.totalCost || 0
	let childrenCost = 0
	const childBreakdown = {}
	// Recursively aggregate child costs
	if (history.childIds && history.childIds.length > 0) {
		for (const childId of history.childIds) {
			const childAggregated = await aggregateTaskCostsRecursive(childId, getTaskHistory, new Set(visited))
			childrenCost += childAggregated.totalCost
			childBreakdown[childId] = childAggregated
		}
	}
	const result = {
		ownCost,
		childrenCost,
		totalCost: ownCost + childrenCost,
		childBreakdown,
	}
	return result
}
