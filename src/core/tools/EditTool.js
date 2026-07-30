"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.searchAndReplaceTool = exports.editTool = exports.EditTool = void 0
const promises_1 = __importDefault(require("fs/promises"))
const path_1 = __importDefault(require("path"))
const types_1 = require("@ali-code/types")
const path_2 = require("../../utils/path")
const pathUtils_1 = require("../../utils/pathUtils")
const responses_1 = require("../prompts/responses")
const fs_1 = require("../../utils/fs")
const experiments_1 = require("../../shared/experiments")
const stats_1 = require("../diff/stats")
const BaseTool_1 = require("./BaseTool")
class EditTool extends BaseTool_1.BaseTool {
	name = "edit"
	async execute(params, task, callbacks) {
		const { file_path: relPath, old_string: oldString, new_string: newString, replace_all: replaceAll } = params
		const { askApproval, handleError, pushToolResult } = callbacks
		try {
			// Validate required parameters
			if (!relPath) {
				task.consecutiveMistakeCount++
				task.recordToolError("edit")
				pushToolResult(await task.sayAndCreateMissingParamError("edit", "file_path"))
				return
			}
			if (!oldString) {
				task.consecutiveMistakeCount++
				task.recordToolError("edit")
				pushToolResult(await task.sayAndCreateMissingParamError("edit", "old_string"))
				return
			}
			if (newString === undefined) {
				task.consecutiveMistakeCount++
				task.recordToolError("edit")
				pushToolResult(await task.sayAndCreateMissingParamError("edit", "new_string"))
				return
			}
			// Check old_string !== new_string
			if (oldString === newString) {
				task.consecutiveMistakeCount++
				task.recordToolError("edit")
				pushToolResult(
					responses_1.formatResponse.toolError(
						"'old_string' and 'new_string' are identical. No changes needed. If you want to make a change, ensure 'old_string' and 'new_string' are different.",
					),
				)
				return
			}
			const accessAllowed = task.aliIgnoreController?.validateAccess(relPath)
			if (!accessAllowed) {
				await task.say("rooignore_error", relPath)
				pushToolResult(responses_1.formatResponse.rooIgnoreError(relPath))
				return
			}
			// Check if file is write-protected
			const isWriteProtected = task.aliProtectedController?.isWriteProtected(relPath) || false
			const absolutePath = path_1.default.resolve(task.cwd, relPath)
			const fileExists = await (0, fs_1.fileExistsAtPath)(absolutePath)
			if (!fileExists) {
				task.consecutiveMistakeCount++
				task.recordToolError("edit")
				const errorMessage = `File not found: ${relPath}. Cannot perform edit on a non-existent file.`
				await task.say("error", errorMessage)
				pushToolResult(responses_1.formatResponse.toolError(errorMessage))
				return
			}
			let fileContent
			try {
				fileContent = await promises_1.default.readFile(absolutePath, "utf8")
				// Normalize line endings to LF for consistent matching
				fileContent = fileContent.replace(/\r\n/g, "\n")
			} catch (error) {
				task.consecutiveMistakeCount++
				task.recordToolError("edit")
				const errorMessage = `Failed to read file '${relPath}'. Please verify file permissions and try again.`
				await task.say("error", errorMessage)
				pushToolResult(responses_1.formatResponse.toolError(errorMessage))
				return
			}
			// Normalize line endings in old_string/new_string to match file content
			const normalizedOld = oldString.replace(/\r\n/g, "\n")
			const normalizedNew = newString.replace(/\r\n/g, "\n")
			// Count occurrences of old_string in file content
			const matchCount = fileContent.split(normalizedOld).length - 1
			if (matchCount === 0) {
				task.consecutiveMistakeCount++
				task.recordToolError("edit", "no_match")
				pushToolResult(
					responses_1.formatResponse.toolError(
						`No match found for 'old_string' in ${relPath}. Make sure the text to find appears exactly in the file, including whitespace and indentation.`,
					),
				)
				return
			}
			// Uniqueness check when replace_all is not enabled
			if (!replaceAll && matchCount > 1) {
				task.consecutiveMistakeCount++
				task.recordToolError("edit")
				pushToolResult(
					responses_1.formatResponse.toolError(
						`Found ${matchCount} matches of 'old_string' in the file. Use 'replace_all: true' to replace all occurrences, or provide more context in 'old_string' to make it unique.`,
					),
				)
				return
			}
			// Apply the replacement
			let newContent
			if (replaceAll) {
				// Replace all occurrences
				const searchPattern = new RegExp(escapeRegExp(normalizedOld), "g")
				newContent = fileContent.replace(searchPattern, () => normalizedNew)
			} else {
				// Replace single occurrence (already verified uniqueness above)
				newContent = fileContent.replace(normalizedOld, () => normalizedNew)
			}
			// Check if any changes were made
			if (newContent === fileContent) {
				pushToolResult(`No changes needed for '${relPath}'`)
				return
			}
			task.consecutiveMistakeCount = 0
			// Initialize diff view
			task.diffViewProvider.editType = "modify"
			task.diffViewProvider.originalContent = fileContent
			// Generate and validate diff
			const diff = responses_1.formatResponse.createPrettyPatch(relPath, fileContent, newContent)
			if (!diff) {
				pushToolResult(`No changes needed for '${relPath}'`)
				await task.diffViewProvider.reset()
				return
			}
			// Check if preventFocusDisruption experiment is enabled
			const provider = task.providerRef.deref()
			const state = await provider?.getState()
			const diagnosticsEnabled = state?.diagnosticsEnabled ?? true
			const writeDelayMs = state?.writeDelayMs ?? types_1.DEFAULT_WRITE_DELAY_MS
			const isPreventFocusDisruptionEnabled = experiments_1.experiments.isEnabled(
				state?.experiments ?? {},
				experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION,
			)
			const sanitizedDiff = (0, stats_1.sanitizeUnifiedDiff)(diff)
			const diffStats = (0, stats_1.computeDiffStats)(sanitizedDiff) || undefined
			const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
			const sharedMessageProps = {
				tool: "appliedDiff",
				path: (0, path_2.getReadablePath)(task.cwd, relPath),
				diff: sanitizedDiff,
				isOutsideWorkspace,
			}
			const completeMessage = JSON.stringify({
				...sharedMessageProps,
				content: sanitizedDiff,
				isProtected: isWriteProtected,
				diffStats,
			})
			// Show diff view if focus disruption prevention is disabled
			if (!isPreventFocusDisruptionEnabled) {
				await task.diffViewProvider.open(relPath)
				await task.diffViewProvider.update(newContent, true)
				task.diffViewProvider.scrollToFirstDiff()
			}
			const didApprove = await askApproval("tool", completeMessage, undefined, isWriteProtected)
			if (!didApprove) {
				// Revert changes if diff view was shown
				if (!isPreventFocusDisruptionEnabled) {
					await task.diffViewProvider.revertChanges()
				}
				pushToolResult("Changes were rejected by the user.")
				await task.diffViewProvider.reset()
				return
			}
			// Save the changes
			if (isPreventFocusDisruptionEnabled) {
				// Direct file write without diff view or opening the file
				await task.diffViewProvider.saveDirectly(relPath, newContent, false, diagnosticsEnabled, writeDelayMs)
			} else {
				// Call saveChanges to update the DiffViewProvider properties
				await task.diffViewProvider.saveChanges(diagnosticsEnabled, writeDelayMs)
			}
			// Track file edit operation
			if (relPath) {
				await task.fileContextTracker.trackFileContext(relPath, "roo_edited")
			}
			task.didEditFile = true
			// Get the formatted response message
			const message = await task.diffViewProvider.pushToolWriteResult(task, task.cwd, false)
			pushToolResult(message)
			// Record successful tool usage and cleanup
			task.recordToolUsage("edit")
			await task.diffViewProvider.reset()
			this.resetPartialState()
			// Process any queued messages after file edit completes
			task.processQueuedMessages()
		} catch (error) {
			await handleError("edit", error)
			await task.diffViewProvider.reset()
			this.resetPartialState()
		}
	}
	async handlePartial(task, block) {
		const relPath = block.params.file_path
		// Wait for path to stabilize before showing UI (prevents truncated paths)
		if (!this.hasPathStabilized(relPath)) {
			return
		}
		// relPath is guaranteed non-null after hasPathStabilized
		const absolutePath = path_1.default.resolve(task.cwd, relPath)
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
		const sharedMessageProps = {
			tool: "appliedDiff",
			path: (0, path_2.getReadablePath)(task.cwd, relPath),
			diff: block.params.old_string ? "1 edit operation" : undefined,
			isOutsideWorkspace,
		}
		await task.ask("tool", JSON.stringify(sharedMessageProps), block.partial).catch(() => {})
	}
}
exports.EditTool = EditTool
/**
 * Escapes special regex characters in a string
 * @param input String to escape regex characters in
 * @returns Escaped string safe for regex pattern matching
 */
function escapeRegExp(input) {
	return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
exports.editTool = new EditTool()
exports.searchAndReplaceTool = exports.editTool // alias for backward compat
