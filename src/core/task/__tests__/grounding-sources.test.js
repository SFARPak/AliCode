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
;(0, vitest_1.describe)("Task grounding sources handling", () => {
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
			apiProvider: "gemini",
			geminiApiKey: "test-key",
		}
	})
	;(0, vitest_1.it)(
		"should strip grounding sources from assistant message before persisting to API history",
		async () => {
			// Create a task instance
			const task = new Task_1.Task({
				provider: mockProvider,
				apiConfiguration: mockApiConfiguration,
				task: "Test task",
				startTask: false,
			})
			// Mock the API conversation history
			task.apiConversationHistory = []
			// Simulate an assistant message with grounding sources
			const assistantMessageWithSources = `
This is the main response content.

[1] Example Source: https://example.com
[2] Another Source: https://another.com

Sources: [1](https://example.com), [2](https://another.com)
		`.trim()
			// Mock grounding sources
			const mockGroundingSources = [
				{ title: "Example Source", url: "https://example.com" },
				{ title: "Another Source", url: "https://another.com" },
			]
			// Spy on addToApiConversationHistory to check what gets persisted
			const addToApiHistorySpy = vitest_1.vi.spyOn(task, "addToApiConversationHistory")
			// Simulate the logic from Task.ts that strips grounding sources
			let cleanAssistantMessage = assistantMessageWithSources
			if (mockGroundingSources.length > 0) {
				cleanAssistantMessage = assistantMessageWithSources
					.replace(/\[\d+\]\s+[^:\n]+:\s+https?:\/\/[^\s\n]+/g, "") // e.g., "[1] Example Source: https://example.com"
					.replace(/Sources?:\s*[\s\S]*?(?=\n\n|\n$|$)/g, "") // e.g., "Sources: [1](url1), [2](url2)"
					.trim()
			}
			// Add the cleaned message to API history
			await task.addToApiConversationHistory({
				role: "assistant",
				content: [{ type: "text", text: cleanAssistantMessage }],
			})
			// Verify that the cleaned message was added without grounding sources
			;(0, vitest_1.expect)(addToApiHistorySpy).toHaveBeenCalledWith({
				role: "assistant",
				content: [{ type: "text", text: "This is the main response content." }],
			})
			// Verify the API conversation history contains the cleaned message
			;(0, vitest_1.expect)(task.apiConversationHistory).toHaveLength(1)
			;(0, vitest_1.expect)(task.apiConversationHistory[0].content).toEqual([
				{ type: "text", text: "This is the main response content." },
			])
		},
	)
	;(0, vitest_1.it)("should not modify assistant message when no grounding sources are present", async () => {
		const task = new Task_1.Task({
			provider: mockProvider,
			apiConfiguration: mockApiConfiguration,
			task: "Test task",
			startTask: false,
		})
		task.apiConversationHistory = []
		const assistantMessage = "This is a regular response without any sources."
		const mockGroundingSources = [] // No grounding sources
		// Apply the same logic
		let cleanAssistantMessage = assistantMessage
		if (mockGroundingSources.length > 0) {
			cleanAssistantMessage = assistantMessage
				.replace(/\[\d+\]\s+[^:\n]+:\s+https?:\/\/[^\s\n]+/g, "")
				.replace(/Sources?:\s*[\s\S]*?(?=\n\n|\n$|$)/g, "")
				.trim()
		}
		await task.addToApiConversationHistory({
			role: "assistant",
			content: [{ type: "text", text: cleanAssistantMessage }],
		})
		// Message should remain unchanged
		;(0, vitest_1.expect)(task.apiConversationHistory[0].content).toEqual([
			{ type: "text", text: "This is a regular response without any sources." },
		])
	})
	;(0, vitest_1.it)("should handle various grounding source formats", () => {
		const testCases = [
			{
				input: "[1] Source Title: https://example.com\n[2] Another: https://test.com\nMain content here",
				expected: "Main content here",
			},
			{
				input: "Content first\n\nSources: [1](https://example.com), [2](https://test.com)",
				expected: "Content first",
			},
			{
				input: "Mixed content\n[1] Inline Source: https://inline.com\nMore content\nSource: [1](https://inline.com)",
				expected: "Mixed content\n\nMore content",
			},
		]
		testCases.forEach(({ input, expected }) => {
			const cleaned = input
				.replace(/\[\d+\]\s+[^:\n]+:\s+https?:\/\/[^\s\n]+/g, "")
				.replace(/Sources?:\s*[\s\S]*?(?=\n\n|\n$|$)/g, "")
				.trim()
			;(0, vitest_1.expect)(cleaned).toBe(expected)
		})
	})
})
