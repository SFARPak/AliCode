"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_html_1 = require("./fixtures/sample-html")
describe("inspectHtml", () => {
	const testOptions = {
		language: "html",
		wasmFile: "tree-sitter-html.wasm",
		queryString: queries_1.htmlQuery,
		extKey: "html",
	}
	it("should inspect HTML tree structure", async () => {
		// Should execute without error
		await expect(
			(0, helpers_1.inspectTreeStructure)(sample_html_1.sampleHtmlContent, "html"),
		).resolves.not.toThrow()
	})
	it("should parse HTML definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.html",
			sample_html_1.sampleHtmlContent,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \| </)
	})
})
