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
const path = __importStar(require("path"))
// Use vi.hoisted to ensure mocks are available during hoisting
const { mockStat, mockReadFile, mockHomedir, mockExecuteRipgrep } = vi.hoisted(() => ({
	mockStat: vi.fn(),
	mockReadFile: vi.fn(),
	mockHomedir: vi.fn(),
	mockExecuteRipgrep: vi.fn(),
}))
// Mock fs/promises module
vi.mock("fs/promises", () => ({
	default: {
		stat: mockStat,
		readFile: mockReadFile,
	},
}))
// Mock os module
vi.mock("os", () => ({
	homedir: mockHomedir,
}))
// Mock executeRipgrep from search service
vi.mock("../../search/file-search", () => ({
	executeRipgrep: mockExecuteRipgrep,
}))
const index_1 = require("../index")
describe("AliConfigService", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockHomedir.mockReturnValue("/mock/home")
	})
	afterEach(() => {
		vi.restoreAllMocks()
	})
	describe("getGlobalAliDirectory", () => {
		it("should return correct path for global .roo directory", () => {
			const result = (0, index_1.getGlobalAliDirectory)()
			expect(result).toBe(path.join("/mock/home", ".ali"))
		})
		it("should handle different home directories", () => {
			mockHomedir.mockReturnValue("/different/home")
			const result = (0, index_1.getGlobalAliDirectory)()
			expect(result).toBe(path.join("/different/home", ".ali"))
		})
	})
	describe("getProjectAliDirectoryForCwd", () => {
		it("should return correct path for given cwd", () => {
			const cwd = "/custom/project/path"
			const result = (0, index_1.getProjectAliDirectoryForCwd)(cwd)
			expect(result).toBe(path.join(cwd, ".ali"))
		})
	})
	describe("getGlobalAgentsDirectory", () => {
		it("should return correct path for global .agents directory", () => {
			const result = (0, index_1.getGlobalAgentsDirectory)()
			expect(result).toBe(path.join("/mock/home", ".agents"))
		})
		it("should handle different home directories", () => {
			mockHomedir.mockReturnValue("/different/home")
			const result = (0, index_1.getGlobalAgentsDirectory)()
			expect(result).toBe(path.join("/different/home", ".agents"))
		})
	})
	describe("getProjectAgentsDirectoryForCwd", () => {
		it("should return correct path for given cwd", () => {
			const cwd = "/custom/project/path"
			const result = (0, index_1.getProjectAgentsDirectoryForCwd)(cwd)
			expect(result).toBe(path.join(cwd, ".agents"))
		})
	})
	describe("directoryExists", () => {
		it("should return true for existing directory", async () => {
			mockStat.mockResolvedValue({ isDirectory: () => true })
			const result = await (0, index_1.directoryExists)("/some/path")
			expect(result).toBe(true)
			expect(mockStat).toHaveBeenCalledWith("/some/path")
		})
		it("should return false for non-existing path", async () => {
			const error = new Error("ENOENT")
			error.code = "ENOENT"
			mockStat.mockRejectedValue(error)
			const result = await (0, index_1.directoryExists)("/non/existing/path")
			expect(result).toBe(false)
		})
		it("should return false for ENOTDIR error", async () => {
			const error = new Error("ENOTDIR")
			error.code = "ENOTDIR"
			mockStat.mockRejectedValue(error)
			const result = await (0, index_1.directoryExists)("/not/a/directory")
			expect(result).toBe(false)
		})
		it("should throw unexpected errors", async () => {
			const error = new Error("Permission denied")
			error.code = "EACCES"
			mockStat.mockRejectedValue(error)
			await expect((0, index_1.directoryExists)("/permission/denied")).rejects.toThrow("Permission denied")
		})
		it("should return false for files", async () => {
			mockStat.mockResolvedValue({ isDirectory: () => false })
			const result = await (0, index_1.directoryExists)("/some/file.txt")
			expect(result).toBe(false)
		})
	})
	describe("fileExists", () => {
		it("should return true for existing file", async () => {
			mockStat.mockResolvedValue({ isFile: () => true })
			const result = await (0, index_1.fileExists)("/some/file.txt")
			expect(result).toBe(true)
			expect(mockStat).toHaveBeenCalledWith("/some/file.txt")
		})
		it("should return false for non-existing file", async () => {
			const error = new Error("ENOENT")
			error.code = "ENOENT"
			mockStat.mockRejectedValue(error)
			const result = await (0, index_1.fileExists)("/non/existing/file.txt")
			expect(result).toBe(false)
		})
		it("should return false for ENOTDIR error", async () => {
			const error = new Error("ENOTDIR")
			error.code = "ENOTDIR"
			mockStat.mockRejectedValue(error)
			const result = await (0, index_1.fileExists)("/not/a/directory/file.txt")
			expect(result).toBe(false)
		})
		it("should throw unexpected errors", async () => {
			const error = new Error("Permission denied")
			error.code = "EACCES"
			mockStat.mockRejectedValue(error)
			await expect((0, index_1.fileExists)("/permission/denied/file.txt")).rejects.toThrow("Permission denied")
		})
		it("should return false for directories", async () => {
			mockStat.mockResolvedValue({ isFile: () => false })
			const result = await (0, index_1.fileExists)("/some/directory")
			expect(result).toBe(false)
		})
	})
	describe("readFileIfExists", () => {
		it("should return file content for existing file", async () => {
			mockReadFile.mockResolvedValue("file content")
			const result = await (0, index_1.readFileIfExists)("/some/file.txt")
			expect(result).toBe("file content")
			expect(mockReadFile).toHaveBeenCalledWith("/some/file.txt", "utf-8")
		})
		it("should return null for non-existing file", async () => {
			const error = new Error("ENOENT")
			error.code = "ENOENT"
			mockReadFile.mockRejectedValue(error)
			const result = await (0, index_1.readFileIfExists)("/non/existing/file.txt")
			expect(result).toBe(null)
		})
		it("should return null for ENOTDIR error", async () => {
			const error = new Error("ENOTDIR")
			error.code = "ENOTDIR"
			mockReadFile.mockRejectedValue(error)
			const result = await (0, index_1.readFileIfExists)("/not/a/directory/file.txt")
			expect(result).toBe(null)
		})
		it("should return null for EISDIR error", async () => {
			const error = new Error("EISDIR")
			error.code = "EISDIR"
			mockReadFile.mockRejectedValue(error)
			const result = await (0, index_1.readFileIfExists)("/is/a/directory")
			expect(result).toBe(null)
		})
		it("should throw unexpected errors", async () => {
			const error = new Error("Permission denied")
			error.code = "EACCES"
			mockReadFile.mockRejectedValue(error)
			await expect((0, index_1.readFileIfExists)("/permission/denied/file.txt")).rejects.toThrow(
				"Permission denied",
			)
		})
	})
	describe("getAliDirectoriesForCwd", () => {
		it("should return directories for given cwd", () => {
			const cwd = "/custom/project/path"
			const result = (0, index_1.getAliDirectoriesForCwd)(cwd)
			expect(result).toEqual([path.join("/mock/home", ".ali"), path.join(cwd, ".ali")])
		})
	})
	describe("loadConfiguration", () => {
		it("should load global configuration only when project does not exist", async () => {
			const error = new Error("ENOENT")
			error.code = "ENOENT"
			mockReadFile.mockResolvedValueOnce("global content").mockRejectedValueOnce(error)
			const result = await (0, index_1.loadConfiguration)("rules/rules.md", "/project/path")
			expect(result).toEqual({
				global: "global content",
				project: null,
				merged: "global content",
			})
		})
		it("should load project configuration only when global does not exist", async () => {
			const error = new Error("ENOENT")
			error.code = "ENOENT"
			mockReadFile.mockRejectedValueOnce(error).mockResolvedValueOnce("project content")
			const result = await (0, index_1.loadConfiguration)("rules/rules.md", "/project/path")
			expect(result).toEqual({
				global: null,
				project: "project content",
				merged: "project content",
			})
		})
		it("should merge global and project configurations with project overriding global", async () => {
			mockReadFile.mockResolvedValueOnce("global content").mockResolvedValueOnce("project content")
			const result = await (0, index_1.loadConfiguration)("rules/rules.md", "/project/path")
			expect(result).toEqual({
				global: "global content",
				project: "project content",
				merged: "global content\n\n# Project-specific rules (override global):\n\nproject content",
			})
		})
		it("should return empty merged content when neither exists", async () => {
			const error = new Error("ENOENT")
			error.code = "ENOENT"
			mockReadFile.mockRejectedValueOnce(error).mockRejectedValueOnce(error)
			const result = await (0, index_1.loadConfiguration)("rules/rules.md", "/project/path")
			expect(result).toEqual({
				global: null,
				project: null,
				merged: "",
			})
		})
		it("should propagate unexpected errors from global file read", async () => {
			const error = new Error("Permission denied")
			error.code = "EACCES"
			mockReadFile.mockRejectedValueOnce(error)
			await expect((0, index_1.loadConfiguration)("rules/rules.md", "/project/path")).rejects.toThrow(
				"Permission denied",
			)
		})
		it("should propagate unexpected errors from project file read", async () => {
			const globalError = new Error("ENOENT")
			globalError.code = "ENOENT"
			const projectError = new Error("Permission denied")
			projectError.code = "EACCES"
			mockReadFile.mockRejectedValueOnce(globalError).mockRejectedValueOnce(projectError)
			await expect((0, index_1.loadConfiguration)("rules/rules.md", "/project/path")).rejects.toThrow(
				"Permission denied",
			)
		})
		it("should use correct file paths", async () => {
			mockReadFile.mockResolvedValue("content")
			await (0, index_1.loadConfiguration)("rules/rules.md", "/project/path")
			expect(mockReadFile).toHaveBeenCalledWith(path.join("/mock/home", ".ali", "rules/rules.md"), "utf-8")
			expect(mockReadFile).toHaveBeenCalledWith(path.join("/project/path", ".ali", "rules/rules.md"), "utf-8")
		})
	})
	describe("discoverSubfolderAliDirectories", () => {
		it("should return empty array when no subfolder .roo directories found", async () => {
			mockExecuteRipgrep.mockResolvedValue([])
			const result = await (0, index_1.discoverSubfolderAliDirectories)("/project/path")
			expect(result).toEqual([])
		})
		it("should discover .roo directories from subfolders", async () => {
			// Find any file inside .roo directories
			mockExecuteRipgrep.mockResolvedValueOnce([
				{ path: "package-a/.ali/rules/rule.md", type: "file" },
				{ path: "package-b/.ali/rules-code/rule.md", type: "file" },
			])
			const result = await (0, index_1.discoverSubfolderAliDirectories)("/project/path")
			expect(result).toEqual([
				path.join("/project/path", "package-a", ".ali"),
				path.join("/project/path", "package-b", ".ali"),
			])
		})
		it("should sort discovered directories alphabetically", async () => {
			mockExecuteRipgrep.mockResolvedValueOnce([
				{ path: "zebra/.ali/rules/rule.md", type: "file" },
				{ path: "apple/.ali/rules/rule.md", type: "file" },
				{ path: "mango/.ali/rules/rule.md", type: "file" },
			])
			const result = await (0, index_1.discoverSubfolderAliDirectories)("/project/path")
			expect(result).toEqual([
				path.join("/project/path", "apple", ".ali"),
				path.join("/project/path", "mango", ".ali"),
				path.join("/project/path", "zebra", ".ali"),
			])
		})
		it("should exclude root .roo directory", async () => {
			// This would match the root .roo, which should be excluded
			mockExecuteRipgrep.mockResolvedValueOnce([
				{ path: ".ali/rules/rule.md", type: "file" }, // This is root - should be excluded
				{ path: "subfolder/.ali/rules/rule.md", type: "file" },
			])
			const result = await (0, index_1.discoverSubfolderAliDirectories)("/project/path")
			// Should only include subfolder, not root
			expect(result).toEqual([path.join("/project/path", "subfolder", ".ali")])
		})
		it("should handle nested subdirectories", async () => {
			mockExecuteRipgrep.mockResolvedValueOnce([
				{ path: "packages/core/.ali/rules/rule.md", type: "file" },
				{ path: "packages/utils/.ali/rules-code/rule.md", type: "file" },
			])
			const result = await (0, index_1.discoverSubfolderAliDirectories)("/project/path")
			expect(result).toEqual([
				path.join("/project/path", "packages/core", ".ali"),
				path.join("/project/path", "packages/utils", ".ali"),
			])
		})
		it("should return empty array on ripgrep error", async () => {
			mockExecuteRipgrep.mockRejectedValue(new Error("ripgrep failed"))
			const result = await (0, index_1.discoverSubfolderAliDirectories)("/project/path")
			expect(result).toEqual([])
		})
		it("should deduplicate .roo directories from multiple files", async () => {
			mockExecuteRipgrep.mockResolvedValueOnce([
				{ path: "package-a/.ali/rules/rule1.md", type: "file" },
				{ path: "package-a/.ali/rules/rule2.md", type: "file" },
				{ path: "package-a/.ali/rules-code/rule3.md", type: "file" },
			])
			const result = await (0, index_1.discoverSubfolderAliDirectories)("/project/path")
			// Should only include package-a/.roo once
			expect(result).toEqual([path.join("/project/path", "package-a", ".ali")])
		})
		it("should discover .roo directories with any content", async () => {
			// Should find .roo directories regardless of what's inside them
			mockExecuteRipgrep.mockResolvedValueOnce([
				{ path: "package-a/.ali/rules/rule.md", type: "file" },
				{ path: "package-b/.ali/rules-code/code-rule.md", type: "file" },
				{ path: "package-c/.ali/rules-architect/arch-rule.md", type: "file" },
				{ path: "package-d/.ali/config/settings.json", type: "file" },
			])
			const result = await (0, index_1.discoverSubfolderAliDirectories)("/project/path")
			expect(result).toEqual([
				path.join("/project/path", "package-a", ".ali"),
				path.join("/project/path", "package-b", ".ali"),
				path.join("/project/path", "package-c", ".ali"),
				path.join("/project/path", "package-d", ".ali"),
			])
		})
	})
	describe("getAllAliDirectoriesForCwd", () => {
		it("should return global, project, and subfolder directories", async () => {
			mockExecuteRipgrep.mockResolvedValueOnce([{ path: "subfolder/.ali/rules/rule.md", type: "file" }])
			const result = await (0, index_1.getAllAliDirectoriesForCwd)("/project/path")
			expect(result).toEqual([
				path.join("/mock/home", ".ali"), // global
				path.join("/project/path", ".ali"), // project
				path.join("/project/path", "subfolder", ".ali"), // subfolder
			])
		})
		it("should return only global and project when no subfolders", async () => {
			mockExecuteRipgrep.mockResolvedValue([])
			const result = await (0, index_1.getAllAliDirectoriesForCwd)("/project/path")
			expect(result).toEqual([path.join("/mock/home", ".ali"), path.join("/project/path", ".ali")])
		})
		it("should maintain order: global, project, subfolders (alphabetically)", async () => {
			mockExecuteRipgrep.mockResolvedValueOnce([
				{ path: "zebra/.ali/rules/rule.md", type: "file" },
				{ path: "apple/.ali/rules/rule.md", type: "file" },
			])
			const result = await (0, index_1.getAllAliDirectoriesForCwd)("/project/path")
			expect(result).toEqual([
				path.join("/mock/home", ".ali"), // global first
				path.join("/project/path", ".ali"), // project second
				path.join("/project/path", "apple", ".ali"), // subfolders alphabetically
				path.join("/project/path", "zebra", ".ali"),
			])
		})
	})
	describe("getAgentsDirectoriesForCwd", () => {
		it("should return root directory and parent directories of subfolder .roo dirs", async () => {
			mockExecuteRipgrep.mockResolvedValueOnce([{ path: "package-a/.ali/rules/rule.md", type: "file" }])
			const result = await (0, index_1.getAgentsDirectoriesForCwd)("/project/path")
			expect(result).toEqual([
				"/project/path", // root
				path.join("/project/path", "package-a"), // parent of .roo
			])
		})
		it("should always include root even when no subfolders", async () => {
			mockExecuteRipgrep.mockResolvedValue([])
			const result = await (0, index_1.getAgentsDirectoriesForCwd)("/project/path")
			expect(result).toEqual(["/project/path"])
		})
		it("should include multiple subfolder parent directories", async () => {
			mockExecuteRipgrep.mockResolvedValueOnce([
				{ path: "package-a/.ali/rules/rule.md", type: "file" },
				{ path: "package-b/.ali/rules-code/rule.md", type: "file" },
				{ path: "packages/core/.ali/rules/rule.md", type: "file" },
			])
			const result = await (0, index_1.getAgentsDirectoriesForCwd)("/project/path")
			expect(result).toEqual([
				"/project/path",
				path.join("/project/path", "package-a"),
				path.join("/project/path", "package-b"),
				path.join("/project/path", "packages/core"),
			])
		})
	})
})
