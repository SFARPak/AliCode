"use strict"
// npx vitest run __tests__/nested-delegation-resume.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const types_1 = require("@ali-code/types")
// Mock safe-stable-stringify to avoid runtime error
// vscode mock for Task/Provider imports
vitest_1.vi.mock("vscode", () => {
	const window = {
		createTextEditorDecorationType: vitest_1.vi.fn(() => ({ dispose: vitest_1.vi.fn() })),
		showErrorMessage: vitest_1.vi.fn(),
		onDidChangeActiveTextEditor: vitest_1.vi.fn(() => ({ dispose: vitest_1.vi.fn() })),
	}
	const workspace = {
		getConfiguration: vitest_1.vi.fn(() => ({
			get: vitest_1.vi.fn((_key, defaultValue) => defaultValue),
			update: vitest_1.vi.fn(),
		})),
		workspaceFolders: [],
	}
	const env = { machineId: "test-machine", uriScheme: "vscode", appName: "VSCode", language: "en", sessionId: "sess" }
	const Uri = { file: (p) => ({ fsPath: p, toString: () => p }) }
	const commands = { executeCommand: vitest_1.vi.fn() }
	const ExtensionMode = { Development: 2 }
	const version = "1.0.0-test"
	return { window, workspace, env, Uri, commands, ExtensionMode, version }
})
// Mock persistence helpers used by provider reopen flow BEFORE importing provider
vitest_1.vi.mock("../core/task-persistence/taskMessages", () => ({
	readTaskMessages: vitest_1.vi.fn().mockResolvedValue([]),
}))
vitest_1.vi.mock("../core/task-persistence", () => ({
	readApiMessages: vitest_1.vi.fn().mockResolvedValue([]),
	saveApiMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
	saveTaskMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
}))
const AttemptCompletionTool_1 = require("../core/tools/AttemptCompletionTool")
const ClineProvider_1 = require("../core/webview/ClineProvider")
const taskMessages_1 = require("../core/task-persistence/taskMessages")
const task_persistence_1 = require("../core/task-persistence")
;(0, vitest_1.describe)("Nested delegation resume (A → B → C)", () => {
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.restoreAllMocks()
	})
	;(0, vitest_1.it)(
		"C completes → reopens B; then B completes → reopens A; emits correct events; no resume_task asks",
		async () => {
			// Track which task is "current" to satisfy provider.reopenParentFromDelegation() child-close logic
			let currentActiveId = "C"
			// History index: A is parent of B, B is parent of C
			const historyIndex = {
				A: {
					id: "A",
					status: "delegated",
					delegatedToId: "B",
					awaitingChildId: "B",
					childIds: ["B"],
					parentTaskId: undefined,
					ts: 1,
					task: "Task A",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
					mode: "code",
					workspace: "/tmp",
				},
				B: {
					id: "B",
					status: "delegated",
					delegatedToId: "C",
					awaitingChildId: "C",
					childIds: ["C"],
					parentTaskId: "A",
					ts: 2,
					task: "Task B",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
					mode: "code",
					workspace: "/tmp",
				},
				C: {
					id: "C",
					status: "active",
					parentTaskId: "B",
					ts: 3,
					task: "Task C",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
					mode: "code",
					workspace: "/tmp",
				},
			}
			const emitSpy = vitest_1.vi.fn()
			const removeClineFromStack = vitest_1.vi.fn().mockImplementation(async () => {
				// Simulate closing current child
				currentActiveId = undefined
			})
			const createTaskWithHistoryItem = vitest_1.vi.fn().mockImplementation(async (historyItem, opts) => {
				// Assert startTask:false to avoid resume asks
				;(0, vitest_1.expect)(opts).toEqual(vitest_1.expect.objectContaining({ startTask: false }))
				// Reopen the parent
				currentActiveId = historyItem.id
				// Return minimal parent instance with resumeAfterDelegation
				return {
					taskId: historyItem.id,
					resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
				}
			})
			const getTaskWithId = vitest_1.vi.fn(async (id) => {
				if (!historyIndex[id]) throw new Error("Task not found")
				return {
					historyItem: historyIndex[id],
					apiConversationHistory: [],
					taskDirPath: "/tmp",
					apiConversationHistoryFilePath: "/tmp/api.json",
					uiMessagesFilePath: "/tmp/ui.json",
				}
			})
			const updateTaskHistory = vitest_1.vi.fn(async (updated) => {
				// Persist updated history back into index (simulate)
				historyIndex[updated.id] = updated
				return Object.values(historyIndex)
			})
			const provider = {
				contextProxy: { globalStorageUri: { fsPath: "/tmp" } },
				getTaskWithId,
				emit: emitSpy,
				getCurrentTask: vitest_1.vi.fn(() => (currentActiveId ? { taskId: currentActiveId } : undefined)),
				removeClineFromStack,
				createTaskWithHistoryItem,
				updateTaskHistory,
				// Wire through provider method so attemptCompletionTool can call it
				reopenParentFromDelegation: vitest_1.vi.fn(async (params) => {
					return await ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(
						provider,
						params,
					)
				}),
			}
			// Empty histories for simplicity
			vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue([])
			vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue([])
			// Step 1: C completes -> should reopen B automatically
			const clineC = {
				taskId: "C",
				parentTask: undefined, // parent ref may or may not exist; metadata path should still work
				parentTaskId: "B",
				historyItem: { parentTaskId: "B" },
				providerRef: { deref: () => provider },
				say: vitest_1.vi.fn().mockResolvedValue(undefined),
				emit: vitest_1.vi.fn(),
				getTokenUsage: vitest_1.vi.fn(() => ({})),
				toolUsage: {},
				clineMessages: [],
				userMessageContent: [],
				consecutiveMistakeCount: 0,
				emitFinalTokenUsageUpdate: vitest_1.vi.fn(),
			}
			const blockC = {
				type: "tool_use",
				name: "attempt_completion",
				params: { result: "C finished" },
				nativeArgs: { result: "C finished" },
				partial: false,
			}
			const askFinishSubTaskApproval = vitest_1.vi.fn(async () => true)
			const handleError = vitest_1.vi.fn(async (_action, err) => {
				// Fail fast in this test if the tool hits an error path.
				throw err
			})
			await AttemptCompletionTool_1.attemptCompletionTool.handle(clineC, blockC, {
				askApproval: vitest_1.vi.fn(),
				handleError,
				pushToolResult: vitest_1.vi.fn(),
				askFinishSubTaskApproval,
				toolDescription: () => "desc",
			})
			// After C completes, B must be current
			;(0, vitest_1.expect)(currentActiveId).toBe("B")
			// Events emitted: C -> B hop
			const eventNamesAfterC = emitSpy.mock.calls.map((c) => c[0])
			;(0, vitest_1.expect)(eventNamesAfterC).toContain(types_1.AliCodeEventName.TaskDelegationCompleted)
			;(0, vitest_1.expect)(eventNamesAfterC).toContain(types_1.AliCodeEventName.TaskDelegationResumed)
			// Step 2: B completes -> should reopen A automatically (parent reference missing, must use parentTaskId path)
			const clineB = {
				taskId: "B",
				parentTask: undefined, // simulate missing live parent reference
				parentTaskId: "A", // persisted parent id
				historyItem: { parentTaskId: "A" },
				providerRef: { deref: () => provider },
				say: vitest_1.vi.fn().mockResolvedValue(undefined),
				emit: vitest_1.vi.fn(),
				getTokenUsage: vitest_1.vi.fn(() => ({})),
				toolUsage: {},
				clineMessages: [],
				userMessageContent: [],
				consecutiveMistakeCount: 0,
				emitFinalTokenUsageUpdate: vitest_1.vi.fn(),
			}
			const blockB = {
				type: "tool_use",
				name: "attempt_completion",
				params: { result: "B finished" },
				nativeArgs: { result: "B finished" },
				partial: false,
			}
			await AttemptCompletionTool_1.attemptCompletionTool.handle(clineB, blockB, {
				askApproval: vitest_1.vi.fn(),
				handleError,
				pushToolResult: vitest_1.vi.fn(),
				askFinishSubTaskApproval,
				toolDescription: () => "desc",
			})
			// After B completes, A should become current
			// Note: delegation resume may fall back to a non-tool_result user message when the parent history
			// does not contain a new_task tool_use. This should not prevent reopening the parent.
			;(0, vitest_1.expect)(currentActiveId).toBe("A")
			// Ensure no resume_task asks were scheduled: verified indirectly by startTask:false on both hops
			// (asserted in createTaskWithHistoryItem mock)
			// Provider emitted TaskDelegationCompleted/Resumed twice across both hops
			const completedEvents = emitSpy.mock.calls.filter(
				(c) => c[0] === types_1.AliCodeEventName.TaskDelegationCompleted,
			)
			const resumedEvents = emitSpy.mock.calls.filter(
				(c) => c[0] === types_1.AliCodeEventName.TaskDelegationResumed,
			)
			;(0, vitest_1.expect)(completedEvents.length).toBeGreaterThanOrEqual(2)
			;(0, vitest_1.expect)(resumedEvents.length).toBeGreaterThanOrEqual(2)
			// Verify second hop used parentId = A
			// Find a TaskDelegationCompleted matching A <- B
			const hasAfromB = completedEvents.some(([, parentId, childId]) => parentId === "A" && childId === "B")
			;(0, vitest_1.expect)(hasAfromB).toBe(true)
		},
	)
})
