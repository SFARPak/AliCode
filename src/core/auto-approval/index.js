"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.AutoApprovalHandler = void 0
exports.checkAutoApproval = checkAutoApproval
const types_1 = require("@ali-code/types")
const tools_1 = require("./tools")
const mcp_1 = require("./mcp")
const commands_1 = require("./commands")
async function checkAutoApproval({ state, ask, text, isProtected }) {
	if ((0, types_1.isNonBlockingAsk)(ask)) {
		return { decision: "approve" }
	}
	if (!state || !state.autoApprovalEnabled) {
		return { decision: "ask" }
	}
	if (ask === "followup") {
		if (state.alwaysAllowFollowupQuestions === true) {
			try {
				const suggestion = JSON.parse(text || "{}").suggest?.[0]
				if (
					suggestion &&
					typeof state.followupAutoApproveTimeoutMs === "number" &&
					state.followupAutoApproveTimeoutMs > 0
				) {
					return {
						decision: "timeout",
						timeout: state.followupAutoApproveTimeoutMs,
						fn: () => ({ askResponse: "messageResponse", text: suggestion.answer }),
					}
				} else {
					return { decision: "ask" }
				}
			} catch (error) {
				return { decision: "ask" }
			}
		} else {
			return { decision: "ask" }
		}
	}
	if (ask === "use_mcp_server") {
		if (!text) {
			return { decision: "ask" }
		}
		try {
			const mcpServerUse = JSON.parse(text)
			if (mcpServerUse.type === "use_mcp_tool") {
				return state.alwaysAllowMcp === true &&
					(0, mcp_1.isMcpToolAlwaysAllowed)(mcpServerUse, state.mcpServers)
					? { decision: "approve" }
					: { decision: "ask" }
			} else if (mcpServerUse.type === "access_mcp_resource") {
				return state.alwaysAllowMcp === true ? { decision: "approve" } : { decision: "ask" }
			}
		} catch (error) {
			return { decision: "ask" }
		}
		return { decision: "ask" }
	}
	if (ask === "command") {
		if (!text) {
			return { decision: "ask" }
		}
		if (state.alwaysAllowExecute === true) {
			const decision = (0, commands_1.getCommandDecision)(
				text,
				state.allowedCommands || [],
				state.deniedCommands || [],
			)
			if (decision === "auto_approve") {
				return { decision: "approve" }
			} else if (decision === "auto_deny") {
				return { decision: "deny" }
			} else {
				return { decision: "ask" }
			}
		}
	}
	// Autonomous mode: auto-approve everything except file deletions
	if (state.mode === "autonomous" || state.mode === "autocode") {
		// For tools, check if it's a file deletion
		if (ask === "tool") {
			const toolName = text?.match(/Tool: (\w+)/)?.[1]
			// File deletion tools still require approval
			if (toolName === "delete_files" || toolName === "delete" || toolName === "remove_file") {
				return { decision: "ask" }
			}
			return { decision: "approve" }
		}
		// For commands, auto-approve all
		if (ask === "command") {
			return { decision: "approve" }
		}
	}
	if (ask === "tool") {
		let tool
		try {
			tool = JSON.parse(text || "{}")
		} catch (error) {
			console.error("Failed to parse tool:", error)
		}
		if (!tool) {
			return { decision: "ask" }
		}
		if (tool.tool === "updateTodoList") {
			return { decision: "approve" }
		}
		// The skill tool only loads pre-defined instructions from global or project skills.
		// It does not read arbitrary files - skills must be explicitly installed/defined by the user.
		// Auto-approval is intentional to provide a seamless experience when loading task instructions.
		if (tool.tool === "skill") {
			return { decision: "approve" }
		}
		if (tool?.tool === "switchMode") {
			return state.alwaysAllowModeSwitch === true ? { decision: "approve" } : { decision: "ask" }
		}
		if (["newTask", "finishTask"].includes(tool?.tool)) {
			return state.alwaysAllowSubtasks === true ? { decision: "approve" } : { decision: "ask" }
		}
		const isOutsideWorkspace = !!tool.isOutsideWorkspace
		if ((0, tools_1.isReadOnlyToolAction)(tool)) {
			return state.alwaysAllowReadOnly === true &&
				(!isOutsideWorkspace || state.alwaysAllowReadOnlyOutsideWorkspace === true)
				? { decision: "approve" }
				: { decision: "ask" }
		}
		if ((0, tools_1.isWriteToolAction)(tool)) {
			return state.alwaysAllowWrite === true &&
				(!isOutsideWorkspace || state.alwaysAllowWriteOutsideWorkspace === true) &&
				(!isProtected || state.alwaysAllowWriteProtected === true)
				? { decision: "approve" }
				: { decision: "ask" }
		}
	}
	return { decision: "ask" }
}
var AutoApprovalHandler_1 = require("./AutoApprovalHandler")
Object.defineProperty(exports, "AutoApprovalHandler", {
	enumerable: true,
	get: function () {
		return AutoApprovalHandler_1.AutoApprovalHandler
	},
})
