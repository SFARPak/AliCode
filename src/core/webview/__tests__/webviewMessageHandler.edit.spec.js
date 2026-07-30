"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
// Mock dependencies first
vitest_1.vi.mock("vscode", () => ({
	window: {
		showWarningMessage: vitest_1.vi.fn(),
		showErrorMessage: vitest_1.vi.fn(),
	},
	workspace: {
		workspaceFolders: [{ uri: { fsPath: "/mock/workspace" } }],
		getConfiguration: vitest_1.vi.fn().mockReturnValue({
			get: vitest_1.vi.fn(),
			update: vitest_1.vi.fn(),
		}),
	},
	Uri: {
		file: vitest_1.vi.fn((path) => ({ fsPath: path })),
	},
	env: {
		uriScheme: "vscode",
	},
}))
vitest_1.vi.mock("../../task-persistence", () => ({
	saveTaskMessages: vitest_1.vi.fn(),
}))
vitest_1.vi.mock("../../../api/providers/fetchers/modelCache", () => ({
	getModels: vitest_1.vi.fn(),
	flushModels: vitest_1.vi.fn(),
	getModelsFromCache: vitest_1.vi.fn().mockReturnValue(undefined),
}))
vitest_1.vi.mock("../checkpointRestoreHandler", () => ({
	handleCheckpointRestoreOperation: vitest_1.vi.fn(),
}))
// Import after mocks
const webviewMessageHandler_1 = require("../webviewMessageHandler")
const message_manager_1 = require("../../message-manager")
;(0, vitest_1.describe)("webviewMessageHandler - Edit Message with Timestamp Fallback", () => {
	let mockClineProvider
	let mockCurrentTask
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		// Create a mock task with messages
		mockCurrentTask = {
			taskId: "test-task-id",
			clineMessages: [],
			apiConversationHistory: [],
			overwriteClineMessages: vitest_1.vi.fn(),
			overwriteApiConversationHistory: vitest_1.vi.fn(),
			handleWebviewAskResponse: vitest_1.vi.fn(),
		}
		mockCurrentTask.messageManager = new message_manager_1.MessageManager(mockCurrentTask)
		// Create mock provider
		mockClineProvider = {
			getCurrentTask: vitest_1.vi.fn().mockReturnValue(mockCurrentTask),
			postMessageToWebview: vitest_1.vi.fn(),
			contextProxy: {
				getValue: vitest_1.vi.fn(),
				setValue: vitest_1.vi.fn(),
				globalStorageUri: { fsPath: "/mock/storage" },
			},
			log: vitest_1.vi.fn(),
			getState: vitest_1.vi.fn().mockResolvedValue({
				maxImageFileSize: 5,
				maxTotalImageSize: 20,
			}),
		}
	})
	;(0, vitest_1.it)("should not modify API history when apiConversationHistoryIndex is -1", async () => {
		// Setup: User message followed by attempt_completion
		const userMessageTs = 1000
		const assistantMessageTs = 2000
		const completionMessageTs = 3000
		// UI messages (clineMessages)
		mockCurrentTask.clineMessages = [
			{
				ts: userMessageTs,
				type: "say",
				say: "user_feedback",
				text: "Hello",
			},
			{
				ts: completionMessageTs,
				type: "say",
				say: "completion_result",
				text: "Task Completed!",
			},
		]
		// API conversation history - note the user message is missing (common scenario after condense)
		mockCurrentTask.apiConversationHistory = [
			{
				ts: assistantMessageTs,
				role: "assistant",
				content: [
					{
						type: "text",
						text: "I'll help you with that.",
					},
				],
			},
			{
				ts: completionMessageTs,
				role: "assistant",
				content: [
					{
						type: "tool_use",
						name: "attempt_completion",
						id: "tool-1",
						input: {
							result: "Task Completed!",
						},
					},
				],
			},
		]
		// Trigger edit confirmation
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "editMessageConfirm",
			messageTs: userMessageTs,
			text: "Hello World", // edited content
			restoreCheckpoint: false,
		})
		// Verify that UI messages were truncated at the correct index
		;(0, vitest_1.expect)(mockCurrentTask.overwriteClineMessages).toHaveBeenCalledWith([])
		// API history should be truncated from first message at/after edited timestamp (fallback)
		;(0, vitest_1.expect)(mockCurrentTask.overwriteApiConversationHistory).toHaveBeenCalledWith([])
	})
	;(0, vitest_1.it)(
		"should preserve messages before the edited message when message not in API history",
		async () => {
			const earlierMessageTs = 500
			const userMessageTs = 1000
			const assistantMessageTs = 2000
			// UI messages
			mockCurrentTask.clineMessages = [
				{
					ts: earlierMessageTs,
					type: "say",
					say: "user_feedback",
					text: "Earlier message",
				},
				{
					ts: userMessageTs,
					type: "say",
					say: "user_feedback",
					text: "Hello",
				},
				{
					ts: assistantMessageTs,
					type: "say",
					say: "text",
					text: "Response",
				},
			]
			// API history - missing the exact user message at ts=1000
			mockCurrentTask.apiConversationHistory = [
				{
					ts: earlierMessageTs,
					role: "user",
					content: [{ type: "text", text: "Earlier message" }],
				},
				{
					ts: assistantMessageTs,
					role: "assistant",
					content: [{ type: "text", text: "Response" }],
				},
			]
			await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
				type: "editMessageConfirm",
				messageTs: userMessageTs,
				text: "Hello World",
				restoreCheckpoint: false,
			})
			// Verify UI messages were truncated to preserve earlier message
			;(0, vitest_1.expect)(mockCurrentTask.overwriteClineMessages).toHaveBeenCalledWith([
				{
					ts: earlierMessageTs,
					type: "say",
					say: "user_feedback",
					text: "Earlier message",
				},
			])
			// API history should be truncated from the first API message at/after the edited timestamp (fallback)
			;(0, vitest_1.expect)(mockCurrentTask.overwriteApiConversationHistory).toHaveBeenCalledWith([
				{
					ts: earlierMessageTs,
					role: "user",
					content: [{ type: "text", text: "Earlier message" }],
				},
			])
		},
	)
	;(0, vitest_1.it)("should not use fallback when exact apiConversationHistoryIndex is found", async () => {
		const userMessageTs = 1000
		const assistantMessageTs = 2000
		// Both UI and API have the message at the same timestamp
		mockCurrentTask.clineMessages = [
			{
				ts: userMessageTs,
				type: "say",
				say: "user_feedback",
				text: "Hello",
			},
			{
				ts: assistantMessageTs,
				type: "say",
				say: "text",
				text: "Response",
			},
		]
		mockCurrentTask.apiConversationHistory = [
			{
				ts: userMessageTs,
				role: "user",
				content: [{ type: "text", text: "Hello" }],
			},
			{
				ts: assistantMessageTs,
				role: "assistant",
				content: [{ type: "text", text: "Response" }],
			},
		]
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "editMessageConfirm",
			messageTs: userMessageTs,
			text: "Hello World",
			restoreCheckpoint: false,
		})
		// Both should be truncated at index 0
		;(0, vitest_1.expect)(mockCurrentTask.overwriteClineMessages).toHaveBeenCalledWith([])
		;(0, vitest_1.expect)(mockCurrentTask.overwriteApiConversationHistory).toHaveBeenCalledWith([])
	})
	;(0, vitest_1.it)("should handle case where no API messages match timestamp criteria", async () => {
		const userMessageTs = 3000
		mockCurrentTask.clineMessages = [
			{
				ts: userMessageTs,
				type: "say",
				say: "user_feedback",
				text: "Hello",
			},
		]
		// All API messages have timestamps before the edited message
		mockCurrentTask.apiConversationHistory = [
			{
				ts: 1000,
				role: "assistant",
				content: [{ type: "text", text: "Old message 1" }],
			},
			{
				ts: 2000,
				role: "assistant",
				content: [{ type: "text", text: "Old message 2" }],
			},
		]
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "editMessageConfirm",
			messageTs: userMessageTs,
			text: "Hello World",
			restoreCheckpoint: false,
		})
		// UI messages truncated
		;(0, vitest_1.expect)(mockCurrentTask.overwriteClineMessages).toHaveBeenCalledWith([])
		// API history should not be modified when no API messages meet the timestamp criteria
		;(0, vitest_1.expect)(mockCurrentTask.overwriteApiConversationHistory).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should handle empty API conversation history gracefully", async () => {
		const userMessageTs = 1000
		mockCurrentTask.clineMessages = [
			{
				ts: userMessageTs,
				type: "say",
				say: "user_feedback",
				text: "Hello",
			},
		]
		mockCurrentTask.apiConversationHistory = []
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "editMessageConfirm",
			messageTs: userMessageTs,
			text: "Hello World",
			restoreCheckpoint: false,
		})
		// UI messages should be truncated
		;(0, vitest_1.expect)(mockCurrentTask.overwriteClineMessages).toHaveBeenCalledWith([])
		// API history should not be modified when message not found
		;(0, vitest_1.expect)(mockCurrentTask.overwriteApiConversationHistory).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should correctly handle attempt_completion in API history", async () => {
		const userMessageTs = 1000
		const completionTs = 2000
		const feedbackTs = 3000
		mockCurrentTask.clineMessages = [
			{
				ts: userMessageTs,
				type: "say",
				say: "user_feedback",
				text: "Do something",
			},
			{
				ts: completionTs,
				type: "say",
				say: "completion_result",
				text: "Task Completed!",
			},
			{
				ts: feedbackTs,
				type: "say",
				say: "user_feedback",
				text: "Thanks",
			},
		]
		// API history with attempt_completion tool use (user message missing)
		mockCurrentTask.apiConversationHistory = [
			{
				ts: completionTs,
				role: "assistant",
				content: [
					{
						type: "tool_use",
						name: "attempt_completion",
						id: "tool-1",
						input: {
							result: "Task Completed!",
						},
					},
				],
			},
			{
				ts: feedbackTs,
				role: "user",
				content: [
					{
						type: "text",
						text: "Thanks",
					},
				],
			},
		]
		// Edit the first user message
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "editMessageConfirm",
			messageTs: userMessageTs,
			text: "Do something else",
			restoreCheckpoint: false,
		})
		// UI messages truncated at edited message
		;(0, vitest_1.expect)(mockCurrentTask.overwriteClineMessages).toHaveBeenCalledWith([])
		// API history should be truncated from first message at/after edited timestamp (fallback)
		;(0, vitest_1.expect)(mockCurrentTask.overwriteApiConversationHistory).toHaveBeenCalledWith([])
	})
})
