"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.askFollowupQuestionTool = exports.AskFollowupQuestionTool = void 0
const responses_1 = require("../prompts/responses")
const BaseTool_1 = require("./BaseTool")
class AskFollowupQuestionTool extends BaseTool_1.BaseTool {
	name = "ask_followup_question"
	async execute(params, task, callbacks) {
		const { question, follow_up } = params
		const { handleError, pushToolResult } = callbacks
		const recordMissingParamError = async (paramName) => {
			task.consecutiveMistakeCount++
			task.recordToolError("ask_followup_question")
			task.didToolFailInCurrentTurn = true
			pushToolResult(await task.sayAndCreateMissingParamError("ask_followup_question", paramName))
		}
		try {
			if (!question) {
				await recordMissingParamError("question")
				return
			}
			if (!follow_up || !Array.isArray(follow_up)) {
				await recordMissingParamError("follow_up")
				return
			}
			// Transform follow_up suggestions to the format expected by task.ask
			const follow_up_json = {
				question,
				suggest: follow_up.map((s) => ({ answer: s.text, mode: s.mode })),
			}
			task.consecutiveMistakeCount = 0
			const { text, images } = await task.ask("followup", JSON.stringify(follow_up_json), false)
			await task.say("user_feedback", text ?? "", images)
			pushToolResult(responses_1.formatResponse.toolResult(`<user_message>\n${text}\n</user_message>`, images))
		} catch (error) {
			await handleError("asking question", error)
		}
	}
	async handlePartial(task, block) {
		const question = block.nativeArgs?.question ?? block.params.question
		// During partial streaming, only show the question to avoid displaying raw JSON
		// The full JSON with suggestions will be sent when the tool call is complete (!block.partial)
		await task.ask("followup", question ?? "", block.partial).catch(() => {})
	}
}
exports.AskFollowupQuestionTool = AskFollowupQuestionTool
exports.askFollowupQuestionTool = new AskFollowupQuestionTool()
