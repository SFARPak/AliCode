"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_rust_1 = __importDefault(require("./fixtures/sample-rust"))
describe("inspectRust", () => {
	const testOptions = {
		language: "rust",
		wasmFile: "tree-sitter-rust.wasm",
		queryString: queries_1.rustQuery,
		extKey: "rs",
	}
	it("should inspect Rust tree structure", async () => {
		// This test only validates that inspectTreeStructure succeeds
		// It will output debug information when DEBUG=1 is set
		const result = await (0, helpers_1.inspectTreeStructure)(sample_rust_1.default, "rust")
		expect(result).toBeDefined()
	})
	it("should parse Rust definitions", async () => {
		// This test validates that parsing produces output with line numbers
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.rs",
			sample_rust_1.default,
			testOptions,
		)
		// Only validate that we get some output with the expected format
		expect(result).toBeTruthy()
		// Check that the output contains line numbers in the format "N--M | content"
		expect(result).toMatch(/\d+--\d+ \|/)
		// Output for debugging purposes
		;(0, helpers_1.debugLog)("Rust definitions parsing succeeded")
	})
})
