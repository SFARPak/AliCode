import * as vscode from "vscode"
import { MarketplacePanelProvider as OriginalMarketplacePanelProvider } from "../../kilocode_tmp/packages/kilo-vscode/src/MarketplacePanelProvider"

// Wrapper to ensure vscode.extensions is defined in test environments where the mock may omit it.
export class MarketplacePanelProvider extends OriginalMarketplacePanelProvider {
	constructor(...args: any[]) {
		// Provide a minimal mock for vscode.extensions if missing.
		if (!(vscode as any).extensions) {
			;(vscode as any).extensions = { getExtension: () => undefined }
		}
		super(...args)
	}
}
