"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_css_1 = __importDefault(require("./fixtures/sample-css"))
describe("CSS Tree-sitter Parser", () => {
	const testOptions = {
		language: "css",
		wasmFile: "tree-sitter-css.wasm",
		queryString: queries_1.cssQuery,
		extKey: "css",
	}
	it("should properly parse CSS structures", async () => {
		// First run inspectTreeStructure to get query structure output
		await (0, helpers_1.inspectTreeStructure)(sample_css_1.default, "css")
		// Then run testParseSourceCodeDefinitions to get line numbers
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.css",
			sample_css_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		if (!result) {
			throw new Error("No result returned from parser")
		}
		expect(result).toMatch(/\d+--\d+ \|/)
		expect(result.split("\n").length).toBeGreaterThan(1)
	})
})
