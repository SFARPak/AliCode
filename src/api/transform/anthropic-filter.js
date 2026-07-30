"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.VALID_ANTHROPIC_BLOCK_TYPES = void 0
exports.filterNonAnthropicBlocks = filterNonAnthropicBlocks
/**
 * Set of content block types that are valid for Anthropic API.
 * Only these types will be passed through to the API.
 * See: https://docs.anthropic.com/en/api/messages
 */
exports.VALID_ANTHROPIC_BLOCK_TYPES = new Set([
	"text",
	"image",
	"tool_use",
	"tool_result",
	"thinking",
	"redacted_thinking",
	"document",
])
/**
 * Filters out non-Anthropic content blocks from messages before sending to Anthropic/Vertex API.
 * Uses an allowlist approach - only blocks with types in VALID_ANTHROPIC_BLOCK_TYPES are kept.
 * This automatically filters out:
 * - Internal "reasoning" blocks (AliCode's internal representation)
 * - Gemini's "thoughtSignature" blocks (encrypted reasoning continuity tokens)
 * - Any other unknown block types
 */
function filterNonAnthropicBlocks(messages) {
	return messages
		.map((message) => {
			if (typeof message.content === "string") {
				return message
			}
			const filteredContent = message.content.filter((block) => {
				const blockType = block.type
				// Only keep block types that Anthropic recognizes
				return exports.VALID_ANTHROPIC_BLOCK_TYPES.has(blockType)
			})
			// If all content was filtered out, return undefined to filter the message later
			if (filteredContent.length === 0) {
				return undefined
			}
			return {
				...message,
				content: filteredContent,
			}
		})
		.filter((message) => message !== undefined)
}
