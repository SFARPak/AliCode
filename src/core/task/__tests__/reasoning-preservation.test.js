"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
// All vi.mock() calls are hoisted to the top of the file by Vitest
// and are applied before any imports are resolved
// Mock vscode module before importing Task
vitest_1.vi.mock("vscode", () => ({
	workspace: {
		createFileSystemWatcher: vitest_1.vi.fn(() => ({
			onDidCreate: vitest_1.vi.fn(),
			onDidChange: vitest_1.vi.fn(),
			onDidDelete: vitest_1.vi.fn(),
			dispose: vitest_1.vi.fn(),
		})),
		getConfiguration: vitest_1.vi.fn(() => ({
			get: vitest_1.vi.fn(() => true),
		})),
		openTextDocument: vitest_1.vi.fn(),
		applyEdit: vitest_1.vi.fn(),
	},
	RelativePattern: vitest_1.vi.fn((base, pattern) => ({ base, pattern })),
	window: {
		createOutputChannel: vitest_1.vi.fn(() => ({
			appendLine: vitest_1.vi.fn(),
			dispose: vitest_1.vi.fn(),
		})),
		createTextEditorDecorationType: vitest_1.vi.fn(() => ({
			dispose: vitest_1.vi.fn(),
		})),
		showTextDocument: vitest_1.vi.fn(),
		activeTextEditor: undefined,
	},
	Uri: {
		file: vitest_1.vi.fn((path) => ({ fsPath: path })),
		parse: vitest_1.vi.fn((str) => ({ toString: () => str })),
	},
	Range: vitest_1.vi.fn(),
	Position: vitest_1.vi.fn(),
	WorkspaceEdit: vitest_1.vi.fn(() => ({
		replace: vitest_1.vi.fn(),
		insert: vitest_1.vi.fn(),
		delete: vitest_1.vi.fn(),
	})),
	ViewColumn: {
		One: 1,
		Two: 2,
		Three: 3,
	},
}))
// Mock other dependencies
// Mock delay to prevent actual delays
vitest_1.vi.mock("delay", () => ({
	__esModule: true,
	default: vitest_1.vi.fn().mockResolvedValue(undefined),
}))
// Mock p-wait-for to prevent hanging on async conditions
vitest_1.vi.mock("p-wait-for", () => ({
	default: vitest_1.vi.fn().mockResolvedValue(undefined),
}))
// Mock execa
vitest_1.vi.mock("execa", () => ({
	execa: vitest_1.vi.fn(),
}))
// Mock fs/promises
vitest_1.vi.mock("fs/promises", () => ({
	mkdir: vitest_1.vi.fn().mockResolvedValue(undefined),
	writeFile: vitest_1.vi.fn().mockResolvedValue(undefined),
	readFile: vitest_1.vi.fn().mockResolvedValue("[]"),
	unlink: vitest_1.vi.fn().mockResolvedValue(undefined),
	rmdir: vitest_1.vi.fn().mockResolvedValue(undefined),
}))
// Mock mentions
vitest_1.vi.mock("../../mentions", () => ({
	parseMentions: vitest_1.vi
		.fn()
		.mockImplementation((text) => Promise.resolve({ text, mode: undefined, contentBlocks: [] })),
	openMention: vitest_1.vi.fn(),
	getLatestTerminalOutput: vitest_1.vi.fn(),
}))
// Mock extract-text
vitest_1.vi.mock("../../../integrations/misc/extract-text", () => ({
	extractTextFromFile: vitest_1.vi.fn().mockResolvedValue("Mock file content"),
}))
// Mock getEnvironmentDetails
vitest_1.vi.mock("../../environment/getEnvironmentDetails", () => ({
	getEnvironmentDetails: vitest_1.vi.fn().mockResolvedValue(""),
}))
// Mock AliIgnoreController
vitest_1.vi.mock("../../ignore/AliIgnoreController")
// Mock condense
vitest_1.vi.mock("../../condense", () => ({
	summarizeConversation: vitest_1.vi.fn().mockResolvedValue({
		messages: [],
		summary: "summary",
		cost: 0,
		newContextTokens: 1,
	}),
}))
// Mock storage utilities
vitest_1.vi.mock("../../../utils/storage", () => ({
	getTaskDirectoryPath: vitest_1.vi
		.fn()
		.mockImplementation((globalStoragePath, taskId) => Promise.resolve(`${globalStoragePath}/tasks/${taskId}`)),
	getSettingsDirectoryPath: vitest_1.vi
		.fn()
		.mockImplementation((globalStoragePath) => Promise.resolve(`${globalStoragePath}/settings`)),
}))
// Mock fs utilities
vitest_1.vi.mock("../../../utils/fs", () => ({
	fileExistsAtPath: vitest_1.vi.fn().mockReturnValue(false),
}))
// Import Task AFTER all vi.mock() calls - Vitest hoists mocks so this works
const Task_1 = require("../Task")
;(0, vitest_1.describe)("Task reasoning preservation", () => {
	let mockProvider
	let mockApiConfiguration
	;(0, vitest_1.beforeEach)(() => {
		// Mock provider with necessary methods
		mockProvider = {
			postStateToWebview: vitest_1.vi.fn().mockResolvedValue(undefined),
			postStateToWebviewWithoutTaskHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
			getState: vitest_1.vi.fn().mockResolvedValue({
				mode: "code",
				experiments: {},
			}),
			context: {
				globalStorageUri: { fsPath: "/test/storage" },
				extensionPath: "/test/extension",
			},
			log: vitest_1.vi.fn(),
			updateTaskHistory: vitest_1.vi.fn().mockResolvedValue(undefined),
			postMessageToWebview: vitest_1.vi.fn().mockResolvedValue(undefined),
		}
		mockApiConfiguration = {
			apiProvider: "anthropic",
			apiKey: "test-key",
		}
	})
	;(0, vitest_1.it)("should append reasoning to assistant message when preserveReasoning is true", async () => {
		// Create a task instance
		const task = new Task_1.Task({
			provider: mockProvider,
			apiConfiguration: mockApiConfiguration,
			task: "Test task",
			startTask: false,
		})
		// Mock the API to return a model with preserveReasoning enabled
		const mockModelInfo = {
			contextWindow: 16000,
			supportsPromptCache: true,
			preserveReasoning: true,
		}
		task.api = {
			getModel: vitest_1.vi.fn().mockReturnValue({
				id: "test-model",
				info: mockModelInfo,
			}),
		}
		// Mock the API conversation history
		task.apiConversationHistory = []
		// Simulate adding an assistant message with reasoning
		const assistantMessage = "Here is my response to your question."
		const reasoningMessage = "Let me think about this step by step. First, I need to..."
		// Spy on addToApiConversationHistory
		const addToApiHistorySpy = vitest_1.vi.spyOn(task, "addToApiConversationHistory")
		// Simulate what happens in the streaming loop when preserveReasoning is true
		let finalAssistantMessage = assistantMessage
		if (reasoningMessage && task.api.getModel().info.preserveReasoning) {
			finalAssistantMessage = `<think>${reasoningMessage}</think>\n${assistantMessage}`
		}
		await task.addToApiConversationHistory({
			role: "assistant",
			content: [{ type: "text", text: finalAssistantMessage }],
		})
		// Verify that reasoning was prepended in <think> tags to the assistant message
		;(0, vitest_1.expect)(addToApiHistorySpy).toHaveBeenCalledWith({
			role: "assistant",
			content: [
				{
					type: "text",
					text: "<think>Let me think about this step by step. First, I need to...</think>\nHere is my response to your question.",
				},
			],
		})
		// Verify the API conversation history contains the message with reasoning
		;(0, vitest_1.expect)(task.apiConversationHistory).toHaveLength(1)
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).toContain("<think>")
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).toContain("</think>")
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).toContain(
			"Here is my response to your question.",
		)
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).toContain(
			"Let me think about this step by step. First, I need to...",
		)
	})
	;(0, vitest_1.it)("should NOT append reasoning to assistant message when preserveReasoning is false", async () => {
		// Create a task instance
		const task = new Task_1.Task({
			provider: mockProvider,
			apiConfiguration: mockApiConfiguration,
			task: "Test task",
			startTask: false,
		})
		// Mock the API to return a model with preserveReasoning disabled (or undefined)
		const mockModelInfo = {
			contextWindow: 16000,
			supportsPromptCache: true,
			preserveReasoning: false,
		}
		task.api = {
			getModel: vitest_1.vi.fn().mockReturnValue({
				id: "test-model",
				info: mockModelInfo,
			}),
		}
		// Mock the API conversation history
		task.apiConversationHistory = []
		// Simulate adding an assistant message with reasoning
		const assistantMessage = "Here is my response to your question."
		const reasoningMessage = "Let me think about this step by step. First, I need to..."
		// Spy on addToApiConversationHistory
		const addToApiHistorySpy = vitest_1.vi.spyOn(task, "addToApiConversationHistory")
		// Simulate what happens in the streaming loop when preserveReasoning is false
		let finalAssistantMessage = assistantMessage
		if (reasoningMessage && task.api.getModel().info.preserveReasoning) {
			finalAssistantMessage = `<think>${reasoningMessage}</think>\n${assistantMessage}`
		}
		await task.addToApiConversationHistory({
			role: "assistant",
			content: [{ type: "text", text: finalAssistantMessage }],
		})
		// Verify that reasoning was NOT appended to the assistant message
		;(0, vitest_1.expect)(addToApiHistorySpy).toHaveBeenCalledWith({
			role: "assistant",
			content: [{ type: "text", text: "Here is my response to your question." }],
		})
		// Verify the API conversation history does NOT contain reasoning
		;(0, vitest_1.expect)(task.apiConversationHistory).toHaveLength(1)
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).toBe(
			"Here is my response to your question.",
		)
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).not.toContain("<think>")
	})
	;(0, vitest_1.it)("should handle empty reasoning message gracefully when preserveReasoning is true", async () => {
		// Create a task instance
		const task = new Task_1.Task({
			provider: mockProvider,
			apiConfiguration: mockApiConfiguration,
			task: "Test task",
			startTask: false,
		})
		// Mock the API to return a model with preserveReasoning enabled
		const mockModelInfo = {
			contextWindow: 16000,
			supportsPromptCache: true,
			preserveReasoning: true,
		}
		task.api = {
			getModel: vitest_1.vi.fn().mockReturnValue({
				id: "test-model",
				info: mockModelInfo,
			}),
		}
		// Mock the API conversation history
		task.apiConversationHistory = []
		const assistantMessage = "Here is my response."
		const reasoningMessage = "" // Empty reasoning
		// Spy on addToApiConversationHistory
		const addToApiHistorySpy = vitest_1.vi.spyOn(task, "addToApiConversationHistory")
		// Simulate what happens in the streaming loop
		let finalAssistantMessage = assistantMessage
		if (reasoningMessage && task.api.getModel().info.preserveReasoning) {
			finalAssistantMessage = `<think>${reasoningMessage}</think>\n${assistantMessage}`
		}
		await task.addToApiConversationHistory({
			role: "assistant",
			content: [{ type: "text", text: finalAssistantMessage }],
		})
		// Verify that no reasoning tags were added when reasoning is empty
		;(0, vitest_1.expect)(addToApiHistorySpy).toHaveBeenCalledWith({
			role: "assistant",
			content: [{ type: "text", text: "Here is my response." }],
		})
		// Verify the message doesn't contain reasoning tags
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).toBe("Here is my response.")
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).not.toContain("<think>")
	})
	;(0, vitest_1.it)("should handle undefined preserveReasoning (defaults to false)", async () => {
		// Create a task instance
		const task = new Task_1.Task({
			provider: mockProvider,
			apiConfiguration: mockApiConfiguration,
			task: "Test task",
			startTask: false,
		})
		// Mock the API to return a model without preserveReasoning field (undefined)
		const mockModelInfo = {
			contextWindow: 16000,
			supportsPromptCache: true,
			// preserveReasoning is undefined
		}
		task.api = {
			getModel: vitest_1.vi.fn().mockReturnValue({
				id: "test-model",
				info: mockModelInfo,
			}),
		}
		// Mock the API conversation history
		task.apiConversationHistory = []
		const assistantMessage = "Here is my response."
		const reasoningMessage = "Some reasoning here."
		// Simulate what happens in the streaming loop
		let finalAssistantMessage = assistantMessage
		if (reasoningMessage && task.api.getModel().info.preserveReasoning) {
			finalAssistantMessage = `<think>${reasoningMessage}</think>\n${assistantMessage}`
		}
		await task.addToApiConversationHistory({
			role: "assistant",
			content: [{ type: "text", text: finalAssistantMessage }],
		})
		// Verify reasoning was NOT prepended (undefined defaults to false)
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).toBe("Here is my response.")
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content[0].text).not.toContain("<think>")
	})
	;(0, vitest_1.it)("should embed encrypted reasoning as first assistant content block", async () => {
		const task = new Task_1.Task({
			provider: mockProvider,
			apiConfiguration: mockApiConfiguration,
			task: "Test task",
			startTask: false,
		})
		task.saveApiConversationHistory = vitest_1.vi.fn().mockResolvedValue(undefined)
		// Mock API handler to provide encrypted reasoning data and response id
		task.api = {
			getEncryptedContent: vitest_1.vi.fn().mockReturnValue({
				encrypted_content: "encrypted_payload",
				id: "rs_test",
			}),
			getResponseId: vitest_1.vi.fn().mockReturnValue("resp_test"),
		}
		await task.addToApiConversationHistory({
			role: "assistant",
			content: [{ type: "text", text: "Here is my response." }],
		})
		;(0, vitest_1.expect)(task.apiConversationHistory).toHaveLength(1)
		const stored = task.apiConversationHistory[0]
		;(0, vitest_1.expect)(stored.role).toBe("assistant")
		;(0, vitest_1.expect)(Array.isArray(stored.content)).toBe(true)
		;(0, vitest_1.expect)(stored.id).toBe("resp_test")
		const [reasoningBlock, textBlock] = stored.content
		;(0, vitest_1.expect)(reasoningBlock).toMatchObject({
			type: "reasoning",
			encrypted_content: "encrypted_payload",
			id: "rs_test",
		})
		;(0, vitest_1.expect)(textBlock).toMatchObject({
			type: "text",
			text: "Here is my response.",
		})
	})
	;(0, vitest_1.it)("should store plain text reasoning from streaming for all providers", async () => {
		const task = new Task_1.Task({
			provider: mockProvider,
			apiConfiguration: mockApiConfiguration,
			task: "Test task",
			startTask: false,
		})
		task.saveApiConversationHistory = vitest_1.vi.fn().mockResolvedValue(undefined)
		// Mock API handler without getEncryptedContent (like Anthropic, Gemini, etc.)
		task.api = {
			getModel: vitest_1.vi.fn().mockReturnValue({
				id: "test-model",
				info: {
					contextWindow: 16000,
					supportsPromptCache: true,
				},
			}),
		}
		// Simulate the new path: passing reasoning as a parameter
		const reasoningText = "Let me analyze this carefully. First, I'll consider the requirements..."
		const assistantText = "Here is my response."
		await task.addToApiConversationHistory(
			{
				role: "assistant",
				content: [{ type: "text", text: assistantText }],
			},
			reasoningText,
		)
		;(0, vitest_1.expect)(task.apiConversationHistory).toHaveLength(1)
		const stored = task.apiConversationHistory[0]
		;(0, vitest_1.expect)(stored.role).toBe("assistant")
		;(0, vitest_1.expect)(Array.isArray(stored.content)).toBe(true)
		const [reasoningBlock, textBlock] = stored.content
		// Verify reasoning is stored with plain text, not encrypted
		;(0, vitest_1.expect)(reasoningBlock).toMatchObject({
			type: "reasoning",
			text: reasoningText,
			summary: [],
		})
		// Verify there's no encrypted_content field (that's only for OpenAI Native)
		;(0, vitest_1.expect)(reasoningBlock.encrypted_content).toBeUndefined()
		;(0, vitest_1.expect)(textBlock).toMatchObject({
			type: "text",
			text: assistantText,
		})
	})
})
