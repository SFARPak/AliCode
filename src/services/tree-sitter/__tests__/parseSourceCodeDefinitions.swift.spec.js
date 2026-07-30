"use strict"
// npx vitest services/tree-sitter/__tests__/parseSourceCodeDefinitions.swift.spec.ts
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const queries_1 = require("../queries")
const helpers_1 = require("./helpers")
const sample_swift_1 = __importDefault(require("./fixtures/sample-swift"))
// Swift test options
const testOptions = {
	language: "swift",
	wasmFile: "tree-sitter-swift.wasm",
	queryString: queries_1.swiftQuery,
	extKey: "swift",
}
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
// This is insanely slow for some reason.
describe.skip("parseSourceCodeDefinitionsForFile with Swift", () => {
	// Cache the result to avoid repeated slow parsing
	let parsedResult
	// Run once before all tests to parse the Swift code
	beforeAll(async () => {
		await (0, helpers_1.initializeTreeSitter)()
		// Parse Swift code once and store the result
		parsedResult = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"/test/file.swift",
			sample_swift_1.default,
			testOptions,
		)
	})
	beforeEach(() => {
		vi.clearAllMocks()
	})
	// Single test for class declarations (standard, final, open, and inheriting classes)
	it("should capture class declarations with all modifiers", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*class StandardClassDefinition/)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*final class FinalClassDefinition/)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*open class OpenClassDefinition/)
		expect(parsedResult).toMatch(
			/\d+--\d+ \|\s*class InheritingClassDefinition: StandardClassDefinition, ProtocolDefinition/,
		)
	})
	// Single test for struct declarations (standard and generic structs)
	it("should capture struct declarations", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*struct StandardStructDefinition/)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*struct GenericStructDefinition<T: Comparable, U>/)
	})
	// Single test for protocol declarations (basic and with associated types)
	it("should capture protocol declarations", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*protocol ProtocolDefinition/)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*protocol AssociatedTypeProtocolDefinition/)
	})
	// Single test for extension declarations (for class, struct, and protocol)
	it("should capture extension declarations", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*extension StandardClassDefinition/)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*extension StandardStructDefinition/)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*extension ProtocolDefinition/)
	})
	// Single test for method declarations (instance and type methods)
	it("should capture method declarations", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*func instanceMethodDefinition/)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*static func typeMethodDefinition/)
	})
	// Single test for property declarations (stored and computed)
	it("should capture property declarations", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*var storedPropertyWithObserver: Int = 0/)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*var computedProperty: String/)
	})
	// Single test for initializer declarations (designated and convenience)
	it("should capture initializer declarations", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*init\(/)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*convenience init\(/)
	})
	// Single test for deinitializer declarations
	it("should capture deinitializer declarations", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*deinit/)
	})
	// Single test for subscript declarations
	it("should capture subscript declarations", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*subscript\(/)
	})
	// Single test for type alias declarations
	it("should capture type alias declarations", async () => {
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*typealias DictionaryOfArrays</)
		expect(parsedResult).toMatch(/\d+--\d+ \|\s*class TypeAliasContainer/)
	})
})
