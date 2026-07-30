import * as vscode from "vscode"
export declare function getNewDiagnostics(
	oldDiagnostics: [vscode.Uri, vscode.Diagnostic[]][],
	newDiagnostics: [vscode.Uri, vscode.Diagnostic[]][],
): [vscode.Uri, vscode.Diagnostic[]][]
export declare function diagnosticsToProblemsString(
	diagnostics: [vscode.Uri, vscode.Diagnostic[]][],
	severities: vscode.DiagnosticSeverity[],
	cwd: string,
	includeDiagnosticMessages?: boolean,
	maxDiagnosticMessages?: number,
): Promise<string>
//# sourceMappingURL=index.d.ts.map
