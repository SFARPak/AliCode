"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const ClineProvider_1 = require("../ClineProvider")
const Task_1 = require("../../task/Task")
// Mock dependencies
vitest_1.vi.mock("vscode", () => {
	const mockDisposable = { dispose: vitest_1.vi.fn() }
	return {
		workspace: {
			getConfiguration: vitest_1.vi.fn(() => ({
				get: vitest_1.vi.fn().mockReturnValue([]),
				update: vitest_1.vi.fn().mockResolvedValue(undefined),
			})),
			workspaceFolders: [],
			onDidChangeConfiguration: vitest_1.vi.fn(() => mockDisposable),
		},
		env: {
			uriScheme: "vscode",
			language: "en",
		},
		EventEmitter: vitest_1.vi.fn().mockImplementation(() => ({
			event: vitest_1.vi.fn(),
			fire: vitest_1.vi.fn(),
		})),
		Disposable: {
			from: vitest_1.vi.fn(),
		},
		window: {
			showErrorMessage: vitest_1.vi.fn(),
			createTextEditorDecorationType: vitest_1.vi.fn().mockReturnValue({
				dispose: vitest_1.vi.fn(),
			}),
			onDidChangeActiveTextEditor: vitest_1.vi.fn(() => mockDisposable),
		},
		Uri: {
			file: vitest_1.vi.fn().mockReturnValue({ toString: () => "file://test" }),
		},
	}
})
vitest_1.vi.mock("../../task/Task")
vitest_1.vi.mock("../../config/ContextProxy")
vitest_1.vi.mock("../../../services/mcp/McpServerManager", () => ({
	McpServerManager: {
		getInstance: vitest_1.vi.fn().mockResolvedValue({
			registerClient: vitest_1.vi.fn(),
		}),
		unregisterProvider: vitest_1.vi.fn(),
	},
}))
vitest_1.vi.mock("../../../integrations/workspace/WorkspaceTracker")
vitest_1.vi.mock("../../config/ProviderSettingsManager")
vitest_1.vi.mock("../../config/CustomModesManager")
vitest_1.vi.mock("../../../utils/path", () => ({
	getWorkspacePath: vitest_1.vi.fn().mockReturnValue("/test/workspace"),
}))
vitest_1.vi.mock("../../../shared/embeddingModels", () => ({
	EMBEDDING_MODEL_PROFILES: [],
}))
;(0, vitest_1.describe)("ClineProvider flicker-free cancel", () => {
	let provider
	let mockContext
	let mockOutputChannel
	let mockTask1
	let mockTask2
	const mockApiConfig = {
		apiProvider: "anthropic",
		apiKey: "test-key",
	}
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		// Setup mock extension context
		mockContext = {
			globalState: {
				get: vitest_1.vi.fn().mockReturnValue(undefined),
				update: vitest_1.vi.fn().mockResolvedValue(undefined),
				keys: vitest_1.vi.fn().mockReturnValue([]),
			},
			globalStorageUri: { fsPath: "/test/storage" },
			secrets: {
				get: vitest_1.vi.fn().mockResolvedValue(undefined),
				store: vitest_1.vi.fn().mockResolvedValue(undefined),
				delete: vitest_1.vi.fn().mockResolvedValue(undefined),
			},
			workspaceState: {
				get: vitest_1.vi.fn().mockReturnValue(undefined),
				update: vitest_1.vi.fn().mockResolvedValue(undefined),
				keys: vitest_1.vi.fn().mockReturnValue([]),
			},
			extensionUri: { fsPath: "/test/extension" },
		}
		// Setup mock output channel
		mockOutputChannel = {
			appendLine: vitest_1.vi.fn(),
			dispose: vitest_1.vi.fn(),
		}
		// Setup mock context proxy
		const mockContextProxy = {
			getValues: vitest_1.vi.fn().mockReturnValue({}),
			getValue: vitest_1.vi.fn().mockReturnValue(undefined),
			setValue: vitest_1.vi.fn().mockResolvedValue(undefined),
			getProviderSettings: vitest_1.vi.fn().mockReturnValue(mockApiConfig),
			extensionUri: mockContext.extensionUri,
			globalStorageUri: mockContext.globalStorageUri,
		}
		// Create provider instance
		provider = new ClineProvider_1.ClineProvider(mockContext, mockOutputChannel, "sidebar", mockContextProxy)
		// Mock provider methods
		provider.getState = vitest_1.vi.fn().mockResolvedValue({
			apiConfiguration: mockApiConfig,
			mode: "code",
		})
		provider.postStateToWebview = vitest_1.vi.fn().mockResolvedValue(undefined)
		provider.postStateToWebviewWithoutTaskHistory = vitest_1.vi.fn().mockResolvedValue(undefined)
		provider.updateGlobalState = vitest_1.vi.fn().mockResolvedValue(undefined)
		provider.activateProviderProfile = vitest_1.vi.fn().mockResolvedValue(undefined)
		provider.performPreparationTasks = vitest_1.vi.fn().mockResolvedValue(undefined)
		provider.getTaskWithId = vitest_1.vi.fn().mockImplementation((id) =>
			Promise.resolve({
				historyItem: {
					id,
					number: 1,
					ts: Date.now(),
					task: "test task",
					tokensIn: 100,
					tokensOut: 200,
					totalCost: 0.001,
					workspace: "/test/workspace",
				},
			}),
		)
		// Setup mock tasks
		mockTask1 = {
			taskId: "task-1",
			instanceId: "instance-1",
			emit: vitest_1.vi.fn(),
			abortTask: vitest_1.vi.fn().mockResolvedValue(undefined),
			abandoned: false,
			dispose: vitest_1.vi.fn(),
			on: vitest_1.vi.fn(),
			off: vitest_1.vi.fn(),
		}
		mockTask2 = {
			taskId: "task-1", // Same ID for rehydration scenario
			instanceId: "instance-2", // Different instance
			emit: vitest_1.vi.fn(),
			on: vitest_1.vi.fn(),
			off: vitest_1.vi.fn(),
		}
		// Mock Task constructor
		vitest_1.vi.mocked(Task_1.Task).mockImplementation(() => mockTask2)
	})
	;(0, vitest_1.it)("should not remove current task from stack when rehydrating same taskId", async () => {
		// Setup: Add a task to the stack first
		provider.clineStack = [mockTask1]
		provider.taskEventListeners = new WeakMap()
		const mockCleanupFunctions = [vitest_1.vi.fn(), vitest_1.vi.fn()]
		provider.taskEventListeners.set(mockTask1, mockCleanupFunctions)
		// Spy on removeClineFromStack to verify it's NOT called
		const removeClineFromStackSpy = vitest_1.vi.spyOn(provider, "removeClineFromStack")
		// Create history item with same taskId as current task
		const historyItem = {
			id: "task-1", // Same as mockTask1.taskId
			number: 1,
			task: "test task",
			ts: Date.now(),
			tokensIn: 100,
			tokensOut: 200,
			totalCost: 0.001,
			workspace: "/test/workspace",
		}
		// Act: Create task with history item (should rehydrate in-place)
		await provider.createTaskWithHistoryItem(historyItem)
		// Assert: removeClineFromStack should NOT be called
		;(0, vitest_1.expect)(removeClineFromStackSpy).not.toHaveBeenCalled()
		// Verify the task was replaced in-place
		;(0, vitest_1.expect)(provider.clineStack).toHaveLength(1)
		;(0, vitest_1.expect)(provider.clineStack[0]).toBe(mockTask2)
		// Verify old event listeners were cleaned up
		;(0, vitest_1.expect)(mockCleanupFunctions[0]).toHaveBeenCalled()
		;(0, vitest_1.expect)(mockCleanupFunctions[1]).toHaveBeenCalled()
		// Verify new task received focus event
		;(0, vitest_1.expect)(mockTask2.emit).toHaveBeenCalledWith("taskFocused")
	})
	;(0, vitest_1.it)("should remove task from stack when creating different task", async () => {
		// Setup: Add a task to the stack first
		provider.clineStack = [mockTask1]
		// Spy on removeClineFromStack to verify it IS called
		const removeClineFromStackSpy = vitest_1.vi.spyOn(provider, "removeClineFromStack").mockResolvedValue(undefined)
		// Create history item with different taskId
		const historyItem = {
			id: "task-2", // Different from mockTask1.taskId
			number: 2,
			task: "different task",
			ts: Date.now(),
			tokensIn: 150,
			tokensOut: 250,
			totalCost: 0.002,
			workspace: "/test/workspace",
		}
		// Act: Create task with different history item
		await provider.createTaskWithHistoryItem(historyItem)
		// Assert: removeClineFromStack should be called
		;(0, vitest_1.expect)(removeClineFromStackSpy).toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should handle empty stack gracefully during rehydration attempt", async () => {
		// Setup: Empty stack
		provider.clineStack = []
		// Spy on removeClineFromStack
		const removeClineFromStackSpy = vitest_1.vi.spyOn(provider, "removeClineFromStack").mockResolvedValue(undefined)
		// Create history item
		const historyItem = {
			id: "task-1",
			number: 1,
			task: "test task",
			ts: Date.now(),
			tokensIn: 100,
			tokensOut: 200,
			totalCost: 0.001,
			workspace: "/test/workspace",
		}
		// Act: Should not error and should call removeClineFromStack
		await provider.createTaskWithHistoryItem(historyItem)
		// Assert: removeClineFromStack should be called (no current task to rehydrate)
		;(0, vitest_1.expect)(removeClineFromStackSpy).toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should maintain task stack integrity during flicker-free replacement", async () => {
		// Setup: Stack with multiple tasks
		const mockParentTask = {
			taskId: "parent-task",
			instanceId: "parent-instance",
			emit: vitest_1.vi.fn(),
		}
		provider.clineStack = [mockParentTask, mockTask1]
		provider.taskEventListeners = new WeakMap()
		provider.taskEventListeners.set(mockTask1, [vitest_1.vi.fn()])
		// Act: Rehydrate the current (top) task
		const historyItem = {
			id: "task-1",
			number: 1,
			task: "test task",
			ts: Date.now(),
			tokensIn: 100,
			tokensOut: 200,
			totalCost: 0.001,
			workspace: "/test/workspace",
		}
		await provider.createTaskWithHistoryItem(historyItem)
		// Assert: Stack should maintain parent task and replace current task
		;(0, vitest_1.expect)(provider.clineStack).toHaveLength(2)
		;(0, vitest_1.expect)(provider.clineStack[0]).toBe(mockParentTask)
		;(0, vitest_1.expect)(provider.clineStack[1]).toBe(mockTask2)
	})
})
