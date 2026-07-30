"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_javascript_1 = __importDefault(require("./fixtures/sample-javascript"))
describe("inspectJavaScript", () => {
	const testOptions = {
		language: "javascript",
		wasmFile: "tree-sitter-javascript.wasm",
		queryString: queries_1.javascriptQuery,
		extKey: "js",
	}
	it("should inspect JavaScript tree structure", async () => {
		// Should not throw
		await expect(
			(0, helpers_1.inspectTreeStructure)(sample_javascript_1.default, "javascript"),
		).resolves.not.toThrow()
	})
	it("should parse JavaScript definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.js",
			sample_javascript_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \| /)
		expect(result).toMatch(/function testFunctionDefinition/)
	})
})
