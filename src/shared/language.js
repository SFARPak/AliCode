"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.LANGUAGES = void 0
exports.formatLanguage = formatLanguage
const types_1 = require("@ali-code/types")
/**
 * Language name mapping from ISO codes to full language names.
 */
exports.LANGUAGES = {
	ca: "Català",
	de: "Deutsch",
	en: "English",
	es: "Español",
	fr: "Français",
	hi: "हिन्दी",
	id: "Bahasa Indonesia",
	it: "Italiano",
	ja: "日本語",
	ko: "한국어",
	nl: "Nederlands",
	pl: "Polski",
	"pt-BR": "Português",
	ru: "Русский",
	tr: "Türkçe",
	vi: "Tiếng Việt",
	"zh-CN": "简体中文",
	"zh-TW": "繁體中文",
}
/**
 * Formats a VSCode locale string to ensure the region code is uppercase.
 * For example, transforms "en-us" to "en-US" or "fr-ca" to "fr-CA".
 *
 * @param vscodeLocale - The VSCode locale string to format (e.g., "en-us", "fr-ca")
 * @returns The formatted locale string with uppercase region code
 */
function formatLanguage(vscodeLocale) {
	if (!vscodeLocale) {
		return "en"
	}
	const formattedLocale = vscodeLocale.replace(/-(\w+)$/, (_, region) => `-${region.toUpperCase()}`)
	return (0, types_1.isLanguage)(formattedLocale) ? formattedLocale : "en"
}
