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
const fs = __importStar(require("fs"))
const path = __importStar(require("path"))
const vitest_1 = require("vitest")
const OutputInterceptor_1 = require("../OutputInterceptor")
// Mock filesystem operations
vitest_1.vi.mock("fs", () => ({
	default: {
		existsSync: vitest_1.vi.fn(),
		mkdirSync: vitest_1.vi.fn(),
		createWriteStream: vitest_1.vi.fn(),
		promises: {
			readdir: vitest_1.vi.fn(),
			unlink: vitest_1.vi.fn(),
		},
	},
	existsSync: vitest_1.vi.fn(),
	mkdirSync: vitest_1.vi.fn(),
	createWriteStream: vitest_1.vi.fn(),
	promises: {
		readdir: vitest_1.vi.fn(),
		unlink: vitest_1.vi.fn(),
	},
}))
;(0, vitest_1.describe)("OutputInterceptor", () => {
	let mockWriteStream
	let storageDir
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		storageDir = path.normalize("/tmp/test-storage")
		// Setup mock write stream with callback support for end()
		mockWriteStream = {
			write: vitest_1.vi.fn(),
			end: vitest_1.vi.fn((callback) => {
				// Immediately call the callback to simulate stream flush completing
				if (callback) callback()
			}),
			on: vitest_1.vi.fn(),
		}
		vitest_1.vi.mocked(fs.existsSync).mockReturnValue(true)
		vitest_1.vi.mocked(fs.createWriteStream).mockReturnValue(mockWriteStream)
	})
	;(0, vitest_1.afterEach)(() => {
		vitest_1.vi.restoreAllMocks()
	})
	;(0, vitest_1.describe)("Buffering behavior", () => {
		;(0, vitest_1.it)("should keep small output in memory without spilling to disk", async () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "echo test",
				storageDir,
				previewSize: "small", // 5KB
			})
			const smallOutput = "Hello World\n"
			interceptor.write(smallOutput)
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(false)
			;(0, vitest_1.expect)(fs.createWriteStream).not.toHaveBeenCalled()
			const result = await interceptor.finalize()
			;(0, vitest_1.expect)(result.preview).toBe(smallOutput)
			;(0, vitest_1.expect)(result.truncated).toBe(false)
			;(0, vitest_1.expect)(result.artifactPath).toBe(null)
			;(0, vitest_1.expect)(result.totalBytes).toBe(Buffer.byteLength(smallOutput, "utf8"))
		})
		;(0, vitest_1.it)("should spill to disk when output exceeds threshold", () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "echo test",
				storageDir,
				previewSize: "small", // 5KB = 5120 bytes
			})
			// Write enough data to exceed 5KB threshold
			const chunk = "x".repeat(2 * 1024) // 2KB chunk
			interceptor.write(chunk) // 2KB - should stay in memory
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(false)
			interceptor.write(chunk) // 4KB - should stay in memory
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(false)
			interceptor.write(chunk) // 6KB - should trigger spill
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(true)
			;(0, vitest_1.expect)(fs.createWriteStream).toHaveBeenCalledWith(path.join(storageDir, "cmd-12345.txt"))
			;(0, vitest_1.expect)(mockWriteStream.write).toHaveBeenCalled()
		})
		;(0, vitest_1.it)("should truncate preview after spilling to disk using head/tail split", async () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "echo test",
				storageDir,
				previewSize: "small", // 5KB
			})
			// Write data that exceeds threshold
			const chunk = "x".repeat(6000)
			interceptor.write(chunk)
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(true)
			const result = await interceptor.finalize()
			;(0, vitest_1.expect)(result.truncated).toBe(true)
			;(0, vitest_1.expect)(result.artifactPath).toBe(path.join(storageDir, "cmd-12345.txt"))
			// Preview is head (1024) + omission indicator + tail (1024)
			// The omission indicator adds some extra bytes
			;(0, vitest_1.expect)(result.preview).toContain("[...")
			;(0, vitest_1.expect)(result.preview).toContain("bytes omitted...]")
		})
		;(0, vitest_1.it)("should write subsequent chunks directly to disk after spilling", () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "echo test",
				storageDir,
				previewSize: "small",
			})
			// Trigger spill (must exceed 5KB = 5120 bytes)
			const largeChunk = "x".repeat(6000)
			interceptor.write(largeChunk)
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(true)
			// Clear mock to track next write
			mockWriteStream.write.mockClear()
			// Write another chunk - should go directly to disk
			const nextChunk = "y".repeat(1000)
			interceptor.write(nextChunk)
			;(0, vitest_1.expect)(mockWriteStream.write).toHaveBeenCalledWith(nextChunk)
		})
	})
	;(0, vitest_1.describe)("Threshold settings", () => {
		;(0, vitest_1.it)("should handle small (5KB) threshold correctly", () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small",
			})
			// Write exactly 5KB
			interceptor.write("x".repeat(5 * 1024))
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(false)
			// Write more to exceed 5KB
			interceptor.write("x")
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(true)
		})
		;(0, vitest_1.it)("should handle medium (10KB) threshold correctly", () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "medium",
			})
			// Write exactly 10KB
			interceptor.write("x".repeat(10 * 1024))
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(false)
			// Write more to exceed 10KB
			interceptor.write("x")
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(true)
		})
		;(0, vitest_1.it)("should handle large (20KB) threshold correctly", () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "large",
			})
			// Write exactly 20KB
			interceptor.write("x".repeat(20 * 1024))
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(false)
			// Write more to exceed 20KB
			interceptor.write("x")
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(true)
		})
	})
	;(0, vitest_1.describe)("Artifact creation", () => {
		;(0, vitest_1.it)("should create directory if it doesn't exist", () => {
			vitest_1.vi.mocked(fs.existsSync).mockReturnValue(false)
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small",
			})
			// Trigger spill (must exceed 5KB = 5120 bytes)
			interceptor.write("x".repeat(6000))
			;(0, vitest_1.expect)(fs.mkdirSync).toHaveBeenCalledWith(storageDir, { recursive: true })
		})
		;(0, vitest_1.it)("should create artifact file with correct naming pattern", () => {
			const executionId = "1706119234567"
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId,
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small",
			})
			// Trigger spill (must exceed 5KB = 5120 bytes)
			interceptor.write("x".repeat(6000))
			;(0, vitest_1.expect)(fs.createWriteStream).toHaveBeenCalledWith(
				path.join(storageDir, `cmd-${executionId}.txt`),
			)
		})
		;(0, vitest_1.it)("should write head and tail buffers to artifact when spilling", () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small", // 5KB = 5120 bytes, so head=2560, tail=2560
			})
			const fullOutput = "x".repeat(10000)
			interceptor.write(fullOutput)
			// The write stream should receive the head buffer content first
			// (spillToDisk writes head + tail that existed at spill time)
			;(0, vitest_1.expect)(mockWriteStream.write).toHaveBeenCalled()
			// Verify that we're writing to disk
			;(0, vitest_1.expect)(interceptor.hasSpilledToDisk()).toBe(true)
		})
		;(0, vitest_1.it)("should get artifact path from getArtifactPath() method", () => {
			const executionId = "12345"
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId,
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small",
			})
			const expectedPath = path.join(storageDir, `cmd-${executionId}.txt`)
			;(0, vitest_1.expect)(interceptor.getArtifactPath()).toBe(expectedPath)
		})
	})
	;(0, vitest_1.describe)("finalize() method", () => {
		;(0, vitest_1.it)("should return preview output for small commands", async () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "echo hello",
				storageDir,
				previewSize: "small",
			})
			const output = "Hello World\n"
			interceptor.write(output)
			const result = await interceptor.finalize()
			;(0, vitest_1.expect)(result.preview).toBe(output)
			;(0, vitest_1.expect)(result.totalBytes).toBe(Buffer.byteLength(output, "utf8"))
			;(0, vitest_1.expect)(result.artifactPath).toBe(null)
			;(0, vitest_1.expect)(result.truncated).toBe(false)
		})
		;(0, vitest_1.it)(
			"should return PersistedCommandOutput for large commands with head/tail preview",
			async () => {
				const interceptor = new OutputInterceptor_1.OutputInterceptor({
					executionId: "12345",
					taskId: "task-1",
					command: "test",
					storageDir,
					previewSize: "small", // 5KB = 5120, head=2560, tail=2560
				})
				const largeOutput = "x".repeat(10000)
				interceptor.write(largeOutput)
				const result = await interceptor.finalize()
				;(0, vitest_1.expect)(result.truncated).toBe(true)
				;(0, vitest_1.expect)(result.artifactPath).toBe(path.join(storageDir, "cmd-12345.txt"))
				;(0, vitest_1.expect)(result.totalBytes).toBe(Buffer.byteLength(largeOutput, "utf8"))
				// Preview should contain head + omission indicator + tail
				;(0, vitest_1.expect)(result.preview).toContain("[...")
				;(0, vitest_1.expect)(result.preview).toContain("bytes omitted...]")
			},
		)
		;(0, vitest_1.it)("should close write stream when finalizing", async () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small",
			})
			// Trigger spill (must exceed 5KB = 5120 bytes)
			interceptor.write("x".repeat(6000))
			await interceptor.finalize()
			;(0, vitest_1.expect)(mockWriteStream.end).toHaveBeenCalled()
		})
		;(0, vitest_1.it)("should include correct metadata (artifactId, size, truncated flag)", async () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small",
			})
			// Must exceed 5KB = 5120 bytes to trigger truncation
			const output = "x".repeat(6000)
			interceptor.write(output)
			const result = await interceptor.finalize()
			;(0, vitest_1.expect)(result).toHaveProperty("preview")
			;(0, vitest_1.expect)(result).toHaveProperty("totalBytes", 6000)
			;(0, vitest_1.expect)(result).toHaveProperty("artifactPath")
			;(0, vitest_1.expect)(result).toHaveProperty("truncated", true)
			;(0, vitest_1.expect)(result.artifactPath).toMatch(/cmd-12345\.txt$/)
		})
	})
	;(0, vitest_1.describe)("Cleanup methods", () => {
		;(0, vitest_1.it)("should clean up all artifacts in directory", async () => {
			const mockFiles = ["cmd-12345.txt", "cmd-67890.txt", "other-file.txt", "cmd-11111.txt"]
			vitest_1.vi.mocked(fs.promises.readdir).mockResolvedValue(mockFiles)
			vitest_1.vi.mocked(fs.promises.unlink).mockResolvedValue(undefined)
			await OutputInterceptor_1.OutputInterceptor.cleanup(storageDir)
			;(0, vitest_1.expect)(fs.promises.readdir).toHaveBeenCalledWith(storageDir)
			;(0, vitest_1.expect)(fs.promises.unlink).toHaveBeenCalledTimes(3)
			;(0, vitest_1.expect)(fs.promises.unlink).toHaveBeenCalledWith(path.join(storageDir, "cmd-12345.txt"))
			;(0, vitest_1.expect)(fs.promises.unlink).toHaveBeenCalledWith(path.join(storageDir, "cmd-67890.txt"))
			;(0, vitest_1.expect)(fs.promises.unlink).toHaveBeenCalledWith(path.join(storageDir, "cmd-11111.txt"))
			;(0, vitest_1.expect)(fs.promises.unlink).not.toHaveBeenCalledWith(path.join(storageDir, "other-file.txt"))
		})
		;(0, vitest_1.it)("should handle cleanup when directory doesn't exist", async () => {
			vitest_1.vi.mocked(fs.promises.readdir).mockRejectedValue(new Error("ENOENT"))
			// Should not throw
			await (0, vitest_1.expect)(
				OutputInterceptor_1.OutputInterceptor.cleanup(storageDir),
			).resolves.toBeUndefined()
		})
		;(0, vitest_1.it)("should clean up specific artifacts by executionIds", async () => {
			const mockFiles = ["cmd-12345.txt", "cmd-67890.txt", "cmd-11111.txt"]
			vitest_1.vi.mocked(fs.promises.readdir).mockResolvedValue(mockFiles)
			vitest_1.vi.mocked(fs.promises.unlink).mockResolvedValue(undefined)
			// Keep 12345 and 67890, delete 11111
			const keepIds = new Set(["12345", "67890"])
			await OutputInterceptor_1.OutputInterceptor.cleanupByIds(storageDir, keepIds)
			;(0, vitest_1.expect)(fs.promises.unlink).toHaveBeenCalledTimes(1)
			;(0, vitest_1.expect)(fs.promises.unlink).toHaveBeenCalledWith(path.join(storageDir, "cmd-11111.txt"))
			;(0, vitest_1.expect)(fs.promises.unlink).not.toHaveBeenCalledWith(path.join(storageDir, "cmd-12345.txt"))
			;(0, vitest_1.expect)(fs.promises.unlink).not.toHaveBeenCalledWith(path.join(storageDir, "cmd-67890.txt"))
		})
		;(0, vitest_1.it)("should handle unlink errors gracefully", async () => {
			const mockFiles = ["cmd-12345.txt", "cmd-67890.txt"]
			vitest_1.vi.mocked(fs.promises.readdir).mockResolvedValue(mockFiles)
			vitest_1.vi.mocked(fs.promises.unlink).mockRejectedValue(new Error("Permission denied"))
			// Should not throw even if unlink fails
			await (0, vitest_1.expect)(
				OutputInterceptor_1.OutputInterceptor.cleanup(storageDir),
			).resolves.toBeUndefined()
		})
	})
	;(0, vitest_1.describe)("getBufferForUI() method", () => {
		;(0, vitest_1.it)("should return current buffer for UI updates", () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small",
			})
			const output = "Hello World"
			interceptor.write(output)
			;(0, vitest_1.expect)(interceptor.getBufferForUI()).toBe(output)
		})
		;(0, vitest_1.it)("should return head + tail buffer after spilling to disk", () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small", // 5KB = 5120, head=2560, tail=2560
			})
			// Trigger spill
			const largeOutput = "x".repeat(10000)
			interceptor.write(largeOutput)
			const buffer = interceptor.getBufferForUI()
			// Buffer for UI is head + tail (no omission indicator for smooth streaming)
			;(0, vitest_1.expect)(Buffer.byteLength(buffer, "utf8")).toBeLessThanOrEqual(5120)
		})
	})
	;(0, vitest_1.describe)("Head/Tail split behavior", () => {
		;(0, vitest_1.it)("should preserve first 50% and last 50% of output", async () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small", // 5KB = 5120, head=2560, tail=2560
			})
			// Create identifiable head and tail content
			const headContent = "HEAD".repeat(750) // 3000 bytes
			const middleContent = "M".repeat(6000) // 6000 bytes (will be omitted)
			const tailContent = "TAIL".repeat(750) // 3000 bytes
			interceptor.write(headContent)
			interceptor.write(middleContent)
			interceptor.write(tailContent)
			const result = await interceptor.finalize()
			// Should start with HEAD content (first 2560 bytes of head budget)
			;(0, vitest_1.expect)(result.preview.startsWith("HEAD")).toBe(true)
			// Should end with TAIL content (last 2560 bytes)
			;(0, vitest_1.expect)(result.preview.endsWith("TAIL")).toBe(true)
			// Should have omission indicator
			;(0, vitest_1.expect)(result.preview).toContain("[...")
			;(0, vitest_1.expect)(result.preview).toContain("bytes omitted...]")
		})
		;(0, vitest_1.it)("should not add omission indicator when output fits in budget", async () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small", // 5KB
			})
			const smallOutput = "Hello World\n"
			interceptor.write(smallOutput)
			const result = await interceptor.finalize()
			// No omission indicator for small output
			;(0, vitest_1.expect)(result.preview).toBe(smallOutput)
			;(0, vitest_1.expect)(result.preview).not.toContain("[...")
		})
		;(0, vitest_1.it)("should handle output that exactly fills head budget", async () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small", // 5KB = 5120, head=2560
			})
			// Write exactly 2560 bytes (head budget)
			const exactHeadContent = "x".repeat(2560)
			interceptor.write(exactHeadContent)
			const result = await interceptor.finalize()
			// Should fit entirely in head, no truncation
			;(0, vitest_1.expect)(result.preview).toBe(exactHeadContent)
			;(0, vitest_1.expect)(result.truncated).toBe(false)
		})
		;(0, vitest_1.it)("should split single large chunk across head and tail", async () => {
			const interceptor = new OutputInterceptor_1.OutputInterceptor({
				executionId: "12345",
				taskId: "task-1",
				command: "test",
				storageDir,
				previewSize: "small", // 5KB = 5120, head=2560, tail=2560
			})
			// Write a single chunk larger than preview budget
			// First 2560 chars go to head, last 2560 chars go to tail
			const content = "A".repeat(2560) + "B".repeat(4000) + "C".repeat(2560)
			interceptor.write(content)
			const result = await interceptor.finalize()
			// Head should have A's
			;(0, vitest_1.expect)(result.preview.startsWith("A")).toBe(true)
			// Tail should have C's
			;(0, vitest_1.expect)(result.preview.endsWith("C")).toBe(true)
			// Should have omission indicator
			;(0, vitest_1.expect)(result.preview).toContain("[...")
		})
	})
})
