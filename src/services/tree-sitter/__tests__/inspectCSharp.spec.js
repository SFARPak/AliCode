"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_c_sharp_1 = __importDefault(require("./fixtures/sample-c-sharp"))
describe("inspectCSharp", () => {
	const testOptions = {
		language: "c_sharp",
		wasmFile: "tree-sitter-c_sharp.wasm",
		queryString: queries_1.csharpQuery,
		extKey: "cs",
	}
	it("should inspect C# tree structure", async () => {
		// Should execute without throwing
		await expect((0, helpers_1.inspectTreeStructure)(sample_c_sharp_1.default, "c_sharp")).resolves.not.toThrow()
	})
	it("should parse C# definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.cs",
			sample_c_sharp_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \|/)
	})
})
