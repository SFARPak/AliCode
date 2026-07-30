"use strict"
// npx vitest __tests__/dist_assets.spec.ts
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
const fs = __importStar(require("fs"))
const path = __importStar(require("path"))
describe("dist assets", () => {
	const distPath = path.join(__dirname, "../dist")
	describe("tiktoken", () => {
		it("should have tiktoken wasm file", () => {
			expect(fs.existsSync(path.join(distPath, "tiktoken_bg.wasm"))).toBe(true)
		})
	})
	describe("tree-sitter", () => {
		const treeSitterFiles = [
			"tree-sitter-bash.wasm",
			"tree-sitter-cpp.wasm",
			"tree-sitter-c_sharp.wasm",
			"tree-sitter-css.wasm",
			"tree-sitter-c.wasm",
			"tree-sitter-elisp.wasm",
			"tree-sitter-elixir.wasm",
			"tree-sitter-elm.wasm",
			"tree-sitter-embedded_template.wasm",
			"tree-sitter-go.wasm",
			"tree-sitter-html.wasm",
			"tree-sitter-javascript.wasm",
			"tree-sitter-java.wasm",
			"tree-sitter-json.wasm",
			"tree-sitter-kotlin.wasm",
			"tree-sitter-lua.wasm",
			"tree-sitter-objc.wasm",
			"tree-sitter-ocaml.wasm",
			"tree-sitter-php.wasm",
			"tree-sitter-python.wasm",
			"tree-sitter-ql.wasm",
			"tree-sitter-rescript.wasm",
			"tree-sitter-ruby.wasm",
			"tree-sitter-rust.wasm",
			"tree-sitter-scala.wasm",
			"tree-sitter-solidity.wasm",
			"tree-sitter-swift.wasm",
			"tree-sitter-systemrdl.wasm",
			"tree-sitter-tlaplus.wasm",
			"tree-sitter-toml.wasm",
			"tree-sitter-tsx.wasm",
			"tree-sitter-typescript.wasm",
			"tree-sitter-vue.wasm",
			"tree-sitter.wasm",
			"tree-sitter-yaml.wasm",
			"tree-sitter-zig.wasm",
		]
		test.each(treeSitterFiles)("should have %s file", (filename) => {
			expect(fs.existsSync(path.join(distPath, filename))).toBe(true)
		})
	})
})
