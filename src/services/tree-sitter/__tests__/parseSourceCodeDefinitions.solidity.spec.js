"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_solidity_1 = require("./fixtures/sample-solidity")
describe("Solidity Source Code Definition Tests", () => {
	let parseResult
	beforeAll(async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.sol",
			sample_solidity_1.sampleSolidity,
			{
				language: "solidity",
				wasmFile: "tree-sitter-solidity.wasm",
				queryString: queries_1.solidityQuery,
				extKey: "sol",
			},
		)
		expect(result).toBeDefined()
		expect(typeof result).toBe("string")
		parseResult = result
	})
	it("should parse contract declarations", () => {
		expect(parseResult).toMatch(/22--102 \| contract TestContract is ITestInterface/)
		expect(parseResult).toMatch(/5--9 \| interface ITestInterface/)
		expect(parseResult).toMatch(/11--20 \| library MathLib/)
	})
	it("should parse using directives", () => {
		expect(parseResult).toMatch(/23--23 \|     using MathLib for uint256;/)
	})
	it("should parse type declarations", () => {
		expect(parseResult).toMatch(/25--30 \|     struct UserInfo {/)
		expect(parseResult).toMatch(/32--37 \|     enum UserRole {/)
	})
	it("should parse state variable declarations", () => {
		expect(parseResult).toMatch(/39--39 \|     uint256 private immutable totalSupply;/)
		expect(parseResult).toMatch(/40--40 \|     mapping\(address => UserInfo\) private users;/)
		expect(parseResult).toMatch(/41--41 \|     UserRole\[\] private roles;/)
	})
	it("should parse function declarations", () => {
		expect(parseResult).toMatch(/70--87 \|     function transfer\(/)
		expect(parseResult).toMatch(/89--93 \|     function interfaceFunction\(/)
		expect(parseResult).toMatch(
			/6--6 \|     function interfaceFunction\(uint256 value\) external returns \(bool\);/,
		)
		expect(parseResult).toMatch(
			/12--14 \|     function add\(uint256 a, uint256 b\) internal pure returns \(uint256\) {/,
		)
		expect(parseResult).toMatch(
			/16--19 \|     function subtract\(uint256 a, uint256 b\) internal pure returns \(uint256\) {/,
		)
	})
	it("should parse constructor declarations", () => {
		expect(parseResult).toMatch(/63--68 \|     constructor\(uint256 _initialSupply\) {/)
	})
	it("should parse special function declarations", () => {
		expect(parseResult).toMatch(/95--97 \|     fallback\(\) external payable {/)
		expect(parseResult).toMatch(/99--101 \|     receive\(\) external payable {/)
	})
	it("should parse event declarations", () => {
		expect(parseResult).toMatch(/43--47 \|     event Transfer\(/)
		expect(parseResult).toMatch(/7--7 \|     event InterfaceEvent\(address indexed sender, uint256 value\);/)
	})
	it("should parse error declarations", () => {
		expect(parseResult).toMatch(/49--53 \|     error InsufficientBalance\(/)
		expect(parseResult).toMatch(/8--8 \|     error InterfaceError\(string message\);/)
	})
	it("should parse modifier declarations", () => {
		expect(parseResult).toMatch(/55--61 \|     modifier onlyAdmin\(\) {/)
	})
})
