"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
exports.OPENAI_CALL_ID_MAX_LENGTH = void 0
exports.sanitizeToolUseId = sanitizeToolUseId
exports.truncateOpenAiCallId = truncateOpenAiCallId
exports.sanitizeOpenAiCallId = sanitizeOpenAiCallId
const crypto = __importStar(require("crypto"))
/**
 * OpenAI Responses API maximum length for call_id field.
 * This limit applies to both function_call and function_call_output items.
 */
exports.OPENAI_CALL_ID_MAX_LENGTH = 64
/**
 * Sanitize a tool_use ID to match API validation pattern: ^[a-zA-Z0-9_-]+$
 * Replaces any invalid character with underscore.
 */
function sanitizeToolUseId(id) {
	return id.replace(/[^a-zA-Z0-9_-]/g, "_")
}
/**
 * Truncate a call_id to fit within OpenAI's 64-character limit.
 * Uses a hash suffix to maintain uniqueness when truncation is needed.
 *
 * @param id - The original call_id
 * @param maxLength - Maximum length (defaults to OpenAI's 64-char limit)
 * @returns The truncated ID, or original if already within limits
 */
function truncateOpenAiCallId(id, maxLength = exports.OPENAI_CALL_ID_MAX_LENGTH) {
	if (id.length <= maxLength) {
		return id
	}
	// Use 8-char hash suffix for uniqueness (from MD5, sufficient for collision resistance in this context)
	const hashSuffixLength = 8
	const separator = "_"
	// Reserve space for separator + hash
	const prefixMaxLength = maxLength - separator.length - hashSuffixLength
	// Create hash of the full original ID for uniqueness
	const hash = crypto.createHash("md5").update(id).digest("hex").slice(0, hashSuffixLength)
	// Take the prefix and append hash
	const prefix = id.slice(0, prefixMaxLength)
	return `${prefix}${separator}${hash}`
}
/**
 * Sanitize and truncate a tool call ID for OpenAI's Responses API.
 * This combines character sanitization with length truncation.
 *
 * @param id - The original call_id
 * @param maxLength - Maximum length (defaults to OpenAI's 64-char limit)
 * @returns The sanitized and truncated ID
 */
function sanitizeOpenAiCallId(id, maxLength = exports.OPENAI_CALL_ID_MAX_LENGTH) {
	// First sanitize characters, then truncate
	const sanitized = sanitizeToolUseId(id)
	return truncateOpenAiCallId(sanitized, maxLength)
}
