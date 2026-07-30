"use strict"
/*
TODO: The following structures can be parsed by tree-sitter but lack query support:

1. Interpolation:
   (interpolation (raw_text))

2. Element Attributes:
   (attribute (attribute_name) (quoted_attribute_value (attribute_value)))
*/
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const sample_vue_1 = require("./fixtures/sample-vue")
const vue_1 = require("../queries/vue")
// Mock fs module
vi.mock("fs/promises")
// Mock languageParser module
vi.mock("../languageParser", () => ({
	loadRequiredLanguageParsers: vi.fn(),
}))
// Mock file existence check
vi.mock("../../../utils/fs", () => ({
	fileExistsAtPath: vi.fn().mockImplementation(() => Promise.resolve(true)),
}))
describe("Vue Source Code Definition Tests", () => {
	let parseResult
	beforeAll(async () => {
		await (0, helpers_1.initializeTreeSitter)()
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)("test.vue", sample_vue_1.sampleVue, {
			language: "vue",
			wasmFile: "tree-sitter-vue.wasm",
			queryString: vue_1.vueQuery,
			extKey: "vue",
		})
		expect(result).toBeDefined()
		expect(typeof result).toBe("string")
		parseResult = result
	})
	it("should parse template section", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*<template>/)
	})
	it("should parse script section", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*<script>/)
	})
	it("should parse style section", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*<style>/)
	})
	it("should parse sections in correct order", () => {
		const lines = parseResult?.split("\n") || []
		const templateIndex = lines.findIndex((line) => line.includes("| <template>"))
		const scriptIndex = lines.findIndex((line) => line.includes("| <script>"))
		const styleIndex = lines.findIndex((line) => line.includes("| <style>"))
		expect(templateIndex).toBeLessThan(scriptIndex)
		expect(scriptIndex).toBeLessThan(styleIndex)
	})
	it("should match expected line ranges", () => {
		expect(parseResult).toMatch(/2--93 \|\s*<template>/)
		expect(parseResult).toMatch(/13--83 \|\s*<script>/)
		expect(parseResult).toMatch(/85--92 \|\s*<style>/)
	})
})
