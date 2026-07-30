"use strict"
// npx vitest src/core/assistant-message/__tests__/presentAssistantMessage-unknown-tool.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const presentAssistantMessage_1 = require("../presentAssistantMessage")
// Mock dependencies
vitest_1.vi.mock("../../task/Task")
vitest_1.vi.mock("../../tools/validateToolUse", () => ({
	validateToolUse: vitest_1.vi.fn(),
	isValidToolName: vitest_1.vi.fn(() => false),
}))
;(0, vitest_1.describe)("presentAssistantMessage - Unknown Tool Handling", () => {
	let mockTask
	;(0, vitest_1.beforeEach)(() => {
		// Create a mock Task with minimal properties needed for testing
		mockTask = {
			taskId: "test-task-id",
			instanceId: "test-instance",
			abort: false,
			presentAssistantMessageLocked: false,
			presentAssistantMessageHasPendingUpdates: false,
			currentStreamingContentIndex: 0,
			assistantMessageContent: [],
			userMessageContent: [],
			didCompleteReadingStream: false,
			didRejectTool: false,
			didAlreadyUseTool: false,
			consecutiveMistakeCount: 0,
			clineMessages: [],
			api: {
				getModel: () => ({ id: "test-model", info: {} }),
			},
			recordToolUsage: vitest_1.vi.fn(),
			recordToolError: vitest_1.vi.fn(),
			toolRepetitionDetector: {
				check: vitest_1.vi.fn().mockReturnValue({ allowExecution: true }),
			},
			providerRef: {
				deref: () => ({
					getState: vitest_1.vi.fn().mockResolvedValue({
						mode: "code",
						customModes: [],
					}),
				}),
			},
			say: vitest_1.vi.fn().mockResolvedValue(undefined),
			ask: vitest_1.vi.fn().mockResolvedValue({ response: "yesButtonClicked" }),
		}
		// Add pushToolResultToUserContent method after mockTask is created so 'this' binds correctly
		mockTask.pushToolResultToUserContent = vitest_1.vi.fn().mockImplementation((toolResult) => {
			const existingResult = mockTask.userMessageContent.find(
				(block) => block.type === "tool_result" && block.tool_use_id === toolResult.tool_use_id,
			)
			if (existingResult) {
				return false
			}
			mockTask.userMessageContent.push(toolResult)
			return true
		})
	})
	;(0, vitest_1.it)("should return error for unknown tool in native protocol", async () => {
		// Set up a tool_use block with an unknown tool name and an ID (native tool calling)
		const toolCallId = "tool_call_unknown_123"
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				id: toolCallId, // ID indicates native tool calling
				name: "nonexistent_tool",
				params: { some: "param" },
				partial: false,
			},
		]
		// Execute presentAssistantMessage
		await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
		// Verify that a tool_result with error was pushed
		const toolResult = mockTask.userMessageContent.find(
			(item) => item.type === "tool_result" && item.tool_use_id === toolCallId,
		)
		;(0, vitest_1.expect)(toolResult).toBeDefined()
		;(0, vitest_1.expect)(toolResult.tool_use_id).toBe(toolCallId)
		// The error is wrapped in JSON by formatResponse.toolError
		;(0, vitest_1.expect)(toolResult.content).toContain("nonexistent_tool")
		;(0, vitest_1.expect)(toolResult.content).toContain("does not exist")
		;(0, vitest_1.expect)(toolResult.content).toContain("error")
		// Verify consecutiveMistakeCount was incremented
		;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(1)
		// Verify recordToolError was called
		;(0, vitest_1.expect)(mockTask.recordToolError).toHaveBeenCalledWith(
			"nonexistent_tool",
			vitest_1.expect.stringContaining("Unknown tool"),
		)
		// Verify error message was shown to user (uses i18n key)
		;(0, vitest_1.expect)(mockTask.say).toHaveBeenCalledWith("error", "unknownToolError")
	})
	;(0, vitest_1.it)("should fail fast when tool_use is missing id (legacy/XML-style tool call)", async () => {
		// tool_use without an id is treated as legacy/XML-style tool call and must be rejected.
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				name: "fake_tool_that_does_not_exist",
				params: { param1: "value1" },
				partial: false,
			},
		]
		// Execute presentAssistantMessage
		await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
		// Should not execute tool; should surface a clear error message.
		const textBlocks = mockTask.userMessageContent.filter((item) => item.type === "text")
		;(0, vitest_1.expect)(textBlocks.length).toBeGreaterThan(0)
		;(0, vitest_1.expect)(
			textBlocks.some((b) => String(b.text).includes("XML tool calls are no longer supported")),
		).toBe(true)
		// Verify consecutiveMistakeCount was incremented
		;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(1)
		// Verify recordToolError was called
		;(0, vitest_1.expect)(mockTask.recordToolError).toHaveBeenCalled()
		// Verify error message was shown to user
		;(0, vitest_1.expect)(mockTask.say).toHaveBeenCalledWith("error", vitest_1.expect.anything())
	})
	;(0, vitest_1.it)("should handle unknown tool without freezing (native tool calling)", async () => {
		// This test ensures the extension doesn't freeze when an unknown tool is called
		const toolCallId = "tool_call_freeze_test"
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				id: toolCallId, // Native tool calling
				name: "this_tool_definitely_does_not_exist",
				params: {},
				partial: false,
			},
		]
		// The test will timeout if the extension freezes
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => reject(new Error("Test timed out - extension likely froze")), 5000)
		})
		const resultPromise = (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask).then(() => true)
		// Race between the function completing and the timeout
		const completed = await Promise.race([resultPromise, timeoutPromise])
		;(0, vitest_1.expect)(completed).toBe(true)
		// Verify a tool_result was pushed (critical for API not to freeze)
		const toolResult = mockTask.userMessageContent.find(
			(item) => item.type === "tool_result" && item.tool_use_id === toolCallId,
		)
		;(0, vitest_1.expect)(toolResult).toBeDefined()
	})
	;(0, vitest_1.it)("should increment consecutiveMistakeCount for unknown tools", async () => {
		// Test with multiple unknown tools to ensure mistake count increments
		const toolCallId = "tool_call_mistake_test"
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				id: toolCallId,
				name: "unknown_tool_1",
				params: {},
				partial: false,
			},
		]
		;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(0)
		await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
		;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(1)
	})
	;(0, vitest_1.it)("should set userMessageContentReady after handling unknown tool", async () => {
		const toolCallId = "tool_call_ready_test"
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				id: toolCallId,
				name: "unknown_tool",
				params: {},
				partial: false,
			},
		]
		mockTask.didCompleteReadingStream = true
		mockTask.userMessageContentReady = false
		await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
		// userMessageContentReady should be set after processing
		;(0, vitest_1.expect)(mockTask.userMessageContentReady).toBe(true)
	})
	;(0, vitest_1.it)("should still work with didRejectTool flag for unknown tool", async () => {
		const toolCallId = "tool_call_rejected_test"
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				id: toolCallId,
				name: "unknown_tool",
				params: {},
				partial: false,
			},
		]
		mockTask.didRejectTool = true
		await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
		// When didRejectTool is true, should send error tool_result
		const toolResult = mockTask.userMessageContent.find(
			(item) => item.type === "tool_result" && item.tool_use_id === toolCallId,
		)
		;(0, vitest_1.expect)(toolResult).toBeDefined()
		;(0, vitest_1.expect)(toolResult.is_error).toBe(true)
		;(0, vitest_1.expect)(toolResult.content).toContain("due to user rejecting a previous tool")
	})
})
