"use strict"
/*
TODO: The following structures can be parsed by tree-sitter but lack query support:

1. Variable Definition:
   (defvar name value docstring)

2. Constant Definition:
   (defconst name value docstring)
*/
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const elisp_1 = require("../queries/elisp")
const sample_elisp_1 = __importDefault(require("./fixtures/sample-elisp"))
describe("parseSourceCodeDefinitions.elisp", () => {
	const testOptions = {
		language: "elisp",
		wasmFile: "tree-sitter-elisp.wasm",
		queryString: elisp_1.elispQuery,
		extKey: "el",
	}
	let parseResult = ""
	beforeAll(async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"file.el",
			sample_elisp_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		if (!result) {
			throw new Error("Failed to parse source code definitions")
		}
		parseResult = result
	})
	it("should parse function definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| \(defun test-function/)
	})
	it("should parse macro definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| \(defmacro test-macro/)
	})
	it("should parse custom form definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| \(defcustom test-custom/)
	})
	it("should parse face definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| \(defface test-face/)
	})
	it("should parse advice definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| \(defadvice test-advice/)
	})
	it("should parse group definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| \(defgroup test-group nil/)
	})
	it("should verify total number of definitions", () => {
		const matches = parseResult.match(/\d+--\d+ \|/g) || []
		expect(matches.length).toBe(6) // All supported definition types
	})
	it("should verify file header is present", () => {
		expect(parseResult).toMatch(/# file\.el/)
	})
})
