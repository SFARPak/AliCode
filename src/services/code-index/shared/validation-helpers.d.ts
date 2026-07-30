/**
 * Sanitizes error messages by removing sensitive information like file paths and URLs
 * @param errorMessage The error message to sanitize
 * @returns The sanitized error message
 */
export declare function sanitizeErrorMessage(errorMessage: string): string
/**
 * HTTP error interface for embedder errors
 */
export interface HttpError extends Error {
	status?: number
	response?: {
		status?: number
	}
}
/**
 * Common error types that can occur during embedder validation
 */
export interface ValidationError {
	status?: number
	message?: string
	name?: string
	code?: string
}
/**
 * Maps HTTP status codes to appropriate error messages
 */
export declare function getErrorMessageForStatus(status: number | undefined, embedderType: string): string | undefined
/**
 * Extracts status code from various error formats
 */
export declare function extractStatusCode(error: any): number | undefined
/**
 * Extracts error message from various error formats
 */
export declare function extractErrorMessage(error: any): string
/**
 * Standard validation error handler for embedder configuration validation
 * Returns a consistent error response based on the error type
 */
export declare function handleValidationError(
	error: any,
	embedderType: string,
	customHandlers?: {
		beforeStandardHandling?: (error: any) =>
			| {
					valid: boolean
					error: string
			  }
			| undefined
	},
): {
	valid: boolean
	error: string
}
/**
 * Wraps an async validation function with standard error handling
 */
export declare function withValidationErrorHandling<
	T extends {
		valid: boolean
		error?: string
	},
>(
	validationFn: () => Promise<T>,
	embedderType: string,
	customHandlers?: Parameters<typeof handleValidationError>[2],
): Promise<{
	valid: boolean
	error?: string
}>
/**
 * Formats an embedding error message based on the error type and context
 */
export declare function formatEmbeddingError(error: any, maxRetries: number): Error
//# sourceMappingURL=validation-helpers.d.ts.map
