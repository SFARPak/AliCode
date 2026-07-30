"use strict"
/**
 * General error handler for API provider errors
 * Transforms technical errors into user-friendly messages while preserving metadata
 *
 * This utility ensures consistent error handling across all API providers:
 * - Preserves HTTP status codes for UI-aware error display
 * - Maintains error details for retry logic (e.g., RetryInfo for 429 errors)
 * - Provides consistent error message formatting
 * - Enables debugging with complete error context
 */
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.handleProviderError = handleProviderError
exports.handleOpenAIError = handleOpenAIError
const setup_1 = __importDefault(require("../../../i18n/setup"))
/**
 * Handles API provider errors and transforms them into user-friendly messages
 * while preserving important metadata for retry logic and UI display.
 *
 * @param error - The error to handle
 * @param providerName - The name of the provider for context in error messages
 * @param options - Optional configuration for error handling
 * @returns A wrapped Error with preserved metadata (status, errorDetails, code)
 *
 * @example
 * // Basic usage
 * try {
 *   await apiClient.createMessage(...)
 * } catch (error) {
 *   throw handleProviderError(error, "OpenAI")
 * }
 *
 * @example
 * // With custom message prefix
 * catch (error) {
 *   throw handleProviderError(error, "Anthropic", { messagePrefix: "streaming" })
 * }
 */
function handleProviderError(error, providerName, options) {
	const messagePrefix = options?.messagePrefix || "completion"
	if (error instanceof Error) {
		const anyErr = error
		const msg = anyErr?.error?.metadata?.raw || error.message || ""
		// Log the original error details for debugging
		console.error(`[${providerName}] API error:`, {
			message: msg,
			name: error.name,
			stack: error.stack,
			status: anyErr.status,
		})
		let wrapped
		// Special case: Invalid character/ByteString conversion error in API key
		// This is specific to OpenAI-compatible SDKs
		if (msg.includes("Cannot convert argument to a ByteString")) {
			wrapped = new Error(setup_1.default.t("common:errors.api.invalidKeyInvalidChars"))
		} else {
			// Apply custom transformer if provided, otherwise use default format
			const finalMessage = options?.messageTransformer
				? options.messageTransformer(msg)
				: `${providerName} ${messagePrefix} error: ${msg}`
			wrapped = new Error(finalMessage)
		}
		// Preserve HTTP status and structured details for retry/backoff + UI
		// These fields are used by Task.backoffAndAnnounce() and ChatRow/ErrorRow
		// to provide status-aware error messages and handling
		if (anyErr.status !== undefined) {
			wrapped.status = anyErr.status
		}
		if (anyErr.errorDetails !== undefined) {
			wrapped.errorDetails = anyErr.errorDetails
		}
		if (anyErr.code !== undefined) {
			wrapped.code = anyErr.code
		}
		// Preserve AWS-specific metadata if present (for Bedrock)
		if (anyErr.$metadata !== undefined) {
			wrapped.$metadata = anyErr.$metadata
		}
		return wrapped
	}
	// Non-Error: wrap with provider-specific prefix
	console.error(`[${providerName}] Non-Error exception:`, error)
	const wrapped = new Error(`${providerName} ${messagePrefix} error: ${String(error)}`)
	// Also try to preserve status for non-Error exceptions (e.g., plain objects with status)
	const anyErr = error
	if (typeof anyErr?.status === "number") {
		wrapped.status = anyErr.status
	}
	return wrapped
}
/**
 * Specialized handler for OpenAI-compatible providers
 * Re-exports with OpenAI-specific defaults for backward compatibility
 */
function handleOpenAIError(error, providerName) {
	return handleProviderError(error, providerName, { messagePrefix: "completion" })
}
