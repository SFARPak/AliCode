import * as vscode from "vscode"

export class AgentManagerProvider implements vscode.Disposable {
	constructor(
		private host: any,
		private connectionService: any,
	) {}
	dispose() {}
}
