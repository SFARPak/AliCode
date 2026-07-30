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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.DiffViewProvider = exports.DIFF_VIEW_LABEL_CHANGES = exports.DIFF_VIEW_URI_SCHEME = void 0
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
const fs = __importStar(require("fs/promises"))
const diff = __importStar(require("diff"))
const strip_bom_1 = __importDefault(require("strip-bom"))
const delay_1 = __importDefault(require("delay"))
const types_1 = require("@ali-code/types")
const fs_1 = require("../../utils/fs")
const path_1 = require("../../utils/path")
const responses_1 = require("../../core/prompts/responses")
const diagnostics_1 = require("../diagnostics")
const DecorationController_1 = require("./DecorationController")
exports.DIFF_VIEW_URI_SCHEME = "cline-diff"
exports.DIFF_VIEW_LABEL_CHANGES = "Original ↔ Ali's Changes"
// TODO: https://github.com/cline/cline/pull/3354
class DiffViewProvider {
	cwd
	// Properties to store the results of saveChanges
	newProblemsMessage
	userEdits
	editType
	isEditing = false
	originalContent
	createdDirs = []
	documentWasOpen = false
	relPath
	newContent
	activeDiffEditor
	fadedOverlayController
	activeLineController
	streamedLines = []
	preDiagnostics = []
	taskRef
	constructor(cwd, task) {
		this.cwd = cwd
		this.taskRef = new WeakRef(task)
	}
	async open(relPath) {
		this.relPath = relPath
		const fileExists = this.editType === "modify"
		const absolutePath = path.resolve(this.cwd, relPath)
		this.isEditing = true
		// If the file is already open, ensure it's not dirty before getting its
		// contents.
		if (fileExists) {
			const existingDocument = vscode.workspace.textDocuments.find(
				(doc) => doc.uri.scheme === "file" && (0, path_1.arePathsEqual)(doc.uri.fsPath, absolutePath),
			)
			if (existingDocument && existingDocument.isDirty) {
				await existingDocument.save()
			}
		}
		// Get diagnostics before editing the file, we'll compare to diagnostics
		// after editing to see if cline needs to fix anything.
		this.preDiagnostics = vscode.languages.getDiagnostics()
		if (fileExists) {
			this.originalContent = await fs.readFile(absolutePath, "utf-8")
		} else {
			this.originalContent = ""
		}
		// For new files, create any necessary directories and keep track of new
		// directories to delete if the user denies the operation.
		this.createdDirs = await (0, fs_1.createDirectoriesForFile)(absolutePath)
		// Make sure the file exists before we open it.
		if (!fileExists) {
			await fs.writeFile(absolutePath, "")
		}
		// If the file was already open, close it (must happen after showing the
		// diff view since if it's the only tab the column will close).
		this.documentWasOpen = false
		// Close the tab if it's open (it's already saved above).
		const tabs = vscode.window.tabGroups.all
			.map((tg) => tg.tabs)
			.flat()
			.filter(
				(tab) =>
					tab.input instanceof vscode.TabInputText &&
					tab.input.uri.scheme === "file" &&
					(0, path_1.arePathsEqual)(tab.input.uri.fsPath, absolutePath),
			)
		for (const tab of tabs) {
			if (!tab.isDirty) {
				try {
					await vscode.window.tabGroups.close(tab)
				} catch (err) {
					console.error(`Failed to close tab ${tab.label}`, err)
				}
			}
			this.documentWasOpen = true
		}
		this.activeDiffEditor = await this.openDiffEditor()
		this.fadedOverlayController = new DecorationController_1.DecorationController(
			"fadedOverlay",
			this.activeDiffEditor,
		)
		this.activeLineController = new DecorationController_1.DecorationController("activeLine", this.activeDiffEditor)
		// Apply faded overlay to all lines initially.
		this.fadedOverlayController.addLines(0, this.activeDiffEditor.document.lineCount)
		this.scrollEditorToLine(0) // Will this crash for new files?
		this.streamedLines = []
	}
	async update(accumulatedContent, isFinal) {
		if (!this.relPath || !this.activeLineController || !this.fadedOverlayController) {
			throw new Error("Required values not set")
		}
		this.newContent = accumulatedContent
		const accumulatedLines = accumulatedContent.split("\n")
		if (!isFinal) {
			accumulatedLines.pop() // Remove the last partial line only if it's not the final update.
		}
		const diffEditor = this.activeDiffEditor
		const document = diffEditor?.document
		if (!diffEditor || !document) {
			throw new Error("User closed text editor, unable to edit file...")
		}
		// Place cursor at the beginning of the diff editor to keep it out of
		// the way of the stream animation, but do this without stealing focus
		const beginningOfDocument = new vscode.Position(0, 0)
		diffEditor.selection = new vscode.Selection(beginningOfDocument, beginningOfDocument)
		const endLine = accumulatedLines.length
		// Replace all content up to the current line with accumulated lines.
		const edit = new vscode.WorkspaceEdit()
		const rangeToReplace = new vscode.Range(0, 0, endLine, 0)
		const contentToReplace =
			accumulatedLines.slice(0, endLine).join("\n") + (accumulatedLines.length > 0 ? "\n" : "")
		edit.replace(document.uri, rangeToReplace, this.stripAllBOMs(contentToReplace))
		await vscode.workspace.applyEdit(edit)
		// Update decorations.
		this.activeLineController.setActiveLine(endLine)
		this.fadedOverlayController.updateOverlayAfterLine(endLine, document.lineCount)
		// Scroll to the current line without stealing focus.
		const ranges = this.activeDiffEditor?.visibleRanges
		if (ranges && ranges.length > 0 && ranges[0].start.line < endLine && ranges[0].end.line > endLine) {
			this.scrollEditorToLine(endLine)
		}
		// Update the streamedLines with the new accumulated content.
		this.streamedLines = accumulatedLines
		if (isFinal) {
			// Handle any remaining lines if the new content is shorter than the
			// original.
			if (this.streamedLines.length < document.lineCount) {
				const edit = new vscode.WorkspaceEdit()
				edit.delete(document.uri, new vscode.Range(this.streamedLines.length, 0, document.lineCount, 0))
				await vscode.workspace.applyEdit(edit)
			}
			// Preserve empty last line if original content had one.
			const hasEmptyLastLine = this.originalContent?.endsWith("\n")
			if (hasEmptyLastLine && !accumulatedContent.endsWith("\n")) {
				accumulatedContent += "\n"
			}
			// Apply the final content.
			const finalEdit = new vscode.WorkspaceEdit()
			finalEdit.replace(
				document.uri,
				new vscode.Range(0, 0, document.lineCount, 0),
				this.stripAllBOMs(accumulatedContent),
			)
			await vscode.workspace.applyEdit(finalEdit)
			// Clear all decorations at the end (after applying final edit).
			this.fadedOverlayController.clear()
			this.activeLineController.clear()
		}
	}
	async saveChanges(diagnosticsEnabled = true, writeDelayMs = types_1.DEFAULT_WRITE_DELAY_MS) {
		if (!this.relPath || !this.newContent || !this.activeDiffEditor) {
			return { newProblemsMessage: undefined, userEdits: undefined, finalContent: undefined }
		}
		const absolutePath = path.resolve(this.cwd, this.relPath)
		const updatedDocument = this.activeDiffEditor.document
		const editedContent = updatedDocument.getText()
		if (updatedDocument.isDirty) {
			await updatedDocument.save()
		}
		await vscode.window.showTextDocument(vscode.Uri.file(absolutePath), { preview: false, preserveFocus: true })
		await this.closeAllDiffViews()
		// Getting diagnostics before and after the file edit is a better approach than
		// automatically tracking problems in real-time. This method ensures we only
		// report new problems that are a direct result of this specific edit.
		// Since these are new problems resulting from Ali's edit, we know they're
		// directly related to the work he's doing. This eliminates the risk of Ali
		// going off-task or getting distracted by unrelated issues, which was a problem
		// with the previous auto-debug approach. Some users' machines may be slow to
		// update diagnostics, so this approach provides a good balance between automation
		// and avoiding potential issues where Ali might get stuck in loops due to
		// outdated problem information. If no new problems show up by the time the user
		// accepts the changes, they can always debug later using the '@problems' mention.
		// This way, Ali only becomes aware of new problems resulting from his edits
		// and can address them accordingly. If problems don't change immediately after
		// applying a fix, won't be notified, which is generally fine since the
		// initial fix is usually correct and it may just take time for linters to catch up.
		let newProblemsMessage = ""
		if (diagnosticsEnabled) {
			// Add configurable delay to allow linters time to process and clean up issues
			// like unused imports (especially important for Go and other languages)
			// Ensure delay is non-negative
			const safeDelayMs = Math.max(0, writeDelayMs)
			try {
				await (0, delay_1.default)(safeDelayMs)
			} catch (error) {
				// Log error but continue - delay failure shouldn't break the save operation
				console.warn(`Failed to apply write delay: ${error}`)
			}
			const postDiagnostics = vscode.languages.getDiagnostics()
			// Get diagnostic settings from state
			const task = this.taskRef.deref()
			const state = await task?.providerRef.deref()?.getState()
			const includeDiagnosticMessages = state?.includeDiagnosticMessages ?? true
			const maxDiagnosticMessages = state?.maxDiagnosticMessages ?? 50
			const newProblems = await (0, diagnostics_1.diagnosticsToProblemsString)(
				(0, diagnostics_1.getNewDiagnostics)(this.preDiagnostics, postDiagnostics),
				[
					vscode.DiagnosticSeverity.Error, // only including errors since warnings can be distracting (if user wants to fix warnings they can use the @problems mention)
				],
				this.cwd,
				includeDiagnosticMessages,
				maxDiagnosticMessages,
			) // Will be empty string if no errors.
			newProblemsMessage =
				newProblems.length > 0 ? `\n\nNew problems detected after saving the file:\n${newProblems}` : ""
		}
		// If the edited content has different EOL characters, we don't want to
		// show a diff with all the EOL differences.
		const newContentEOL = this.newContent.includes("\r\n") ? "\r\n" : "\n"
		// Normalize EOL characters without trimming content
		const normalizedEditedContent = editedContent.replace(/\r\n|\n/g, newContentEOL)
		// Just in case the new content has a mix of varying EOL characters.
		const normalizedNewContent = this.newContent.replace(/\r\n|\n/g, newContentEOL)
		if (normalizedEditedContent !== normalizedNewContent) {
			// User made changes before approving edit.
			const userEdits = responses_1.formatResponse.createPrettyPatch(
				this.relPath.toPosix(),
				normalizedNewContent,
				normalizedEditedContent,
			)
			// Store the results as class properties for formatFileWriteResponse to use
			this.newProblemsMessage = newProblemsMessage
			this.userEdits = userEdits
			return { newProblemsMessage, userEdits, finalContent: normalizedEditedContent }
		} else {
			// No changes to Ali's edits.
			// Store the results as class properties for formatFileWriteResponse to use
			this.newProblemsMessage = newProblemsMessage
			this.userEdits = undefined
			return { newProblemsMessage, userEdits: undefined, finalContent: normalizedEditedContent }
		}
	}
	/**
	 * Formats a standardized response for file write operations
	 *
	 * @param task Task instance to get protocol info
	 * @param cwd Current working directory for path resolution
	 * @param isNewFile Whether this is a new file or an existing file being modified
	 * @returns Formatted message (JSON)
	 */
	async pushToolWriteResult(task, cwd, isNewFile) {
		if (!this.relPath) {
			throw new Error("No file path available in DiffViewProvider")
		}
		// Only send user_feedback_diff if userEdits exists
		if (this.userEdits) {
			// Create say object for UI feedback
			const say = {
				tool: isNewFile ? "newFileCreated" : "editedExistingFile",
				path: (0, path_1.getReadablePath)(cwd, this.relPath),
				diff: this.userEdits,
			}
			// Send the user feedback
			await task.say("user_feedback_diff", JSON.stringify(say))
		}
		// Build notices array
		const notices = [
			"You do not need to re-read the file, as you have seen all changes",
			"Proceed with the task using these changes as the new baseline.",
			...(this.userEdits
				? [
						"If the user's edits have addressed part of the task or changed the requirements, adjust your approach accordingly.",
					]
				: []),
		]
		const result = {
			path: this.relPath,
			operation: isNewFile ? "created" : "modified",
			notice: notices.join(" "),
		}
		if (this.userEdits) {
			result.user_edits = this.userEdits
		}
		if (this.newProblemsMessage) {
			result.problems = this.newProblemsMessage
		}
		return JSON.stringify(result)
	}
	async revertChanges() {
		if (!this.relPath || !this.activeDiffEditor) {
			return
		}
		const fileExists = this.editType === "modify"
		const updatedDocument = this.activeDiffEditor.document
		const absolutePath = path.resolve(this.cwd, this.relPath)
		if (!fileExists) {
			if (updatedDocument.isDirty) {
				await updatedDocument.save()
			}
			await this.closeAllDiffViews()
			await fs.unlink(absolutePath)
			// Remove only the directories we created, in reverse order.
			for (let i = this.createdDirs.length - 1; i >= 0; i--) {
				await fs.rmdir(this.createdDirs[i])
			}
		} else {
			// Revert document.
			const edit = new vscode.WorkspaceEdit()
			const fullRange = new vscode.Range(
				updatedDocument.positionAt(0),
				updatedDocument.positionAt(updatedDocument.getText().length),
			)
			edit.replace(updatedDocument.uri, fullRange, this.stripAllBOMs(this.originalContent ?? ""))
			// Apply the edit and save, since contents shouldn't have changed
			// this won't show in local history unless of course the user made
			// changes and saved during the edit.
			await vscode.workspace.applyEdit(edit)
			await updatedDocument.save()
			if (this.documentWasOpen) {
				await vscode.window.showTextDocument(vscode.Uri.file(absolutePath), {
					preview: false,
					preserveFocus: true,
				})
			}
			await this.closeAllDiffViews()
		}
		// Edit is done.
		await this.reset()
	}
	async closeAllDiffViews() {
		const closeOps = vscode.window.tabGroups.all
			.flatMap((group) => group.tabs)
			.filter((tab) => {
				// Check for standard diff views with our URI scheme
				if (
					tab.input instanceof vscode.TabInputTextDiff &&
					tab.input.original.scheme === exports.DIFF_VIEW_URI_SCHEME &&
					!tab.isDirty
				) {
					return true
				}
				// Also check by tab label for our specific diff views
				// This catches cases where the diff view might be created differently
				// when files are pre-opened as text documents
				if (tab.label.includes(exports.DIFF_VIEW_LABEL_CHANGES) && !tab.isDirty) {
					return true
				}
				return false
			})
			.map((tab) =>
				vscode.window.tabGroups.close(tab).then(
					() => undefined,
					(err) => {
						console.error(`Failed to close diff tab ${tab.label}`, err)
					},
				),
			)
		await Promise.all(closeOps)
	}
	async openDiffEditor() {
		if (!this.relPath) {
			throw new Error(
				"No file path set for opening diff editor. Ensure open() was called before openDiffEditor()",
			)
		}
		const uri = vscode.Uri.file(path.resolve(this.cwd, this.relPath))
		// If this diff editor is already open (ie if a previous write file was
		// interrupted) then we should activate that instead of opening a new
		// diff.
		const diffTab = vscode.window.tabGroups.all
			.flatMap((group) => group.tabs)
			.find(
				(tab) =>
					tab.input instanceof vscode.TabInputTextDiff &&
					tab.input?.original?.scheme === exports.DIFF_VIEW_URI_SCHEME &&
					(0, path_1.arePathsEqual)(tab.input.modified.fsPath, uri.fsPath),
			)
		if (diffTab && diffTab.input instanceof vscode.TabInputTextDiff) {
			const editor = await vscode.window.showTextDocument(diffTab.input.modified, { preserveFocus: true })
			return editor
		}
		// Open new diff editor.
		return new Promise((resolve, reject) => {
			const fileName = path.basename(uri.fsPath)
			const fileExists = this.editType === "modify"
			const DIFF_EDITOR_TIMEOUT = 10_000 // ms
			let timeoutId
			const disposables = []
			const cleanup = () => {
				if (timeoutId) {
					clearTimeout(timeoutId)
					timeoutId = undefined
				}
				disposables.forEach((d) => d.dispose())
				disposables.length = 0
			}
			// Set timeout for the entire operation
			timeoutId = setTimeout(() => {
				cleanup()
				reject(
					new Error(
						`Failed to open diff editor for ${uri.fsPath} within ${DIFF_EDITOR_TIMEOUT / 1000} seconds. The editor may be blocked or VS Code may be unresponsive.`,
					),
				)
			}, DIFF_EDITOR_TIMEOUT)
			// Listen for document open events - more efficient than scanning all tabs
			disposables.push(
				vscode.workspace.onDidOpenTextDocument(async (document) => {
					// Only match file:// scheme documents to avoid git diffs
					if (document.uri.scheme === "file" && (0, path_1.arePathsEqual)(document.uri.fsPath, uri.fsPath)) {
						// Wait a tick for the editor to be available
						await new Promise((r) => setTimeout(r, 0))
						// Find the editor for this document
						const editor = vscode.window.visibleTextEditors.find(
							(e) =>
								e.document.uri.scheme === "file" &&
								(0, path_1.arePathsEqual)(e.document.uri.fsPath, uri.fsPath),
						)
						if (editor) {
							cleanup()
							resolve(editor)
						}
					}
				}),
			)
			// Also listen for visible editor changes as a fallback
			disposables.push(
				vscode.window.onDidChangeVisibleTextEditors((editors) => {
					const editor = editors.find((e) => {
						const isFileScheme = e.document.uri.scheme === "file"
						const pathMatches = (0, path_1.arePathsEqual)(e.document.uri.fsPath, uri.fsPath)
						return isFileScheme && pathMatches
					})
					if (editor) {
						cleanup()
						resolve(editor)
					}
				}),
			)
			// Pre-open the file as a text document to ensure it doesn't open in preview mode
			// This fixes issues with files that have custom editor associations (like markdown preview)
			vscode.window
				.showTextDocument(uri, { preview: false, viewColumn: vscode.ViewColumn.Active, preserveFocus: true })
				.then(() => {
					// Execute the diff command after ensuring the file is open as text
					return vscode.commands.executeCommand(
						"vscode.diff",
						vscode.Uri.parse(`${exports.DIFF_VIEW_URI_SCHEME}:${fileName}`).with({
							query: Buffer.from(this.originalContent ?? "").toString("base64"),
						}),
						uri,
						`${fileName}: ${fileExists ? `${exports.DIFF_VIEW_LABEL_CHANGES}` : "New File"} (Editable)`,
						{ preserveFocus: true },
					)
				})
				.then(
					() => {
						// Command executed successfully, now wait for the editor to appear
					},
					(err) => {
						cleanup()
						reject(new Error(`Failed to execute diff command for ${uri.fsPath}: ${err.message}`))
					},
				)
		})
	}
	scrollEditorToLine(line) {
		if (this.activeDiffEditor) {
			const scrollLine = line + 4
			this.activeDiffEditor.revealRange(
				new vscode.Range(scrollLine, 0, scrollLine, 0),
				vscode.TextEditorRevealType.InCenter,
			)
		}
	}
	scrollToFirstDiff() {
		if (!this.activeDiffEditor) {
			return
		}
		const currentContent = this.activeDiffEditor.document.getText()
		const diffs = diff.diffLines(this.originalContent || "", currentContent)
		let lineCount = 0
		for (const part of diffs) {
			if (part.added || part.removed) {
				// Found the first diff, scroll to it without stealing focus.
				this.activeDiffEditor.revealRange(
					new vscode.Range(lineCount, 0, lineCount, 0),
					vscode.TextEditorRevealType.InCenter,
				)
				return
			}
			if (!part.removed) {
				lineCount += part.count || 0
			}
		}
	}
	stripAllBOMs(input) {
		let result = input
		let previous
		do {
			previous = result
			result = (0, strip_bom_1.default)(result)
		} while (result !== previous)
		return result
	}
	async reset() {
		await this.closeAllDiffViews()
		this.editType = undefined
		this.isEditing = false
		this.originalContent = undefined
		this.createdDirs = []
		this.documentWasOpen = false
		this.activeDiffEditor = undefined
		this.fadedOverlayController = undefined
		this.activeLineController = undefined
		this.streamedLines = []
		this.preDiagnostics = []
	}
	/**
	 * Directly save content to a file without showing diff view
	 * Used when preventFocusDisruption experiment is enabled
	 *
	 * @param relPath - Relative path to the file
	 * @param content - Content to write to the file
	 * @param openFile - Whether to show the file in editor (false = open in memory only for diagnostics)
	 * @returns Result of the save operation including any new problems detected
	 */
	async saveDirectly(
		relPath,
		content,
		openFile = true,
		diagnosticsEnabled = true,
		writeDelayMs = types_1.DEFAULT_WRITE_DELAY_MS,
	) {
		const absolutePath = path.resolve(this.cwd, relPath)
		// Get diagnostics before editing the file
		this.preDiagnostics = vscode.languages.getDiagnostics()
		// Write the content directly to the file
		await (0, fs_1.createDirectoriesForFile)(absolutePath)
		await fs.writeFile(absolutePath, content, "utf-8")
		// Open the document to ensure diagnostics are loaded
		// When openFile is false (PREVENT_FOCUS_DISRUPTION enabled), we only open in memory
		if (openFile) {
			// Show the document in the editor
			await vscode.window.showTextDocument(vscode.Uri.file(absolutePath), {
				preview: false,
				preserveFocus: true,
			})
		} else {
			// Just open the document in memory to trigger diagnostics without showing it
			const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(absolutePath))
			// Save the document to ensure VSCode recognizes it as saved and triggers diagnostics
			if (doc.isDirty) {
				await doc.save()
			}
			// Force a small delay to ensure diagnostics are triggered
			await new Promise((resolve) => setTimeout(resolve, 100))
		}
		let newProblemsMessage = ""
		if (diagnosticsEnabled) {
			// Add configurable delay to allow linters time to process
			const safeDelayMs = Math.max(0, writeDelayMs)
			try {
				await (0, delay_1.default)(safeDelayMs)
			} catch (error) {
				console.warn(`Failed to apply write delay: ${error}`)
			}
			const postDiagnostics = vscode.languages.getDiagnostics()
			// Get diagnostic settings from state
			const task = this.taskRef.deref()
			const state = await task?.providerRef.deref()?.getState()
			const includeDiagnosticMessages = state?.includeDiagnosticMessages ?? true
			const maxDiagnosticMessages = state?.maxDiagnosticMessages ?? 50
			const newProblems = await (0, diagnostics_1.diagnosticsToProblemsString)(
				(0, diagnostics_1.getNewDiagnostics)(this.preDiagnostics, postDiagnostics),
				[vscode.DiagnosticSeverity.Error],
				this.cwd,
				includeDiagnosticMessages,
				maxDiagnosticMessages,
			)
			newProblemsMessage =
				newProblems.length > 0 ? `\n\nNew problems detected after saving the file:\n${newProblems}` : ""
		}
		// Store the results for formatFileWriteResponse
		this.newProblemsMessage = newProblemsMessage
		this.userEdits = undefined
		this.relPath = relPath
		this.newContent = content
		return {
			newProblemsMessage,
			userEdits: undefined,
			finalContent: content,
		}
	}
}
exports.DiffViewProvider = DiffViewProvider
