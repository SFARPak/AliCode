"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const queries_1 = require("../queries")
const helpers_1 = require("./helpers")
const sample_kotlin_1 = __importDefault(require("./fixtures/sample-kotlin"))
describe("parseSourceCodeDefinitionsForFile with Kotlin", () => {
	const testOptions = {
		language: "kotlin",
		wasmFile: "tree-sitter-kotlin.wasm",
		queryString: queries_1.kotlinQuery,
		extKey: "kt",
	}
	it("should inspect Kotlin tree structure", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(sample_kotlin_1.default, "kotlin")
		;(0, helpers_1.debugLog)("Kotlin Tree Structure:", result)
	})
	it("should parse Kotlin source code definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"/test/file.kt",
			sample_kotlin_1.default,
			testOptions,
		)
		;(0, helpers_1.debugLog)("Kotlin Source Code Definitions:", result)
	})
})
