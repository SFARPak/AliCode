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
export declare function handleProviderError(
	error: unknown,
	providerName: string,
	options?: {
		/** Custom message prefix (default: "completion") */
		messagePrefix?: string
		/** Custom message transformer */
		messageTransformer?: (msg: string) => string
	},
): Error
/**
 * Specialized handler for OpenAI-compatible providers
 * Re-exports with OpenAI-specific defaults for backward compatibility
 */
export declare function handleOpenAIError(error: unknown, providerName: string): Error
//# sourceMappingURL=error-handler.d.ts.map
