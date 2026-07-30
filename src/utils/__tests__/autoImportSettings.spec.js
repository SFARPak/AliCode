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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
// Mock dependencies
vi.mock("vscode", () => ({
	workspace: {
		getConfiguration: vi.fn(),
	},
	window: {
		showInformationMessage: vi.fn(),
		showWarningMessage: vi.fn(),
	},
}))
vi.mock("fs/promises", () => ({
	__esModule: true,
	default: {
		readFile: vi.fn(),
	},
	readFile: vi.fn(),
}))
vi.mock("path", async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		default: {
			...actual,
			join: vi.fn((...args) => args.join("/")),
			isAbsolute: vi.fn((p) => p.startsWith("/")),
			basename: vi.fn((p) => p.split("/").pop() || ""),
		},
		join: vi.fn((...args) => args.join("/")),
		isAbsolute: vi.fn((p) => p.startsWith("/")),
		basename: vi.fn((p) => p.split("/").pop() || ""),
	}
})
vi.mock("os", async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		default: {
			...actual,
			homedir: vi.fn(() => "/home/user"),
		},
		homedir: vi.fn(() => "/home/user"),
	}
})
vi.mock("../fs", () => ({
	fileExistsAtPath: vi.fn(),
}))
vi.mock("../../core/config/ProviderSettingsManager", async (importOriginal) => {
	const originalModule = await importOriginal()
	return {
		__esModule: true,
		// We need to mock the class constructor and its methods,
		// but keep other exports (like schemas) as their original values.
		...(originalModule || {}), // Spread original exports
		ProviderSettingsManager: vi.fn().mockImplementation(() => ({
			// Mock the class
			export: vi.fn().mockResolvedValue({
				apiConfigs: {},
				modeApiConfigs: {},
				currentApiConfigName: "default",
			}),
			import: vi.fn().mockResolvedValue({ success: true }),
			listConfig: vi.fn().mockResolvedValue([]),
		})),
	}
})
vi.mock("../../core/config/ContextProxy")
vi.mock("../../core/config/CustomModesManager")
const autoImportSettings_1 = require("../autoImportSettings")
const vscode = __importStar(require("vscode"))
const promises_1 = __importDefault(require("fs/promises"))
const fs_1 = require("../fs")
describe("autoImportSettings", () => {
	let mockProviderSettingsManager
	let mockContextProxy
	let mockCustomModesManager
	let mockOutputChannel
	let mockProvider
	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks()
		// Mock output channel
		mockOutputChannel = {
			appendLine: vi.fn(),
		}
		// Mock provider settings manager
		mockProviderSettingsManager = {
			export: vi.fn().mockResolvedValue({
				apiConfigs: {},
				modeApiConfigs: {},
				currentApiConfigName: "default",
			}),
			import: vi.fn().mockResolvedValue({ success: true }),
			listConfig: vi.fn().mockResolvedValue([]),
		}
		// Mock context proxy
		mockContextProxy = {
			setValues: vi.fn().mockResolvedValue(undefined),
			setValue: vi.fn().mockResolvedValue(undefined),
			setProviderSettings: vi.fn().mockResolvedValue(undefined),
		}
		// Mock custom modes manager
		mockCustomModesManager = {
			updateCustomMode: vi.fn().mockResolvedValue(undefined),
		}
		// mockProvider must be initialized AFTER its dependencies
		mockProvider = {
			providerSettingsManager: mockProviderSettingsManager,
			contextProxy: mockContextProxy,
			upsertProviderProfile: vi.fn().mockResolvedValue({ success: true }),
			postStateToWebview: vi.fn().mockResolvedValue({ success: true }),
		}
		// Reset fs mock
		vi.mocked(promises_1.default.readFile).mockReset()
		vi.mocked(fs_1.fileExistsAtPath).mockReset()
		vi.mocked(vscode.workspace.getConfiguration).mockReset()
		vi.mocked(vscode.window.showInformationMessage).mockReset()
		vi.mocked(vscode.window.showWarningMessage).mockReset()
	})
	afterEach(() => {
		vi.restoreAllMocks()
	})
	it("should skip auto-import when no settings path is specified", async () => {
		vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
			get: vi.fn().mockReturnValue(""),
		})
		await (0, autoImportSettings_1.autoImportSettings)(mockOutputChannel, {
			providerSettingsManager: mockProviderSettingsManager,
			contextProxy: mockContextProxy,
			customModesManager: mockCustomModesManager,
		})
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			"[AutoImport] No auto-import settings path specified, skipping auto-import",
		)
		expect(mockProviderSettingsManager.import).not.toHaveBeenCalled()
	})
	it("should skip auto-import when settings file does not exist", async () => {
		const settingsPath = "~/Documents/ali-config.json"
		vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
			get: vi.fn().mockReturnValue(settingsPath),
		})
		// Mock fileExistsAtPath to return false
		vi.mocked(fs_1.fileExistsAtPath).mockResolvedValue(false)
		await (0, autoImportSettings_1.autoImportSettings)(mockOutputChannel, {
			providerSettingsManager: mockProviderSettingsManager,
			contextProxy: mockContextProxy,
			customModesManager: mockCustomModesManager,
		})
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			"[AutoImport] Checking for settings file at: /home/user/Documents/ali-config.json",
		)
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			"[AutoImport] Settings file not found at /home/user/Documents/ali-config.json, skipping auto-import",
		)
		expect(mockProviderSettingsManager.import).not.toHaveBeenCalled()
	})
	it("should successfully import settings when file exists and is valid", async () => {
		const settingsPath = "/absolute/path/to/config.json"
		vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
			get: vi.fn().mockReturnValue(settingsPath),
		})
		// Mock fileExistsAtPath to return true
		vi.mocked(fs_1.fileExistsAtPath).mockResolvedValue(true)
		// Mock fs.readFile to return valid config
		const mockSettings = {
			providerProfiles: {
				currentApiConfigName: "test-config",
				apiConfigs: {
					"test-config": {
						apiProvider: "anthropic",
						anthropicApiKey: "test-key",
					},
				},
			},
			globalSettings: {
				customInstructions: "Test instructions",
			},
		}
		vi.mocked(promises_1.default.readFile).mockResolvedValue(JSON.stringify(mockSettings))
		await (0, autoImportSettings_1.autoImportSettings)(mockOutputChannel, {
			providerSettingsManager: mockProviderSettingsManager,
			contextProxy: mockContextProxy,
			customModesManager: mockCustomModesManager,
		})
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			"[AutoImport] Checking for settings file at: /absolute/path/to/config.json",
		)
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			"[AutoImport] Successfully imported settings from /absolute/path/to/config.json",
		)
		expect(vscode.window.showInformationMessage).toHaveBeenCalledWith("info.auto_import_success")
		expect(mockProviderSettingsManager.import).toHaveBeenCalled()
		expect(mockContextProxy.setValues).toHaveBeenCalled()
	})
	it("should handle invalid JSON gracefully", async () => {
		const settingsPath = "~/config.json"
		vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
			get: vi.fn().mockReturnValue(settingsPath),
		})
		// Mock fileExistsAtPath to return true
		vi.mocked(fs_1.fileExistsAtPath).mockResolvedValue(true)
		// Mock fs.readFile to return invalid JSON
		vi.mocked(promises_1.default.readFile).mockResolvedValue("invalid json")
		await (0, autoImportSettings_1.autoImportSettings)(mockOutputChannel, {
			providerSettingsManager: mockProviderSettingsManager,
			contextProxy: mockContextProxy,
			customModesManager: mockCustomModesManager,
		})
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			expect.stringContaining("[AutoImport] Failed to import settings:"),
		)
		expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
			expect.stringContaining("warnings.auto_import_failed"),
		)
		expect(mockProviderSettingsManager.import).not.toHaveBeenCalled()
	})
	it("should resolve home directory paths correctly", async () => {
		const settingsPath = "~/Documents/config.json"
		vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
			get: vi.fn().mockReturnValue(settingsPath),
		})
		// Mock fileExistsAtPath to return false (so we can check the resolved path)
		vi.mocked(fs_1.fileExistsAtPath).mockResolvedValue(false)
		await (0, autoImportSettings_1.autoImportSettings)(mockOutputChannel, {
			providerSettingsManager: mockProviderSettingsManager,
			contextProxy: mockContextProxy,
			customModesManager: mockCustomModesManager,
		})
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			"[AutoImport] Checking for settings file at: /home/user/Documents/config.json",
		)
	})
	it("should handle relative paths by resolving them to home directory", async () => {
		const settingsPath = "Documents/config.json"
		vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
			get: vi.fn().mockReturnValue(settingsPath),
		})
		// Mock fileExistsAtPath to return false (so we can check the resolved path)
		vi.mocked(fs_1.fileExistsAtPath).mockResolvedValue(false)
		await (0, autoImportSettings_1.autoImportSettings)(mockOutputChannel, {
			providerSettingsManager: mockProviderSettingsManager,
			contextProxy: mockContextProxy,
			customModesManager: mockCustomModesManager,
		})
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			"[AutoImport] Checking for settings file at: /home/user/Documents/config.json",
		)
	})
	it("should handle file system errors gracefully", async () => {
		const settingsPath = "~/config.json"
		vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
			get: vi.fn().mockReturnValue(settingsPath),
		})
		// Mock fileExistsAtPath to throw an error
		vi.mocked(fs_1.fileExistsAtPath).mockRejectedValue(new Error("File system error"))
		await (0, autoImportSettings_1.autoImportSettings)(mockOutputChannel, {
			providerSettingsManager: mockProviderSettingsManager,
			contextProxy: mockContextProxy,
			customModesManager: mockCustomModesManager,
		})
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			expect.stringContaining("[AutoImport] Unexpected error during auto-import:"),
		)
		expect(mockProviderSettingsManager.import).not.toHaveBeenCalled()
	})
})
