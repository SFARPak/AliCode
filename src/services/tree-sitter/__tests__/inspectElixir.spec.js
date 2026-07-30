"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_elixir_1 = __importDefault(require("./fixtures/sample-elixir"))
describe("inspectElixir", () => {
	const testOptions = {
		language: "elixir",
		wasmFile: "tree-sitter-elixir.wasm",
		queryString: queries_1.elixirQuery,
		extKey: "ex",
	}
	it("should inspect Elixir tree structure", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(sample_elixir_1.default, "elixir")
		expect(result).toBeDefined()
		expect(result.length).toBeGreaterThan(0)
	})
	it("should parse Elixir definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.ex",
			sample_elixir_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toContain("--")
		expect(result).toMatch(/\d+--\d+ \|/)
	})
})
