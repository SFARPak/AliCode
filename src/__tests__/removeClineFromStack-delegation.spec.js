"use strict"
// npx vitest run __tests__/removeClineFromStack-delegation.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const ClineProvider_1 = require("../core/webview/ClineProvider")
;(0, vitest_1.describe)("ClineProvider.removeClineFromStack() delegation awareness", () => {
	/**
	 * Helper to build a minimal mock provider with a single task on the stack.
	 * The task's parentTaskId and taskId are configurable.
	 */
	function buildMockProvider(opts) {
		const childTask = {
			taskId: opts.childTaskId,
			instanceId: "inst-1",
			parentTaskId: opts.parentTaskId,
			emit: vitest_1.vi.fn(),
			abortTask: vitest_1.vi.fn().mockResolvedValue(undefined),
		}
		const updateTaskHistory = vitest_1.vi.fn().mockResolvedValue([])
		const getTaskWithId = opts.getTaskWithIdError
			? vitest_1.vi.fn().mockRejectedValue(opts.getTaskWithIdError)
			: vitest_1.vi.fn().mockImplementation(async (id) => {
					if (id === opts.parentTaskId && opts.parentHistoryItem) {
						return { historyItem: { ...opts.parentHistoryItem } }
					}
					throw new Error("Task not found")
				})
		const provider = {
			clineStack: [childTask],
			taskEventListeners: new Map(),
			log: vitest_1.vi.fn(),
			getTaskWithId,
			updateTaskHistory,
		}
		return { provider, childTask, updateTaskHistory, getTaskWithId }
	}
	;(0, vitest_1.it)("repairs parent metadata (delegated → active) when a delegated child is removed", async () => {
		const { provider, updateTaskHistory, getTaskWithId } = buildMockProvider({
			childTaskId: "child-1",
			parentTaskId: "parent-1",
			parentHistoryItem: {
				id: "parent-1",
				task: "Parent task",
				ts: 1000,
				number: 1,
				tokensIn: 0,
				tokensOut: 0,
				totalCost: 0,
				status: "delegated",
				awaitingChildId: "child-1",
				delegatedToId: "child-1",
				childIds: ["child-1"],
			},
		})
		await ClineProvider_1.ClineProvider.prototype.removeClineFromStack.call(provider)
		// Stack should be empty after pop
		;(0, vitest_1.expect)(provider.clineStack).toHaveLength(0)
		// Parent lookup should have been called
		;(0, vitest_1.expect)(getTaskWithId).toHaveBeenCalledWith("parent-1")
		// Parent metadata should be repaired
		;(0, vitest_1.expect)(updateTaskHistory).toHaveBeenCalledTimes(1)
		const updatedParent = updateTaskHistory.mock.calls[0][0]
		;(0, vitest_1.expect)(updatedParent).toEqual(
			vitest_1.expect.objectContaining({
				id: "parent-1",
				status: "active",
				awaitingChildId: undefined,
			}),
		)
		// Log the repair
		;(0, vitest_1.expect)(provider.log).toHaveBeenCalledWith(
			vitest_1.expect.stringContaining("Repaired parent parent-1 metadata"),
		)
	})
	;(0, vitest_1.it)("does NOT modify parent metadata when the task has no parentTaskId (non-delegated)", async () => {
		const { provider, updateTaskHistory, getTaskWithId } = buildMockProvider({
			childTaskId: "standalone-1",
			// No parentTaskId — this is a top-level task
		})
		await ClineProvider_1.ClineProvider.prototype.removeClineFromStack.call(provider)
		// Stack should be empty
		;(0, vitest_1.expect)(provider.clineStack).toHaveLength(0)
		// No parent lookup or update should happen
		;(0, vitest_1.expect)(getTaskWithId).not.toHaveBeenCalled()
		;(0, vitest_1.expect)(updateTaskHistory).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)(
		"does NOT modify parent metadata when awaitingChildId does not match the popped child",
		async () => {
			const { provider, updateTaskHistory, getTaskWithId } = buildMockProvider({
				childTaskId: "child-1",
				parentTaskId: "parent-1",
				parentHistoryItem: {
					id: "parent-1",
					task: "Parent task",
					ts: 1000,
					number: 1,
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
					status: "delegated",
					awaitingChildId: "child-OTHER", // different child
					delegatedToId: "child-OTHER",
					childIds: ["child-OTHER"],
				},
			})
			await ClineProvider_1.ClineProvider.prototype.removeClineFromStack.call(provider)
			// Parent was looked up but should NOT be updated
			;(0, vitest_1.expect)(getTaskWithId).toHaveBeenCalledWith("parent-1")
			;(0, vitest_1.expect)(updateTaskHistory).not.toHaveBeenCalled()
		},
	)
	;(0, vitest_1.it)("does NOT modify parent metadata when parent status is not 'delegated'", async () => {
		const { provider, updateTaskHistory, getTaskWithId } = buildMockProvider({
			childTaskId: "child-1",
			parentTaskId: "parent-1",
			parentHistoryItem: {
				id: "parent-1",
				task: "Parent task",
				ts: 1000,
				number: 1,
				tokensIn: 0,
				tokensOut: 0,
				totalCost: 0,
				status: "completed", // already completed
				awaitingChildId: "child-1",
				childIds: ["child-1"],
			},
		})
		await ClineProvider_1.ClineProvider.prototype.removeClineFromStack.call(provider)
		;(0, vitest_1.expect)(getTaskWithId).toHaveBeenCalledWith("parent-1")
		;(0, vitest_1.expect)(updateTaskHistory).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("catches and logs errors during parent metadata repair without blocking the pop", async () => {
		const { provider, childTask, updateTaskHistory, getTaskWithId } = buildMockProvider({
			childTaskId: "child-1",
			parentTaskId: "parent-1",
			getTaskWithIdError: new Error("Storage unavailable"),
		})
		// Should NOT throw
		await ClineProvider_1.ClineProvider.prototype.removeClineFromStack.call(provider)
		// Stack should still be empty (pop was not blocked)
		;(0, vitest_1.expect)(provider.clineStack).toHaveLength(0)
		// The abort should still have been called
		;(0, vitest_1.expect)(childTask.abortTask).toHaveBeenCalledWith(true)
		// Error should be logged as non-fatal
		;(0, vitest_1.expect)(provider.log).toHaveBeenCalledWith(
			vitest_1.expect.stringContaining("Failed to repair parent metadata for parent-1 (non-fatal)"),
		)
		// No update should have been attempted
		;(0, vitest_1.expect)(updateTaskHistory).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("handles empty stack gracefully", async () => {
		const provider = {
			clineStack: [],
			taskEventListeners: new Map(),
			log: vitest_1.vi.fn(),
			getTaskWithId: vitest_1.vi.fn(),
			updateTaskHistory: vitest_1.vi.fn(),
		}
		// Should not throw
		await ClineProvider_1.ClineProvider.prototype.removeClineFromStack.call(provider)
		;(0, vitest_1.expect)(provider.clineStack).toHaveLength(0)
		;(0, vitest_1.expect)(provider.getTaskWithId).not.toHaveBeenCalled()
		;(0, vitest_1.expect)(provider.updateTaskHistory).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("skips delegation repair when skipDelegationRepair option is true", async () => {
		const { provider, updateTaskHistory, getTaskWithId } = buildMockProvider({
			childTaskId: "child-1",
			parentTaskId: "parent-1",
			parentHistoryItem: {
				id: "parent-1",
				task: "Parent task",
				ts: 1000,
				number: 1,
				tokensIn: 0,
				tokensOut: 0,
				totalCost: 0,
				status: "delegated",
				awaitingChildId: "child-1",
				delegatedToId: "child-1",
				childIds: ["child-1"],
			},
		})
		// Call with skipDelegationRepair: true (as delegateParentAndOpenChild would)
		await ClineProvider_1.ClineProvider.prototype.removeClineFromStack.call(provider, {
			skipDelegationRepair: true,
		})
		// Stack should be empty after pop
		;(0, vitest_1.expect)(provider.clineStack).toHaveLength(0)
		// Parent lookup should NOT have been called — repair was skipped entirely
		;(0, vitest_1.expect)(getTaskWithId).not.toHaveBeenCalled()
		;(0, vitest_1.expect)(updateTaskHistory).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("does NOT reset grandparent during A→B→C nested delegation transition", async () => {
		// Scenario: A delegated to B, B is now delegating to C.
		// delegateParentAndOpenChild() pops B via removeClineFromStack({ skipDelegationRepair: true }).
		// Grandparent A should remain "delegated" — its metadata must not be repaired.
		const grandparentHistory = {
			id: "task-A",
			task: "Grandparent task",
			ts: 1000,
			number: 1,
			tokensIn: 0,
			tokensOut: 0,
			totalCost: 0,
			status: "delegated",
			awaitingChildId: "task-B",
			delegatedToId: "task-B",
			childIds: ["task-B"],
		}
		const taskB = {
			taskId: "task-B",
			instanceId: "inst-B",
			parentTaskId: "task-A",
			emit: vitest_1.vi.fn(),
			abortTask: vitest_1.vi.fn().mockResolvedValue(undefined),
		}
		const getTaskWithId = vitest_1.vi.fn().mockImplementation(async (id) => {
			if (id === "task-A") {
				return { historyItem: { ...grandparentHistory } }
			}
			throw new Error("Task not found")
		})
		const updateTaskHistory = vitest_1.vi.fn().mockResolvedValue([])
		const provider = {
			clineStack: [taskB],
			taskEventListeners: new Map(),
			log: vitest_1.vi.fn(),
			getTaskWithId,
			updateTaskHistory,
		}
		// Simulate what delegateParentAndOpenChild does: pop B with skipDelegationRepair
		await ClineProvider_1.ClineProvider.prototype.removeClineFromStack.call(provider, {
			skipDelegationRepair: true,
		})
		// B was popped
		;(0, vitest_1.expect)(provider.clineStack).toHaveLength(0)
		// Grandparent A should NOT have been looked up or modified
		;(0, vitest_1.expect)(getTaskWithId).not.toHaveBeenCalled()
		;(0, vitest_1.expect)(updateTaskHistory).not.toHaveBeenCalled()
		// Grandparent A's metadata remains intact (delegated, awaitingChildId: task-B)
		// The caller (delegateParentAndOpenChild) will update A to point to C separately.
	})
})
