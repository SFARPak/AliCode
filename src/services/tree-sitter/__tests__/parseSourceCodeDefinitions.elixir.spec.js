"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const queries_1 = require("../queries")
const helpers_1 = require("./helpers")
const sample_elixir_1 = __importDefault(require("./fixtures/sample-elixir"))
// Elixir test options
const elixirOptions = {
	language: "elixir",
	wasmFile: "tree-sitter-elixir.wasm",
	queryString: queries_1.elixirQuery,
	extKey: "ex",
}
// Mock file system operations
vi.mock("fs/promises")
// Mock loadRequiredLanguageParsers
vi.mock("../languageParser", () => ({
	loadRequiredLanguageParsers: vi.fn(),
}))
// Mock fileExistsAtPath to return true for our test paths
vi.mock("../../../utils/fs", () => ({
	fileExistsAtPath: vi.fn().mockImplementation(() => Promise.resolve(true)),
}))
describe("parseSourceCodeDefinitionsForFile with Elixir", () => {
	let parseResult = ""
	beforeAll(async () => {
		// Cache parse result for all tests
		parseResult = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"/test/file.ex",
			sample_elixir_1.default,
			elixirOptions,
		)
		;(0, helpers_1.debugLog)("Elixir Parse Result:", parseResult)
	})
	beforeEach(() => {
		vi.clearAllMocks()
	})
	it("should parse module definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| defmodule TestModuleDefinition do/)
		expect(parseResult).toMatch(/\d+--\d+ \| defmodule TestBehaviourDefinition do/)
		expect(parseResult).toMatch(/\d+--\d+ \| defmodule TestModuleDefinitionTest do/)
		;(0, helpers_1.debugLog)("Module definitions found:", parseResult.match(/defmodule[\s\S]*?end/g))
	})
	it("should parse function definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   def test_function_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \|   def test_pipeline_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \|   def test_comprehension_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \|   def test_sigil_definition/)
		;(0, helpers_1.debugLog)("Function definitions found:", parseResult.match(/def[\s\S]*?end/g))
	})
	it("should parse macro definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   defmacro test_macro_definition/)
		;(0, helpers_1.debugLog)("Macro definitions found:", parseResult.match(/defmacro[\s\S]*?end/g))
	})
	it("should parse protocol implementations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   defimpl String\.Chars/)
		;(0, helpers_1.debugLog)("Protocol implementations found:", parseResult.match(/defimpl[\s\S]*?end/g))
	})
	it("should parse behaviour callbacks", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   @callback test_behaviour_callback/)
		;(0, helpers_1.debugLog)("Behaviour callbacks found:", parseResult.match(/@callback[\s\S]*?\)/g))
	})
	it("should parse struct definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   defstruct \[/)
		;(0, helpers_1.debugLog)("Struct definitions found:", parseResult.match(/defstruct[\s\S]*?\]/g))
	})
	it("should parse guard definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   defguard test_guard_definition/)
		;(0, helpers_1.debugLog)("Guard definitions found:", parseResult.match(/defguard[\s\S]*?end/g))
	})
	it("should parse module attributes", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   @test_attribute_definition/)
		expect(parseResult).toMatch(/\d+--\d+ \| @moduledoc/)
		;(0, helpers_1.debugLog)("Module attributes found:", parseResult.match(/@[\s\S]*?\]/g))
	})
	it("should parse test definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   test "test_definition"/)
		;(0, helpers_1.debugLog)("Test definitions found:", parseResult.match(/test[\s\S]*?end/g))
	})
})
