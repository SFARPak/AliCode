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
exports.EditorUtils = void 0
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
/**
 * Utility class providing helper methods for working with VSCode editors and documents.
 */
class EditorUtils {
	/** Cache mapping text documents to their computed file paths. */
	static filePathCache = new WeakMap()
	/**
	 * Computes the effective range of text from the given document based on the user's selection.
	 * If the selection is non-empty, returns that directly.
	 * Otherwise, if the current line is non-empty, expands the range to include the adjacent lines.
	 *
	 * @param document - The text document to extract text from.
	 * @param range - The user selected range or selection.
	 * @returns An EffectiveRange object containing the effective range and its text, or null if no valid text is found.
	 */
	static getEffectiveRange(document, range) {
		try {
			const selectedText = document.getText(range)
			if (selectedText) {
				return { range, text: selectedText }
			}
			const currentLine = document.lineAt(range.start.line)
			if (!currentLine.text.trim()) {
				return null
			}
			const startLineIndex = Math.max(0, currentLine.lineNumber - 1)
			const endLineIndex = Math.min(document.lineCount - 1, currentLine.lineNumber + 1)
			const effectiveRange = new vscode.Range(
				new vscode.Position(startLineIndex, 0),
				new vscode.Position(endLineIndex, document.lineAt(endLineIndex).text.length),
			)
			return {
				range: effectiveRange,
				text: document.getText(effectiveRange),
			}
		} catch (error) {
			console.error("Error getting effective range:", error)
			return null
		}
	}
	/**
	 * Retrieves the file path of a given text document.
	 * Utilizes an internal cache to avoid redundant computations.
	 * If the document belongs to a workspace, attempts to compute a relative path; otherwise, returns the absolute fsPath.
	 *
	 * @param document - The text document for which to retrieve the file path.
	 * @returns The file path as a string.
	 */
	static getFilePath(document) {
		let filePath = this.filePathCache.get(document)
		if (filePath) {
			return filePath
		}
		try {
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)
			if (!workspaceFolder) {
				filePath = document.uri.fsPath
			} else {
				const relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath)
				filePath = !relativePath || relativePath.startsWith("..") ? document.uri.fsPath : relativePath
			}
			this.filePathCache.set(document, filePath)
			return filePath
		} catch (error) {
			console.error("Error getting file path:", error)
			return document.uri.fsPath
		}
	}
	/**
	 * Converts a VSCode Diagnostic object to a local DiagnosticData instance.
	 *
	 * @param diagnostic - The VSCode diagnostic to convert.
	 * @returns The corresponding DiagnosticData object.
	 */
	static createDiagnosticData(diagnostic) {
		return {
			message: diagnostic.message,
			severity: diagnostic.severity,
			code: diagnostic.code,
			source: diagnostic.source,
			range: diagnostic.range,
		}
	}
	/**
	 * Determines whether two VSCode ranges intersect.
	 *
	 * @param range1 - The first range.
	 * @param range2 - The second range.
	 * @returns True if the ranges intersect; otherwise, false.
	 */
	static hasIntersectingRange(range1, range2) {
		if (
			range1.end.line < range2.start.line ||
			(range1.end.line === range2.start.line && range1.end.character <= range2.start.character)
		) {
			return false
		}
		if (
			range2.end.line < range1.start.line ||
			(range2.end.line === range1.start.line && range2.end.character <= range1.start.character)
		) {
			return false
		}
		return true
	}
	/**
	 * Builds the editor context from the provided text editor or from the active text editor.
	 * The context includes file path, effective selected text, and any diagnostics that intersect with the effective range.
	 *
	 * @param editor - (Optional) A specific text editor instance. If not provided, the active text editor is used.
	 * @returns An EditorContext object if successful; otherwise, null.
	 */
	static getEditorContext(editor) {
		try {
			if (!editor) {
				editor = vscode.window.activeTextEditor
			}
			if (!editor) {
				return null
			}
			const document = editor.document
			const selection = editor.selection
			const effectiveRange = this.getEffectiveRange(document, selection)
			if (!effectiveRange) {
				return null
			}
			const filePath = this.getFilePath(document)
			const diagnostics = vscode.languages
				.getDiagnostics(document.uri)
				.filter((d) => this.hasIntersectingRange(effectiveRange.range, d.range))
				.map(this.createDiagnosticData)
			return {
				filePath,
				selectedText: effectiveRange.text,
				startLine: effectiveRange.range.start.line + 1, // Convert to 1-based line numbers
				endLine: effectiveRange.range.end.line + 1, // Convert to 1-based line numbers
				...(diagnostics.length > 0 ? { diagnostics } : {}),
			}
		} catch (error) {
			console.error("Error getting editor context:", error)
			return null
		}
	}
}
exports.EditorUtils = EditorUtils
