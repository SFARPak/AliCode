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
exports.loadRequiredLanguageParsers = loadRequiredLanguageParsers
const path = __importStar(require("path"))
const queries_1 = require("./queries")
async function loadLanguage(langName, sourceDirectory) {
	const baseDir = sourceDirectory || __dirname
	const wasmPath = path.join(baseDir, `tree-sitter-${langName}.wasm`)
	try {
		const { Language } = require("web-tree-sitter")
		return await Language.load(wasmPath)
	} catch (error) {
		console.error(`Error loading language: ${wasmPath}: ${error instanceof Error ? error.message : error}`)
		throw error
	}
}
let isParserInitialized = false
/*
Using node bindings for tree-sitter is problematic in vscode extensions
because of incompatibility with electron. Going the .wasm route has the
advantage of not having to build for multiple architectures.

We use web-tree-sitter and tree-sitter-wasms which provides auto-updating
prebuilt WASM binaries for tree-sitter's language parsers.

This function loads WASM modules for relevant language parsers based on input files:
1. Extracts unique file extensions
2. Maps extensions to language names
3. Loads corresponding WASM files (containing grammar rules)
4. Uses WASM modules to initialize tree-sitter parsers

This approach optimizes performance by loading only necessary parsers once for all relevant files.

Sources:
- https://github.com/tree-sitter/node-tree-sitter/issues/169
- https://github.com/tree-sitter/node-tree-sitter/issues/168
- https://github.com/Gregoor/tree-sitter-wasms/blob/main/README.md
- https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/README.md
- https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/test/query-test.js
*/
async function loadRequiredLanguageParsers(filesToParse, sourceDirectory) {
	const { Parser, Query } = require("web-tree-sitter")
	if (!isParserInitialized) {
		try {
			await Parser.init()
			isParserInitialized = true
		} catch (error) {
			console.error(`Error initializing parser: ${error instanceof Error ? error.message : error}`)
			throw error
		}
	}
	const extensionsToLoad = new Set(filesToParse.map((file) => path.extname(file).toLowerCase().slice(1)))
	const parsers = {}
	for (const ext of extensionsToLoad) {
		let language
		let query
		let parserKey = ext // Default to using extension as key
		switch (ext) {
			case "js":
			case "jsx":
			case "json":
				language = await loadLanguage("javascript", sourceDirectory)
				query = new Query(language, queries_1.javascriptQuery)
				break
			case "ts":
				language = await loadLanguage("typescript", sourceDirectory)
				query = new Query(language, queries_1.typescriptQuery)
				break
			case "tsx":
				language = await loadLanguage("tsx", sourceDirectory)
				query = new Query(language, queries_1.tsxQuery)
				break
			case "py":
				language = await loadLanguage("python", sourceDirectory)
				query = new Query(language, queries_1.pythonQuery)
				break
			case "rs":
				language = await loadLanguage("rust", sourceDirectory)
				query = new Query(language, queries_1.rustQuery)
				break
			case "go":
				language = await loadLanguage("go", sourceDirectory)
				query = new Query(language, queries_1.goQuery)
				break
			case "cpp":
			case "hpp":
				language = await loadLanguage("cpp", sourceDirectory)
				query = new Query(language, queries_1.cppQuery)
				break
			case "c":
			case "h":
				language = await loadLanguage("c", sourceDirectory)
				query = new Query(language, queries_1.cQuery)
				break
			case "cs":
				language = await loadLanguage("c_sharp", sourceDirectory)
				query = new Query(language, queries_1.csharpQuery)
				break
			case "rb":
				language = await loadLanguage("ruby", sourceDirectory)
				query = new Query(language, queries_1.rubyQuery)
				break
			case "java":
				language = await loadLanguage("java", sourceDirectory)
				query = new Query(language, queries_1.javaQuery)
				break
			case "php":
				language = await loadLanguage("php", sourceDirectory)
				query = new Query(language, queries_1.phpQuery)
				break
			case "swift":
				language = await loadLanguage("swift", sourceDirectory)
				query = new Query(language, queries_1.swiftQuery)
				break
			case "kt":
			case "kts":
				language = await loadLanguage("kotlin", sourceDirectory)
				query = new Query(language, queries_1.kotlinQuery)
				break
			case "css":
				language = await loadLanguage("css", sourceDirectory)
				query = new Query(language, queries_1.cssQuery)
				break
			case "html":
				language = await loadLanguage("html", sourceDirectory)
				query = new Query(language, queries_1.htmlQuery)
				break
			case "ml":
			case "mli":
				language = await loadLanguage("ocaml", sourceDirectory)
				query = new Query(language, queries_1.ocamlQuery)
				break
			case "scala":
				language = await loadLanguage("scala", sourceDirectory)
				query = new Query(language, queries_1.luaQuery) // Temporarily use Lua query until Scala is implemented
				break
			case "sol":
				language = await loadLanguage("solidity", sourceDirectory)
				query = new Query(language, queries_1.solidityQuery)
				break
			case "toml":
				language = await loadLanguage("toml", sourceDirectory)
				query = new Query(language, queries_1.tomlQuery)
				break
			case "vue":
				language = await loadLanguage("vue", sourceDirectory)
				query = new Query(language, queries_1.vueQuery)
				break
			case "lua":
				language = await loadLanguage("lua", sourceDirectory)
				query = new Query(language, queries_1.luaQuery)
				break
			case "rdl":
				language = await loadLanguage("systemrdl", sourceDirectory)
				query = new Query(language, queries_1.systemrdlQuery)
				break
			case "tla":
				language = await loadLanguage("tlaplus", sourceDirectory)
				query = new Query(language, queries_1.tlaPlusQuery)
				break
			case "zig":
				language = await loadLanguage("zig", sourceDirectory)
				query = new Query(language, queries_1.zigQuery)
				break
			case "ejs":
			case "erb":
				parserKey = "embedded_template" // Use same key for both extensions.
				language = await loadLanguage("embedded_template", sourceDirectory)
				query = new Query(language, queries_1.embeddedTemplateQuery)
				break
			case "el":
				language = await loadLanguage("elisp", sourceDirectory)
				query = new Query(language, queries_1.elispQuery)
				break
			case "ex":
			case "exs":
				language = await loadLanguage("elixir", sourceDirectory)
				query = new Query(language, queries_1.elixirQuery)
				break
			default:
				throw new Error(`Unsupported language: ${ext}`)
		}
		const parser = new Parser()
		parser.setLanguage(language)
		parsers[parserKey] = { parser, query }
	}
	return parsers
}
