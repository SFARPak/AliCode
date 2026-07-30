"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const requesty_1 = require("../requesty")
describe("toRequestyServiceUrl", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Mock console.warn to avoid noise in test output
		vi.spyOn(console, "warn").mockImplementation(() => {})
	})
	describe("with default parameters", () => {
		it("should return default router URL when no baseUrl provided", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)()
			expect(result).toBe("https://router.requesty.ai/v1")
		})
		it("should return default router URL when baseUrl is undefined", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)(undefined)
			expect(result).toBe("https://router.requesty.ai/v1")
		})
		it("should return default router URL when baseUrl is empty string", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("")
			expect(result).toBe("https://router.requesty.ai/v1")
		})
	})
	describe("with custom baseUrl", () => {
		it("should use custom baseUrl for router service", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://custom.requesty.ai/v1")
			expect(result).toBe("https://custom.requesty.ai/v1")
		})
		it("should handle baseUrl with trailing slash", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://custom.requesty.ai/v1/")
			expect(result).toBe("https://custom.requesty.ai/v1/")
		})
		it("should handle baseUrl without path", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://custom.requesty.ai")
			expect(result).toBe("https://custom.requesty.ai/")
		})
		it("should handle localhost URLs", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("http://localhost:8080/v1")
			expect(result).toBe("http://localhost:8080/v1")
		})
		it("should handle URLs with ports", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://custom.requesty.ai:3000/v1")
			expect(result).toBe("https://custom.requesty.ai:3000/v1")
		})
	})
	describe("with different service types", () => {
		it("should return router URL for router service", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://router.requesty.ai/v1", "router")
			expect(result).toBe("https://router.requesty.ai/v1")
		})
		it("should replace router with app and remove v1 for app service", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://router.requesty.ai/v1", "app")
			expect(result).toBe("https://app.requesty.ai/")
		})
		it("should replace router with api and remove v1 for api service", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://router.requesty.ai/v1", "api")
			expect(result).toBe("https://api.requesty.ai/")
		})
		it("should handle custom baseUrl with app service", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://router.custom.ai/v1", "app")
			expect(result).toBe("https://app.custom.ai/")
		})
		it("should handle URLs where router appears multiple times", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://router.router-requesty.ai/v1", "app")
			// This will replace the first occurrence only
			expect(result).toBe("https://app.router-requesty.ai/")
		})
	})
	describe("error handling", () => {
		it("should fall back to default URL for invalid baseUrl", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("not-a-valid-url")
			expect(result).toBe("https://router.requesty.ai/v1")
			expect(console.warn).toHaveBeenCalledWith('Invalid base URL "not-a-valid-url", falling back to default')
		})
		it("should fall back to default URL for malformed URL", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("ht!tp://[invalid")
			expect(result).toBe("https://router.requesty.ai/v1")
			expect(console.warn).toHaveBeenCalled()
		})
		it("should fall back to default app URL for invalid baseUrl with app service", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("invalid-url", "app")
			expect(result).toBe("https://app.requesty.ai/")
			expect(console.warn).toHaveBeenCalled()
		})
		it("should handle null baseUrl gracefully", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)(null)
			expect(result).toBe("https://router.requesty.ai/v1")
		})
		it("should handle non-string baseUrl gracefully", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)(123)
			expect(result).toBe("https://router.requesty.ai/v1")
		})
	})
	describe("edge cases", () => {
		it("should handle protocol-relative URLs by falling back to default", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("//custom.requesty.ai/v1")
			// Protocol-relative URLs are not valid for URL constructor, will fall back
			expect(result).toBe("https://router.requesty.ai/v1")
			expect(console.warn).toHaveBeenCalled()
		})
		it("should preserve query parameters", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://custom.requesty.ai/v1?key=value")
			expect(result).toBe("https://custom.requesty.ai/v1?key=value")
		})
		it("should preserve URL fragments", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://custom.requesty.ai/v1#section")
			expect(result).toBe("https://custom.requesty.ai/v1#section")
		})
		it("should handle URLs with authentication", () => {
			const result = (0, requesty_1.toRequestyServiceUrl)("https://user:pass@custom.requesty.ai/v1")
			expect(result).toBe("https://user:pass@custom.requesty.ai/v1")
		})
	})
})
