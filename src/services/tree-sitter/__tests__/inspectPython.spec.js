"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const sample_python_1 = require("./fixtures/sample-python")
const queries_1 = require("../queries")
// Python test options
const pythonOptions = {
	language: "python",
	wasmFile: "tree-sitter-python.wasm",
	queryString: queries_1.pythonQuery,
	extKey: "py",
}
describe("Python Tree-sitter Parser", () => {
	it("should successfully parse and inspect Python code", async () => {
		// Verify tree structure inspection succeeds
		const inspectResult = await (0, helpers_1.inspectTreeStructure)(sample_python_1.samplePythonContent, "python")
		expect(inspectResult).toBeDefined()
		// Verify source code definitions parsing succeeds
		const parseResult = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.py",
			sample_python_1.samplePythonContent,
			pythonOptions,
		)
		expect(parseResult).toMatch(/\d+--\d+ \|/) // Verify line number format
		expect(parseResult).toContain("class") // Basic content verification
	})
})
