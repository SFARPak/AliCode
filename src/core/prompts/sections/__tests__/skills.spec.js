"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const skills_1 = require("../skills")
describe("getSkillsSection", () => {
	it("should emit <available_skills> XML with name, description, and location", async () => {
		const mockSkillsManager = {
			getSkillsForMode: vi.fn().mockReturnValue([
				{
					name: "pdf-processing",
					description: "Extracts text & tables from PDFs",
					path: "/abs/path/pdf-processing/SKILL.md",
					source: "global",
				},
			]),
		}
		const result = await (0, skills_1.getSkillsSection)(mockSkillsManager, "code")
		expect(result).toContain("<available_skills>")
		expect(result).toContain("</available_skills>")
		expect(result).toContain("<skill>")
		expect(result).toContain("<name>pdf-processing</name>")
		// Ensure XML escaping for '&'
		expect(result).toContain("<description>Extracts text &amp; tables from PDFs</description>")
		// For filesystem-based agents, location should be the absolute path to SKILL.md
		expect(result).toContain("<location>/abs/path/pdf-processing/SKILL.md</location>")
	})
	it("should return empty string when skillsManager or currentMode is missing", async () => {
		await expect((0, skills_1.getSkillsSection)(undefined, "code")).resolves.toBe("")
		await expect((0, skills_1.getSkillsSection)({ getSkillsForMode: vi.fn() }, undefined)).resolves.toBe("")
	})
})
