"use strict"
// npx vitest run __tests__/provider-delegation.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const types_1 = require("@ali-code/types")
const ClineProvider_1 = require("../core/webview/ClineProvider")
;(0, vitest_1.describe)("ClineProvider.delegateParentAndOpenChild()", () => {
	;(0, vitest_1.it)("persists parent delegation metadata and emits TaskDelegated", async () => {
		const providerEmit = vitest_1.vi.fn()
		const parentTask = { taskId: "parent-1", emit: vitest_1.vi.fn() }
		const childStart = vitest_1.vi.fn()
		const updateTaskHistory = vitest_1.vi.fn()
		const removeClineFromStack = vitest_1.vi.fn().mockResolvedValue(undefined)
		const createTask = vitest_1.vi.fn().mockResolvedValue({ taskId: "child-1", start: childStart })
		const handleModeSwitch = vitest_1.vi.fn().mockResolvedValue(undefined)
		const getTaskWithId = vitest_1.vi.fn().mockImplementation(async (id) => {
			if (id === "parent-1") {
				return {
					historyItem: {
						id: "parent-1",
						task: "Parent",
						tokensIn: 0,
						tokensOut: 0,
						totalCost: 0,
						childIds: [],
					},
				}
			}
			// child-1
			return {
				historyItem: {
					id: "child-1",
					task: "Do something",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
				},
			}
		})
		const provider = {
			emit: providerEmit,
			getCurrentTask: vitest_1.vi.fn(() => parentTask),
			removeClineFromStack,
			createTask,
			getTaskWithId,
			updateTaskHistory,
			handleModeSwitch,
			log: vitest_1.vi.fn(),
		}
		const params = {
			parentTaskId: "parent-1",
			message: "Do something",
			initialTodos: [],
			mode: "code",
		}
		const child = await ClineProvider_1.ClineProvider.prototype.delegateParentAndOpenChild.call(provider, params)
		;(0, vitest_1.expect)(child.taskId).toBe("child-1")
		// Invariant: parent closed before child creation
		;(0, vitest_1.expect)(removeClineFromStack).toHaveBeenCalledTimes(1)
		// Child task is created with startTask: false and initialStatus: "active"
		;(0, vitest_1.expect)(createTask).toHaveBeenCalledWith("Do something", undefined, parentTask, {
			initialTodos: [],
			initialStatus: "active",
			startTask: false,
		})
		// Metadata persistence - parent gets "delegated" status (child status is set at creation via initialStatus)
		;(0, vitest_1.expect)(updateTaskHistory).toHaveBeenCalledTimes(1)
		// Parent set to "delegated"
		const parentSaved = updateTaskHistory.mock.calls[0][0]
		;(0, vitest_1.expect)(parentSaved).toEqual(
			vitest_1.expect.objectContaining({
				id: "parent-1",
				status: "delegated",
				delegatedToId: "child-1",
				awaitingChildId: "child-1",
				childIds: vitest_1.expect.arrayContaining(["child-1"]),
			}),
		)
		// child.start() must be called AFTER parent metadata is persisted
		;(0, vitest_1.expect)(childStart).toHaveBeenCalledTimes(1)
		// Event emission (provider-level)
		;(0, vitest_1.expect)(providerEmit).toHaveBeenCalledWith(
			types_1.AliCodeEventName.TaskDelegated,
			"parent-1",
			"child-1",
		)
		// Mode switch
		;(0, vitest_1.expect)(handleModeSwitch).toHaveBeenCalledWith("code")
	})
	;(0, vitest_1.it)("calls child.start() only after parent metadata is persisted (no race condition)", async () => {
		const callOrder = []
		const parentTask = { taskId: "parent-1", emit: vitest_1.vi.fn() }
		const childStart = vitest_1.vi.fn(() => callOrder.push("child.start"))
		const updateTaskHistory = vitest_1.vi.fn(async () => {
			callOrder.push("updateTaskHistory")
		})
		const removeClineFromStack = vitest_1.vi.fn().mockResolvedValue(undefined)
		const createTask = vitest_1.vi.fn(async () => {
			callOrder.push("createTask")
			return { taskId: "child-1", start: childStart }
		})
		const handleModeSwitch = vitest_1.vi.fn().mockResolvedValue(undefined)
		const getTaskWithId = vitest_1.vi.fn().mockResolvedValue({
			historyItem: {
				id: "parent-1",
				task: "Parent",
				tokensIn: 0,
				tokensOut: 0,
				totalCost: 0,
				childIds: [],
			},
		})
		const provider = {
			emit: vitest_1.vi.fn(),
			getCurrentTask: vitest_1.vi.fn(() => parentTask),
			removeClineFromStack,
			createTask,
			getTaskWithId,
			updateTaskHistory,
			handleModeSwitch,
			log: vitest_1.vi.fn(),
		}
		await ClineProvider_1.ClineProvider.prototype.delegateParentAndOpenChild.call(provider, {
			parentTaskId: "parent-1",
			message: "Do something",
			initialTodos: [],
			mode: "code",
		})
		// Verify ordering: createTask → updateTaskHistory → child.start
		;(0, vitest_1.expect)(callOrder).toEqual(["createTask", "updateTaskHistory", "child.start"])
	})
})
