import * as vscode from "vscode"
export interface ExportContext {
	getValue(key: string): any
	setValue(key: string, value: any): Promise<void>
}
export interface ExportOptions {
	/**
	 * Whether to consider the active workspace folder as a default location.
	 * Default: true
	 */
	useWorkspace?: boolean
	/**
	 * Fallback directory if no previous path or workspace is available.
	 */
	fallbackDir?: string
}
/**
 * Resolves the default save URI for an export operation.
 * Priorities:
 * 1. Last used export path (if available)
 * 2. Active workspace folder (if useWorkspace is true)
 * 3. Fallback directory (e.g. Downloads or Documents)
 * 4. Default to just the filename (user's home/cwd)
 */
export declare function resolveDefaultSaveUri(
	context: ExportContext,
	configKey: string,
	fileName: string,
	options?: ExportOptions,
): vscode.Uri
export declare function saveLastExportPath(context: ExportContext, configKey: string, uri: vscode.Uri): Promise<void>
//# sourceMappingURL=export.d.ts.map
