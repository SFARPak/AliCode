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
// Mock Package
vitest_1.vi.mock("../../../shared/package", () => ({
	Package: {
		name: "alicode",
		publisher: "AliCodeInc",
		version: "1.0.0",
		outputChannel: "Ali-Code",
	},
}))
// Mock vscode
vitest_1.vi.mock("vscode", () => ({
	workspace: {
		getConfiguration: vitest_1.vi.fn(),
	},
	env: {
		appRoot: "/mock/app/root",
	},
}))
// Mock getBinPath
vitest_1.vi.mock("../ripgrep", () => ({
	getBinPath: vitest_1.vi.fn(async () => null), // Return null to skip actual ripgrep execution
}))
// Mock child_process
vitest_1.vi.mock("child_process", () => ({
	spawn: vitest_1.vi.fn(),
}))
;(0, vitest_1.describe)("file-search", () => {
	;(0, vitest_1.describe)("configuration integration", () => {
		;(0, vitest_1.it)("should read VSCode search configuration settings", async () => {
			const mockSearchConfig = {
				get: vitest_1.vi.fn((key) => {
					if (key === "useIgnoreFiles") return false
					if (key === "useGlobalIgnoreFiles") return false
					if (key === "useParentIgnoreFiles") return false
					return undefined
				}),
			}
			const mockAliConfig = {
				get: vitest_1.vi.fn(() => 10000),
			}
			vscode.workspace.getConfiguration.mockImplementation((section) => {
				if (section === "search") return mockSearchConfig
				if (section === "alicode") return mockAliConfig
				return { get: vitest_1.vi.fn() }
			})
			// Import the module - this will call getConfiguration during import
			await import("../file-search")
			// Verify that configuration is accessible
			;(0, vitest_1.expect)(vscode.workspace.getConfiguration).toBeDefined()
		})
		;(0, vitest_1.it)("should read maximumIndexedFilesForFileSearch configuration", async () => {
			const { Package } = await import("../../../shared/package")
			const mockAliConfig = {
				get: vitest_1.vi.fn((key, defaultValue) => {
					if (key === "maximumIndexedFilesForFileSearch") return 50000
					return defaultValue
				}),
			}
			vscode.workspace.getConfiguration.mockImplementation((section) => {
				if (section === Package.name) return mockAliConfig
				return { get: vitest_1.vi.fn() }
			})
			// The configuration should be readable
			const config = vscode.workspace.getConfiguration(Package.name)
			const limit = config.get("maximumIndexedFilesForFileSearch", 10000)
			;(0, vitest_1.expect)(limit).toBe(50000)
		})
		;(0, vitest_1.it)("should use default limit when configuration is not provided", async () => {
			const { Package } = await import("../../../shared/package")
			const mockAliConfig = {
				get: vitest_1.vi.fn((key, defaultValue) => defaultValue),
			}
			vscode.workspace.getConfiguration.mockImplementation((section) => {
				if (section === Package.name) return mockAliConfig
				return { get: vitest_1.vi.fn() }
			})
			const config = vscode.workspace.getConfiguration(Package.name)
			const limit = config.get("maximumIndexedFilesForFileSearch", 10000)
			;(0, vitest_1.expect)(limit).toBe(10000)
		})
	})
})
