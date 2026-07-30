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
describe("parseSourceCodeDefinitions (TLA+)", () => {
	let parseResult
	beforeAll(async () => {
		await (0, helpers_1.initializeTreeSitter)()
		const testOptions = {
			language: "tlaplus",
			wasmFile: "tree-sitter-tlaplus.wasm",
			queryString: queries_1.tlaPlusQuery,
			extKey: "tla",
		}
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.tla",
			sample_tlaplus_1.default,
			testOptions,
		)
		if (!result) {
			throw new Error("Failed to parse TLA+ source code definitions")
		}
		parseResult = result
	})
	it("should parse module declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*---- MODULE SimpleModule ----/)
	})
	it("should parse constant declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*CONSTANT N/)
	})
	it("should parse variable declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*VARIABLE x, y, z/)
	})
	it("should parse simple operator definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*Max\(a, b\) ==/)
	})
	it("should parse complex operator definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*ComplexOperator\(seq\) ==/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*ProcessStep ==/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*HandleCase\(val\) ==/)
	})
	it("should parse function definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*SimpleFunction\[a \\in 1\.\.N\] ==/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*Factorial\[n \\in Nat\] ==/)
	})
	it("should parse let expressions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*LET sum ==/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*LET square ==/)
	})
	it("should parse variable tuple definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|\s*vars == <<x, y, z>>/)
	})
})
