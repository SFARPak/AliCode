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
const {
	mockHomedir,
	mockStat,
	mockReadFile,
	mockReaddir,
	mockLstat,
	mockGetAliDirectoriesForCwd,
	mockGetAllAliDirectoriesForCwd,
	mockGetAgentsDirectoriesForCwd,
	mockGetGlobalAliDirectory,
} = vi.hoisted(() => ({
	mockHomedir: vi.fn(),
	mockStat: vi.fn(),
	mockReadFile: vi.fn(),
	mockReaddir: vi.fn(),
	mockLstat: vi.fn(),
	mockGetAliDirectoriesForCwd: vi.fn(),
	mockGetAllAliDirectoriesForCwd: vi.fn(),
	mockGetAgentsDirectoriesForCwd: vi.fn(),
	mockGetGlobalAliDirectory: vi.fn(),
}))
// Mock os module
vi.mock("os", () => ({
	default: {
		homedir: mockHomedir,
	},
	homedir: mockHomedir,
}))
// Mock fs/promises
vi.mock("fs/promises", () => ({
	default: {
		stat: mockStat,
		readFile: mockReadFile,
		readdir: mockReaddir,
		lstat: mockLstat,
	},
}))
// Mock the ali-config service
vi.mock("../../../../services/ali-config", () => ({
	getAliDirectoriesForCwd: mockGetAliDirectoriesForCwd,
	getAllAliDirectoriesForCwd: mockGetAllAliDirectoriesForCwd,
	getAgentsDirectoriesForCwd: mockGetAgentsDirectoriesForCwd,
	getGlobalAliDirectory: mockGetGlobalAliDirectory,
}))
const custom_instructions_1 = require("../custom-instructions")
describe("custom-instructions global .roo support", () => {
	const mockCwd = "/mock/project"
	const mockHomeDir = "/mock/home"
	const globalAliDir = path.join(mockHomeDir, ".ali")
	const projectAliDir = path.join(mockCwd, ".ali")
	beforeEach(() => {
		vi.clearAllMocks()
		mockHomedir.mockReturnValue(mockHomeDir)
		mockGetAliDirectoriesForCwd.mockReturnValue([globalAliDir, projectAliDir])
		// getAllAliDirectoriesForCwd is now async and returns the same directories by default
		mockGetAllAliDirectoriesForCwd.mockResolvedValue([globalAliDir, projectAliDir])
		// getAgentsDirectoriesForCwd returns parent directories (without .roo)
		mockGetAgentsDirectoriesForCwd.mockResolvedValue([mockCwd])
		mockGetGlobalAliDirectory.mockReturnValue(globalAliDir)
		// Default lstat to reject (file not found)
		mockLstat.mockRejectedValue(new Error("ENOENT"))
	})
	afterEach(() => {
		vi.restoreAllMocks()
	})
	describe("loadRuleFiles", () => {
		it("should load global rules only when project rules do not exist", async () => {
			// Mock directory existence checks in order:
			// 1. Check if global rules dir exists
			// 2. Check if project rules dir doesn't exist
			mockStat
				.mockResolvedValueOnce({ isDirectory: () => true }) // global rules dir exists
				.mockResolvedValueOnce({ isFile: () => true }) // for the file check inside readTextFilesFromDirectory
				.mockRejectedValueOnce(new Error("ENOENT")) // project rules dir doesn't exist
			// Mock directory reading for global rules
			mockReaddir.mockResolvedValueOnce([
				{
					name: "rules.md",
					isFile: () => true,
					isSymbolicLink: () => false,
				},
			])
			// Mock file reading for the rules.md file
			mockReadFile.mockResolvedValueOnce("global rule content")
			const result = await (0, custom_instructions_1.loadRuleFiles)(mockCwd)
			expect(result).toContain("# Rules from")
			expect(result).toContain("rules.md:")
			expect(result).toContain("global rule content")
			expect(result).not.toContain("project rule content")
		})
		it("should load project rules only when global rules do not exist", async () => {
			// Mock directory existence
			mockStat
				.mockRejectedValueOnce(new Error("ENOENT")) // global rules dir doesn't exist
				.mockResolvedValueOnce({ isDirectory: () => true }) // project rules dir exists
			// Mock directory reading for project rules
			mockReaddir.mockResolvedValueOnce([
				{
					name: "rules.md",
					isFile: () => true,
					isSymbolicLink: () => false,
				},
			])
			// Mock file reading
			mockStat.mockResolvedValueOnce({ isFile: () => true }) // for the file check
			mockReadFile.mockResolvedValueOnce("project rule content")
			const result = await (0, custom_instructions_1.loadRuleFiles)(mockCwd)
			expect(result).toContain("# Rules from")
			expect(result).toContain("rules.md:")
			expect(result).toContain("project rule content")
			expect(result).not.toContain("global rule content")
		})
		it("should merge global and project rules with project rules after global", async () => {
			// Mock directory existence - both exist
			mockStat
				.mockResolvedValueOnce({ isDirectory: () => true }) // global rules dir exists
				.mockResolvedValueOnce({ isFile: () => true }) // global file check
				.mockResolvedValueOnce({ isDirectory: () => true }) // project rules dir exists
				.mockResolvedValueOnce({ isFile: () => true }) // project file check
			// Mock directory reading
			mockReaddir
				.mockResolvedValueOnce([
					{
						name: "global.md",
						isFile: () => true,
						isSymbolicLink: () => false,
					},
				])
				.mockResolvedValueOnce([
					{
						name: "project.md",
						isFile: () => true,
						isSymbolicLink: () => false,
					},
				])
			// Mock file reading
			mockReadFile.mockResolvedValueOnce("global rule content").mockResolvedValueOnce("project rule content")
			const result = await (0, custom_instructions_1.loadRuleFiles)(mockCwd)
			expect(result).toContain("# Rules from")
			expect(result).toContain("global.md:")
			expect(result).toContain("global rule content")
			expect(result).toContain("project.md:")
			expect(result).toContain("project rule content")
			// Ensure project rules come after global rules
			const globalIndex = result.indexOf("global rule content")
			const projectIndex = result.indexOf("project rule content")
			expect(globalIndex).toBeLessThan(projectIndex)
		})
		it("should fall back to legacy .alirules file when no .ali/rules directories exist", async () => {
			// Mock directory existence - neither exist
			mockStat
				.mockRejectedValueOnce(new Error("ENOENT")) // global rules dir doesn't exist
				.mockRejectedValueOnce(new Error("ENOENT")) // project rules dir doesn't exist
			// Mock legacy file reading
			mockReadFile.mockResolvedValueOnce("legacy rule content")
			const result = await (0, custom_instructions_1.loadRuleFiles)(mockCwd)
			expect(result).toContain("# Rules from .alirules:")
			expect(result).toContain("legacy rule content")
		})
		it("should return empty string when no rules exist anywhere", async () => {
			// Mock directory existence - neither exist
			mockStat
				.mockRejectedValueOnce(new Error("ENOENT")) // global rules dir doesn't exist
				.mockRejectedValueOnce(new Error("ENOENT")) // project rules dir doesn't exist
			// Mock legacy file reading - both fail (using safeReadFile which catches errors)
			// The safeReadFile function catches ENOENT errors and returns empty string
			// So we don't need to mock rejections, just empty responses
			mockReadFile
				.mockResolvedValueOnce("") // .alirules returns empty (simulating ENOENT caught by safeReadFile)
				.mockResolvedValueOnce("") // .clinerules returns empty (simulating ENOENT caught by safeReadFile)
			const result = await (0, custom_instructions_1.loadRuleFiles)(mockCwd)
			expect(result).toBe("")
		})
	})
	describe("addCustomInstructions mode-specific rules", () => {
		it("should load global and project mode-specific rules", async () => {
			const mode = "code"
			// Mock directory existence for mode-specific rules
			mockStat
				.mockResolvedValueOnce({ isDirectory: () => true }) // global rules-code dir exists
				.mockResolvedValueOnce({ isFile: () => true }) // global mode file check
				.mockResolvedValueOnce({ isDirectory: () => true }) // project rules-code dir exists
				.mockResolvedValueOnce({ isFile: () => true }) // project mode file check
				.mockRejectedValueOnce(new Error("ENOENT")) // global rules dir doesn't exist (for generic rules)
				.mockRejectedValueOnce(new Error("ENOENT")) // project rules dir doesn't exist (for generic rules)
			// Mock directory reading for mode-specific rules
			mockReaddir
				.mockResolvedValueOnce([
					{
						name: "global-mode.md",
						isFile: () => true,
						isSymbolicLink: () => false,
					},
				])
				.mockResolvedValueOnce([
					{
						name: "project-mode.md",
						isFile: () => true,
						isSymbolicLink: () => false,
					},
				])
			// Mock file reading for mode-specific rules
			mockReadFile
				.mockResolvedValueOnce("global mode rule content")
				.mockResolvedValueOnce("project mode rule content")
				.mockResolvedValueOnce("") // AGENTS.md file (empty)
				.mockResolvedValueOnce("") // .alirules legacy file (empty)
				.mockResolvedValueOnce("") // .clinerules legacy file (empty)
			const result = await (0, custom_instructions_1.addCustomInstructions)("", "", mockCwd, mode)
			expect(result).toContain("# Rules from")
			expect(result).toContain("global-mode.md:")
			expect(result).toContain("global mode rule content")
			expect(result).toContain("project-mode.md:")
			expect(result).toContain("project mode rule content")
		})
		it("should fall back to legacy mode-specific files when no mode directories exist", async () => {
			const mode = "code"
			// Mock directory existence - mode-specific dirs don't exist
			mockStat
				.mockRejectedValueOnce(new Error("ENOENT")) // global rules-code dir doesn't exist
				.mockRejectedValueOnce(new Error("ENOENT")) // project rules-code dir doesn't exist
				.mockRejectedValueOnce(new Error("ENOENT")) // global rules dir doesn't exist
				.mockRejectedValueOnce(new Error("ENOENT")) // project rules dir doesn't exist
			// Mock legacy mode file reading
			mockReadFile
				.mockResolvedValueOnce("legacy mode rule content") // .alirules-code
				.mockResolvedValueOnce("") // AGENTS.md file (empty)
				.mockResolvedValueOnce("") // generic .alirules (empty)
				.mockResolvedValueOnce("") // generic .clinerules (empty)
			const result = await (0, custom_instructions_1.addCustomInstructions)("", "", mockCwd, mode)
			expect(result).toContain("# Rules from .alirules-code:")
			expect(result).toContain("legacy mode rule content")
		})
	})
})
