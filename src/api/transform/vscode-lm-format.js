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
exports.convertToVsCodeLmMessages = convertToVsCodeLmMessages
exports.convertToAnthropicRole = convertToAnthropicRole
exports.extractTextCountFromMessage = extractTextCountFromMessage
const vscode = __importStar(require("vscode"))
/**
 * Safely converts a value into a plain object.
 */
function asObjectSafe(value) {
	// Handle null/undefined
	if (!value) {
		return {}
	}
	try {
		// Handle strings that might be JSON
		if (typeof value === "string") {
			return JSON.parse(value)
		}
		// Handle pre-existing objects
		if (typeof value === "object") {
			return { ...value }
		}
		return {}
	} catch (error) {
		console.warn("AliCode <Language Model API>: Failed to parse object:", error)
		return {}
	}
}
function convertToVsCodeLmMessages(anthropicMessages) {
	const vsCodeLmMessages = []
	for (const anthropicMessage of anthropicMessages) {
		// Handle simple string messages
		if (typeof anthropicMessage.content === "string") {
			vsCodeLmMessages.push(
				anthropicMessage.role === "assistant"
					? vscode.LanguageModelChatMessage.Assistant(anthropicMessage.content)
					: vscode.LanguageModelChatMessage.User(anthropicMessage.content),
			)
			continue
		}
		// Handle complex message structures
		switch (anthropicMessage.role) {
			case "user": {
				const { nonToolMessages, toolMessages } = anthropicMessage.content.reduce(
					(acc, part) => {
						if (part.type === "tool_result") {
							acc.toolMessages.push(part)
						} else if (part.type === "text" || part.type === "image") {
							acc.nonToolMessages.push(part)
						}
						return acc
					},
					{ nonToolMessages: [], toolMessages: [] },
				)
				// Process tool messages first then non-tool messages
				const contentParts = [
					// Convert tool messages to ToolResultParts
					...toolMessages.map((toolMessage) => {
						// Process tool result content into TextParts
						const toolContentParts =
							typeof toolMessage.content === "string"
								? [new vscode.LanguageModelTextPart(toolMessage.content)]
								: (toolMessage.content?.map((part) => {
										if (part.type === "image") {
											return new vscode.LanguageModelTextPart(
												`[Image (${part.source?.type || "Unknown source-type"}): ${part.source?.media_type || "unknown media-type"} not supported by VSCode LM API]`,
											)
										}
										return new vscode.LanguageModelTextPart(part.text)
									}) ?? [new vscode.LanguageModelTextPart("")])
						return new vscode.LanguageModelToolResultPart(toolMessage.tool_use_id, toolContentParts)
					}),
					// Convert non-tool messages to TextParts after tool messages
					...nonToolMessages.map((part) => {
						if (part.type === "image") {
							return new vscode.LanguageModelTextPart(
								`[Image (${part.source?.type || "Unknown source-type"}): ${part.source?.media_type || "unknown media-type"} not supported by VSCode LM API]`,
							)
						}
						return new vscode.LanguageModelTextPart(part.text)
					}),
				]
				// Add single user message with all content parts
				vsCodeLmMessages.push(vscode.LanguageModelChatMessage.User(contentParts))
				break
			}
			case "assistant": {
				const { nonToolMessages, toolMessages } = anthropicMessage.content.reduce(
					(acc, part) => {
						if (part.type === "tool_use") {
							acc.toolMessages.push(part)
						} else if (part.type === "text" || part.type === "image") {
							acc.nonToolMessages.push(part)
						}
						return acc
					},
					{ nonToolMessages: [], toolMessages: [] },
				)
				// Process non-tool messages first, then tool messages
				// Tool calls must come at the end so they are properly followed by user message with tool results
				const contentParts = [
					// Convert non-tool messages to TextParts first
					...nonToolMessages.map((part) => {
						if (part.type === "image") {
							return new vscode.LanguageModelTextPart("[Image generation not supported by VSCode LM API]")
						}
						return new vscode.LanguageModelTextPart(part.text)
					}),
					// Convert tool messages to ToolCallParts after text
					...toolMessages.map(
						(toolMessage) =>
							new vscode.LanguageModelToolCallPart(
								toolMessage.id,
								toolMessage.name,
								asObjectSafe(toolMessage.input),
							),
					),
				]
				// Add the assistant message to the list of messages
				vsCodeLmMessages.push(vscode.LanguageModelChatMessage.Assistant(contentParts))
				break
			}
		}
	}
	return vsCodeLmMessages
}
function convertToAnthropicRole(vsCodeLmMessageRole) {
	switch (vsCodeLmMessageRole) {
		case vscode.LanguageModelChatMessageRole.Assistant:
			return "assistant"
		case vscode.LanguageModelChatMessageRole.User:
			return "user"
		default:
			return null
	}
}
/**
 * Extracts the text content from a VS Code Language Model chat message.
 * @param message A VS Code Language Model chat message.
 * @returns The extracted text content.
 */
function extractTextCountFromMessage(message) {
	let text = ""
	if (Array.isArray(message.content)) {
		for (const item of message.content) {
			if (item instanceof vscode.LanguageModelTextPart) {
				text += item.value
			}
			if (item instanceof vscode.LanguageModelToolResultPart) {
				text += item.callId
				for (const part of item.content) {
					if (part instanceof vscode.LanguageModelTextPart) {
						text += part.value
					}
				}
			}
			if (item instanceof vscode.LanguageModelToolCallPart) {
				text += item.name
				text += item.callId
				if (item.input && Object.keys(item.input).length > 0) {
					try {
						text += JSON.stringify(item.input)
					} catch (error) {
						console.error("AliCode <Language Model API>: Failed to stringify tool call input:", error)
					}
				}
			}
		}
	} else if (typeof message.content === "string") {
		text += message.content
	}
	return text
}
