import * as vscode from "vscode"

export class SubAgentViewerProvider implements vscode.Disposable {
	constructor(
		private extensionUri: vscode.Uri,
		private connectionService: any,
		private context: vscode.ExtensionContext,
	) {}
	dispose() {}
}
