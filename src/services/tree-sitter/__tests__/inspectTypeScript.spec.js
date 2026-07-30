"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_typescript_1 = __importDefault(require("./fixtures/sample-typescript"))
describe("inspectTypeScript", () => {
	const testOptions = {
		language: "typescript",
		wasmFile: "tree-sitter-typescript.wasm",
		queryString: queries_1.typescriptQuery,
		extKey: "ts",
	}
	it("should successfully inspect TypeScript tree structure", async () => {
		// Should execute without throwing
		await expect(
			(0, helpers_1.inspectTreeStructure)(sample_typescript_1.default, "typescript"),
		).resolves.not.toThrow()
	})
	it("should successfully parse TypeScript definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.ts",
			sample_typescript_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \|/) // Verify line number format
		expect(result).toMatch(/interface TestInterfaceDefinition/) // Verify some content
	})
})
