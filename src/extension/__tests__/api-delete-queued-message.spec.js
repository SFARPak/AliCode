"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const api_1 = require("../api")
vitest_1.vi.mock("vscode")
vitest_1.vi.mock("../../core/webview/ClineProvider")
;(0, vitest_1.describe)("API - DeleteQueuedMessage Command", () => {
	let api
	let mockOutputChannel
	let mockProvider
	let mockRemoveMessage
	let mockLog
	;(0, vitest_1.beforeEach)(() => {
		mockOutputChannel = {
			appendLine: vitest_1.vi.fn(),
		}
		mockRemoveMessage = vitest_1.vi.fn().mockReturnValue(true)
		mockProvider = {
			context: {},
			postMessageToWebview: vitest_1.vi.fn().mockResolvedValue(undefined),
			on: vitest_1.vi.fn(),
			getCurrentTaskStack: vitest_1.vi.fn().mockReturnValue([]),
			getCurrentTask: vitest_1.vi.fn().mockReturnValue({
				messageQueueService: {
					removeMessage: mockRemoveMessage,
				},
			}),
			viewLaunched: true,
		}
		mockLog = vitest_1.vi.fn()
		api = new api_1.API(mockOutputChannel, mockProvider, undefined, true)
		api.log = mockLog
	})
	;(0, vitest_1.it)("should remove a queued message by id", () => {
		const messageId = "msg-abc-123"
		api.deleteQueuedMessage(messageId)
		;(0, vitest_1.expect)(mockRemoveMessage).toHaveBeenCalledWith(messageId)
		;(0, vitest_1.expect)(mockRemoveMessage).toHaveBeenCalledTimes(1)
	})
	;(0, vitest_1.it)("should handle missing current task gracefully and log a message", () => {
		mockProvider.getCurrentTask.mockReturnValue(undefined)
		// Should not throw
		;(0, vitest_1.expect)(() => api.deleteQueuedMessage("msg-abc-123")).not.toThrow()
		;(0, vitest_1.expect)(mockLog).toHaveBeenCalledWith(
			"[API#deleteQueuedMessage] no current task; ignoring delete for messageId msg-abc-123",
		)
		;(0, vitest_1.expect)(mockRemoveMessage).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should handle non-existent message id gracefully", () => {
		mockRemoveMessage.mockReturnValue(false)
		// Should not throw even when removeMessage returns false
		;(0, vitest_1.expect)(() => api.deleteQueuedMessage("non-existent-id")).not.toThrow()
		;(0, vitest_1.expect)(mockRemoveMessage).toHaveBeenCalledWith("non-existent-id")
	})
})
