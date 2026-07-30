"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const vue_1 = require("../queries/vue")
const sample_vue_1 = require("./fixtures/sample-vue")
describe("Vue Parser", () => {
	const testOptions = {
		language: "vue",
		wasmFile: "tree-sitter-vue.wasm",
		queryString: vue_1.vueQuery,
		extKey: "vue",
	}
	it("should inspect Vue tree structure", async () => {
		await (0, helpers_1.inspectTreeStructure)(sample_vue_1.sampleVue, "vue")
	})
	it("should parse Vue definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.vue",
			sample_vue_1.sampleVue,
			testOptions,
		)
		;(0, helpers_1.debugLog)("Vue parse result:", result)
	})
})
