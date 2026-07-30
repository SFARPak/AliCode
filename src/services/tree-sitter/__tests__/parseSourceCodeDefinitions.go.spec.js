"use strict"
/*
TODO: The following structures can be parsed by tree-sitter but lack query support:

1. Anonymous Functions (func_literal):
   (func_literal parameters: (parameter_list) body: (block ...))
   - Currently visible in goroutine and defer statements
   - Would enable capturing lambda/closure definitions

2. Map Types (map_type):
   (map_type key: (type_identifier) value: (interface_type))
   - Currently visible in struct field declarations
   - Would enable capturing map type definitions

3. Pointer Types (pointer_type):
   (pointer_type (type_identifier))
   - Currently visible in method receiver declarations
   - Would enable capturing pointer type definitions
*/
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const sample_go_1 = __importDefault(require("./fixtures/sample-go"))
const helpers_1 = require("./helpers")
const go_1 = __importDefault(require("../queries/go"))
describe("Go Source Code Definition Tests", () => {
	let parseResult
	beforeAll(async () => {
		const testOptions = {
			language: "go",
			wasmFile: "tree-sitter-go.wasm",
			queryString: go_1.default,
			extKey: "go",
		}
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)("file.go", sample_go_1.default, testOptions)
		expect(result).toBeDefined()
		parseResult = result
	})
	it("should capture the entire Go file as a single block", () => {
		// With the universal 50-character threshold, the entire file is captured as one block
		expect(parseResult).toMatch(/2--126 \| \/\/ Package declaration test/)
	})
	it("should contain package declaration in the captured content", () => {
		// The captured block should contain the package declaration
		expect(parseResult).toContain("# file.go")
		expect(parseResult).toContain("2--126")
	})
	it("should not have duplicate captures", () => {
		// Should only have one capture for the entire file
		const lineRanges = parseResult.match(/\d+--\d+ \|/g)
		expect(lineRanges).toBeDefined()
		expect(lineRanges.length).toBe(1)
	})
})
