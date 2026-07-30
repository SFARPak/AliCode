"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_ruby_1 = __importDefault(require("./fixtures/sample-ruby"))
describe("inspectRuby", () => {
	const testOptions = {
		language: "ruby",
		wasmFile: "tree-sitter-ruby.wasm",
		queryString: queries_1.rubyQuery,
		extKey: "rb",
	}
	it("should inspect Ruby tree structure and parse definitions", async () => {
		// First inspect the tree structure
		await (0, helpers_1.inspectTreeStructure)(sample_ruby_1.default, "ruby")
		// Then validate definition parsing
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.rb",
			sample_ruby_1.default,
			testOptions,
		)
		expect(result).toMatch(/\d+--\d+ \|/) // Verify line number format
	})
})
