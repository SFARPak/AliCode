"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.checkContextWindowExceededError = checkContextWindowExceededError
const openai_1 = require("openai")
function checkContextWindowExceededError(error) {
	return (
		checkIsOpenAIContextWindowError(error) ||
		checkIsOpenRouterContextWindowError(error) ||
		checkIsAnthropicContextWindowError(error)
	)
}
function checkIsOpenRouterContextWindowError(error) {
	try {
		if (!error || typeof error !== "object") {
			return false
		}
		// Use Record<string, any> for proper type narrowing
		const err = error
		const status = err.status ?? err.code ?? err.error?.status ?? err.response?.status
		const message = String(err.message || err.error?.message || "")
		// Known OpenAI/OpenRouter-style signal (code 400 and message includes "context length")
		const CONTEXT_ERROR_PATTERNS = [
			/\bcontext\s*(?:length|window)\b/i,
			/\bmaximum\s*context\b/i,
			/\b(?:input\s*)?tokens?\s*exceed/i,
			/\btoo\s*many\s*tokens?\b/i,
		]
		return String(status) === "400" && CONTEXT_ERROR_PATTERNS.some((pattern) => pattern.test(message))
	} catch {
		return false
	}
}
// Docs: https://platform.openai.com/docs/guides/error-codes/api-errors
function checkIsOpenAIContextWindowError(error) {
	try {
		// Check for LengthFinishReasonError
		if (error && typeof error === "object" && "name" in error && error.name === "LengthFinishReasonError") {
			return true
		}
		const KNOWN_CONTEXT_ERROR_SUBSTRINGS = ["token", "context length"]
		return (
			Boolean(error) &&
			error instanceof openai_1.APIError &&
			error.code?.toString() === "400" &&
			KNOWN_CONTEXT_ERROR_SUBSTRINGS.some((substring) => error.message.includes(substring))
		)
	} catch {
		return false
	}
}
function checkIsAnthropicContextWindowError(response) {
	try {
		// Type guard to safely access properties
		if (!response || typeof response !== "object") {
			return false
		}
		// Use type assertions with proper checks
		const res = response
		// Check for Anthropic-specific error structure with more specific validation
		if (res.error?.error?.type === "invalid_request_error") {
			const message = String(res.error?.error?.message || "")
			// More specific patterns for context window errors
			const contextWindowPatterns = [
				/prompt is too long/i,
				/maximum.*tokens/i,
				/context.*too.*long/i,
				/exceeds.*context/i,
				/token.*limit/i,
				/context_length_exceeded/i,
				/max_tokens_to_sample/i,
			]
			// Additional check for Anthropic-specific error codes
			const errorCode = res.error?.error?.code
			if (errorCode === "context_length_exceeded" || errorCode === "invalid_request_error") {
				return contextWindowPatterns.some((pattern) => pattern.test(message))
			}
			return contextWindowPatterns.some((pattern) => pattern.test(message))
		}
		return false
	} catch {
		return false
	}
}
