"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const ClineProvider_1 = require("../../core/webview/ClineProvider")
const registerCommands_1 = require("../registerCommands")
vi.mock("execa", () => ({
	execa: vi.fn(),
}))
vi.mock("vscode", () => ({
	CodeActionKind: {
		QuickFix: { value: "quickfix" },
		RefactorRewrite: { value: "refactor.rewrite" },
	},
	window: {
		createTextEditorDecorationType: vi.fn().mockReturnValue({ dispose: vi.fn() }),
	},
	workspace: {
		workspaceFolders: [
			{
				uri: {
					fsPath: "/mock/workspace",
				},
			},
		],
	},
}))
vi.mock("../../core/webview/ClineProvider")
describe("getVisibleProviderOrLog", () => {
	let mockOutputChannel
	beforeEach(() => {
		mockOutputChannel = {
			appendLine: vi.fn(),
			append: vi.fn(),
			clear: vi.fn(),
			hide: vi.fn(),
			name: "mock",
			replace: vi.fn(),
			show: vi.fn(),
			dispose: vi.fn(),
		}
		vi.clearAllMocks()
	})
	it("returns the visible provider if found", () => {
		const mockProvider = {}
		ClineProvider_1.ClineProvider.getVisibleInstance.mockReturnValue(mockProvider)
		const result = (0, registerCommands_1.getVisibleProviderOrLog)(mockOutputChannel)
		expect(result).toBe(mockProvider)
		expect(mockOutputChannel.appendLine).not.toHaveBeenCalled()
	})
	it("logs and returns undefined if no provider found", () => {
		ClineProvider_1.ClineProvider.getVisibleInstance.mockReturnValue(undefined)
		const result = (0, registerCommands_1.getVisibleProviderOrLog)(mockOutputChannel)
		expect(result).toBeUndefined()
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith("Cannot find any visible AliCode instances.")
	})
})
