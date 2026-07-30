"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const openai_error_handler_1 = require("../openai-error-handler")
describe("handleOpenAIError", () => {
	const providerName = "TestProvider"
	describe("HTTP status preservation", () => {
		it("should preserve status code from Error with status field", () => {
			const error = new Error("API request failed")
			error.status = 401
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.message).toContain("TestProvider completion error")
			expect(result.status).toBe(401)
		})
		it("should preserve status code from Error with nested error structure", () => {
			const error = new Error("Wrapped error")
			error.status = 429
			error.errorDetails = [{ "@type": "type.googleapis.com/google.rpc.RetryInfo" }]
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result.status).toBe(429)
			expect(result.errorDetails).toBeDefined()
		})
		it("should preserve status from non-Error exception", () => {
			const error = {
				status: 500,
				message: "Internal server error",
			}
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.status).toBe(500)
		})
		it("should not add status field if original error lacks it", () => {
			const error = new Error("Generic error")
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.status).toBeUndefined()
		})
	})
	describe("errorDetails preservation", () => {
		it("should preserve errorDetails array from original error", () => {
			const error = new Error("Rate limited")
			error.status = 429
			error.errorDetails = [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "5s" }]
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result.errorDetails).toEqual(error.errorDetails)
		})
		it("should preserve code field from original error", () => {
			const error = new Error("Bad request")
			error.code = "invalid_request"
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result.code).toBe("invalid_request")
		})
	})
	describe("ByteString conversion errors", () => {
		it("should return localized message for ByteString conversion errors", () => {
			const error = new Error("Cannot convert argument to a ByteString")
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result.message).not.toContain("TestProvider completion error")
			// The actual translated message depends on i18n setup
			expect(result.message).toBeTruthy()
		})
		it("should preserve status even for ByteString errors", () => {
			const error = new Error("Cannot convert argument to a ByteString")
			error.status = 400
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			// Even though ByteString errors are typically client-side,
			// we preserve any status metadata that exists for debugging purposes
			expect(result.status).toBe(400)
		})
	})
	describe("error message formatting", () => {
		it("should wrap error message with provider name prefix", () => {
			const error = new Error("Authentication failed")
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result.message).toBe("TestProvider completion error: Authentication failed")
		})
		it("should handle error with nested metadata", () => {
			const error = new Error("Network error")
			error.error = {
				metadata: {
					raw: "Connection refused",
				},
			}
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result.message).toContain("Connection refused")
			expect(result.message).toContain("TestProvider completion error")
		})
		it("should handle non-Error exceptions", () => {
			const error = { message: "Something went wrong" }
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.message).toContain("TestProvider completion error")
			expect(result.message).toContain("[object Object]")
		})
		it("should handle string exceptions", () => {
			const error = "Connection timeout"
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.message).toBe("TestProvider completion error: Connection timeout")
		})
	})
	describe("real-world error scenarios", () => {
		it("should handle 401 Unauthorized with status and message", () => {
			const error = new Error("Unauthorized")
			error.status = 401
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result.message).toContain("Unauthorized")
			expect(result.status).toBe(401)
		})
		it("should handle 429 Rate Limit with RetryInfo", () => {
			const error = new Error("Rate limit exceeded")
			error.status = 429
			error.errorDetails = [
				{
					"@type": "type.googleapis.com/google.rpc.RetryInfo",
					retryDelay: "10s",
				},
			]
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result.status).toBe(429)
			expect(result.errorDetails).toBeDefined()
			expect(result.errorDetails[0].retryDelay).toBe("10s")
		})
		it("should handle 500 Internal Server Error", () => {
			const error = new Error("Internal server error")
			error.status = 500
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result.status).toBe(500)
			expect(result.message).toContain("Internal server error")
		})
		it("should handle errors without status gracefully", () => {
			const error = new Error("Network connectivity issue")
			const result = (0, openai_error_handler_1.handleOpenAIError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.status).toBeUndefined()
			expect(result.message).toContain("Network connectivity issue")
		})
	})
})
