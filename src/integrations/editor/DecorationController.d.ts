import * as vscode from "vscode"
type DecorationType = "fadedOverlay" | "activeLine"
export declare class DecorationController {
	private decorationType
	private editor
	private ranges
	constructor(decorationType: DecorationType, editor: vscode.TextEditor)
	getDecoration(): vscode.TextEditorDecorationType
	addLines(startIndex: number, numLines: number): void
	clear(): void
	updateOverlayAfterLine(line: number, totalLines: number): void
	setActiveLine(line: number): void
}
export {}
//# sourceMappingURL=DecorationController.d.ts.map
