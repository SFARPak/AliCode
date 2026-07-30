"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.isEmpty = isEmpty
/**
 * Check if an object is empty (has no own enumerable properties)
 * @param obj The object to check
 * @returns true if the object is empty, false otherwise
 */
function isEmpty(obj) {
	if (!obj || typeof obj !== "object") {
		return true
	}
	// Check if it's an array
	if (Array.isArray(obj)) {
		return obj.length === 0
	}
	// Check if it's an object with no own properties
	return Object.keys(obj).length === 0
}
