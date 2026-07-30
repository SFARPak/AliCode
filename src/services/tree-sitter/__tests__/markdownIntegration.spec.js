"use strict"
// Mocks must come first, before imports
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
vi.mock("fs/promises", () => ({
	readFile: vi.fn().mockImplementation(() => Promise.resolve("")),
	stat: vi.fn().mockImplementation(() => Promise.resolve({ isDirectory: () => false })),
}))
vi.mock("../../../utils/fs", () => ({
	fileExistsAtPath: vi.fn().mockImplementation(() => Promise.resolve(true)),
}))
// Then imports
const fs = __importStar(require("fs/promises"))
const index_1 = require("../index")
describe("Markdown Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})
	it("should parse markdown files and extract headers for definition listing", async () => {
		// This test verifies that the tree-sitter integration correctly
		// formats markdown headers for the definition listing feature
		const markdownContent =
			"# Main Header\n\nThis is some content under the main header.\nIt spans multiple lines to meet the minimum section length.\n\n## Section 1\n\nThis is content for section 1.\nIt also spans multiple lines.\n\n### Subsection 1.1\n\nThis is a subsection with enough lines\nto meet the minimum section length requirement.\n\n## Section 2\n\nFinal section content.\nWith multiple lines.\n"
		fs.readFile.mockImplementation(() => Promise.resolve(markdownContent))
		// Call the function with a markdown file path
		const result = await (0, index_1.parseSourceCodeDefinitionsForFile)("test.md")
		// Verify fs.readFile was called with the correct path
		expect(fs.readFile).toHaveBeenCalledWith("test.md", "utf8")
		// Check the result formatting for definition listing
		expect(result).toBeDefined()
		expect(result).toContain("# test.md")
		expect(result).toContain("1--5 | # Main Header")
		expect(result).toContain("6--10 | ## Section 1")
		expect(result).toContain("11--15 | ### Subsection 1.1")
		expect(result).toContain("16--20 | ## Section 2")
	})
	it("should return undefined for markdown files with no extractable definitions", async () => {
		// This test verifies behavior when no headers meet the minimum requirements
		const markdownContent = "This is just some text.\nNo headers here.\nJust plain text."
		fs.readFile.mockImplementation(() => Promise.resolve(markdownContent))
		// Call the function with a markdown file path
		const result = await (0, index_1.parseSourceCodeDefinitionsForFile)("no-headers.md")
		// Verify fs.readFile was called with the correct path
		expect(fs.readFile).toHaveBeenCalledWith("no-headers.md", "utf8")
		// Check the result - should be undefined since no definitions found
		expect(result).toBeUndefined()
	})
})
