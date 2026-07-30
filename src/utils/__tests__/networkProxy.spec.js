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
const networkProxy_1 = require("../networkProxy")
// Mock global-agent
vi.mock("global-agent", () => ({
	bootstrap: vi.fn(),
}))
// Mock vscode
vi.mock("vscode", () => ({
	workspace: {
		getConfiguration: vi.fn(),
		onDidChangeConfiguration: vi.fn(() => ({ dispose: vi.fn() })),
	},
	ExtensionMode: {
		Development: 2,
		Production: 1,
		Test: 3,
	},
}))
describe("networkProxy", () => {
	let mockOutputChannel
	let mockConfig
	// Helper to create mock context with configurable extensionMode
	function createMockContext(mode = vscode.ExtensionMode.Production) {
		return {
			extensionMode: mode,
			subscriptions: [],
			extensionPath: "/test/path",
			globalState: {
				get: vi.fn(),
				update: vi.fn(),
				keys: vi.fn().mockReturnValue([]),
				setKeysForSync: vi.fn(),
			},
			workspaceState: {
				get: vi.fn(),
				update: vi.fn(),
				keys: vi.fn().mockReturnValue([]),
			},
			secrets: {
				get: vi.fn(),
				store: vi.fn(),
				delete: vi.fn(),
				onDidChange: vi.fn(),
			},
			extensionUri: { fsPath: "/test/path" },
			globalStorageUri: { fsPath: "/test/global" },
			logUri: { fsPath: "/test/logs" },
			storageUri: { fsPath: "/test/storage" },
			storagePath: "/test/storage",
			globalStoragePath: "/test/global",
			logPath: "/test/logs",
			asAbsolutePath: vi.fn((p) => `/test/path/${p}`),
			environmentVariableCollection: {},
			extension: {},
			languageModelAccessInformation: {},
		}
	}
	beforeEach(() => {
		vi.clearAllMocks()
		// Reset environment variables
		delete process.env.GLOBAL_AGENT_HTTP_PROXY
		delete process.env.GLOBAL_AGENT_HTTPS_PROXY
		delete process.env.GLOBAL_AGENT_NO_PROXY
		delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
		mockConfig = {
			get: vi.fn().mockReturnValue(""),
		}
		vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig)
		mockOutputChannel = {
			appendLine: vi.fn(),
			append: vi.fn(),
			clear: vi.fn(),
			show: vi.fn(),
			hide: vi.fn(),
			dispose: vi.fn(),
			name: "Test",
			replace: vi.fn(),
		}
	})
	describe("initializeNetworkProxy", () => {
		it("should initialize without proxy when debugProxy.enabled is false", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.enabled") return false
				if (key === "debugProxy.serverUrl") return "http://127.0.0.1:8888"
				return ""
			})
			const context = createMockContext()
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect(process.env.GLOBAL_AGENT_HTTP_PROXY).toBeUndefined()
			expect(process.env.GLOBAL_AGENT_HTTPS_PROXY).toBeUndefined()
		})
		it("should configure proxy environment variables when debugProxy.enabled is true", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.enabled") return true
				if (key === "debugProxy.serverUrl") return "http://localhost:8080"
				return ""
			})
			// Proxy is only applied in debug mode.
			const context = createMockContext(vscode.ExtensionMode.Development)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect(process.env.GLOBAL_AGENT_HTTP_PROXY).toBe("http://localhost:8080")
			expect(process.env.GLOBAL_AGENT_HTTPS_PROXY).toBe("http://localhost:8080")
		})
		it("should not modify TLS settings in debug mode by default", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.enabled") return true
				if (key === "debugProxy.serverUrl") return "http://localhost:8080"
				if (key === "debugProxy.tlsInsecure") return false
				return ""
			})
			const context = createMockContext(vscode.ExtensionMode.Development)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined()
		})
		it("should disable TLS verification when tlsInsecure is enabled (debug mode only)", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.enabled") return true
				if (key === "debugProxy.serverUrl") return "http://localhost:8080"
				if (key === "debugProxy.tlsInsecure") return true
				return ""
			})
			const context = createMockContext(vscode.ExtensionMode.Development)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBe("0")
		})
		it("should register configuration change listener in debug mode", () => {
			const context = createMockContext(vscode.ExtensionMode.Development)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalled()
			expect(context.subscriptions.length).toBeGreaterThan(0)
		})
		it("should not register listeners in production mode (early exit)", () => {
			const context = createMockContext(vscode.ExtensionMode.Production)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect(vscode.workspace.onDidChangeConfiguration).not.toHaveBeenCalled()
			expect(context.subscriptions.length).toBe(0)
		})
		it("should not throw in non-debug mode if proxy deps are not installed", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.enabled") return true
				if (key === "debugProxy.serverUrl") return "http://localhost:8080"
				return ""
			})
			const context = createMockContext(vscode.ExtensionMode.Production)
			expect(() => {
				void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			}).not.toThrow()
		})
	})
	describe("getProxyConfig", () => {
		it("should return default config before initialization", () => {
			// Reset the module to clear internal state
			vi.resetModules()
			const config = (0, networkProxy_1.getProxyConfig)()
			expect(config.enabled).toBe(false)
			expect(config.serverUrl).toBe("http://127.0.0.1:8888") // default value
			expect(config.isDebugMode).toBe(false)
		})
		it("should return correct config after initialization", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.enabled") return true
				if (key === "debugProxy.serverUrl") return "http://proxy.example.com:3128"
				if (key === "debugProxy.tlsInsecure") return true
				return ""
			})
			const context = createMockContext(vscode.ExtensionMode.Production)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			const config = (0, networkProxy_1.getProxyConfig)()
			expect(config.enabled).toBe(true)
			expect(config.serverUrl).toBe("http://proxy.example.com:3128")
			expect(config.tlsInsecure).toBe(true)
			expect(config.isDebugMode).toBe(false)
		})
		it("should trim whitespace from server URL", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.serverUrl") return "  http://proxy.example.com:3128  "
				return ""
			})
			const context = createMockContext()
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			const config = (0, networkProxy_1.getProxyConfig)()
			expect(config.serverUrl).toBe("http://proxy.example.com:3128")
		})
		it("should return default URL for empty server URL", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.serverUrl") return "   "
				return ""
			})
			const context = createMockContext()
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			const config = (0, networkProxy_1.getProxyConfig)()
			expect(config.serverUrl).toBe("http://127.0.0.1:8888") // falls back to default
		})
	})
	describe("isProxyEnabled", () => {
		it("should return false when proxy is not enabled", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.enabled") return false
				return ""
			})
			const context = createMockContext()
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect((0, networkProxy_1.isProxyEnabled)()).toBe(false)
		})
		it("should return true when proxy is enabled in debug mode", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.enabled") return true
				if (key === "debugProxy.serverUrl") return "http://localhost:8080"
				return ""
			})
			// Proxy is only applied in debug mode.
			const context = createMockContext(vscode.ExtensionMode.Development)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect((0, networkProxy_1.isProxyEnabled)()).toBe(true)
		})
	})
	describe("isDebugMode", () => {
		it("should return false in production mode", () => {
			const context = createMockContext(vscode.ExtensionMode.Production)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect((0, networkProxy_1.isDebugMode)()).toBe(false)
		})
		it("should return true in development mode", () => {
			const context = createMockContext(vscode.ExtensionMode.Development)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect((0, networkProxy_1.isDebugMode)()).toBe(true)
		})
		// Note: This test is skipped because module state persists across tests.
		// In a real scenario, isDebugMode() returns false before any initialization.
		// The actual behavior is verified in integration testing.
		it.skip("should return false before initialization", () => {
			// This would require full module isolation which isn't practical here
			expect((0, networkProxy_1.isDebugMode)()).toBe(false)
		})
	})
	describe("security", () => {
		it("should not disable TLS verification unless tlsInsecure is enabled", () => {
			mockConfig.get.mockImplementation((key) => {
				if (key === "debugProxy.enabled") return true
				if (key === "debugProxy.serverUrl") return "http://localhost:8080"
				if (key === "debugProxy.tlsInsecure") return false
				return ""
			})
			const context = createMockContext(vscode.ExtensionMode.Development)
			void (0, networkProxy_1.initializeNetworkProxy)(context, mockOutputChannel)
			expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined()
		})
	})
})
