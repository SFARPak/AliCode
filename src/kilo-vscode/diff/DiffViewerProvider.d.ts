import * as vscode from "vscode"
import type { KiloConnectionService } from "../services/cli-backend"
import type { DiffSourceCatalog } from "./sources/catalog"
import type { PanelContext } from "./types"
type CommentHandler = (comments: unknown[], autoSend: boolean) => void
export interface DiffViewerProviderOptions {
	sessionIdProvider?: () => string | undefined
}
/**
 * Single global "Changes" panel. Owns the webview panel lifecycle and
 * routes webview messages to a SourceController, which owns the active
 * DiffSource.
 */
export declare class DiffViewerProvider implements vscode.Disposable {
	private readonly extensionUri
	private readonly connection
	private readonly catalog
	static readonly viewType = "kilo-code.new.DiffViewerPanel"
	private panel
	private ctx
	private controller
	private panelDisposables
	private commentHandler
	private fontConfigDisposable
	private baseBranchOverride
	private readonly sessionIdProvider
	private readonly output
	constructor(
		extensionUri: vscode.Uri,
		connection: KiloConnectionService,
		catalog: DiffSourceCatalog,
		opts?: DiffViewerProviderOptions,
	)
	setCommentHandler(handler: CommentHandler): void
	openPanel(ctx: PanelContext): void
	/**
	 * Entry point for the `kilo-code.new.showChanges` command. Composes the
	 * PanelContext from the arg + injected session/workspace lookups so
	 * callers don't have to know about it.
	 */
	openFromCommand(arg?: { sessionId?: string; turnId?: string; initialSourceId?: string }): void
	/**
	 * Called when VS Code restores a serialized panel after restart. State
	 * is not persisted, so we discard the panel instead of rewiring it.
	 */
	deserializePanel(panel: vscode.WebviewPanel): void
	dispose(): void
	private createPanel
	private onPanelDisposed
	private disposePanel
	private onMessage
	private readonly messageHandlers
	private sendBranches
	private onWebviewReady
	private swap
	private getHtml
	private log
}
export {}
//# sourceMappingURL=DiffViewerProvider.d.ts.map
