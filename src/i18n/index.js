"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.initializeI18n = initializeI18n
exports.getCurrentLanguage = getCurrentLanguage
exports.changeLanguage = changeLanguage
exports.t = t
const setup_1 = __importDefault(require("./setup"))
/**
 * Initialize i18next with the specified language
 *
 * @param language The language code to use
 */
function initializeI18n(language) {
	setup_1.default.changeLanguage(language)
}
/**
 * Get the current language
 *
 * @returns The current language code
 */
function getCurrentLanguage() {
	return setup_1.default.language
}
/**
 * Change the current language
 *
 * @param language The language code to change to
 */
function changeLanguage(language) {
	setup_1.default.changeLanguage(language)
}
/**
 * Translate a string using i18next
 *
 * @param key The translation key, can use namespace with colon, e.g. "common:welcome"
 * @param options Options for interpolation or pluralization
 * @returns The translated string
 */
function t(key, options) {
	return setup_1.default.t(key, options)
}
exports.default = setup_1.default
