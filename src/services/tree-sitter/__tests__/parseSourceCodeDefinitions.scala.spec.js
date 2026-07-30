"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const queries_1 = require("../queries")
const helpers_1 = require("./helpers")
const sample_scala_1 = require("./fixtures/sample-scala")
// Scala test options
const scalaOptions = {
	language: "scala",
	wasmFile: "tree-sitter-scala.wasm",
	queryString: queries_1.scalaQuery,
	extKey: "scala",
}
// Mock file system operations
vi.mock("fs/promises")
// Mock loadRequiredLanguageParsers
vi.mock("../languageParser", () => ({
	loadRequiredLanguageParsers: vi.fn(),
}))
// Mock fileExistsAtPath to return true for our test paths
vi.mock("../../../utils/fs", () => ({
	fileExistsAtPath: vi.fn().mockImplementation(() => Promise.resolve(true)),
}))
describe("parseSourceCodeDefinitionsForFile with Scala", () => {
	let parseResult
	beforeAll(async () => {
		await (0, helpers_1.initializeTreeSitter)()
		parseResult = await (0, helpers_1.testParseSourceCodeDefinitions)(
			"test.scala",
			sample_scala_1.sampleScala,
			scalaOptions,
		)
		expect(parseResult).toBeDefined()
	})
	beforeEach(() => {
		expect(parseResult).toBeDefined()
	})
	it("should parse package declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| package com\.example\.test/)
	})
	it("should parse class declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| class PatternMatcher/)
		expect(parseResult).toMatch(/\d+--\d+ \| class ForComprehension/)
		expect(parseResult).toMatch(/\d+--\d+ \| implicit class RichString/)
	})
	it("should parse case class and case object declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| case class TestCaseClass\[A, B\]/)
		expect(parseResult).toMatch(/\d+--\d+ \| case object SingletonValue extends AbstractBase/)
	})
	it("should parse abstract class and trait declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| abstract class AbstractBase \{/)
		expect(parseResult).toMatch(/\d+--\d+ \| trait TestTrait \{/)
	})
	it("should parse object declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \| object Types \{/)
		expect(parseResult).toMatch(/\d+--\d+ \| object Variables \{/)
	})
	it("should parse method declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   def testMatch\(value: Any\): Int = value match/)
		expect(parseResult).toMatch(/\d+--\d+ \|   def processItems\(items: List\[Int\]\): List\[Int\]/)
	})
	it("should parse value declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   lazy val heavyComputation: Int = \{/)
		expect(parseResult).toMatch(/\d+--\d+ \|   val immutableValue: Int = 42/)
	})
	it("should parse variable declarations", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   var mutableValue: String = "changeable"/)
	})
	it("should parse type definitions", () => {
		expect(parseResult).toMatch(/\d+--\d+ \|   type StringMap\[T\] = Map\[String, T\]/)
	})
	/*
    TODO: The following structures can be parsed by tree-sitter but lack query support:

    1. Pattern Matching:
          (match_expression value: (identifier) body: (case_block))

    2. For Comprehensions:
          (for_expression enumerators: (enumerators))
    */
})
