"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.presentAssistantMessage = presentAssistantMessage
const serialize_error_1 = require("serialize-error")
const core_1 = require("@ali-code/core")
const i18n_1 = require("../../i18n")
const modes_1 = require("../../shared/modes")
const AskIgnoredError_1 = require("../task/AskIgnoredError")
const ListFilesTool_1 = require("../tools/ListFilesTool")
const ReadFileTool_1 = require("../tools/ReadFileTool")
const ReadCommandOutputTool_1 = require("../tools/ReadCommandOutputTool")
const WriteToFileTool_1 = require("../tools/WriteToFileTool")
const EditTool_1 = require("../tools/EditTool")
const SearchReplaceTool_1 = require("../tools/SearchReplaceTool")
const EditFileTool_1 = require("../tools/EditFileTool")
const ApplyPatchTool_1 = require("../tools/ApplyPatchTool")
const SearchFilesTool_1 = require("../tools/SearchFilesTool")
const ExecuteCommandTool_1 = require("../tools/ExecuteCommandTool")
const UseMcpToolTool_1 = require("../tools/UseMcpToolTool")
const accessMcpResourceTool_1 = require("../tools/accessMcpResourceTool")
const AskFollowupQuestionTool_1 = require("../tools/AskFollowupQuestionTool")
const SwitchModeTool_1 = require("../tools/SwitchModeTool")
const AttemptCompletionTool_1 = require("../tools/AttemptCompletionTool")
const NewTaskTool_1 = require("../tools/NewTaskTool")
const UpdateTodoListTool_1 = require("../tools/UpdateTodoListTool")
const RunSlashCommandTool_1 = require("../tools/RunSlashCommandTool")
const SkillTool_1 = require("../tools/SkillTool")
const GenerateImageTool_1 = require("../tools/GenerateImageTool")
const ApplyDiffTool_1 = require("../tools/ApplyDiffTool")
const validateToolUse_1 = require("../tools/validateToolUse")
const CodebaseSearchTool_1 = require("../tools/CodebaseSearchTool")
const responses_1 = require("../prompts/responses")
const tool_id_1 = require("../../utils/tool-id")
/**
 * Processes and presents assistant message content to the user interface.
 *
 * This function is the core message handling system that:
 * - Sequentially processes content blocks from the assistant's response.
 * - Displays text content to the user.
 * - Executes tool use requests with appropriate user approval.
 * - Manages the flow of conversation by determining when to proceed to the next content block.
 * - Coordinates file system checkpointing for modified files.
 * - Controls the conversation state to determine when to continue to the next request.
 *
 * The function uses a locking mechanism to prevent concurrent execution and handles
 * partial content blocks during streaming. It's designed to work with the streaming
 * API response pattern, where content arrives incrementally and needs to be processed
 * as it becomes available.
 */
async function presentAssistantMessage(cline) {
	if (cline.abort) {
		throw new Error(`[Task#presentAssistantMessage] task ${cline.taskId}.${cline.instanceId} aborted`)
	}
	if (cline.presentAssistantMessageLocked) {
		cline.presentAssistantMessageHasPendingUpdates = true
		return
	}
	cline.presentAssistantMessageLocked = true
	cline.presentAssistantMessageHasPendingUpdates = false
	if (cline.currentStreamingContentIndex >= cline.assistantMessageContent.length) {
		// This may happen if the last content block was completed before
		// streaming could finish. If streaming is finished, and we're out of
		// bounds then this means we already  presented/executed the last
		// content block and are ready to continue to next request.
		if (cline.didCompleteReadingStream) {
			cline.userMessageContentReady = true
		}
		cline.presentAssistantMessageLocked = false
		return
	}
	let block
	try {
		// Performance optimization: Use shallow copy instead of deep clone.
		// The block is used read-only throughout this function - we never mutate its properties.
		// We only need to protect against the reference changing during streaming, not nested mutations.
		// This provides 80-90% reduction in cloning overhead (5-100ms saved per block).
		block = { ...cline.assistantMessageContent[cline.currentStreamingContentIndex] }
	} catch (error) {
		console.error(`ERROR cloning block:`, error)
		console.error(
			`Block content:`,
			JSON.stringify(cline.assistantMessageContent[cline.currentStreamingContentIndex], null, 2),
		)
		cline.presentAssistantMessageLocked = false
		return
	}
	switch (block.type) {
		case "mcp_tool_use": {
			// Handle native MCP tool calls (from mcp_serverName_toolName dynamic tools)
			// These are converted to the same execution path as use_mcp_tool but preserve
			// their original name in API history
			const mcpBlock = block
			if (cline.didRejectTool) {
				// For native protocol, we must send a tool_result for every tool_use to avoid API errors
				const toolCallId = mcpBlock.id
				const errorMessage = !mcpBlock.partial
					? `Skipping MCP tool ${mcpBlock.name} due to user rejecting a previous tool.`
					: `MCP tool ${mcpBlock.name} was interrupted and not executed due to user rejecting a previous tool.`
				if (toolCallId) {
					cline.pushToolResultToUserContent({
						type: "tool_result",
						tool_use_id: (0, tool_id_1.sanitizeToolUseId)(toolCallId),
						content: errorMessage,
						is_error: true,
					})
				}
				break
			}
			// Track if we've already pushed a tool result
			let hasToolResult = false
			const toolCallId = mcpBlock.id
			// Store approval feedback to merge into tool result (GitHub #10465)
			let approvalFeedback
			const pushToolResult = (content, feedbackImages) => {
				if (hasToolResult) {
					console.warn(
						`[presentAssistantMessage] Skipping duplicate tool_result for mcp_tool_use: ${toolCallId}`,
					)
					return
				}
				let resultContent
				let imageBlocks = []
				if (typeof content === "string") {
					resultContent = content || "(tool did not return anything)"
				} else {
					const textBlocks = content.filter((item) => item.type === "text")
					imageBlocks = content.filter((item) => item.type === "image")
					resultContent = textBlocks.map((item) => item.text).join("\n") || "(tool did not return anything)"
				}
				// Merge approval feedback into tool result (GitHub #10465)
				if (approvalFeedback) {
					const feedbackText = responses_1.formatResponse.toolApprovedWithFeedback(approvalFeedback.text)
					resultContent = `${feedbackText}\n\n${resultContent}`
					// Add feedback images to the image blocks
					if (approvalFeedback.images) {
						const feedbackImageBlocks = responses_1.formatResponse.imageBlocks(approvalFeedback.images)
						imageBlocks = [...feedbackImageBlocks, ...imageBlocks]
					}
				}
				if (toolCallId) {
					cline.pushToolResultToUserContent({
						type: "tool_result",
						tool_use_id: (0, tool_id_1.sanitizeToolUseId)(toolCallId),
						content: resultContent,
					})
					if (imageBlocks.length > 0) {
						cline.userMessageContent.push(...imageBlocks)
					}
				}
				hasToolResult = true
			}
			const toolDescription = () => `[mcp_tool: ${mcpBlock.serverName}/${mcpBlock.toolName}]`
			const askApproval = async (type, partialMessage, progressStatus, isProtected) => {
				const { response, text, images } = await cline.ask(
					type,
					partialMessage,
					false,
					progressStatus,
					isProtected || false,
				)
				if (response !== "yesButtonClicked") {
					if (text) {
						await cline.say("user_feedback", text, images)
						pushToolResult(
							responses_1.formatResponse.toolResult(
								responses_1.formatResponse.toolDeniedWithFeedback(text),
								images,
							),
						)
					} else {
						pushToolResult(responses_1.formatResponse.toolDenied())
					}
					cline.didRejectTool = true
					return false
				}
				// Store approval feedback to be merged into tool result (GitHub #10465)
				// Don't push it as a separate tool_result here - that would create duplicates.
				// The tool will call pushToolResult, which will merge the feedback into the actual result.
				if (text) {
					await cline.say("user_feedback", text, images)
					approvalFeedback = { text, images }
				}
				return true
			}
			const handleError = async (action, error) => {
				// Silently ignore AskIgnoredError - this is an internal control flow
				// signal, not an actual error. It occurs when a newer ask supersedes an older one.
				if (error instanceof AskIgnoredError_1.AskIgnoredError) {
					return
				}
				const errorString = `Error ${action}: ${JSON.stringify((0, serialize_error_1.serializeError)(error))}`
				await cline.say(
					"error",
					`Error ${action}:\n${error.message ?? JSON.stringify((0, serialize_error_1.serializeError)(error), null, 2)}`,
				)
				pushToolResult(responses_1.formatResponse.toolError(errorString))
			}
			if (!mcpBlock.partial) {
				cline.recordToolUsage("use_mcp_tool")
			}
			// Resolve sanitized server name back to original server name
			// The serverName from parsing is sanitized (e.g., "my_server" from "my server")
			// We need the original name to find the actual MCP connection
			const mcpHub = cline.providerRef.deref()?.getMcpHub()
			let resolvedServerName = mcpBlock.serverName
			if (mcpHub) {
				const originalName = mcpHub.findServerNameBySanitizedName(mcpBlock.serverName)
				if (originalName) {
					resolvedServerName = originalName
				}
			}
			// Execute the MCP tool using the same handler as use_mcp_tool
			// Create a synthetic ToolUse block that the useMcpToolTool can handle
			const syntheticToolUse = {
				type: "tool_use",
				id: mcpBlock.id,
				name: "use_mcp_tool",
				params: {
					server_name: resolvedServerName,
					tool_name: mcpBlock.toolName,
					arguments: JSON.stringify(mcpBlock.arguments),
				},
				partial: mcpBlock.partial,
				nativeArgs: {
					server_name: resolvedServerName,
					tool_name: mcpBlock.toolName,
					arguments: mcpBlock.arguments,
				},
			}
			await UseMcpToolTool_1.useMcpToolTool.handle(cline, syntheticToolUse, {
				askApproval,
				handleError,
				pushToolResult,
			})
			break
		}
		case "text": {
			if (cline.didRejectTool || cline.didAlreadyUseTool) {
				break
			}
			let content = block.content
			if (content) {
				// Have to do this for partial and complete since sending
				// content in thinking tags to markdown renderer will
				// automatically be removed.
				// Strip any streamed <thinking> tags from text output.
				content = content.replace(/<thinking>\s?/g, "")
				content = content.replace(/\s?<\/thinking>/g, "")
			}
			await cline.say("text", content, undefined, block.partial)
			break
		}
		case "tool_use": {
			// Native tool calling is the only supported tool calling mechanism.
			// A tool_use block without an id is invalid and cannot be executed.
			const toolCallId = block.id
			if (!toolCallId) {
				const errorMessage =
					"Invalid tool call: missing tool_use.id. XML tool calls are no longer supported. Remove any XML tool markup (e.g. <read_file>...</read_file>) and use native tool calling instead."
				// Record a tool error for visibility. Use the reported tool name if present.
				try {
					if (typeof cline.recordToolError === "function" && typeof block.name === "string") {
						cline.recordToolError(block.name, errorMessage)
					}
				} catch {
					// Best-effort only
				}
				cline.consecutiveMistakeCount++
				await cline.say("error", errorMessage)
				cline.userMessageContent.push({ type: "text", text: errorMessage })
				cline.didAlreadyUseTool = true
				break
			}
			// Fetch state early so it's available for toolDescription and validation
			const state = await cline.providerRef.deref()?.getState()
			const { mode, customModes, experiments: stateExperiments, disabledTools } = state ?? {}
			const toolDescription = () => {
				switch (block.name) {
					case "execute_command":
						return `[${block.name} for '${block.params.command}']`
					case "read_file":
						// Prefer native typed args when available; fall back to legacy params
						// Check if nativeArgs exists (native protocol)
						if (block.nativeArgs) {
							return ReadFileTool_1.readFileTool.getReadFileToolDescription(block.name, block.nativeArgs)
						}
						return ReadFileTool_1.readFileTool.getReadFileToolDescription(block.name, block.params)
					case "write_to_file":
						return `[${block.name} for '${block.params.path}']`
					case "apply_diff":
						// Native-only: tool args are structured (no XML payloads).
						return block.params?.path ? `[${block.name} for '${block.params.path}']` : `[${block.name}]`
					case "search_files":
						return `[${block.name} for '${block.params.regex}'${block.params.file_pattern ? ` in '${block.params.file_pattern}'` : ""}]`
					case "edit":
					case "search_and_replace":
						return `[${block.name} for '${block.params.file_path}']`
					case "search_replace":
						return `[${block.name} for '${block.params.file_path}']`
					case "edit_file":
						return `[${block.name} for '${block.params.file_path}']`
					case "apply_patch":
						return `[${block.name}]`
					case "list_files":
						return `[${block.name} for '${block.params.path}']`
					case "use_mcp_tool":
						return `[${block.name} for '${block.params.server_name}']`
					case "access_mcp_resource":
						return `[${block.name} for '${block.params.server_name}']`
					case "ask_followup_question":
						return `[${block.name} for '${block.params.question}']`
					case "attempt_completion":
						return `[${block.name}]`
					case "switch_mode":
						return `[${block.name} to '${block.params.mode_slug}'${block.params.reason ? ` because: ${block.params.reason}` : ""}]`
					case "codebase_search":
						return `[${block.name} for '${block.params.query}']`
					case "read_command_output":
						return `[${block.name} for '${block.params.artifact_id}']`
					case "update_todo_list":
						return `[${block.name}]`
					case "new_task": {
						const mode = block.params.mode ?? modes_1.defaultModeSlug
						const message = block.params.message ?? "(no message)"
						const modeName = (0, modes_1.getModeBySlug)(mode, customModes)?.name ?? mode
						return `[${block.name} in ${modeName} mode: '${message}']`
					}
					case "run_slash_command":
						return `[${block.name} for '${block.params.command}'${block.params.args ? ` with args: ${block.params.args}` : ""}]`
					case "skill":
						return `[${block.name} for '${block.params.skill}'${block.params.args ? ` with args: ${block.params.args}` : ""}]`
					case "generate_image":
						return `[${block.name} for '${block.params.path}']`
					default:
						return `[${block.name}]`
				}
			}
			if (cline.didRejectTool) {
				// Ignore any tool content after user has rejected tool once.
				// For native tool calling, we must send a tool_result for every tool_use to avoid API errors
				const errorMessage = !block.partial
					? `Skipping tool ${toolDescription()} due to user rejecting a previous tool.`
					: `Tool ${toolDescription()} was interrupted and not executed due to user rejecting a previous tool.`
				cline.pushToolResultToUserContent({
					type: "tool_result",
					tool_use_id: (0, tool_id_1.sanitizeToolUseId)(toolCallId),
					content: errorMessage,
					is_error: true,
				})
				break
			}
			// Track if we've already pushed a tool result for this tool call (native tool calling only)
			let hasToolResult = false
			// If this is a native tool call but the parser couldn't construct nativeArgs
			// (e.g., malformed/unfinished JSON in a streaming tool call), we must NOT attempt to
			// execute the tool. Instead, emit exactly one structured tool_result so the provider
			// receives a matching tool_result for the tool_use_id.
			//
			// This avoids executing an invalid tool_use block and prevents duplicate/fragmented
			// error reporting.
			if (!block.partial) {
				const customTool = stateExperiments?.customTools ? core_1.customToolRegistry.get(block.name) : undefined
				const isKnownTool = (0, validateToolUse_1.isValidToolName)(String(block.name), stateExperiments)
				if (isKnownTool && !block.nativeArgs && !customTool) {
					const errorMessage =
						`Invalid tool call for '${block.name}': missing nativeArgs. ` +
						`This usually means the model streamed invalid or incomplete arguments and the call could not be finalized.`
					cline.consecutiveMistakeCount++
					try {
						cline.recordToolError(block.name, errorMessage)
					} catch {
						// Best-effort only
					}
					// Push tool_result directly without setting didAlreadyUseTool so streaming can
					// continue gracefully.
					cline.pushToolResultToUserContent({
						type: "tool_result",
						tool_use_id: (0, tool_id_1.sanitizeToolUseId)(toolCallId),
						content: responses_1.formatResponse.toolError(errorMessage),
						is_error: true,
					})
					break
				}
			}
			// Store approval feedback to merge into tool result (GitHub #10465)
			let approvalFeedback
			const pushToolResult = (content) => {
				// Native tool calling: only allow ONE tool_result per tool call
				if (hasToolResult) {
					console.warn(
						`[presentAssistantMessage] Skipping duplicate tool_result for tool_use_id: ${toolCallId}`,
					)
					return
				}
				let resultContent
				let imageBlocks = []
				if (typeof content === "string") {
					resultContent = content || "(tool did not return anything)"
				} else {
					const textBlocks = content.filter((item) => item.type === "text")
					imageBlocks = content.filter((item) => item.type === "image")
					resultContent = textBlocks.map((item) => item.text).join("\n") || "(tool did not return anything)"
				}
				// Merge approval feedback into tool result (GitHub #10465)
				if (approvalFeedback) {
					const feedbackText = responses_1.formatResponse.toolApprovedWithFeedback(approvalFeedback.text)
					resultContent = `${feedbackText}\n\n${resultContent}`
					if (approvalFeedback.images) {
						const feedbackImageBlocks = responses_1.formatResponse.imageBlocks(approvalFeedback.images)
						imageBlocks = [...feedbackImageBlocks, ...imageBlocks]
					}
				}
				cline.pushToolResultToUserContent({
					type: "tool_result",
					tool_use_id: (0, tool_id_1.sanitizeToolUseId)(toolCallId),
					content: resultContent,
				})
				if (imageBlocks.length > 0) {
					cline.userMessageContent.push(...imageBlocks)
				}
				hasToolResult = true
			}
			const askApproval = async (type, partialMessage, progressStatus, isProtected) => {
				const { response, text, images } = await cline.ask(
					type,
					partialMessage,
					false,
					progressStatus,
					isProtected || false,
				)
				if (response !== "yesButtonClicked") {
					// Handle both messageResponse and noButtonClicked with text.
					if (text) {
						await cline.say("user_feedback", text, images)
						pushToolResult(
							responses_1.formatResponse.toolResult(
								responses_1.formatResponse.toolDeniedWithFeedback(text),
								images,
							),
						)
					} else {
						pushToolResult(responses_1.formatResponse.toolDenied())
					}
					cline.didRejectTool = true
					return false
				}
				// Store approval feedback to be merged into tool result (GitHub #10465)
				// Don't push it as a separate tool_result here - that would create duplicates.
				// The tool will call pushToolResult, which will merge the feedback into the actual result.
				if (text) {
					await cline.say("user_feedback", text, images)
					approvalFeedback = { text, images }
				}
				return true
			}
			const askFinishSubTaskApproval = async () => {
				// Ask the user to approve this task has completed, and he has
				// reviewed it, and we can declare task is finished and return
				// control to the parent task to continue running the rest of
				// the sub-tasks.
				const toolMessage = JSON.stringify({ tool: "finishTask" })
				return await askApproval("tool", toolMessage)
			}
			const handleError = async (action, error) => {
				// Silently ignore AskIgnoredError - this is an internal control flow
				// signal, not an actual error. It occurs when a newer ask supersedes an older one.
				if (error instanceof AskIgnoredError_1.AskIgnoredError) {
					return
				}
				const errorString = `Error ${action}: ${JSON.stringify((0, serialize_error_1.serializeError)(error))}`
				await cline.say(
					"error",
					`Error ${action}:\n${error.message ?? JSON.stringify((0, serialize_error_1.serializeError)(error), null, 2)}`,
				)
				pushToolResult(responses_1.formatResponse.toolError(errorString))
			}
			if (!block.partial) {
				// Check if this is a custom tool - if so, record as "custom_tool" (like MCP tools)
				const isCustomTool = stateExperiments?.customTools && core_1.customToolRegistry.has(block.name)
				const recordName = isCustomTool ? "custom_tool" : block.name
				cline.recordToolUsage(recordName)
			}
			// Validate tool use before execution - ONLY for complete (non-partial) blocks.
			// Validating partial blocks would cause validation errors to be thrown repeatedly
			// during streaming, pushing multiple tool_results for the same tool_use_id and
			// potentially causing the stream to appear frozen.
			if (!block.partial) {
				const modelInfo = cline.api.getModel()
				// Resolve aliases in includedTools before validation
				// e.g., "edit_file" should resolve to "apply_diff"
				const rawIncludedTools = modelInfo?.info?.includedTools
				const { resolveToolAlias } = await import("../prompts/tools/filter-tools-for-mode")
				const includedTools = rawIncludedTools?.map((tool) => resolveToolAlias(tool))
				try {
					const toolRequirements =
						disabledTools?.reduce((acc, tool) => {
							acc[tool] = false
							const resolvedToolName = resolveToolAlias(tool)
							acc[resolvedToolName] = false
							return acc
						}, {}) ?? {}
					;(0, validateToolUse_1.validateToolUse)(
						block.name,
						mode ?? modes_1.defaultModeSlug,
						customModes ?? [],
						toolRequirements,
						block.params,
						stateExperiments,
						includedTools,
					)
				} catch (error) {
					cline.consecutiveMistakeCount++
					// For validation errors (unknown tool, tool not allowed for mode), we need to:
					// 1. Send a tool_result with the error (required for native tool calling)
					// 2. NOT set didAlreadyUseTool = true (the tool was never executed, just failed validation)
					// This prevents the stream from being interrupted with "Response interrupted by tool use result"
					// which would cause the extension to appear to hang
					const errorContent = responses_1.formatResponse.toolError(error.message)
					// Push tool_result directly without setting didAlreadyUseTool
					cline.pushToolResultToUserContent({
						type: "tool_result",
						tool_use_id: (0, tool_id_1.sanitizeToolUseId)(toolCallId),
						content: typeof errorContent === "string" ? errorContent : "(validation error)",
						is_error: true,
					})
					break
				}
			}
			// Check for identical consecutive tool calls.
			if (!block.partial) {
				// Use the detector to check for repetition, passing the ToolUse
				// block directly.
				const repetitionCheck = cline.toolRepetitionDetector.check(block)
				// If execution is not allowed, notify user and break.
				if (!repetitionCheck.allowExecution && repetitionCheck.askUser) {
					// Handle repetition similar to mistake_limit_reached pattern.
					const { response, text, images } = await cline.ask(
						repetitionCheck.askUser.messageKey,
						repetitionCheck.askUser.messageDetail.replace("{toolName}", block.name),
					)
					if (response === "messageResponse") {
						// Add user feedback to userContent.
						cline.userMessageContent.push(
							{
								type: "text",
								text: `Tool repetition limit reached. User feedback: ${text}`,
							},
							...responses_1.formatResponse.imageBlocks(images),
						)
						// Add user feedback to chat.
						await cline.say("user_feedback", text, images)
					}
					// Return tool result message about the repetition
					pushToolResult(
						responses_1.formatResponse.toolError(
							`Tool call repetition limit reached for ${block.name}. Please try a different approach.`,
						),
					)
					break
				}
			}
			switch (block.name) {
				case "write_to_file":
					await checkpointSaveAndMark(cline)
					await WriteToFileTool_1.writeToFileTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "update_todo_list":
					await UpdateTodoListTool_1.updateTodoListTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "apply_diff":
					await checkpointSaveAndMark(cline)
					await ApplyDiffTool_1.applyDiffTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "edit":
				case "search_and_replace":
					await checkpointSaveAndMark(cline)
					await EditTool_1.editTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "search_replace":
					await checkpointSaveAndMark(cline)
					await SearchReplaceTool_1.searchReplaceTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "edit_file":
					await checkpointSaveAndMark(cline)
					await EditFileTool_1.editFileTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "apply_patch":
					await checkpointSaveAndMark(cline)
					await ApplyPatchTool_1.applyPatchTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "read_file":
					// Type assertion is safe here because we're in the "read_file" case
					await ReadFileTool_1.readFileTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "list_files":
					await ListFilesTool_1.listFilesTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "codebase_search":
					await CodebaseSearchTool_1.codebaseSearchTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "search_files":
					await SearchFilesTool_1.searchFilesTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "execute_command":
					await ExecuteCommandTool_1.executeCommandTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "read_command_output":
					await ReadCommandOutputTool_1.readCommandOutputTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "use_mcp_tool":
					await UseMcpToolTool_1.useMcpToolTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "access_mcp_resource":
					await accessMcpResourceTool_1.accessMcpResourceTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "ask_followup_question":
					await AskFollowupQuestionTool_1.askFollowupQuestionTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "switch_mode":
					await SwitchModeTool_1.switchModeTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "new_task":
					await checkpointSaveAndMark(cline)
					await NewTaskTool_1.newTaskTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
						toolCallId: block.id,
					})
					break
				case "attempt_completion": {
					const completionCallbacks = {
						askApproval,
						handleError,
						pushToolResult,
						askFinishSubTaskApproval,
						toolDescription,
					}
					await AttemptCompletionTool_1.attemptCompletionTool.handle(cline, block, completionCallbacks)
					break
				}
				case "run_slash_command":
					await RunSlashCommandTool_1.runSlashCommandTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "skill":
					await SkillTool_1.skillTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				case "generate_image":
					await checkpointSaveAndMark(cline)
					await GenerateImageTool_1.generateImageTool.handle(cline, block, {
						askApproval,
						handleError,
						pushToolResult,
					})
					break
				default: {
					// Handle unknown/invalid tool names OR custom tools
					// This is critical for native tool calling where every tool_use MUST have a tool_result
					// CRITICAL: Don't process partial blocks for unknown tools - just let them stream in.
					// If we try to show errors for partial blocks, we'd show the error on every streaming chunk,
					// creating a loop that appears to freeze the extension. Only handle complete blocks.
					if (block.partial) {
						break
					}
					const customTool = stateExperiments?.customTools
						? core_1.customToolRegistry.get(block.name)
						: undefined
					if (customTool) {
						try {
							let customToolArgs
							if (customTool.parameters) {
								try {
									customToolArgs = customTool.parameters.parse(block.nativeArgs || block.params || {})
								} catch (parseParamsError) {
									const message = `Custom tool "${block.name}" argument validation failed: ${parseParamsError.message}`
									console.error(message)
									cline.consecutiveMistakeCount++
									await cline.say("error", message)
									pushToolResult(responses_1.formatResponse.toolError(message))
									break
								}
							}
							const result = await customTool.execute(customToolArgs, {
								mode: mode ?? modes_1.defaultModeSlug,
								task: cline,
							})
							console.log(
								`${customTool.name}.execute(): ${JSON.stringify(customToolArgs)} -> ${JSON.stringify(result)}`,
							)
							pushToolResult(result)
							cline.consecutiveMistakeCount = 0
						} catch (executionError) {
							cline.consecutiveMistakeCount++
							// Record custom tool error with static name
							cline.recordToolError("custom_tool", executionError.message)
							await handleError(`executing custom tool "${block.name}"`, executionError)
						}
						break
					}
					// Not a custom tool - handle as unknown tool error
					const errorMessage = `Unknown tool "${block.name}". This tool does not exist. Please use one of the available tools.`
					cline.consecutiveMistakeCount++
					cline.recordToolError(block.name, errorMessage)
					await cline.say("error", (0, i18n_1.t)("tools:unknownToolError", { toolName: block.name }))
					// Push tool_result directly WITHOUT setting didAlreadyUseTool
					// This prevents the stream from being interrupted with "Response interrupted by tool use result"
					cline.pushToolResultToUserContent({
						type: "tool_result",
						tool_use_id: (0, tool_id_1.sanitizeToolUseId)(toolCallId),
						content: responses_1.formatResponse.toolError(errorMessage),
						is_error: true,
					})
					break
				}
			}
			break
		}
	}
	// Seeing out of bounds is fine, it means that the next too call is being
	// built up and ready to add to assistantMessageContent to present.
	// When you see the UI inactive during this, it means that a tool is
	// breaking without presenting any UI. For example the write_to_file tool
	// was breaking when relpath was undefined, and for invalid relpath it never
	// presented UI.
	// This needs to be placed here, if not then calling
	// cline.presentAssistantMessage below would fail (sometimes) since it's
	// locked.
	cline.presentAssistantMessageLocked = false
	// NOTE: When tool is rejected, iterator stream is interrupted and it waits
	// for `userMessageContentReady` to be true. Future calls to present will
	// skip execution since `didRejectTool` and iterate until `contentIndex` is
	// set to message length and it sets userMessageContentReady to true itself
	// (instead of preemptively doing it in iterator).
	if (!block.partial || cline.didRejectTool || cline.didAlreadyUseTool) {
		// Block is finished streaming and executing.
		if (cline.currentStreamingContentIndex === cline.assistantMessageContent.length - 1) {
			// It's okay that we increment if !didCompleteReadingStream, it'll
			// just return because out of bounds and as streaming continues it
			// will call `presentAssitantMessage` if a new block is ready. If
			// streaming is finished then we set `userMessageContentReady` to
			// true when out of bounds. This gracefully allows the stream to
			// continue on and all potential content blocks be presented.
			// Last block is complete and it is finished executing
			cline.userMessageContentReady = true // Will allow `pWaitFor` to continue.
		}
		// Call next block if it exists (if not then read stream will call it
		// when it's ready).
		// Need to increment regardless, so when read stream calls this function
		// again it will be streaming the next block.
		cline.currentStreamingContentIndex++
		if (cline.currentStreamingContentIndex < cline.assistantMessageContent.length) {
			// There are already more content blocks to stream, so we'll call
			// this function ourselves.
			presentAssistantMessage(cline)
			return
		} else {
			// CRITICAL FIX: If we're out of bounds and the stream is complete, set userMessageContentReady
			// This handles the case where assistantMessageContent is empty or becomes empty after processing
			if (cline.didCompleteReadingStream) {
				cline.userMessageContentReady = true
			}
		}
	}
	// Block is partial, but the read stream may have finished.
	if (cline.presentAssistantMessageHasPendingUpdates) {
		presentAssistantMessage(cline)
	}
}
/**
 * save checkpoint and mark done in the current streaming task.
 * @param task The Task instance to checkpoint save and mark.
 * @returns
 */
async function checkpointSaveAndMark(task) {
	if (task.currentStreamingDidCheckpoint) {
		return
	}
	try {
		await task.checkpointSave(true)
		task.currentStreamingDidCheckpoint = true
	} catch (error) {
		console.error(`[Task#presentAssistantMessage] Error saving checkpoint: ${error.message}`, error)
	}
}
