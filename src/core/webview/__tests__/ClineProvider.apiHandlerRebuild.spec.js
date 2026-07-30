"use strict"
// npx vitest core/webview/__tests__/ClineProvider.apiHandlerRebuild.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const types_1 = require("@ali-code/types")
const ContextProxy_1 = require("../../config/ContextProxy")
const Task_1 = require("../../task/Task")
const ClineProvider_1 = require("../ClineProvider")
// Mock setup
vi.mock("fs/promises", () => ({
	mkdir: vi.fn().mockResolvedValue(undefined),
	writeFile: vi.fn().mockResolvedValue(undefined),
	readFile: vi.fn().mockResolvedValue(""),
	unlink: vi.fn().mockResolvedValue(undefined),
	rmdir: vi.fn().mockResolvedValue(undefined),
}))
vi.mock("../../../utils/storage", () => ({
	getSettingsDirectoryPath: vi.fn().mockResolvedValue("/test/settings/path"),
	getTaskDirectoryPath: vi.fn().mockResolvedValue("/test/task/path"),
	getGlobalStoragePath: vi.fn().mockResolvedValue("/test/storage/path"),
}))
vi.mock("p-wait-for", () => ({
	__esModule: true,
	default: vi.fn().mockResolvedValue(undefined),
}))
vi.mock("delay", () => {
	const delayFn = (_ms) => Promise.resolve()
	delayFn.createDelay = () => delayFn
	delayFn.reject = () => Promise.reject(new Error("Delay rejected"))
	delayFn.range = () => Promise.resolve()
	return { default: delayFn }
})
vi.mock("vscode", () => ({
	ExtensionContext: vi.fn(),
	OutputChannel: vi.fn(),
	WebviewView: vi.fn(),
	Uri: {
		joinPath: vi.fn(),
		file: vi.fn(),
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
vi.mock("../../../utils/tts", () => ({
	setTtsEnabled: vi.fn(),
	setTtsSpeed: vi.fn(),
}))
vi.mock("../../../api", () => ({
	buildApiHandler: vi.fn(),
}))
vi.mock("../../../integrations/workspace/WorkspaceTracker", () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			initializeFilePaths: vi.fn(),
			dispose: vi.fn(),
		})),
	}
})
vi.mock("../../task/Task", () => ({
	Task: vi.fn().mockImplementation((options) => {
		const mockTask = {
			api: undefined,
			abortTask: vi.fn(),
			handleWebviewAskResponse: vi.fn(),
			clineMessages: [],
			apiConversationHistory: [],
			overwriteClineMessages: vi.fn(),
			overwriteApiConversationHistory: vi.fn(),
			taskId: options?.historyItem?.id || "test-task-id",
			emit: vi.fn(),
			updateApiConfiguration: vi.fn().mockImplementation(function (newConfig) {
				this.apiConfiguration = newConfig
			}),
		}
		// Define apiConfiguration as a property so tests can read it
		Object.defineProperty(mockTask, "apiConfiguration", {
			value: options?.apiConfiguration || { apiProvider: "openrouter", openRouterModelId: "openai/gpt-4" },
			writable: true,
			configurable: true,
		})
		return mockTask
	}),
}))
describe("ClineProvider - API Handler Rebuild Guard", () => {
	let provider
	let mockContext
	let mockOutputChannel
	let mockWebviewView
	let mockPostMessage
	let defaultTaskOptions
	let buildApiHandlerMock
	beforeEach(async () => {
		vi.clearAllMocks()
		const globalState = {
			mode: "code",
			currentApiConfigName: "test-config",
		}
		const secrets = {}
		mockContext = {
			extensionPath: "/test/path",
			extensionUri: {},
			globalState: {
				get: vi.fn().mockImplementation((key) => globalState[key]),
				update: vi.fn().mockImplementation((key, value) => (globalState[key] = value)),
				keys: vi.fn().mockImplementation(() => Object.keys(globalState)),
			},
			secrets: {
				get: vi.fn().mockImplementation((key) => secrets[key]),
				store: vi.fn().mockImplementation((key, value) => (secrets[key] = value)),
				delete: vi.fn().mockImplementation((key) => delete secrets[key]),
			},
			workspaceState: {
				get: vi.fn().mockReturnValue(undefined),
				update: vi.fn().mockResolvedValue(undefined),
				keys: vi.fn().mockReturnValue([]),
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
		mockPostMessage = vi.fn()
		mockWebviewView = {
			webview: {
				postMessage: mockPostMessage,
				html: "",
				options: {},
				onDidReceiveMessage: vi.fn(),
				asWebviewUri: vi.fn(),
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
		provider.providerSettingsManager = {
			saveConfig: vi.fn().mockResolvedValue("test-id"),
			listConfig: vi
				.fn()
				.mockResolvedValue([
					{ name: "test-config", id: "test-id", apiProvider: "openrouter", modelId: "openai/gpt-4" },
				]),
			setModeConfig: vi.fn(),
			activateProfile: vi.fn().mockResolvedValue({
				name: "test-config",
				id: "test-id",
				apiProvider: "openrouter",
				openRouterModelId: "openai/gpt-4",
			}),
			getProfile: vi.fn().mockResolvedValue({
				name: "test-config",
				id: "test-id",
				apiProvider: "openrouter",
				openRouterModelId: "openai/gpt-4",
			}),
		}
		// Get the buildApiHandler mock
		const { buildApiHandler } = await import("../../../api")
		buildApiHandlerMock = vi.mocked(buildApiHandler)
		// Setup default mock implementation
		buildApiHandlerMock.mockReturnValue({
			getModel: vi.fn().mockReturnValue({
				id: "openai/gpt-4",
				info: { contextWindow: 128000 },
			}),
		})
		defaultTaskOptions = {
			provider,
			apiConfiguration: {
				apiProvider: "openrouter",
				openRouterModelId: "openai/gpt-4",
			},
		}
		await provider.resolveWebviewView(mockWebviewView)
	})
	describe("upsertProviderProfile", () => {
		test("calls updateApiConfiguration when provider/model unchanged but profile settings changed (explicit save)", async () => {
			// Create a task with the current config
			const mockTask = new Task_1.Task({
				...defaultTaskOptions,
				apiConfiguration: {
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
				},
			})
			mockTask.api = {
				getModel: vi.fn().mockReturnValue({
					id: "openai/gpt-4",
					info: { contextWindow: 128000 },
				}),
			}
			await provider.addClineToStack(mockTask)
			// Save settings with SAME provider and model (simulating Save button click)
			await provider.upsertProviderProfile(
				"test-config",
				{
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
					// Other settings that might change
					rateLimitSeconds: 5,
					modelTemperature: 0.7,
				},
				true,
			)
			// Verify updateApiConfiguration was called because we force rebuild on explicit save/switch
			expect(mockTask.updateApiConfiguration).toHaveBeenCalledWith(
				expect.objectContaining({
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
					rateLimitSeconds: 5,
					modelTemperature: 0.7,
				}),
			)
			// Verify task.apiConfiguration was synchronized
			expect(mockTask.apiConfiguration.openRouterModelId).toBe("openai/gpt-4")
			expect(mockTask.apiConfiguration.rateLimitSeconds).toBe(5)
			expect(mockTask.apiConfiguration.modelTemperature).toBe(0.7)
		})
		test("calls updateApiConfiguration when provider changes", async () => {
			const mockTask = new Task_1.Task({
				...defaultTaskOptions,
				apiConfiguration: {
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
				},
			})
			mockTask.api = {
				getModel: vi.fn().mockReturnValue({
					id: "openai/gpt-4",
					info: { contextWindow: 128000 },
				}),
			}
			await provider.addClineToStack(mockTask)
			// Change provider to anthropic
			await provider.upsertProviderProfile(
				"test-config",
				{
					apiProvider: "anthropic",
					apiModelId: "claude-3-5-sonnet-20241022",
				},
				true,
			)
			// Verify updateApiConfiguration was called since provider changed
			expect(mockTask.updateApiConfiguration).toHaveBeenCalledWith(
				expect.objectContaining({
					apiProvider: "anthropic",
					apiModelId: "claude-3-5-sonnet-20241022",
				}),
			)
		})
		test("calls updateApiConfiguration when model changes", async () => {
			const mockTask = new Task_1.Task({
				...defaultTaskOptions,
				apiConfiguration: {
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
				},
			})
			mockTask.api = {
				getModel: vi.fn().mockReturnValue({
					id: "openai/gpt-4",
					info: { contextWindow: 128000 },
				}),
			}
			await provider.addClineToStack(mockTask)
			// Change model to different model
			await provider.upsertProviderProfile(
				"test-config",
				{
					apiProvider: "openrouter",
					openRouterModelId: "anthropic/claude-3-5-sonnet-20241022",
				},
				true,
			)
			// Verify updateApiConfiguration was called since model changed
			expect(mockTask.updateApiConfiguration).toHaveBeenCalledWith(
				expect.objectContaining({
					apiProvider: "openrouter",
					openRouterModelId: "anthropic/claude-3-5-sonnet-20241022",
				}),
			)
		})
		test("does nothing when no task is running", async () => {
			// Don't add any task to stack
			buildApiHandlerMock.mockClear()
			await provider.upsertProviderProfile(
				"test-config",
				{
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
				},
				true,
			)
			// Should not call buildApiHandler when there's no task
			expect(buildApiHandlerMock).not.toHaveBeenCalled()
		})
	})
	describe("activateProviderProfile", () => {
		test("calls updateApiConfiguration when provider/model unchanged but settings differ (explicit profile switch)", async () => {
			const mockTask = new Task_1.Task({
				...defaultTaskOptions,
				apiConfiguration: {
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
					modelTemperature: 0.3,
				},
			})
			mockTask.api = {
				getModel: vi.fn().mockReturnValue({
					id: "openai/gpt-4",
					info: { contextWindow: 128000 },
				}),
			}
			await provider.addClineToStack(mockTask)
			provider.providerSettingsManager.activateProfile = vi.fn().mockResolvedValue({
				name: "test-config",
				id: "test-id",
				apiProvider: "openrouter",
				openRouterModelId: "openai/gpt-4",
				modelTemperature: 0.9,
				rateLimitSeconds: 7,
			})
			await provider.activateProviderProfile({ name: "test-config" })
			// Verify updateApiConfiguration was called due to forced rebuild on explicit switch
			expect(mockTask.updateApiConfiguration).toHaveBeenCalledWith(
				expect.objectContaining({
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
				}),
			)
			// Verify task.apiConfiguration was synchronized
			expect(mockTask.apiConfiguration.openRouterModelId).toBe("openai/gpt-4")
			expect(mockTask.apiConfiguration.modelTemperature).toBe(0.9)
			expect(mockTask.apiConfiguration.rateLimitSeconds).toBe(7)
		})
		test("calls updateApiConfiguration when provider changes and syncs task.apiConfiguration", async () => {
			const mockTask = new Task_1.Task({
				...defaultTaskOptions,
				apiConfiguration: {
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
				},
			})
			mockTask.api = {
				getModel: vi.fn().mockReturnValue({
					id: "openai/gpt-4",
					info: { contextWindow: 128000 },
				}),
			}
			await provider.addClineToStack(mockTask)
			provider.providerSettingsManager.activateProfile = vi.fn().mockResolvedValue({
				name: "anthropic-config",
				id: "anthropic-id",
				apiProvider: "anthropic",
				apiModelId: "claude-3-5-sonnet-20241022",
			})
			await provider.activateProviderProfile({ name: "anthropic-config" })
			// Verify updateApiConfiguration was called
			expect(mockTask.updateApiConfiguration).toHaveBeenCalledWith(
				expect.objectContaining({
					apiProvider: "anthropic",
					apiModelId: "claude-3-5-sonnet-20241022",
				}),
			)
			// And task.apiConfiguration synced
			expect(mockTask.apiConfiguration.apiProvider).toBe("anthropic")
			expect(mockTask.apiConfiguration.apiModelId).toBe("claude-3-5-sonnet-20241022")
		})
		test("calls updateApiConfiguration when model changes and syncs task.apiConfiguration", async () => {
			const mockTask = new Task_1.Task({
				...defaultTaskOptions,
				apiConfiguration: {
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
				},
			})
			mockTask.api = {
				getModel: vi.fn().mockReturnValue({
					id: "openai/gpt-4",
					info: { contextWindow: 128000 },
				}),
			}
			await provider.addClineToStack(mockTask)
			provider.providerSettingsManager.activateProfile = vi.fn().mockResolvedValue({
				name: "test-config",
				id: "test-id",
				apiProvider: "openrouter",
				openRouterModelId: "anthropic/claude-3-5-sonnet-20241022",
			})
			await provider.activateProviderProfile({ name: "test-config" })
			// Verify updateApiConfiguration was called
			expect(mockTask.updateApiConfiguration).toHaveBeenCalledWith(
				expect.objectContaining({
					apiProvider: "openrouter",
					openRouterModelId: "anthropic/claude-3-5-sonnet-20241022",
				}),
			)
			// And task.apiConfiguration synced
			expect(mockTask.apiConfiguration.apiProvider).toBe("openrouter")
			expect(mockTask.apiConfiguration.openRouterModelId).toBe("anthropic/claude-3-5-sonnet-20241022")
		})
	})
	describe("profile switching sequence", () => {
		test("A -> B -> A updates task.apiConfiguration each time", async () => {
			const mockTask = new Task_1.Task({
				...defaultTaskOptions,
				apiConfiguration: {
					apiProvider: "openrouter",
					openRouterModelId: "openai/gpt-4",
				},
			})
			mockTask.api = {
				getModel: vi.fn().mockReturnValue({
					id: "openai/gpt-4",
					info: { contextWindow: 128000 },
				}),
			}
			await provider.addClineToStack(mockTask)
			provider.providerSettingsManager.activateProfile = vi.fn().mockResolvedValue({
				name: "anthropic-config",
				id: "anthropic-id",
				apiProvider: "anthropic",
				apiModelId: "claude-3-5-sonnet-20241022",
			})
			await provider.activateProviderProfile({ name: "anthropic-config" })
			expect(mockTask.updateApiConfiguration).toHaveBeenCalled()
			expect(mockTask.apiConfiguration.apiProvider).toBe("anthropic")
			expect(mockTask.apiConfiguration.apiModelId).toBe("claude-3-5-sonnet-20241022")
			mockTask.updateApiConfiguration.mockClear()
			provider.providerSettingsManager.activateProfile = vi.fn().mockResolvedValue({
				name: "test-config",
				id: "test-id",
				apiProvider: "openrouter",
				openRouterModelId: "openai/gpt-4",
			})
			await provider.activateProviderProfile({ name: "test-config" })
			// updateApiConfiguration called again, and apiConfiguration must be updated
			expect(mockTask.updateApiConfiguration).toHaveBeenCalled()
			expect(mockTask.apiConfiguration.apiProvider).toBe("openrouter")
			expect(mockTask.apiConfiguration.openRouterModelId).toBe("openai/gpt-4")
		})
	})
	describe("getModelId helper", () => {
		test("correctly extracts model ID from different provider configurations", () => {
			expect((0, types_1.getModelId)({ apiProvider: "openrouter", openRouterModelId: "openai/gpt-4" })).toBe(
				"openai/gpt-4",
			)
			expect(
				(0, types_1.getModelId)({ apiProvider: "anthropic", apiModelId: "claude-3-5-sonnet-20241022" }),
			).toBe("claude-3-5-sonnet-20241022")
			expect((0, types_1.getModelId)({ apiProvider: "openai", openAiModelId: "gpt-4-turbo" })).toBe("gpt-4-turbo")
			expect((0, types_1.getModelId)({ apiProvider: "bedrock", apiModelId: "anthropic.claude-v2" })).toBe(
				"anthropic.claude-v2",
			)
		})
		test("returns undefined when no model ID is present", () => {
			expect((0, types_1.getModelId)({ apiProvider: "anthropic" })).toBeUndefined()
			expect((0, types_1.getModelId)({})).toBeUndefined()
		})
	})
})
