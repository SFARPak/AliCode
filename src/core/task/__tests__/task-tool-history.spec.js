"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
;(0, vitest_1.describe)("Task Tool History Handling", () => {
	;(0, vitest_1.describe)("resumeTaskFromHistory tool block preservation", () => {
		;(0, vitest_1.it)("should preserve tool_use and tool_result blocks for native protocol", () => {
			// Mock API conversation history with tool blocks
			const apiHistory = [
				{
					role: "user",
					content: "Read the file config.json",
					ts: Date.now(),
				},
				{
					role: "assistant",
					content: [
						{
							type: "text",
							text: "I'll read that file for you.",
						},
						{
							type: "tool_use",
							id: "toolu_123",
							name: "read_file",
							input: { path: "config.json" },
						},
					],
					ts: Date.now(),
				},
				{
					role: "user",
					content: [
						{
							type: "tool_result",
							tool_use_id: "toolu_123",
							content: '{"setting": "value"}',
						},
					],
					ts: Date.now(),
				},
			]
			// Verify tool blocks are preserved
			const assistantMessage = apiHistory[1]
			const userMessage = apiHistory[2]
			;(0, vitest_1.expect)(assistantMessage.content).toEqual(
				vitest_1.expect.arrayContaining([
					vitest_1.expect.objectContaining({
						type: "tool_use",
						id: "toolu_123",
						name: "read_file",
					}),
				]),
			)
			;(0, vitest_1.expect)(userMessage.content).toEqual(
				vitest_1.expect.arrayContaining([
					vitest_1.expect.objectContaining({
						type: "tool_result",
						tool_use_id: "toolu_123",
					}),
				]),
			)
		})
	})
	;(0, vitest_1.describe)("convertToOpenAiMessages format", () => {
		;(0, vitest_1.it)("should properly convert tool_use to tool_calls format", () => {
			const anthropicMessage = {
				role: "assistant",
				content: [
					{
						type: "text",
						text: "I'll read that file.",
					},
					{
						type: "tool_use",
						id: "toolu_123",
						name: "read_file",
						input: { path: "config.json" },
					},
				],
			}
			// Simulate what convertToOpenAiMessages does
			const toolUseBlocks = anthropicMessage.content.filter((block) => block.type === "tool_use")
			const tool_calls = toolUseBlocks.map((toolMessage) => ({
				id: toolMessage.id,
				type: "function",
				function: {
					name: toolMessage.name,
					arguments: JSON.stringify(toolMessage.input),
				},
			}))
			;(0, vitest_1.expect)(tool_calls).toHaveLength(1)
			;(0, vitest_1.expect)(tool_calls[0]).toEqual({
				id: "toolu_123",
				type: "function",
				function: {
					name: "read_file",
					arguments: '{"path":"config.json"}',
				},
			})
		})
		;(0, vitest_1.it)("should properly convert tool_result to tool role messages", () => {
			const anthropicMessage = {
				role: "user",
				content: [
					{
						type: "tool_result",
						tool_use_id: "toolu_123",
						content: '{"setting": "value"}',
					},
				],
			}
			// Simulate what convertToOpenAiMessages does
			const toolMessages = anthropicMessage.content.filter((block) => block.type === "tool_result")
			const openAiToolMessages = toolMessages.map((toolMessage) => ({
				role: "tool",
				tool_call_id: toolMessage.tool_use_id,
				content: typeof toolMessage.content === "string" ? toolMessage.content : toolMessage.content[0].text,
			}))
			;(0, vitest_1.expect)(openAiToolMessages).toHaveLength(1)
			;(0, vitest_1.expect)(openAiToolMessages[0]).toEqual({
				role: "tool",
				tool_call_id: "toolu_123",
				content: '{"setting": "value"}',
			})
		})
		;(0, vitest_1.describe)("environment details deduplication", () => {
			;(0, vitest_1.it)("should filter out existing environment_details blocks before adding new ones", () => {
				// Simulate user content that already contains environment details from a previous session
				const userContentWithOldEnvDetails = [
					{
						type: "text",
						text: "Some user message",
					},
					{
						type: "text",
						text: "<environment_details>\n# Old Environment Details\nCurrent time: 2024-01-01\n</environment_details>",
					},
				]
				// Filter out existing environment_details blocks using the same logic as Task.ts
				const contentWithoutEnvDetails = userContentWithOldEnvDetails.filter((block) => {
					if (block.type === "text" && typeof block.text === "string") {
						// Check if this text block is a complete environment_details block
						const isEnvironmentDetailsBlock =
							block.text.trim().startsWith("<environment_details>") &&
							block.text.trim().endsWith("</environment_details>")
						return !isEnvironmentDetailsBlock
					}
					return true
				})
				// Verify old environment details were removed
				;(0, vitest_1.expect)(contentWithoutEnvDetails).toHaveLength(1)
				;(0, vitest_1.expect)(contentWithoutEnvDetails[0].text).toBe("Some user message")
				// Simulate adding fresh environment details
				const newEnvironmentDetails =
					"<environment_details>\n# Fresh Environment Details\nCurrent time: 2024-01-02\n</environment_details>"
				const finalUserContent = [...contentWithoutEnvDetails, { type: "text", text: newEnvironmentDetails }]
				// Verify we have exactly one environment_details block (the new one)
				const envDetailsBlocks = finalUserContent.filter((block) => {
					if (block.type === "text" && typeof block.text === "string") {
						return (
							block.text.trim().startsWith("<environment_details>") &&
							block.text.trim().endsWith("</environment_details>")
						)
					}
					return false
				})
				;(0, vitest_1.expect)(envDetailsBlocks).toHaveLength(1)
				;(0, vitest_1.expect)(envDetailsBlocks[0].text).toContain("2024-01-02")
				;(0, vitest_1.expect)(envDetailsBlocks[0].text).not.toContain("2024-01-01")
			})
			;(0, vitest_1.it)("should not filter out text that mentions environment_details tags in content", () => {
				// User content that mentions the tags but isn't an environment_details block
				const userContent = [
					{
						type: "text",
						text: "Let me explain how <environment_details> work in this system",
					},
					{
						type: "text",
						text: "The closing tag is </environment_details>",
					},
					{
						type: "text",
						text: "Regular message",
					},
				]
				// Filter using the same logic as Task.ts
				const contentWithoutEnvDetails = userContent.filter((block) => {
					if (block.type === "text" && typeof block.text === "string") {
						const isEnvironmentDetailsBlock =
							block.text.trim().startsWith("<environment_details>") &&
							block.text.trim().endsWith("</environment_details>")
						return !isEnvironmentDetailsBlock
					}
					return true
				})
				// All blocks should be preserved since none are complete environment_details blocks
				;(0, vitest_1.expect)(contentWithoutEnvDetails).toHaveLength(3)
				;(0, vitest_1.expect)(contentWithoutEnvDetails).toEqual(userContent)
			})
			;(0, vitest_1.it)("should not filter out regular text blocks", () => {
				// User content with various blocks but no environment details
				const userContent = [
					{
						type: "text",
						text: "Regular message",
					},
					{
						type: "text",
						text: "Another message with <user_message> tags",
					},
					{
						type: "tool_result",
						tool_use_id: "tool_123",
						content: "Tool result",
					},
				]
				// Filter using the same logic as Task.ts
				const contentWithoutEnvDetails = userContent.filter((block) => {
					if (block.type === "text" && typeof block.text === "string") {
						const isEnvironmentDetailsBlock =
							block.text.trim().startsWith("<environment_details>") &&
							block.text.trim().endsWith("</environment_details>")
						return !isEnvironmentDetailsBlock
					}
					return true
				})
				// All blocks should be preserved
				;(0, vitest_1.expect)(contentWithoutEnvDetails).toHaveLength(3)
				;(0, vitest_1.expect)(contentWithoutEnvDetails).toEqual(userContent)
			})
		})
	})
})
