"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.CodeActionProvider =
	exports.registerTerminalActions =
	exports.registerCodeActions =
	exports.registerCommands =
	exports.handleUri =
		void 0
var handleUri_1 = require("./handleUri")
Object.defineProperty(exports, "handleUri", {
	enumerable: true,
	get: function () {
		return handleUri_1.handleUri
	},
})
var registerCommands_1 = require("./registerCommands")
Object.defineProperty(exports, "registerCommands", {
	enumerable: true,
	get: function () {
		return registerCommands_1.registerCommands
	},
})
var registerCodeActions_1 = require("./registerCodeActions")
Object.defineProperty(exports, "registerCodeActions", {
	enumerable: true,
	get: function () {
		return registerCodeActions_1.registerCodeActions
	},
})
var registerTerminalActions_1 = require("./registerTerminalActions")
Object.defineProperty(exports, "registerTerminalActions", {
	enumerable: true,
	get: function () {
		return registerTerminalActions_1.registerTerminalActions
	},
})
var CodeActionProvider_1 = require("./CodeActionProvider")
Object.defineProperty(exports, "CodeActionProvider", {
	enumerable: true,
	get: function () {
		return CodeActionProvider_1.CodeActionProvider
	},
})
