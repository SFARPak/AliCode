"use strict"
// npx vitest run __tests__/extension.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
vi.mock("vscode", () => ({
	// Provide minimal VS Code API needed for tests, including StatusBarAlignment and createStatusBarItem.
	StatusBarAlignment: { Right: 1 },
	window: {
		createOutputChannel: vi.fn().mockReturnValue({
			appendLine: vi.fn(),
		}),
		// Stub for status bar item used by RemoteStatusService.
		createStatusBarItem: vi.fn().mockReturnValue({
			text: "",
			tooltip: "",
			color: null,
			show: vi.fn(),
			hide: vi.fn(),
			dispose: vi.fn(),
		}),
		registerWebviewViewProvider: vi.fn(),
		registerUriHandler: vi.fn(),
		// Mock registerWebviewPanelSerializer to prevent TypeError in tests
		registerWebviewPanelSerializer: vi.fn(),
		tabGroups: {
			onDidChangeTabs: vi.fn(),
		},
		onDidChangeActiveTextEditor: vi.fn(),
	},
	workspace: {
		registerTextDocumentContentProvider: vi.fn(),
		getConfiguration: vi.fn().mockReturnValue({
			get: vi.fn().mockReturnValue([]),
		}),
		createFileSystemWatcher: vi.fn().mockReturnValue({
			onDidCreate: vi.fn(),
			onDidChange: vi.fn(),
			onDidDelete: vi.fn(),
			dispose: vi.fn(),
		}),
		onDidChangeWorkspaceFolders: vi.fn(),
	},
	languages: {
		registerCodeActionsProvider: vi.fn(),
	},
	commands: {
		executeCommand: vi.fn(),
	},
	env: {
		language: "en",
	},
	ExtensionMode: {
		Production: 1,
	},
	// Add extensions mock to satisfy MarketplacePanelProvider usage
	extensions: {
		getExtension: vi.fn().mockReturnValue(undefined),
	},
}))
vi.mock("@dotenvx/dotenvx", () => ({
	config: vi.fn(),
}))
// Mock fs so the extension module can safely check for optional .env.
vi.mock("fs", () => ({
	existsSync: vi.fn().mockReturnValue(false),
}))
vi.mock("../utils/outputChannelLogger", () => ({
	createOutputChannelLogger: vi.fn().mockReturnValue(vi.fn()),
	createDualLogger: vi.fn().mockReturnValue(vi.fn()),
}))
vi.mock("../shared/package", () => ({
	Package: {
		name: "test-extension",
		outputChannel: "Test Output",
		version: "1.0.0",
	},
}))
vi.mock("../shared/language", () => ({
	formatLanguage: vi.fn().mockReturnValue("en"),
}))
vi.mock("../core/config/ContextProxy", () => ({
	ContextProxy: {
		getInstance: vi.fn().mockResolvedValue({
			getValue: vi.fn(),
			setValue: vi.fn(),
			getValues: vi.fn().mockReturnValue({}),
			getProviderSettings: vi.fn().mockReturnValue({}),
		}),
	},
}))
vi.mock("../integrations/editor/DiffViewProvider", () => ({
	DIFF_VIEW_URI_SCHEME: "test-diff-scheme",
}))
vi.mock("../integrations/terminal/TerminalRegistry", () => ({
	TerminalRegistry: {
		initialize: vi.fn(),
		cleanup: vi.fn(),
	},
}))
vi.mock("../services/mcp/McpServerManager", () => ({
	McpServerManager: {
		cleanup: vi.fn().mockResolvedValue(undefined),
		getInstance: vi.fn().mockResolvedValue(null),
		unregisterProvider: vi.fn(),
	},
}))
vi.mock("../services/code-index/manager", () => ({
	CodeIndexManager: {
		getInstance: vi.fn().mockReturnValue(null),
	},
}))
vi.mock("../utils/migrateSettings", () => ({
	migrateSettings: vi.fn().mockResolvedValue(undefined),
}))
vi.mock("../utils/autoImportSettings", () => ({
	autoImportSettings: vi.fn().mockResolvedValue(undefined),
}))
vi.mock("../extension/api", () => ({
	API: vi.fn().mockImplementation(() => ({})),
}))
vi.mock("../activate", () => {
	const commandsOrder = []
	return {
		handleUri: vi.fn(),
		registerCommands: vi.fn(() => {
			commandsOrder.push("registerCommands")
		}),
		registerCodeActions: vi.fn(() => {
			commandsOrder.push("registerCodeActions")
		}),
		registerTerminalActions: vi.fn(() => {
			commandsOrder.push("registerTerminalActions")
		}),
		CodeActionProvider: vi.fn().mockImplementation(() => ({
			providedCodeActionKinds: [],
		})),
		commandsOrder,
	}
})
vi.mock("../i18n", () => ({
	initializeI18n: vi.fn(),
	t: vi.fn((key) => key),
}))
// Mock ClineProvider
vi.mock("../core/webview/ClineProvider", async () => {
	const mockInstance = {
		resolveWebviewView: vi.fn(),
		postMessageToWebview: vi.fn(),
		postStateToWebview: vi.fn(),
		postStateToWebviewWithoutClineMessages: vi.fn(),
		getState: vi.fn().mockResolvedValue({}),
		initializeCloudProfileSyncWhenReady: vi.fn().mockResolvedValue(undefined),
		providerSettingsManager: {},
		contextProxy: { getGlobalState: vi.fn() },
		customModesManager: {},
		upsertProviderProfile: vi.fn().mockResolvedValue(undefined),
	}
	return {
		ClineProvider: Object.assign(
			vi.fn().mockImplementation(() => mockInstance),
			{
				// Static method used by extension.ts
				getVisibleInstance: vi.fn().mockReturnValue(mockInstance),
				sideBarId: "alicode-sidebar",
			},
		),
	}
})
// Mock modelCache to prevent network requests during module loading
vi.mock("../api/providers/fetchers/modelCache", () => ({
	getModels: vi.fn().mockResolvedValue([]),
	initializeModelCacheRefresh: vi.fn(),
}))
describe("extension.ts", () => {
	let mockContext
	beforeEach(() => {
		vi.clearAllMocks()
		mockContext = {
			extensionPath: "/test/path",
			globalState: {
				get: vi.fn().mockReturnValue(undefined),
				update: vi.fn(),
			},
			subscriptions: [],
		}
	})
	test("does not call dotenvx.config when optional .env does not exist", async () => {
		vi.resetModules()
		vi.clearAllMocks()
		const fs = await import("fs")
		vi.mocked(fs.existsSync).mockReturnValue(false)
		const dotenvx = await import("@dotenvx/dotenvx")
		const { activate } = await import("../extension")
		await activate(mockContext)
		expect(dotenvx.config).not.toHaveBeenCalled()
	})
	test("calls dotenvx.config when optional .env exists", async () => {
		vi.resetModules()
		vi.clearAllMocks()
		const fs = await import("fs")
		vi.mocked(fs.existsSync).mockReturnValue(true)
		const dotenvx = await import("@dotenvx/dotenvx")
		const { activate } = await import("../extension")
		await activate(mockContext)
		expect(dotenvx.config).toHaveBeenCalledTimes(1)
	})
	test("registers commands before invoking worktree auto-open command", async () => {
		vi.resetModules()
		vi.clearAllMocks()
		const fs = await import("fs")
		vi.mocked(fs.existsSync).mockReturnValue(false)
		const vscode = await import("vscode")
		// Simulate a worktree auto-open path being persisted from a previous
		// window, with the current workspace matching it.
		const mockGlobalState = {
			get: vi.fn().mockImplementation((key) => {
				if (key === "worktreeAutoOpenPath") {
					return "/fake/workspace"
				}
				return undefined
			}),
			update: vi.fn(),
		}
		mockContext.globalState = mockGlobalState
		// Stub workspace folders so checkWorktreeAutoOpen finds a match.
		const originalFolders = vscode.workspace.workspaceFolders
		vscode.workspace.workspaceFolders = [{ uri: { fsPath: "/fake/workspace" } }]
		// Capture executeCommand calls.
		const executeCommandCalls = []
		vscode.commands.executeCommand.mockImplementation(async (cmd) => {
			executeCommandCalls.push(cmd)
		})
		const { activate } = await import("../extension")
		await activate(mockContext)
		// checkWorktreeAutoOpen schedules the plusButtonClicked command via a
		// 500ms setTimeout, so wait for it to fire before asserting.
		await new Promise((resolve) => setTimeout(resolve, 600))
		// The plusButtonClicked command should be invoked with the dynamic
		// package name prefix (not a hardcoded "alicode." string).
		expect(executeCommandCalls).toContain("test-extension.plusButtonClicked")
		expect(executeCommandCalls).not.toContain("alicode.plusButtonClicked")
		// registerCommands must run before the worktree auto-open flow fires
		// the plusButtonClicked command — otherwise the command is unregistered.
		const { commandsOrder } = await import("../activate")
		expect(commandsOrder).toEqual(["registerCommands", "registerCodeActions", "registerTerminalActions"])
		// Restore.
		vscode.workspace.workspaceFolders = originalFolders
	})
})
