import * as vscode from "vscode"
import { MarketplacePanelProvider as OriginalMarketplacePanelProvider } from "../../kilocode_tmp/packages/kilo-vscode/src/MarketplacePanelProvider"

// Wrapper to ensure vscode.extensions is defined in test environments where the mock may omit it.
export class MarketplacePanelProvider extends OriginalMarketplacePanelProvider {
	constructor(...args: any[]) {
		super(...args)
	}
}
