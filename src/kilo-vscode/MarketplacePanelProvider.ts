import * as vscode from "vscode"

export class MarketplacePanelProvider implements vscode.Disposable {
	constructor(
		private extensionUri: vscode.Uri,
		private connectionService: any,
		private context: vscode.ExtensionContext,
	) {}
	dispose() {}
}
