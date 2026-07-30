"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const sample_go_1 = __importDefault(require("./fixtures/sample-go"))
const go_1 = __importDefault(require("../queries/go"))
describe("Go Tree-sitter Parser", () => {
	// Test 1: Get query structure output
	it("should inspect tree structure", async () => {
		await (0, helpers_1.inspectTreeStructure)(sample_go_1.default, "go")
	})
	// Test 2: Get line numbers
	it("should parse source code definitions", async () => {
		const testOptions = {
			language: "go",
			wasmFile: "tree-sitter-go.wasm",
			queryString: go_1.default,
			extKey: "go",
		}
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)("file.go", sample_go_1.default, testOptions)
		expect(result).toBeDefined()
	})
	// Test 3: Verify no duplicate captures for Go constructs
	it("should not create duplicate captures for Go constructs", async () => {
		const testOptions = {
			language: "go",
			wasmFile: "tree-sitter-go.wasm",
			queryString: go_1.default,
			extKey: "go",
		}
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)("file.go", sample_go_1.default, testOptions)
		// Check that we have results
		expect(result).toBeDefined()
		expect(typeof result).toBe("string")
		expect(result.length).toBeGreaterThan(0)
		// Parse the result to extract line ranges
		const lines = result.split("\n").filter((line) => line.trim() && !line.startsWith("#"))
		// Extract line ranges from the format "startLine--endLine | content"
		const lineRanges = lines
			.map((line) => {
				const match = line.match(/^(\d+)--(\d+)/)
				return match ? `${match[1]}-${match[2]}` : null
			})
			.filter(Boolean)
		// Check for duplicate line ranges (which was the original problem)
		const uniqueLineRanges = [...new Set(lineRanges)]
		expect(lineRanges.length).toBe(uniqueLineRanges.length)
		// With the new query that captures full declarations, we expect the entire file
		// to be captured as a single block containing all the declarations
		expect(lines.length).toBeGreaterThan(0)
		// The line range should cover the entire sample file content
		expect(lineRanges[0]).toBe("2-126")
		// The captured content should start with the package declaration
		expect(result).toContain("// Package declaration test")
	})
})
