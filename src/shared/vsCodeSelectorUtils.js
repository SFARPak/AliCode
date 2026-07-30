"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.SELECTOR_SEPARATOR = void 0
exports.stringifyVsCodeLmModelSelector = stringifyVsCodeLmModelSelector
exports.SELECTOR_SEPARATOR = "/"
function stringifyVsCodeLmModelSelector(selector) {
	return [selector.vendor, selector.family, selector.version, selector.id]
		.filter(Boolean)
		.join(exports.SELECTOR_SEPARATOR)
}
