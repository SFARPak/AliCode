"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_tlaplus_1 = __importDefault(require("./fixtures/sample-tlaplus"))
describe("inspectTLAPlus", () => {
	const testOptions = {
		language: "tlaplus",
		wasmFile: "tree-sitter-tlaplus.wasm",
		queryString: queries_1.tlaPlusQuery,
		extKey: "tla",
	}
	it("should inspect TLA+ tree structure", async () => {
		await (0, helpers_1.inspectTreeStructure)(sample_tlaplus_1.default, "tlaplus")
	})
	it("should parse TLA+ definitions", async () => {
		await (0, helpers_1.testParseSourceCodeDefinitions)("test.tla", sample_tlaplus_1.default, testOptions)
	})
})
