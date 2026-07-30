"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_lua_1 = __importDefault(require("./fixtures/sample-lua"))
describe("inspectLua", () => {
	const testOptions = {
		language: "lua",
		wasmFile: "tree-sitter-lua.wasm",
		queryString: queries_1.luaQuery,
		extKey: "lua",
	}
	it("should inspect Lua tree structure", async () => {
		await (0, helpers_1.inspectTreeStructure)(sample_lua_1.default, "lua")
	})
	it("should parse Lua definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"file.lua",
			sample_lua_1.default,
			testOptions,
		)
		expect(result).toBeDefined() // Confirm parse succeeded
		;(0, helpers_1.debugLog)("Lua parse result:", result)
	})
})
