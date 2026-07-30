"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.switchModeTool = exports.SwitchModeTool = void 0
const delay_1 = __importDefault(require("delay"))
const responses_1 = require("../prompts/responses")
const modes_1 = require("../../shared/modes")
const BaseTool_1 = require("./BaseTool")
class SwitchModeTool extends BaseTool_1.BaseTool {
	name = "switch_mode"
	async execute(params, task, callbacks) {
		const { mode_slug, reason } = params
		const { askApproval, handleError, pushToolResult } = callbacks
		try {
			if (!mode_slug) {
				task.consecutiveMistakeCount++
				task.recordToolError("switch_mode")
				pushToolResult(await task.sayAndCreateMissingParamError("switch_mode", "mode_slug"))
				return
			}
			task.consecutiveMistakeCount = 0
			// Verify the mode exists
			const targetMode = (0, modes_1.getModeBySlug)(
				mode_slug,
				(await task.providerRef.deref()?.getState())?.customModes,
			)
			if (!targetMode) {
				task.recordToolError("switch_mode")
				task.didToolFailInCurrentTurn = true
				pushToolResult(responses_1.formatResponse.toolError(`Invalid mode: ${mode_slug}`))
				return
			}
			// Check if already in requested mode
			const currentMode = (await task.providerRef.deref()?.getState())?.mode ?? modes_1.defaultModeSlug
			if (currentMode === mode_slug) {
				task.recordToolError("switch_mode")
				task.didToolFailInCurrentTurn = true
				pushToolResult(`Already in ${targetMode.name} mode.`)
				return
			}
			const completeMessage = JSON.stringify({ tool: "switchMode", mode: mode_slug, reason })
			const didApprove = await askApproval("tool", completeMessage)
			if (!didApprove) {
				return
			}
			// Switch the mode using shared handler
			await task.providerRef.deref()?.handleModeSwitch(mode_slug)
			pushToolResult(
				`Successfully switched from ${(0, modes_1.getModeBySlug)(currentMode)?.name ?? currentMode} mode to ${targetMode.name} mode${reason ? ` because: ${reason}` : ""}.`,
			)
			await (0, delay_1.default)(500) // Delay to allow mode change to take effect before next tool is executed
		} catch (error) {
			await handleError("switching mode", error)
		}
	}
	async handlePartial(task, block) {
		const mode_slug = block.params.mode_slug
		const reason = block.params.reason
		const partialMessage = JSON.stringify({
			tool: "switchMode",
			mode: mode_slug ?? "",
			reason: reason ?? "",
		})
		await task.ask("tool", partialMessage, block.partial).catch(() => {})
	}
}
exports.SwitchModeTool = SwitchModeTool
exports.switchModeTool = new SwitchModeTool()
