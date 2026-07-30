"use strict"
// npx vitest run core/webview/__tests__/ClineProvider.lockApiConfig.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const ClineProvider_1 = require("../ClineProvider")
const ContextProxy_1 = require("../../config/ContextProxy")
vi.mock("vscode", () => ({
	ExtensionContext: vi.fn(),
	OutputChannel: vi.fn(),
	WebviewView: vi.fn(),
	Uri: {
		joinPath: vi.fn(),
		file: vi.fn(),
	},
	CodeActionKind: {
		QuickFix: { value: "quickfix" },
		RefactorRewrite: { value: "refactor.rewrite" },
	},
	commands: {
		executeCommand: vi.fn().mockResolvedValue(undefined),
	},
	window: {
		showInformationMessage: vi.fn(),
		showWarningMessage: vi.fn(),
		showErrorMessage: vi.fn(),
		onDidChangeActiveTextEditor: vi.fn(() => ({ dispose: vi.fn() })),
	},
	workspace: {
		getConfiguration: vi.fn().mockReturnValue({
			get: vi.fn().mockReturnValue([]),
			update: vi.fn(),
		}),
		onDidChangeConfiguration: vi.fn().mockImplementation(() => ({
			dispose: vi.fn(),
		})),
		onDidSaveTextDocument: vi.fn(() => ({ dispose: vi.fn() })),
		onDidChangeTextDocument: vi.fn(() => ({ dispose: vi.fn() })),
		onDidOpenTextDocument: vi.fn(() => ({ dispose: vi.fn() })),
		onDidCloseTextDocument: vi.fn(() => ({ dispose: vi.fn() })),
	},
	env: {
		uriScheme: "vscode",
		language: "en",
		appName: "Visual Studio Code",
	},
	ExtensionMode: {
		Production: 1,
		Development: 2,
		Test: 3,
	},
	version: "1.85.0",
}))
vi.mock("../../task/Task", () => ({
	Task: vi.fn().mockImplementation((options) => ({
		taskId: options.taskId || "test-task-id",
		saveClineMessages: vi.fn(),
		clineMessages: [],
		apiConversationHistory: [],
		overwriteClineMessages: vi.fn(),
		overwriteApiConversationHistory: vi.fn(),
		abortTask: vi.fn(),
		handleWebviewAskResponse: vi.fn(),
		getTaskNumber: vi.fn().mockReturnValue(0),
		setTaskNumber: vi.fn(),
		setParentTask: vi.fn(),
		setRootTask: vi.fn(),
		emit: vi.fn(),
		parentTask: options.parentTask,
		updateApiConfiguration: vi.fn(),
		setTaskApiConfigName: vi.fn(),
		_taskApiConfigName: options.historyItem?.apiConfigName,
		taskApiConfigName: options.historyItem?.apiConfigName,
	})),
}))
vi.mock("../../prompts/sections/custom-instructions")
vi.mock("../../../utils/safeWriteJson")
vi.mock("../../../api", () => ({
	buildApiHandler: vi.fn().mockReturnValue({
		getModel: vi.fn().mockReturnValue({
			id: "claude-3-sonnet",
		}),
	}),
}))
vi.mock("../../../integrations/workspace/WorkspaceTracker", () => ({
	default: vi.fn().mockImplementation(() => ({
		initializeFilePaths: vi.fn(),
		dispose: vi.fn(),
	})),
}))
vi.mock("../../diff/strategies/multi-search-replace", () => ({
	MultiSearchReplaceDiffStrategy: vi.fn().mockImplementation(() => ({
		getName: () => "test-strategy",
		applyDiff: vi.fn(),
	})),
}))
vi.mock("../../../shared/modes", () => {
	const mockModes = [
		{
			slug: "code",
			name: "Code Mode",
			roleDefinition: "You are a code assistant",
			groups: ["read", "edit"],
		},
		{
			slug: "architect",
			name: "Architect Mode",
			roleDefinition: "You are an architect",
			groups: ["read", "edit"],
		},
		{
			slug: "ask",
			name: "Ask Mode",
			roleDefinition: "You are an assistant",
			groups: ["read"],
		},
		{
			slug: "debug",
			name: "Debug Mode",
			roleDefinition: "You are a debugger",
			groups: ["read", "edit"],
		},
		{
			slug: "orchestrator",
			name: "Orchestrator Mode",
			roleDefinition: "You are an orchestrator",
			groups: [],
		},
	]
	return {
		modes: mockModes,
		getAllModes: vi.fn((customModes) => {
			if (!customModes?.length) {
				return [...mockModes]
			}
			const allModes = [...mockModes]
			customModes.forEach((cm) => {
				const idx = allModes.findIndex((m) => m.slug === cm.slug)
				if (idx !== -1) {
					allModes[idx] = cm
				} else {
					allModes.push(cm)
				}
			})
			return allModes
		}),
		getModeBySlug: vi.fn().mockReturnValue({
			slug: "code",
			name: "Code Mode",
			roleDefinition: "You are a code assistant",
			groups: ["read", "edit"],
		}),
		defaultModeSlug: "code",
	}
})
vi.mock("../../prompts/system", () => ({
	SYSTEM_PROMPT: vi.fn().mockResolvedValue("mocked system prompt"),
	codeMode: "code",
}))
vi.mock("../../../api/providers/fetchers/modelCache", () => ({
	getModels: vi.fn().mockResolvedValue({}),
	flushModels: vi.fn(),
}))
vi.mock("../../../integrations/misc/extract-text", () => ({
	extractTextFromFile: vi.fn().mockResolvedValue("Mock file content"),
}))
vi.mock("p-wait-for", () => ({
	default: vi.fn().mockImplementation(async () => Promise.resolve()),
}))
vi.mock("fs/promises", () => ({
	mkdir: vi.fn().mockResolvedValue(undefined),
	writeFile: vi.fn().mockResolvedValue(undefined),
	readFile: vi.fn().mockResolvedValue(""),
	unlink: vi.fn().mockResolvedValue(undefined),
	rmdir: vi.fn().mockResolvedValue(undefined),
}))
describe("ClineProvider - Lock API Config Across Modes", () => {
	let provider
	let mockContext
	let mockOutputChannel
	let mockWebviewView
	beforeEach(() => {
		vi.clearAllMocks()
		const globalState = {
			mode: "code",
			currentApiConfigName: "default-profile",
		}
		const workspaceState = {}
		const secrets = {}
		mockContext = {
			extensionPath: "/test/path",
			extensionUri: {},
			globalState: {
				get: vi.fn().mockImplementation((key) => globalState[key]),
				update: vi.fn().mockImplementation((key, value) => {
					globalState[key] = value
					return Promise.resolve()
				}),
				keys: vi.fn().mockImplementation(() => Object.keys(globalState)),
			},
			secrets: {
				get: vi.fn().mockImplementation((key) => secrets[key]),
				store: vi.fn().mockImplementation((key, value) => {
					secrets[key] = value
					return Promise.resolve()
				}),
				delete: vi.fn().mockImplementation((key) => {
					delete secrets[key]
					return Promise.resolve()
				}),
			},
			workspaceState: {
				get: vi.fn().mockImplementation((key, defaultValue) => {
					return key in workspaceState ? workspaceState[key] : defaultValue
				}),
				update: vi.fn().mockImplementation((key, value) => {
					workspaceState[key] = value
					return Promise.resolve()
				}),
				keys: vi.fn().mockImplementation(() => Object.keys(workspaceState)),
			},
			subscriptions: [],
			extension: {
				packageJSON: { version: "1.0.0" },
			},
			globalStorageUri: {
				fsPath: "/test/storage/path",
			},
		}
		mockOutputChannel = {
			appendLine: vi.fn(),
			clear: vi.fn(),
			dispose: vi.fn(),
		}
		const mockPostMessage = vi.fn()
		mockWebviewView = {
			webview: {
				postMessage: mockPostMessage,
				html: "",
				options: {},
				onDidReceiveMessage: vi.fn(),
				asWebviewUri: vi.fn(),
				cspSource: "vscode-webview://test-csp-source",
			},
			visible: true,
			onDidDispose: vi.fn().mockImplementation((callback) => {
				callback()
				return { dispose: vi.fn() }
			}),
			onDidChangeVisibility: vi.fn().mockImplementation(() => ({ dispose: vi.fn() })),
		}
		provider = new ClineProvider_1.ClineProvider(
			mockContext,
			mockOutputChannel,
			"sidebar",
			new ContextProxy_1.ContextProxy(mockContext),
		)
		// Mock getMcpHub method
		provider.getMcpHub = vi.fn().mockReturnValue({
			listTools: vi.fn().mockResolvedValue([]),
			callTool: vi.fn().mockResolvedValue({ content: [] }),
			listResources: vi.fn().mockResolvedValue([]),
			readResource: vi.fn().mockResolvedValue({ contents: [] }),
			getAllServers: vi.fn().mockReturnValue([]),
		})
	})
	describe("handleModeSwitch honors lockApiConfigAcrossModes as a read-time override", () => {
		beforeEach(async () => {
			await provider.resolveWebviewView(mockWebviewView)
		})
		it("skips mode-specific config lookup/load when lockApiConfigAcrossModes is true", async () => {
			await mockContext.workspaceState.update("lockApiConfigAcrossModes", true)
			const getModeConfigIdSpy = vi
				.spyOn(provider.providerSettingsManager, "getModeConfigId")
				.mockResolvedValue("architect-profile-id")
			const listConfigSpy = vi
				.spyOn(provider.providerSettingsManager, "listConfig")
				.mockResolvedValue([
					{ name: "architect-profile", id: "architect-profile-id", apiProvider: "anthropic" },
				])
			const activateProviderProfileSpy = vi
				.spyOn(provider, "activateProviderProfile")
				.mockResolvedValue(undefined)
			await provider.handleModeSwitch("architect")
			expect(getModeConfigIdSpy).not.toHaveBeenCalled()
			expect(listConfigSpy).not.toHaveBeenCalled()
			expect(activateProviderProfileSpy).not.toHaveBeenCalled()
		})
		it("keeps normal mode-specific lookup/load behavior when lockApiConfigAcrossModes is false", async () => {
			await mockContext.workspaceState.update("lockApiConfigAcrossModes", false)
			const getModeConfigIdSpy = vi
				.spyOn(provider.providerSettingsManager, "getModeConfigId")
				.mockResolvedValue("architect-profile-id")
			vi.spyOn(provider.providerSettingsManager, "listConfig").mockResolvedValue([
				{ name: "architect-profile", id: "architect-profile-id", apiProvider: "anthropic" },
			])
			vi.spyOn(provider.providerSettingsManager, "getProfile").mockResolvedValue({
				name: "architect-profile",
				apiProvider: "anthropic",
			})
			const activateProviderProfileSpy = vi
				.spyOn(provider, "activateProviderProfile")
				.mockResolvedValue(undefined)
			await provider.handleModeSwitch("architect")
			expect(getModeConfigIdSpy).toHaveBeenCalledWith("architect")
			expect(activateProviderProfileSpy).toHaveBeenCalledWith({ name: "architect-profile" })
		})
	})
})
