"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_java_1 = __importDefault(require("./fixtures/sample-java"))
describe("inspectJava", () => {
	const testOptions = {
		language: "java",
		wasmFile: "tree-sitter-java.wasm",
		queryString: queries_1.javaQuery,
		extKey: "java",
	}
	it("should inspect Java tree structure", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(sample_java_1.default, "java")
		expect(result).toBeTruthy()
	})
	it("should parse Java definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.java",
			sample_java_1.default,
			testOptions,
		)
		expect(result).toBeTruthy()
		expect(result).toMatch(/\d+--\d+ \| /) // Verify line number format
	})
})
