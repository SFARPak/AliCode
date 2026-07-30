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
exports.readFileTool = exports.ReadFileTool = void 0
/**
 * ReadFileTool - Codex-inspired file reading with indentation mode support.
 *
 * Supports two modes:
 * 1. Slice mode (default): Read contiguous lines with offset/limit
 * 2. Indentation mode: Extract semantic code blocks based on indentation hierarchy
 *
 * Also supports legacy format for backward compatibility:
 * - Legacy format: { files: [{ path: string, lineRanges?: [...] }] }
 */
const path_1 = __importDefault(require("path"))
const fs = __importStar(require("fs/promises"))
const isbinaryfile_1 = require("isbinaryfile")
const types_1 = require("@ali-code/types")
const responses_1 = require("../prompts/responses")
const pathUtils_1 = require("../../utils/pathUtils")
const path_2 = require("../../utils/path")
const extract_text_1 = require("../../integrations/misc/extract-text")
const indentation_reader_1 = require("../../integrations/misc/indentation-reader")
const read_file_1 = require("../prompts/tools/native-tools/read_file")
const imageHelpers_1 = require("./helpers/imageHelpers")
const BaseTool_1 = require("./BaseTool")
// ─── Tool Implementation ──────────────────────────────────────────────────────
class ReadFileTool extends BaseTool_1.BaseTool {
	name = "read_file"
	async execute(params, task, callbacks) {
		// Dispatch to legacy or new execution path based on format
		if ((0, types_1.isLegacyReadFileParams)(params)) {
			return this.executeLegacy(params.files, task, callbacks)
		}
		return this.executeNew(params, task, callbacks)
	}
	/**
	 * Execute new single-file format with slice/indentation mode support.
	 */
	async executeNew(params, task, callbacks) {
		const { pushToolResult } = callbacks
		const modelInfo = task.api.getModel().info
		const filePath = params.path
		// Validate input
		if (!filePath) {
			task.consecutiveMistakeCount++
			task.recordToolError("read_file")
			const errorMsg = await task.sayAndCreateMissingParamError("read_file", "path")
			pushToolResult(`Error: ${errorMsg}`)
			return
		}
		const supportsImages = modelInfo.supportsImages ?? false
		// Initialize file results tracking
		// Validate line number parameters (must be 1-indexed positive integers)
		if (params.offset !== undefined && params.offset < 1) {
			const errorMsg = `offset must be a 1-indexed line number (got ${params.offset}). Line numbers start at 1.`
			pushToolResult(`Error: ${errorMsg}`)
			return
		}
		if (params.indentation?.anchor_line !== undefined && params.indentation.anchor_line < 1) {
			const errorMsg = `anchor_line must be a 1-indexed line number (got ${params.indentation.anchor_line}). Line numbers start at 1.`
			pushToolResult(`Error: ${errorMsg}`)
			return
		}
		const fileEntry = {
			path: filePath,
			mode: params.mode,
			offset: params.offset,
			limit: params.limit,
			anchor_line: params.indentation?.anchor_line,
			max_levels: params.indentation?.max_levels,
			include_siblings: params.indentation?.include_siblings,
			include_header: params.indentation?.include_header,
			max_lines: params.indentation?.max_lines,
		}
		const fileResults = [
			{
				path: filePath,
				status: "pending",
				entry: fileEntry,
			},
		]
		const updateFileResult = (filePath, updates) => {
			const index = fileResults.findIndex((result) => result.path === filePath)
			if (index !== -1) {
				fileResults[index] = { ...fileResults[index], ...updates }
			}
		}
		try {
			// Phase 1: Validate and filter files for approval
			const filesToApprove = []
			for (const fileResult of fileResults) {
				const relPath = fileResult.path
				// RooIgnore validation
				const accessAllowed = task.aliIgnoreController?.validateAccess(relPath)
				if (!accessAllowed) {
					await task.say("rooignore_error", relPath)
					const errorMsg = responses_1.formatResponse.rooIgnoreError(relPath)
					updateFileResult(relPath, {
						status: "blocked",
						error: errorMsg,
						nativeContent: `File: ${relPath}\nError: ${errorMsg}`,
					})
					continue
				}
				filesToApprove.push(fileResult)
			}
			// Phase 2: Request user approval
			await this.requestApproval(task, filesToApprove, updateFileResult)
			// Phase 3: Process approved files
			const imageMemoryTracker = new imageHelpers_1.ImageMemoryTracker()
			const state = await task.providerRef.deref()?.getState()
			const {
				maxImageFileSize = imageHelpers_1.DEFAULT_MAX_IMAGE_FILE_SIZE_MB,
				maxTotalImageSize = imageHelpers_1.DEFAULT_MAX_TOTAL_IMAGE_SIZE_MB,
			} = state ?? {}
			for (const fileResult of fileResults) {
				if (fileResult.status !== "approved") continue
				const relPath = fileResult.path
				const fullPath = path_1.default.resolve(task.cwd, relPath)
				const entry = fileResult.entry
				try {
					// Check if path is a directory
					const stats = await fs.stat(fullPath)
					if (stats.isDirectory()) {
						const errorMsg = `Cannot read '${relPath}' because it is a directory. Use list_files tool instead.`
						updateFileResult(relPath, {
							status: "error",
							error: errorMsg,
							nativeContent: `File: ${relPath}\nError: ${errorMsg}`,
						})
						await task.say("error", `Error reading file ${relPath}: ${errorMsg}`)
						continue
					}
					// Check for binary file
					const isBinary = await (0, isbinaryfile_1.isBinaryFile)(fullPath)
					if (isBinary) {
						await this.handleBinaryFile(
							task,
							relPath,
							fullPath,
							supportsImages,
							maxImageFileSize,
							maxTotalImageSize,
							imageMemoryTracker,
							updateFileResult,
						)
						continue
					}
					// Read text file content with lossy UTF-8 conversion
					// Reading as Buffer first allows graceful handling of non-UTF8 bytes
					// (they become U+FFFD replacement characters instead of throwing)
					const buffer = await fs.readFile(fullPath)
					const fileContent = buffer.toString("utf-8")
					const result = this.processTextFile(fileContent, entry)
					await task.fileContextTracker.trackFileContext(relPath, "read_tool")
					updateFileResult(relPath, {
						nativeContent: `File: ${relPath}\n${result}`,
					})
				} catch (error) {
					const errorMsg = error instanceof Error ? error.message : String(error)
					updateFileResult(relPath, {
						status: "error",
						error: `Error reading file: ${errorMsg}`,
						nativeContent: `File: ${relPath}\nError: ${errorMsg}`,
					})
					await task.say("error", `Error reading file ${relPath}: ${errorMsg}`)
				}
			}
			// Phase 4: Build and return result
			const hasErrors = fileResults.some((r) => r.status === "error" || r.status === "blocked")
			if (hasErrors) {
				task.didToolFailInCurrentTurn = true
			}
			this.buildAndPushResult(task, fileResults, pushToolResult)
		} catch (error) {
			const relPath = filePath || "unknown"
			const errorMsg = error instanceof Error ? error.message : String(error)
			updateFileResult(relPath, {
				status: "error",
				error: `Error reading file: ${errorMsg}`,
				nativeContent: `File: ${relPath}\nError: ${errorMsg}`,
			})
			await task.say("error", `Error reading file ${relPath}: ${errorMsg}`)
			task.didToolFailInCurrentTurn = true
			const errorResult = fileResults
				.filter((r) => r.nativeContent)
				.map((r) => r.nativeContent)
				.join("\n\n---\n\n")
			pushToolResult(errorResult || `Error: ${errorMsg}`)
		}
	}
	/**
	 * Process a text file according to the requested mode.
	 */
	processTextFile(content, entry) {
		const mode = entry.mode || "slice"
		if (mode === "indentation") {
			// Indentation mode: semantic block extraction
			// When anchor_line is not provided, default to offset (which defaults to 1)
			const anchorLine = entry.anchor_line ?? entry.offset ?? 1
			const result = (0, indentation_reader_1.readWithIndentation)(content, {
				anchorLine,
				maxLevels: entry.max_levels,
				includeSiblings: entry.include_siblings,
				includeHeader: entry.include_header,
				limit: entry.limit ?? read_file_1.DEFAULT_LINE_LIMIT,
				maxLines: entry.max_lines,
			})
			let output = result.content
			if (result.wasTruncated && result.includedRanges.length > 0) {
				const [start, end] = result.includedRanges[0]
				const nextOffset = end + 1
				const effectiveLimit = entry.limit ?? read_file_1.DEFAULT_LINE_LIMIT
				// Put truncation warning at TOP (before content) to match @ mention format
				output = `IMPORTANT: File content truncated.
	Status: Showing lines ${start}-${end} of ${result.totalLines} total lines.
	To read more: Use the read_file tool with offset=${nextOffset} and limit=${effectiveLimit}.
	
	${result.content}`
			} else if (result.includedRanges.length > 0) {
				const rangeStr = result.includedRanges.map(([s, e]) => `${s}-${e}`).join(", ")
				output += `\n\nIncluded ranges: ${rangeStr} (total: ${result.totalLines} lines)`
			}
			return output
		}
		// Slice mode (default): simple offset/limit reading
		// NOTE: read_file offset is 1-based externally; convert to 0-based for readWithSlice.
		const offset1 = entry.offset ?? 1
		const offset0 = Math.max(0, offset1 - 1)
		const limit = entry.limit ?? read_file_1.DEFAULT_LINE_LIMIT
		const result = (0, indentation_reader_1.readWithSlice)(content, offset0, limit)
		let output = result.content
		if (result.wasTruncated) {
			const startLine = offset1
			const endLine = offset1 + result.returnedLines - 1
			const nextOffset = endLine + 1
			// Put truncation warning at TOP (before content) to match @ mention format
			output = `IMPORTANT: File content truncated.
	Status: Showing lines ${startLine}-${endLine} of ${result.totalLines} total lines.
	To read more: Use the read_file tool with offset=${nextOffset} and limit=${limit}.
	
	${result.content}`
		} else if (result.returnedLines === 0) {
			output = "Note: File is empty"
		}
		return output
	}
	/**
	 * Handle binary file processing (images, PDF, DOCX, etc.).
	 */
	async handleBinaryFile(
		task,
		relPath,
		fullPath,
		supportsImages,
		maxImageFileSize,
		maxTotalImageSize,
		imageMemoryTracker,
		updateFileResult,
	) {
		const fileExtension = path_1.default.extname(relPath).toLowerCase()
		const supportedBinaryFormats = (0, extract_text_1.getSupportedBinaryFormats)()
		// Handle image files
		if ((0, imageHelpers_1.isSupportedImageFormat)(fileExtension)) {
			try {
				const validationResult = await (0, imageHelpers_1.validateImageForProcessing)(
					fullPath,
					supportsImages,
					maxImageFileSize,
					maxTotalImageSize,
					imageMemoryTracker.getTotalMemoryUsed(),
				)
				if (!validationResult.isValid) {
					await task.fileContextTracker.trackFileContext(relPath, "read_tool")
					updateFileResult(relPath, {
						nativeContent: `File: ${relPath}\nNote: ${validationResult.notice}`,
					})
					return
				}
				const imageResult = await (0, imageHelpers_1.processImageFile)(fullPath)
				imageMemoryTracker.addMemoryUsage(imageResult.sizeInMB)
				await task.fileContextTracker.trackFileContext(relPath, "read_tool")
				updateFileResult(relPath, {
					nativeContent: `File: ${relPath}\nNote: ${imageResult.notice}`,
					imageDataUrl: imageResult.dataUrl,
				})
				return
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error)
				updateFileResult(relPath, {
					status: "error",
					error: `Error reading image file: ${errorMsg}`,
					nativeContent: `File: ${relPath}\nError: ${errorMsg}`,
				})
				await task.say("error", `Error reading image file ${relPath}: ${errorMsg}`)
				return
			}
		}
		// Handle other supported binary formats (PDF, DOCX, etc.)
		if (supportedBinaryFormats && supportedBinaryFormats.includes(fileExtension)) {
			try {
				const content = await (0, extract_text_1.extractTextFromFile)(fullPath)
				const numberedContent = (0, extract_text_1.addLineNumbers)(content)
				const lineCount = content.split("\n").length
				await task.fileContextTracker.trackFileContext(relPath, "read_tool")
				updateFileResult(relPath, {
					nativeContent:
						lineCount > 0
							? `File: ${relPath}\nLines 1-${lineCount}:\n${numberedContent}`
							: `File: ${relPath}\nNote: File is empty`,
				})
				return
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error)
				updateFileResult(relPath, {
					status: "error",
					error: `Error extracting text: ${errorMsg}`,
					nativeContent: `File: ${relPath}\nError: ${errorMsg}`,
				})
				await task.say("error", `Error extracting text from ${relPath}: ${errorMsg}`)
				return
			}
		}
		// Unsupported binary format
		const fileFormat = fileExtension.slice(1) || "bin"
		updateFileResult(relPath, {
			notice: `Binary file format: ${fileFormat}`,
			nativeContent: `File: ${relPath}\nBinary file (${fileFormat}) - content not displayed`,
		})
	}
	/**
	 * Request user approval for file reads.
	 */
	async requestApproval(task, filesToApprove, updateFileResult) {
		if (filesToApprove.length === 0) return
		if (filesToApprove.length > 1) {
			// Batch approval
			const batchFiles = filesToApprove.map((fileResult) => {
				const relPath = fileResult.path
				const fullPath = path_1.default.resolve(task.cwd, relPath)
				const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(fullPath)
				const readablePath = (0, path_2.getReadablePath)(task.cwd, relPath)
				const lineSnippet = this.getLineSnippet(fileResult.entry)
				const key = `${readablePath}${lineSnippet ? ` (${lineSnippet})` : ""}`
				return { path: readablePath, lineSnippet, isOutsideWorkspace, key, content: fullPath }
			})
			const completeMessage = JSON.stringify({ tool: "readFile", batchFiles })
			const { response, text, images } = await task.ask("tool", completeMessage, false)
			if (response === "yesButtonClicked") {
				if (text) await task.say("user_feedback", text, images)
				filesToApprove.forEach((fr) => {
					updateFileResult(fr.path, { status: "approved", feedbackText: text, feedbackImages: images })
				})
			} else if (response === "noButtonClicked") {
				if (text) await task.say("user_feedback", text, images)
				task.didRejectTool = true
				filesToApprove.forEach((fr) => {
					updateFileResult(fr.path, {
						status: "denied",
						nativeContent: `File: ${fr.path}\nStatus: Denied by user`,
						feedbackText: text,
						feedbackImages: images,
					})
				})
			} else {
				// Individual permissions
				try {
					const individualPermissions = JSON.parse(text || "{}")
					let hasAnyDenial = false
					batchFiles.forEach((batchFile, index) => {
						const fileResult = filesToApprove[index]
						const approved = individualPermissions[batchFile.key] === true
						if (approved) {
							updateFileResult(fileResult.path, { status: "approved" })
						} else {
							hasAnyDenial = true
							updateFileResult(fileResult.path, {
								status: "denied",
								nativeContent: `File: ${fileResult.path}\nStatus: Denied by user`,
							})
						}
					})
					if (hasAnyDenial) task.didRejectTool = true
				} catch {
					task.didRejectTool = true
					filesToApprove.forEach((fr) => {
						updateFileResult(fr.path, {
							status: "denied",
							nativeContent: `File: ${fr.path}\nStatus: Denied by user`,
						})
					})
				}
			}
		} else {
			// Single file approval
			const fileResult = filesToApprove[0]
			const relPath = fileResult.path
			const fullPath = path_1.default.resolve(task.cwd, relPath)
			const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(fullPath)
			const lineSnippet = this.getLineSnippet(fileResult.entry)
			const startLine = this.getStartLine(fileResult.entry)
			const completeMessage = JSON.stringify({
				tool: "readFile",
				path: (0, path_2.getReadablePath)(task.cwd, relPath),
				isOutsideWorkspace,
				content: fullPath,
				reason: lineSnippet,
				startLine,
			})
			const { response, text, images } = await task.ask("tool", completeMessage, false)
			if (response !== "yesButtonClicked") {
				if (text) await task.say("user_feedback", text, images)
				task.didRejectTool = true
				updateFileResult(relPath, {
					status: "denied",
					nativeContent: `File: ${relPath}\nStatus: Denied by user`,
					feedbackText: text,
					feedbackImages: images,
				})
			} else {
				if (text) await task.say("user_feedback", text, images)
				updateFileResult(relPath, { status: "approved", feedbackText: text, feedbackImages: images })
			}
		}
	}
	/**
	 * Get the starting line number for navigation purposes.
	 */
	getStartLine(entry) {
		if (entry.mode === "indentation") {
			// For indentation mode, always return the effective anchor line
			return entry.anchor_line ?? entry.offset ?? 1
		}
		const offset = entry.offset ?? 1
		return offset > 1 ? offset : undefined
	}
	/**
	 * Generate a human-readable line snippet for approval messages.
	 */
	getLineSnippet(entry) {
		if (entry.mode === "indentation") {
			// Always show indentation mode with the effective anchor line
			const effectiveAnchor = entry.anchor_line ?? entry.offset ?? 1
			return `(indentation mode at line ${effectiveAnchor})`
		}
		const limit = entry.limit ?? read_file_1.DEFAULT_LINE_LIMIT
		const offset1 = entry.offset ?? 1
		if (offset1 > 1) {
			return `(lines ${offset1}-${offset1 + limit - 1})`
		}
		// Always show the line limit, even when using the default
		return `(up to ${limit} lines)`
	}
	/**
	 * Build and push the final result to the tool output.
	 */
	buildAndPushResult(task, fileResults, pushToolResult) {
		const finalResult = fileResults
			.filter((r) => r.nativeContent)
			.map((r) => r.nativeContent)
			.join("\n\n---\n\n")
		const fileImageUrls = fileResults.filter((r) => r.imageDataUrl).map((r) => r.imageDataUrl)
		let statusMessage = ""
		let feedbackImages = []
		const deniedWithFeedback = fileResults.find((r) => r.status === "denied" && r.feedbackText)
		if (deniedWithFeedback?.feedbackText) {
			statusMessage = responses_1.formatResponse.toolDeniedWithFeedback(deniedWithFeedback.feedbackText)
			feedbackImages = deniedWithFeedback.feedbackImages || []
		} else if (task.didRejectTool) {
			statusMessage = responses_1.formatResponse.toolDenied()
		} else {
			const approvedWithFeedback = fileResults.find((r) => r.status === "approved" && r.feedbackText)
			if (approvedWithFeedback?.feedbackText) {
				statusMessage = responses_1.formatResponse.toolApprovedWithFeedback(approvedWithFeedback.feedbackText)
				feedbackImages = approvedWithFeedback.feedbackImages || []
			}
		}
		const allImages = [...feedbackImages, ...fileImageUrls]
		const finalModelSupportsImages = task.api.getModel().info.supportsImages ?? false
		const imagesToInclude = finalModelSupportsImages ? allImages : []
		if (statusMessage || imagesToInclude.length > 0) {
			const result = responses_1.formatResponse.toolResult(
				statusMessage || finalResult,
				imagesToInclude.length > 0 ? imagesToInclude : undefined,
			)
			if (typeof result === "string") {
				pushToolResult(statusMessage ? `${result}\n${finalResult}` : result)
			} else {
				if (statusMessage) {
					const textBlock = { type: "text", text: finalResult }
					pushToolResult([...result, textBlock])
				} else {
					pushToolResult(result)
				}
			}
		} else {
			pushToolResult(finalResult)
		}
	}
	getReadFileToolDescription(blockName, second) {
		// If native typed args were provided
		if (second && typeof second === "object" && "path" in second && typeof second.path === "string") {
			return `[${blockName} for '${second.path}']`
		}
		const blockParams = second
		if (blockParams?.path) {
			return `[${blockName} for '${blockParams.path}']`
		}
		return `[${blockName} with missing path]`
	}
	async handlePartial(task, block) {
		// Handle both legacy and new format for partial display
		let filePath = ""
		if (block.nativeArgs) {
			if ((0, types_1.isLegacyReadFileParams)(block.nativeArgs)) {
				// Legacy format - show first file
				filePath = block.nativeArgs.files[0]?.path ?? ""
			} else {
				filePath = block.nativeArgs.path ?? ""
			}
		}
		const fullPath = filePath ? path_1.default.resolve(task.cwd, filePath) : ""
		const sharedMessageProps = {
			tool: "readFile",
			path: (0, path_2.getReadablePath)(task.cwd, filePath),
			isOutsideWorkspace: filePath ? (0, pathUtils_1.isPathOutsideWorkspace)(fullPath) : false,
		}
		const partialMessage = JSON.stringify({
			...sharedMessageProps,
			content: undefined,
		})
		await task.ask("tool", partialMessage, block.partial).catch(() => {})
	}
	/**
	 * Execute legacy multi-file format for backward compatibility.
	 * This handles the old format: { files: [{ path: string, lineRanges?: [...] }] }
	 */
	async executeLegacy(fileEntries, task, callbacks) {
		const { pushToolResult } = callbacks
		const modelInfo = task.api.getModel().info
		// Temporary indicator for testing legacy format detection
		console.warn("[read_file] Legacy format detected - using backward compatibility path")
		if (!fileEntries || fileEntries.length === 0) {
			task.consecutiveMistakeCount++
			task.recordToolError("read_file")
			const errorMsg = await task.sayAndCreateMissingParamError("read_file", "files")
			pushToolResult(`Error: ${errorMsg}`)
			return
		}
		const supportsImages = modelInfo.supportsImages ?? false
		// Process each file sequentially (legacy behavior)
		const results = []
		for (const entry of fileEntries) {
			const relPath = entry.path
			const fullPath = path_1.default.resolve(task.cwd, relPath)
			// RooIgnore validation
			const accessAllowed = task.aliIgnoreController?.validateAccess(relPath)
			if (!accessAllowed) {
				await task.say("rooignore_error", relPath)
				const errorMsg = responses_1.formatResponse.rooIgnoreError(relPath)
				results.push(`File: ${relPath}\nError: ${errorMsg}`)
				continue
			}
			// Request approval for single file
			const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(fullPath)
			let lineSnippet = ""
			if (entry.lineRanges && entry.lineRanges.length > 0) {
				const ranges = entry.lineRanges.map((range) => `(lines ${range.start}-${range.end})`)
				lineSnippet = ranges.join(", ")
			}
			const completeMessage = JSON.stringify({
				tool: "readFile",
				path: (0, path_2.getReadablePath)(task.cwd, relPath),
				isOutsideWorkspace,
				content: fullPath,
				reason: lineSnippet || undefined,
			})
			const { response, text, images } = await task.ask("tool", completeMessage, false)
			if (response !== "yesButtonClicked") {
				if (text) await task.say("user_feedback", text, images)
				task.didRejectTool = true
				results.push(`File: ${relPath}\nStatus: Denied by user`)
				continue
			}
			if (text) await task.say("user_feedback", text, images)
			try {
				// Check if the path is a directory
				const stats = await fs.stat(fullPath)
				if (stats.isDirectory()) {
					const errorMsg = `Cannot read '${relPath}' because it is a directory.`
					results.push(`File: ${relPath}\nError: ${errorMsg}`)
					await task.say("error", `Error reading file ${relPath}: ${errorMsg}`)
					continue
				}
				const isBinary = await (0, isbinaryfile_1.isBinaryFile)(fullPath).catch(() => false)
				if (isBinary) {
					// Handle binary files (images)
					const fileExtension = path_1.default.extname(relPath).toLowerCase()
					if (supportsImages && (0, imageHelpers_1.isSupportedImageFormat)(fileExtension)) {
						const state = await task.providerRef.deref()?.getState()
						const {
							maxImageFileSize = imageHelpers_1.DEFAULT_MAX_IMAGE_FILE_SIZE_MB,
							maxTotalImageSize = imageHelpers_1.DEFAULT_MAX_TOTAL_IMAGE_SIZE_MB,
						} = state ?? {}
						const validation = await (0, imageHelpers_1.validateImageForProcessing)(
							fullPath,
							supportsImages,
							maxImageFileSize,
							maxTotalImageSize,
							0,
						)
						if (!validation.isValid) {
							results.push(`File: ${relPath}\nNotice: ${validation.notice ?? "Image validation failed"}`)
							continue
						}
						const imageResult = await (0, imageHelpers_1.processImageFile)(fullPath)
						if (imageResult) {
							results.push(`File: ${relPath}\n[Image file - content processed for vision model]`)
						}
					} else {
						results.push(`File: ${relPath}\nError: Cannot read binary file`)
					}
					continue
				}
				// Read text file
				const rawContent = await fs.readFile(fullPath, "utf8")
				// Handle line ranges if specified
				let content
				if (entry.lineRanges && entry.lineRanges.length > 0) {
					const lines = rawContent.split("\n")
					const selectedLines = []
					for (const range of entry.lineRanges) {
						// Convert to 0-based index, ranges are 1-based inclusive
						const startIdx = Math.max(0, range.start - 1)
						const endIdx = Math.min(lines.length - 1, range.end - 1)
						for (let i = startIdx; i <= endIdx; i++) {
							selectedLines.push(`${i + 1} | ${lines[i]}`)
						}
					}
					content = selectedLines.join("\n")
				} else {
					// Read with default limits using slice mode
					const result = (0, indentation_reader_1.readWithSlice)(
						rawContent,
						0,
						read_file_1.DEFAULT_LINE_LIMIT,
					)
					content = result.content
					if (result.wasTruncated) {
						content += `\n\n[File truncated: showing ${result.returnedLines} of ${result.totalLines} total lines]`
					}
				}
				results.push(`File: ${relPath}\n${content}`)
				// Track file in context
				await task.fileContextTracker.trackFileContext(relPath, "read_tool")
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error)
				results.push(`File: ${relPath}\nError: ${errorMsg}`)
				await task.say("error", `Error reading file ${relPath}: ${errorMsg}`)
			}
		}
		// Push combined results
		pushToolResult(results.join("\n\n---\n\n"))
	}
}
exports.ReadFileTool = ReadFileTool
exports.readFileTool = new ReadFileTool()
