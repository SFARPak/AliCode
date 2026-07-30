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
Object.defineProperty(exports, "__esModule", { value: true })
exports.extensions = void 0
exports.getMinComponentLines = getMinComponentLines
exports.setMinComponentLines = setMinComponentLines
exports.parseSourceCodeDefinitionsForFile = parseSourceCodeDefinitionsForFile
const fs = __importStar(require("fs/promises"))
const path = __importStar(require("path"))
const languageParser_1 = require("./languageParser")
const fs_1 = require("../../utils/fs")
const markdownParser_1 = require("./markdownParser")
// Private constant
const DEFAULT_MIN_COMPONENT_LINES_VALUE = 4
// Getter function for MIN_COMPONENT_LINES (for easier testing)
let currentMinComponentLines = DEFAULT_MIN_COMPONENT_LINES_VALUE
/**
 * Get the current minimum number of lines for a component to be included
 */
function getMinComponentLines() {
	return currentMinComponentLines
}
/**
 * Set the minimum number of lines for a component (for testing)
 */
function setMinComponentLines(value) {
	currentMinComponentLines = value
}
const extensions = [
	"tla",
	"js",
	"jsx",
	"ts",
	"vue",
	"tsx",
	"py",
	// Rust
	"rs",
	"go",
	// C
	"c",
	"h",
	// C++
	"cpp",
	"hpp",
	// C#
	"cs",
	// Ruby
	"rb",
	"java",
	"php",
	"swift",
	// Solidity
	"sol",
	// Kotlin
	"kt",
	"kts",
	// Elixir
	"ex",
	"exs",
	// Elisp
	"el",
	// HTML
	"html",
	"htm",
	// Markdown
	"md",
	"markdown",
	// JSON
	"json",
	// CSS
	"css",
	// SystemRDL
	"rdl",
	// OCaml
	"ml",
	"mli",
	// Lua
	"lua",
	// Scala
	"scala",
	// TOML
	"toml",
	// Zig
	"zig",
	// Elm
	"elm",
	// Embedded Template
	"ejs",
	"erb",
	// Visual Basic .NET
	"vb",
].map((e) => `.${e}`)
exports.extensions = extensions
async function parseSourceCodeDefinitionsForFile(filePath, aliIgnoreController) {
	// check if the file exists
	const fileExists = await (0, fs_1.fileExistsAtPath)(path.resolve(filePath))
	if (!fileExists) {
		return "This file does not exist or you do not have permission to access it."
	}
	// Get file extension to determine parser
	const ext = path.extname(filePath).toLowerCase()
	// Check if the file extension is supported
	if (!extensions.includes(ext)) {
		return undefined
	}
	// Special case for markdown files
	if (ext === ".md" || ext === ".markdown") {
		// Check if we have permission to access this file
		if (aliIgnoreController && !aliIgnoreController.validateAccess(filePath)) {
			return undefined
		}
		// Read file content
		const fileContent = await fs.readFile(filePath, "utf8")
		// Split the file content into individual lines
		const lines = fileContent.split("\n")
		// Parse markdown content to get captures
		const markdownCaptures = (0, markdownParser_1.parseMarkdown)(fileContent)
		// Process the captures
		const markdownDefinitions = processCaptures(markdownCaptures, lines, "markdown")
		if (markdownDefinitions) {
			return `# ${path.basename(filePath)}\n${markdownDefinitions}`
		}
		return undefined
	}
	// For other file types, load parser and use tree-sitter
	const languageParsers = await (0, languageParser_1.loadRequiredLanguageParsers)([filePath])
	// Parse the file if we have a parser for it
	const definitions = await parseFile(filePath, languageParsers, aliIgnoreController)
	if (definitions) {
		return `# ${path.basename(filePath)}\n${definitions}`
	}
	return undefined
}
/*
Parsing files using tree-sitter

1. Parse the file content into an AST (Abstract Syntax Tree) using the appropriate language grammar (set of rules that define how the components of a language like keywords, expressions, and statements can be combined to create valid programs).
2. Create a query using a language-specific query string, and run it against the AST's root node to capture specific syntax elements.
    - We use tag queries to identify named entities in a program, and then use a syntax capture to label the entity and its name. A notable example of this is GitHub's search-based code navigation.
    - Our custom tag queries are based on tree-sitter's default tag queries, but modified to only capture definitions.
3. Sort the captures by their position in the file, output the name of the definition, and format by i.e. adding "|----\n" for gaps between captured sections.

This approach allows us to focus on the most relevant parts of the code (defined by our language-specific queries) and provides a concise yet informative view of the file's structure and key elements.

- https://github.com/tree-sitter/node-tree-sitter/blob/master/test/query_test.js
- https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/test/query-test.js
- https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/test/helper.js
- https://tree-sitter.github.io/tree-sitter/code-navigation-systems
*/
/**
 * Parse a file and extract code definitions using tree-sitter
 *
 * @param filePath - Path to the file to parse
 * @param languageParsers - Map of language parsers
 * @param aliIgnoreController - Optional controller to check file access permissions
 * @returns A formatted string with code definitions or null if no definitions found
 */
/**
 * Process captures from tree-sitter or markdown parser
 *
 * @param captures - The captures to process
 * @param lines - The lines of the file
 * @param minComponentLines - Minimum number of lines for a component to be included
 * @returns A formatted string with definitions
 */
function processCaptures(captures, lines, language) {
	// Determine if HTML filtering is needed for this language
	const needsHtmlFiltering = ["jsx", "tsx"].includes(language)
	// Filter function to exclude HTML elements if needed
	const isNotHtmlElement = (line) => {
		if (!needsHtmlFiltering) return true
		// Common HTML elements pattern
		const HTML_ELEMENTS = /^[^A-Z]*<\/?(?:div|span|button|input|h[1-6]|p|a|img|ul|li|form)\b/
		const trimmedLine = line.trim()
		return !HTML_ELEMENTS.test(trimmedLine)
	}
	// No definitions found
	if (captures.length === 0) {
		return null
	}
	let formattedOutput = ""
	// Sort captures by their start position
	captures.sort((a, b) => a.node.startPosition.row - b.node.startPosition.row)
	// Track already processed lines to avoid duplicates
	const processedLines = new Set()
	// First pass - categorize captures by type
	captures.forEach((capture) => {
		const { node, name } = capture
		// Skip captures that don't represent definitions
		if (!name.includes("definition") && !name.includes("name")) {
			return
		}
		// Get the parent node that contains the full definition
		const definitionNode = name.includes("name") ? node.parent : node
		if (!definitionNode) return
		// Get the start and end lines of the full definition
		const startLine = definitionNode.startPosition.row
		const endLine = definitionNode.endPosition.row
		const lineCount = endLine - startLine + 1
		// Skip components that don't span enough lines
		if (lineCount < getMinComponentLines()) {
			return
		}
		// Create unique key for this definition based on line range
		// This ensures we don't output the same line range multiple times
		const lineKey = `${startLine}-${endLine}`
		// Skip already processed lines
		if (processedLines.has(lineKey)) {
			return
		}
		// Check if this is a valid component definition (not an HTML element)
		const startLineContent = lines[startLine].trim()
		// Special handling for component name definitions
		if (name.includes("name.definition")) {
			// Extract component name
			const componentName = node.text
			// Add component name to output regardless of HTML filtering
			if (!processedLines.has(lineKey) && componentName) {
				formattedOutput += `${startLine + 1}--${endLine + 1} | ${lines[startLine]}\n`
				processedLines.add(lineKey)
			}
		}
		// For other component definitions
		else if (isNotHtmlElement(startLineContent)) {
			formattedOutput += `${startLine + 1}--${endLine + 1} | ${lines[startLine]}\n`
			processedLines.add(lineKey)
			// If this is part of a larger definition, include its non-HTML context
			if (node.parent && node.parent.lastChild) {
				const contextEnd = node.parent.lastChild.endPosition.row
				const contextSpan = contextEnd - node.parent.startPosition.row + 1
				// Only include context if it spans multiple lines
				if (contextSpan >= getMinComponentLines()) {
					// Add the full range first
					const rangeKey = `${node.parent.startPosition.row}-${contextEnd}`
					if (!processedLines.has(rangeKey)) {
						formattedOutput += `${node.parent.startPosition.row + 1}--${contextEnd + 1} | ${lines[node.parent.startPosition.row]}\n`
						processedLines.add(rangeKey)
					}
				}
			}
		}
	})
	if (formattedOutput.length > 0) {
		return formattedOutput
	}
	return null
}
/**
 * Parse a file and extract code definitions using tree-sitter
 *
 * @param filePath - Path to the file to parse
 * @param languageParsers - Map of language parsers
 * @param aliIgnoreController - Optional controller to check file access permissions
 * @returns A formatted string with code definitions or null if no definitions found
 */
async function parseFile(filePath, languageParsers, aliIgnoreController) {
	// Check if we have permission to access this file
	if (aliIgnoreController && !aliIgnoreController.validateAccess(filePath)) {
		return null
	}
	// Read file content
	const fileContent = await fs.readFile(filePath, "utf8")
	const extLang = path.extname(filePath).toLowerCase().slice(1)
	// Check if we have a parser for this file type
	const { parser, query } = languageParsers[extLang] || {}
	if (!parser || !query) {
		return `Unsupported file type: ${filePath}`
	}
	try {
		// Parse the file content into an Abstract Syntax Tree (AST)
		const tree = parser.parse(fileContent)
		// Apply the query to the AST and get the captures
		const captures = tree ? query.captures(tree.rootNode) : []
		// Split the file content into individual lines
		const lines = fileContent.split("\n")
		// Process the captures
		return processCaptures(captures, lines, extLang)
	} catch (error) {
		console.log(`Error parsing file: ${error}\n`)
		// Return null on parsing error to avoid showing error messages in the output
		return null
	}
}
