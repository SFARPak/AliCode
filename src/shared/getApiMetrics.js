"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.hasToolUsageChanged = exports.hasTokenUsageChanged = exports.getApiMetrics = void 0
const browser_1 = require("@ali-code/core/browser")
Object.defineProperty(exports, "getApiMetrics", {
	enumerable: true,
	get: function () {
		return browser_1.consolidateTokenUsage
	},
})
Object.defineProperty(exports, "hasTokenUsageChanged", {
	enumerable: true,
	get: function () {
		return browser_1.hasTokenUsageChanged
	},
})
Object.defineProperty(exports, "hasToolUsageChanged", {
	enumerable: true,
	get: function () {
		return browser_1.hasToolUsageChanged
	},
})
