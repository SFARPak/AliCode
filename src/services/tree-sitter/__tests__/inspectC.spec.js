"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_c_1 = __importDefault(require("./fixtures/sample-c"))
describe("inspectC", () => {
	const testOptions = {
		language: "c",
		wasmFile: "tree-sitter-c.wasm",
		queryString: queries_1.cQuery,
		extKey: "c",
	}
	it("should inspect C tree structure", async () => {
		await (0, helpers_1.inspectTreeStructure)(sample_c_1.default, "c")
	})
	it("should parse C definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)("test.c", sample_c_1.default, testOptions)
		// Only verify that parsing produces output with line numbers and content
		if (!result || !result.match(/\d+--\d+ \|/)) {
			throw new Error("Failed to parse C definitions with line numbers")
		}
	})
})
