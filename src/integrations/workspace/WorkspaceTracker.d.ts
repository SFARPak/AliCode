import { ClineProvider } from "../../core/webview/ClineProvider"
declare class WorkspaceTracker {
	private providerRef
	private disposables
	private filePaths
	private updateTimer
	private prevWorkSpacePath
	private resetTimer
	get cwd(): string
	constructor(provider: ClineProvider)
	initializeFilePaths(): Promise<void>
	private registerListeners
	private getOpenedTabsInfo
	private workspaceDidReset
	private workspaceDidUpdate
	private normalizeFilePath
	private addFilePath
	private removeFilePath
	dispose(): void
}
export default WorkspaceTracker
//# sourceMappingURL=WorkspaceTracker.d.ts.map
