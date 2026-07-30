import * as vscode from "vscode"
/**
 * Focus the active panel (either tab or sidebar)
 * @param tabPanel - The tab panel reference
 * @param sidebarPanel - The sidebar panel reference
 * @returns Promise that resolves when focus is complete
 */
export declare function focusPanel(
	tabPanel: vscode.WebviewPanel | undefined,
	sidebarPanel: vscode.WebviewView | undefined,
): Promise<void>
//# sourceMappingURL=focusPanel.d.ts.map
