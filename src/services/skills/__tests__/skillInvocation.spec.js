"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const skillInvocation_1 = require("../skillInvocation")
describe("skillInvocation", () => {
	const mockSkillContent = {
		name: "test-skill",
		description: "A test skill",
		path: "/mock/.ali/skills/test-skill/SKILL.md",
		source: "project",
		instructions: "Do the thing",
	}
	describe("resolveSkillContentForMode", () => {
		it("returns null when skillsManager is undefined", async () => {
			const result = await (0, skillInvocation_1.resolveSkillContentForMode)(undefined, "test-skill", "code")
			expect(result).toBeNull()
		})
		it("delegates to skillsManager.getSkillContent with correct arguments", async () => {
			const skillsManager = {
				getSkillContent: vi.fn().mockResolvedValue(mockSkillContent),
			}
			const result = await (0, skillInvocation_1.resolveSkillContentForMode)(
				skillsManager,
				"test-skill",
				"architect",
			)
			expect(skillsManager.getSkillContent).toHaveBeenCalledWith("test-skill", "architect")
			expect(result).toBe(mockSkillContent)
		})
		it("returns null when skillsManager returns null", async () => {
			const skillsManager = {
				getSkillContent: vi.fn().mockResolvedValue(null),
			}
			const result = await (0, skillInvocation_1.resolveSkillContentForMode)(skillsManager, "nonexistent", "code")
			expect(result).toBeNull()
		})
	})
	describe("buildSkillApprovalMessage", () => {
		it("produces valid JSON with skill, args, source, and description", () => {
			const message = (0, skillInvocation_1.buildSkillApprovalMessage)("deploy", "staging", {
				source: "project",
				description: "Deploy to env",
			})
			expect(JSON.parse(message)).toEqual({
				tool: "skill",
				skill: "deploy",
				args: "staging",
				source: "project",
				description: "Deploy to env",
			})
		})
		it("includes undefined args when no args provided", () => {
			const message = (0, skillInvocation_1.buildSkillApprovalMessage)("build", undefined, {
				source: "global",
				description: "Build project",
			})
			const parsed = JSON.parse(message)
			expect(parsed.args).toBeUndefined()
			expect(parsed.skill).toBe("build")
		})
	})
	describe("buildSkillResult", () => {
		it("builds full result with description, args, source, and instructions", () => {
			const result = (0, skillInvocation_1.buildSkillResult)("deploy", "production", mockSkillContent)
			expect(result).toBe(
				`Skill: deploy\nDescription: A test skill\nProvided arguments: production\nSource: project\n\n--- Skill Instructions ---\n\nDo the thing`,
			)
		})
		it("omits description line when description is empty", () => {
			const skillContent = { ...mockSkillContent, description: "" }
			const result = (0, skillInvocation_1.buildSkillResult)("deploy", "staging", skillContent)
			expect(result).not.toContain("Description:")
			expect(result).toContain("Skill: deploy")
			expect(result).toContain("Provided arguments: staging")
		})
		it("omits arguments line when args is undefined", () => {
			const result = (0, skillInvocation_1.buildSkillResult)("deploy", undefined, mockSkillContent)
			expect(result).not.toContain("Provided arguments:")
			expect(result).toContain("Skill: deploy")
			expect(result).toContain("Description: A test skill")
		})
		it("includes source and instructions in all cases", () => {
			const result = (0, skillInvocation_1.buildSkillResult)("minimal", undefined, {
				source: "global",
				description: "",
				instructions: "Step 1: do stuff",
			})
			expect(result).toContain("Source: global")
			expect(result).toContain("--- Skill Instructions ---")
			expect(result).toContain("Step 1: do stuff")
		})
	})
})
