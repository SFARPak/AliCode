"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.toRequestyServiceUrl = exports.REQUESTY_BASE_URL = void 0
exports.REQUESTY_BASE_URL = "https://router.requesty.ai/v1"
/**
 * Replaces the service type in the URL (router -> app/api) and removes version suffix for non-router services
 * @param baseUrl The base URL to transform
 * @param type The service type to use
 * @returns The transformed URL
 */
const replaceCname = (baseUrl, type) => {
	if (type === "router") {
		return baseUrl
	}
	// Parse the URL to safely replace the subdomain
	try {
		const url = new URL(baseUrl)
		// Replace 'router' in the hostname with the service type
		if (url.hostname.includes("router")) {
			url.hostname = url.hostname.replace("router", type)
		}
		// Remove '/v1' from the pathname for non-router services
		if (url.pathname.endsWith("/v1")) {
			url.pathname = url.pathname.slice(0, -3)
		}
		return url.toString()
	} catch {
		// Fallback to simple string replacement if URL parsing fails
		return baseUrl.replace("router", type).replace("/v1", "")
	}
}
/**
 * Converts a base URL to a Requesty service URL with proper validation and fallback
 * @param baseUrl Optional custom base URL. Falls back to default if invalid or not provided
 * @param service The service type (router, app, or api). Defaults to 'router'
 * @returns A valid Requesty service URL
 */
const toRequestyServiceUrl = (baseUrl, service = "router") => {
	// Handle null, undefined, empty string, or non-string values
	const urlToUse =
		baseUrl && typeof baseUrl === "string" && baseUrl.trim() ? baseUrl.trim() : exports.REQUESTY_BASE_URL
	try {
		// Validate the URL first
		const validatedUrl = new URL(urlToUse).toString()
		// Apply service type transformation
		return replaceCname(validatedUrl, service)
	} catch (error) {
		// If the provided baseUrl is invalid, fall back to the default
		if (baseUrl && baseUrl !== exports.REQUESTY_BASE_URL) {
			console.warn(`Invalid base URL "${baseUrl}", falling back to default`)
		}
		return replaceCname(exports.REQUESTY_BASE_URL, service)
	}
}
exports.toRequestyServiceUrl = toRequestyServiceUrl
