"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const elisp_1 = require("../queries/elisp")
const sample_elisp_1 = __importDefault(require("./fixtures/sample-elisp"))
describe("inspectElisp", () => {
	const testOptions = {
		language: "elisp",
		wasmFile: "tree-sitter-elisp.wasm",
		queryString: elisp_1.elispQuery,
		extKey: "el",
	}
	it("should validate Elisp tree structure inspection", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(sample_elisp_1.default, "elisp")
		expect(result).toBeDefined()
		expect(result.length).toBeGreaterThan(0)
	})
	it("should validate Elisp definitions parsing", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.el",
			sample_elisp_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		expect(result).toMatch(/\d+--\d+ \|/) // Verify line number format
		// Verify some sample content is parsed
		expect(result).toMatch(/defun test-function/)
		expect(result).toMatch(/defmacro test-macro/)
	})
})
