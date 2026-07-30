"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const systemrdl_1 = __importDefault(require("../queries/systemrdl"))
const sample_systemrdl_1 = __importDefault(require("./fixtures/sample-systemrdl"))
describe("inspectSystemRDL", () => {
	const testOptions = {
		language: "systemrdl",
		wasmFile: "tree-sitter-systemrdl.wasm",
		queryString: systemrdl_1.default,
		extKey: "rdl",
	}
	it("should inspect SystemRDL tree structure", async () => {
		const result = await (0, helpers_1.inspectTreeStructure)(sample_systemrdl_1.default, "systemrdl")
		expect(result).toBeDefined()
	})
	it("should parse SystemRDL definitions", async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.rdl",
			sample_systemrdl_1.default,
			testOptions,
		)
		expect(result).toBeDefined()
		;(0, helpers_1.debugLog)("SystemRDL parse result:", result)
	})
})
