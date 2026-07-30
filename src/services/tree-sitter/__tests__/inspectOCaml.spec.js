"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_ocaml_1 = require("./fixtures/sample-ocaml")
describe("inspectOCaml", () => {
	const testOptions = {
		language: "ocaml",
		wasmFile: "tree-sitter-ocaml.wasm",
		queryString: queries_1.ocamlQuery,
		extKey: "ml",
	}
	it("should inspect OCaml tree structure", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(sample_ocaml_1.sampleOCaml, "ocaml")
		expect(result).toBeDefined()
		expect(result.length).toBeGreaterThan(0)
	})
	it("should parse OCaml definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.ml",
			sample_ocaml_1.sampleOCaml,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \| module StringSet/)
		expect(result).toMatch(/\d+--\d+ \| type shape/)
		expect(result).toMatch(/\d+--\d+ \| let rec process_list/)
	})
})
