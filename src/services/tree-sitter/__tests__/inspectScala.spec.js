"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_scala_1 = require("./fixtures/sample-scala")
describe("inspectScala", () => {
	const testOptions = {
		language: "scala",
		wasmFile: "tree-sitter-scala.wasm",
		queryString: queries_1.scalaQuery,
		extKey: "scala",
	}
	it("should inspect Scala tree structure", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(sample_scala_1.sampleScala, "scala")
		expect(result).toBeDefined()
	})
	it("should parse Scala definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.scala",
			sample_scala_1.sampleScala,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \|/)
		;(0, helpers_1.debugLog)("Scala parse result:", result)
	})
})
