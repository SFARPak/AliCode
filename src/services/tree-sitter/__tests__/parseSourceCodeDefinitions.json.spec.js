"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_json_1 = __importDefault(require("./fixtures/sample-json"))
// JSON test options
const jsonOptions = {
	language: "javascript",
	wasmFile: "tree-sitter-javascript.wasm",
	queryString: queries_1.javascriptQuery,
	extKey: "json",
	content: sample_json_1.default,
}
describe("JSON Structure Tests", () => {
	const testFile = "/test/test.json"
	it("should capture basic value types", async () => {
		;(0, helpers_1.debugLog)("\n=== Basic Value Types ===")
		await (0, helpers_1.testParseSourceCodeDefinitions)(testFile, sample_json_1.default, jsonOptions)
	})
	it("should capture nested object structures", async () => {
		;(0, helpers_1.debugLog)("\n=== Nested Object Structures ===")
		await (0, helpers_1.testParseSourceCodeDefinitions)(testFile, sample_json_1.default, jsonOptions)
	})
	it("should capture array structures", async () => {
		;(0, helpers_1.debugLog)("\n=== Array Structures ===")
		await (0, helpers_1.testParseSourceCodeDefinitions)(testFile, sample_json_1.default, jsonOptions)
	})
	it("should capture object arrays", async () => {
		;(0, helpers_1.debugLog)("\n=== Object Arrays ===")
		await (0, helpers_1.testParseSourceCodeDefinitions)(testFile, sample_json_1.default, jsonOptions)
	})
	it("should capture mixed nesting", async () => {
		;(0, helpers_1.debugLog)("\n=== Mixed Nesting ===")
		await (0, helpers_1.testParseSourceCodeDefinitions)(testFile, sample_json_1.default, jsonOptions)
	})
	it("should capture all value types", async () => {
		;(0, helpers_1.debugLog)("\n=== All Value Types ===")
		await (0, helpers_1.testParseSourceCodeDefinitions)(testFile, sample_json_1.default, jsonOptions)
	})
	it("should capture special string content", async () => {
		;(0, helpers_1.debugLog)("\n=== Special String Content ===")
		await (0, helpers_1.testParseSourceCodeDefinitions)(testFile, sample_json_1.default, jsonOptions)
	})
})
