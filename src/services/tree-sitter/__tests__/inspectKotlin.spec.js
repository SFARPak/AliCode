"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_kotlin_1 = __importDefault(require("./fixtures/sample-kotlin"))
describe("inspectKotlin", () => {
	const testOptions = {
		language: "kotlin",
		wasmFile: "tree-sitter-kotlin.wasm",
		queryString: queries_1.kotlinQuery,
		extKey: "kt",
	}
	it("should inspect Kotlin tree structure", async () => {
		await (0, helpers_1.inspectTreeStructure)(sample_kotlin_1.default, "kotlin")
	})
	it("should parse Kotlin definitions", async () => {
		await (0, helpers_1.testParseSourceCodeDefinitions)("test.kt", sample_kotlin_1.default, testOptions)
	})
})
