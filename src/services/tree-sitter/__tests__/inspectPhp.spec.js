"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_php_1 = __importDefault(require("./fixtures/sample-php"))
describe("inspectPhp", () => {
	const testOptions = {
		language: "php",
		wasmFile: "tree-sitter-php.wasm",
		queryString: queries_1.phpQuery,
		extKey: "php",
	}
	it("should inspect PHP tree structure", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(sample_php_1.default, "php")
		expect(result).toBeDefined()
	})
	it("should parse PHP definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.php",
			sample_php_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \|/) // Verify line number format
	})
})
