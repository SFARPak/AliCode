import * as vscode from "vscode"

export class VscodeHost implements vscode.Disposable {
	constructor(
		private extensionUri: vscode.Uri,
		private connectionService: any,
		private context: vscode.ExtensionContext,
		private remoteService: any,
	) {}
	dispose() {}
}
