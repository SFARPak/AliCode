"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const line_counter_1 = require("../line-counter")
const countTokens_1 = require("../../../utils/countTokens")
const stream_1 = require("stream")
// Mock dependencies
vitest_1.vi.mock("fs", () => ({
	default: {
		promises: {
			access: vitest_1.vi.fn(),
		},
		constants: {
			F_OK: 0,
		},
		createReadStream: vitest_1.vi.fn(),
	},
	createReadStream: vitest_1.vi.fn(),
}))
vitest_1.vi.mock("../../../utils/countTokens", () => ({
	countTokens: vitest_1.vi.fn(),
}))
const mockCountTokens = vitest_1.vi.mocked(countTokens_1.countTokens)
// Get the mocked fs module
const fs = await import("fs")
const mockCreateReadStream = vitest_1.vi.mocked(fs.createReadStream)
const mockFsAccess = vitest_1.vi.mocked(fs.default.promises.access)
;(0, vitest_1.describe)("line-counter", () => {
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
	})
	;(0, vitest_1.describe)("countFileLinesAndTokens", () => {
		;(0, vitest_1.it)("should count lines and tokens without budget limit", async () => {
			// Create a proper readable stream
			const mockStream = new stream_1.Readable({
				read() {
					this.push("line1\n")
					this.push("line2\n")
					this.push("line3\n")
					this.push(null) // End of stream
				},
			})
			mockCreateReadStream.mockReturnValue(mockStream)
			mockFsAccess.mockResolvedValue(undefined)
			// Mock token counting - simulate ~10 tokens per chunk
			mockCountTokens.mockResolvedValue(30)
			const result = await (0, line_counter_1.countFileLinesAndTokens)("/test/file.txt")
			;(0, vitest_1.expect)(result.lineCount).toBe(3)
			;(0, vitest_1.expect)(result.tokenEstimate).toBe(30)
			;(0, vitest_1.expect)(result.complete).toBe(true)
		})
		;(0, vitest_1.it)("should handle tokenizer errors with conservative estimate", async () => {
			// Create a proper readable stream
			const mockStream = new stream_1.Readable({
				read() {
					this.push("line1\n")
					this.push(null)
				},
			})
			mockCreateReadStream.mockReturnValue(mockStream)
			mockFsAccess.mockResolvedValue(undefined)
			// Simulate tokenizer error
			mockCountTokens.mockRejectedValue(new Error("unreachable"))
			const result = await (0, line_counter_1.countFileLinesAndTokens)("/test/file.txt")
			// Should still complete with conservative token estimate (content.length)
			;(0, vitest_1.expect)(result.lineCount).toBe(1)
			;(0, vitest_1.expect)(result.tokenEstimate).toBeGreaterThan(0)
			;(0, vitest_1.expect)(result.complete).toBe(true)
		})
		;(0, vitest_1.it)("should throw error for non-existent files", async () => {
			mockFsAccess.mockRejectedValue(new Error("ENOENT"))
			await (0, vitest_1.expect)(
				(0, line_counter_1.countFileLinesAndTokens)("/nonexistent/file.txt"),
			).rejects.toThrow("File not found")
		})
	})
	;(0, vitest_1.describe)("countFileLines", () => {
		;(0, vitest_1.it)("should throw error for non-existent files", async () => {
			mockFsAccess.mockRejectedValue(new Error("ENOENT"))
			await (0, vitest_1.expect)((0, line_counter_1.countFileLines)("/nonexistent/file.txt")).rejects.toThrow(
				"File not found",
			)
		})
	})
})
