"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_embedded_template_1 = __importDefault(require("./fixtures/sample-embedded_template"))
describe("parseSourceCodeDefinitions (Embedded Template)", () => {
	const testOptions = {
		language: "embedded_template",
		wasmFile: "tree-sitter-embedded_template.wasm",
		queryString: queries_1.embeddedTemplateQuery,
		extKey: "erb",
		minComponentLines: 4,
	}
	let parseResult = ""
	beforeAll(async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.erb",
			sample_embedded_template_1.default,
			testOptions,
		)
		if (!result) {
			throw new Error("Failed to parse source code definitions")
		}
		parseResult = result
		;(0, helpers_1.debugLog)("All definitions:", parseResult)
	})
	it("should detect multi-line comments", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| <%# Multi-line comment block explaining/)
	})
	it("should detect function definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| <% def complex_helper\(param1, param2\)/)
		expect(parseResult).toMatch(/\d+--\d+ \| <% def render_navigation\(items\)/)
	})
	it("should detect class definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| <% class TemplateHelper/)
	})
	it("should detect module definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| <% module TemplateUtils/)
	})
	it("should detect control structures", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s+<% if user\.authenticated\? %>/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s+<% user\.posts\.each do \|post\| %>/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s+<% if post\.has_comments\? %>/)
	})
	it("should detect content blocks", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| <% content_for :header do/)
		expect(parseResult).toMatch(/\d+--\d+ \| <% content_for :main do/)
	})
})
