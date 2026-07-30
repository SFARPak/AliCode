"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.MarketplacePanelProvider = void 0
const MarketplacePanelProvider_1 = require("../../kilocode_tmp/packages/kilo-vscode/src/MarketplacePanelProvider")
// Wrapper to ensure vscode.extensions is defined in test environments where the mock may omit it.
class MarketplacePanelProvider extends MarketplacePanelProvider_1.MarketplacePanelProvider {
	constructor(...args) {
		super(...args)
	}
}
exports.MarketplacePanelProvider = MarketplacePanelProvider
