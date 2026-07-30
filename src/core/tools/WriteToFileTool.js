"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.writeToFileTool = exports.WriteToFileTool = void 0
const path_1 = __importDefault(require("path"))
const delay_1 = __importDefault(require("delay"))
const promises_1 = __importDefault(require("fs/promises"))
const types_1 = require("@ali-code/types")
const responses_1 = require("../prompts/responses")
const fs_1 = require("../../utils/fs")
const extract_text_1 = require("../../integrations/misc/extract-text")
const path_2 = require("../../utils/path")
const pathUtils_1 = require("../../utils/pathUtils")
const text_normalization_1 = require("../../utils/text-normalization")
const experiments_1 = require("../../shared/experiments")
const stats_1 = require("../diff/stats")
const BaseTool_1 = require("./BaseTool")
class WriteToFileTool extends BaseTool_1.BaseTool {
	name = "write_to_file"
	async execute(params, task, callbacks) {
		const { pushToolResult, handleError, askApproval } = callbacks
		const relPath = params.path
		let newContent = params.content
		if (!relPath) {
			task.consecutiveMistakeCount++
			task.recordToolError("write_to_file")
			pushToolResult(await task.sayAndCreateMissingParamError("write_to_file", "path"))
			await task.diffViewProvider.reset()
			return
		}
		if (newContent === undefined) {
			task.consecutiveMistakeCount++
			task.recordToolError("write_to_file")
			pushToolResult(await task.sayAndCreateMissingParamError("write_to_file", "content"))
			await task.diffViewProvider.reset()
			return
		}
		const accessAllowed = task.aliIgnoreController?.validateAccess(relPath)
		if (!accessAllowed) {
			await task.say("rooignore_error", relPath)
			pushToolResult(responses_1.formatResponse.rooIgnoreError(relPath))
			return
		}
		const isWriteProtected = task.aliProtectedController?.isWriteProtected(relPath) || false
		let fileExists
		const absolutePath = path_1.default.resolve(task.cwd, relPath)
		if (task.diffViewProvider.editType !== undefined) {
			fileExists = task.diffViewProvider.editType === "modify"
		} else {
			fileExists = await (0, fs_1.fileExistsAtPath)(absolutePath)
			task.diffViewProvider.editType = fileExists ? "modify" : "create"
		}
		// Create parent directories early for new files to prevent ENOENT errors
		// in subsequent operations (e.g., diffViewProvider.open, fs.readFile)
		if (!fileExists) {
			await (0, fs_1.createDirectoriesForFile)(absolutePath)
		}
		if (newContent.startsWith("```")) {
			newContent = newContent.split("\n").slice(1).join("\n")
		}
		if (newContent.endsWith("```")) {
			newContent = newContent.split("\n").slice(0, -1).join("\n")
		}
		if (!task.api.getModel().id.includes("claude")) {
			newContent = (0, text_normalization_1.unescapeHtmlEntities)(newContent)
		}
		const fullPath = relPath ? path_1.default.resolve(task.cwd, relPath) : ""
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(fullPath)
		const sharedMessageProps = {
			tool: fileExists ? "editedExistingFile" : "newFileCreated",
			path: (0, path_2.getReadablePath)(task.cwd, relPath),
			content: newContent,
			isOutsideWorkspace,
			isProtected: isWriteProtected,
		}
		try {
			task.consecutiveMistakeCount = 0
			const provider = task.providerRef.deref()
			const state = await provider?.getState()
			const diagnosticsEnabled = state?.diagnosticsEnabled ?? true
			const writeDelayMs = state?.writeDelayMs ?? types_1.DEFAULT_WRITE_DELAY_MS
			const isPreventFocusDisruptionEnabled = experiments_1.experiments.isEnabled(
				state?.experiments ?? {},
				experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION,
			)
			if (isPreventFocusDisruptionEnabled) {
				task.diffViewProvider.editType = fileExists ? "modify" : "create"
				if (fileExists) {
					const absolutePath = path_1.default.resolve(task.cwd, relPath)
					task.diffViewProvider.originalContent = await promises_1.default.readFile(absolutePath, "utf-8")
				} else {
					task.diffViewProvider.originalContent = ""
				}
				let unified = fileExists
					? responses_1.formatResponse.createPrettyPatch(
							relPath,
							task.diffViewProvider.originalContent,
							newContent,
						)
					: (0, stats_1.convertNewFileToUnifiedDiff)(newContent, relPath)
				unified = (0, stats_1.sanitizeUnifiedDiff)(unified)
				const completeMessage = JSON.stringify({
					...sharedMessageProps,
					content: unified,
					diffStats: (0, stats_1.computeDiffStats)(unified) || undefined,
				})
				const didApprove = await askApproval("tool", completeMessage, undefined, isWriteProtected)
				if (!didApprove) {
					return
				}
				await task.diffViewProvider.saveDirectly(relPath, newContent, false, diagnosticsEnabled, writeDelayMs)
			} else {
				if (!task.diffViewProvider.isEditing) {
					const partialMessage = JSON.stringify(sharedMessageProps)
					await task.ask("tool", partialMessage, true).catch(() => {})
					await task.diffViewProvider.open(relPath)
				}
				await task.diffViewProvider.update(
					(0, extract_text_1.everyLineHasLineNumbers)(newContent)
						? (0, extract_text_1.stripLineNumbers)(newContent)
						: newContent,
					true,
				)
				await (0, delay_1.default)(300)
				task.diffViewProvider.scrollToFirstDiff()
				let unified = fileExists
					? responses_1.formatResponse.createPrettyPatch(
							relPath,
							task.diffViewProvider.originalContent,
							newContent,
						)
					: (0, stats_1.convertNewFileToUnifiedDiff)(newContent, relPath)
				unified = (0, stats_1.sanitizeUnifiedDiff)(unified)
				const completeMessage = JSON.stringify({
					...sharedMessageProps,
					content: unified,
					diffStats: (0, stats_1.computeDiffStats)(unified) || undefined,
				})
				const didApprove = await askApproval("tool", completeMessage, undefined, isWriteProtected)
				if (!didApprove) {
					await task.diffViewProvider.revertChanges()
					return
				}
				await task.diffViewProvider.saveChanges(diagnosticsEnabled, writeDelayMs)
			}
			if (relPath) {
				await task.fileContextTracker.trackFileContext(relPath, "roo_edited")
			}
			task.didEditFile = true
			const message = await task.diffViewProvider.pushToolWriteResult(task, task.cwd, !fileExists)
			pushToolResult(message)
			await task.diffViewProvider.reset()
			this.resetPartialState()
			task.processQueuedMessages()
			return
		} catch (error) {
			await handleError("writing file", error)
			await task.diffViewProvider.reset()
			this.resetPartialState()
			return
		}
	}
	async handlePartial(task, block) {
		const relPath = block.params.path
		let newContent = block.params.content
		// Wait for path to stabilize before showing UI (prevents truncated paths)
		if (!this.hasPathStabilized(relPath) || newContent === undefined) {
			return
		}
		const provider = task.providerRef.deref()
		const state = await provider?.getState()
		const isPreventFocusDisruptionEnabled = experiments_1.experiments.isEnabled(
			state?.experiments ?? {},
			experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION,
		)
		if (isPreventFocusDisruptionEnabled) {
			return
		}
		// relPath is guaranteed non-null after hasPathStabilized
		let fileExists
		const absolutePath = path_1.default.resolve(task.cwd, relPath)
		if (task.diffViewProvider.editType !== undefined) {
			fileExists = task.diffViewProvider.editType === "modify"
		} else {
			fileExists = await (0, fs_1.fileExistsAtPath)(absolutePath)
			task.diffViewProvider.editType = fileExists ? "modify" : "create"
		}
		// Create parent directories early for new files to prevent ENOENT errors
		// in subsequent operations (e.g., diffViewProvider.open)
		if (!fileExists) {
			await (0, fs_1.createDirectoriesForFile)(absolutePath)
		}
		const isWriteProtected = task.aliProtectedController?.isWriteProtected(relPath) || false
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
		const sharedMessageProps = {
			tool: fileExists ? "editedExistingFile" : "newFileCreated",
			path: (0, path_2.getReadablePath)(task.cwd, relPath),
			content: newContent || "",
			isOutsideWorkspace,
			isProtected: isWriteProtected,
		}
		const partialMessage = JSON.stringify(sharedMessageProps)
		await task.ask("tool", partialMessage, block.partial).catch(() => {})
		if (newContent) {
			if (!task.diffViewProvider.isEditing) {
				await task.diffViewProvider.open(relPath)
			}
			await task.diffViewProvider.update(
				(0, extract_text_1.everyLineHasLineNumbers)(newContent)
					? (0, extract_text_1.stripLineNumbers)(newContent)
					: newContent,
				false,
			)
		}
	}
}
exports.WriteToFileTool = WriteToFileTool
exports.writeToFileTool = new WriteToFileTool()
