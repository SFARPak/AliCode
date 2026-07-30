"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.maybeRemoveImageBlocks = maybeRemoveImageBlocks
/* Removes image blocks from messages if they are not supported by the Api Handler */
function maybeRemoveImageBlocks(messages, apiHandler) {
	// Check model capability ONCE instead of for every message
	const supportsImages = apiHandler.getModel().info.supportsImages
	return messages.map((message) => {
		// Handle array content (could contain image blocks).
		let { content } = message
		if (Array.isArray(content)) {
			if (!supportsImages) {
				// Convert image blocks to text descriptions.
				content = content.map((block) => {
					if (block.type === "image") {
						// Convert image blocks to text descriptions.
						// Note: We can't access the actual image content/url due to API limitations,
						// but we can indicate that an image was present in the conversation.
						return {
							type: "text",
							text: "[Referenced image in conversation]",
						}
					}
					return block
				})
			}
		}
		return { ...message, content }
	})
}
