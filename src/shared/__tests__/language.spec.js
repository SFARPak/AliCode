"use strict"
// npx vitest run src/shared/__tests__/language.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const language_1 = require("../language")
describe("formatLanguage", () => {
	it("should uppercase region code in locale string", () => {
		expect((0, language_1.formatLanguage)("pt-br")).toBe("pt-BR")
		expect((0, language_1.formatLanguage)("zh-cn")).toBe("zh-CN")
	})
	it("should return original string if no region code present", () => {
		expect((0, language_1.formatLanguage)("en")).toBe("en")
		expect((0, language_1.formatLanguage)("fr")).toBe("fr")
	})
	it("should handle empty or undefined input", () => {
		expect((0, language_1.formatLanguage)("")).toBe("en")
		expect((0, language_1.formatLanguage)(undefined)).toBe("en")
	})
})
