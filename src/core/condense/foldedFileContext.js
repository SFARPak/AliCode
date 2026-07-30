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
exports.generateFoldedFileContext = generateFoldedFileContext
const path = __importStar(require("path"))
const tree_sitter_1 = require("../../services/tree-sitter")
/**
 * Checks if a definitions string is actually an error message from tree-sitter
 * rather than valid code definitions. These error strings should not be embedded
 * in the folded file context - instead, the file should be skipped.
 */
function isTreeSitterErrorString(definitions) {
	// These are known error messages from parseSourceCodeDefinitionsForFile
	const errorPatterns = ["This file does not exist", "do not have permission", "Unsupported file type:"]
	return errorPatterns.some((pattern) => definitions.includes(pattern))
}
/**
 * Generates folded (signatures-only) file context for a list of files using tree-sitter.
 *
 * This function takes file paths that were read during a conversation and produces
 * a condensed representation showing only function signatures, class declarations,
 * and other important structural definitions - hiding implementation bodies.
 *
 * Each file is wrapped in its own `<system-reminder>` block during context condensation,
 * allowing the model to retain awareness of file structure without consuming excessive tokens.
 *
 * @param filePaths - Array of file paths to process (relative to cwd)
 * @param options - Configuration options including cwd and max characters
 * @returns FoldedFileContextResult with the formatted content and statistics
 *
 * @example
 * ```typescript
 * const result = await generateFoldedFileContext(
 *   ['src/utils/helpers.ts', 'src/api/client.ts'],
 *   { cwd: '/project', maxCharacters: 30000 }
 * )
 * // result.content contains individual <system-reminder> blocks for each file:
 * // <system-reminder>
 * // ## File Context: src/utils/helpers.ts
 * // 1--15 | export function formatDate(...)
 * // 17--45 | export class DateHelper {...}
 * // </system-reminder>
 * // <system-reminder>
 * // ## File Context: src/api/client.ts
 * // ...
 * // </system-reminder>
 * ```
 */
async function generateFoldedFileContext(filePaths, options) {
	const { maxCharacters = 50000, cwd, aliIgnoreController } = options
	const result = {
		content: "",
		sections: [],
		filesProcessed: 0,
		filesSkipped: 0,
		characterCount: 0,
	}
	if (filePaths.length === 0) {
		return result
	}
	const foldedSections = []
	let currentCharCount = 0
	const failedFiles = []
	for (let i = 0; i < filePaths.length; i++) {
		const filePath = filePaths[i]
		// Resolve to absolute path for tree-sitter
		const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(cwd, filePath)
		try {
			// Get the folded definitions using tree-sitter
			const definitions = await (0, tree_sitter_1.parseSourceCodeDefinitionsForFile)(
				absolutePath,
				aliIgnoreController,
			)
			if (!definitions || isTreeSitterErrorString(definitions)) {
				// File type not supported, no definitions found, or error accessing file
				result.filesSkipped++
				continue
			}
			// Wrap each file in its own <system-reminder> block
			const sectionContent = `<system-reminder>
## File Context: ${filePath}
${definitions}
</system-reminder>`
			// Check if adding this file would exceed the character limit
			if (currentCharCount + sectionContent.length > maxCharacters) {
				// Would exceed limit - check if we can fit at least a truncated version
				const remainingChars = maxCharacters - currentCharCount
				if (remainingChars < 200) {
					// Not enough room for meaningful content, stop processing all remaining files
					result.filesSkipped += filePaths.length - i
					break
				}
				// Truncate the definitions to fit within the system-reminder block
				const truncatedDefinitions = definitions.substring(0, remainingChars - 100) + "\n... (truncated)"
				const truncatedContent = `<system-reminder>
## File Context: ${filePath}
${truncatedDefinitions}
</system-reminder>`
				foldedSections.push(truncatedContent)
				currentCharCount += truncatedContent.length
				result.filesProcessed++
				// Stop processing more files since we've hit the limit
				result.filesSkipped += filePaths.length - result.filesProcessed - result.filesSkipped
				break
			}
			foldedSections.push(sectionContent)
			currentCharCount += sectionContent.length
			result.filesProcessed++
		} catch (error) {
			// Collect failed files for batch logging to reduce noise
			failedFiles.push(filePath)
			result.filesSkipped++
		}
	}
	// Log failed files as a single batch summary instead of per-file errors
	if (failedFiles.length > 0) {
		console.warn(
			`Folded context generation: skipped ${failedFiles.length} file(s) due to errors: ${failedFiles.slice(0, 5).join(", ")}${failedFiles.length > 5 ? ` and ${failedFiles.length - 5} more` : ""}`,
		)
	}
	if (foldedSections.length > 0) {
		result.sections = foldedSections
		result.content = foldedSections.join("\n")
		result.characterCount = result.content.length
	}
	return result
}
