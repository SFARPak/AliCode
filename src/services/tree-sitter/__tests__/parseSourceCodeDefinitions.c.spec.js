"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const queries_1 = require("../queries")
const sample_c_1 = __importDefault(require("./fixtures/sample-c"))
describe("C Source Code Definition Tests", () => {
	let parseResult
	beforeAll(async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)("test.c", sample_c_1.default, {
			language: "c",
			wasmFile: "tree-sitter-c.wasm",
			queryString: queries_1.cQuery,
			extKey: "c",
		})
		if (!result || !result.match(/\d+--\d+ \|/)) {
			throw new Error("Failed to parse C tree structure")
		}
		parseResult = result
	})
	it("should parse function declarations and definitions", () => {
		// Regular function declarations
		expect(parseResult).toMatch(/\d+--\d+ \|\s*void multiline_prototype\(/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*void void_param_prototype\(/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*void function_pointer_prototype\(/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*int variadic_prototype\(/)
		// Function definitions
		expect(parseResult).toMatch(/\d+--\d+ \|\s*int basic_multitype_function\(/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*void array_param_function\(/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*void pointer_param_function\(/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*int variadic_impl_function\(/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*void test_pointer_function\(/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*int test_variadic_function\(/)
	})
	it("should parse struct definitions", () => {
		// Regular structs
		expect(parseResult).toMatch(/\d+--\d+ \|\s*struct nested_struct \{/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*struct bitfield_struct \{/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*struct callback_struct \{/)
		// Special struct types
		expect(parseResult).toMatch(/\d+--\d+ \|\s*struct anonymous_union_struct \{/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*struct aligned_struct \{/)
		// Global struct
		expect(parseResult).toMatch(/\d+--\d+ \|\s*static struct config_struct \{/)
	})
	it("should parse union definitions", () => {
		// Regular unions
		expect(parseResult).toMatch(/\d+--\d+ \|\s*union multitype_data_union \{/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*union bitfield_union \{/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*union basic_types_struct \{/)
		// Anonymous union in struct
		expect(parseResult).toMatch(/\d+--\d+ \|\s*struct anonymous_union_struct \{/)
	})
	it("should parse enum definitions", () => {
		// Sequential value enums
		expect(parseResult).toMatch(/\d+--\d+ \|\s*enum sequential_value_enum \{/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*enum TestBasicEnum \{/)
		// Explicit value enums
		expect(parseResult).toMatch(/\d+--\d+ \|\s*enum explicit_value_enum \{/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*enum TestValuedEnum \{/)
		// Mixed value enums
		expect(parseResult).toMatch(/\d+--\d+ \|\s*enum mixed_value_enum \{/)
	})
	it("should parse typedef declarations", () => {
		// Anonymous struct typedefs
		expect(parseResult).toMatch(/\d+--\d+ \|\s*typedef struct \{/)
		// Basic type typedefs
		expect(parseResult).toMatch(/\d+--\d+ \|\s*typedef unsigned long long timestamp_typedef/)
		// Function pointer typedef usage
		expect(parseResult).toMatch(/\d+--\d+ \|\s*extern TEST_COMPARE_FUNC test_get_comparator/)
	})
	it("should parse preprocessor definitions", () => {
		// Object-like macros
		expect(parseResult).toMatch(/\d+--\d+ \|\s*#define MAX_SIZE 1024/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*#define TEST_OS "windows"/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*#define TEST_OS "unix"/)
		// Function-like macros
		expect(parseResult).toMatch(/\d+--\d+ \|\s*#define TEST_MIN\(a,b\)/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*#define TEST_MAX\(a,b\)/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*#define TEST_DEBUG_LOG\(level, msg, \.\.\.\)/)
		// Conditional compilation
		expect(parseResult).toMatch(/\d+--\d+ \|\s*#ifdef _WIN32/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*#if TEST_DEBUG_LEVEL >= 2/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*#ifdef TEST_ENABLE_LOGGING/)
	})
	it("should parse global variable declarations", () => {
		// Basic global variables
		expect(parseResult).toMatch(/\d+--\d+ \|\s*static const int MAGIC_NUMBER =/)
		// Array variables
		expect(parseResult).toMatch(/\d+--\d+ \|\s*static const char\* const BUILD_INFO\[\]/)
		// Struct variables
		expect(parseResult).toMatch(/\d+--\d+ \|\s*static struct config_struct/)
		expect(parseResult).toMatch(/\d+--\d+ \|\s*\} DEFAULT_CONFIG =/)
	})
})
