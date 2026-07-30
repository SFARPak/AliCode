"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_toml_1 = require("./fixtures/sample-toml")
describe("inspectTOML", () => {
	const testOptions = {
		language: "toml",
		wasmFile: "tree-sitter-toml.wasm",
		queryString: queries_1.tomlQuery,
		extKey: "toml",
	}
	it("should inspect TOML tree structure", async () => {
		await (0, helpers_1.inspectTreeStructure)(sample_toml_1.sampleToml, "toml")
	})
	it("should parse TOML definitions", async () => {
		await (0, helpers_1.testParseSourceCodeDefinitions)("test.toml", sample_toml_1.sampleToml, testOptions)
	})
})
