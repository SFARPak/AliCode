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
const vitest_1 = require("vitest")
const vscode = __importStar(require("vscode"))
const os_1 = require("os")
const shell_1 = require("../shell")
// Mock vscode module
vitest_1.vi.mock("vscode", () => ({
	workspace: {
		getConfiguration: vitest_1.vi.fn(),
	},
}))
// Mock the os module
vitest_1.vi.mock("os", () => ({
	userInfo: vitest_1.vi.fn(() => ({ shell: null })),
}))
// Mock path module for testing
vitest_1.vi.mock("path", async () => {
	const actual = await vitest_1.vi.importActual("path")
	return {
		...actual,
		normalize: vitest_1.vi.fn((p) => p),
	}
})
;(0, vitest_1.describe)("Shell Detection Tests", () => {
	let originalPlatform
	let originalEnv
	let originalGetConfig
	// Helper to mock VS Code configuration
	function mockVsCodeConfig(platformKey, defaultProfileName, profiles) {
		vscode.workspace.getConfiguration = () => ({
			get: (key) => {
				if (key === `defaultProfile.${platformKey}`) {
					return defaultProfileName
				}
				if (key === `profiles.${platformKey}`) {
					return profiles
				}
				return undefined
			},
		})
	}
	;(0, vitest_1.beforeEach)(() => {
		// Store original references
		originalPlatform = process.platform
		originalEnv = { ...process.env }
		originalGetConfig = vscode.workspace.getConfiguration
		// Clear environment variables for a clean test
		delete process.env.SHELL
		delete process.env.COMSPEC
		// Reset userInfo mock to default
		vitest_1.vi.mocked(os_1.userInfo).mockReturnValue({ shell: null })
	})
	;(0, vitest_1.afterEach)(() => {
		// Restore everything
		Object.defineProperty(process, "platform", { value: originalPlatform })
		process.env = originalEnv
		vscode.workspace.getConfiguration = originalGetConfig
		vitest_1.vi.clearAllMocks()
	})
	// --------------------------------------------------------------------------
	// Windows Shell Detection
	// --------------------------------------------------------------------------
	;(0, vitest_1.describe)("Windows Shell Detection", () => {
		;(0, vitest_1.beforeEach)(() => {
			Object.defineProperty(process, "platform", { value: "win32" })
		})
		;(0, vitest_1.it)("uses explicit PowerShell 7 path from VS Code config (profile path)", () => {
			mockVsCodeConfig("windows", "PowerShell", {
				PowerShell: { path: "C:\\Program Files\\PowerShell\\7\\pwsh.exe" },
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("C:\\Program Files\\PowerShell\\7\\pwsh.exe")
		})
		;(0, vitest_1.it)("should handle array path from VSCode terminal profile", () => {
			// Mock VSCode configuration with array path
			const mockConfig = {
				get: vitest_1.vi.fn((key) => {
					if (key === "defaultProfile.windows") return "PowerShell"
					if (key === "profiles.windows") {
						return {
							PowerShell: {
								// VSCode API may return path as an array
								path: ["C:\\Program Files\\PowerShell\\7\\pwsh.exe", "pwsh.exe"],
							},
						}
					}
					return undefined
				}),
			}
			vitest_1.vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig)
			const result = (0, shell_1.getShell)()
			// Should use the first element of the array
			;(0, vitest_1.expect)(result).toBe("C:\\Program Files\\PowerShell\\7\\pwsh.exe")
		})
		;(0, vitest_1.it)("should handle empty array path and fall back to defaults", () => {
			// Mock VSCode configuration with empty array path
			const mockConfig = {
				get: vitest_1.vi.fn((key) => {
					if (key === "defaultProfile.windows") return "Custom"
					if (key === "profiles.windows") {
						return {
							Custom: {
								path: [], // Empty array
							},
						}
					}
					return undefined
				}),
			}
			vitest_1.vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig)
			// Mock environment variable
			process.env.COMSPEC = "C:\\Windows\\System32\\cmd.exe"
			const result = (0, shell_1.getShell)()
			// Should fall back to cmd.exe
			;(0, vitest_1.expect)(result).toBe("C:\\Windows\\System32\\cmd.exe")
		})
		;(0, vitest_1.it)("uses PowerShell 7 path if source is 'PowerShell' but no explicit path", () => {
			mockVsCodeConfig("windows", "PowerShell", {
				PowerShell: { source: "PowerShell" },
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("C:\\Program Files\\PowerShell\\7\\pwsh.exe")
		})
		;(0, vitest_1.it)("falls back to legacy PowerShell if profile includes 'powershell' but no path/source", () => {
			mockVsCodeConfig("windows", "PowerShell", {
				PowerShell: {},
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe(
				"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
			)
		})
		;(0, vitest_1.it)("uses WSL bash when profile indicates WSL source", () => {
			mockVsCodeConfig("windows", "WSL", {
				WSL: { source: "WSL" },
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/bin/bash")
		})
		;(0, vitest_1.it)("uses WSL bash when profile name includes 'wsl'", () => {
			mockVsCodeConfig("windows", "Ubuntu WSL", {
				"Ubuntu WSL": {},
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/bin/bash")
		})
		;(0, vitest_1.it)("defaults to cmd.exe if no special profile is matched", () => {
			mockVsCodeConfig("windows", "CommandPrompt", {
				CommandPrompt: {},
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("C:\\Windows\\System32\\cmd.exe")
		})
		;(0, vitest_1.it)("handles undefined profile gracefully", () => {
			// Mock a case where defaultProfileName exists but the profile doesn't
			mockVsCodeConfig("windows", "NonexistentProfile", {})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("C:\\Windows\\System32\\cmd.exe")
		})
		;(0, vitest_1.it)("respects userInfo() if no VS Code config is available and shell is allowed", () => {
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			vitest_1.vi.mocked(os_1.userInfo).mockReturnValue({ shell: "C:\\Program Files\\PowerShell\\7\\pwsh.exe" })
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("C:\\Program Files\\PowerShell\\7\\pwsh.exe")
		})
		;(0, vitest_1.it)("falls back to safe shell when userInfo() returns non-allowlisted shell", () => {
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			vitest_1.vi.mocked(os_1.userInfo).mockReturnValue({ shell: "C:\\Custom\\PowerShell.exe" })
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("C:\\Windows\\System32\\cmd.exe")
		})
		;(0, vitest_1.it)("falls back to safe shell when COMSPEC is non-allowlisted", () => {
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			process.env.COMSPEC = "D:\\CustomCmd\\cmd.exe"
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("C:\\Windows\\System32\\cmd.exe")
		})
	})
	// --------------------------------------------------------------------------
	// macOS Shell Detection
	// --------------------------------------------------------------------------
	;(0, vitest_1.describe)("macOS Shell Detection", () => {
		;(0, vitest_1.beforeEach)(() => {
			Object.defineProperty(process, "platform", { value: "darwin" })
		})
		;(0, vitest_1.it)("uses VS Code profile path if available", () => {
			mockVsCodeConfig("osx", "MyCustomShell", {
				MyCustomShell: { path: "/usr/local/bin/fish" },
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/usr/local/bin/fish")
		})
		;(0, vitest_1.it)("should handle array path from VSCode terminal profile", () => {
			// Mock VSCode configuration with array path
			const mockConfig = {
				get: vitest_1.vi.fn((key) => {
					if (key === "defaultProfile.osx") return "zsh"
					if (key === "profiles.osx") {
						return {
							zsh: {
								path: ["/opt/homebrew/bin/zsh", "/bin/zsh"],
							},
						}
					}
					return undefined
				}),
			}
			vitest_1.vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig)
			const result = (0, shell_1.getShell)()
			// Should use the first element of the array
			;(0, vitest_1.expect)(result).toBe("/opt/homebrew/bin/zsh")
		})
		;(0, vitest_1.it)("falls back to userInfo().shell if no VS Code config is available", () => {
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			vitest_1.vi.mocked(os_1.userInfo).mockReturnValue({ shell: "/opt/homebrew/bin/zsh" })
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/opt/homebrew/bin/zsh")
		})
		;(0, vitest_1.it)("falls back to SHELL env var if no userInfo shell is found", () => {
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			process.env.SHELL = "/usr/local/bin/zsh"
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/usr/local/bin/zsh")
		})
		;(0, vitest_1.it)("falls back to /bin/zsh if no config, userInfo, or env variable is set", () => {
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/bin/zsh")
		})
	})
	// --------------------------------------------------------------------------
	// Linux Shell Detection
	// --------------------------------------------------------------------------
	;(0, vitest_1.describe)("Linux Shell Detection", () => {
		;(0, vitest_1.beforeEach)(() => {
			Object.defineProperty(process, "platform", { value: "linux" })
		})
		;(0, vitest_1.it)("uses VS Code profile path if available", () => {
			mockVsCodeConfig("linux", "CustomProfile", {
				CustomProfile: { path: "/usr/bin/fish" },
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/usr/bin/fish")
		})
		;(0, vitest_1.it)("should handle array path from VSCode terminal profile", () => {
			// Mock VSCode configuration with array path
			const mockConfig = {
				get: vitest_1.vi.fn((key) => {
					if (key === "defaultProfile.linux") return "bash"
					if (key === "profiles.linux") {
						return {
							bash: {
								path: ["/usr/local/bin/bash", "/bin/bash"],
							},
						}
					}
					return undefined
				}),
			}
			vitest_1.vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig)
			const result = (0, shell_1.getShell)()
			// Should use the first element of the array
			;(0, vitest_1.expect)(result).toBe("/usr/local/bin/bash")
		})
		;(0, vitest_1.it)("falls back to userInfo().shell if no VS Code config is available", () => {
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			vitest_1.vi.mocked(os_1.userInfo).mockReturnValue({ shell: "/usr/bin/zsh" })
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/usr/bin/zsh")
		})
		;(0, vitest_1.it)("falls back to SHELL env var if no userInfo shell is found", () => {
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			process.env.SHELL = "/usr/bin/fish"
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/usr/bin/fish")
		})
		;(0, vitest_1.it)("falls back to /bin/bash if nothing is set", () => {
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/bin/bash")
		})
	})
	// --------------------------------------------------------------------------
	// Unknown Platform & Error Handling
	// --------------------------------------------------------------------------
	;(0, vitest_1.describe)("Unknown Platform / Error Handling", () => {
		;(0, vitest_1.it)("falls back to /bin/bash for unknown platforms", () => {
			Object.defineProperty(process, "platform", { value: "sunos" })
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/bin/bash")
		})
		;(0, vitest_1.it)("handles VS Code config errors gracefully, falling back to userInfo shell if present", () => {
			Object.defineProperty(process, "platform", { value: "linux" })
			vscode.workspace.getConfiguration = () => {
				throw new Error("Configuration error")
			}
			vitest_1.vi.mocked(os_1.userInfo).mockReturnValue({ shell: "/bin/bash" })
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/bin/bash")
		})
		;(0, vitest_1.it)("handles userInfo errors gracefully, falling back to environment variable if present", () => {
			Object.defineProperty(process, "platform", { value: "darwin" })
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			vitest_1.vi.mocked(os_1.userInfo).mockImplementation(() => {
				throw new Error("userInfo error")
			})
			process.env.SHELL = "/bin/zsh"
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/bin/zsh")
		})
		;(0, vitest_1.it)("falls back fully to default shell paths if everything fails", () => {
			Object.defineProperty(process, "platform", { value: "linux" })
			vscode.workspace.getConfiguration = () => {
				throw new Error("Configuration error")
			}
			vitest_1.vi.mocked(os_1.userInfo).mockImplementation(() => {
				throw new Error("userInfo error")
			})
			delete process.env.SHELL
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/bin/bash")
		})
	})
	// --------------------------------------------------------------------------
	// Shell Validation Tests
	// --------------------------------------------------------------------------
	;(0, vitest_1.describe)("Shell Validation", () => {
		;(0, vitest_1.it)("should allow common Windows shells", () => {
			Object.defineProperty(process, "platform", { value: "win32" })
			mockVsCodeConfig("windows", "PowerShell", {
				PowerShell: { path: "C:\\Program Files\\PowerShell\\7\\pwsh.exe" },
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("C:\\Program Files\\PowerShell\\7\\pwsh.exe")
		})
		;(0, vitest_1.it)("should allow common Unix shells", () => {
			Object.defineProperty(process, "platform", { value: "linux" })
			mockVsCodeConfig("linux", "CustomProfile", {
				CustomProfile: { path: "/usr/bin/fish" },
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/usr/bin/fish")
		})
		;(0, vitest_1.it)("should handle case-insensitive matching on Windows", () => {
			Object.defineProperty(process, "platform", { value: "win32" })
			mockVsCodeConfig("windows", "PowerShell", {
				PowerShell: { path: "c:\\windows\\system32\\cmd.exe" },
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("c:\\windows\\system32\\cmd.exe")
		})
		;(0, vitest_1.it)("should reject unknown shells and use fallback", () => {
			Object.defineProperty(process, "platform", { value: "linux" })
			mockVsCodeConfig("linux", "CustomProfile", {
				CustomProfile: { path: "/usr/bin/malicious-shell" },
			})
			;(0, vitest_1.expect)((0, shell_1.getShell)()).toBe("/bin/bash")
		})
		;(0, vitest_1.it)("should validate array shell paths and use first allowed", () => {
			Object.defineProperty(process, "platform", { value: "win32" })
			const mockConfig = {
				get: vitest_1.vi.fn((key) => {
					if (key === "defaultProfile.windows") return "PowerShell"
					if (key === "profiles.windows") {
						return {
							PowerShell: {
								path: ["C:\\Program Files\\PowerShell\\7\\pwsh.exe", "pwsh"],
							},
						}
					}
					return undefined
				}),
			}
			vitest_1.vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig)
			const result = (0, shell_1.getShell)()
			// Should return the first allowed shell from the array
			;(0, vitest_1.expect)(result).toBe("C:\\Program Files\\PowerShell\\7\\pwsh.exe")
		})
		;(0, vitest_1.it)("should reject non-allowed shell paths and fall back to safe defaults", () => {
			Object.defineProperty(process, "platform", { value: "win32" })
			const mockConfig = {
				get: vitest_1.vi.fn((key) => {
					if (key === "defaultProfile.windows") return "Malicious"
					if (key === "profiles.windows") {
						return {
							Malicious: {
								path: "C:\\malicious\\shell.exe",
							},
						}
					}
					return undefined
				}),
			}
			vitest_1.vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig)
			// Mock environment to provide a fallback
			process.env.COMSPEC = "C:\\Windows\\System32\\cmd.exe"
			const result = (0, shell_1.getShell)()
			// Should fall back to safe default (cmd.exe)
			;(0, vitest_1.expect)(result).toBe("C:\\Windows\\System32\\cmd.exe")
		})
		;(0, vitest_1.it)("should validate shells from VS Code config", () => {
			Object.defineProperty(process, "platform", { value: "darwin" })
			mockVsCodeConfig("osx", "MyCustomShell", {
				MyCustomShell: { path: "/usr/local/bin/custom-shell" },
			})
			const result = (0, shell_1.getShell)()
			;(0, vitest_1.expect)(result).toBe("/bin/zsh") // macOS fallback
		})
		;(0, vitest_1.it)("should validate shells from userInfo", () => {
			Object.defineProperty(process, "platform", { value: "linux" })
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			vitest_1.vi.mocked(os_1.userInfo).mockReturnValue({ shell: "/usr/bin/evil-shell" })
			const result = (0, shell_1.getShell)()
			;(0, vitest_1.expect)(result).toBe("/bin/bash") // Linux fallback
		})
		;(0, vitest_1.it)("should validate shells from environment variables", () => {
			Object.defineProperty(process, "platform", { value: "linux" })
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			vitest_1.vi.mocked(os_1.userInfo).mockReturnValue({ shell: null })
			process.env.SHELL = "/opt/custom/shell"
			const result = (0, shell_1.getShell)()
			;(0, vitest_1.expect)(result).toBe("/bin/bash") // Linux fallback
		})
		;(0, vitest_1.it)("should handle WSL bash correctly", () => {
			Object.defineProperty(process, "platform", { value: "win32" })
			mockVsCodeConfig("windows", "WSL", {
				WSL: { source: "WSL" },
			})
			const result = (0, shell_1.getShell)()
			;(0, vitest_1.expect)(result).toBe("/bin/bash") // Should be allowed
		})
		;(0, vitest_1.it)("should handle empty or null shell paths", () => {
			Object.defineProperty(process, "platform", { value: "linux" })
			vscode.workspace.getConfiguration = () => ({ get: () => undefined })
			vitest_1.vi.mocked(os_1.userInfo).mockReturnValue({ shell: "" })
			delete process.env.SHELL
			const result = (0, shell_1.getShell)()
			;(0, vitest_1.expect)(result).toBe("/bin/bash") // Should fall back to safe default
		})
	})
})
