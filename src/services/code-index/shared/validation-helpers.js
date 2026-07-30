"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.sanitizeErrorMessage = sanitizeErrorMessage
exports.getErrorMessageForStatus = getErrorMessageForStatus
exports.extractStatusCode = extractStatusCode
exports.extractErrorMessage = extractErrorMessage
exports.handleValidationError = handleValidationError
exports.withValidationErrorHandling = withValidationErrorHandling
exports.formatEmbeddingError = formatEmbeddingError
const i18n_1 = require("../../../i18n")
const serialize_error_1 = require("serialize-error")
/**
 * Sanitizes error messages by removing sensitive information like file paths and URLs
 * @param errorMessage The error message to sanitize
 * @returns The sanitized error message
 */
function sanitizeErrorMessage(errorMessage) {
	if (!errorMessage || typeof errorMessage !== "string") {
		return String(errorMessage)
	}
	let sanitized = errorMessage
	// Replace URLs first (http, https, ftp, file protocols)
	// This needs to be done before file paths to avoid partial replacements
	sanitized = sanitized.replace(
		/(?:https?|ftp|file):\/\/(?:localhost|[\w\-\.]+)(?::\d+)?(?:\/[\w\-\.\/\?\&\=\#]*)?/gi,
		"[REDACTED_URL]",
	)
	// Replace email addresses
	sanitized = sanitized.replace(/[\w\-\.]+@[\w\-\.]+\.\w+/g, "[REDACTED_EMAIL]")
	// Replace IP addresses (IPv4)
	sanitized = sanitized.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[REDACTED_IP]")
	// Replace file paths in quotes (handles paths with spaces)
	sanitized = sanitized.replace(/"[^"]*(?:\/|\\)[^"]*"/g, '"[REDACTED_PATH]"')
	// Replace file paths (Unix and Windows style)
	// Matches paths like /Users/username/path, C:\Users\path, ./relative/path, ../relative/path
	sanitized = sanitized.replace(
		/(?:\/[\w\-\.]+)+(?:\/[\w\-\.\s]*)*|(?:[A-Za-z]:\\[\w\-\.\\]+)|(?:\.{1,2}\/[\w\-\.\/]+)/g,
		"[REDACTED_PATH]",
	)
	// Replace port numbers that appear after colons (e.g., :11434, :8080)
	// Do this after URLs to avoid double replacement
	sanitized = sanitized.replace(/(?<!REDACTED_URL\]):(\d{2,5})\b/g, ":[REDACTED_PORT]")
	return sanitized
}
/**
 * Maps HTTP status codes to appropriate error messages
 */
function getErrorMessageForStatus(status, embedderType) {
	switch (status) {
		case 401:
		case 403:
			return (0, i18n_1.t)("embeddings:validation.authenticationFailed")
		case 404:
			return embedderType === "openai"
				? (0, i18n_1.t)("embeddings:validation.modelNotAvailable")
				: (0, i18n_1.t)("embeddings:validation.invalidEndpoint")
		case 429:
			return (0, i18n_1.t)("embeddings:validation.serviceUnavailable")
		default:
			if (status && status >= 400 && status < 600) {
				return (0, i18n_1.t)("embeddings:validation.configurationError")
			}
			return undefined
	}
}
/**
 * Extracts status code from various error formats
 */
function extractStatusCode(error) {
	// Direct status property
	if (error?.status) return error.status
	// Response status property
	if (error?.response?.status) return error.response.status
	// Extract from error message (e.g., "HTTP 404: Not Found")
	if (error?.message) {
		const match = error.message.match(/HTTP (\d+):/)
		if (match) {
			return parseInt(match[1], 10)
		}
	}
	// Use serialize-error as fallback for complex objects
	const serialized = (0, serialize_error_1.serializeError)(error)
	if (serialized?.status) return serialized.status
	if (serialized?.response?.status) return serialized.response.status
	return undefined
}
/**
 * Extracts error message from various error formats
 */
function extractErrorMessage(error) {
	if (error?.message) {
		return error.message
	}
	if (typeof error === "string") {
		return error
	}
	if (error && typeof error === "object" && "toString" in error) {
		try {
			return String(error)
		} catch {
			return "Unknown error"
		}
	}
	// Use serialize-error as fallback for complex objects
	const serialized = (0, serialize_error_1.serializeError)(error)
	if (serialized?.message) {
		return serialized.message
	}
	return "Unknown error"
}
/**
 * Standard validation error handler for embedder configuration validation
 * Returns a consistent error response based on the error type
 */
function handleValidationError(error, embedderType, customHandlers) {
	// Serialize the error to ensure we have access to all properties
	const serializedError = (0, serialize_error_1.serializeError)(error)
	// Allow custom handling first (pass original error for backward compatibility)
	if (customHandlers?.beforeStandardHandling) {
		const customResult = customHandlers.beforeStandardHandling(error)
		if (customResult) return customResult
	}
	// Extract status code and error message from serialized error
	const statusCode = extractStatusCode(serializedError)
	const errorMessage = extractErrorMessage(serializedError)
	// Check for status-based errors first
	const statusError = getErrorMessageForStatus(statusCode, embedderType)
	if (statusError) {
		return { valid: false, error: statusError }
	}
	// Check for connection errors
	if (errorMessage) {
		if (
			errorMessage.includes("ENOTFOUND") ||
			errorMessage.includes("ECONNREFUSED") ||
			errorMessage.includes("ETIMEDOUT") ||
			errorMessage === "AbortError" ||
			errorMessage.includes("HTTP 0:") ||
			errorMessage === "No response"
		) {
			return { valid: false, error: (0, i18n_1.t)("embeddings:validation.connectionFailed") }
		}
		if (errorMessage.includes("Failed to parse response JSON")) {
			return { valid: false, error: (0, i18n_1.t)("embeddings:validation.invalidResponse") }
		}
	}
	// For generic errors, preserve the original error message if it's not a standard one
	if (errorMessage && errorMessage !== "Unknown error") {
		return { valid: false, error: errorMessage }
	}
	// Fallback to generic error
	return { valid: false, error: (0, i18n_1.t)("embeddings:validation.configurationError") }
}
/**
 * Wraps an async validation function with standard error handling
 */
async function withValidationErrorHandling(validationFn, embedderType, customHandlers) {
	try {
		return await validationFn()
	} catch (error) {
		return handleValidationError(error, embedderType, customHandlers)
	}
}
/**
 * Formats an embedding error message based on the error type and context
 */
function formatEmbeddingError(error, maxRetries) {
	const errorMessage = extractErrorMessage(error)
	const statusCode = extractStatusCode(error)
	if (statusCode === 401) {
		return new Error((0, i18n_1.t)("embeddings:authenticationFailed"))
	} else if (statusCode) {
		return new Error(
			(0, i18n_1.t)("embeddings:failedWithStatus", { attempts: maxRetries, statusCode, errorMessage }),
		)
	} else {
		return new Error((0, i18n_1.t)("embeddings:failedWithError", { attempts: maxRetries, errorMessage }))
	}
}
