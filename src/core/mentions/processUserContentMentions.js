"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.processUserContentMentions = processUserContentMentions
const index_1 = require("./index")
/**
 * Converts MentionContentBlocks to TextPart blocks.
 * Each file/folder mention becomes a separate text block formatted
 * to look like a read_file tool result.
 */
function contentBlocksToTextParts(contentBlocks) {
	return contentBlocks.map((block) => ({
		type: "text",
		text: block.content,
	}))
}
/**
 * Process mentions in user content, specifically within task and feedback tags.
 *
 * File/folder @ mentions are now returned as separate text blocks that
 * look like read_file tool results, making it clear to the model that
 * the file has already been read.
 */
async function processUserContentMentions({
	userContent,
	cwd,
	fileContextTracker,
	aliIgnoreController,
	showAliIgnoredFiles = false,
	includeDiagnosticMessages = true,
	maxDiagnosticMessages = 50,
	skillsManager,
	currentMode = "code",
}) {
	// Track the first mode found from slash commands
	let commandMode
	// Process userContent array, which contains text and image parts.
	// We need to apply parseMentions() to TextPart's text that contains "<user_message>".
	const content = (
		await Promise.all(
			userContent.map(async (block) => {
				const shouldProcessMentions = (text) => text.includes("<user_message>")
				if (block.type === "text") {
					if (shouldProcessMentions(block.text)) {
						const result = await (0, index_1.parseMentions)(
							block.text,
							cwd,
							fileContextTracker,
							aliIgnoreController,
							showAliIgnoredFiles,
							includeDiagnosticMessages,
							maxDiagnosticMessages,
							skillsManager,
							currentMode,
						)
						// Capture the first mode found
						if (!commandMode && result.mode) {
							commandMode = result.mode
						}
						// Build the blocks array:
						// 1. User's text (with @ mentions replaced by clean paths)
						// 2. File/folder content blocks (formatted like read_file results)
						// 3. Slash command help (if any)
						const blocks = [
							{
								...block,
								text: result.text,
							},
						]
						// Add file/folder content as separate blocks
						if (result.contentBlocks.length > 0) {
							blocks.push(...contentBlocksToTextParts(result.contentBlocks))
						}
						if (result.slashCommandHelp) {
							blocks.push({
								type: "text",
								text: result.slashCommandHelp,
							})
						}
						return blocks
					}
					return block
				} else if (block.type === "tool_result") {
					if (typeof block.content === "string") {
						if (shouldProcessMentions(block.content)) {
							const result = await (0, index_1.parseMentions)(
								block.content,
								cwd,
								fileContextTracker,
								aliIgnoreController,
								showAliIgnoredFiles,
								includeDiagnosticMessages,
								maxDiagnosticMessages,
								skillsManager,
								currentMode,
							)
							// Capture the first mode found
							if (!commandMode && result.mode) {
								commandMode = result.mode
							}
							// Build content array with file blocks included
							const contentParts = [
								{
									type: "text",
									text: result.text,
								},
							]
							// Add file/folder content blocks
							for (const contentBlock of result.contentBlocks) {
								contentParts.push({
									type: "text",
									text: contentBlock.content,
								})
							}
							if (result.slashCommandHelp) {
								contentParts.push({
									type: "text",
									text: result.slashCommandHelp,
								})
							}
							return {
								...block,
								content: contentParts,
							}
						}
						return block
					} else if (Array.isArray(block.content)) {
						const parsedContent = (
							await Promise.all(
								block.content.map(async (contentBlock) => {
									if (contentBlock.type === "text" && shouldProcessMentions(contentBlock.text)) {
										const result = await (0, index_1.parseMentions)(
											contentBlock.text,
											cwd,
											fileContextTracker,
											aliIgnoreController,
											showAliIgnoredFiles,
											includeDiagnosticMessages,
											maxDiagnosticMessages,
											skillsManager,
											currentMode,
										)
										// Capture the first mode found
										if (!commandMode && result.mode) {
											commandMode = result.mode
										}
										// Build blocks array with file content
										const blocks = [
											{
												...contentBlock,
												text: result.text,
											},
										]
										// Add file/folder content blocks
										for (const cb of result.contentBlocks) {
											blocks.push({
												type: "text",
												text: cb.content,
											})
										}
										if (result.slashCommandHelp) {
											blocks.push({
												type: "text",
												text: result.slashCommandHelp,
											})
										}
										return blocks
									}
									return contentBlock
								}),
							)
						).flat()
						return { ...block, content: parsedContent }
					}
					return block
				}
				// Legacy backward compat: tool_result / tool-result blocks from older formats
				// are passed through unchanged (tool results are now in separate AliToolMessages).
				return block
			}),
		)
	).flat()
	return { content: content, mode: commandMode }
}
