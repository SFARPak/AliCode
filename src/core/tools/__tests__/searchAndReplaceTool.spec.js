"use strict"
// Deprecated: Tests for the old SearchAndReplaceTool.
// Full edit tool tests are in editTool.spec.ts.
// This file only verifies the backward-compatible re-export.
Object.defineProperty(exports, "__esModule", { value: true })
const SearchAndReplaceTool_1 = require("../SearchAndReplaceTool")
const EditTool_1 = require("../EditTool")
describe("SearchAndReplaceTool re-export", () => {
	it("exports searchAndReplaceTool as an alias for editTool", () => {
		expect(SearchAndReplaceTool_1.searchAndReplaceTool).toBeDefined()
		expect(SearchAndReplaceTool_1.searchAndReplaceTool).toBe(EditTool_1.editTool)
	})
})
