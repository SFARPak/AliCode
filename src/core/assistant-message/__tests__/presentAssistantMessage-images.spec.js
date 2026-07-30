"use strict"
// npx vitest src/core/assistant-message/__tests__/presentAssistantMessage-images.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const presentAssistantMessage_1 = require("../presentAssistantMessage")
// Mock dependencies
;(0, vitest_1.describe)("presentAssistantMessage - Image Handling in Native Tool Calling", () => {
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
			api: {
				getModel: () => ({ id: "test-model", info: {} }),
			},
			recordToolUsage: vitest_1.vi.fn(),
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
		// Add pushToolResultToUserContent method after mockTask is created so it can reference mockTask
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
	;(0, vitest_1.it)("should preserve images in tool_result for native tool calling", async () => {
		// Set up a tool_use block with an ID (indicates native tool calling)
		const toolCallId = "tool_call_123"
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				id: toolCallId, // ID indicates native tool calling
				name: "ask_followup_question",
				params: { question: "What do you see?" },
				nativeArgs: { question: "What do you see?", follow_up: [] },
			},
		]
		// Create a mock askApproval that includes images in the response
		const imageBlock = {
			type: "image",
			source: {
				type: "base64",
				media_type: "image/png",
				data: "base64ImageData",
			},
		}
		mockTask.ask = vitest_1.vi.fn().mockResolvedValue({
			response: "yesButtonClicked",
			text: "I see a cat",
			images: ["data:image/png;base64,base64ImageData"],
		})
		// Execute presentAssistantMessage
		await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
		// Verify that userMessageContent was populated
		;(0, vitest_1.expect)(mockTask.userMessageContent.length).toBeGreaterThan(0)
		// Find the tool_result block
		const toolResult = mockTask.userMessageContent.find(
			(item) => item.type === "tool_result" && item.tool_use_id === toolCallId,
		)
		;(0, vitest_1.expect)(toolResult).toBeDefined()
		;(0, vitest_1.expect)(toolResult.tool_use_id).toBe(toolCallId)
		// For native tool calling, tool_result content should be a string (text only)
		;(0, vitest_1.expect)(typeof toolResult.content).toBe("string")
		;(0, vitest_1.expect)(toolResult.content).toContain("I see a cat")
		// Images should be added as separate blocks AFTER the tool_result
		const imageBlocks = mockTask.userMessageContent.filter((item) => item.type === "image")
		;(0, vitest_1.expect)(imageBlocks.length).toBeGreaterThan(0)
		;(0, vitest_1.expect)(imageBlocks[0].source.data).toBe("base64ImageData")
	})
	;(0, vitest_1.it)("should convert to string when no images are present (native tool calling)", async () => {
		// Set up a tool_use block with an ID (indicates native protocol)
		const toolCallId = "tool_call_456"
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				id: toolCallId,
				name: "ask_followup_question",
				params: { question: "What is your name?" },
				nativeArgs: { question: "What is your name?", follow_up: [] },
			},
		]
		// Response with text but NO images
		mockTask.ask = vitest_1.vi.fn().mockResolvedValue({
			response: "yesButtonClicked",
			text: "My name is Alice",
			images: undefined,
		})
		await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
		const toolResult = mockTask.userMessageContent.find(
			(item) => item.type === "tool_result" && item.tool_use_id === toolCallId,
		)
		;(0, vitest_1.expect)(toolResult).toBeDefined()
		// When no images, content should be a string
		;(0, vitest_1.expect)(typeof toolResult.content).toBe("string")
	})
	;(0, vitest_1.it)("should fail fast when tool_use is missing id (legacy/XML-style tool call)", async () => {
		// tool_use without an id is treated as legacy/XML-style tool call and must be rejected.
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				name: "ask_followup_question",
				params: { question: "What do you see?" },
			},
		]
		mockTask.ask = vitest_1.vi.fn().mockResolvedValue({
			response: "yesButtonClicked",
			text: "I see a dog",
			images: ["data:image/png;base64,dogImageData"],
		})
		await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
		const textBlocks = mockTask.userMessageContent.filter((item) => item.type === "text")
		;(0, vitest_1.expect)(textBlocks.length).toBeGreaterThan(0)
		;(0, vitest_1.expect)(
			textBlocks.some((b) => String(b.text).includes("XML tool calls are no longer supported")),
		).toBe(true)
		// Should not proceed to execute tool or add images as tool output.
		;(0, vitest_1.expect)(mockTask.userMessageContent.some((item) => item.type === "image")).toBe(false)
	})
	;(0, vitest_1.it)("should handle empty tool result gracefully", async () => {
		const toolCallId = "tool_call_789"
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				id: toolCallId,
				name: "attempt_completion",
				params: { result: "Task completed" },
			},
		]
		// Empty response
		mockTask.ask = vitest_1.vi.fn().mockResolvedValue({
			response: "yesButtonClicked",
			text: undefined,
			images: undefined,
		})
		await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
		const toolResult = mockTask.userMessageContent.find(
			(item) => item.type === "tool_result" && item.tool_use_id === toolCallId,
		)
		;(0, vitest_1.expect)(toolResult).toBeDefined()
		// Should have fallback text
		;(0, vitest_1.expect)(toolResult.content).toBeTruthy()
	})
	;(0, vitest_1.describe)("Multiple tool calls handling", () => {
		;(0, vitest_1.it)(
			"should send tool_result with is_error for skipped tools in native tool calling when didRejectTool is true",
			async () => {
				// Simulate multiple tool calls with native protocol (all have IDs)
				const toolCallId1 = "tool_call_001"
				const toolCallId2 = "tool_call_002"
				mockTask.assistantMessageContent = [
					{
						type: "tool_use",
						id: toolCallId1,
						name: "read_file",
						params: { path: "test.txt" },
					},
					{
						type: "tool_use",
						id: toolCallId2,
						name: "write_to_file",
						params: { path: "output.txt", content: "test" },
					},
				]
				// First tool is rejected
				mockTask.didRejectTool = true
				// Process the second tool (should be skipped)
				mockTask.currentStreamingContentIndex = 1
				await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
				// Find the tool_result for the second tool
				const toolResult = mockTask.userMessageContent.find(
					(item) => item.type === "tool_result" && item.tool_use_id === toolCallId2,
				)
				// Verify that a tool_result block was created (not a text block)
				;(0, vitest_1.expect)(toolResult).toBeDefined()
				;(0, vitest_1.expect)(toolResult.tool_use_id).toBe(toolCallId2)
				;(0, vitest_1.expect)(toolResult.is_error).toBe(true)
				;(0, vitest_1.expect)(toolResult.content).toContain("due to user rejecting a previous tool")
				// Ensure no text blocks were added for this rejection
				const textBlocks = mockTask.userMessageContent.filter(
					(item) => item.type === "text" && item.text.includes("due to user rejecting"),
				)
				;(0, vitest_1.expect)(textBlocks.length).toBe(0)
			},
		)
		;(0, vitest_1.it)(
			"should reject subsequent tool calls when a legacy/XML-style tool call is encountered",
			async () => {
				mockTask.assistantMessageContent = [
					{
						type: "tool_use",
						name: "read_file",
						params: { path: "test.txt" },
					},
					{
						type: "tool_use",
						name: "write_to_file",
						params: { path: "output.txt", content: "test" },
					},
				]
				// First tool is rejected
				mockTask.didRejectTool = true
				// Process the second tool (should be skipped)
				mockTask.currentStreamingContentIndex = 1
				await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
				const textBlocks = mockTask.userMessageContent.filter((item) => item.type === "text")
				;(0, vitest_1.expect)(
					textBlocks.some((b) => String(b.text).includes("XML tool calls are no longer supported")),
				).toBe(true)
				// Ensure no tool_result blocks were added
				;(0, vitest_1.expect)(mockTask.userMessageContent.some((item) => item.type === "tool_result")).toBe(
					false,
				)
			},
		)
		;(0, vitest_1.it)(
			"should handle partial tool blocks when didRejectTool is true in native tool calling",
			async () => {
				const toolCallId = "tool_call_005"
				mockTask.assistantMessageContent = [
					{
						type: "tool_use",
						id: toolCallId,
						name: "write_to_file",
						params: { path: "output.txt", content: "test" },
						partial: true, // Partial tool block
					},
				]
				mockTask.didRejectTool = true
				await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
				// Find the tool_result
				const toolResult = mockTask.userMessageContent.find(
					(item) => item.type === "tool_result" && item.tool_use_id === toolCallId,
				)
				// Verify tool_result was created for partial block
				;(0, vitest_1.expect)(toolResult).toBeDefined()
				;(0, vitest_1.expect)(toolResult.is_error).toBe(true)
				;(0, vitest_1.expect)(toolResult.content).toContain("was interrupted and not executed")
			},
		)
	})
})
