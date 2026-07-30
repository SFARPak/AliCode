"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const sample_rust_1 = __importDefault(require("./fixtures/sample-rust"))
const queries_1 = require("../queries")
// Rust test options
const rustOptions = {
	language: "rust",
	wasmFile: "tree-sitter-rust.wasm",
	queryString: queries_1.rustQuery,
	extKey: "rs",
}
describe("Rust Source Code Definition Tests", () => {
	let parseResult
	beforeAll(async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"/test/file.rs",
			sample_rust_1.default,
			rustOptions,
		)
		if (!result) {
			throw new Error("Failed to parse Rust definitions")
		}
		parseResult = result
	})
	it("should parse function declarations", () => {
		// Test standard, async, const, and unsafe functions
		expect(parseResult).toMatch(/\d+--\d+ \| fn test_function_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \| async fn test_async_function_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \| const fn test_const_function_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \| .*unsafe fn test_unsafe_function/)
		;(0, helpers_1.debugLog)(
			"Function declarations:",
			parseResult.match(/(?:async |const |unsafe )?fn[\s\S]*?[{(]/g),
		)
	})
	it("should parse struct declarations", () => {
		// Test regular and tuple structs
		expect(parseResult).toMatch(/\d+--\d+ \| struct test_struct_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \| struct test_tuple_struct_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \| struct test_lifetime_definition/)
		;(0, helpers_1.debugLog)("Struct declarations:", parseResult.match(/struct[\s\S]*?{/g))
	})
	it("should parse enum declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| enum test_enum_definition/)
		;(0, helpers_1.debugLog)("Enum declarations:", parseResult.match(/enum[\s\S]*?{/g))
	})
	it("should parse trait declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| trait test_trait_definition/)
		;(0, helpers_1.debugLog)("Trait declarations:", parseResult.match(/trait[\s\S]*?{/g))
	})
	it("should parse impl blocks", () => {
		// Test regular and trait implementations
		expect(parseResult).toMatch(/\d+--\d+ \| impl test_struct_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \| impl test_trait_definition for test_struct_definition/)
		;(0, helpers_1.debugLog)("Impl blocks:", parseResult.match(/impl[\s\S]*?{/g))
	})
	it("should parse module declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| mod test_module_definition/)
		;(0, helpers_1.debugLog)("Module declarations:", parseResult.match(/mod[\s\S]*?{/g))
	})
	it("should parse macro declarations", () => {
		// Test macro_rules and proc macros
		expect(parseResult).toMatch(/\d+--\d+ \| macro_rules! test_macro_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \| #\[derive\(/)
		;(0, helpers_1.debugLog)("Macro declarations:", parseResult.match(/(?:macro_rules!|#\[derive)[\s\S]*?[}|\)]/g))
	})
	it("should parse type aliases", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| type test_generic_type_alias/)
		;(0, helpers_1.debugLog)("Type aliases:", parseResult.match(/type[\s\S]*?[;|=]/g))
	})
	it("should parse const and static declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| const fn test_const_function_definition/)
		expect(parseResult).toMatch(/234--238 \| static TEST_STATIC_DEFINITION/)
		;(0, helpers_1.debugLog)("Const/static declarations:", parseResult.match(/(?:const fn|static)[\s\S]*?[{=]/g))
	})
	it("should parse use declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| .*use super::/)
		;(0, helpers_1.debugLog)("Use declarations:", parseResult.match(/use[\s\S]*?[{;]/g))
	})
})
