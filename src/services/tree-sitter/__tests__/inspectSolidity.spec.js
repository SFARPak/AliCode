"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_solidity_1 = require("./fixtures/sample-solidity")
describe("inspectSolidity", () => {
	const testOptions = {
		language: "solidity",
		wasmFile: "tree-sitter-solidity.wasm",
		queryString: queries_1.solidityQuery,
		extKey: "sol",
	}
	it("should inspect Solidity tree structure", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(sample_solidity_1.sampleSolidity, "solidity")
		expect(result).toBeDefined()
		;(0, helpers_1.debugLog)("Tree Structure:", result)
	})
	it("should parse Solidity definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.sol",
			sample_solidity_1.sampleSolidity,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \|/)
		;(0, helpers_1.debugLog)("Parse Result:", result)
	})
})
