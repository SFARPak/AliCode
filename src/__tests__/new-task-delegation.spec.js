"use strict"
// npx vitest run __tests__/new-task-delegation.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const types_1 = require("@ali-code/types")
const Task_1 = require("../core/task/Task")
;(0, vitest_1.describe)("Task.startSubtask() metadata-driven delegation", () => {
	;(0, vitest_1.it)("Routes to provider.delegateParentAndOpenChild without pausing parent", async () => {
		const provider = {
			getState: vitest_1.vi.fn().mockResolvedValue({
				experiments: {},
			}),
			delegateParentAndOpenChild: vitest_1.vi.fn().mockResolvedValue({ taskId: "child-1" }),
			createTask: vitest_1.vi.fn(),
			handleModeSwitch: vitest_1.vi.fn(),
		}
		// Create a minimal Task-like instance with only fields used by startSubtask
		const parent = Object.create(Task_1.Task.prototype)
		parent.taskId = "parent-1"
		parent.providerRef = { deref: () => provider }
		parent.emit = vitest_1.vi.fn()
		const child = await Task_1.Task.prototype.startSubtask.call(parent, "Do something", [], "code")
		;(0, vitest_1.expect)(provider.delegateParentAndOpenChild).toHaveBeenCalledWith({
			parentTaskId: "parent-1",
			message: "Do something",
			initialTodos: [],
			mode: "code",
		})
		;(0, vitest_1.expect)(child.taskId).toBe("child-1")
		// Parent should not be paused and no paused/unpaused events should be emitted
		;(0, vitest_1.expect)(parent.isPaused).not.toBe(true)
		;(0, vitest_1.expect)(parent.childTaskId).toBeUndefined()
		const emittedEvents = parent.emit.mock.calls.map((c) => c[0])
		;(0, vitest_1.expect)(emittedEvents).not.toContain(types_1.AliCodeEventName.TaskPaused)
		;(0, vitest_1.expect)(emittedEvents).not.toContain(types_1.AliCodeEventName.TaskUnpaused)
		// Legacy path not used
		;(0, vitest_1.expect)(provider.createTask).not.toHaveBeenCalled()
	})
})
