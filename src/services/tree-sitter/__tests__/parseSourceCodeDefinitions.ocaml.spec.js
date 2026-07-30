"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_ocaml_1 = require("./fixtures/sample-ocaml")
describe("parseSourceCodeDefinitions (OCaml)", () => {
	const testOptions = {
		language: "ocaml",
		wasmFile: "tree-sitter-ocaml.wasm",
		queryString: queries_1.ocamlQuery,
		extKey: "ml",
	}
	let parseResult
	beforeAll(async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.ml",
			sample_ocaml_1.sampleOCaml,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(typeof result).toBe("string")
		parseResult = result
	})
	it("should capture module with signature", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| module StringSet : sig/)
	})
	it("should capture functor definition", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| module OrderedMap \(Key: sig/)
	})
	it("should capture variant type definition", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| type shape =/)
	})
	it("should capture record type definition", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| type person = {/)
	})
	it("should capture pattern matching function", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| let rec process_list = function/)
	})
	it("should capture multi-argument function", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| let calculate_area ~width ~height/)
	})
	it("should capture class definition", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| class virtual \['a\] container = object/)
	})
	it("should capture object expression", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| let make_counter initial = object/)
	})
})
