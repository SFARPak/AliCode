"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_cpp_1 = __importDefault(require("./fixtures/sample-cpp"))
describe("C++ Tree-sitter Parser", () => {
	const testOptions = {
		language: "cpp",
		wasmFile: "tree-sitter-cpp.wasm",
		queryString: queries_1.cppQuery,
		extKey: "cpp",
	}
	it("should properly parse structures", async () => {
		// First run inspectTreeStructure to get query structure output
		await (0, helpers_1.inspectTreeStructure)(sample_cpp_1.default, "cpp")
		// Then run testParseSourceCodeDefinitions to get line numbers
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.cpp",
			sample_cpp_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \|/)
	})
})
