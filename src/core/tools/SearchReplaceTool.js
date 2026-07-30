"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.searchReplaceTool = exports.SearchReplaceTool = void 0
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
class SearchReplaceTool extends BaseTool_1.BaseTool {
	name = "search_replace"
	async execute(params, task, callbacks) {
		const { file_path, old_string, new_string } = params
		const { askApproval, handleError, pushToolResult } = callbacks
		try {
			// Validate required parameters
			if (!file_path) {
				task.consecutiveMistakeCount++
				task.recordToolError("search_replace")
				pushToolResult(await task.sayAndCreateMissingParamError("search_replace", "file_path"))
				return
			}
			if (!old_string) {
				task.consecutiveMistakeCount++
				task.recordToolError("search_replace")
				pushToolResult(await task.sayAndCreateMissingParamError("search_replace", "old_string"))
				return
			}
			if (new_string === undefined) {
				task.consecutiveMistakeCount++
				task.recordToolError("search_replace")
				pushToolResult(await task.sayAndCreateMissingParamError("search_replace", "new_string"))
				return
			}
			// Validate that old_string and new_string are different
			if (old_string === new_string) {
				task.consecutiveMistakeCount++
				task.recordToolError("search_replace")
				pushToolResult(
					responses_1.formatResponse.toolError(
						"The 'old_string' and 'new_string' parameters must be different.",
					),
				)
				return
			}
			// Determine relative path - file_path can be absolute or relative
			let relPath
			if (path_1.default.isAbsolute(file_path)) {
				relPath = path_1.default.relative(task.cwd, file_path)
			} else {
				relPath = file_path
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
				task.recordToolError("search_replace")
				const errorMessage = `File not found: ${relPath}. Cannot perform search and replace on a non-existent file.`
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
				task.recordToolError("search_replace")
				const errorMessage = `Failed to read file '${relPath}'. Please verify file permissions and try again.`
				await task.say("error", errorMessage)
				pushToolResult(responses_1.formatResponse.toolError(errorMessage))
				return
			}
			// Normalize line endings in search/replace strings to match file content
			const normalizedOldString = old_string.replace(/\r\n/g, "\n")
			const normalizedNewString = new_string.replace(/\r\n/g, "\n")
			// Check for exact match (literal string, not regex)
			const matchCount = fileContent.split(normalizedOldString).length - 1
			if (matchCount === 0) {
				task.consecutiveMistakeCount++
				task.recordToolError("search_replace", "no_match")
				pushToolResult(
					responses_1.formatResponse.toolError(
						`No match found for the specified 'old_string'. Please ensure it matches the file contents exactly, including whitespace and indentation.`,
					),
				)
				return
			}
			if (matchCount > 1) {
				task.consecutiveMistakeCount++
				task.recordToolError("search_replace", "multiple_matches")
				pushToolResult(
					responses_1.formatResponse.toolError(
						`Found ${matchCount} matches for the specified 'old_string'. This tool can only replace ONE occurrence at a time. Please provide more context (3-5 lines before and after) to uniquely identify the specific instance you want to change.`,
					),
				)
				return
			}
			// Apply the single replacement
			const newContent = fileContent.replace(normalizedOldString, normalizedNewString)
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
			task.recordToolUsage("search_replace")
			await task.diffViewProvider.reset()
			this.resetPartialState()
			// Process any queued messages after file edit completes
			task.processQueuedMessages()
		} catch (error) {
			await handleError("search and replace", error)
			await task.diffViewProvider.reset()
			this.resetPartialState()
		}
	}
	async handlePartial(task, block) {
		const filePath = block.params.file_path
		const oldString = block.params.old_string
		// Wait for path to stabilize before showing UI (prevents truncated paths)
		if (!this.hasPathStabilized(filePath)) {
			return
		}
		let operationPreview
		if (oldString) {
			// Show a preview of what will be replaced
			const preview = oldString.length > 50 ? oldString.substring(0, 50) + "..." : oldString
			operationPreview = `replacing: "${preview}"`
		}
		// Determine relative path for display (filePath is guaranteed non-null after hasPathStabilized)
		let relPath = filePath
		if (path_1.default.isAbsolute(relPath)) {
			relPath = path_1.default.relative(task.cwd, relPath)
		}
		const absolutePath = path_1.default.resolve(task.cwd, relPath)
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
		const sharedMessageProps = {
			tool: "appliedDiff",
			path: (0, path_2.getReadablePath)(task.cwd, relPath),
			diff: operationPreview,
			isOutsideWorkspace,
		}
		await task.ask("tool", JSON.stringify(sharedMessageProps), block.partial).catch(() => {})
	}
}
exports.SearchReplaceTool = SearchReplaceTool
exports.searchReplaceTool = new SearchReplaceTool()
