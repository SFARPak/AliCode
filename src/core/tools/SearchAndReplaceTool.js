"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.searchAndReplaceTool = exports.SearchAndReplaceTool = void 0
// Deprecated: Use EditTool instead. This file exists only for backward compatibility.
var EditTool_1 = require("./EditTool")
Object.defineProperty(exports, "SearchAndReplaceTool", {
	enumerable: true,
	get: function () {
		return EditTool_1.EditTool
	},
})
Object.defineProperty(exports, "searchAndReplaceTool", {
	enumerable: true,
	get: function () {
		return EditTool_1.searchAndReplaceTool
	},
})
