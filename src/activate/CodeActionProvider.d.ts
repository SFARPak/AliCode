import * as vscode from "vscode"
import { CodeActionName } from "@ali-code/types"
export declare const TITLES: Record<CodeActionName, string>
export declare class CodeActionProvider implements vscode.CodeActionProvider {
	static readonly providedCodeActionKinds: vscode.CodeActionKind[]
	private createAction
	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext,
	): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]>
}
//# sourceMappingURL=CodeActionProvider.d.ts.map
