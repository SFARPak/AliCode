"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.convertToBedrockConverseMessages = convertToBedrockConverseMessages
const tool_id_1 = require("../../utils/tool-id")
/**
 * Convert Anthropic messages to Bedrock Converse format
 * @param anthropicMessages Messages in Anthropic format
 */
function convertToBedrockConverseMessages(anthropicMessages) {
	return anthropicMessages.map((anthropicMessage) => {
		// Map Anthropic roles to Bedrock roles
		const role = anthropicMessage.role === "assistant" ? "assistant" : "user"
		if (typeof anthropicMessage.content === "string") {
			return {
				role,
				content: [
					{
						text: anthropicMessage.content,
					},
				],
			}
		}
		// Process complex content types
		const content = anthropicMessage.content.map((block) => {
			const messageBlock = block
			if (messageBlock.type === "text") {
				return {
					text: messageBlock.text || "",
				}
			}
			if (messageBlock.type === "image" && messageBlock.source) {
				// Convert base64 string to byte array if needed
				let byteArray
				if (typeof messageBlock.source.data === "string") {
					const binaryString = atob(messageBlock.source.data)
					byteArray = new Uint8Array(binaryString.length)
					for (let i = 0; i < binaryString.length; i++) {
						byteArray[i] = binaryString.charCodeAt(i)
					}
				} else {
					byteArray = messageBlock.source.data
				}
				// Extract format from media_type (e.g., "image/jpeg" -> "jpeg")
				const format = messageBlock.source.media_type.split("/")[1]
				if (!["png", "jpeg", "gif", "webp"].includes(format)) {
					throw new Error(`Unsupported image format: ${format}`)
				}
				return {
					image: {
						format: format,
						source: {
							bytes: byteArray,
						},
					},
				}
			}
			if (messageBlock.type === "tool_use") {
				// Native-only: keep input as JSON object for Bedrock's toolUse format
				return {
					toolUse: {
						toolUseId: (0, tool_id_1.sanitizeOpenAiCallId)(messageBlock.id || ""),
						name: messageBlock.name || "",
						input: messageBlock.input || {},
					},
				}
			}
			if (messageBlock.type === "tool_result") {
				// Handle content field - can be string or array (native tool format)
				if (messageBlock.content) {
					// Content is a string
					if (typeof messageBlock.content === "string") {
						return {
							toolResult: {
								toolUseId: (0, tool_id_1.sanitizeOpenAiCallId)(messageBlock.tool_use_id || ""),
								content: [
									{
										text: messageBlock.content,
									},
								],
								status: "success",
							},
						}
					}
					// Content is an array of content blocks
					if (Array.isArray(messageBlock.content)) {
						return {
							toolResult: {
								toolUseId: (0, tool_id_1.sanitizeOpenAiCallId)(messageBlock.tool_use_id || ""),
								content: messageBlock.content.map((item) => ({
									text: typeof item === "string" ? item : item.text || String(item),
								})),
								status: "success",
							},
						}
					}
				}
				// Fall back to output handling if content is not available
				if (messageBlock.output && typeof messageBlock.output === "string") {
					return {
						toolResult: {
							toolUseId: (0, tool_id_1.sanitizeOpenAiCallId)(messageBlock.tool_use_id || ""),
							content: [
								{
									text: messageBlock.output,
								},
							],
							status: "success",
						},
					}
				}
				// Handle array of content blocks if output is an array
				if (Array.isArray(messageBlock.output)) {
					return {
						toolResult: {
							toolUseId: (0, tool_id_1.sanitizeOpenAiCallId)(messageBlock.tool_use_id || ""),
							content: messageBlock.output.map((part) => {
								if (typeof part === "object" && "text" in part) {
									return { text: part.text }
								}
								// Skip images in tool results as they're handled separately
								if (typeof part === "object" && "type" in part && part.type === "image") {
									return { text: "(see following message for image)" }
								}
								return { text: String(part) }
							}),
							status: "success",
						},
					}
				}
				// Default case
				return {
					toolResult: {
						toolUseId: (0, tool_id_1.sanitizeOpenAiCallId)(messageBlock.tool_use_id || ""),
						content: [
							{
								text: String(messageBlock.output || ""),
							},
						],
						status: "success",
					},
				}
			}
			if (messageBlock.type === "video") {
				const videoContent = messageBlock.s3Location
					? {
							s3Location: {
								uri: messageBlock.s3Location.uri,
								bucketOwner: messageBlock.s3Location.bucketOwner,
							},
						}
					: messageBlock.source
				return {
					video: {
						format: "mp4", // Default to mp4, adjust based on actual format if needed
						source: videoContent,
					},
				}
			}
			// Default case for unknown block types
			return {
				text: "[Unknown Block Type]",
			}
		})
		return {
			role,
			content,
		}
	})
}
