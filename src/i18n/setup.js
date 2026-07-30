"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const i18next_1 = __importDefault(require("i18next"))
// Build translations object
const translations = {}
// Determine if running in test environment
const isTestEnv = process.env.NODE_ENV === "test"
// Load translations based on environment
if (!isTestEnv) {
	try {
		// Dynamic imports to avoid browser compatibility issues
		const fs = require("fs")
		const path = require("path")
		const localesDir = path.join(__dirname, "i18n", "locales")
		try {
			// Find all language directories
			const languageDirs = fs.readdirSync(localesDir, { withFileTypes: true })
			const languages = languageDirs
				.filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith("."))
				.map((dirent) => dirent.name)
			// Process each language
			languages.forEach((language) => {
				const langPath = path.join(localesDir, language)
				// Find all JSON files in the language directory
				const files = fs
					.readdirSync(langPath, { withFileTypes: true })
					.filter(
						(dirent) => dirent.isFile() && dirent.name.endsWith(".json") && !dirent.name.startsWith("."),
					)
					.map((dirent) => dirent.name)
				// Initialize language in translations object
				if (!translations[language]) {
					translations[language] = {}
				}
				// Process each namespace file
				files.forEach((file) => {
					const namespace = path.basename(file, ".json")
					const filePath = path.join(langPath, file)
					try {
						// Read and parse the JSON file
						const content = fs.readFileSync(filePath, "utf8")
						translations[language][namespace] = JSON.parse(content)
					} catch (error) {
						console.error(`Error loading translation file ${filePath}:`, error)
					}
				})
			})
			console.log(`Loaded translations for languages: ${Object.keys(translations).join(", ")}`)
		} catch (dirError) {
			console.error(`Error processing directory ${localesDir}:`, dirError)
		}
	} catch (error) {
		console.error("Error loading translations:", error)
	}
}
// Initialize i18next with configuration
i18next_1.default.init({
	lng: "en",
	fallbackLng: "en",
	debug: false,
	resources: translations,
	interpolation: {
		escapeValue: false,
	},
})
exports.default = i18next_1.default
