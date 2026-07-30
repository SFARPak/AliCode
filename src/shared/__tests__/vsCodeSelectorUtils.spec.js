"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vsCodeSelectorUtils_1 = require("../vsCodeSelectorUtils")
describe("vsCodeSelectorUtils", () => {
	describe("stringifyVsCodeLmModelSelector", () => {
		it("should join all defined selector properties with separator", () => {
			const selector = {
				vendor: "test-vendor",
				family: "test-family",
				version: "v1",
				id: "test-id",
			}
			const result = (0, vsCodeSelectorUtils_1.stringifyVsCodeLmModelSelector)(selector)
			expect(result).toBe("test-vendor/test-family/v1/test-id")
		})
		it("should skip undefined properties", () => {
			const selector = {
				vendor: "test-vendor",
				family: "test-family",
			}
			const result = (0, vsCodeSelectorUtils_1.stringifyVsCodeLmModelSelector)(selector)
			expect(result).toBe("test-vendor/test-family")
		})
		it("should handle empty selector", () => {
			const selector = {}
			const result = (0, vsCodeSelectorUtils_1.stringifyVsCodeLmModelSelector)(selector)
			expect(result).toBe("")
		})
		it("should handle selector with only one property", () => {
			const selector = {
				vendor: "test-vendor",
			}
			const result = (0, vsCodeSelectorUtils_1.stringifyVsCodeLmModelSelector)(selector)
			expect(result).toBe("test-vendor")
		})
	})
})
