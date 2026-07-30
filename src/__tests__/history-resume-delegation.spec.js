"use strict"
// npx vitest run __tests__/history-resume-delegation.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const types_1 = require("@ali-code/types")
/* vscode mock for Task/Provider imports */
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
// Mock persistence BEFORE importing provider
vitest_1.vi.mock("../core/task-persistence/taskMessages", () => ({
	readTaskMessages: vitest_1.vi.fn().mockResolvedValue([]),
}))
vitest_1.vi.mock("../core/task-persistence", () => ({
	readApiMessages: vitest_1.vi.fn().mockResolvedValue([]),
	saveApiMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
	saveTaskMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
}))
const ClineProvider_1 = require("../core/webview/ClineProvider")
const taskMessages_1 = require("../core/task-persistence/taskMessages")
const task_persistence_1 = require("../core/task-persistence")
;(0, vitest_1.describe)("History resume delegation - parent metadata transitions", () => {
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
	})
	;(0, vitest_1.it)(
		"reopenParentFromDelegation persists parent metadata (delegated → active) before reopen",
		async () => {
			const providerEmit = vitest_1.vi.fn()
			const getTaskWithId = vitest_1.vi.fn().mockResolvedValue({
				historyItem: {
					id: "parent-1",
					status: "delegated",
					delegatedToId: "child-1",
					awaitingChildId: "child-1",
					childIds: ["child-1"],
					ts: Date.now(),
					task: "Parent task",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
					mode: "code",
					workspace: "/tmp",
				},
			})
			const updateTaskHistory = vitest_1.vi.fn().mockResolvedValue([])
			const removeClineFromStack = vitest_1.vi.fn().mockResolvedValue(undefined)
			const createTaskWithHistoryItem = vitest_1.vi.fn().mockResolvedValue({
				taskId: "parent-1",
				skipPrevResponseIdOnce: false,
				resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
			})
			const provider = {
				contextProxy: { globalStorageUri: { fsPath: "/tmp" } },
				getTaskWithId,
				emit: providerEmit,
				getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "child-1" })),
				removeClineFromStack,
				createTaskWithHistoryItem,
				updateTaskHistory,
			}
			// Mock persistence reads to return empty arrays
			vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue([])
			vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue([])
			await ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
				parentTaskId: "parent-1",
				childTaskId: "child-1",
				completionResultSummary: "Child done",
			})
			// Assert: metadata updated BEFORE createTaskWithHistoryItem
			;(0, vitest_1.expect)(updateTaskHistory).toHaveBeenCalledWith(
				vitest_1.expect.objectContaining({
					id: "parent-1",
					status: "active",
					completedByChildId: "child-1",
					completionResultSummary: "Child done",
					awaitingChildId: undefined,
					childIds: ["child-1"],
				}),
			)
			// Verify call ordering: updateTaskHistory before createTaskWithHistoryItem
			const updateCall = updateTaskHistory.mock.invocationCallOrder[0]
			const createCall = createTaskWithHistoryItem.mock.invocationCallOrder[0]
			;(0, vitest_1.expect)(updateCall).toBeLessThan(createCall)
			// Verify child closed and parent reopened with updated metadata
			;(0, vitest_1.expect)(removeClineFromStack).toHaveBeenCalledTimes(1)
			;(0, vitest_1.expect)(createTaskWithHistoryItem).toHaveBeenCalledWith(
				vitest_1.expect.objectContaining({
					status: "active",
					completedByChildId: "child-1",
				}),
				{ startTask: false },
			)
		},
	)
	;(0, vitest_1.it)("reopenParentFromDelegation injects subtask_result into both UI and API histories", async () => {
		const provider = {
			contextProxy: { globalStorageUri: { fsPath: "/storage" } },
			getTaskWithId: vitest_1.vi.fn().mockResolvedValue({
				historyItem: {
					id: "p1",
					status: "delegated",
					awaitingChildId: "c1",
					childIds: [],
					ts: 100,
					task: "Parent",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
				},
			}),
			emit: vitest_1.vi.fn(),
			getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "c1" })),
			removeClineFromStack: vitest_1.vi.fn().mockResolvedValue(undefined),
			createTaskWithHistoryItem: vitest_1.vi.fn().mockResolvedValue({
				taskId: "p1",
				resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
				overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
				overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
			}),
			updateTaskHistory: vitest_1.vi.fn().mockResolvedValue([]),
		}
		// Start with existing messages in history
		const existingUiMessages = [{ type: "ask", ask: "tool", text: "Old tool", ts: 50 }]
		const existingApiMessages = [{ role: "user", content: [{ type: "text", text: "Old request" }], ts: 50 }]
		vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue(existingUiMessages)
		vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue(existingApiMessages)
		await ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
			parentTaskId: "p1",
			childTaskId: "c1",
			completionResultSummary: "Subtask completed successfully",
		})
		// Verify UI history injection (say: subtask_result)
		;(0, vitest_1.expect)(task_persistence_1.saveTaskMessages).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				messages: vitest_1.expect.arrayContaining([
					vitest_1.expect.objectContaining({
						type: "say",
						say: "subtask_result",
						text: "Subtask completed successfully",
					}),
				]),
				taskId: "p1",
				globalStoragePath: "/storage",
			}),
		)
		// Verify API history injection (user role message)
		;(0, vitest_1.expect)(task_persistence_1.saveApiMessages).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				messages: vitest_1.expect.arrayContaining([
					vitest_1.expect.objectContaining({
						role: "user",
						content: vitest_1.expect.arrayContaining([
							vitest_1.expect.objectContaining({
								type: "text",
								text: vitest_1.expect.stringContaining("Subtask c1 completed"),
							}),
						]),
					}),
				]),
				taskId: "p1",
				globalStoragePath: "/storage",
			}),
		)
		// Verify both include original messages
		const uiCall = vitest_1.vi.mocked(task_persistence_1.saveTaskMessages).mock.calls[0][0]
		;(0, vitest_1.expect)(uiCall.messages).toHaveLength(2) // 1 original + 1 injected
		const apiCall = vitest_1.vi.mocked(task_persistence_1.saveApiMessages).mock.calls[0][0]
		;(0, vitest_1.expect)(apiCall.messages).toHaveLength(2) // 1 original + 1 injected
	})
	;(0, vitest_1.it)(
		"reopenParentFromDelegation injects tool_result when new_task tool_use exists in API history",
		async () => {
			const provider = {
				contextProxy: { globalStorageUri: { fsPath: "/storage" } },
				getTaskWithId: vitest_1.vi.fn().mockResolvedValue({
					historyItem: {
						id: "p-tool",
						status: "delegated",
						awaitingChildId: "c-tool",
						childIds: [],
						ts: 100,
						task: "Parent with tool_use",
						tokensIn: 0,
						tokensOut: 0,
						totalCost: 0,
					},
				}),
				emit: vitest_1.vi.fn(),
				getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "c-tool" })),
				removeClineFromStack: vitest_1.vi.fn().mockResolvedValue(undefined),
				createTaskWithHistoryItem: vitest_1.vi.fn().mockResolvedValue({
					taskId: "p-tool",
					resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
				}),
				updateTaskHistory: vitest_1.vi.fn().mockResolvedValue([]),
			}
			// Include an assistant message with new_task tool_use to exercise the tool_result path
			const existingUiMessages = [{ type: "ask", ask: "tool", text: "new_task request", ts: 50 }]
			const existingApiMessages = [
				{ role: "user", content: [{ type: "text", text: "Create a subtask" }], ts: 40 },
				{
					role: "assistant",
					content: [
						{
							type: "tool_use",
							name: "new_task",
							id: "toolu_abc123",
							input: { mode: "code", message: "Do something" },
						},
					],
					ts: 50,
				},
			]
			vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue(existingUiMessages)
			vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue(existingApiMessages)
			await ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
				parentTaskId: "p-tool",
				childTaskId: "c-tool",
				completionResultSummary: "Subtask completed via tool_result",
			})
			// Verify API history injection uses tool_result (not text fallback)
			;(0, vitest_1.expect)(task_persistence_1.saveApiMessages).toHaveBeenCalledWith(
				vitest_1.expect.objectContaining({
					messages: vitest_1.expect.arrayContaining([
						vitest_1.expect.objectContaining({
							role: "user",
							content: vitest_1.expect.arrayContaining([
								vitest_1.expect.objectContaining({
									type: "tool_result",
									tool_use_id: "toolu_abc123",
									content: vitest_1.expect.stringContaining("Subtask c-tool completed"),
								}),
							]),
						}),
					]),
					taskId: "p-tool",
					globalStoragePath: "/storage",
				}),
			)
			// Verify total message count: 2 original + 1 injected user message with tool_result
			const apiCall = vitest_1.vi.mocked(task_persistence_1.saveApiMessages).mock.calls[0][0]
			;(0, vitest_1.expect)(apiCall.messages).toHaveLength(3)
			// Verify the injected message is a user message with tool_result type
			const injectedMsg = apiCall.messages[2]
			;(0, vitest_1.expect)(injectedMsg.role).toBe("user")
			;(0, vitest_1.expect)(injectedMsg.content[0].type).toBe("tool_result")
			;(0, vitest_1.expect)(injectedMsg.content[0].tool_use_id).toBe("toolu_abc123")
		},
	)
	;(0, vitest_1.it)(
		"reopenParentFromDelegation injects plain text when no new_task tool_use exists in API history",
		async () => {
			const provider = {
				contextProxy: { globalStorageUri: { fsPath: "/storage" } },
				getTaskWithId: vitest_1.vi.fn().mockResolvedValue({
					historyItem: {
						id: "p-no-tool",
						status: "delegated",
						awaitingChildId: "c-no-tool",
						childIds: [],
						ts: 100,
						task: "Parent without tool_use",
						tokensIn: 0,
						tokensOut: 0,
						totalCost: 0,
					},
				}),
				emit: vitest_1.vi.fn(),
				getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "c-no-tool" })),
				removeClineFromStack: vitest_1.vi.fn().mockResolvedValue(undefined),
				createTaskWithHistoryItem: vitest_1.vi.fn().mockResolvedValue({
					taskId: "p-no-tool",
					resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
				}),
				updateTaskHistory: vitest_1.vi.fn().mockResolvedValue([]),
			}
			// No assistant tool_use in history
			const existingUiMessages = [{ type: "ask", ask: "tool", text: "subtask request", ts: 50 }]
			const existingApiMessages = [
				{ role: "user", content: [{ type: "text", text: "Create a subtask" }], ts: 40 },
			]
			vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue(existingUiMessages)
			vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue(existingApiMessages)
			await ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
				parentTaskId: "p-no-tool",
				childTaskId: "c-no-tool",
				completionResultSummary: "Subtask completed without tool_use",
			})
			const apiCall = vitest_1.vi.mocked(task_persistence_1.saveApiMessages).mock.calls[0][0]
			// Should append a user text note
			;(0, vitest_1.expect)(apiCall.messages).toHaveLength(2)
			const injected = apiCall.messages[1]
			;(0, vitest_1.expect)(injected.role).toBe("user")
			;(0, vitest_1.expect)(injected.content[0].type).toBe("text")
			;(0, vitest_1.expect)(injected.content[0].text).toContain("Subtask c-no-tool completed")
		},
	)
	;(0, vitest_1.it)("reopenParentFromDelegation sets skipPrevResponseIdOnce via resumeAfterDelegation", async () => {
		const parentInstance = {
			skipPrevResponseIdOnce: false,
			resumeAfterDelegation: vitest_1.vi.fn().mockImplementation(async function () {
				// Simulate what the real resumeAfterDelegation does
				this.skipPrevResponseIdOnce = true
			}),
			overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
			overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
		}
		const provider = {
			contextProxy: { globalStorageUri: { fsPath: "/tmp" } },
			getTaskWithId: vitest_1.vi.fn().mockResolvedValue({
				historyItem: {
					id: "parent-2",
					status: "delegated",
					awaitingChildId: "child-2",
					childIds: [],
					ts: 200,
					task: "P",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
				},
			}),
			emit: vitest_1.vi.fn(),
			getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "child-2" })),
			removeClineFromStack: vitest_1.vi.fn().mockResolvedValue(undefined),
			createTaskWithHistoryItem: vitest_1.vi.fn().mockResolvedValue(parentInstance),
			updateTaskHistory: vitest_1.vi.fn().mockResolvedValue([]),
		}
		vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue([])
		vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue([])
		await ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
			parentTaskId: "parent-2",
			childTaskId: "child-2",
			completionResultSummary: "Done",
		})
		// Critical: verify skipPrevResponseIdOnce set to true by resumeAfterDelegation
		;(0, vitest_1.expect)(parentInstance.skipPrevResponseIdOnce).toBe(true)
		;(0, vitest_1.expect)(parentInstance.resumeAfterDelegation).toHaveBeenCalledTimes(1)
	})
	;(0, vitest_1.it)(
		"reopenParentFromDelegation emits events in correct order: TaskDelegationCompleted → TaskDelegationResumed",
		async () => {
			const emitSpy = vitest_1.vi.fn()
			const updateTaskHistory = vitest_1.vi.fn().mockResolvedValue([])
			const provider = {
				contextProxy: { globalStorageUri: { fsPath: "/tmp" } },
				getTaskWithId: vitest_1.vi.fn().mockResolvedValue({
					historyItem: {
						id: "p3",
						status: "delegated",
						awaitingChildId: "c3",
						childIds: [],
						ts: 300,
						task: "P3",
						tokensIn: 0,
						tokensOut: 0,
						totalCost: 0,
					},
				}),
				emit: emitSpy,
				getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "c3" })),
				removeClineFromStack: vitest_1.vi.fn().mockResolvedValue(undefined),
				createTaskWithHistoryItem: vitest_1.vi.fn().mockResolvedValue({
					resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
				}),
				updateTaskHistory,
			}
			vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue([])
			vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue([])
			await ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
				parentTaskId: "p3",
				childTaskId: "c3",
				completionResultSummary: "Summary",
			})
			// Verify both events emitted
			const eventNames = emitSpy.mock.calls.map((c) => c[0])
			;(0, vitest_1.expect)(eventNames).toContain(types_1.AliCodeEventName.TaskDelegationCompleted)
			;(0, vitest_1.expect)(eventNames).toContain(types_1.AliCodeEventName.TaskDelegationResumed)
			// CRITICAL: verify ordering (TaskDelegationCompleted before TaskDelegationResumed)
			const completedIdx = emitSpy.mock.calls.findIndex(
				(c) => c[0] === types_1.AliCodeEventName.TaskDelegationCompleted,
			)
			const resumedIdx = emitSpy.mock.calls.findIndex(
				(c) => c[0] === types_1.AliCodeEventName.TaskDelegationResumed,
			)
			;(0, vitest_1.expect)(completedIdx).toBeGreaterThanOrEqual(0)
			;(0, vitest_1.expect)(resumedIdx).toBeGreaterThan(completedIdx)
			// RPD-05: verify parent metadata persistence happens before TaskDelegationCompleted emit
			const parentUpdateCallIdx = updateTaskHistory.mock.calls.findIndex((call) => {
				const item = call[0]
				return item?.id === "p3" && item.status === "active"
			})
			;(0, vitest_1.expect)(parentUpdateCallIdx).toBeGreaterThanOrEqual(0)
			const parentUpdateCallOrder = updateTaskHistory.mock.invocationCallOrder[parentUpdateCallIdx]
			const completedEmitCallOrder = emitSpy.mock.invocationCallOrder[completedIdx]
			;(0, vitest_1.expect)(parentUpdateCallOrder).toBeLessThan(completedEmitCallOrder)
		},
	)
	;(0, vitest_1.it)(
		"reopenParentFromDelegation continues when overwrite operations fail and still resumes/emits (RPD-06)",
		async () => {
			const emitSpy = vitest_1.vi.fn()
			const parentInstance = {
				resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
				overwriteClineMessages: vitest_1.vi.fn().mockRejectedValue(new Error("ui overwrite failed")),
				overwriteApiConversationHistory: vitest_1.vi.fn().mockRejectedValue(new Error("api overwrite failed")),
			}
			const provider = {
				contextProxy: { globalStorageUri: { fsPath: "/tmp" } },
				getTaskWithId: vitest_1.vi.fn().mockImplementation(async (id) => {
					if (id === "parent-rpd06") {
						return {
							historyItem: {
								id: "parent-rpd06",
								status: "delegated",
								awaitingChildId: "child-rpd06",
								childIds: ["child-rpd06"],
								ts: 800,
								task: "Parent RPD-06",
								tokensIn: 0,
								tokensOut: 0,
								totalCost: 0,
							},
						}
					}
					return {
						historyItem: {
							id: "child-rpd06",
							status: "active",
							ts: 801,
							task: "Child RPD-06",
							tokensIn: 0,
							tokensOut: 0,
							totalCost: 0,
						},
					}
				}),
				emit: emitSpy,
				getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "child-rpd06" })),
				removeClineFromStack: vitest_1.vi.fn().mockResolvedValue(undefined),
				createTaskWithHistoryItem: vitest_1.vi.fn().mockResolvedValue(parentInstance),
				updateTaskHistory: vitest_1.vi.fn().mockResolvedValue([]),
			}
			vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue([])
			vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue([])
			await (0, vitest_1.expect)(
				ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
					parentTaskId: "parent-rpd06",
					childTaskId: "child-rpd06",
					completionResultSummary: "Subtask finished despite overwrite failures",
				}),
			).resolves.toBeUndefined()
			;(0, vitest_1.expect)(parentInstance.overwriteClineMessages).toHaveBeenCalledTimes(1)
			;(0, vitest_1.expect)(parentInstance.overwriteApiConversationHistory).toHaveBeenCalledTimes(1)
			;(0, vitest_1.expect)(parentInstance.resumeAfterDelegation).toHaveBeenCalledTimes(1)
			;(0, vitest_1.expect)(emitSpy).toHaveBeenCalledWith(
				types_1.AliCodeEventName.TaskDelegationCompleted,
				"parent-rpd06",
				"child-rpd06",
				"Subtask finished despite overwrite failures",
			)
			;(0, vitest_1.expect)(emitSpy).toHaveBeenCalledWith(
				types_1.AliCodeEventName.TaskDelegationResumed,
				"parent-rpd06",
				"child-rpd06",
			)
			const completedIdx = emitSpy.mock.calls.findIndex(
				(c) => c[0] === types_1.AliCodeEventName.TaskDelegationCompleted,
			)
			const resumedIdx = emitSpy.mock.calls.findIndex(
				(c) => c[0] === types_1.AliCodeEventName.TaskDelegationResumed,
			)
			;(0, vitest_1.expect)(completedIdx).toBeGreaterThanOrEqual(0)
			;(0, vitest_1.expect)(resumedIdx).toBeGreaterThan(completedIdx)
		},
	)
	;(0, vitest_1.it)(
		"reopenParentFromDelegation does NOT emit TaskPaused or TaskUnpaused (new flow only)",
		async () => {
			const emitSpy = vitest_1.vi.fn()
			const provider = {
				contextProxy: { globalStorageUri: { fsPath: "/tmp" } },
				getTaskWithId: vitest_1.vi.fn().mockResolvedValue({
					historyItem: {
						id: "p4",
						status: "delegated",
						awaitingChildId: "c4",
						childIds: [],
						ts: 400,
						task: "P4",
						tokensIn: 0,
						tokensOut: 0,
						totalCost: 0,
					},
				}),
				emit: emitSpy,
				getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "c4" })),
				removeClineFromStack: vitest_1.vi.fn().mockResolvedValue(undefined),
				createTaskWithHistoryItem: vitest_1.vi.fn().mockResolvedValue({
					resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
					overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
				}),
				updateTaskHistory: vitest_1.vi.fn().mockResolvedValue([]),
			}
			vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue([])
			vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue([])
			await ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
				parentTaskId: "p4",
				childTaskId: "c4",
				completionResultSummary: "S",
			})
			// CRITICAL: verify legacy pause/unpause events NOT emitted
			const eventNames = emitSpy.mock.calls.map((c) => c[0])
			;(0, vitest_1.expect)(eventNames).not.toContain(types_1.AliCodeEventName.TaskPaused)
			;(0, vitest_1.expect)(eventNames).not.toContain(types_1.AliCodeEventName.TaskUnpaused)
			;(0, vitest_1.expect)(eventNames).not.toContain(types_1.AliCodeEventName.TaskSpawned)
		},
	)
	;(0, vitest_1.it)(
		"reopenParentFromDelegation skips child close when current task differs and still reopens parent (RPD-02)",
		async () => {
			const parentInstance = {
				resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
				overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
				overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
			}
			const updateTaskHistory = vitest_1.vi.fn().mockResolvedValue([])
			const removeClineFromStack = vitest_1.vi.fn().mockResolvedValue(undefined)
			const createTaskWithHistoryItem = vitest_1.vi.fn().mockResolvedValue(parentInstance)
			const provider = {
				contextProxy: { globalStorageUri: { fsPath: "/tmp" } },
				getTaskWithId: vitest_1.vi.fn().mockImplementation(async (id) => {
					if (id === "parent-rpd02") {
						return {
							historyItem: {
								id: "parent-rpd02",
								status: "delegated",
								awaitingChildId: "child-rpd02",
								childIds: ["child-rpd02"],
								ts: 600,
								task: "Parent RPD-02",
								tokensIn: 0,
								tokensOut: 0,
								totalCost: 0,
							},
						}
					}
					return {
						historyItem: {
							id: "child-rpd02",
							status: "active",
							ts: 601,
							task: "Child RPD-02",
							tokensIn: 0,
							tokensOut: 0,
							totalCost: 0,
						},
					}
				}),
				emit: vitest_1.vi.fn(),
				getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "different-open-task" })),
				removeClineFromStack,
				createTaskWithHistoryItem,
				updateTaskHistory,
			}
			vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue([])
			vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue([])
			await ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
				parentTaskId: "parent-rpd02",
				childTaskId: "child-rpd02",
				completionResultSummary: "Child done without being current",
			})
			;(0, vitest_1.expect)(removeClineFromStack).not.toHaveBeenCalled()
			;(0, vitest_1.expect)(updateTaskHistory).toHaveBeenCalledWith(
				vitest_1.expect.objectContaining({
					id: "child-rpd02",
					status: "completed",
				}),
			)
			;(0, vitest_1.expect)(createTaskWithHistoryItem).toHaveBeenCalledWith(
				vitest_1.expect.objectContaining({
					id: "parent-rpd02",
					status: "active",
					completedByChildId: "child-rpd02",
				}),
				{ startTask: false },
			)
			;(0, vitest_1.expect)(parentInstance.resumeAfterDelegation).toHaveBeenCalledTimes(1)
		},
	)
	;(0, vitest_1.it)(
		"reopenParentFromDelegation logs child status persistence failure and continues reopen flow (RPD-04)",
		async () => {
			const logSpy = vitest_1.vi.fn()
			const emitSpy = vitest_1.vi.fn()
			const parentInstance = {
				resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
				overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
				overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
			}
			const updateTaskHistory = vitest_1.vi.fn().mockImplementation(async (historyItem) => {
				if (historyItem.id === "child-rpd04") {
					throw new Error("child status persist failed")
				}
				return []
			})
			const provider = {
				contextProxy: { globalStorageUri: { fsPath: "/tmp" } },
				getTaskWithId: vitest_1.vi.fn().mockImplementation(async (id) => {
					if (id === "parent-rpd04") {
						return {
							historyItem: {
								id: "parent-rpd04",
								status: "delegated",
								awaitingChildId: "child-rpd04",
								childIds: ["child-rpd04"],
								ts: 700,
								task: "Parent RPD-04",
								tokensIn: 0,
								tokensOut: 0,
								totalCost: 0,
							},
						}
					}
					return {
						historyItem: {
							id: "child-rpd04",
							status: "active",
							ts: 701,
							task: "Child RPD-04",
							tokensIn: 0,
							tokensOut: 0,
							totalCost: 0,
						},
					}
				}),
				emit: emitSpy,
				log: logSpy,
				getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "child-rpd04" })),
				removeClineFromStack: vitest_1.vi.fn().mockResolvedValue(undefined),
				createTaskWithHistoryItem: vitest_1.vi.fn().mockResolvedValue(parentInstance),
				updateTaskHistory,
			}
			vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue([])
			vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue([])
			await (0, vitest_1.expect)(
				ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
					parentTaskId: "parent-rpd04",
					childTaskId: "child-rpd04",
					completionResultSummary: "Child completion with persistence failure",
				}),
			).resolves.toBeUndefined()
			;(0, vitest_1.expect)(logSpy).toHaveBeenCalledWith(
				vitest_1.expect.stringContaining(
					"[reopenParentFromDelegation] Failed to persist child completed status for child-rpd04:",
				),
			)
			;(0, vitest_1.expect)(updateTaskHistory).toHaveBeenCalledWith(
				vitest_1.expect.objectContaining({
					id: "parent-rpd04",
					status: "active",
					completedByChildId: "child-rpd04",
				}),
			)
			;(0, vitest_1.expect)(parentInstance.resumeAfterDelegation).toHaveBeenCalledTimes(1)
			;(0, vitest_1.expect)(emitSpy).toHaveBeenCalledWith(
				types_1.AliCodeEventName.TaskDelegationResumed,
				"parent-rpd04",
				"child-rpd04",
			)
		},
	)
	;(0, vitest_1.it)("handles empty history gracefully when injecting synthetic messages", async () => {
		const provider = {
			contextProxy: { globalStorageUri: { fsPath: "/tmp" } },
			getTaskWithId: vitest_1.vi.fn().mockResolvedValue({
				historyItem: {
					id: "p5",
					status: "delegated",
					awaitingChildId: "c5",
					childIds: [],
					ts: 500,
					task: "P5",
					tokensIn: 0,
					tokensOut: 0,
					totalCost: 0,
				},
			}),
			emit: vitest_1.vi.fn(),
			getCurrentTask: vitest_1.vi.fn(() => ({ taskId: "c5" })),
			removeClineFromStack: vitest_1.vi.fn().mockResolvedValue(undefined),
			createTaskWithHistoryItem: vitest_1.vi.fn().mockResolvedValue({
				resumeAfterDelegation: vitest_1.vi.fn().mockResolvedValue(undefined),
				overwriteClineMessages: vitest_1.vi.fn().mockResolvedValue(undefined),
				overwriteApiConversationHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
			}),
			updateTaskHistory: vitest_1.vi.fn().mockResolvedValue([]),
		}
		// Mock read failures or empty returns
		vitest_1.vi.mocked(taskMessages_1.readTaskMessages).mockResolvedValue([])
		vitest_1.vi.mocked(task_persistence_1.readApiMessages).mockResolvedValue([])
		await (0, vitest_1.expect)(
			ClineProvider_1.ClineProvider.prototype.reopenParentFromDelegation.call(provider, {
				parentTaskId: "p5",
				childTaskId: "c5",
				completionResultSummary: "Result",
			}),
		).resolves.toBeUndefined()
		// Verify saves still occurred with just the injected message
		;(0, vitest_1.expect)(task_persistence_1.saveTaskMessages).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				messages: [
					vitest_1.expect.objectContaining({
						type: "say",
						say: "subtask_result",
					}),
				],
			}),
		)
		;(0, vitest_1.expect)(task_persistence_1.saveApiMessages).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				messages: [
					vitest_1.expect.objectContaining({
						role: "user",
					}),
				],
			}),
		)
	})
})
