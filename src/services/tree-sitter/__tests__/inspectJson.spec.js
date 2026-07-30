"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_json_1 = __importDefault(require("./fixtures/sample-json"))
describe("inspectJson", () => {
	const testOptions = {
		language: "javascript",
		wasmFile: "tree-sitter-javascript.wasm",
		queryString: queries_1.javascriptQuery,
		extKey: "json",
	}
	it("should inspect JSON tree structure", async () => {
		await (0, helpers_1.inspectTreeStructure)(sample_json_1.default, "json")
	})
	it("should parse JSON definitions", async () => {
		await (0, helpers_1.testParseSourceCodeDefinitions)("test.json", sample_json_1.default, testOptions)
	})
})
