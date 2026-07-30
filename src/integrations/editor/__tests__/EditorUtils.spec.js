"use strict"
// npx vitest src/integrations/editor/__tests__/EditorUtils.spec.ts
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
const EditorUtils_1 = require("../EditorUtils")
// Use simple classes to simulate VSCode's Range and Position behavior.
vi.mock("vscode", () => {
	class MockPosition {
		line
		character
		constructor(line, character) {
			this.line = line
			this.character = character
		}
	}
	class MockRange {
		start
		end
		constructor(start, end) {
			this.start = start
			this.end = end
		}
	}
	return {
		Range: MockRange,
		Position: MockPosition,
		workspace: {
			getWorkspaceFolder: vi.fn(),
		},
		window: { activeTextEditor: undefined },
		languages: {
			getDiagnostics: vi.fn(() => []),
		},
	}
})
describe("EditorUtils", () => {
	let mockDocument
	beforeEach(() => {
		mockDocument = {
			getText: vi.fn(),
			lineAt: vi.fn(),
			lineCount: 10,
			uri: { fsPath: "/test/file.ts" },
		}
	})
	describe("getEffectiveRange", () => {
		it("should return selected text when available", () => {
			const mockRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
			mockDocument.getText.mockReturnValue("selected text")
			const result = EditorUtils_1.EditorUtils.getEffectiveRange(mockDocument, mockRange)
			expect(result).toEqual({
				range: mockRange,
				text: "selected text",
			})
		})
		it("should return null for empty line", () => {
			const mockRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
			mockDocument.getText.mockReturnValue("")
			mockDocument.lineAt.mockReturnValue({ text: "", lineNumber: 0 })
			const result = EditorUtils_1.EditorUtils.getEffectiveRange(mockDocument, mockRange)
			expect(result).toBeNull()
		})
		it("should expand empty selection to full lines", () => {
			// Simulate a caret (empty selection) on line 2 at character 5.
			const initialRange = new vscode.Range(new vscode.Position(2, 5), new vscode.Position(2, 5))
			// Return non-empty text for any line with text (lines 1, 2, and 3).
			mockDocument.lineAt.mockImplementation((line) => {
				return { text: `Line ${line} text`, lineNumber: line }
			})
			mockDocument.getText.mockImplementation((range) => {
				// If the range is exactly the empty initial selection, return an empty string.
				if (
					range.start.line === initialRange.start.line &&
					range.start.character === initialRange.start.character &&
					range.end.line === initialRange.end.line &&
					range.end.character === initialRange.end.character
				) {
					return ""
				}
				return "expanded text"
			})
			const result = EditorUtils_1.EditorUtils.getEffectiveRange(mockDocument, initialRange)
			expect(result).not.toBeNull()
			// Expected effective range: from the beginning of line 1 to the end of line 3.
			expect(result?.range.start).toEqual({ line: 1, character: 0 })
			expect(result?.range.end).toEqual({ line: 3, character: 11 })
			expect(result?.text).toBe("expanded text")
		})
	})
	describe("hasIntersectingRange", () => {
		it("should return false for ranges that only touch boundaries", () => {
			// Range1: [0, 0) - [0, 10) and Range2: [0, 10) - [0, 20)
			const range1 = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
			const range2 = new vscode.Range(new vscode.Position(0, 10), new vscode.Position(0, 20))
			expect(EditorUtils_1.EditorUtils.hasIntersectingRange(range1, range2)).toBe(false)
		})
		it("should return true for overlapping ranges", () => {
			// Range1: [0, 0) - [0, 15) and Range2: [0, 10) - [0, 20)
			const range1 = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 15))
			const range2 = new vscode.Range(new vscode.Position(0, 10), new vscode.Position(0, 20))
			expect(EditorUtils_1.EditorUtils.hasIntersectingRange(range1, range2)).toBe(true)
		})
		it("should return false for non-overlapping ranges", () => {
			// Range1: [0, 0) - [0, 10) and Range2: [1, 0) - [1, 5)
			const range1 = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
			const range2 = new vscode.Range(new vscode.Position(1, 0), new vscode.Position(1, 5))
			expect(EditorUtils_1.EditorUtils.hasIntersectingRange(range1, range2)).toBe(false)
		})
	})
	describe("getFilePath", () => {
		it("should return relative path when in workspace", () => {
			const mockWorkspaceFolder = {
				uri: { fsPath: "/test" },
				name: "test",
				index: 0,
			}
			vi.mocked(vscode.workspace.getWorkspaceFolder).mockReturnValue(mockWorkspaceFolder)
			const result = EditorUtils_1.EditorUtils.getFilePath(mockDocument)
			expect(result).toBe("file.ts")
		})
		it("should return absolute path when not in workspace", () => {
			vi.mocked(vscode.workspace.getWorkspaceFolder).mockReturnValue(undefined)
			const result = EditorUtils_1.EditorUtils.getFilePath(mockDocument)
			expect(result).toBe("/test/file.ts")
		})
	})
})
