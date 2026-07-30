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
exports.getTheme = getTheme
exports.mergeJson = mergeJson
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
const fs = __importStar(require("fs/promises"))
const cjs_1 = require("monaco-vscode-textmate-theme-converter/lib/cjs")
const package_1 = require("../../shared/package")
const defaultThemes = {
	"Default Dark Modern": "dark_modern",
	"Dark+": "dark_plus",
	"Default Dark+": "dark_plus",
	"Dark (Visual Studio)": "dark_vs",
	"Visual Studio Dark": "dark_vs",
	"Dark High Contrast": "hc_black",
	"Default High Contrast": "hc_black",
	"Light High Contrast": "hc_light",
	"Default High Contrast Light": "hc_light",
	"Default Light Modern": "light_modern",
	"Light+": "light_plus",
	"Default Light+": "light_plus",
	"Light (Visual Studio)": "light_vs",
	"Visual Studio Light": "light_vs",
}
function parseThemeString(themeString) {
	themeString = themeString
		?.split("\n")
		.filter((line) => {
			return !line.trim().startsWith("//")
		})
		.join("\n")
	return JSON.parse(themeString ?? "{}")
}
async function getTheme() {
	let currentTheme = undefined
	const colorTheme = vscode.workspace.getConfiguration("workbench").get("colorTheme") || "Default Dark Modern"
	try {
		for (let i = vscode.extensions.all.length - 1; i >= 0; i--) {
			if (currentTheme) {
				break
			}
			const extension = vscode.extensions.all[i]
			if (extension.packageJSON?.contributes?.themes?.length > 0) {
				for (const theme of extension.packageJSON.contributes.themes) {
					if (theme.label === colorTheme) {
						const themePath = path.join(extension.extensionPath, theme.path)
						currentTheme = await fs.readFile(themePath, "utf-8")
						break
					}
				}
			}
		}
		if (currentTheme === undefined && defaultThemes[colorTheme]) {
			const filename = `${defaultThemes[colorTheme]}.json`
			currentTheme = await fs.readFile(
				path.join(getExtensionUri().fsPath, "integrations", "theme", "default-themes", filename),
				"utf-8",
			)
		}
		// Strip comments from theme
		let parsed = parseThemeString(currentTheme)
		if (parsed.include) {
			const includeThemeString = await fs.readFile(
				path.join(getExtensionUri().fsPath, "integrations", "theme", "default-themes", parsed.include),
				"utf-8",
			)
			const includeTheme = parseThemeString(includeThemeString)
			parsed = mergeJson(parsed, includeTheme)
		}
		const converted = (0, cjs_1.convertTheme)(parsed)
		converted.base = ["vs", "hc-black"].includes(converted.base)
			? converted.base
			: colorTheme.includes("Light")
				? "vs"
				: "vs-dark"
		return converted
	} catch (e) {
		console.log("Error loading color theme: ", e)
	}
	return undefined
}
function mergeJson(first, second, mergeBehavior, mergeKeys) {
	const copyOfFirst = JSON.parse(JSON.stringify(first))
	try {
		for (const key in second) {
			const secondValue = second[key]
			if (!(key in copyOfFirst) || mergeBehavior === "overwrite") {
				// New value
				copyOfFirst[key] = secondValue
				continue
			}
			const firstValue = copyOfFirst[key]
			if (Array.isArray(secondValue) && Array.isArray(firstValue)) {
				// Array
				if (mergeKeys?.[key]) {
					// Merge keys are used to determine whether an item form the second object should override one from the first
					const keptFromFirst = []
					firstValue.forEach((item) => {
						if (!secondValue.some((item2) => mergeKeys[key](item, item2))) {
							keptFromFirst.push(item)
						}
					})
					copyOfFirst[key] = [...keptFromFirst, ...secondValue]
				} else {
					copyOfFirst[key] = [...firstValue, ...secondValue]
				}
			} else if (typeof secondValue === "object" && typeof firstValue === "object") {
				// Object
				copyOfFirst[key] = mergeJson(firstValue, secondValue, mergeBehavior)
			} else {
				// Other (boolean, number, string)
				copyOfFirst[key] = secondValue
			}
		}
		return copyOfFirst
	} catch (e) {
		console.error("Error merging JSON", e, copyOfFirst, second)
		return {
			...copyOfFirst,
			...second,
		}
	}
}
function getExtensionUri() {
	return vscode.extensions.getExtension(`${package_1.Package.publisher}.${package_1.Package.name}`).extensionUri
}
