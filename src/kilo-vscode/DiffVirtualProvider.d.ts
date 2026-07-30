import * as vscode from "vscode"
export interface DiffVirtualFile {
	file: string
	patch?: string
	additions: number
	deletions: number
	initialDiffStyle: "unified" | "split"
}
/**
 * DiffVirtualProvider opens a lightweight diff viewer for a single in-memory
 * file diff (not backed by git). Used by the permission approval dock to show
 * edit changes before the user approves or rejects them.
 */
export declare class DiffVirtualProvider implements vscode.Disposable {
	private readonly extensionUri
	private panel
	private pending
	private outputChannel
	private fontConfigDisposable
	constructor(extensionUri: vscode.Uri)
	private log
	open(diff: DiffVirtualFile): void
	private onMessage
	private pushData
	private post
	private getHtml
	dispose(): void
}
//# sourceMappingURL=DiffVirtualProvider.d.ts.map
