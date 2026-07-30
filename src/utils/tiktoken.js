"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.tiktoken = tiktoken
const lite_1 = require("tiktoken/lite")
const o200k_base_1 = __importDefault(require("tiktoken/encoders/o200k_base"))
const TOKEN_FUDGE_FACTOR = 1.5
let encoder = null
/**
 * Serializes a tool_use block to text for token counting.
 * Approximates how the API sees the tool call.
 */
function serializeToolUse(block) {
	const parts = [`Tool: ${block.name}`]
	if (block.input !== undefined) {
		try {
			parts.push(`Arguments: ${JSON.stringify(block.input)}`)
		} catch {
			parts.push(`Arguments: [serialization error]`)
		}
	}
	return parts.join("\n")
}
/**
 * Serializes a tool_result block to text for token counting.
 * Handles both string content and array content.
 */
function serializeToolResult(block) {
	const parts = [`Tool Result (${block.tool_use_id})`]
	if (block.is_error) {
		parts.push(`[Error]`)
	}
	const content = block.content
	if (typeof content === "string") {
		parts.push(content)
	} else if (Array.isArray(content)) {
		// Handle array of content blocks recursively
		for (const item of content) {
			if (item.type === "text") {
				parts.push(item.text || "")
			} else if (item.type === "image") {
				parts.push("[Image content]")
			} else {
				parts.push(`[Unsupported content block: ${String(item.type)}]`)
			}
		}
	}
	return parts.join("\n")
}
async function tiktoken(content) {
	if (content.length === 0) {
		return 0
	}
	let totalTokens = 0
	// Lazily create and cache the encoder if it doesn't exist.
	if (!encoder) {
		encoder = new lite_1.Tiktoken(
			o200k_base_1.default.bpe_ranks,
			o200k_base_1.default.special_tokens,
			o200k_base_1.default.pat_str,
		)
	}
	// Process each content block using the cached encoder.
	for (const block of content) {
		if (block.type === "text") {
			const text = block.text || ""
			if (text.length > 0) {
				const tokens = encoder.encode(text, undefined, [])
				totalTokens += tokens.length
			}
		} else if (block.type === "image") {
			// For images, calculate based on data size.
			const imageSource = block.source
			if (imageSource && typeof imageSource === "object" && "data" in imageSource) {
				const base64Data = imageSource.data
				totalTokens += Math.ceil(Math.sqrt(base64Data.length))
			} else {
				totalTokens += 300 // Conservative estimate for unknown images
			}
		} else if (block.type === "tool_use") {
			// Serialize tool_use block to text and count tokens
			const serialized = serializeToolUse(block)
			if (serialized.length > 0) {
				const tokens = encoder.encode(serialized, undefined, [])
				totalTokens += tokens.length
			}
		} else if (block.type === "tool_result") {
			// Serialize tool_result block to text and count tokens
			const serialized = serializeToolResult(block)
			if (serialized.length > 0) {
				const tokens = encoder.encode(serialized, undefined, [])
				totalTokens += tokens.length
			}
		}
	}
	// Add a fudge factor to account for the fact that tiktoken is not always
	// accurate.
	return Math.ceil(totalTokens * TOKEN_FUDGE_FACTOR)
}
