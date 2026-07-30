import * as vscode from "vscode"
import { ClineProvider } from "../core/webview/ClineProvider"
/**
 * Helper to get the visible ClineProvider instance or log if not found.
 */
export declare function getVisibleProviderOrLog(outputChannel: vscode.OutputChannel): ClineProvider | undefined
/**
 * Get the currently active panel
 * @returns WebviewPanel或WebviewView
 */
export declare function getPanel(): vscode.WebviewPanel | vscode.WebviewView | undefined
/**
 * Set panel references
 */
export declare function setPanel(
	newPanel: vscode.WebviewPanel | vscode.WebviewView | undefined,
	type: "sidebar" | "tab",
): void
export type RegisterCommandOptions = {
	context: vscode.ExtensionContext
	outputChannel: vscode.OutputChannel
	provider: ClineProvider
}
export declare const registerCommands: (options: RegisterCommandOptions) => void
export declare const openClineInNewTab: ({
	context,
	outputChannel,
}: Omit<RegisterCommandOptions, "provider">) => Promise<ClineProvider>
//# sourceMappingURL=registerCommands.d.ts.map
