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
exports.attemptCompletionTool = exports.AttemptCompletionTool = void 0
const vscode = __importStar(require("vscode"))
const types_1 = require("@ali-code/types")
const responses_1 = require("../prompts/responses")
const package_1 = require("../../shared/package")
const i18n_1 = require("../../i18n")
const BaseTool_1 = require("./BaseTool")
class AttemptCompletionTool extends BaseTool_1.BaseTool {
	name = "attempt_completion"
	async execute(params, task, callbacks) {
		const { result } = params
		const { handleError, pushToolResult, askFinishSubTaskApproval } = callbacks
		// Prevent attempt_completion if any tool failed in the current turn
		if (task.didToolFailInCurrentTurn) {
			const errorMsg = (0, i18n_1.t)("common:errors.attempt_completion_tool_failed")
			await task.say("error", errorMsg)
			pushToolResult(responses_1.formatResponse.toolError(errorMsg))
			return
		}
		const preventCompletionWithOpenTodos = vscode.workspace
			.getConfiguration(package_1.Package.name)
			.get("preventCompletionWithOpenTodos", false)
		const hasIncompleteTodos = task.todoList && task.todoList.some((todo) => todo.status !== "completed")
		if (preventCompletionWithOpenTodos && hasIncompleteTodos) {
			task.consecutiveMistakeCount++
			task.recordToolError("attempt_completion")
			pushToolResult(
				responses_1.formatResponse.toolError(
					"Cannot complete task while there are incomplete todos. Please finish all todos before attempting completion.",
				),
			)
			return
		}
		try {
			if (!result) {
				task.consecutiveMistakeCount++
				task.recordToolError("attempt_completion")
				pushToolResult(await task.sayAndCreateMissingParamError("attempt_completion", "result"))
				return
			}
			task.consecutiveMistakeCount = 0
			await task.say("completion_result", result, undefined, false)
			// Check for subtask using parentTaskId (metadata-driven delegation)
			if (task.parentTaskId) {
				// Check if this subtask has already completed and returned to parent
				// to prevent duplicate tool_results when user revisits from history
				const provider = task.providerRef.deref()
				if (provider) {
					try {
						const { historyItem } = await provider.getTaskWithId(task.taskId)
						const status = historyItem?.status
						if (status === "completed") {
							// Subtask already completed - skip delegation flow entirely
							// Fall through to normal completion ask flow below (outside this if block)
							// This shows the user the completion result and waits for acceptance
							// without injecting another tool_result to the parent
						} else if (status === "active") {
							// Normal subtask completion - do delegation
							const delegation = await this.delegateToParent(
								task,
								result,
								provider,
								askFinishSubTaskApproval,
								pushToolResult,
							)
							if (delegation === "delegated") {
								this.emitTaskCompleted(task)
							}
							if (delegation !== "continue") return
						} else {
							// Unexpected status (undefined or "delegated") - log error and skip delegation
							// undefined indicates a bug in status persistence during child creation
							// "delegated" would mean this child has its own grandchild pending (shouldn't reach attempt_completion)
							console.error(
								`[AttemptCompletionTool] Unexpected child task status "${status}" for task ${task.taskId}. ` +
									`Expected "active" or "completed". Skipping delegation to prevent data corruption.`,
							)
							// Fall through to normal completion ask flow
						}
					} catch (err) {
						// If we can't get the history, log error and skip delegation
						console.error(
							`[AttemptCompletionTool] Failed to get history for task ${task.taskId}: ${err?.message ?? String(err)}. ` +
								`Skipping delegation.`,
						)
						// Fall through to normal completion ask flow
					}
				}
			}
			const { response, text, images } = await task.ask("completion_result", "", false)
			if (response === "yesButtonClicked") {
				this.emitTaskCompleted(task)
				return
			}
			// User provided feedback - push tool result to continue the conversation
			await task.say("user_feedback", text ?? "", images)
			const feedbackText = `<user_message>\n${text}\n</user_message>`
			pushToolResult(responses_1.formatResponse.toolResult(feedbackText, images))
		} catch (error) {
			await handleError("inspecting site", error)
		}
	}
	/**
	 * Handles the common delegation flow when a subtask completes.
	 * Returns:
	 * - "delegated" when completion was approved and parent resumed
	 * - "denied" when user denied finishing the subtask
	 * - "continue" when caller should fall through to normal completion ask flow
	 */
	async delegateToParent(task, result, provider, askFinishSubTaskApproval, pushToolResult) {
		const didApprove = await askFinishSubTaskApproval()
		if (!didApprove) {
			pushToolResult(responses_1.formatResponse.toolDenied())
			return "denied"
		}
		pushToolResult("")
		await provider.reopenParentFromDelegation({
			parentTaskId: task.parentTaskId,
			childTaskId: task.taskId,
			completionResultSummary: result,
		})
		return "delegated"
	}
	async handlePartial(task, block) {
		const result = block.params.result
		const command = block.params.command
		const lastMessage = task.clineMessages.at(-1)
		if (command) {
			if (lastMessage && lastMessage.ask === "command") {
				await task.ask("command", command ?? "", block.partial).catch(() => {})
			} else {
				await task.say("completion_result", result ?? "", undefined, false)
				await task.ask("command", command ?? "", block.partial).catch(() => {})
			}
		} else {
			await task.say("completion_result", result ?? "", undefined, block.partial)
		}
	}
	emitTaskCompleted(task) {
		// Force final token usage update before emitting TaskCompleted.
		// This ensures the latest stats are captured regardless of throttle timer.
		task.emitFinalTokenUsageUpdate()
		task.emit(types_1.AliCodeEventName.TaskCompleted, task.taskId, task.getTokenUsage(), task.toolUsage)
	}
}
exports.AttemptCompletionTool = AttemptCompletionTool
exports.attemptCompletionTool = new AttemptCompletionTool()
