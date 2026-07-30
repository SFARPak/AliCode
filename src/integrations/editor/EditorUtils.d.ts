import * as vscode from "vscode"
/**
 * Represents an effective range in a document along with the corresponding text.
 */
export interface EffectiveRange {
	/** The range within the document. */
	range: vscode.Range
	/** The text within the specified range. */
	text: string
}
/**
 * Represents diagnostic information extracted from a VSCode diagnostic.
 */
export interface DiagnosticData {
	/** The diagnostic message. */
	message: string
	/** The severity level of the diagnostic. */
	severity: vscode.DiagnosticSeverity
	/**
	 * Optional diagnostic code.
	 * Can be a string, number, or an object with value and target.
	 */
	code?:
		| string
		| number
		| {
				value: string | number
				target: vscode.Uri
		  }
	/** Optional source identifier for the diagnostic (e.g., the extension name). */
	source?: string
	/** The range within the document where the diagnostic applies. */
	range: vscode.Range
}
/**
 * Contextual information for a VSCode text editor.
 */
export interface EditorContext {
	/** The file path of the current document. */
	filePath: string
	/** The effective text selected or derived from the document. */
	selectedText: string
	/** The starting line number of the selected text (1-based). */
	startLine: number
	/** The ending line number of the selected text (1-based). */
	endLine: number
	/** Optional list of diagnostics associated with the effective range. */
	diagnostics?: DiagnosticData[]
}
/**
 * Utility class providing helper methods for working with VSCode editors and documents.
 */
export declare class EditorUtils {
	/** Cache mapping text documents to their computed file paths. */
	private static readonly filePathCache
	/**
	 * Computes the effective range of text from the given document based on the user's selection.
	 * If the selection is non-empty, returns that directly.
	 * Otherwise, if the current line is non-empty, expands the range to include the adjacent lines.
	 *
	 * @param document - The text document to extract text from.
	 * @param range - The user selected range or selection.
	 * @returns An EffectiveRange object containing the effective range and its text, or null if no valid text is found.
	 */
	static getEffectiveRange(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
	): EffectiveRange | null
	/**
	 * Retrieves the file path of a given text document.
	 * Utilizes an internal cache to avoid redundant computations.
	 * If the document belongs to a workspace, attempts to compute a relative path; otherwise, returns the absolute fsPath.
	 *
	 * @param document - The text document for which to retrieve the file path.
	 * @returns The file path as a string.
	 */
	static getFilePath(document: vscode.TextDocument): string
	/**
	 * Converts a VSCode Diagnostic object to a local DiagnosticData instance.
	 *
	 * @param diagnostic - The VSCode diagnostic to convert.
	 * @returns The corresponding DiagnosticData object.
	 */
	static createDiagnosticData(diagnostic: vscode.Diagnostic): DiagnosticData
	/**
	 * Determines whether two VSCode ranges intersect.
	 *
	 * @param range1 - The first range.
	 * @param range2 - The second range.
	 * @returns True if the ranges intersect; otherwise, false.
	 */
	static hasIntersectingRange(range1: vscode.Range, range2: vscode.Range): boolean
	/**
	 * Builds the editor context from the provided text editor or from the active text editor.
	 * The context includes file path, effective selected text, and any diagnostics that intersect with the effective range.
	 *
	 * @param editor - (Optional) A specific text editor instance. If not provided, the active text editor is used.
	 * @returns An EditorContext object if successful; otherwise, null.
	 */
	static getEditorContext(editor?: vscode.TextEditor): EditorContext | null
}
//# sourceMappingURL=EditorUtils.d.ts.map
