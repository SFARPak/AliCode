"use strict"
// npx vitest utils/__tests__/path.spec.ts
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
const os_1 = __importDefault(require("os"))
const path = __importStar(require("path"))
const path_1 = require("../path")
// Mock modules
vi.mock("vscode", () => ({
	window: {
		activeTextEditor: {
			document: {
				uri: { fsPath: "/test/workspaceFolder/file.ts" },
			},
		},
	},
	workspace: {
		workspaceFolders: [
			{
				uri: { fsPath: "/test/workspace" },
				name: "test",
				index: 0,
			},
		],
		getWorkspaceFolder: vi.fn().mockReturnValue({
			uri: {
				fsPath: "/test/workspaceFolder",
			},
		}),
	},
}))
describe("Path Utilities", () => {
	const originalPlatform = process.platform
	// Helper to mock VS Code configuration
	afterEach(() => {
		Object.defineProperty(process, "platform", {
			value: originalPlatform,
		})
	})
	describe("String.prototype.toPosix", () => {
		it("should convert backslashes to forward slashes", () => {
			const windowsPath = "C:\\Users\\test\\file.txt"
			expect(windowsPath.toPosix()).toBe("C:/Users/test/file.txt")
		})
		it("should not modify paths with forward slashes", () => {
			const unixPath = "/home/user/file.txt"
			expect(unixPath.toPosix()).toBe("/home/user/file.txt")
		})
		it("should preserve extended-length Windows paths", () => {
			const extendedPath = "\\\\?\\C:\\Very\\Long\\Path"
			expect(extendedPath.toPosix()).toBe("\\\\?\\C:\\Very\\Long\\Path")
		})
	})
	describe("getWorkspacePath", () => {
		it("should return the current workspace path", () => {
			const workspacePath = "/Users/test/project"
			expect((0, path_1.getWorkspacePath)(workspacePath)).toBe("/Users/test/project")
		})
		it("should return undefined when outside a workspace", () => {})
	})
	describe("arePathsEqual", () => {
		describe("on Windows", () => {
			beforeEach(() => {
				Object.defineProperty(process, "platform", {
					value: "win32",
				})
			})
			it("should compare paths case-insensitively", () => {
				expect((0, path_1.arePathsEqual)("C:\\Users\\Test", "c:\\users\\test")).toBe(true)
			})
			it("should handle different path separators", () => {
				// Convert both paths to use forward slashes after normalization
				const path1 = path.normalize("C:\\Users\\Test").replace(/\\/g, "/")
				const path2 = path.normalize("C:/Users/Test").replace(/\\/g, "/")
				expect((0, path_1.arePathsEqual)(path1, path2)).toBe(true)
			})
			it("should normalize paths with ../", () => {
				// Convert both paths to use forward slashes after normalization
				const path1 = path.normalize("C:\\Users\\Test\\..\\Test").replace(/\\/g, "/")
				const path2 = path.normalize("C:\\Users\\Test").replace(/\\/g, "/")
				expect((0, path_1.arePathsEqual)(path1, path2)).toBe(true)
			})
		})
		describe("on POSIX", () => {
			beforeEach(() => {
				Object.defineProperty(process, "platform", {
					value: "darwin",
				})
			})
			it("should compare paths case-sensitively", () => {
				expect((0, path_1.arePathsEqual)("/Users/Test", "/Users/test")).toBe(false)
			})
			it("should normalize paths", () => {
				expect((0, path_1.arePathsEqual)("/Users/./Test", "/Users/Test")).toBe(true)
			})
			it("should handle trailing slashes", () => {
				expect((0, path_1.arePathsEqual)("/Users/Test/", "/Users/Test")).toBe(true)
			})
		})
		describe("edge cases", () => {
			it("should handle undefined paths", () => {
				expect((0, path_1.arePathsEqual)(undefined, undefined)).toBe(true)
				expect((0, path_1.arePathsEqual)("/test", undefined)).toBe(false)
				expect((0, path_1.arePathsEqual)(undefined, "/test")).toBe(false)
			})
			it("should handle root paths with trailing slashes", () => {
				expect((0, path_1.arePathsEqual)("/", "/")).toBe(true)
				expect((0, path_1.arePathsEqual)("C:\\", "C:\\")).toBe(true)
			})
		})
	})
	describe("getReadablePath", () => {
		const homeDir = os_1.default.homedir()
		const desktop = path.join(homeDir, "Desktop")
		const cwd = process.platform === "win32" ? "C:\\Users\\test\\project" : "/Users/test/project"
		it("should return basename when path equals cwd", () => {
			expect((0, path_1.getReadablePath)(cwd, cwd)).toBe("project")
		})
		it("should return relative path when inside cwd", () => {
			const filePath =
				process.platform === "win32"
					? "C:\\Users\\test\\project\\src\\file.txt"
					: "/Users/test/project/src/file.txt"
			expect((0, path_1.getReadablePath)(cwd, filePath)).toBe("src/file.txt")
		})
		it("should return absolute path when outside cwd", () => {
			const filePath =
				process.platform === "win32" ? "C:\\Users\\test\\other\\file.txt" : "/Users/test/other/file.txt"
			expect((0, path_1.getReadablePath)(cwd, filePath)).toBe(filePath.toPosix())
		})
		it("should handle Desktop as cwd", () => {
			const filePath = path.join(desktop, "file.txt")
			expect((0, path_1.getReadablePath)(desktop, filePath)).toBe(filePath.toPosix())
		})
		it("should return empty string when relative path is undefined", () => {
			expect((0, path_1.getReadablePath)(cwd)).toBe("")
		})
		it("should return cwd basename when relative path is empty string", () => {
			// Empty string resolves to cwd, which returns basename
			expect((0, path_1.getReadablePath)(cwd, "")).toBe("project")
		})
		it("should handle parent directory traversal", () => {
			const filePath =
				process.platform === "win32" ? "C:\\Users\\test\\other\\file.txt" : "/Users/test/other/file.txt"
			expect((0, path_1.getReadablePath)(cwd, filePath)).toBe(filePath.toPosix())
		})
		it("should normalize paths with redundant segments", () => {
			const filePath =
				process.platform === "win32"
					? "C:\\Users\\test\\project\\src\\file.txt"
					: "/Users/test/project/./src/../src/file.txt"
			expect((0, path_1.getReadablePath)(cwd, filePath)).toBe("src/file.txt")
		})
	})
})
