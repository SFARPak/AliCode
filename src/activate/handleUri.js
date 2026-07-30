"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.handleUri = void 0
const ClineProvider_1 = require("../core/webview/ClineProvider")
const handleUri = async (uri) => {
	const path = uri.path
	const query = new URLSearchParams(uri.query.replace(/\+/g, "%2B"))
	const visibleProvider = ClineProvider_1.ClineProvider.getVisibleInstance()
	if (!visibleProvider) {
		return
	}
	switch (path) {
		case "/openrouter": {
			const code = query.get("code")
			if (code) {
				await visibleProvider.handleOpenRouterCallback(code)
			}
			break
		}
		case "/requesty": {
			const code = query.get("code")
			const baseUrl = query.get("baseUrl")
			if (code) {
				await visibleProvider.handleRequestyCallback(code, baseUrl)
			}
			break
		}
		default:
			break
	}
}
exports.handleUri = handleUri
