"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.skillTool = exports.SkillTool = void 0
const responses_1 = require("../prompts/responses")
const BaseTool_1 = require("./BaseTool")
const skillInvocation_1 = require("../../services/skills/skillInvocation")
class SkillTool extends BaseTool_1.BaseTool {
	name = "skill"
	async execute(params, task, callbacks) {
		const { skill: skillName, args } = params
		const { askApproval, handleError, pushToolResult } = callbacks
		try {
			// Validate skill name parameter
			if (!skillName) {
				task.consecutiveMistakeCount++
				task.recordToolError("skill")
				task.didToolFailInCurrentTurn = true
				pushToolResult(await task.sayAndCreateMissingParamError("skill", "skill"))
				return
			}
			task.consecutiveMistakeCount = 0
			// Get SkillsManager from provider
			const provider = task.providerRef.deref()
			const skillsManager = provider?.getSkillsManager()
			if (!skillsManager) {
				task.recordToolError("skill")
				task.didToolFailInCurrentTurn = true
				pushToolResult(responses_1.formatResponse.toolError("Skills Manager not available"))
				return
			}
			// Get current mode for skill resolution
			const state = await provider?.getState()
			const currentMode = state?.mode ?? "code"
			// Fetch skill content
			const skillContent = await (0, skillInvocation_1.resolveSkillContentForMode)(
				skillsManager,
				skillName,
				currentMode,
			)
			if (!skillContent) {
				// Get available skills for error message
				const availableSkills = skillsManager.getSkillsForMode(currentMode)
				const skillNames = availableSkills.map((s) => s.name)
				task.recordToolError("skill")
				task.didToolFailInCurrentTurn = true
				pushToolResult(
					responses_1.formatResponse.toolError(
						`Skill '${skillName}' not found. Available skills: ${skillNames.join(", ") || "(none)"}`,
					),
				)
				return
			}
			// Build approval message
			const toolMessage = (0, skillInvocation_1.buildSkillApprovalMessage)(skillName, args, skillContent)
			const didApprove = await askApproval("tool", toolMessage)
			if (!didApprove) {
				return
			}
			pushToolResult((0, skillInvocation_1.buildSkillResult)(skillName, args, skillContent))
		} catch (error) {
			await handleError("executing skill", error)
		}
	}
	async handlePartial(task, block) {
		const skillName = block.params.skill
		const args = block.params.args
		const partialMessage = JSON.stringify({
			tool: "skill",
			skill: skillName,
			args: args,
		})
		await task.ask("tool", partialMessage, block.partial).catch(() => {})
	}
}
exports.SkillTool = SkillTool
exports.skillTool = new SkillTool()
