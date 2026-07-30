"use strict"
// npx vitest src/core/webview/__tests__/diagnosticsHandler.spec.ts
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
const path = __importStar(require("path"))
// Mock vscode first
vi.mock("vscode", () => {
	const showErrorMessage = vi.fn()
	const openTextDocument = vi.fn().mockResolvedValue({})
	const showTextDocument = vi.fn().mockResolvedValue(undefined)
	return {
		window: {
			showErrorMessage,
			showTextDocument,
		},
		workspace: {
			openTextDocument,
		},
	}
})
// Mock storage utilities
vi.mock("../../../utils/storage", () => ({
	getTaskDirectoryPath: vi.fn(async () => "/mock/task-dir"),
}))
// Mock fs utilities
vi.mock("../../../utils/fs", () => ({
	fileExistsAtPath: vi.fn(),
}))
// Mock fs/promises
vi.mock("fs/promises", () => {
	const mockReadFile = vi.fn()
	const mockWriteFile = vi.fn().mockResolvedValue(undefined)
	return {
		default: {
			readFile: mockReadFile,
			writeFile: mockWriteFile,
		},
		readFile: mockReadFile,
		writeFile: mockWriteFile,
	}
})
const vscode = __importStar(require("vscode"))
const fs = __importStar(require("fs/promises"))
const fsUtils = __importStar(require("../../../utils/fs"))
const diagnosticsHandler_1 = require("../diagnosticsHandler")
describe("generateErrorDiagnostics", () => {
	const mockLog = vi.fn()
	beforeEach(() => {
		vi.clearAllMocks()
	})
	it("generates a diagnostics file with error metadata and history", async () => {
		vi.mocked(fsUtils.fileExistsAtPath).mockResolvedValue(true)
		vi.mocked(fs.readFile).mockResolvedValue('[{"role": "user", "content": "test"}]')
		const result = await (0, diagnosticsHandler_1.generateErrorDiagnostics)({
			taskId: "test-task-id",
			globalStoragePath: "/mock/global/storage",
			values: {
				timestamp: "2025-01-01T00:00:00.000Z",
				version: "1.2.3",
				provider: "test-provider",
				model: "test-model",
				details: "Sample error details",
			},
			log: mockLog,
		})
		expect(result.success).toBe(true)
		expect(result.filePath).toContain("roo-diagnostics-")
		// Verify we attempted to read API history
		expect(fs.readFile).toHaveBeenCalledWith(path.join("/mock/task-dir", "api_conversation_history.json"), "utf8")
		// Verify we wrote a diagnostics file with the expected content
		expect(fs.writeFile).toHaveBeenCalledTimes(1)
		const [writtenPath, writtenContent] = vi.mocked(fs.writeFile).mock.calls[0]
		// taskId.slice(0, 8) = "test-tas" from "test-task-id"
		expect(String(writtenPath)).toContain("roo-diagnostics-test-tas")
		expect(String(writtenContent)).toContain(
			"// Please attach this file to a GitHub issue if it helps diagnose the problem faster",
		)
		expect(String(writtenContent)).not.toContain("support@roocode.com")
		expect(String(writtenContent)).toContain('"error":')
		expect(String(writtenContent)).toContain('"history":')
		expect(String(writtenContent)).toContain('"version": "1.2.3"')
		expect(String(writtenContent)).toContain('"provider": "test-provider"')
		expect(String(writtenContent)).toContain('"model": "test-model"')
		expect(String(writtenContent)).toContain('"details": "Sample error details"')
		// Verify VS Code APIs were used to open the generated file
		expect(vscode.workspace.openTextDocument).toHaveBeenCalledTimes(1)
		expect(vscode.window.showTextDocument).toHaveBeenCalledTimes(1)
	})
	it("uses empty history when API history file does not exist", async () => {
		vi.mocked(fsUtils.fileExistsAtPath).mockResolvedValue(false)
		const result = await (0, diagnosticsHandler_1.generateErrorDiagnostics)({
			taskId: "test-task-id",
			globalStoragePath: "/mock/global/storage",
			values: {
				timestamp: "2025-01-01T00:00:00.000Z",
				version: "1.0.0",
				provider: "test",
				model: "test",
				details: "error",
			},
			log: mockLog,
		})
		expect(result.success).toBe(true)
		// Should not attempt to read file when it doesn't exist
		expect(fs.readFile).not.toHaveBeenCalled()
		// Verify empty history in output
		const [, writtenContent] = vi.mocked(fs.writeFile).mock.calls[0]
		expect(String(writtenContent)).toContain('"history": []')
	})
	it("uses default values when values are not provided", async () => {
		vi.mocked(fsUtils.fileExistsAtPath).mockResolvedValue(false)
		const result = await (0, diagnosticsHandler_1.generateErrorDiagnostics)({
			taskId: "test-task-id",
			globalStoragePath: "/mock/global/storage",
			log: mockLog,
		})
		expect(result.success).toBe(true)
		// Verify defaults in output
		const [, writtenContent] = vi.mocked(fs.writeFile).mock.calls[0]
		expect(String(writtenContent)).toContain('"version": ""')
		expect(String(writtenContent)).toContain('"provider": ""')
		expect(String(writtenContent)).toContain('"model": ""')
		expect(String(writtenContent)).toContain('"details": ""')
	})
	it("handles JSON parse error gracefully", async () => {
		vi.mocked(fsUtils.fileExistsAtPath).mockResolvedValue(true)
		vi.mocked(fs.readFile).mockResolvedValue("invalid json")
		const result = await (0, diagnosticsHandler_1.generateErrorDiagnostics)({
			taskId: "test-task-id",
			globalStoragePath: "/mock/global/storage",
			values: {
				timestamp: "2025-01-01T00:00:00.000Z",
				version: "1.0.0",
				provider: "test",
				model: "test",
				details: "error",
			},
			log: mockLog,
		})
		// Should still succeed but with empty history
		expect(result.success).toBe(true)
		expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("Failed to parse api_conversation_history.json")
		// Verify empty history in output
		const [, writtenContent] = vi.mocked(fs.writeFile).mock.calls[0]
		expect(String(writtenContent)).toContain('"history": []')
	})
	it("returns error result when file write fails", async () => {
		vi.mocked(fsUtils.fileExistsAtPath).mockResolvedValue(false)
		vi.mocked(fs.writeFile).mockRejectedValue(new Error("Write failed"))
		const result = await (0, diagnosticsHandler_1.generateErrorDiagnostics)({
			taskId: "test-task-id",
			globalStoragePath: "/mock/global/storage",
			log: mockLog,
		})
		expect(result.success).toBe(false)
		expect(result.error).toBe("Write failed")
		expect(mockLog).toHaveBeenCalledWith("Error generating diagnostics: Write failed")
		expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("Failed to generate diagnostics: Write failed")
	})
})
