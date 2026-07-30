"use strict"
// npx vitest services/tree-sitter/__tests__/languageParser.spec.ts
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
const path = __importStar(require("path"))
const languageParser_1 = require("../languageParser")
// Path to the directory containing the WASM files.
const WASM_DIR = path.join(__dirname, "../../../node_modules/tree-sitter-wasms/out")
describe("loadRequiredLanguageParsers", () => {
	it("should load Python parser for .py files", async () => {
		const files = ["test.py"]
		const parsers = await (0, languageParser_1.loadRequiredLanguageParsers)(files, WASM_DIR)
		expect(parsers.py).toBeDefined()
	})
	it("should load JavaScript parser for .js and .jsx files", async () => {
		const files = ["test.js", "test.jsx"]
		const parsers = await (0, languageParser_1.loadRequiredLanguageParsers)(files, WASM_DIR)
		expect(parsers.js).toBeDefined()
		expect(parsers.jsx).toBeDefined()
		expect(parsers.js.query).toBeDefined()
		expect(parsers.jsx.query).toBeDefined()
	})
	it("should load multiple language parsers as needed", async () => {
		const files = ["test.js", "test.py", "test.rs", "test.go"]
		const parsers = await (0, languageParser_1.loadRequiredLanguageParsers)(files, WASM_DIR)
		expect(parsers.js).toBeDefined()
		expect(parsers.py).toBeDefined()
		expect(parsers.rs).toBeDefined()
		expect(parsers.go).toBeDefined()
	})
	it("should handle C/C++ files correctly", async () => {
		const files = ["test.c", "test.h", "test.cpp", "test.hpp"]
		const parsers = await (0, languageParser_1.loadRequiredLanguageParsers)(files, WASM_DIR)
		expect(parsers.c).toBeDefined()
		expect(parsers.h).toBeDefined()
		expect(parsers.cpp).toBeDefined()
		expect(parsers.hpp).toBeDefined()
	})
	it("should handle Kotlin files correctly", async () => {
		const files = ["test.kt", "test.kts"]
		const parsers = await (0, languageParser_1.loadRequiredLanguageParsers)(files, WASM_DIR)
		expect(parsers.kt).toBeDefined()
		expect(parsers.kts).toBeDefined()
		expect(parsers.kt.query).toBeDefined()
		expect(parsers.kts.query).toBeDefined()
	})
	it("should throw error for unsupported file extensions", async () => {
		const files = ["test.unsupported"]
		await expect((0, languageParser_1.loadRequiredLanguageParsers)(files, WASM_DIR)).rejects.toThrow(
			"Unsupported language: unsupported",
		)
	})
})
