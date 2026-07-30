"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const openai_1 = require("openai")
const context_error_handling_1 = require("../context-error-handling")
describe("checkContextWindowExceededError", () => {
	describe("OpenAI errors", () => {
		it("should detect OpenAI context window error with APIError instance", () => {
			const error = Object.create(openai_1.APIError.prototype)
			Object.assign(error, {
				status: 400,
				code: "400",
				message: "This model's maximum context length is 4096 tokens",
				error: {
					message: "This model's maximum context length is 4096 tokens",
					type: "invalid_request_error",
					param: null,
					code: "context_length_exceeded",
				},
			})
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
		})
		it("should detect OpenAI LengthFinishReasonError", () => {
			const error = {
				name: "LengthFinishReasonError",
				message: "The response was cut off due to length",
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
		})
		it("should not detect non-context OpenAI errors", () => {
			const error = Object.create(openai_1.APIError.prototype)
			Object.assign(error, {
				status: 400,
				code: "400",
				message: "Invalid API key",
				error: {
					message: "Invalid API key",
					type: "invalid_request_error",
					param: null,
					code: "invalid_api_key",
				},
			})
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(false)
		})
	})
	describe("OpenRouter errors", () => {
		it("should detect OpenRouter context window error with status 400", () => {
			const error = {
				status: 400,
				message: "Request exceeds maximum context length of 8192 tokens",
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
		})
		it("should detect OpenRouter error with nested error structure", () => {
			const error = {
				error: {
					status: 400,
					message: "Input tokens exceed model limit",
				},
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
		})
		it("should detect OpenRouter error with response status", () => {
			const error = {
				response: {
					status: 400,
				},
				message: "Too many tokens in the request",
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
		})
		it("should detect various context error patterns", () => {
			const patterns = [
				"context length exceeded",
				"maximum context window",
				"input tokens exceed limit",
				"too many tokens",
			]
			patterns.forEach((pattern) => {
				const error = {
					status: 400,
					message: pattern,
				}
				expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
			})
		})
		it("should not detect non-context 400 errors", () => {
			const error = {
				status: 400,
				message: "Invalid request format",
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(false)
		})
		it("should not detect errors with different status codes", () => {
			const error = {
				status: 500,
				message: "context length exceeded",
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(false)
		})
	})
	describe("Anthropic errors", () => {
		it("should detect Anthropic context window error", () => {
			const error = {
				error: {
					error: {
						type: "invalid_request_error",
						message: "prompt is too long: 150000 tokens > 100000 maximum",
					},
				},
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
		})
		it("should detect Anthropic error with context_length_exceeded code", () => {
			const error = {
				error: {
					error: {
						type: "invalid_request_error",
						code: "context_length_exceeded",
						message: "The request exceeds the maximum context window",
					},
				},
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
		})
		it("should detect various Anthropic context error patterns", () => {
			const patterns = [
				"prompt is too long",
				"maximum 200000 tokens",
				"context is too long",
				"exceeds the context window",
				"token limit exceeded",
			]
			patterns.forEach((pattern) => {
				const error = {
					error: {
						error: {
							type: "invalid_request_error",
							message: pattern,
						},
					},
				}
				expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
			})
		})
		it("should not detect non-context Anthropic errors", () => {
			const error = {
				error: {
					error: {
						type: "invalid_request_error",
						message: "Invalid model specified",
					},
				},
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(false)
		})
		it("should not detect errors with different error types", () => {
			const error = {
				error: {
					error: {
						type: "authentication_error",
						message: "prompt is too long",
					},
				},
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(false)
		})
	})
	describe("Edge cases", () => {
		it("should handle null input", () => {
			expect((0, context_error_handling_1.checkContextWindowExceededError)(null)).toBe(false)
		})
		it("should handle undefined input", () => {
			expect((0, context_error_handling_1.checkContextWindowExceededError)(undefined)).toBe(false)
		})
		it("should handle empty object", () => {
			expect((0, context_error_handling_1.checkContextWindowExceededError)({})).toBe(false)
		})
		it("should handle string input", () => {
			expect((0, context_error_handling_1.checkContextWindowExceededError)("error")).toBe(false)
		})
		it("should handle number input", () => {
			expect((0, context_error_handling_1.checkContextWindowExceededError)(123)).toBe(false)
		})
		it("should handle array input", () => {
			expect((0, context_error_handling_1.checkContextWindowExceededError)([])).toBe(false)
		})
		it("should handle errors with circular references", () => {
			const error = { status: 400, message: "context length exceeded" }
			error.self = error // Create circular reference
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
		})
		it("should handle errors with deeply nested undefined values", () => {
			const error = {
				error: {
					error: {
						type: undefined,
						message: undefined,
					},
				},
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(false)
		})
		it("should handle errors that throw during property access", () => {
			const error = {
				get status() {
					throw new Error("Property access error")
				},
				message: "context length exceeded",
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(false)
		})
		it("should handle mixed provider error structures", () => {
			// Error that could match multiple providers
			const error = {
				status: 400,
				code: "400",
				message: "context length exceeded",
				error: {
					error: {
						type: "invalid_request_error",
						message: "prompt is too long",
					},
				},
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error)).toBe(true)
		})
	})
	describe("Multiple provider detection", () => {
		it("should detect error if any provider check returns true", () => {
			// This error should be detected by OpenRouter check
			const error1 = {
				status: 400,
				message: "context window exceeded",
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error1)).toBe(true)
			// This error should be detected by Anthropic check
			const error2 = {
				error: {
					error: {
						type: "invalid_request_error",
						message: "prompt is too long",
					},
				},
			}
			expect((0, context_error_handling_1.checkContextWindowExceededError)(error2)).toBe(true)
		})
	})
})
