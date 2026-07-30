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
const EditorUtils_1 = require("../../integrations/editor/EditorUtils")
const CodeActionProvider_1 = require("../CodeActionProvider")
vi.mock("vscode", () => ({
	CodeAction: vi.fn().mockImplementation((title, kind) => ({
		title,
		kind,
		command: undefined,
	})),
	CodeActionKind: {
		QuickFix: { value: "quickfix" },
		RefactorRewrite: { value: "refactor.rewrite" },
	},
	Range: vi.fn().mockImplementation((startLine, startChar, endLine, endChar) => ({
		start: { line: startLine, character: startChar },
		end: { line: endLine, character: endChar },
	})),
	DiagnosticSeverity: {
		Error: 0,
		Warning: 1,
		Information: 2,
		Hint: 3,
	},
	workspace: {
		getConfiguration: vi.fn().mockReturnValue({
			get: vi.fn().mockReturnValue(true),
		}),
	},
}))
vi.mock("../../integrations/editor/EditorUtils", () => ({
	EditorUtils: {
		getEffectiveRange: vi.fn(),
		getFilePath: vi.fn(),
		hasIntersectingRange: vi.fn(),
		createDiagnosticData: vi.fn(),
	},
}))
describe("CodeActionProvider", () => {
	let provider
	let mockDocument
	let mockRange
	let mockContext
	beforeEach(() => {
		provider = new CodeActionProvider_1.CodeActionProvider()
		mockDocument = {
			getText: vi.fn(),
			lineAt: vi.fn(),
			lineCount: 10,
			uri: { fsPath: "/test/file.ts" },
		}
		mockRange = new vscode.Range(0, 0, 0, 10)
		mockContext = { diagnostics: [] }
		EditorUtils_1.EditorUtils.getEffectiveRange.mockReturnValue({
			range: mockRange,
			text: "test code",
		})
		EditorUtils_1.EditorUtils.getFilePath.mockReturnValue("/test/file.ts")
		EditorUtils_1.EditorUtils.hasIntersectingRange.mockReturnValue(true)
		EditorUtils_1.EditorUtils.createDiagnosticData.mockImplementation((d) => d)
	})
	describe("provideCodeActions", () => {
		it("should provide explain, improve, fix logic, and add to context actions by default", () => {
			const actions = provider.provideCodeActions(mockDocument, mockRange, mockContext)
			expect(actions).toHaveLength(3)
			expect(actions[0].title).toBe(CodeActionProvider_1.TITLES.ADD_TO_CONTEXT)
			expect(actions[1].title).toBe(CodeActionProvider_1.TITLES.EXPLAIN)
			expect(actions[2].title).toBe(CodeActionProvider_1.TITLES.IMPROVE)
		})
		it("should provide fix action instead of fix logic when diagnostics exist", () => {
			mockContext.diagnostics = [
				{ message: "test error", severity: vscode.DiagnosticSeverity.Error, range: mockRange },
			]
			const actions = provider.provideCodeActions(mockDocument, mockRange, mockContext)
			expect(actions).toHaveLength(2)
			expect(actions.some((a) => a.title === `${CodeActionProvider_1.TITLES.FIX}`)).toBe(true)
			expect(actions.some((a) => a.title === `${CodeActionProvider_1.TITLES.ADD_TO_CONTEXT}`)).toBe(true)
		})
		it("should return empty array when no effective range", () => {
			EditorUtils_1.EditorUtils.getEffectiveRange.mockReturnValue(null)
			const actions = provider.provideCodeActions(mockDocument, mockRange, mockContext)
			expect(actions).toEqual([])
		})
		it("should return empty array when enableCodeActions is disabled", () => {
			// Mock the configuration to return false for enableCodeActions
			const mockGet = vi.fn().mockReturnValue(false)
			const mockGetConfiguration = vi.fn().mockReturnValue({
				get: mockGet,
			})
			vscode.workspace.getConfiguration.mockReturnValue(mockGetConfiguration())
			const actions = provider.provideCodeActions(mockDocument, mockRange, mockContext)
			expect(actions).toEqual([])
			expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith("alicode")
			expect(mockGet).toHaveBeenCalledWith("enableCodeActions", true)
		})
		it("should handle errors gracefully", () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
			// Reset the workspace mock to return true for enableCodeActions
			const mockGet = vi.fn().mockReturnValue(true)
			const mockGetConfiguration = vi.fn().mockReturnValue({
				get: mockGet,
			})
			vscode.workspace.getConfiguration.mockReturnValue(mockGetConfiguration())
			EditorUtils_1.EditorUtils.getEffectiveRange.mockImplementation(() => {
				throw new Error("Test error")
			})
			const actions = provider.provideCodeActions(mockDocument, mockRange, mockContext)
			expect(actions).toEqual([])
			expect(consoleErrorSpy).toHaveBeenCalledWith("Error providing code actions:", expect.any(Error))
			consoleErrorSpy.mockRestore()
		})
	})
})
