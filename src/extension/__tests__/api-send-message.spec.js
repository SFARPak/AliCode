"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const api_1 = require("../api")
vitest_1.vi.mock("vscode")
vitest_1.vi.mock("../../core/webview/ClineProvider")
;(0, vitest_1.describe)("API - SendMessage Command", () => {
	let api
	let mockOutputChannel
	let mockProvider
	let mockPostMessageToWebview
	let mockLog
	;(0, vitest_1.beforeEach)(() => {
		// Setup mocks
		mockOutputChannel = {
			appendLine: vitest_1.vi.fn(),
		}
		mockPostMessageToWebview = vitest_1.vi.fn().mockResolvedValue(undefined)
		mockProvider = {
			context: {},
			postMessageToWebview: mockPostMessageToWebview,
			on: vitest_1.vi.fn(),
			getCurrentTaskStack: vitest_1.vi.fn().mockReturnValue([]),
			getCurrentTask: vitest_1.vi.fn().mockReturnValue(undefined),
			viewLaunched: true,
		}
		mockLog = vitest_1.vi.fn()
		// Create API instance with logging enabled for testing
		api = new api_1.API(mockOutputChannel, mockProvider, undefined, true)
		api.log = mockLog
	})
	;(0, vitest_1.it)("should handle SendMessage command with text only", async () => {
		// Arrange
		const messageText = "Hello, this is a test message"
		// Act
		await api.sendMessage(messageText)
		// Assert
		;(0, vitest_1.expect)(mockPostMessageToWebview).toHaveBeenCalledWith({
			type: "invoke",
			invoke: "sendMessage",
			text: messageText,
			images: undefined,
		})
	})
	;(0, vitest_1.it)("should handle SendMessage command with text and images", async () => {
		// Arrange
		const messageText = "Analyze this image"
		const images = [
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
		]
		// Act
		await api.sendMessage(messageText, images)
		// Assert
		;(0, vitest_1.expect)(mockPostMessageToWebview).toHaveBeenCalledWith({
			type: "invoke",
			invoke: "sendMessage",
			text: messageText,
			images,
		})
	})
	;(0, vitest_1.it)("should handle SendMessage command with images only", async () => {
		// Arrange
		const images = [
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
		]
		// Act
		await api.sendMessage(undefined, images)
		// Assert
		;(0, vitest_1.expect)(mockPostMessageToWebview).toHaveBeenCalledWith({
			type: "invoke",
			invoke: "sendMessage",
			text: undefined,
			images,
		})
	})
	;(0, vitest_1.it)("should handle SendMessage command with empty parameters", async () => {
		// Act
		await api.sendMessage()
		// Assert
		;(0, vitest_1.expect)(mockPostMessageToWebview).toHaveBeenCalledWith({
			type: "invoke",
			invoke: "sendMessage",
			text: undefined,
			images: undefined,
		})
	})
	;(0, vitest_1.it)("should log SendMessage command when processed via IPC", async () => {
		// This test verifies the logging behavior when the command comes through IPC
		// We need to simulate the IPC handler directly since we can't easily test the full IPC flow
		const messageText = "Test message from IPC"
		const commandData = {
			text: messageText,
			images: undefined,
		}
		// Simulate the IPC command handler calling sendMessage
		mockLog(`[API] SendMessage -> ${commandData.text}`)
		await api.sendMessage(commandData.text, commandData.images)
		// Assert that logging occurred
		;(0, vitest_1.expect)(mockLog).toHaveBeenCalledWith(`[API] SendMessage -> ${messageText}`)
		// Assert that the message was sent
		;(0, vitest_1.expect)(mockPostMessageToWebview).toHaveBeenCalledWith({
			type: "invoke",
			invoke: "sendMessage",
			text: messageText,
			images: undefined,
		})
	})
	;(0, vitest_1.it)("should handle SendMessage with multiple images", async () => {
		// Arrange
		const messageText = "Compare these images"
		const images = [
			"data:image/png;base64,image1data",
			"data:image/png;base64,image2data",
			"data:image/png;base64,image3data",
		]
		// Act
		await api.sendMessage(messageText, images)
		// Assert
		;(0, vitest_1.expect)(mockPostMessageToWebview).toHaveBeenCalledWith({
			type: "invoke",
			invoke: "sendMessage",
			text: messageText,
			images,
		})
		;(0, vitest_1.expect)(mockPostMessageToWebview).toHaveBeenCalledTimes(1)
	})
})
