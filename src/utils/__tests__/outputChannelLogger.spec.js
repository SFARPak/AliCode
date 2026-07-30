"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const outputChannelLogger_1 = require("../outputChannelLogger")
// Mock VSCode output channel
const mockOutputChannel = {
	appendLine: vitest.fn(),
}
describe("outputChannelLogger", () => {
	beforeEach(() => {
		vitest.clearAllMocks()
		// Clear console.log mock if it exists
		if (vitest.isMockFunction(console.log)) {
			console.log.mockClear()
		}
	})
	describe("createOutputChannelLogger", () => {
		it("should log strings to output channel", () => {
			const logger = (0, outputChannelLogger_1.createOutputChannelLogger)(mockOutputChannel)
			logger("test message")
			expect(mockOutputChannel.appendLine).toHaveBeenCalledWith("test message")
		})
		it("should log null values", () => {
			const logger = (0, outputChannelLogger_1.createOutputChannelLogger)(mockOutputChannel)
			logger(null)
			expect(mockOutputChannel.appendLine).toHaveBeenCalledWith("null")
		})
		it("should log undefined values", () => {
			const logger = (0, outputChannelLogger_1.createOutputChannelLogger)(mockOutputChannel)
			logger(undefined)
			expect(mockOutputChannel.appendLine).toHaveBeenCalledWith("undefined")
		})
		it("should log Error objects with stack trace", () => {
			const logger = (0, outputChannelLogger_1.createOutputChannelLogger)(mockOutputChannel)
			const error = new Error("test error")
			logger(error)
			expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining("Error: test error"))
		})
		it("should log objects as JSON", () => {
			const logger = (0, outputChannelLogger_1.createOutputChannelLogger)(mockOutputChannel)
			const obj = { key: "value", number: 42 }
			logger(obj)
			expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(JSON.stringify(obj, expect.any(Function), 2))
		})
		it("should handle multiple arguments", () => {
			const logger = (0, outputChannelLogger_1.createOutputChannelLogger)(mockOutputChannel)
			logger("message", 42, { key: "value" })
			expect(mockOutputChannel.appendLine).toHaveBeenCalledTimes(3)
			expect(mockOutputChannel.appendLine).toHaveBeenNthCalledWith(1, "message")
			expect(mockOutputChannel.appendLine).toHaveBeenNthCalledWith(2, "42")
			expect(mockOutputChannel.appendLine).toHaveBeenNthCalledWith(
				3,
				JSON.stringify({ key: "value" }, expect.any(Function), 2),
			)
		})
	})
	describe("createDualLogger", () => {
		it("should log to both output channel and console", () => {
			const consoleSpy = vitest.spyOn(console, "log").mockImplementation(() => {})
			const outputChannelLogger = (0, outputChannelLogger_1.createOutputChannelLogger)(mockOutputChannel)
			const dualLogger = (0, outputChannelLogger_1.createDualLogger)(outputChannelLogger)
			dualLogger("test message", 42)
			expect(mockOutputChannel.appendLine).toHaveBeenCalledTimes(2)
			expect(mockOutputChannel.appendLine).toHaveBeenNthCalledWith(1, "test message")
			expect(mockOutputChannel.appendLine).toHaveBeenNthCalledWith(2, "42")
			expect(consoleSpy).toHaveBeenCalledWith("test message", 42)
			consoleSpy.mockRestore()
		})
	})
})
