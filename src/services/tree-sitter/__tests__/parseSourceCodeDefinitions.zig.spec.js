"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const helpers_1 = require("./helpers")
const sample_zig_1 = require("./fixtures/sample-zig")
const queries_1 = require("../queries")
describe("Zig Source Code Definition Tests", () => {
	let parseResult
	beforeAll(async () => {
		const result = await (0, helpers_1.testParseSourceCodeDefinitions)("file.zig", sample_zig_1.sampleZig, {
			language: "zig",
			wasmFile: "tree-sitter-zig.wasm",
			queryString: queries_1.zigQuery,
			extKey: "zig",
		})
		expect(result).toBeDefined()
		expect(typeof result).toBe("string")
		parseResult = result
	})
	it("should parse function definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| pub fn main\(\) !void/)
		expect(parseResult).toMatch(/\d+--\d+ \|     pub fn init\(x: f32, y: f32\) Point/)
		expect(parseResult).toMatch(/\d+--\d+ \|     pub fn distance\(self: Point\) f32/)
	})
	it("should parse container definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| pub const Point = struct/)
		expect(parseResult).toMatch(/\d+--\d+ \| pub const Vector = struct/)
		expect(parseResult).toMatch(/\d+--\d+ \| const Direction = enum/)
	})
	it("should parse variable definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| const std = @import\("std"\)/)
		expect(parseResult).toMatch(/\d+--\d+ \| var global_point: Point/)
		expect(parseResult).toMatch(/\d+--\d+ \| pub const VERSION: u32/)
	})
})
