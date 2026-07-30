import * as vscode from "vscode"

export class KiloConnectionService implements vscode.Disposable {
	constructor(private context: vscode.ExtensionContext) {}
	dispose() {}
}
