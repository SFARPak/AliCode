"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const sample_zig_1 = require("./fixtures/sample-zig")
const queries_1 = require("../queries")
describe("Zig Tree-sitter Parser", () => {
	it("should inspect tree structure", async () => {
		await (0, helpers_1.inspectTreeStructure)(sample_zig_1.sampleZig, "zig")
	})
	it("should parse source code definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)("file.zig", sample_zig_1.sampleZig, {
			language: "zig",
			wasmFile: "tree-sitter-zig.wasm",
			queryString: queries_1.zigQuery,
			extKey: "zig",
		})
		expect(result).toBeDefined()
	})
})
