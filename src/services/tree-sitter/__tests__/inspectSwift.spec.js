"use strict"
// npx vitest services/tree-sitter/__tests__/inspectSwift.spec.ts
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_swift_1 = __importDefault(require("./fixtures/sample-swift"))
// This is insanely slow for some reason.
describe.skip("inspectSwift", () => {
	const testOptions = {
		language: "swift",
		wasmFile: "tree-sitter-swift.wasm",
		queryString: queries_1.swiftQuery,
		extKey: "swift",
	}
	it("should inspect Swift tree structure", async () => {
		// Should execute without throwing
		await expect((0, helpers_1.inspectTreeStructure)(sample_swift_1.default, "swift")).resolves.not.toThrow()
	})
	it("should parse Swift definitions", async () => {
		// This test validates that testParseSourceCodeDefinitions produces output
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.swift",
			sample_swift_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		// Check that the output format includes line numbers and content
		if (result) {
			expect(result).toMatch(/\d+--\d+ \| .+/)
			;(0, helpers_1.debugLog)("Swift parsing test completed successfully")
		}
	}, 15000) // Increase timeout to 15 seconds
})
