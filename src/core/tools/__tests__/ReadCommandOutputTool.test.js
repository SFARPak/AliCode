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
const fs = __importStar(require("fs/promises"))
const path = __importStar(require("path"))
const vitest_1 = require("vitest")
const ReadCommandOutputTool_1 = require("../ReadCommandOutputTool")
// Mock filesystem operations
vitest_1.vi.mock("fs/promises", () => ({
	default: {
		access: vitest_1.vi.fn(),
		stat: vitest_1.vi.fn(),
		open: vitest_1.vi.fn(),
		readFile: vitest_1.vi.fn(),
	},
	access: vitest_1.vi.fn(),
	stat: vitest_1.vi.fn(),
	open: vitest_1.vi.fn(),
	readFile: vitest_1.vi.fn(),
}))
// Mock getTaskDirectoryPath
vitest_1.vi.mock("../../../utils/storage", () => ({
	getTaskDirectoryPath: vitest_1.vi.fn((globalStoragePath, taskId) => {
		return path.join(globalStoragePath, "tasks", taskId)
	}),
}))
;(0, vitest_1.describe)("ReadCommandOutputTool", () => {
	let tool
	let mockTask
	let mockCallbacks
	let mockFileHandle
	let globalStoragePath
	let taskId
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		tool = new ReadCommandOutputTool_1.ReadCommandOutputTool()
		globalStoragePath = "/mock/global/storage"
		taskId = "task-123"
		// Mock task object
		mockTask = {
			taskId,
			consecutiveMistakeCount: 0,
			didToolFailInCurrentTurn: false,
			say: vitest_1.vi.fn().mockResolvedValue(undefined),
			sayAndCreateMissingParamError: vitest_1.vi.fn().mockResolvedValue("Missing parameter"),
			recordToolError: vitest_1.vi.fn(),
			providerRef: {
				deref: vitest_1.vi.fn().mockResolvedValue({
					context: {
						globalStorageUri: {
							fsPath: globalStoragePath,
						},
					},
				}),
			},
		}
		// Mock callbacks
		mockCallbacks = {
			pushToolResult: vitest_1.vi.fn(),
		}
		// Mock file handle
		mockFileHandle = {
			read: vitest_1.vi.fn(),
			close: vitest_1.vi.fn().mockResolvedValue(undefined),
		}
		// Default mocks
		vitest_1.vi.mocked(fs.access).mockResolvedValue(undefined)
		vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: 1000 })
		vitest_1.vi.mocked(fs.open).mockResolvedValue(mockFileHandle)
	})
	;(0, vitest_1.afterEach)(() => {
		vitest_1.vi.restoreAllMocks()
	})
	;(0, vitest_1.describe)("Basic read functionality", () => {
		;(0, vitest_1.it)("should read artifact file correctly", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "Line 1\nLine 2\nLine 3\n"
			const buffer = Buffer.from(content)
			mockFileHandle.read.mockImplementation((buf) => {
				buffer.copy(buf)
				return Promise.resolve({ bytesRead: buffer.length })
			})
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(fs.access).toHaveBeenCalledWith(
				path.join(globalStoragePath, "tasks", taskId, "command-output", artifactId),
			)
			;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalled()
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("Line 1")
			;(0, vitest_1.expect)(result).toContain("Line 2")
			;(0, vitest_1.expect)(result).toContain("Line 3")
		})
		;(0, vitest_1.it)("should return content with line numbers", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "First line\nSecond line\nThird line\n"
			const buffer = Buffer.from(content)
			mockFileHandle.read.mockImplementation((buf) => {
				buffer.copy(buf)
				return Promise.resolve({ bytesRead: buffer.length })
			})
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toMatch(/1 \| First line/)
			;(0, vitest_1.expect)(result).toMatch(/2 \| Second line/)
			;(0, vitest_1.expect)(result).toMatch(/3 \| Third line/)
		})
		;(0, vitest_1.it)("should include size metadata in output", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "Test output"
			const fileSize = 5000
			const buffer = Buffer.from(content)
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			mockFileHandle.read.mockImplementation((buf) => {
				buffer.copy(buf)
				return Promise.resolve({ bytesRead: buffer.length })
			})
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain(`[Command Output: ${artifactId}]`)
			;(0, vitest_1.expect)(result).toContain("Total size:")
			;(0, vitest_1.expect)(result).toMatch(/\d+(\.\d+)?(bytes|KB|MB)/)
		})
		;(0, vitest_1.it)("should close file handle after reading", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "Test"
			const buffer = Buffer.from(content)
			mockFileHandle.read.mockImplementation((buf) => {
				buffer.copy(buf)
				return Promise.resolve({ bytesRead: buffer.length })
			})
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(mockFileHandle.close).toHaveBeenCalled()
		})
	})
	;(0, vitest_1.describe)("Pagination (offset/limit)", () => {
		;(0, vitest_1.it)("should use default limit of 40KB", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const largeContent = "x".repeat(50 * 1024) // 50KB
			const fileSize = Buffer.byteLength(largeContent, "utf8")
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			// Mock read to return only up to default limit (40KB)
			mockFileHandle.read.mockImplementation((buf) => {
				const defaultLimit = 40 * 1024
				const bytesToRead = Math.min(buf.length, defaultLimit)
				buf.write(largeContent.slice(0, bytesToRead))
				return Promise.resolve({ bytesRead: bytesToRead })
			})
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("TRUNCATED")
		})
		;(0, vitest_1.it)("should start reading from custom offset", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "0123456789ABCDEFGHIJ"
			const offset = 10
			const fileSize = Buffer.byteLength(content, "utf8")
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			// Mock first read for offset calculation (returns content before offset)
			// Mock second read for actual content
			let readCallCount = 0
			mockFileHandle.read.mockImplementation((buf, bufOffset, length, position) => {
				readCallCount++
				if (position === 0) {
					// First read: prefix for line number calculation
					const prefixContent = content.slice(0, offset)
					buf.write(prefixContent)
					return Promise.resolve({ bytesRead: prefixContent.length })
				} else {
					// Second read: actual content from offset
					const actualContent = content.slice(offset)
					buf.write(actualContent)
					return Promise.resolve({ bytesRead: actualContent.length })
				}
			})
			await tool.execute({ artifact_id: artifactId, offset }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain(`Showing bytes ${offset}-`)
			;(0, vitest_1.expect)(mockFileHandle.read).toHaveBeenCalled()
		})
		;(0, vitest_1.it)("should restrict output size with custom limit", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const largeContent = "x".repeat(10000)
			const customLimit = 1000
			const fileSize = Buffer.byteLength(largeContent, "utf8")
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			mockFileHandle.read.mockImplementation((buf) => {
				const bytesToRead = Math.min(buf.length, customLimit)
				buf.write(largeContent.slice(0, bytesToRead))
				return Promise.resolve({ bytesRead: bytesToRead })
			})
			await tool.execute({ artifact_id: artifactId, limit: customLimit }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalled()
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("TRUNCATED")
		})
		;(0, vitest_1.it)("should show TRUNCATED when more content exists", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const fileSize = 10000
			const limit = 5000
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			mockFileHandle.read.mockImplementation((buf) => {
				const content = "x".repeat(limit)
				buf.write(content)
				return Promise.resolve({ bytesRead: limit })
			})
			await tool.execute({ artifact_id: artifactId, limit }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("TRUNCATED")
		})
		;(0, vitest_1.it)("should show COMPLETE when all content is returned", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "Small content"
			const fileSize = Buffer.byteLength(content, "utf8")
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			mockFileHandle.read.mockImplementation((buf) => {
				buf.write(content)
				return Promise.resolve({ bytesRead: fileSize })
			})
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("COMPLETE")
			;(0, vitest_1.expect)(result).not.toContain("TRUNCATED")
		})
	})
	;(0, vitest_1.describe)("Search filtering", () => {
		// Helper to setup file handle mock for search (which now uses streaming)
		const setupSearchMock = (content) => {
			const buffer = Buffer.from(content)
			const fileSize = buffer.length
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			// Mock streaming read - return entire content in one chunk (simulates small file)
			mockFileHandle.read.mockImplementation((buf, bufOffset, length, position) => {
				const pos = position ?? 0
				if (pos >= fileSize) {
					return Promise.resolve({ bytesRead: 0 })
				}
				const bytesToRead = Math.min(length, fileSize - pos)
				buffer.copy(buf, 0, pos, pos + bytesToRead)
				return Promise.resolve({ bytesRead: bytesToRead })
			})
		}
		;(0, vitest_1.it)("should filter lines matching pattern", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "Line 1: error occurred\nLine 2: success\nLine 3: error found\nLine 4: complete\n"
			setupSearchMock(content)
			await tool.execute({ artifact_id: artifactId, search: "error" }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("error occurred")
			;(0, vitest_1.expect)(result).toContain("error found")
			;(0, vitest_1.expect)(result).not.toContain("success")
			;(0, vitest_1.expect)(result).not.toContain("complete")
		})
		;(0, vitest_1.it)("should use case-insensitive matching", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "ERROR: Something bad\nwarning: minor issue\nERROR: Another problem\n"
			setupSearchMock(content)
			await tool.execute({ artifact_id: artifactId, search: "error" }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("ERROR: Something bad")
			;(0, vitest_1.expect)(result).toContain("ERROR: Another problem")
		})
		;(0, vitest_1.it)("should show match count and line numbers", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "Line 1\nError on line 2\nLine 3\nError on line 4\n"
			setupSearchMock(content)
			await tool.execute({ artifact_id: artifactId, search: "Error" }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("Total matches: 2")
			;(0, vitest_1.expect)(result).toMatch(/2 \|.*Error on line 2/)
			;(0, vitest_1.expect)(result).toMatch(/4 \|.*Error on line 4/)
		})
		;(0, vitest_1.it)("should handle empty search results gracefully", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "Line 1\nLine 2\nLine 3\n"
			setupSearchMock(content)
			await tool.execute({ artifact_id: artifactId, search: "NOTFOUND" }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("No matches found for the search pattern")
		})
		;(0, vitest_1.it)("should handle regex patterns in search", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "test123\ntest456\nabc789\ntest000\n"
			setupSearchMock(content)
			await tool.execute({ artifact_id: artifactId, search: "test\\d+" }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("test123")
			;(0, vitest_1.expect)(result).toContain("test456")
			;(0, vitest_1.expect)(result).toContain("test000")
			;(0, vitest_1.expect)(result).not.toContain("abc789")
		})
		;(0, vitest_1.it)("should handle invalid regex patterns by treating as literal", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "Line with [brackets]\nLine without\n"
			setupSearchMock(content)
			// Invalid regex but valid as literal string
			await tool.execute({ artifact_id: artifactId, search: "[" }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			;(0, vitest_1.expect)(result).toContain("[brackets]")
		})
	})
	;(0, vitest_1.describe)("Error handling", () => {
		;(0, vitest_1.it)("should return error for non-existent artifact", async () => {
			const artifactId = "cmd-9999999999.txt"
			vitest_1.vi.mocked(fs.access).mockRejectedValue(new Error("ENOENT"))
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(mockTask.didToolFailInCurrentTurn).toBe(true)
			;(0, vitest_1.expect)(mockTask.say).toHaveBeenCalledWith(
				"error",
				vitest_1.expect.stringContaining("not found"),
			)
			;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(
				vitest_1.expect.stringContaining("Error: Artifact not found"),
			)
		})
		;(0, vitest_1.it)("should reject invalid artifact_id with path traversal attempt", async () => {
			const invalidIds = [
				"../../../etc/passwd",
				"..\\..\\..\\windows\\system32\\config",
				"cmd-123/../other.txt",
				"cmd-<script>alert()</script>.txt",
				"cmd-.txt",
				"invalid-format.txt",
			]
			for (const invalidId of invalidIds) {
				vitest_1.vi.clearAllMocks()
				mockTask.consecutiveMistakeCount = 0
				mockTask.didToolFailInCurrentTurn = false
				await tool.execute({ artifact_id: invalidId }, mockTask, mockCallbacks)
				;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBeGreaterThan(0)
				;(0, vitest_1.expect)(mockTask.didToolFailInCurrentTurn).toBe(true)
				;(0, vitest_1.expect)(mockTask.say).toHaveBeenCalledWith(
					"error",
					vitest_1.expect.stringContaining("Invalid artifact_id format"),
				)
			}
		})
		;(0, vitest_1.it)("should accept valid artifact_id format", async () => {
			const validId = "cmd-1706119234567.txt"
			const content = "Test"
			const buffer = Buffer.from(content)
			mockFileHandle.read.mockImplementation((buf) => {
				buffer.copy(buf)
				return Promise.resolve({ bytesRead: buffer.length })
			})
			await tool.execute({ artifact_id: validId }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(0)
			;(0, vitest_1.expect)(mockTask.didToolFailInCurrentTurn).toBe(false)
		})
		;(0, vitest_1.it)("should handle invalid offset gracefully", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const fileSize = 1000
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			await tool.execute(
				{ artifact_id: artifactId, offset: 2000 }, // Offset beyond file size
				mockTask,
				mockCallbacks,
			)
			;(0, vitest_1.expect)(mockTask.say).toHaveBeenCalledWith(
				"error",
				vitest_1.expect.stringContaining("Invalid offset"),
			)
			;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(
				vitest_1.expect.stringContaining("Error: Invalid offset"),
			)
		})
		;(0, vitest_1.it)("should handle negative offset", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const fileSize = 1000
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			await tool.execute({ artifact_id: artifactId, offset: -10 }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(mockTask.say).toHaveBeenCalledWith(
				"error",
				vitest_1.expect.stringContaining("Invalid offset"),
			)
		})
		;(0, vitest_1.it)("should handle missing artifact_id parameter", async () => {
			await tool.execute({ artifact_id: "" }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBeGreaterThan(0)
			;(0, vitest_1.expect)(mockTask.recordToolError).toHaveBeenCalledWith("read_command_output")
			;(0, vitest_1.expect)(mockTask.didToolFailInCurrentTurn).toBe(true)
			;(0, vitest_1.expect)(mockTask.sayAndCreateMissingParamError).toHaveBeenCalledWith(
				"read_command_output",
				"artifact_id",
			)
		})
		;(0, vitest_1.it)("should handle missing global storage path", async () => {
			const artifactId = "cmd-1706119234567.txt"
			mockTask.providerRef.deref.mockResolvedValue({
				context: {
					globalStorageUri: null,
				},
			})
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(mockTask.say).toHaveBeenCalledWith(
				"error",
				vitest_1.expect.stringContaining("Global storage path is not available"),
			)
			;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(
				vitest_1.expect.stringContaining("Error"),
			)
		})
		;(0, vitest_1.it)("should handle file read errors", async () => {
			const artifactId = "cmd-1706119234567.txt"
			mockFileHandle.read.mockRejectedValue(new Error("Read error"))
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(mockTask.didToolFailInCurrentTurn).toBe(true)
			;(0, vitest_1.expect)(mockTask.say).toHaveBeenCalledWith(
				"error",
				vitest_1.expect.stringContaining("Error reading command output"),
			)
		})
		;(0, vitest_1.it)("should ensure file handle is closed even on error", async () => {
			const artifactId = "cmd-1706119234567.txt"
			mockFileHandle.read.mockRejectedValue(new Error("Read error"))
			await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
			;(0, vitest_1.expect)(mockFileHandle.close).toHaveBeenCalled()
		})
	})
	;(0, vitest_1.describe)("Byte formatting", () => {
		;(0, vitest_1.it)("should format bytes correctly", async () => {
			const testCases = [
				{ size: 500, expected: "bytes" },
				{ size: 1024, expected: "1.0KB" },
				{ size: 2048, expected: "2.0KB" },
				{ size: 1024 * 1024, expected: "1.0MB" },
				{ size: 2.5 * 1024 * 1024, expected: "2.5MB" },
			]
			for (const { size, expected } of testCases) {
				vitest_1.vi.clearAllMocks()
				const artifactId = "cmd-1706119234567.txt"
				const content = "x"
				const buffer = Buffer.from(content)
				vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size })
				mockFileHandle.read.mockImplementation((buf) => {
					buffer.copy(buf)
					return Promise.resolve({ bytesRead: buffer.length })
				})
				await tool.execute({ artifact_id: artifactId }, mockTask, mockCallbacks)
				const result = mockCallbacks.pushToolResult.mock.calls[0][0]
				;(0, vitest_1.expect)(result).toContain(expected)
			}
		})
	})
	;(0, vitest_1.describe)("Line number calculation", () => {
		;(0, vitest_1.it)("should calculate correct starting line number for offset", async () => {
			const artifactId = "cmd-1706119234567.txt"
			const content = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n"
			const offset = 14 // After "Line 1\nLine 2\n"
			const fileSize = Buffer.byteLength(content, "utf8")
			vitest_1.vi.mocked(fs.stat).mockResolvedValue({ size: fileSize })
			let readCallCount = 0
			mockFileHandle.read.mockImplementation((buf, bufOffset, length, position) => {
				readCallCount++
				if (position === 0) {
					// Read prefix for line counting
					const prefix = content.slice(0, offset)
					buf.write(prefix)
					return Promise.resolve({ bytesRead: prefix.length })
				} else {
					// Read actual content from offset
					const actualContent = content.slice(offset)
					buf.write(actualContent)
					return Promise.resolve({ bytesRead: actualContent.length })
				}
			})
			await tool.execute({ artifact_id: artifactId, offset }, mockTask, mockCallbacks)
			const result = mockCallbacks.pushToolResult.mock.calls[0][0]
			// Should start at line 3 since we skipped 2 newlines
			;(0, vitest_1.expect)(result).toMatch(/3 \|/)
		})
	})
})
