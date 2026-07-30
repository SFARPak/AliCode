"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const checkpointRestoreHandler_1 = require("../checkpointRestoreHandler")
const task_persistence_1 = require("../../task-persistence")
const p_wait_for_1 = __importDefault(require("p-wait-for"))
const vscode = __importStar(require("vscode"))
// Mock dependencies
vitest_1.vi.mock("../../task-persistence", () => ({
	saveTaskMessages: vitest_1.vi.fn(),
}))
vitest_1.vi.mock("p-wait-for")
vitest_1.vi.mock("vscode", () => ({
	window: {
		showErrorMessage: vitest_1.vi.fn(),
	},
}))
;(0, vitest_1.describe)("checkpointRestoreHandler", () => {
	let mockProvider
	let mockCline
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		// Setup mock Cline instance
		mockCline = {
			taskId: "test-task-123",
			abort: false,
			abortTask: vitest_1.vi.fn(() => {
				mockCline.abort = true
			}),
			checkpointRestore: vitest_1.vi.fn(),
			clineMessages: [
				{ ts: 1, type: "user", say: "user", text: "First message" },
				{ ts: 2, type: "assistant", say: "assistant", text: "Response" },
				{
					ts: 3,
					type: "user",
					say: "user",
					text: "Checkpoint message",
					checkpoint: { hash: "abc123" },
				},
				{ ts: 4, type: "assistant", say: "assistant", text: "After checkpoint" },
			],
		}
		// Setup mock provider
		mockProvider = {
			getCurrentTask: vitest_1.vi.fn(() => mockCline),
			postMessageToWebview: vitest_1.vi.fn(),
			getTaskWithId: vitest_1.vi.fn(() => ({
				historyItem: { id: "test-task-123", messages: mockCline.clineMessages },
			})),
			createTaskWithHistoryItem: vitest_1.vi.fn(),
			setPendingEditOperation: vitest_1.vi.fn(),
			contextProxy: {
				globalStorageUri: { fsPath: "/test/storage" },
			},
		}
		p_wait_for_1.default.mockImplementation(async (condition) => {
			// Simulate the condition being met
			return Promise.resolve()
		})
	})
	;(0, vitest_1.describe)("handleCheckpointRestoreOperation", () => {
		;(0, vitest_1.it)("should abort task before checkpoint restore for delete operations", async () => {
			// Simulate a task that hasn't been aborted yet
			mockCline.abort = false
			await (0, checkpointRestoreHandler_1.handleCheckpointRestoreOperation)({
				provider: mockProvider,
				currentCline: mockCline,
				messageTs: 3,
				messageIndex: 2,
				checkpoint: { hash: "abc123" },
				operation: "delete",
			})
			// Verify abortTask was called before checkpointRestore
			;(0, vitest_1.expect)(mockCline.abortTask).toHaveBeenCalled()
			;(0, vitest_1.expect)(mockCline.checkpointRestore).toHaveBeenCalled()
			// Verify the order of operations
			const abortOrder = mockCline.abortTask.mock.invocationCallOrder[0]
			const restoreOrder = mockCline.checkpointRestore.mock.invocationCallOrder[0]
			;(0, vitest_1.expect)(abortOrder).toBeLessThan(restoreOrder)
		})
		;(0, vitest_1.it)("should not abort task if already aborted", async () => {
			// Simulate a task that's already aborted
			mockCline.abort = true
			await (0, checkpointRestoreHandler_1.handleCheckpointRestoreOperation)({
				provider: mockProvider,
				currentCline: mockCline,
				messageTs: 3,
				messageIndex: 2,
				checkpoint: { hash: "abc123" },
				operation: "delete",
			})
			// Verify abortTask was not called
			;(0, vitest_1.expect)(mockCline.abortTask).not.toHaveBeenCalled()
			;(0, vitest_1.expect)(mockCline.checkpointRestore).toHaveBeenCalled()
		})
		;(0, vitest_1.it)("should handle edit operations with pending edit data", async () => {
			const editData = {
				editedContent: "Edited content",
				images: ["image1.png"],
				apiConversationHistoryIndex: 2,
			}
			await (0, checkpointRestoreHandler_1.handleCheckpointRestoreOperation)({
				provider: mockProvider,
				currentCline: mockCline,
				messageTs: 3,
				messageIndex: 2,
				checkpoint: { hash: "abc123" },
				operation: "edit",
				editData,
			})
			// Verify abortTask was NOT called for edit operations
			;(0, vitest_1.expect)(mockCline.abortTask).not.toHaveBeenCalled()
			// Verify pending edit operation was set
			;(0, vitest_1.expect)(mockProvider.setPendingEditOperation).toHaveBeenCalledWith("task-test-task-123", {
				messageTs: 3,
				editedContent: "Edited content",
				images: ["image1.png"],
				messageIndex: 2,
				apiConversationHistoryIndex: 2,
			})
			// Verify checkpoint restore was called with edit operation
			;(0, vitest_1.expect)(mockCline.checkpointRestore).toHaveBeenCalledWith({
				ts: 3,
				commitHash: "abc123",
				mode: "restore",
				operation: "edit",
			})
		})
		;(0, vitest_1.it)("should save messages after delete operation", async () => {
			// Mock the checkpoint restore to simulate message deletion
			mockCline.checkpointRestore.mockImplementation(async () => {
				mockCline.clineMessages = mockCline.clineMessages.slice(0, 2)
			})
			await (0, checkpointRestoreHandler_1.handleCheckpointRestoreOperation)({
				provider: mockProvider,
				currentCline: mockCline,
				messageTs: 3,
				messageIndex: 2,
				checkpoint: { hash: "abc123" },
				operation: "delete",
			})
			// Verify saveTaskMessages was called
			;(0, vitest_1.expect)(task_persistence_1.saveTaskMessages).toHaveBeenCalledWith({
				messages: mockCline.clineMessages,
				taskId: "test-task-123",
				globalStoragePath: "/test/storage",
			})
			// Verify createTaskWithHistoryItem was called
			;(0, vitest_1.expect)(mockProvider.createTaskWithHistoryItem).toHaveBeenCalled()
		})
		;(0, vitest_1.it)("should reinitialize task with correct history item after delete", async () => {
			const expectedHistoryItem = {
				id: "test-task-123",
				messages: mockCline.clineMessages,
			}
			await (0, checkpointRestoreHandler_1.handleCheckpointRestoreOperation)({
				provider: mockProvider,
				currentCline: mockCline,
				messageTs: 3,
				messageIndex: 2,
				checkpoint: { hash: "abc123" },
				operation: "delete",
			})
			// Verify getTaskWithId was called
			;(0, vitest_1.expect)(mockProvider.getTaskWithId).toHaveBeenCalledWith("test-task-123")
			// Verify createTaskWithHistoryItem was called with the correct history item
			;(0, vitest_1.expect)(mockProvider.createTaskWithHistoryItem).toHaveBeenCalledWith(expectedHistoryItem)
		})
		;(0, vitest_1.it)("should not save messages or reinitialize for edit operation", async () => {
			const editData = {
				editedContent: "Edited content",
				images: [],
				apiConversationHistoryIndex: 2,
			}
			await (0, checkpointRestoreHandler_1.handleCheckpointRestoreOperation)({
				provider: mockProvider,
				currentCline: mockCline,
				messageTs: 3,
				messageIndex: 2,
				checkpoint: { hash: "abc123" },
				operation: "edit",
				editData,
			})
			// Verify saveTaskMessages was NOT called for edit operation
			;(0, vitest_1.expect)(task_persistence_1.saveTaskMessages).not.toHaveBeenCalled()
			// Verify createTaskWithHistoryItem was NOT called for edit operation
			;(0, vitest_1.expect)(mockProvider.createTaskWithHistoryItem).not.toHaveBeenCalled()
		})
		;(0, vitest_1.it)("should handle errors gracefully", async () => {
			// Mock checkpoint restore to throw an error
			mockCline.checkpointRestore.mockRejectedValue(new Error("Checkpoint restore failed"))
			// The function should throw and show an error message
			await (0, vitest_1.expect)(
				(0, checkpointRestoreHandler_1.handleCheckpointRestoreOperation)({
					provider: mockProvider,
					currentCline: mockCline,
					messageTs: 3,
					messageIndex: 2,
					checkpoint: { hash: "abc123" },
					operation: "delete",
				}),
			).rejects.toThrow("Checkpoint restore failed")
			// Verify error message was shown
			;(0, vitest_1.expect)(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				"Error during checkpoint restore: Checkpoint restore failed",
			)
		})
	})
})
