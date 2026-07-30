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
const vscode = __importStar(require("vscode"))
const open_file_1 = require("../open-file")
// Mock vscode module
vi.mock("vscode", () => ({
	Uri: {
		file: vi.fn((path) => ({ fsPath: path })),
	},
	workspace: {
		fs: {
			stat: vi.fn(),
			writeFile: vi.fn(),
		},
		openTextDocument: vi.fn(),
	},
	window: {
		showTextDocument: vi.fn(),
		showErrorMessage: vi.fn(),
		tabGroups: {
			all: [],
		},
		activeTextEditor: undefined,
	},
	commands: {
		executeCommand: vi.fn(),
	},
	FileType: {
		Directory: 2,
		File: 1,
	},
	Selection: vi.fn((startLine, startChar, endLine, endChar) => ({
		start: { line: startLine, character: startChar },
		end: { line: endLine, character: endChar },
	})),
	TabInputText: vi.fn(),
}))
// Mock utils
vi.mock("../../utils/path", () => {
	const nodePath = require("path")
	return {
		arePathsEqual: vi.fn((a, b) => a === b),
		getWorkspacePath: vi.fn(() => {
			// In tests, we need to return a consistent workspace path
			// The actual workspace is /Users/roocode/rc2 in local, but varies in CI
			const cwd = process.cwd()
			// If we're in the src directory, go up one level to get workspace root
			if (cwd.endsWith("/src")) {
				return nodePath.dirname(cwd)
			}
			return cwd
		}),
	}
})
// Mock i18n
vi.mock("../../i18n", () => ({
	t: vi.fn((key, params) => {
		// Return the key without namespace prefix to match actual behavior
		if (key.startsWith("common:")) {
			return key.replace("common:", "")
		}
		return key
	}),
}))
describe("openFile", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, "warn").mockImplementation(() => {})
	})
	afterEach(() => {
		vi.restoreAllMocks()
	})
	describe("decodeURIComponent error handling", () => {
		it("should handle invalid URI encoding gracefully", async () => {
			const invalidPath = "test%ZZinvalid.txt" // Invalid percent encoding
			const mockDocument = { uri: { fsPath: invalidPath } }
			vi.mocked(vscode.workspace.fs.stat).mockResolvedValue({
				type: vscode.FileType.File,
				ctime: 0,
				mtime: 0,
				size: 0,
			})
			vi.mocked(vscode.workspace.openTextDocument).mockResolvedValue(mockDocument)
			vi.mocked(vscode.window.showTextDocument).mockResolvedValue({})
			await (0, open_file_1.openFile)(invalidPath)
			// Should log a warning about decode failure
			expect(console.warn).toHaveBeenCalledWith(
				"Failed to decode file path: URIError: URI malformed. Using original path.",
			)
			// Should still attempt to open the file with the original path
			expect(vscode.workspace.openTextDocument).toHaveBeenCalled()
			expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
		})
		it("should successfully decode valid URI-encoded paths", async () => {
			const encodedPath = "./%5Btest%5D/file.txt" // [test] encoded
			const decodedPath = "./[test]/file.txt"
			const mockDocument = { uri: { fsPath: decodedPath } }
			vi.mocked(vscode.workspace.fs.stat).mockResolvedValue({
				type: vscode.FileType.File,
				ctime: 0,
				mtime: 0,
				size: 0,
			})
			vi.mocked(vscode.workspace.openTextDocument).mockResolvedValue(mockDocument)
			vi.mocked(vscode.window.showTextDocument).mockResolvedValue({})
			await (0, open_file_1.openFile)(encodedPath)
			// Should not log any warnings
			expect(console.warn).not.toHaveBeenCalled()
			// Should use the decoded path - verify it contains the decoded brackets
			// On Windows, the path will include backslashes instead of forward slashes
			const expectedPathSegment = process.platform === "win32" ? "[test]\\file.txt" : "[test]/file.txt"
			expect(vscode.Uri.file).toHaveBeenCalledWith(expect.stringContaining(expectedPathSegment))
			expect(vscode.workspace.openTextDocument).toHaveBeenCalled()
			expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
		})
		it("should handle paths with special characters that need encoding", async () => {
			const pathWithSpecialChars = "./[brackets]/file with spaces.txt"
			const mockDocument = { uri: { fsPath: pathWithSpecialChars } }
			vi.mocked(vscode.workspace.fs.stat).mockResolvedValue({
				type: vscode.FileType.File,
				ctime: 0,
				mtime: 0,
				size: 0,
			})
			vi.mocked(vscode.workspace.openTextDocument).mockResolvedValue(mockDocument)
			vi.mocked(vscode.window.showTextDocument).mockResolvedValue({})
			await (0, open_file_1.openFile)(pathWithSpecialChars)
			// Should work without errors
			expect(console.warn).not.toHaveBeenCalled()
			expect(vscode.workspace.openTextDocument).toHaveBeenCalled()
			expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
		})
		it("should handle already decoded paths without double-decoding", async () => {
			const normalPath = "./normal/file.txt"
			const mockDocument = { uri: { fsPath: normalPath } }
			vi.mocked(vscode.workspace.fs.stat).mockResolvedValue({
				type: vscode.FileType.File,
				ctime: 0,
				mtime: 0,
				size: 0,
			})
			vi.mocked(vscode.workspace.openTextDocument).mockResolvedValue(mockDocument)
			vi.mocked(vscode.window.showTextDocument).mockResolvedValue({})
			await (0, open_file_1.openFile)(normalPath)
			// Should work without errors
			expect(console.warn).not.toHaveBeenCalled()
			expect(vscode.workspace.openTextDocument).toHaveBeenCalled()
			expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
		})
	})
	describe("error handling", () => {
		it("should show error message when file does not exist", async () => {
			const nonExistentPath = "./does/not/exist.txt"
			vi.mocked(vscode.workspace.fs.stat).mockRejectedValue(new Error("File not found"))
			await (0, open_file_1.openFile)(nonExistentPath)
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("errors.could_not_open_file")
		})
		it("should handle generic errors", async () => {
			const testPath = "./test.txt"
			vi.mocked(vscode.workspace.fs.stat).mockRejectedValue("Not an Error object")
			await (0, open_file_1.openFile)(testPath)
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("errors.could_not_open_file")
		})
	})
	describe("directory handling", () => {
		it("should reveal directories in explorer", async () => {
			const dirPath = "./components"
			vi.mocked(vscode.workspace.fs.stat).mockResolvedValue({
				type: vscode.FileType.Directory,
				ctime: 0,
				mtime: 0,
				size: 0,
			})
			await (0, open_file_1.openFile)(dirPath)
			expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
				"revealInExplorer",
				expect.objectContaining({ fsPath: expect.stringContaining("components") }),
			)
			expect(vscode.commands.executeCommand).toHaveBeenCalledWith("list.expand")
			expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled()
		})
	})
	describe("file creation", () => {
		it("should create new files when create option is true", async () => {
			const newFilePath = "./new/file.txt"
			const content = "Hello, world!"
			vi.mocked(vscode.workspace.fs.stat).mockRejectedValue(new Error("File not found"))
			vi.mocked(vscode.workspace.openTextDocument).mockResolvedValue({})
			vi.mocked(vscode.window.showTextDocument).mockResolvedValue({})
			await (0, open_file_1.openFile)(newFilePath, { create: true, content })
			// On Windows, the path will include backslashes instead of forward slashes
			const expectedPathSegment = process.platform === "win32" ? "new\\file.txt" : "new/file.txt"
			expect(vscode.workspace.fs.writeFile).toHaveBeenCalledWith(
				expect.objectContaining({ fsPath: expect.stringContaining(expectedPathSegment) }),
				Buffer.from(content, "utf8"),
			)
			expect(vscode.workspace.openTextDocument).toHaveBeenCalled()
		})
	})
})
