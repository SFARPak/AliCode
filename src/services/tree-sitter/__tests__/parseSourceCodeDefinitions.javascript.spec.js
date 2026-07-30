"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_javascript_1 = __importDefault(require("./fixtures/sample-javascript"))
describe("parseSourceCodeDefinitions.javascript", () => {
	const testOptions = {
		language: "javascript",
		wasmFile: "tree-sitter-javascript.wasm",
		queryString: queries_1.javascriptQuery,
		extKey: "js",
	}
	let result
	beforeAll(async () => {
		// Cache the result since parsing can be slow
		const parseResult = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.js",
			sample_javascript_1.default,
			testOptions,
		)
		if (!parseResult) {
			throw new Error("Failed to parse JavaScript content")
		}
		result = parseResult
	})
	it("should parse import/export statements", () => {
		expect(result).toMatch(/\d+--\d+ \|\s*\/\/ Import statements test/)
	})
	it("should parse function declarations", () => {
		expect(result).toMatch(/\d+--\d+ \|\s*function testFunctionDefinition\(/)
		expect(result).toMatch(/\d+--\d+ \|\s*async function testAsyncFunctionDefinition\(/)
		expect(result).toMatch(/\d+--\d+ \|\s*function\* testGeneratorFunctionDefinition\(/)
		expect(result).toMatch(/\d+--\d+ \|\s*const testArrowFunctionDefinition =/)
	})
	it("should parse class declarations", () => {
		expect(result).toMatch(/\d+--\d+ \|\s*class TestClassDefinition {/)
		expect(result).toMatch(/\d+--\d+ \|\s*testMethodDefinition\(/)
		expect(result).toMatch(/\d+--\d+ \|\s*static testStaticMethodDefinition\(/)
		expect(result).toMatch(/\d+--\d+ \|\s*get testGetterDefinition\(\) {/)
		expect(result).toMatch(/\d+--\d+ \|\s*set testSetterDefinition\(/)
	})
	it("should parse object literal declarations", () => {
		expect(result).toMatch(/\d+--\d+ \|\s*const testObjectLiteralDefinition = {/)
		expect(result).toMatch(/\d+--\d+ \|\s*methodInObject\(/)
		expect(result).toMatch(/\d+--\d+ \|\s*get computedProperty\(\) {/)
	})
	it("should parse JSX element declarations", () => {
		expect(result).toMatch(/\d+--\d+ \|\s*const testJsxElementDefinition =/)
	})
	it("should parse decorator declarations", () => {
		expect(result).toMatch(/\d+--\d+ \|\s*@testDecoratorDefinition/)
		expect(result).toMatch(/\d+--\d+ \|\s*class TestDecoratedClassDefinition {/)
		expect(result).toMatch(/\d+--\d+ \|\s*@testDecoratorDefinition/)
	})
})
