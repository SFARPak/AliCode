"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.applyDiffTool = exports.ApplyDiffTool = void 0
const path_1 = __importDefault(require("path"))
const promises_1 = __importDefault(require("fs/promises"))
const types_1 = require("@ali-code/types")
const path_2 = require("../../utils/path")
const responses_1 = require("../prompts/responses")
const fs_1 = require("../../utils/fs")
const text_normalization_1 = require("../../utils/text-normalization")
const experiments_1 = require("../../shared/experiments")
const stats_1 = require("../diff/stats")
const BaseTool_1 = require("./BaseTool")
class ApplyDiffTool extends BaseTool_1.BaseTool {
	name = "apply_diff"
	async execute(params, task, callbacks) {
		const { askApproval, handleError, pushToolResult } = callbacks
		let { path: relPath, diff: diffContent } = params
		if (diffContent && !task.api.getModel().id.includes("claude")) {
			diffContent = (0, text_normalization_1.unescapeHtmlEntities)(diffContent)
		}
		try {
			if (!relPath) {
				task.consecutiveMistakeCount++
				task.recordToolError("apply_diff")
				pushToolResult(await task.sayAndCreateMissingParamError("apply_diff", "path"))
				return
			}
			if (!diffContent) {
				task.consecutiveMistakeCount++
				task.recordToolError("apply_diff")
				pushToolResult(await task.sayAndCreateMissingParamError("apply_diff", "diff"))
				return
			}
			const accessAllowed = task.aliIgnoreController?.validateAccess(relPath)
			if (!accessAllowed) {
				await task.say("rooignore_error", relPath)
				pushToolResult(responses_1.formatResponse.rooIgnoreError(relPath))
				return
			}
			const absolutePath = path_1.default.resolve(task.cwd, relPath)
			const fileExists = await (0, fs_1.fileExistsAtPath)(absolutePath)
			if (!fileExists) {
				task.consecutiveMistakeCount++
				task.recordToolError("apply_diff")
				const formattedError = `File does not exist at path: ${absolutePath}\n\n<error_details>\nThe specified file could not be found. Please verify the file path and try again.\n</error_details>`
				await task.say("error", formattedError)
				task.didToolFailInCurrentTurn = true
				pushToolResult(formattedError)
				return
			}
			const originalContent = await promises_1.default.readFile(absolutePath, "utf-8")
			// Apply the diff to the original content
			const diffResult = (await task.diffStrategy?.applyDiff(
				originalContent,
				diffContent,
				parseInt(params.diff.match(/:start_line:(\d+)/)?.[1] ?? ""),
			)) ?? {
				success: false,
				error: "No diff strategy available",
			}
			if (!diffResult.success) {
				task.consecutiveMistakeCount++
				const currentCount = (task.consecutiveMistakeCountForApplyDiff.get(relPath) || 0) + 1
				task.consecutiveMistakeCountForApplyDiff.set(relPath, currentCount)
				let formattedError = ""
				if (diffResult.failParts && diffResult.failParts.length > 0) {
					for (const failPart of diffResult.failParts) {
						if (failPart.success) {
							continue
						}
						const errorDetails = failPart.details ? JSON.stringify(failPart.details, null, 2) : ""
						formattedError = `<error_details>\n${failPart.error}${errorDetails ? `\n\nDetails:\n${errorDetails}` : ""}\n</error_details>`
					}
				} else {
					const errorDetails = diffResult.details ? JSON.stringify(diffResult.details, null, 2) : ""
					formattedError = `Unable to apply diff to file: ${absolutePath}\n\n<error_details>\n${diffResult.error}${errorDetails ? `\n\nDetails:\n${errorDetails}` : ""}\n</error_details>`
				}
				if (currentCount >= 2) {
					await task.say("diff_error", formattedError)
				}
				task.recordToolError("apply_diff", formattedError)
				pushToolResult(formattedError)
				return
			}
			task.consecutiveMistakeCount = 0
			task.consecutiveMistakeCountForApplyDiff.delete(relPath)
			// Generate backend-unified diff for display in chat/webview
			const unifiedPatchRaw = responses_1.formatResponse.createPrettyPatch(
				relPath,
				originalContent,
				diffResult.content,
			)
			const unifiedPatch = (0, stats_1.sanitizeUnifiedDiff)(unifiedPatchRaw)
			const diffStats = (0, stats_1.computeDiffStats)(unifiedPatch) || undefined
			// Check if preventFocusDisruption experiment is enabled
			const provider = task.providerRef.deref()
			const state = await provider?.getState()
			const diagnosticsEnabled = state?.diagnosticsEnabled ?? true
			const writeDelayMs = state?.writeDelayMs ?? types_1.DEFAULT_WRITE_DELAY_MS
			const isPreventFocusDisruptionEnabled = experiments_1.experiments.isEnabled(
				state?.experiments ?? {},
				experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION,
			)
			// Check if file is write-protected
			const isWriteProtected = task.aliProtectedController?.isWriteProtected(relPath) || false
			const sharedMessageProps = {
				tool: "appliedDiff",
				path: (0, path_2.getReadablePath)(task.cwd, relPath),
				diff: diffContent,
			}
			if (isPreventFocusDisruptionEnabled) {
				// Direct file write without diff view
				const completeMessage = JSON.stringify({
					...sharedMessageProps,
					diff: diffContent,
					content: unifiedPatch,
					originalContent,
					diffStats,
					isProtected: isWriteProtected,
				})
				let toolProgressStatus
				if (task.diffStrategy && task.diffStrategy.getProgressStatus) {
					const block = {
						type: "tool_use",
						name: "apply_diff",
						params: { path: relPath, diff: diffContent },
						partial: false,
					}
					toolProgressStatus = task.diffStrategy.getProgressStatus(block, diffResult)
				}
				const didApprove = await askApproval("tool", completeMessage, toolProgressStatus, isWriteProtected)
				if (!didApprove) {
					return
				}
				// Save directly without showing diff view or opening the file
				task.diffViewProvider.editType = "modify"
				task.diffViewProvider.originalContent = originalContent
				await task.diffViewProvider.saveDirectly(
					relPath,
					diffResult.content,
					false,
					diagnosticsEnabled,
					writeDelayMs,
				)
			} else {
				// Original behavior with diff view
				// Show diff view before asking for approval
				task.diffViewProvider.editType = "modify"
				await task.diffViewProvider.open(relPath)
				await task.diffViewProvider.update(diffResult.content, true)
				task.diffViewProvider.scrollToFirstDiff()
				const completeMessage = JSON.stringify({
					...sharedMessageProps,
					diff: diffContent,
					content: unifiedPatch,
					originalContent,
					diffStats,
					isProtected: isWriteProtected,
				})
				let toolProgressStatus
				if (task.diffStrategy && task.diffStrategy.getProgressStatus) {
					const block = {
						type: "tool_use",
						name: "apply_diff",
						params: { path: relPath, diff: diffContent },
						partial: false,
					}
					toolProgressStatus = task.diffStrategy.getProgressStatus(block, diffResult)
				}
				const didApprove = await askApproval("tool", completeMessage, toolProgressStatus, isWriteProtected)
				if (!didApprove) {
					await task.diffViewProvider.revertChanges()
					task.processQueuedMessages()
					return
				}
				// Call saveChanges to update the DiffViewProvider properties
				await task.diffViewProvider.saveChanges(diagnosticsEnabled, writeDelayMs)
			}
			// Track file edit operation
			if (relPath) {
				await task.fileContextTracker.trackFileContext(relPath, "roo_edited")
			}
			// Used to determine if we should wait for busy terminal to update before sending api request
			task.didEditFile = true
			let partFailHint = ""
			if (diffResult.failParts && diffResult.failParts.length > 0) {
				partFailHint = `But unable to apply all diff parts to file: ${absolutePath}. Use the read_file tool to check the newest file version and re-apply diffs.\n`
			}
			// Get the formatted response message
			const message = await task.diffViewProvider.pushToolWriteResult(task, task.cwd, !fileExists)
			// Check for single SEARCH/REPLACE block warning
			const searchBlocks = (diffContent.match(/<<<<<<< SEARCH/g) || []).length
			const singleBlockNotice =
				searchBlocks === 1
					? "\n<notice>Making multiple related changes in a single apply_diff is more efficient. If other changes are needed in this file, please include them as additional SEARCH/REPLACE blocks.</notice>"
					: ""
			if (partFailHint) {
				pushToolResult(partFailHint + message + singleBlockNotice)
			} else {
				pushToolResult(message + singleBlockNotice)
			}
			await task.diffViewProvider.reset()
			this.resetPartialState()
			// Process any queued messages after file edit completes
			task.processQueuedMessages()
			return
		} catch (error) {
			await handleError("applying diff", error)
			await task.diffViewProvider.reset()
			this.resetPartialState()
			task.processQueuedMessages()
			return
		}
	}
	async handlePartial(task, block) {
		const relPath = block.params.path
		const diffContent = block.params.diff
		// Wait for path to stabilize before showing UI (prevents truncated paths)
		if (!this.hasPathStabilized(relPath)) {
			return
		}
		const sharedMessageProps = {
			tool: "appliedDiff",
			path: (0, path_2.getReadablePath)(task.cwd, relPath),
			diff: diffContent,
		}
		let toolProgressStatus
		if (task.diffStrategy && task.diffStrategy.getProgressStatus) {
			toolProgressStatus = task.diffStrategy.getProgressStatus(block)
		}
		if (toolProgressStatus && Object.keys(toolProgressStatus).length === 0) {
			return
		}
		await task.ask("tool", JSON.stringify(sharedMessageProps), block.partial, toolProgressStatus).catch(() => {})
	}
}
exports.ApplyDiffTool = ApplyDiffTool
exports.applyDiffTool = new ApplyDiffTool()
