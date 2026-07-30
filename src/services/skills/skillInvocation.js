"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.resolveSkillContentForMode = resolveSkillContentForMode
exports.buildSkillApprovalMessage = buildSkillApprovalMessage
exports.buildSkillResult = buildSkillResult
async function resolveSkillContentForMode(skillsManager, skillName, currentMode) {
	if (!skillsManager) {
		return null
	}
	return skillsManager.getSkillContent(skillName, currentMode)
}
function buildSkillApprovalMessage(skillName, args, skillContent) {
	return JSON.stringify({
		tool: "skill",
		skill: skillName,
		args,
		source: skillContent.source,
		description: skillContent.description,
	})
}
function buildSkillResult(skillName, args, skillContent) {
	let result = `Skill: ${skillName}`
	if (skillContent.description) {
		result += `\nDescription: ${skillContent.description}`
	}
	if (args) {
		result += `\nProvided arguments: ${args}`
	}
	result += `\nSource: ${skillContent.source}`
	result += `\n\n--- Skill Instructions ---\n\n${skillContent.instructions}`
	return result
}
