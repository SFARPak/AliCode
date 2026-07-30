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
describe("SystemRDL Source Code Definition Tests", () => {
	let parseResult
	beforeAll(async () => {
		await (0, helpers_1.initializeTreeSitter)()
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)("test.rdl", sample_systemrdl_1.default, {
			language: "systemrdl",
			wasmFile: "tree-sitter-systemrdl.wasm",
			queryString: systemrdl_1.default,
			extKey: "rdl",
		})
		expect(result).toBeDefined()
		expect(typeof result).toBe("string")
		parseResult = result
	})
	it("should parse component definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*addrmap top_map {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*reg block_ctrl {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*reg status_reg {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*reg complex_reg {/)
	})
	it("should parse field definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*field {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*} enable\[1:0\];/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*field {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*} status;/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*field {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*} errors\[3:0\];/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*field {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*} ctrl\[7:0\];/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*field {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*} status\[15:8\];/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*field {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*} flags\[23:16\];/)
	})
	it("should parse property definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*property my_custom_prop {/)
	})
	it("should parse parameter definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*parameter DATA_WIDTH {/)
	})
	it("should parse enum definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*enum error_types {/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*enum interrupt_type {/)
	})
})
