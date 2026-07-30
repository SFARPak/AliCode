"use strict"
// npx vitest run src/core/webview/__tests__/skillsMessageHandler.spec.ts
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
// Mock vscode first
vi.mock("vscode", () => {
	const showErrorMessage = vi.fn()
	return {
		window: {
			showErrorMessage,
		},
	}
})
// Mock open-file
vi.mock("../../../integrations/misc/open-file", () => ({
	openFile: vi.fn(),
}))
// Mock i18n
vi.mock("../../../i18n", () => ({
	t: (key, params) => {
		const translations = {
			"skills:errors.missing_create_fields": "Missing required fields: skillName, source, or skillDescription",
			"skills:errors.manager_unavailable": "Skills manager not available",
			"skills:errors.missing_delete_fields": "Missing required fields: skillName or source",
			"skills:errors.missing_move_fields": "Missing required fields: skillName or source",
			"skills:errors.skill_not_found": `Skill "${params?.name}" not found`,
		}
		return translations[key] || key
	},
}))
const vscode = __importStar(require("vscode"))
const open_file_1 = require("../../../integrations/misc/open-file")
const skillsMessageHandler_1 = require("../skillsMessageHandler")
describe("skillsMessageHandler", () => {
	const mockLog = vi.fn()
	const mockPostMessageToWebview = vi.fn()
	const mockGetSkillsMetadata = vi.fn()
	const mockCreateSkill = vi.fn()
	const mockDeleteSkill = vi.fn()
	const mockMoveSkill = vi.fn()
	const mockGetSkill = vi.fn()
	const mockFindSkillByNameAndSource = vi.fn()
	const createMockProvider = (hasSkillsManager = true) => {
		const skillsManager = hasSkillsManager
			? {
					getSkillsMetadata: mockGetSkillsMetadata,
					createSkill: mockCreateSkill,
					deleteSkill: mockDeleteSkill,
					moveSkill: mockMoveSkill,
					getSkill: mockGetSkill,
					findSkillByNameAndSource: mockFindSkillByNameAndSource,
				}
			: undefined
		return {
			log: mockLog,
			postMessageToWebview: mockPostMessageToWebview,
			getSkillsManager: () => skillsManager,
		}
	}
	const mockSkills = [
		{
			name: "test-skill",
			description: "Test skill description",
			path: "/path/to/test-skill/SKILL.md",
			source: "global",
		},
		{
			name: "project-skill",
			description: "Project skill description",
			path: "/project/.ali/skills/project-skill/SKILL.md",
			source: "project",
			mode: "code",
		},
	]
	beforeEach(() => {
		vi.clearAllMocks()
	})
	describe("handleRequestSkills", () => {
		it("returns skills when skills manager is available", async () => {
			const provider = createMockProvider(true)
			mockGetSkillsMetadata.mockReturnValue(mockSkills)
			const result = await (0, skillsMessageHandler_1.handleRequestSkills)(provider)
			expect(result).toEqual(mockSkills)
			expect(mockPostMessageToWebview).toHaveBeenCalledWith({ type: "skills", skills: mockSkills })
		})
		it("returns empty skills when skills manager is not available", async () => {
			const provider = createMockProvider(false)
			const result = await (0, skillsMessageHandler_1.handleRequestSkills)(provider)
			expect(result).toEqual([])
			expect(mockPostMessageToWebview).toHaveBeenCalledWith({ type: "skills", skills: [] })
		})
		it("handles errors and returns empty skills", async () => {
			const provider = createMockProvider(true)
			mockGetSkillsMetadata.mockImplementation(() => {
				throw new Error("Test error")
			})
			const result = await (0, skillsMessageHandler_1.handleRequestSkills)(provider)
			expect(result).toEqual([])
			expect(mockLog).toHaveBeenCalled()
			expect(mockPostMessageToWebview).toHaveBeenCalledWith({ type: "skills", skills: [] })
		})
	})
	describe("handleCreateSkill", () => {
		it("creates a skill successfully", async () => {
			const provider = createMockProvider(true)
			mockCreateSkill.mockResolvedValue("/path/to/new-skill/SKILL.md")
			mockGetSkillsMetadata.mockReturnValue(mockSkills)
			const result = await (0, skillsMessageHandler_1.handleCreateSkill)(provider, {
				type: "createSkill",
				skillName: "new-skill",
				source: "global",
				skillDescription: "New skill description",
			})
			expect(result).toEqual(mockSkills)
			expect(mockCreateSkill).toHaveBeenCalledWith("new-skill", "global", "New skill description", undefined)
			expect(open_file_1.openFile).toHaveBeenCalledWith("/path/to/new-skill/SKILL.md")
			expect(mockPostMessageToWebview).toHaveBeenCalledWith({ type: "skills", skills: mockSkills })
		})
		it("creates a skill with mode restriction", async () => {
			const provider = createMockProvider(true)
			mockCreateSkill.mockResolvedValue("/path/to/new-skill/SKILL.md")
			mockGetSkillsMetadata.mockReturnValue(mockSkills)
			const result = await (0, skillsMessageHandler_1.handleCreateSkill)(provider, {
				type: "createSkill",
				skillName: "new-skill",
				source: "project",
				skillDescription: "New skill description",
				skillMode: "code",
			})
			expect(result).toEqual(mockSkills)
			expect(mockCreateSkill).toHaveBeenCalledWith("new-skill", "project", "New skill description", ["code"])
		})
		it("returns undefined when required fields are missing", async () => {
			const provider = createMockProvider(true)
			const result = await (0, skillsMessageHandler_1.handleCreateSkill)(provider, {
				type: "createSkill",
				skillName: "new-skill",
				// missing source and skillDescription
			})
			expect(result).toBeUndefined()
			expect(mockLog).toHaveBeenCalledWith(
				"Error creating skill: Missing required fields: skillName, source, or skillDescription",
			)
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				"Failed to create skill: Missing required fields: skillName, source, or skillDescription",
			)
		})
		it("returns undefined when skills manager is not available", async () => {
			const provider = createMockProvider(false)
			const result = await (0, skillsMessageHandler_1.handleCreateSkill)(provider, {
				type: "createSkill",
				skillName: "new-skill",
				source: "global",
				skillDescription: "New skill description",
			})
			expect(result).toBeUndefined()
			expect(mockLog).toHaveBeenCalledWith("Error creating skill: Skills manager not available")
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				"Failed to create skill: Skills manager not available",
			)
		})
	})
	describe("handleDeleteSkill", () => {
		it("deletes a skill successfully", async () => {
			const provider = createMockProvider(true)
			mockDeleteSkill.mockResolvedValue(undefined)
			mockGetSkillsMetadata.mockReturnValue([mockSkills[1]])
			const result = await (0, skillsMessageHandler_1.handleDeleteSkill)(provider, {
				type: "deleteSkill",
				skillName: "test-skill",
				source: "global",
			})
			expect(result).toEqual([mockSkills[1]])
			expect(mockDeleteSkill).toHaveBeenCalledWith("test-skill", "global", undefined)
			expect(mockPostMessageToWebview).toHaveBeenCalledWith({ type: "skills", skills: [mockSkills[1]] })
		})
		it("deletes a skill with mode restriction", async () => {
			const provider = createMockProvider(true)
			mockDeleteSkill.mockResolvedValue(undefined)
			mockGetSkillsMetadata.mockReturnValue([mockSkills[0]])
			const result = await (0, skillsMessageHandler_1.handleDeleteSkill)(provider, {
				type: "deleteSkill",
				skillName: "project-skill",
				source: "project",
				skillMode: "code",
			})
			expect(result).toEqual([mockSkills[0]])
			expect(mockDeleteSkill).toHaveBeenCalledWith("project-skill", "project", "code")
		})
		it("returns undefined when required fields are missing", async () => {
			const provider = createMockProvider(true)
			const result = await (0, skillsMessageHandler_1.handleDeleteSkill)(provider, {
				type: "deleteSkill",
				skillName: "test-skill",
				// missing source
			})
			expect(result).toBeUndefined()
			expect(mockLog).toHaveBeenCalledWith("Error deleting skill: Missing required fields: skillName or source")
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				"Failed to delete skill: Missing required fields: skillName or source",
			)
		})
		it("returns undefined when skills manager is not available", async () => {
			const provider = createMockProvider(false)
			const result = await (0, skillsMessageHandler_1.handleDeleteSkill)(provider, {
				type: "deleteSkill",
				skillName: "test-skill",
				source: "global",
			})
			expect(result).toBeUndefined()
			expect(mockLog).toHaveBeenCalledWith("Error deleting skill: Skills manager not available")
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				"Failed to delete skill: Skills manager not available",
			)
		})
	})
	describe("handleMoveSkill", () => {
		it("moves a skill successfully", async () => {
			const provider = createMockProvider(true)
			mockMoveSkill.mockResolvedValue(undefined)
			mockGetSkillsMetadata.mockReturnValue([mockSkills[0]])
			const result = await (0, skillsMessageHandler_1.handleMoveSkill)(provider, {
				type: "moveSkill",
				skillName: "test-skill",
				source: "global",
				skillMode: undefined,
				newSkillMode: "code",
			})
			expect(result).toEqual([mockSkills[0]])
			expect(mockMoveSkill).toHaveBeenCalledWith("test-skill", "global", undefined, "code")
			expect(mockPostMessageToWebview).toHaveBeenCalledWith({ type: "skills", skills: [mockSkills[0]] })
		})
		it("moves a skill from one mode to another", async () => {
			const provider = createMockProvider(true)
			mockMoveSkill.mockResolvedValue(undefined)
			mockGetSkillsMetadata.mockReturnValue([mockSkills[1]])
			const result = await (0, skillsMessageHandler_1.handleMoveSkill)(provider, {
				type: "moveSkill",
				skillName: "project-skill",
				source: "project",
				skillMode: "code",
				newSkillMode: "architect",
			})
			expect(result).toEqual([mockSkills[1]])
			expect(mockMoveSkill).toHaveBeenCalledWith("project-skill", "project", "code", "architect")
		})
		it("returns undefined when required fields are missing", async () => {
			const provider = createMockProvider(true)
			const result = await (0, skillsMessageHandler_1.handleMoveSkill)(provider, {
				type: "moveSkill",
				skillName: "test-skill",
				// missing source
			})
			expect(result).toBeUndefined()
			expect(mockLog).toHaveBeenCalledWith("Error moving skill: Missing required fields: skillName or source")
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				"Failed to move skill: Missing required fields: skillName or source",
			)
		})
		it("returns undefined when skills manager is not available", async () => {
			const provider = createMockProvider(false)
			const result = await (0, skillsMessageHandler_1.handleMoveSkill)(provider, {
				type: "moveSkill",
				skillName: "test-skill",
				source: "global",
				newSkillMode: "code",
			})
			expect(result).toBeUndefined()
			expect(mockLog).toHaveBeenCalledWith("Error moving skill: Skills manager not available")
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				"Failed to move skill: Skills manager not available",
			)
		})
	})
	describe("handleOpenSkillFile", () => {
		it("opens a skill file successfully", async () => {
			const provider = createMockProvider(true)
			mockFindSkillByNameAndSource.mockReturnValue(mockSkills[0])
			await (0, skillsMessageHandler_1.handleOpenSkillFile)(provider, {
				type: "openSkillFile",
				skillName: "test-skill",
				source: "global",
			})
			expect(mockFindSkillByNameAndSource).toHaveBeenCalledWith("test-skill", "global")
			expect(open_file_1.openFile).toHaveBeenCalledWith("/path/to/test-skill/SKILL.md")
		})
		it("opens a skill file with mode restriction", async () => {
			const provider = createMockProvider(true)
			mockFindSkillByNameAndSource.mockReturnValue(mockSkills[1])
			await (0, skillsMessageHandler_1.handleOpenSkillFile)(provider, {
				type: "openSkillFile",
				skillName: "project-skill",
				source: "project",
				skillMode: "code",
			})
			expect(mockFindSkillByNameAndSource).toHaveBeenCalledWith("project-skill", "project")
			expect(open_file_1.openFile).toHaveBeenCalledWith("/project/.ali/skills/project-skill/SKILL.md")
		})
		it("shows error when required fields are missing", async () => {
			const provider = createMockProvider(true)
			await (0, skillsMessageHandler_1.handleOpenSkillFile)(provider, {
				type: "openSkillFile",
				skillName: "test-skill",
				// missing source
			})
			expect(mockLog).toHaveBeenCalledWith(
				"Error opening skill file: Missing required fields: skillName or source",
			)
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				"Failed to open skill file: Missing required fields: skillName or source",
			)
		})
		it("shows error when skills manager is not available", async () => {
			const provider = createMockProvider(false)
			await (0, skillsMessageHandler_1.handleOpenSkillFile)(provider, {
				type: "openSkillFile",
				skillName: "test-skill",
				source: "global",
			})
			expect(mockLog).toHaveBeenCalledWith("Error opening skill file: Skills manager not available")
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				"Failed to open skill file: Skills manager not available",
			)
		})
		it("shows error when skill is not found", async () => {
			const provider = createMockProvider(true)
			mockFindSkillByNameAndSource.mockReturnValue(undefined)
			await (0, skillsMessageHandler_1.handleOpenSkillFile)(provider, {
				type: "openSkillFile",
				skillName: "nonexistent-skill",
				source: "global",
			})
			expect(mockLog).toHaveBeenCalledWith('Error opening skill file: Skill "nonexistent-skill" not found')
			expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
				'Failed to open skill file: Skill "nonexistent-skill" not found',
			)
		})
	})
})
