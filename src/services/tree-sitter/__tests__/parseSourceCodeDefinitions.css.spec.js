"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_css_1 = __importDefault(require("./fixtures/sample-css"))
describe("parseSourceCodeDefinitionsForFile with CSS", () => {
	const testOptions = {
		language: "css",
		wasmFile: "tree-sitter-css.wasm",
		queryString: queries_1.cssQuery,
		extKey: "css",
		debug: true,
	}
	let parseResult
	beforeAll(async () => {
		// Cache parse result for all tests
		parseResult = await (0, helpers_1.testParseSourceCodeDefinitions)("test.css", sample_css_1.default, testOptions)
		if (!parseResult) {
			throw new Error("No result returned from parser")
		}
		;(0, helpers_1.debugLog)("CSS Parse Result:", parseResult)
	})
	beforeEach(() => {
		vi.clearAllMocks()
	})
	it("should parse CSS variable declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*--test-variable-definition-primary:/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*--test-variable-definition-secondary:/)
		;(0, helpers_1.debugLog)(
			"Variable declarations:",
			parseResult.match(/--test-variable-definition-[\w-]+:[\s\S]*?;/g),
		)
	})
	it("should parse import statements", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| @import .+test-import-definition/)
		;(0, helpers_1.debugLog)("Import statements:", parseResult.match(/@import[\s\S]*?;/g))
	})
	it("should parse media queries", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*\.test-media-query-definition/)
		;(0, helpers_1.debugLog)("Media queries:", parseResult.match(/@media[\s\S]*?{[\s\S]*?}/g))
	})
	it("should parse keyframe declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| @keyframes test-keyframe-definition-fade/)
		;(0, helpers_1.debugLog)("Keyframe declarations:", parseResult.match(/@keyframes[\s\S]*?{[\s\S]*?}/g))
	})
	it("should parse function declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| {1,}background-color: rgba\(/)
		expect(parseResult).toMatch(/\d+--\d+ \| {1,}transform: translate\(/)
		;(0, helpers_1.debugLog)(
			"Function declarations:",
			parseResult.match(/(?:rgba|translate|calc|var)\([\s\S]*?\)/g),
		)
	})
	it("should parse basic rulesets", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| \.test-ruleset-definition {/)
		;(0, helpers_1.debugLog)("Basic rulesets:", parseResult.match(/\.test-ruleset-definition[\s\S]*?{[\s\S]*?}/g))
	})
	it("should parse complex selectors", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| \.test-selector-definition[:\s>]/)
		;(0, helpers_1.debugLog)(
			"Complex selectors:",
			parseResult.match(/\.test-selector-definition[\s\S]*?{[\s\S]*?}/g),
		)
	})
	it("should parse nested rulesets", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| \.test-nested-ruleset-definition {/)
		;(0, helpers_1.debugLog)(
			"Nested rulesets:",
			parseResult.match(/\.test-nested-ruleset-definition[\s\S]*?{[\s\S]*?}/g),
		)
	})
})
