"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const sample_tsx_1 = __importDefault(require("./fixtures/sample-tsx"))
describe("inspectTsx", () => {
	const testOptions = {
		language: "tsx",
		wasmFile: "tree-sitter-tsx.wasm",
	}
	it("should inspect TSX tree structure", async () => {
		// This test only validates that the function executes without error
		const result = await (0, helpers_1.inspectTreeStructure)(sample_tsx_1.default, "tsx")
		expect(result).toBeDefined()
		// No expectations - just verifying it runs
	})
	it("should parse TSX definitions and produce line number output", async () => {
		// Execute parsing and capture the result
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.tsx",
			sample_tsx_1.default,
			testOptions,
		)
		// Validate that the result is defined
		expect(result).toBeDefined()
		// Validate that the result contains line number output format (N--M | content)
		expect(result).toMatch(/\d+--\d+ \|/)
		// Debug output the result for inspection
		;(0, helpers_1.debugLog)("TSX Parse Result Sample:", result?.substring(0, 500) + "...")
	})
})
