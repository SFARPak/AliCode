"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.COMMAND_OUTPUT_STRING = exports.combineCommandSequences = void 0
const browser_1 = require("@ali-code/core/browser")
Object.defineProperty(exports, "combineCommandSequences", {
	enumerable: true,
	get: function () {
		return browser_1.consolidateCommands
	},
})
Object.defineProperty(exports, "COMMAND_OUTPUT_STRING", {
	enumerable: true,
	get: function () {
		return browser_1.COMMAND_OUTPUT_STRING
	},
})
