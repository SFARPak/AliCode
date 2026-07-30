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
Object.defineProperty(exports, "__esModule", { value: true })
// Mocks must come first, before imports
vi.mock("vscode", () => {
	class MockLanguageModelTextPart {
		value
		type = "text"
		constructor(value) {
			this.value = value
		}
	}
	class MockLanguageModelToolCallPart {
		callId
		name
		input
		type = "tool_call"
		constructor(callId, name, input) {
			this.callId = callId
			this.name = name
			this.input = input
		}
	}
	return {
		workspace: {
			onDidChangeConfiguration: vi.fn((_callback) => ({
				dispose: vi.fn(),
			})),
		},
		CancellationTokenSource: vi.fn(() => ({
			token: {
				isCancellationRequested: false,
				onCancellationRequested: vi.fn(),
			},
			cancel: vi.fn(),
			dispose: vi.fn(),
		})),
		CancellationError: class CancellationError extends Error {
			constructor() {
				super("Operation cancelled")
				this.name = "CancellationError"
			}
		},
		LanguageModelChatMessage: {
			Assistant: vi.fn((content) => ({
				role: "assistant",
				content: Array.isArray(content) ? content : [new MockLanguageModelTextPart(content)],
			})),
			User: vi.fn((content) => ({
				role: "user",
				content: Array.isArray(content) ? content : [new MockLanguageModelTextPart(content)],
			})),
		},
		LanguageModelTextPart: MockLanguageModelTextPart,
		LanguageModelToolCallPart: MockLanguageModelToolCallPart,
		lm: {
			selectChatModels: vi.fn(),
		},
	}
})
const vscode = __importStar(require("vscode"))
const vscode_lm_1 = require("../vscode-lm")
const mockLanguageModelChat = {
	id: "test-model",
	name: "Test Model",
	vendor: "test-vendor",
	family: "test-family",
	version: "1.0",
	maxInputTokens: 4096,
	sendRequest: vi.fn(),
	countTokens: vi.fn(),
}
describe("VsCodeLmHandler", () => {
	let handler
	const defaultOptions = {
		vsCodeLmModelSelector: {
			vendor: "test-vendor",
			family: "test-family",
		},
	}
	beforeEach(() => {
		vi.clearAllMocks()
		handler = new vscode_lm_1.VsCodeLmHandler(defaultOptions)
	})
	afterEach(() => {
		handler.dispose()
	})
	describe("constructor", () => {
		it("should initialize with provided options", () => {
			expect(handler).toBeDefined()
			expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalled()
		})
		it("should handle configuration changes", () => {
			const callback = vscode.workspace.onDidChangeConfiguration.mock.calls[0][0]
			callback({ affectsConfiguration: () => true })
			// Should reset client when config changes
			expect(handler["client"]).toBeNull()
		})
	})
	describe("createClient", () => {
		it("should create client with selector", async () => {
			const mockModel = { ...mockLanguageModelChat }
			vscode.lm.selectChatModels.mockResolvedValueOnce([mockModel])
			const client = await handler["createClient"]({
				vendor: "test-vendor",
				family: "test-family",
			})
			expect(client).toBeDefined()
			expect(client.id).toBe("test-model")
			expect(vscode.lm.selectChatModels).toHaveBeenCalledWith({
				vendor: "test-vendor",
				family: "test-family",
			})
		})
		it("should return default client when no models available", async () => {
			vscode.lm.selectChatModels.mockResolvedValueOnce([])
			const client = await handler["createClient"]({})
			expect(client).toBeDefined()
			expect(client.id).toBe("default-lm")
			expect(client.vendor).toBe("vscode")
		})
	})
	describe("createMessage", () => {
		beforeEach(() => {
			const mockModel = { ...mockLanguageModelChat }
			vscode.lm.selectChatModels.mockResolvedValueOnce([mockModel])
			mockLanguageModelChat.countTokens.mockResolvedValue(10)
			// Override the default client with our test client
			handler["client"] = mockLanguageModelChat
		})
		it("should stream text responses", async () => {
			const systemPrompt = "You are a helpful assistant"
			const messages = [
				{
					role: "user",
					content: "Hello",
				},
			]
			const responseText = "Hello! How can I help you?"
			mockLanguageModelChat.sendRequest.mockResolvedValueOnce({
				stream: (async function* () {
					yield new vscode.LanguageModelTextPart(responseText)
					return
				})(),
				text: (async function* () {
					yield responseText
					return
				})(),
			})
			const stream = handler.createMessage(systemPrompt, messages)
			const chunks = []
			for await (const chunk of stream) {
				chunks.push(chunk)
			}
			expect(chunks).toHaveLength(2) // Text chunk + usage chunk
			expect(chunks[0]).toEqual({
				type: "text",
				text: responseText,
			})
			expect(chunks[1]).toMatchObject({
				type: "usage",
				inputTokens: expect.any(Number),
				outputTokens: expect.any(Number),
			})
		})
		it("should emit tool_call chunks when tools are provided", async () => {
			const systemPrompt = "You are a helpful assistant"
			const messages = [
				{
					role: "user",
					content: "Calculate 2+2",
				},
			]
			const toolCallData = {
				name: "calculator",
				arguments: { operation: "add", numbers: [2, 2] },
				callId: "call-1",
			}
			mockLanguageModelChat.sendRequest.mockResolvedValueOnce({
				stream: (async function* () {
					yield new vscode.LanguageModelToolCallPart(
						toolCallData.callId,
						toolCallData.name,
						toolCallData.arguments,
					)
					return
				})(),
				text: (async function* () {
					yield JSON.stringify({ type: "tool_call", ...toolCallData })
					return
				})(),
			})
			const tools = [
				{
					type: "function",
					function: {
						name: "calculator",
						description: "A simple calculator",
						parameters: {
							type: "object",
							properties: {
								operation: { type: "string" },
								numbers: { type: "array", items: { type: "number" } },
							},
						},
					},
				},
			]
			const stream = handler.createMessage(systemPrompt, messages, {
				taskId: "test-task",
				tools,
			})
			const chunks = []
			for await (const chunk of stream) {
				chunks.push(chunk)
			}
			expect(chunks).toHaveLength(2) // Tool call chunk + usage chunk
			expect(chunks[0]).toEqual({
				type: "tool_call",
				id: toolCallData.callId,
				name: toolCallData.name,
				arguments: JSON.stringify(toolCallData.arguments),
			})
		})
		it("should handle native tool calls when tools are provided", async () => {
			const systemPrompt = "You are a helpful assistant"
			const messages = [
				{
					role: "user",
					content: "Calculate 2+2",
				},
			]
			const toolCallData = {
				name: "calculator",
				arguments: { operation: "add", numbers: [2, 2] },
				callId: "call-1",
			}
			const tools = [
				{
					type: "function",
					function: {
						name: "calculator",
						description: "A simple calculator",
						parameters: {
							type: "object",
							properties: {
								operation: { type: "string" },
								numbers: { type: "array", items: { type: "number" } },
							},
						},
					},
				},
			]
			mockLanguageModelChat.sendRequest.mockResolvedValueOnce({
				stream: (async function* () {
					yield new vscode.LanguageModelToolCallPart(
						toolCallData.callId,
						toolCallData.name,
						toolCallData.arguments,
					)
					return
				})(),
				text: (async function* () {
					yield JSON.stringify({ type: "tool_call", ...toolCallData })
					return
				})(),
			})
			const stream = handler.createMessage(systemPrompt, messages, {
				taskId: "test-task",
				tools,
			})
			const chunks = []
			for await (const chunk of stream) {
				chunks.push(chunk)
			}
			expect(chunks).toHaveLength(2) // Tool call chunk + usage chunk
			expect(chunks[0]).toEqual({
				type: "tool_call",
				id: toolCallData.callId,
				name: toolCallData.name,
				arguments: JSON.stringify(toolCallData.arguments),
			})
		})
		it("should pass tools to request options when tools are provided", async () => {
			const systemPrompt = "You are a helpful assistant"
			const messages = [
				{
					role: "user",
					content: "Calculate 2+2",
				},
			]
			const tools = [
				{
					type: "function",
					function: {
						name: "calculator",
						description: "A simple calculator",
						parameters: {
							type: "object",
							properties: {
								operation: { type: "string" },
							},
						},
					},
				},
			]
			mockLanguageModelChat.sendRequest.mockResolvedValueOnce({
				stream: (async function* () {
					yield new vscode.LanguageModelTextPart("Result: 4")
					return
				})(),
				text: (async function* () {
					yield "Result: 4"
					return
				})(),
			})
			const stream = handler.createMessage(systemPrompt, messages, {
				taskId: "test-task",
				tools,
			})
			const chunks = []
			for await (const chunk of stream) {
				chunks.push(chunk)
			}
			// Verify sendRequest was called with tools in options
			// Note: normalizeToolSchema adds additionalProperties: false for JSON Schema 2020-12 compliance
			expect(mockLanguageModelChat.sendRequest).toHaveBeenCalledWith(
				expect.any(Array),
				expect.objectContaining({
					tools: [
						{
							name: "calculator",
							description: "A simple calculator",
							inputSchema: {
								type: "object",
								properties: {
									operation: { type: "string" },
								},
								additionalProperties: false,
							},
						},
					],
				}),
				expect.anything(),
			)
		})
		it("should handle errors", async () => {
			const systemPrompt = "You are a helpful assistant"
			const messages = [
				{
					role: "user",
					content: "Hello",
				},
			]
			mockLanguageModelChat.sendRequest.mockRejectedValueOnce(new Error("API Error"))
			await expect(handler.createMessage(systemPrompt, messages).next()).rejects.toThrow("API Error")
		})
	})
	describe("getModel", () => {
		it("should return model info when client exists", async () => {
			const mockModel = { ...mockLanguageModelChat }
			vscode.lm.selectChatModels.mockResolvedValue([mockModel])
			handler["client"] = null
			await handler.initializeClient()
			const model = handler.getModel()
			expect(model.id).toBe("test-model")
			expect(model.info).toBeDefined()
			expect(model.info.contextWindow).toBe(4096)
		})
		it("should return fallback model info when no client exists", () => {
			// Clear the client first
			handler["client"] = null
			const model = handler.getModel()
			expect(model.id).toBe("test-vendor/test-family")
			expect(model.info).toBeDefined()
		})
		it("should return basic model info when client exists", async () => {
			const mockModel = { ...mockLanguageModelChat }
			vscode.lm.selectChatModels.mockResolvedValue([mockModel])
			handler["client"] = null
			await handler.initializeClient()
			const model = handler.getModel()
			expect(model.info).toBeDefined()
			expect(model.info.contextWindow).toBe(4096)
		})
		it("should return fallback model info when no client exists", () => {
			// Clear the client first
			handler["client"] = null
			const model = handler.getModel()
			expect(model.info).toBeDefined()
		})
	})
	describe("countTokens", () => {
		beforeEach(() => {
			handler["client"] = mockLanguageModelChat
		})
		it("should count tokens when called outside of an active request", async () => {
			// Ensure no active request cancellation token exists
			handler["currentRequestCancellation"] = null
			mockLanguageModelChat.countTokens.mockResolvedValueOnce(42)
			const content = [{ type: "text", text: "Hello world" }]
			const result = await handler.countTokens(content)
			expect(result).toBe(42)
			expect(mockLanguageModelChat.countTokens).toHaveBeenCalledWith("Hello world", expect.any(Object))
		})
		it("should count tokens when called during an active request", async () => {
			// Simulate an active request with a cancellation token
			const mockCancellation = {
				token: { isCancellationRequested: false, onCancellationRequested: vi.fn() },
				cancel: vi.fn(),
				dispose: vi.fn(),
			}
			handler["currentRequestCancellation"] = mockCancellation
			mockLanguageModelChat.countTokens.mockResolvedValueOnce(50)
			const content = [{ type: "text", text: "Test content" }]
			const result = await handler.countTokens(content)
			expect(result).toBe(50)
			expect(mockLanguageModelChat.countTokens).toHaveBeenCalledWith("Test content", mockCancellation.token)
		})
		it("should return 0 when no client is available", async () => {
			handler["client"] = null
			handler["currentRequestCancellation"] = null
			const content = [{ type: "text", text: "Hello" }]
			const result = await handler.countTokens(content)
			expect(result).toBe(0)
		})
		it("should handle image blocks with placeholder", async () => {
			handler["currentRequestCancellation"] = null
			mockLanguageModelChat.countTokens.mockResolvedValueOnce(5)
			const content = [{ type: "image", source: { type: "base64", media_type: "image/png", data: "abc" } }]
			const result = await handler.countTokens(content)
			expect(result).toBe(5)
			expect(mockLanguageModelChat.countTokens).toHaveBeenCalledWith("[IMAGE]", expect.any(Object))
		})
	})
	describe("completePrompt", () => {
		it("should complete single prompt", async () => {
			const mockModel = { ...mockLanguageModelChat }
			vscode.lm.selectChatModels.mockResolvedValueOnce([mockModel])
			const responseText = "Completed text"
			mockLanguageModelChat.sendRequest.mockResolvedValueOnce({
				stream: (async function* () {
					yield new vscode.LanguageModelTextPart(responseText)
					return
				})(),
				text: (async function* () {
					yield responseText
					return
				})(),
			})
			// Override the default client with our test client to ensure it uses
			// the mock implementation rather than the default fallback
			handler["client"] = mockLanguageModelChat
			const result = await handler.completePrompt("Test prompt")
			expect(result).toBe(responseText)
			expect(mockLanguageModelChat.sendRequest).toHaveBeenCalled()
		})
		it("should handle errors during completion", async () => {
			const mockModel = { ...mockLanguageModelChat }
			vscode.lm.selectChatModels.mockResolvedValueOnce([mockModel])
			mockLanguageModelChat.sendRequest.mockRejectedValueOnce(new Error("Completion failed"))
			// Make sure we're using the mock client
			handler["client"] = mockLanguageModelChat
			const promise = handler.completePrompt("Test prompt")
			await expect(promise).rejects.toThrow("VSCode LM completion error: Completion failed")
		})
	})
})
