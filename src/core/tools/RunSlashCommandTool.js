"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.runSlashCommandTool = exports.RunSlashCommandTool = void 0
const responses_1 = require("../prompts/responses")
const commands_1 = require("../../services/command/commands")
const experiments_1 = require("../../shared/experiments")
const BaseTool_1 = require("./BaseTool")
const modes_1 = require("../../shared/modes")
const skillInvocation_1 = require("../../services/skills/skillInvocation")
class RunSlashCommandTool extends BaseTool_1.BaseTool {
	name = "run_slash_command"
	async execute(params, task, callbacks) {
		const { command: commandName, args } = params
		const { askApproval, handleError, pushToolResult } = callbacks
		// Check if run slash command experiment is enabled
		const provider = task.providerRef.deref()
		const state = await provider?.getState()
		const isRunSlashCommandEnabled = experiments_1.experiments.isEnabled(
			state?.experiments ?? {},
			experiments_1.EXPERIMENT_IDS.RUN_SLASH_COMMAND,
		)
		if (!isRunSlashCommandEnabled) {
			pushToolResult(
				responses_1.formatResponse.toolError(
					"Run slash command is an experimental feature that must be enabled in settings. Please enable 'Run Slash Command' in the Experimental Settings section.",
				),
			)
			return
		}
		try {
			if (!commandName) {
				task.consecutiveMistakeCount++
				task.recordToolError("run_slash_command")
				task.didToolFailInCurrentTurn = true
				pushToolResult(await task.sayAndCreateMissingParamError("run_slash_command", "command"))
				return
			}
			task.consecutiveMistakeCount = 0
			// Get the command from the commands service
			const command = await (0, commands_1.getCommand)(task.cwd, commandName)
			if (!command) {
				const currentMode = state?.mode ?? "code"
				const skillsManager = provider?.getSkillsManager()
				const skillContent = await (0, skillInvocation_1.resolveSkillContentForMode)(
					skillsManager,
					commandName,
					currentMode,
				)
				if (skillContent) {
					const skillMessage = (0, skillInvocation_1.buildSkillApprovalMessage)(
						commandName,
						args,
						skillContent,
					)
					const didApprove = await askApproval("tool", skillMessage)
					if (!didApprove) {
						return
					}
					pushToolResult((0, skillInvocation_1.buildSkillResult)(commandName, args, skillContent))
					return
				}
				// Get available commands for error message
				const availableCommands = await (0, commands_1.getCommandNames)(task.cwd)
				task.recordToolError("run_slash_command")
				task.didToolFailInCurrentTurn = true
				pushToolResult(
					responses_1.formatResponse.toolError(
						`Command '${commandName}' not found. Available commands: ${availableCommands.join(", ") || "(none)"}`,
					),
				)
				return
			}
			const toolMessage = JSON.stringify({
				tool: "runSlashCommand",
				command: commandName,
				args: args,
				source: command.source,
				description: command.description,
				mode: command.mode,
			})
			const didApprove = await askApproval("tool", toolMessage)
			if (!didApprove) {
				return
			}
			// Switch mode if specified in the command frontmatter
			if (command.mode) {
				const provider = task.providerRef.deref()
				const targetMode = (0, modes_1.getModeBySlug)(command.mode, (await provider?.getState())?.customModes)
				if (targetMode) {
					await provider?.handleModeSwitch(command.mode)
				}
			}
			// Build the result message
			let result = `Command: /${commandName}`
			if (command.description) {
				result += `\nDescription: ${command.description}`
			}
			if (command.argumentHint) {
				result += `\nArgument hint: ${command.argumentHint}`
			}
			if (command.mode) {
				result += `\nMode: ${command.mode}`
			}
			if (args) {
				result += `\nProvided arguments: ${args}`
			}
			result += `\nSource: ${command.source}`
			result += `\n\n--- Command Content ---\n\n${command.content}`
			// Return the command content as the tool result
			pushToolResult(result)
		} catch (error) {
			await handleError("running slash command", error)
		}
	}
	async handlePartial(task, block) {
		const commandName = block.params.command
		const args = block.params.args
		const partialMessage = JSON.stringify({
			tool: "runSlashCommand",
			command: commandName,
			args: args,
		})
		await task.ask("tool", partialMessage, block.partial).catch(() => {})
	}
}
exports.RunSlashCommandTool = RunSlashCommandTool
exports.runSlashCommandTool = new RunSlashCommandTool()
