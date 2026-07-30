"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const webviewMessageHandler_1 = require("../webviewMessageHandler")
const task_persistence_1 = require("../../task-persistence")
const checkpointRestoreHandler_1 = require("../checkpointRestoreHandler")
const message_manager_1 = require("../../message-manager")
// Mock dependencies
vitest_1.vi.mock("../../task-persistence")
vitest_1.vi.mock("../checkpointRestoreHandler")
vitest_1.vi.mock("vscode", () => ({
	window: {
		showErrorMessage: vitest_1.vi.fn(),
	},
	workspace: {
		workspaceFolders: undefined,
	},
}))
;(0, vitest_1.describe)("webviewMessageHandler - checkpoint operations", () => {
	let mockProvider
	let mockCline
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		// Setup mock Cline instance
		mockCline = {
			taskId: "test-task-123",
			clineMessages: [
				{ ts: 1, type: "user", say: "user", text: "First message" },
				{ ts: 2, type: "assistant", say: "checkpoint_saved", text: "abc123" },
				{ ts: 3, type: "user", say: "user", text: "Message to delete" },
				{ ts: 4, type: "assistant", say: "assistant", text: "After message" },
			],
			apiConversationHistory: [
				{ ts: 1, role: "user", content: [{ type: "text", text: "First message" }] },
				{ ts: 3, role: "user", content: [{ type: "text", text: "Message to delete" }] },
				{ ts: 4, role: "assistant", content: [{ type: "text", text: "After message" }] },
			],
			checkpointRestore: vitest_1.vi.fn(),
			overwriteClineMessages: vitest_1.vi.fn(),
			overwriteApiConversationHistory: vitest_1.vi.fn(),
		}
		mockCline.messageManager = new message_manager_1.MessageManager(mockCline)
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
			getState: vitest_1.vi.fn().mockResolvedValue({
				maxImageFileSize: 5,
				maxTotalImageSize: 20,
			}),
		}
	})
	;(0, vitest_1.describe)("delete operations with checkpoint restoration", () => {
		;(0, vitest_1.it)("should call handleCheckpointRestoreOperation for checkpoint deletes", async () => {
			// Mock handleCheckpointRestoreOperation
			checkpointRestoreHandler_1.handleCheckpointRestoreOperation.mockResolvedValue(undefined)
			// Call the handler with delete confirmation
			await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
				type: "deleteMessageConfirm",
				messageTs: 1,
				restoreCheckpoint: true,
			})
			// Verify handleCheckpointRestoreOperation was called with correct parameters
			;(0, vitest_1.expect)(checkpointRestoreHandler_1.handleCheckpointRestoreOperation).toHaveBeenCalledWith({
				provider: mockProvider,
				currentCline: mockCline,
				messageTs: 1,
				messageIndex: 0,
				checkpoint: { hash: "abc123" },
				operation: "delete",
			})
		})
		;(0, vitest_1.it)("should save messages for non-checkpoint deletes", async () => {
			// Call the handler with delete confirmation (no checkpoint restoration)
			await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
				type: "deleteMessageConfirm",
				messageTs: 2,
				restoreCheckpoint: false,
			})
			// Verify saveTaskMessages was called
			;(0, vitest_1.expect)(task_persistence_1.saveTaskMessages).toHaveBeenCalledWith({
				messages: vitest_1.expect.any(Array),
				taskId: "test-task-123",
				globalStoragePath: "/test/storage",
			})
			// Verify checkpoint restore was NOT called
			;(0, vitest_1.expect)(mockCline.checkpointRestore).not.toHaveBeenCalled()
		})
	})
	;(0, vitest_1.describe)("edit operations with checkpoint restoration", () => {
		;(0, vitest_1.it)("should call handleCheckpointRestoreOperation for checkpoint edits", async () => {
			// Mock handleCheckpointRestoreOperation
			checkpointRestoreHandler_1.handleCheckpointRestoreOperation.mockResolvedValue(undefined)
			// Call the handler with edit confirmation
			await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
				type: "editMessageConfirm",
				messageTs: 1,
				text: "Edited checkpoint message",
				restoreCheckpoint: true,
			})
			// Verify handleCheckpointRestoreOperation was called with correct parameters
			;(0, vitest_1.expect)(checkpointRestoreHandler_1.handleCheckpointRestoreOperation).toHaveBeenCalledWith({
				provider: mockProvider,
				currentCline: mockCline,
				messageTs: 1,
				messageIndex: 0,
				checkpoint: { hash: "abc123" },
				operation: "edit",
				editData: {
					editedContent: "Edited checkpoint message",
					images: [],
					apiConversationHistoryIndex: 0,
				},
			})
		})
	})
})
