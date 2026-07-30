"use strict"
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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.debugLog = exports.DEBUG = exports.mockedFs = void 0
exports.initializeTreeSitter = initializeTreeSitter
exports.testParseSourceCodeDefinitions = testParseSourceCodeDefinitions
exports.inspectTreeStructure = inspectTreeStructure
const __1 = require("..")
const fs = __importStar(require("fs/promises"))
const path = __importStar(require("path"))
const tsx_1 = __importDefault(require("../queries/tsx"))
const web_tree_sitter_1 = require("web-tree-sitter")
vi.mock("fs/promises")
exports.mockedFs = vi.mocked(fs)
vi.mock("../../../utils/fs", () => ({
	fileExistsAtPath: vi.fn().mockImplementation(() => Promise.resolve(true)),
}))
vi.mock("../languageParser", () => ({
	loadRequiredLanguageParsers: vi.fn(),
}))
// Global debug flag - read from environment variable or default to 0
exports.DEBUG = process.env.DEBUG ? parseInt(process.env.DEBUG, 10) : 0
// Debug function to conditionally log messages
const debugLog = (message, ...args) => {
	if (exports.DEBUG) {
		console.debug(message, ...args)
	}
}
exports.debugLog = debugLog
// Store the initialized TreeSitter for reuse
let initializedTreeSitter = null
// Function to initialize tree-sitter
async function initializeTreeSitter() {
	if (!initializedTreeSitter) {
		// Initialize directly using the default export or the module itself
		await web_tree_sitter_1.Parser.init()
		// Override the Parser.Language.load to use dist directory
		const originalLoad = web_tree_sitter_1.Language.load
		web_tree_sitter_1.Language.load = async (wasmPath) => {
			const filename = path.basename(wasmPath)
			const correctPath = path.join(process.cwd(), "dist", filename)
			// console.log(`Redirecting WASM load from ${wasmPath} to ${correctPath}`)
			return originalLoad(correctPath)
		}
		initializedTreeSitter = { Parser: web_tree_sitter_1.Parser, Language: web_tree_sitter_1.Language }
	}
	return initializedTreeSitter
}
// Test helper for parsing source code definitions
async function testParseSourceCodeDefinitions(testFilePath, content, options = {}) {
	// Set minimum component lines to 0 for tests
	;(0, __1.setMinComponentLines)(0)
	// Set default options
	const wasmFile = options.wasmFile || "tree-sitter-tsx.wasm"
	const queryString = options.queryString || tsx_1.default
	const extKey = options.extKey || "tsx"
	// Clear any previous mocks and set up fs mock
	vi.clearAllMocks()
	vi.mock("fs/promises")
	const mockedFs = await vi.importActual("fs/promises")
	fs.readFile.mockResolvedValue(content)
	// Get the mock function
	const { loadRequiredLanguageParsers } = await import("../languageParser")
	const mockedLoadRequiredLanguageParsers = loadRequiredLanguageParsers
	// Initialize TreeSitter and create a real parser
	const { Parser, Language } = await initializeTreeSitter()
	const parser = new Parser()
	// Load language and configure parser
	const wasmPath = path.join(process.cwd(), `dist/${wasmFile}`)
	const lang = await Language.load(wasmPath)
	parser.setLanguage(lang)
	// Create a real query
	const query = lang.query(queryString)
	// Set up our language parser with real parser and query
	const mockLanguageParser = {}
	mockLanguageParser[extKey] = { parser, query }
	// Configure the mock to return our parser
	mockedLoadRequiredLanguageParsers.mockResolvedValue(mockLanguageParser)
	// Call the function under test
	const result = await (0, __1.parseSourceCodeDefinitionsForFile)(testFilePath)
	// Verify loadRequiredLanguageParsers was called with the expected file path
	expect(mockedLoadRequiredLanguageParsers).toHaveBeenCalledWith([testFilePath])
	expect(mockedLoadRequiredLanguageParsers).toHaveBeenCalled()
	;(0, exports.debugLog)(`Result:\n${result}`)
	return result
}
// Helper function to inspect tree structure
async function inspectTreeStructure(content, language = "typescript") {
	const { Parser, Language } = await initializeTreeSitter()
	const parser = new Parser()
	const wasmPath = path.join(process.cwd(), `dist/tree-sitter-${language}.wasm`)
	const lang = await Language.load(wasmPath)
	parser.setLanguage(lang)
	// Parse the content
	const tree = parser.parse(content)
	// Print the tree structure
	;(0, exports.debugLog)(`TREE STRUCTURE (${language}):\n${tree?.rootNode.toString()}`)
	return tree?.rootNode.toString() || ""
}
