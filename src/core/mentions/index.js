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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.processUserContentMentions = void 0
exports.openMention = openMention
exports.parseMentions = parseMentions
exports.getLatestTerminalOutput = getLatestTerminalOutput
const promises_1 = __importDefault(require("fs/promises"))
const path = __importStar(require("path"))
const vscode = __importStar(require("vscode"))
const isbinaryfile_1 = require("isbinaryfile")
const context_mentions_1 = require("../../shared/context-mentions")
const git_1 = require("../../utils/git")
const open_file_1 = require("../../integrations/misc/open-file")
const extract_text_1 = require("../../integrations/misc/extract-text")
const diagnostics_1 = require("../../integrations/diagnostics")
const read_file_1 = require("../prompts/tools/native-tools/read_file")
const commands_1 = require("../../services/command/commands")
const skillInvocation_1 = require("../../services/skills/skillInvocation")
async function openMention(cwd, mention) {
	if (!mention) {
		return
	}
	if (mention.startsWith("/")) {
		// Slice off the leading slash and unescape any spaces in the path
		const relPath = (0, context_mentions_1.unescapeSpaces)(mention.slice(1))
		const absPath = path.resolve(cwd, relPath)
		if (mention.endsWith("/")) {
			vscode.commands.executeCommand("revealInExplorer", vscode.Uri.file(absPath))
		} else {
			;(0, open_file_1.openFile)(absPath)
		}
	} else if (mention === "problems") {
		vscode.commands.executeCommand("workbench.actions.view.problems")
	} else if (mention === "terminal") {
		vscode.commands.executeCommand("workbench.action.terminal.focus")
	} else if (mention.startsWith("http")) {
		vscode.env.openExternal(vscode.Uri.parse(mention))
	}
}
/**
 * Formats file content to look like a read_file tool result.
 * Includes Gemini-style truncation warning when content is truncated.
 */
function formatFileReadResult(filePath, result) {
	const header = `[read_file for '${filePath}']`
	if (result.wasTruncated && result.linesShown) {
		const [start, end] = result.linesShown
		const nextOffset = end + 1
		return `${header}
IMPORTANT: File content truncated.
Status: Showing lines ${start}-${end} of ${result.totalLines} total lines.
To read more: Use the read_file tool with offset=${nextOffset} and limit=${read_file_1.DEFAULT_LINE_LIMIT}.

File: ${filePath}
${result.content}`
	}
	return `${header}
File: ${filePath}
${result.content}`
}
async function parseMentions(
	text,
	cwd,
	fileContextTracker,
	aliIgnoreController,
	showAliIgnoredFiles = false,
	includeDiagnosticMessages = true,
	maxDiagnosticMessages = 50,
	skillsManager,
	currentMode = "code",
) {
	const mentions = new Set()
	const validCommands = new Map()
	const validSkills = new Map()
	const contentBlocks = []
	let commandMode // Track mode from the first slash command that has one
	// First pass: check which command mentions exist and cache the results
	const commandMatches = Array.from(text.matchAll(context_mentions_1.commandRegexGlobal))
	const uniqueCommandNames = new Set(commandMatches.map(([, commandName]) => commandName))
	const commandExistenceChecks = await Promise.all(
		Array.from(uniqueCommandNames).map(async (commandName) => {
			try {
				const command = await (0, commands_1.getCommand)(cwd, commandName)
				if (command) {
					return { commandName, command, skillContent: null }
				}
				const skillContent = await (0, skillInvocation_1.resolveSkillContentForMode)(
					skillsManager,
					commandName,
					currentMode,
				)
				return { commandName, command: undefined, skillContent }
			} catch (error) {
				// If there's an error checking command existence, treat it as non-existent
				return { commandName, command: undefined, skillContent: null }
			}
		}),
	)
	// Store valid commands for later use and capture the first mode found
	for (const { commandName, command, skillContent } of commandExistenceChecks) {
		if (command) {
			validCommands.set(commandName, command)
			// Capture the mode from the first command that has one
			if (!commandMode && command.mode) {
				commandMode = command.mode
			}
			continue
		}
		if (skillContent) {
			validSkills.set(commandName, skillContent)
		}
	}
	// Only replace text for commands that actually exist (keep "see below" for commands)
	let parsedText = text
	for (const [match, commandName] of commandMatches) {
		if (validCommands.has(commandName) || validSkills.has(commandName)) {
			parsedText = parsedText.replace(match, `Command '${commandName}' (see below for command content)`)
		}
	}
	// Second pass: handle regular mentions - replace with clean references
	// Content will be provided as separate blocks that look like read_file results
	parsedText = parsedText.replace(context_mentions_1.mentionRegexGlobal, (match, mention) => {
		mentions.add(mention)
		if (mention.startsWith("http")) {
			return `'${mention}'`
		} else if (mention.startsWith("/")) {
			// Clean path reference - no "see below" since we format like tool results
			const mentionPath = mention.slice(1)
			return mentionPath.endsWith("/") ? `'${mentionPath}'` : `'${mentionPath}'`
		} else if (mention === "problems") {
			return `Workspace Problems (see below for diagnostics)`
		} else if (mention === "git-changes") {
			return `Working directory changes (see below for details)`
		} else if (/^[a-f0-9]{7,40}$/.test(mention)) {
			return `Git commit '${mention}' (see below for commit info)`
		} else if (mention === "terminal") {
			return `Terminal Output (see below for output)`
		}
		return match
	})
	for (const mention of mentions) {
		if (mention.startsWith("/")) {
			const mentionPath = mention.slice(1)
			try {
				const fileResult = await getFileOrFolderContentWithMetadata(
					mentionPath,
					cwd,
					aliIgnoreController,
					showAliIgnoredFiles,
					fileContextTracker,
				)
				contentBlocks.push(fileResult)
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error)
				contentBlocks.push({
					type: mention.endsWith("/") ? "folder" : "file",
					path: mentionPath,
					content: `[read_file for '${mentionPath}']\nError: ${errorMsg}`,
				})
			}
		} else if (mention === "problems") {
			try {
				const problems = await getWorkspaceProblems(cwd, includeDiagnosticMessages, maxDiagnosticMessages)
				parsedText += `\n\n<workspace_diagnostics>\n${problems}\n</workspace_diagnostics>`
			} catch (error) {
				parsedText += `\n\n<workspace_diagnostics>\nError fetching diagnostics: ${error.message}\n</workspace_diagnostics>`
			}
		} else if (mention === "git-changes") {
			try {
				const workingState = await (0, git_1.getWorkingState)(cwd)
				parsedText += `\n\n<git_working_state>\n${workingState}\n</git_working_state>`
			} catch (error) {
				parsedText += `\n\n<git_working_state>\nError fetching working state: ${error.message}\n</git_working_state>`
			}
		} else if (/^[a-f0-9]{7,40}$/.test(mention)) {
			try {
				const commitInfo = await (0, git_1.getCommitInfo)(mention, cwd)
				parsedText += `\n\n<git_commit hash="${mention}">\n${commitInfo}\n</git_commit>`
			} catch (error) {
				parsedText += `\n\n<git_commit hash="${mention}">\nError fetching commit info: ${error.message}\n</git_commit>`
			}
		} else if (mention === "terminal") {
			try {
				const terminalOutput = await getLatestTerminalOutput()
				parsedText += `\n\n<terminal_output>\n${terminalOutput}\n</terminal_output>`
			} catch (error) {
				parsedText += `\n\n<terminal_output>\nError fetching terminal output: ${error.message}\n</terminal_output>`
			}
		}
	}
	// Process valid command mentions using cached results
	let slashCommandHelp = ""
	for (const [commandName, command] of validCommands) {
		try {
			let commandOutput = ""
			if (command.description) {
				commandOutput += `Description: ${command.description}\n\n`
			}
			commandOutput += command.content
			slashCommandHelp += `\n\n<command name="${commandName}">\n${commandOutput}\n</command>`
		} catch (error) {
			slashCommandHelp += `\n\n<command name="${commandName}">\nError loading command '${commandName}': ${error.message}\n</command>`
		}
	}
	for (const [skillName, skillContent] of validSkills) {
		slashCommandHelp += `\n\n${(0, skillInvocation_1.buildSkillResult)(skillName, undefined, skillContent)}`
	}
	return {
		text: parsedText,
		contentBlocks,
		mode: commandMode,
		slashCommandHelp: slashCommandHelp.trim() || undefined,
	}
}
/**
 * Gets file or folder content and returns it as a MentionContentBlock
 * formatted to look like a read_file tool result.
 */
async function getFileOrFolderContentWithMetadata(
	mentionPath,
	cwd,
	aliIgnoreController,
	showAliIgnoredFiles = false,
	fileContextTracker,
) {
	const unescapedPath = (0, context_mentions_1.unescapeSpaces)(mentionPath)
	const absPath = path.resolve(cwd, unescapedPath)
	const isFolder = mentionPath.endsWith("/")
	try {
		const stats = await promises_1.default.stat(absPath)
		if (stats.isFile()) {
			// Avoid trying to include image binary content as text context.
			// Image mentions are handled separately via image attachment flow.
			const isBinary = await (0, isbinaryfile_1.isBinaryFile)(absPath).catch(() => false)
			if (isBinary) {
				return {
					type: "file",
					path: mentionPath,
					content: `[read_file for '${mentionPath}']\nNote: Binary file omitted from context.`,
				}
			}
			if (aliIgnoreController && !aliIgnoreController.validateAccess(unescapedPath)) {
				return {
					type: "file",
					path: mentionPath,
					content: `[read_file for '${mentionPath}']\nNote: File is ignored by .aliignore.`,
				}
			}
			try {
				const result = await (0, extract_text_1.extractTextFromFileWithMetadata)(absPath)
				// Track file context
				if (fileContextTracker) {
					await fileContextTracker.trackFileContext(mentionPath, "file_mentioned")
				}
				return {
					type: "file",
					path: mentionPath,
					content: formatFileReadResult(mentionPath, result),
					metadata: {
						totalLines: result.totalLines,
						returnedLines: result.returnedLines,
						wasTruncated: result.wasTruncated,
						linesShown: result.linesShown,
					},
				}
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error)
				return {
					type: "file",
					path: mentionPath,
					content: `[read_file for '${mentionPath}']\nError: ${errorMsg}`,
				}
			}
		} else if (stats.isDirectory()) {
			const entries = await promises_1.default.readdir(absPath, { withFileTypes: true })
			let folderListing = ""
			const fileReadResults = []
			const LOCK_SYMBOL = "🔒"
			for (let index = 0; index < entries.length; index++) {
				const entry = entries[index]
				const isLast = index === entries.length - 1
				const linePrefix = isLast ? "└── " : "├── "
				const entryPath = path.join(absPath, entry.name)
				let isIgnored = false
				if (aliIgnoreController) {
					isIgnored = !aliIgnoreController.validateAccess(entryPath)
				}
				if (isIgnored && !showAliIgnoredFiles) {
					continue
				}
				const displayName = isIgnored ? `${LOCK_SYMBOL} ${entry.name}` : entry.name
				if (entry.isFile()) {
					folderListing += `${linePrefix}${displayName}\n`
					if (!isIgnored) {
						const filePath = path.join(mentionPath, entry.name)
						const absoluteFilePath = path.resolve(absPath, entry.name)
						try {
							const isBinary = await (0, isbinaryfile_1.isBinaryFile)(absoluteFilePath).catch(() => false)
							if (!isBinary) {
								const result = await (0, extract_text_1.extractTextFromFileWithMetadata)(
									absoluteFilePath,
								)
								fileReadResults.push(formatFileReadResult(filePath.toPosix(), result))
							}
						} catch (error) {
							// Skip files that can't be read
						}
					}
				} else if (entry.isDirectory()) {
					folderListing += `${linePrefix}${displayName}/\n`
				} else {
					folderListing += `${linePrefix}${displayName}\n`
				}
			}
			// Format folder content similar to read_file output
			let content = `[read_file for folder '${mentionPath}']\nFolder listing:\n${folderListing}`
			if (fileReadResults.length > 0) {
				content += `\n\n--- File Contents ---\n\n${fileReadResults.join("\n\n")}`
			}
			return {
				type: "folder",
				path: mentionPath,
				content,
			}
		} else {
			return {
				type: isFolder ? "folder" : "file",
				path: mentionPath,
				content: `[read_file for '${mentionPath}']\nError: Unable to read (not a file or directory)`,
			}
		}
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error)
		throw new Error(`Failed to access path "${mentionPath}": ${errorMsg}`)
	}
}
async function getWorkspaceProblems(cwd, includeDiagnosticMessages = true, maxDiagnosticMessages = 50) {
	const diagnostics = vscode.languages.getDiagnostics()
	const result = await (0, diagnostics_1.diagnosticsToProblemsString)(
		diagnostics,
		[vscode.DiagnosticSeverity.Error, vscode.DiagnosticSeverity.Warning],
		cwd,
		includeDiagnosticMessages,
		maxDiagnosticMessages,
	)
	if (!result) {
		return "No errors or warnings detected."
	}
	return result
}
/**
 * Gets the contents of the active terminal
 * @returns The terminal contents as a string
 */
async function getLatestTerminalOutput() {
	// Store original clipboard content to restore later
	const originalClipboard = await vscode.env.clipboard.readText()
	try {
		// Select terminal content
		await vscode.commands.executeCommand("workbench.action.terminal.selectAll")
		// Copy selection to clipboard
		await vscode.commands.executeCommand("workbench.action.terminal.copySelection")
		// Clear the selection
		await vscode.commands.executeCommand("workbench.action.terminal.clearSelection")
		// Get terminal contents from clipboard
		let terminalContents = (await vscode.env.clipboard.readText()).trim()
		// Check if there's actually a terminal open
		if (terminalContents === originalClipboard) {
			return ""
		}
		// Clean up command separation
		const lines = terminalContents.split("\n")
		const lastLine = lines.pop()?.trim()
		if (lastLine) {
			let i = lines.length - 1
			while (i >= 0 && !lines[i].trim().startsWith(lastLine)) {
				i--
			}
			terminalContents = lines.slice(Math.max(i, 0)).join("\n")
		}
		return terminalContents
	} finally {
		// Restore original clipboard content
		await vscode.env.clipboard.writeText(originalClipboard)
	}
}
// Export processUserContentMentions from its own file
var processUserContentMentions_1 = require("./processUserContentMentions")
Object.defineProperty(exports, "processUserContentMentions", {
	enumerable: true,
	get: function () {
		return processUserContentMentions_1.processUserContentMentions
	},
})
