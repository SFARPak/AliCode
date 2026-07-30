"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.normalizeMistralToolCallId = normalizeMistralToolCallId
exports.convertToMistralMessages = convertToMistralMessages
/**
 * Normalizes a tool call ID to be compatible with Mistral's strict ID requirements.
 * Mistral requires tool call IDs to be:
 * - Only alphanumeric characters (a-z, A-Z, 0-9)
 * - Exactly 9 characters in length
 *
 * This function extracts alphanumeric characters from the original ID and
 * pads/truncates to exactly 9 characters, ensuring deterministic output.
 *
 * @param id - The original tool call ID (e.g., "call_5019f900a247472bacde0b82" or "toolu_123")
 * @returns A normalized 9-character alphanumeric ID compatible with Mistral
 */
function normalizeMistralToolCallId(id) {
	// Extract only alphanumeric characters
	const alphanumeric = id.replace(/[^a-zA-Z0-9]/g, "")
	// Take first 9 characters, or pad with zeros if shorter
	if (alphanumeric.length >= 9) {
		return alphanumeric.slice(0, 9)
	}
	// Pad with zeros to reach 9 characters
	return alphanumeric.padEnd(9, "0")
}
function convertToMistralMessages(anthropicMessages) {
	const mistralMessages = []
	for (const anthropicMessage of anthropicMessages) {
		if (typeof anthropicMessage.content === "string") {
			mistralMessages.push({
				role: anthropicMessage.role,
				content: anthropicMessage.content,
			})
		} else {
			if (anthropicMessage.role === "user") {
				const { nonToolMessages, toolMessages } = anthropicMessage.content.reduce(
					(acc, part) => {
						if (part.type === "tool_result") {
							acc.toolMessages.push(part)
						} else if (part.type === "text" || part.type === "image") {
							acc.nonToolMessages.push(part)
						} // user cannot send tool_use messages
						return acc
					},
					{ nonToolMessages: [], toolMessages: [] },
				)
				// If there are tool results, handle them
				// Mistral's message order is strict: user → assistant → tool → assistant
				// We CANNOT put user messages after tool messages
				if (toolMessages.length > 0) {
					// Convert tool_result blocks to Mistral tool messages
					for (const toolResult of toolMessages) {
						let resultContent
						if (typeof toolResult.content === "string") {
							resultContent = toolResult.content
						} else if (Array.isArray(toolResult.content)) {
							// Extract text from content blocks
							resultContent = toolResult.content
								.filter((block) => block.type === "text")
								.map((block) => block.text)
								.join("\n")
						} else {
							resultContent = ""
						}
						mistralMessages.push({
							role: "tool",
							toolCallId: normalizeMistralToolCallId(toolResult.tool_use_id),
							content: resultContent,
						})
					}
					// Note: We intentionally skip any non-tool user content when there are tool results
					// because Mistral doesn't allow user messages after tool messages
				} else if (nonToolMessages.length > 0) {
					// Only add user content if there are NO tool results
					mistralMessages.push({
						role: "user",
						content: nonToolMessages.map((part) => {
							if (part.type === "image") {
								return {
									type: "image_url",
									imageUrl: {
										url: `data:${part.source.media_type};base64,${part.source.data}`,
									},
								}
							}
							return { type: "text", text: part.text }
						}),
					})
				}
			} else if (anthropicMessage.role === "assistant") {
				const { nonToolMessages, toolMessages } = anthropicMessage.content.reduce(
					(acc, part) => {
						if (part.type === "tool_use") {
							acc.toolMessages.push(part)
						} else if (part.type === "text" || part.type === "image") {
							acc.nonToolMessages.push(part)
						} // assistant cannot send tool_result messages
						return acc
					},
					{ nonToolMessages: [], toolMessages: [] },
				)
				let content
				if (nonToolMessages.length > 0) {
					content = nonToolMessages
						.map((part) => {
							if (part.type === "image") {
								return "" // impossible as the assistant cannot send images
							}
							return part.text
						})
						.join("\n")
				}
				// Convert tool_use blocks to Mistral toolCalls format
				let toolCalls
				if (toolMessages.length > 0) {
					toolCalls = toolMessages.map((toolUse) => ({
						id: normalizeMistralToolCallId(toolUse.id),
						type: "function",
						function: {
							name: toolUse.name,
							arguments:
								typeof toolUse.input === "string" ? toolUse.input : JSON.stringify(toolUse.input),
						},
					}))
				}
				// Mistral requires either content or toolCalls to be non-empty
				// If we have toolCalls but no content, we need to handle this properly
				const assistantMessage = {
					role: "assistant",
					content,
				}
				if (toolCalls && toolCalls.length > 0) {
					assistantMessage.toolCalls = toolCalls
				}
				mistralMessages.push(assistantMessage)
			}
		}
	}
	return mistralMessages
}
