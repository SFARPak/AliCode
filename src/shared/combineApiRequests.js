"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.combineApiRequests = void 0
const browser_1 = require("@ali-code/core/browser")
Object.defineProperty(exports, "combineApiRequests", {
	enumerable: true,
	get: function () {
		return browser_1.consolidateApiRequests
	},
})
