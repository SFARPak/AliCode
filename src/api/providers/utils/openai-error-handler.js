"use strict"
/**
 * General error handler for OpenAI client errors
 * Transforms technical errors into user-friendly messages
 *
 * @deprecated Use handleProviderError from './error-handler' instead
 * This file is kept for backward compatibility
 */
Object.defineProperty(exports, "__esModule", { value: true })
exports.handleOpenAIError = handleOpenAIError
const error_handler_1 = require("./error-handler")
/**
 * Handles OpenAI client errors and transforms them into user-friendly messages
 * @param error - The error to handle
 * @param providerName - The name of the provider for context in error messages
 * @returns The original error or a transformed user-friendly error
 */
function handleOpenAIError(error, providerName) {
	return (0, error_handler_1.handleProviderError)(error, providerName, { messagePrefix: "completion" })
}
