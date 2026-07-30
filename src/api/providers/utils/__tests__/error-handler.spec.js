"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const error_handler_1 = require("../error-handler")
describe("handleProviderError", () => {
	const providerName = "TestProvider"
	describe("HTTP status preservation", () => {
		it("should preserve status code from Error with status field", () => {
			const error = new Error("API request failed")
			error.status = 401
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.message).toContain("TestProvider completion error")
			expect(result.status).toBe(401)
		})
		it("should preserve status code from Error with nested error structure", () => {
			const error = new Error("Wrapped error")
			error.status = 429
			error.errorDetails = [{ "@type": "type.googleapis.com/google.rpc.RetryInfo" }]
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.status).toBe(429)
			expect(result.errorDetails).toBeDefined()
		})
		it("should preserve status from non-Error exception", () => {
			const error = {
				status: 500,
				message: "Internal server error",
			}
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.status).toBe(500)
		})
		it("should not add status field if original error lacks it", () => {
			const error = new Error("Generic error")
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.status).toBeUndefined()
		})
	})
	describe("errorDetails preservation", () => {
		it("should preserve errorDetails array from original error", () => {
			const error = new Error("Rate limited")
			error.status = 429
			error.errorDetails = [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "5s" }]
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.errorDetails).toEqual(error.errorDetails)
		})
		it("should preserve code field from original error", () => {
			const error = new Error("Bad request")
			error.code = "invalid_request"
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.code).toBe("invalid_request")
		})
		it("should preserve AWS $metadata from original error", () => {
			const error = new Error("AWS error")
			error.$metadata = { httpStatusCode: 403, requestId: "test-123" }
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.$metadata).toEqual(error.$metadata)
		})
	})
	describe("custom message prefix", () => {
		it("should use custom message prefix when provided", () => {
			const error = new Error("Stream failed")
			const result = (0, error_handler_1.handleProviderError)(error, providerName, { messagePrefix: "streaming" })
			expect(result.message).toBe("TestProvider streaming error: Stream failed")
		})
		it("should default to 'completion' prefix when not provided", () => {
			const error = new Error("Request failed")
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.message).toBe("TestProvider completion error: Request failed")
		})
	})
	describe("custom message transformer", () => {
		it("should use custom message transformer when provided", () => {
			const error = new Error("API error")
			const result = (0, error_handler_1.handleProviderError)(error, providerName, {
				messageTransformer: (msg) => `Custom format: ${msg}`,
			})
			expect(result.message).toBe("Custom format: API error")
		})
		it("should preserve status even with custom transformer", () => {
			const error = new Error("Rate limited")
			error.status = 429
			const result = (0, error_handler_1.handleProviderError)(error, providerName, {
				messageTransformer: (msg) => `Transformed: ${msg}`,
			})
			expect(result.message).toBe("Transformed: Rate limited")
			expect(result.status).toBe(429)
		})
	})
	describe("ByteString conversion errors", () => {
		it("should return localized message for ByteString conversion errors", () => {
			const error = new Error("Cannot convert argument to a ByteString")
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.message).not.toContain("TestProvider completion error")
			// The actual translated message depends on i18n setup
			expect(result.message).toBeTruthy()
		})
		it("should preserve status even for ByteString errors", () => {
			const error = new Error("Cannot convert argument to a ByteString")
			error.status = 400
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			// Even though ByteString errors are typically client-side,
			// we preserve any status metadata that exists for debugging purposes
			expect(result.status).toBe(400)
		})
	})
	describe("error message formatting", () => {
		it("should wrap error message with provider name prefix", () => {
			const error = new Error("Authentication failed")
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.message).toBe("TestProvider completion error: Authentication failed")
		})
		it("should handle error with nested metadata", () => {
			const error = new Error("Network error")
			error.error = {
				metadata: {
					raw: "Connection refused",
				},
			}
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.message).toContain("Connection refused")
			expect(result.message).toContain("TestProvider completion error")
		})
		it("should handle non-Error exceptions", () => {
			const error = { message: "Something went wrong" }
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.message).toContain("TestProvider completion error")
			expect(result.message).toContain("[object Object]")
		})
		it("should handle string exceptions", () => {
			const error = "Connection timeout"
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.message).toBe("TestProvider completion error: Connection timeout")
		})
	})
	describe("real-world error scenarios", () => {
		it("should handle 401 Unauthorized with status and message", () => {
			const error = new Error("Unauthorized")
			error.status = 401
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
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
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.status).toBe(429)
			expect(result.errorDetails).toBeDefined()
			expect(result.errorDetails[0].retryDelay).toBe("10s")
		})
		it("should handle 500 Internal Server Error", () => {
			const error = new Error("Internal server error")
			error.status = 500
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result.status).toBe(500)
			expect(result.message).toContain("Internal server error")
		})
		it("should handle errors without status gracefully", () => {
			const error = new Error("Network connectivity issue")
			const result = (0, error_handler_1.handleProviderError)(error, providerName)
			expect(result).toBeInstanceOf(Error)
			expect(result.status).toBeUndefined()
			expect(result.message).toContain("Network connectivity issue")
		})
		it("should handle Gemini-specific errors with custom transformer", () => {
			const error = new Error("Model not found")
			error.status = 404
			const result = (0, error_handler_1.handleProviderError)(error, "Gemini", {
				messageTransformer: (msg) => `Gemini API Error: ${msg}`,
			})
			expect(result.message).toBe("Gemini API Error: Model not found")
			expect(result.status).toBe(404)
		})
		it("should handle Anthropic SDK errors", () => {
			const error = new Error("Invalid API key")
			error.status = 401
			error.error = { type: "authentication_error" }
			const result = (0, error_handler_1.handleProviderError)(error, "Anthropic")
			expect(result.status).toBe(401)
			expect(result.message).toContain("Invalid API key")
		})
	})
})
describe("handleOpenAIError (backward compatibility)", () => {
	it("should be an alias for handleProviderError with completion prefix", () => {
		const error = new Error("API failed")
		error.status = 500
		const result = (0, error_handler_1.handleOpenAIError)(error, "OpenAI")
		expect(result).toBeInstanceOf(Error)
		expect(result.message).toContain("OpenAI completion error")
		expect(result.status).toBe(500)
	})
	it("should preserve backward compatibility for existing callers", () => {
		const error = new Error("Authentication failed")
		error.status = 401
		const result = (0, error_handler_1.handleOpenAIError)(error, "OpenRouter")
		expect(result.message).toBe("OpenRouter completion error: Authentication failed")
		expect(result.status).toBe(401)
	})
})
