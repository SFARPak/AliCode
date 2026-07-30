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
describe("inspectEmbeddedTemplate", () => {
	const testOptions = {
		language: "embedded_template",
		wasmFile: "tree-sitter-embedded_template.wasm",
		queryString: queries_1.embeddedTemplateQuery,
		extKey: "erb", // Match the file extension we're using
	}
	it("should inspect embedded template tree structure", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(
			sample_embedded_template_1.default,
			"embedded_template",
		)
		expect(result).toBeTruthy()
	})
	it("should parse embedded template definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.erb",
			sample_embedded_template_1.default,
			testOptions,
		)
		expect(result).toBeTruthy()
		expect(result).toMatch(/\d+--\d+ \|/) // Verify line number format
	})
})
