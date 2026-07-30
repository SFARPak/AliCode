"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.convertAnthropicContentToGemini = convertAnthropicContentToGemini
exports.convertAnthropicMessageToGemini = convertAnthropicMessageToGemini
function isThoughtSignatureContentBlock(block) {
	return block.type === "thoughtSignature"
}
function convertAnthropicContentToGemini(content, options) {
	const includeThoughtSignatures = options?.includeThoughtSignatures ?? true
	const toolIdToName = options?.toolIdToName
	// First pass: find thoughtSignature if it exists in the content blocks
	let activeThoughtSignature
	if (Array.isArray(content)) {
		const sigBlock = content.find((block) => isThoughtSignatureContentBlock(block))
		if (sigBlock?.thoughtSignature) {
			activeThoughtSignature = sigBlock.thoughtSignature
		}
	}
	// Determine the signature to attach to function calls.
	// If we're in a mode that expects signatures (includeThoughtSignatures is true):
	// 1. Use the actual signature if we found one in the history/content.
	// 2. Fallback to "skip_thought_signature_validator" if missing (e.g. cross-model history).
	let functionCallSignature
	if (includeThoughtSignatures) {
		functionCallSignature = activeThoughtSignature || "skip_thought_signature_validator"
	}
	if (typeof content === "string") {
		return [{ text: content }]
	}
	const parts = content.flatMap((block) => {
		// Handle thoughtSignature blocks first
		if (isThoughtSignatureContentBlock(block)) {
			// We process thought signatures globally and attach them to the relevant parts
			// or create a placeholder part if no other content exists.
			return []
		}
		switch (block.type) {
			case "text":
				return { text: block.text }
			case "image":
				if (block.source.type !== "base64") {
					throw new Error("Unsupported image source type")
				}
				return { inlineData: { data: block.source.data, mimeType: block.source.media_type } }
			case "tool_use":
				// Gemini 3 validation rules:
				// - In a parallel function calling response, only the FIRST functionCall part has a signature.
				// - In sequential steps, each step's first functionCall must include its signature.
				// When converting from our history, we don't always have enough information to perfectly
				// recreate the original per-part distribution, but we can and should avoid attaching the
				// signature to every parallel call in a single assistant message.
				return {
					functionCall: {
						name: block.name,
						args: block.input,
					},
					// Inject the thoughtSignature into the functionCall part if required.
					// This is necessary for Gemini 3+ thinking models to validate the tool call.
					...(functionCallSignature ? { thoughtSignature: functionCallSignature } : {}),
				}
			case "tool_result": {
				if (!block.content) {
					return []
				}
				// Get tool name from the map (built from tool_use blocks in message history).
				// The map must contain the tool name - if it doesn't, this indicates a bug
				// where the conversation history is incomplete or tool_use blocks are missing.
				const toolName = toolIdToName?.get(block.tool_use_id)
				if (!toolName) {
					throw new Error(
						`Unable to find tool name for tool_use_id "${block.tool_use_id}". ` +
							`This indicates the conversation history is missing the corresponding tool_use block. ` +
							`Available tool IDs: ${Array.from(toolIdToName?.keys() ?? []).join(", ") || "none"}`,
					)
				}
				if (typeof block.content === "string") {
					return {
						functionResponse: { name: toolName, response: { name: toolName, content: block.content } },
					}
				}
				if (!Array.isArray(block.content)) {
					return []
				}
				const textParts = []
				const imageParts = []
				for (const item of block.content) {
					if (item.type === "text") {
						textParts.push(item.text)
					} else if (item.type === "image" && item.source.type === "base64") {
						const { data, media_type } = item.source
						imageParts.push({ inlineData: { data, mimeType: media_type } })
					}
				}
				// Create content text with a note about images if present
				const contentText =
					textParts.join("\n\n") + (imageParts.length > 0 ? "\n\n(See next part for image)" : "")
				// Return function response followed by any images
				return [
					{ functionResponse: { name: toolName, response: { name: toolName, content: contentText } } },
					...imageParts,
				]
			}
			default:
				// Skip unsupported content block types (e.g., "reasoning", "thinking", "redacted_thinking", "document")
				// These are typically metadata from other providers that don't need to be sent to Gemini
				console.warn(`Skipping unsupported content block type: ${block.type}`)
				return []
		}
	})
	// Post-processing:
	// 1) Ensure thought signature is attached if required
	// 2) For multiple function calls in a single message, keep the signature only on the first
	//    functionCall part to match Gemini 3 parallel-calling behavior.
	if (includeThoughtSignatures && activeThoughtSignature) {
		const hasSignature = parts.some((p) => "thoughtSignature" in p)
		if (!hasSignature) {
			if (parts.length > 0) {
				// Attach to the first part (usually text)
				// We use the intersection type to allow adding the property safely
				parts[0].thoughtSignature = activeThoughtSignature
			} else {
				// Create a placeholder part if no other content exists
				const placeholder = { text: "", thoughtSignature: activeThoughtSignature }
				parts.push(placeholder)
			}
		}
	}
	if (includeThoughtSignatures) {
		let seenFirstFunctionCall = false
		for (const part of parts) {
			if (part && typeof part === "object" && "functionCall" in part && part.functionCall) {
				const partWithSig = part
				if (!seenFirstFunctionCall) {
					seenFirstFunctionCall = true
				} else {
					// Remove signature from subsequent function calls in this message.
					delete partWithSig.thoughtSignature
				}
			}
		}
	}
	return parts
}
function convertAnthropicMessageToGemini(message, options) {
	const parts = convertAnthropicContentToGemini(message.content, options)
	if (parts.length === 0) {
		return []
	}
	return [
		{
			role: message.role === "assistant" ? "model" : "user",
			parts,
		},
	]
}
