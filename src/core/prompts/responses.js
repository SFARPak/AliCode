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
exports.formatResponse = void 0
const path = __importStar(require("path"))
const diff = __importStar(require("diff"))
const AliIgnoreController_1 = require("../ignore/AliIgnoreController")
exports.formatResponse = {
	toolDenied: () =>
		JSON.stringify({
			status: "denied",
			message: "The user denied this operation.",
		}),
	toolDeniedWithFeedback: (feedback) =>
		JSON.stringify({
			status: "denied",
			feedback,
		}),
	toolApprovedWithFeedback: (feedback) =>
		JSON.stringify({
			status: "approved",
			feedback,
		}),
	toolError: (error) =>
		JSON.stringify({
			status: "error",
			message: "The tool execution failed",
			error,
		}),
	rooIgnoreError: (path) =>
		JSON.stringify({
			status: "error",
			type: "access_denied",
			message: "Access blocked by .aliignore",
			path,
			suggestion: "Try to continue without this file, or ask the user to update the .aliignore file",
		}),
	noToolsUsed: () => {
		const instructions = getToolInstructionsReminder()
		return `[ERROR] You did not use a tool in your previous response! Please retry with a tool use.

${instructions}

# Next Steps

If you have completed the user's task, use the attempt_completion tool.
If you require additional information from the user, use the ask_followup_question tool.
Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task.
(This is an automated message, so do not respond to it conversationally.)`
	},
	tooManyMistakes: (feedback) =>
		JSON.stringify({
			status: "guidance",
			feedback,
		}),
	missingToolParameterError: (paramName) => {
		const instructions = getToolInstructionsReminder()
		return `Missing value for required parameter '${paramName}'. Please retry with complete response.\n\n${instructions}`
	},
	invalidMcpToolArgumentError: (serverName, toolName) =>
		JSON.stringify({
			status: "error",
			type: "invalid_argument",
			message: "Invalid JSON argument",
			server: serverName,
			tool: toolName,
			suggestion: "Please retry with a properly formatted JSON argument",
		}),
	unknownMcpToolError: (serverName, toolName, availableTools) =>
		JSON.stringify({
			status: "error",
			type: "unknown_tool",
			message: "Tool does not exist on server",
			server: serverName,
			tool: toolName,
			available_tools: availableTools.length > 0 ? availableTools : [],
			suggestion: "Please use one of the available tools or check if the server is properly configured",
		}),
	unknownMcpServerError: (serverName, availableServers) =>
		JSON.stringify({
			status: "error",
			type: "unknown_server",
			message: "Server is not configured",
			server: serverName,
			available_servers: availableServers.length > 0 ? availableServers : [],
		}),
	toolResult: (text, images) => {
		if (images && images.length > 0) {
			const textBlock = { type: "text", text }
			const imageBlocks = formatImagesIntoBlocks(images)
			// Placing images after text leads to better results
			return [textBlock, ...imageBlocks]
		} else {
			return text
		}
	},
	imageBlocks: (images) => {
		return formatImagesIntoBlocks(images)
	},
	formatFilesList: (
		absolutePath,
		files,
		didHitLimit,
		aliIgnoreController,
		showAliIgnoredFiles,
		aliProtectedController,
	) => {
		const sorted = files
			.map((file) => {
				// convert absolute path to relative path
				const relativePath = path.relative(absolutePath, file).toPosix()
				return file.endsWith("/") ? relativePath + "/" : relativePath
			})
			// Sort so files are listed under their respective directories to make it clear what files are children of what directories. Since we build file list top down, even if file list is truncated it will show directories that cline can then explore further.
			.sort((a, b) => {
				const aParts = a.split("/") // only works if we use toPosix first
				const bParts = b.split("/")
				for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
					if (aParts[i] !== bParts[i]) {
						// If one is a directory and the other isn't at this level, sort the directory first
						if (i + 1 === aParts.length && i + 1 < bParts.length) {
							return -1
						}
						if (i + 1 === bParts.length && i + 1 < aParts.length) {
							return 1
						}
						// Otherwise, sort alphabetically
						return aParts[i].localeCompare(bParts[i], undefined, { numeric: true, sensitivity: "base" })
					}
				}
				// If all parts are the same up to the length of the shorter path,
				// the shorter one comes first
				return aParts.length - bParts.length
			})
		let rooIgnoreParsed = sorted
		if (aliIgnoreController) {
			rooIgnoreParsed = []
			for (const filePath of sorted) {
				// path is relative to absolute path, not cwd
				// validateAccess expects either path relative to cwd or absolute path
				// otherwise, for validating against ignore patterns like "assets/icons", we would end up with just "icons", which would result in the path not being ignored.
				const absoluteFilePath = path.resolve(absolutePath, filePath)
				const isIgnored = !aliIgnoreController.validateAccess(absoluteFilePath)
				if (isIgnored) {
					// If file is ignored and we're not showing ignored files, skip it
					if (!showAliIgnoredFiles) {
						continue
					}
					// Otherwise, mark it with a lock symbol
					rooIgnoreParsed.push(AliIgnoreController_1.LOCK_TEXT_SYMBOL + " " + filePath)
				} else {
					// Check if file is write-protected (only for non-ignored files)
					const isWriteProtected = aliProtectedController?.isWriteProtected(absoluteFilePath) || false
					if (isWriteProtected) {
						rooIgnoreParsed.push("🛡️ " + filePath)
					} else {
						rooIgnoreParsed.push(filePath)
					}
				}
			}
		}
		if (didHitLimit) {
			return `${rooIgnoreParsed.join("\n")}\n\n(File list truncated. Use list_files on specific subdirectories if you need to explore further.)`
		} else if (rooIgnoreParsed.length === 0 || (rooIgnoreParsed.length === 1 && rooIgnoreParsed[0] === "")) {
			return "No files found."
		} else {
			return rooIgnoreParsed.join("\n")
		}
	},
	createPrettyPatch: (filename = "file", oldStr, newStr) => {
		// strings cannot be undefined or diff throws exception
		const patch = diff.createPatch(filename.toPosix(), oldStr || "", newStr || "", undefined, undefined, {
			context: 3,
		})
		const lines = patch.split("\n")
		const prettyPatchLines = lines.slice(4)
		return prettyPatchLines.join("\n")
	},
}
// to avoid circular dependency
const formatImagesIntoBlocks = (images) => {
	return images
		? images.map((dataUrl) => {
				// data:image/png;base64,base64string
				const [rest, base64] = dataUrl.split(",")
				const mimeType = rest.split(":")[1].split(";")[0]
				return {
					type: "image",
					source: { type: "base64", media_type: mimeType, data: base64 },
				}
			})
		: []
}
const toolUseInstructionsReminderNative = `# Reminder: Instructions for Tool Use

Tools are invoked using the platform's native tool calling mechanism. Each tool requires specific parameters as defined in the tool descriptions. Refer to the tool definitions provided in your system instructions for the correct parameter structure and usage examples.

Always ensure you provide all required parameters for the tool you wish to use.`
/**
 * Gets the tool use instructions reminder.
 */
function getToolInstructionsReminder() {
	return toolUseInstructionsReminderNative
}
