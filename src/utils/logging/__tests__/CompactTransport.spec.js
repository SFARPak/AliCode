"use strict"
// npx vitest utils/logging/__tests__/CompactTransport.spec.ts
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const CompactTransport_1 = require("../CompactTransport")
const fs_1 = __importDefault(require("fs"))
const path_1 = __importDefault(require("path"))
describe("CompactTransport", () => {
	const testDir = "./test-logs"
	const testLogPath = path_1.default.join(testDir, "test.log")
	let transport
	const originalWrite = process.stdout.write
	const cleanupTestLogs = () => {
		const rmDirRecursive = (dirPath) => {
			if (fs_1.default.existsSync(dirPath)) {
				fs_1.default.readdirSync(dirPath).forEach((file) => {
					const curPath = path_1.default.join(dirPath, file)
					if (fs_1.default.lstatSync(curPath).isDirectory()) {
						// Recursive call for directories
						rmDirRecursive(curPath)
					} else {
						// Delete file
						fs_1.default.unlinkSync(curPath)
					}
				})
				// Remove directory after it's empty
				fs_1.default.rmdirSync(dirPath)
			}
		}
		try {
			rmDirRecursive(testDir)
		} catch (err) {
			console.error("Cleanup error:", err)
		}
	}
	beforeEach(() => {
		process.stdout.write = () => true
		cleanupTestLogs()
		fs_1.default.mkdirSync(testDir, { recursive: true })
		transport = new CompactTransport_1.CompactTransport({
			level: "fatal",
			fileOutput: {
				enabled: true,
				path: testLogPath,
			},
		})
	})
	afterEach(() => {
		process.stdout.write = originalWrite
		transport.close()
		cleanupTestLogs()
	})
	describe("File Handling", () => {
		test("creates new log file on initialization", () => {
			const entry = {
				t: Date.now(),
				l: "info",
				m: "test message",
			}
			transport.write(entry)
			const fileContent = fs_1.default.readFileSync(testLogPath, "utf-8")
			const lines = fileContent.trim().split("\n")
			expect(lines.length).toBe(2)
			expect(JSON.parse(lines[0])).toMatchObject({
				l: "info",
				m: "Log session started",
			})
			expect(JSON.parse(lines[1])).toMatchObject({
				l: "info",
				m: "test message",
			})
		})
		test("appends entries after initialization", () => {
			transport.write({
				t: Date.now(),
				l: "info",
				m: "first",
			})
			transport.write({
				t: Date.now(),
				l: "info",
				m: "second",
			})
			const fileContent = fs_1.default.readFileSync(testLogPath, "utf-8")
			const lines = fileContent.trim().split("\n")
			expect(lines.length).toBe(3)
			expect(JSON.parse(lines[1])).toMatchObject({ m: "first" })
			expect(JSON.parse(lines[2])).toMatchObject({ m: "second" })
		})
		test("writes session end marker on close", () => {
			transport.write({
				t: Date.now(),
				l: "info",
				m: "test",
			})
			transport.close()
			const fileContent = fs_1.default.readFileSync(testLogPath, "utf-8")
			const lines = fileContent.trim().split("\n")
			const lastLine = JSON.parse(lines[lines.length - 1])
			expect(lastLine).toMatchObject({
				l: "info",
				m: "Log session ended",
			})
		})
	})
	describe("File System Edge Cases", () => {
		test("handles file path with deep directories", () => {
			const deepDir = path_1.default.join(testDir, "deep/nested/path")
			const deepPath = path_1.default.join(deepDir, "test.log")
			const deepTransport = new CompactTransport_1.CompactTransport({
				fileOutput: { enabled: true, path: deepPath },
			})
			try {
				deepTransport.write({
					t: Date.now(),
					l: "info",
					m: "test",
				})
				expect(fs_1.default.existsSync(deepPath)).toBeTruthy()
			} finally {
				deepTransport.close()
				// Clean up the deep directory structure
				const rmDirRecursive = (dirPath) => {
					if (fs_1.default.existsSync(dirPath)) {
						fs_1.default.readdirSync(dirPath).forEach((file) => {
							const curPath = path_1.default.join(dirPath, file)
							if (fs_1.default.lstatSync(curPath).isDirectory()) {
								rmDirRecursive(curPath)
							} else {
								fs_1.default.unlinkSync(curPath)
							}
						})
						fs_1.default.rmdirSync(dirPath)
					}
				}
				rmDirRecursive(path_1.default.join(testDir, "deep"))
			}
		})
		test("handles concurrent writes", async () => {
			const entries = Array(100)
				.fill(null)
				.map((_, i) => ({
					t: Date.now(),
					l: "info",
					m: `test ${i}`,
				}))
			await Promise.all(entries.map((entry) => Promise.resolve(transport.write(entry))))
			const fileContent = fs_1.default.readFileSync(testLogPath, "utf-8")
			const lines = fileContent.trim().split("\n")
			// +1 for session start line
			expect(lines.length).toBe(entries.length + 1)
		})
	})
	describe("Delta Timestamp Conversion", () => {
		let output = []
		beforeEach(() => {
			output = []
			vi.useFakeTimers()
			const baseTime = 1000000000000
			vi.setSystemTime(baseTime) // Set time before transport creation
			process.stdout.write = (str) => {
				output.push(str)
				return true
			}
		})
		afterEach(() => {
			vi.useRealTimers()
		})
		test("converts absolute timestamps to deltas", () => {
			const baseTime = Date.now() // Use current fake time
			const transport = new CompactTransport_1.CompactTransport({
				level: "info",
				fileOutput: { enabled: false, path: "null" },
			})
			transport.write({
				t: baseTime,
				l: "info",
				m: "first",
			})
			transport.write({
				t: baseTime + 100,
				l: "info",
				m: "second",
			})
			const entries = output.map((str) => JSON.parse(str))
			expect(entries[0].t).toBe(0) // First entry should have 0 delta from transport creation
			expect(entries[1].t).toBe(100) // Delta from previous entry
		})
	})
})
