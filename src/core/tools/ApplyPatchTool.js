"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.applyPatchTool = exports.ApplyPatchTool = void 0
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
const apply_patch_1 = require("./apply-patch")
class ApplyPatchTool extends BaseTool_1.BaseTool {
	name = "apply_patch"
	static FILE_HEADER_MARKERS = ["*** Add File: ", "*** Delete File: ", "*** Update File: "]
	extractFirstPathFromPatch(patch) {
		if (!patch) {
			return undefined
		}
		const lines = patch.split("\n")
		const hasTrailingNewline = patch.endsWith("\n")
		const completeLines = hasTrailingNewline ? lines : lines.slice(0, -1)
		for (const rawLine of completeLines) {
			const line = rawLine.trim()
			for (const marker of ApplyPatchTool.FILE_HEADER_MARKERS) {
				if (!line.startsWith(marker)) {
					continue
				}
				const candidatePath = line.substring(marker.length).trim()
				if (candidatePath.length > 0) {
					return candidatePath
				}
			}
		}
		return undefined
	}
	async execute(params, task, callbacks) {
		const { patch } = params
		const { askApproval, handleError, pushToolResult } = callbacks
		try {
			// Validate required parameters
			if (!patch) {
				task.consecutiveMistakeCount++
				task.recordToolError("apply_patch")
				pushToolResult(await task.sayAndCreateMissingParamError("apply_patch", "patch"))
				return
			}
			// Parse the patch
			let parsedPatch
			try {
				parsedPatch = (0, apply_patch_1.parsePatch)(patch)
			} catch (error) {
				task.consecutiveMistakeCount++
				task.recordToolError("apply_patch")
				const errorMessage =
					error instanceof apply_patch_1.ParseError
						? `Invalid patch format: ${error.message}`
						: `Failed to parse patch: ${error instanceof Error ? error.message : String(error)}`
				pushToolResult(responses_1.formatResponse.toolError(errorMessage))
				return
			}
			if (parsedPatch.hunks.length === 0) {
				pushToolResult("No file operations found in patch.")
				return
			}
			// Process each hunk
			const readFile = async (filePath) => {
				const absolutePath = path_1.default.resolve(task.cwd, filePath)
				return await promises_1.default.readFile(absolutePath, "utf8")
			}
			let changes
			try {
				changes = await (0, apply_patch_1.processAllHunks)(parsedPatch.hunks, readFile)
			} catch (error) {
				task.consecutiveMistakeCount++
				task.recordToolError("apply_patch")
				const errorMessage = `Failed to process patch: ${error instanceof Error ? error.message : String(error)}`
				pushToolResult(responses_1.formatResponse.toolError(errorMessage))
				return
			}
			// Process each file change
			for (const change of changes) {
				const relPath = change.path
				const absolutePath = path_1.default.resolve(task.cwd, relPath)
				// Check access permissions
				const accessAllowed = task.aliIgnoreController?.validateAccess(relPath)
				if (!accessAllowed) {
					await task.say("rooignore_error", relPath)
					pushToolResult(responses_1.formatResponse.rooIgnoreError(relPath))
					return
				}
				// Check if file is write-protected
				const isWriteProtected = task.aliProtectedController?.isWriteProtected(relPath) || false
				if (change.type === "add") {
					// Create new file
					await this.handleAddFile(change, absolutePath, relPath, task, callbacks, isWriteProtected)
				} else if (change.type === "delete") {
					// Delete file
					await this.handleDeleteFile(absolutePath, relPath, task, callbacks, isWriteProtected)
				} else if (change.type === "update") {
					// Update file
					await this.handleUpdateFile(change, absolutePath, relPath, task, callbacks, isWriteProtected)
				}
			}
			task.consecutiveMistakeCount = 0
			task.recordToolUsage("apply_patch")
		} catch (error) {
			await handleError("apply patch", error)
			await task.diffViewProvider.reset()
		}
	}
	async handleAddFile(change, absolutePath, relPath, task, callbacks, isWriteProtected) {
		const { askApproval, pushToolResult } = callbacks
		// Check if file already exists
		const fileExists = await (0, fs_1.fileExistsAtPath)(absolutePath)
		if (fileExists) {
			task.consecutiveMistakeCount++
			task.recordToolError("apply_patch")
			const errorMessage = `File already exists: ${relPath}. Use Update File instead.`
			await task.say("error", errorMessage)
			pushToolResult(responses_1.formatResponse.toolError(errorMessage))
			return
		}
		const newContent = change.newContent || ""
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
		// Initialize diff view for new file
		task.diffViewProvider.editType = "create"
		task.diffViewProvider.originalContent = undefined
		const diff = responses_1.formatResponse.createPrettyPatch(relPath, "", newContent)
		// Check experiment settings
		const provider = task.providerRef.deref()
		const state = await provider?.getState()
		const diagnosticsEnabled = state?.diagnosticsEnabled ?? true
		const writeDelayMs = state?.writeDelayMs ?? types_1.DEFAULT_WRITE_DELAY_MS
		const isPreventFocusDisruptionEnabled = experiments_1.experiments.isEnabled(
			state?.experiments ?? {},
			experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION,
		)
		const sanitizedDiff = (0, stats_1.sanitizeUnifiedDiff)(diff || "")
		const diffStats = (0, stats_1.computeDiffStats)(sanitizedDiff) || undefined
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
			if (!isPreventFocusDisruptionEnabled) {
				await task.diffViewProvider.revertChanges()
			}
			pushToolResult("Changes were rejected by the user.")
			await task.diffViewProvider.reset()
			return
		}
		// Save the changes
		if (isPreventFocusDisruptionEnabled) {
			await task.diffViewProvider.saveDirectly(relPath, newContent, true, diagnosticsEnabled, writeDelayMs)
		} else {
			await task.diffViewProvider.saveChanges(diagnosticsEnabled, writeDelayMs)
		}
		// Track file edit operation
		await task.fileContextTracker.trackFileContext(relPath, "roo_edited")
		task.didEditFile = true
		const message = await task.diffViewProvider.pushToolWriteResult(task, task.cwd, true)
		pushToolResult(message)
		await task.diffViewProvider.reset()
		task.processQueuedMessages()
	}
	async handleDeleteFile(absolutePath, relPath, task, callbacks, isWriteProtected) {
		const { askApproval, pushToolResult } = callbacks
		// Check if file exists
		const fileExists = await (0, fs_1.fileExistsAtPath)(absolutePath)
		if (!fileExists) {
			task.consecutiveMistakeCount++
			task.recordToolError("apply_patch")
			const errorMessage = `File not found: ${relPath}. Cannot delete a non-existent file.`
			await task.say("error", errorMessage)
			pushToolResult(responses_1.formatResponse.toolError(errorMessage))
			return
		}
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
		const sharedMessageProps = {
			tool: "appliedDiff",
			path: (0, path_2.getReadablePath)(task.cwd, relPath),
			diff: `File will be deleted: ${relPath}`,
			isOutsideWorkspace,
		}
		const completeMessage = JSON.stringify({
			...sharedMessageProps,
			content: `Delete file: ${relPath}`,
			isProtected: isWriteProtected,
		})
		const didApprove = await askApproval("tool", completeMessage, undefined, isWriteProtected)
		if (!didApprove) {
			pushToolResult("Delete operation was rejected by the user.")
			return
		}
		// Delete the file
		try {
			await promises_1.default.unlink(absolutePath)
		} catch (error) {
			const errorMessage = `Failed to delete file '${relPath}': ${error instanceof Error ? error.message : String(error)}`
			await task.say("error", errorMessage)
			pushToolResult(responses_1.formatResponse.toolError(errorMessage))
			return
		}
		task.didEditFile = true
		pushToolResult(`Successfully deleted ${relPath}`)
		task.processQueuedMessages()
	}
	async handleUpdateFile(change, absolutePath, relPath, task, callbacks, isWriteProtected) {
		const { askApproval, pushToolResult } = callbacks
		// Check if file exists
		const fileExists = await (0, fs_1.fileExistsAtPath)(absolutePath)
		if (!fileExists) {
			task.consecutiveMistakeCount++
			task.recordToolError("apply_patch")
			const errorMessage = `File not found: ${relPath}. Cannot update a non-existent file.`
			await task.say("error", errorMessage)
			pushToolResult(responses_1.formatResponse.toolError(errorMessage))
			return
		}
		const originalContent = change.originalContent || ""
		const newContent = change.newContent || ""
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
		// Initialize diff view
		task.diffViewProvider.editType = "modify"
		task.diffViewProvider.originalContent = originalContent
		// Generate and validate diff
		const diff = responses_1.formatResponse.createPrettyPatch(relPath, originalContent, newContent)
		if (!diff) {
			pushToolResult(`No changes needed for '${relPath}'`)
			await task.diffViewProvider.reset()
			return
		}
		// Check experiment settings
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
		const sharedMessageProps = {
			tool: "appliedDiff",
			path: (0, path_2.getReadablePath)(task.cwd, relPath),
			diff: sanitizedDiff,
			originalContent,
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
			if (!isPreventFocusDisruptionEnabled) {
				await task.diffViewProvider.revertChanges()
			}
			pushToolResult("Changes were rejected by the user.")
			await task.diffViewProvider.reset()
			return
		}
		// Handle file move if specified
		if (change.movePath) {
			const moveAbsolutePath = path_1.default.resolve(task.cwd, change.movePath)
			// Validate destination path access permissions
			const moveAccessAllowed = task.aliIgnoreController?.validateAccess(change.movePath)
			if (!moveAccessAllowed) {
				await task.say("rooignore_error", change.movePath)
				pushToolResult(responses_1.formatResponse.rooIgnoreError(change.movePath))
				await task.diffViewProvider.reset()
				return
			}
			// Check if destination path is write-protected
			const isMovePathWriteProtected = task.aliProtectedController?.isWriteProtected(change.movePath) || false
			if (isMovePathWriteProtected) {
				task.consecutiveMistakeCount++
				task.recordToolError("apply_patch")
				const errorMessage = `Cannot move file to write-protected path: ${change.movePath}`
				await task.say("error", errorMessage)
				pushToolResult(responses_1.formatResponse.toolError(errorMessage))
				await task.diffViewProvider.reset()
				return
			}
			// Check if destination path is outside workspace
			const isMoveOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(moveAbsolutePath)
			if (isMoveOutsideWorkspace) {
				task.consecutiveMistakeCount++
				task.recordToolError("apply_patch")
				const errorMessage = `Cannot move file to path outside workspace: ${change.movePath}`
				await task.say("error", errorMessage)
				pushToolResult(responses_1.formatResponse.toolError(errorMessage))
				await task.diffViewProvider.reset()
				return
			}
			// Save new content to the new path
			if (isPreventFocusDisruptionEnabled) {
				await task.diffViewProvider.saveDirectly(
					change.movePath,
					newContent,
					false,
					diagnosticsEnabled,
					writeDelayMs,
				)
			} else {
				// Write to new path and delete old file
				const parentDir = path_1.default.dirname(moveAbsolutePath)
				await promises_1.default.mkdir(parentDir, { recursive: true })
				await promises_1.default.writeFile(moveAbsolutePath, newContent, "utf8")
			}
			// Delete the original file
			try {
				await promises_1.default.unlink(absolutePath)
			} catch (error) {
				console.error(`Failed to delete original file after move: ${error}`)
			}
			await task.fileContextTracker.trackFileContext(change.movePath, "roo_edited")
		} else {
			// Save changes to the same file
			if (isPreventFocusDisruptionEnabled) {
				await task.diffViewProvider.saveDirectly(relPath, newContent, false, diagnosticsEnabled, writeDelayMs)
			} else {
				await task.diffViewProvider.saveChanges(diagnosticsEnabled, writeDelayMs)
			}
			await task.fileContextTracker.trackFileContext(relPath, "roo_edited")
		}
		task.didEditFile = true
		const message = await task.diffViewProvider.pushToolWriteResult(task, task.cwd, false)
		pushToolResult(message)
		await task.diffViewProvider.reset()
		task.processQueuedMessages()
	}
	async handlePartial(task, block) {
		const patch = block.params.patch
		const candidateRelPath = this.extractFirstPathFromPatch(patch)
		const fallbackDisplayPath = path_1.default.basename(task.cwd) || "workspace"
		const resolvedRelPath = candidateRelPath ?? ""
		const absolutePath = path_1.default.resolve(task.cwd, resolvedRelPath)
		const displayPath = candidateRelPath
			? (0, path_2.getReadablePath)(task.cwd, candidateRelPath)
			: fallbackDisplayPath
		let patchPreview
		if (patch) {
			// Show first few lines of the patch
			const lines = patch.split("\n").slice(0, 5)
			patchPreview = lines.join("\n") + (patch.split("\n").length > 5 ? "\n..." : "")
		}
		const sharedMessageProps = {
			tool: "appliedDiff",
			path: displayPath || path_1.default.basename(task.cwd) || "workspace",
			diff: patchPreview || "Parsing patch...",
			isOutsideWorkspace: (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath),
		}
		await task.ask("tool", JSON.stringify(sharedMessageProps), block.partial).catch(() => {})
	}
}
exports.ApplyPatchTool = ApplyPatchTool
exports.applyPatchTool = new ApplyPatchTool()
