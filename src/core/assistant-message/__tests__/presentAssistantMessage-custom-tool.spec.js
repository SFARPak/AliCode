"use strict"
// npx vitest src/core/assistant-message/__tests__/presentAssistantMessage-custom-tool.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const presentAssistantMessage_1 = require("../presentAssistantMessage")
const validateToolUse_1 = require("../../tools/validateToolUse")
// Mock dependencies
vitest_1.vi.mock("../../task/Task")
vitest_1.vi.mock("../../tools/validateToolUse", () => ({
	validateToolUse: vitest_1.vi.fn(),
	isValidToolName: vitest_1.vi.fn((toolName) =>
		["read_file", "write_to_file", "ask_followup_question", "attempt_completion", "use_mcp_tool"].includes(
			toolName,
		),
	),
}))
// Mock custom tool registry - must be done inline without external variable references
vitest_1.vi.mock("@ali-code/core", () => ({
	customToolRegistry: {
		has: vitest_1.vi.fn(),
		get: vitest_1.vi.fn(),
	},
}))
const core_1 = require("@ali-code/core")
;(0, vitest_1.describe)("presentAssistantMessage - Custom Tool Recording", () => {
	let mockTask
	;(0, vitest_1.beforeEach)(() => {
		// Reset all mocks
		vitest_1.vi.clearAllMocks()
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
						experiments: {
							customTools: true, // Enable by default
						},
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
	;(0, vitest_1.describe)("Custom tool usage recording", () => {
		;(0, vitest_1.it)("should record custom tool usage as 'custom_tool' when experiment is enabled", async () => {
			const toolCallId = "tool_call_custom_123"
			mockTask.assistantMessageContent = [
				{
					type: "tool_use",
					id: toolCallId,
					name: "my_custom_tool",
					params: { value: "test" },
					partial: false,
				},
			]
			// Mock customToolRegistry to recognize this as a custom tool
			vitest_1.vi.mocked(core_1.customToolRegistry.has).mockReturnValue(true)
			vitest_1.vi.mocked(core_1.customToolRegistry.get).mockReturnValue({
				name: "my_custom_tool",
				description: "A custom tool",
				execute: vitest_1.vi.fn().mockResolvedValue("Custom tool result"),
			})
			await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
			// Should record as "custom_tool", not "my_custom_tool"
			;(0, vitest_1.expect)(mockTask.recordToolUsage).toHaveBeenCalledWith("custom_tool")
		})
	})
	;(0, vitest_1.describe)("Custom tool error recording", () => {
		;(0, vitest_1.it)("should record custom tool error as 'custom_tool'", async () => {
			const toolCallId = "tool_call_custom_error_123"
			mockTask.assistantMessageContent = [
				{
					type: "tool_use",
					id: toolCallId,
					name: "failing_custom_tool",
					params: {},
					partial: false,
				},
			]
			// Mock customToolRegistry with a tool that throws an error
			vitest_1.vi.mocked(core_1.customToolRegistry.has).mockReturnValue(true)
			vitest_1.vi.mocked(core_1.customToolRegistry.get).mockReturnValue({
				name: "failing_custom_tool",
				description: "A failing custom tool",
				execute: vitest_1.vi.fn().mockRejectedValue(new Error("Custom tool execution failed")),
			})
			await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
			// Should record error as "custom_tool", not "failing_custom_tool"
			;(0, vitest_1.expect)(mockTask.recordToolError).toHaveBeenCalledWith(
				"custom_tool",
				"Custom tool execution failed",
			)
			;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(1)
		})
	})
	;(0, vitest_1.describe)("Regular tool recording", () => {
		;(0, vitest_1.it)("should record regular tool usage with actual tool name", async () => {
			const toolCallId = "tool_call_read_file_123"
			mockTask.assistantMessageContent = [
				{
					type: "tool_use",
					id: toolCallId,
					name: "read_file",
					params: { path: "test.txt" },
					partial: false,
				},
			]
			// read_file is not a custom tool
			vitest_1.vi.mocked(core_1.customToolRegistry.has).mockReturnValue(false)
			await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
			// Should record as "read_file", not "custom_tool"
			;(0, vitest_1.expect)(mockTask.recordToolUsage).toHaveBeenCalledWith("read_file")
		})
		;(0, vitest_1.it)("should record MCP tool usage as 'use_mcp_tool' (not custom_tool)", async () => {
			const toolCallId = "tool_call_mcp_123"
			mockTask.assistantMessageContent = [
				{
					type: "tool_use",
					id: toolCallId,
					name: "use_mcp_tool",
					params: {
						server_name: "test-server",
						tool_name: "test-tool",
						arguments: "{}",
					},
					partial: false,
				},
			]
			vitest_1.vi.mocked(core_1.customToolRegistry.has).mockReturnValue(false)
			// Mock MCP hub for use_mcp_tool
			mockTask.providerRef = {
				deref: () => ({
					getState: vitest_1.vi.fn().mockResolvedValue({
						mode: "code",
						customModes: [],
						experiments: {
							customTools: true,
						},
					}),
					getMcpHub: () => ({
						findServerNameBySanitizedName: () => "test-server",
						executeToolCall: vitest_1.vi
							.fn()
							.mockResolvedValue({ content: [{ type: "text", text: "result" }] }),
					}),
				}),
			}
			await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
			// Should record as "use_mcp_tool", not "custom_tool"
			;(0, vitest_1.expect)(mockTask.recordToolUsage).toHaveBeenCalledWith("use_mcp_tool")
		})
	})
	;(0, vitest_1.describe)("Custom tool experiment gate", () => {
		;(0, vitest_1.it)("should treat custom tool as unknown when experiment is disabled", async () => {
			const toolCallId = "tool_call_disabled_123"
			mockTask.assistantMessageContent = [
				{
					type: "tool_use",
					id: toolCallId,
					name: "my_custom_tool",
					params: {},
					partial: false,
				},
			]
			// Mock provider state with customTools experiment DISABLED
			mockTask.providerRef = {
				deref: () => ({
					getState: vitest_1.vi.fn().mockResolvedValue({
						mode: "code",
						customModes: [],
						experiments: {
							customTools: false, // Disabled
						},
					}),
				}),
			}
			// Even if registry recognizes it, experiment gate should prevent execution
			vitest_1.vi.mocked(core_1.customToolRegistry.has).mockReturnValue(true)
			vitest_1.vi.mocked(core_1.customToolRegistry.get).mockReturnValue({
				name: "my_custom_tool",
				description: "A custom tool",
				execute: vitest_1.vi.fn().mockResolvedValue("Should not execute"),
			})
			await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
			// Should be treated as unknown tool (not executed)
			;(0, vitest_1.expect)(mockTask.say).toHaveBeenCalledWith("error", "unknownToolError")
			;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(1)
			// Custom tool should NOT have been executed
			const getMock = vitest_1.vi.mocked(core_1.customToolRegistry.get)
			if (getMock.mock.results.length > 0) {
				const customTool = getMock.mock.results[0].value
				if (customTool) {
					;(0, vitest_1.expect)(customTool.execute).not.toHaveBeenCalled()
				}
			}
		})
		;(0, vitest_1.it)("should not call customToolRegistry.has() when experiment is disabled", async () => {
			mockTask.assistantMessageContent = [
				{
					type: "tool_use",
					id: "tool_call_123",
					name: "some_tool",
					params: {},
					partial: false,
				},
			]
			// Disable experiment
			mockTask.providerRef = {
				deref: () => ({
					getState: vitest_1.vi.fn().mockResolvedValue({
						mode: "code",
						customModes: [],
						experiments: {
							customTools: false,
						},
					}),
				}),
			}
			await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
			// When experiment is off, shouldn't even check the registry
			// (Code checks stateExperiments?.customTools before calling has())
			;(0, vitest_1.expect)(core_1.customToolRegistry.has).not.toHaveBeenCalled()
		})
	})
	;(0, vitest_1.describe)("Validation requirements", () => {
		;(0, vitest_1.it)("normalizes disabledTools aliases before validateToolUse", async () => {
			const toolCallId = "tool_call_validation_alias_123"
			mockTask.assistantMessageContent = [
				{
					type: "tool_use",
					id: toolCallId,
					name: "some_unknown_tool",
					params: {},
					partial: false,
				},
			]
			mockTask.providerRef = {
				deref: () => ({
					getState: vitest_1.vi.fn().mockResolvedValue({
						mode: "code",
						customModes: [],
						experiments: {
							customTools: false,
						},
						disabledTools: ["search_and_replace"],
					}),
				}),
			}
			await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
			const validateToolUseMock = vitest_1.vi.mocked(validateToolUse_1.validateToolUse)
			;(0, vitest_1.expect)(validateToolUseMock).toHaveBeenCalled()
			const toolRequirements = validateToolUseMock.mock.calls[0][3]
			;(0, vitest_1.expect)(toolRequirements).toMatchObject({
				search_and_replace: false,
				edit: false,
			})
		})
	})
	;(0, vitest_1.describe)("Partial blocks", () => {
		;(0, vitest_1.it)("should not record usage for partial custom tool blocks", async () => {
			mockTask.assistantMessageContent = [
				{
					type: "tool_use",
					id: "tool_call_partial_123",
					name: "my_custom_tool",
					params: { value: "test" },
					partial: true, // Still streaming
				},
			]
			vitest_1.vi.mocked(core_1.customToolRegistry.has).mockReturnValue(true)
			await (0, presentAssistantMessage_1.presentAssistantMessage)(mockTask)
			// Should not record usage for partial blocks
			;(0, vitest_1.expect)(mockTask.recordToolUsage).not.toHaveBeenCalled()
		})
	})
})
