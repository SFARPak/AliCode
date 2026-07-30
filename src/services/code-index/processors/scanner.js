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
exports.DirectoryScanner = void 0
const list_files_1 = require("../../glob/list-files")
const AliIgnoreController_1 = require("../../../core/ignore/AliIgnoreController")
const promises_1 = require("fs/promises")
const path = __importStar(require("path"))
const get_relative_path_1 = require("../shared/get-relative-path")
const path_1 = require("../../../utils/path")
const supported_extensions_1 = require("../shared/supported-extensions")
const vscode = __importStar(require("vscode"))
const crypto_1 = require("crypto")
const uuid_1 = require("uuid")
const p_limit_1 = __importDefault(require("p-limit"))
const async_mutex_1 = require("async-mutex")
const i18n_1 = require("../../../i18n")
const constants_1 = require("../constants")
const ignore_utils_1 = require("../../glob/ignore-utils")
const package_1 = require("../../../shared/package")
class DirectoryScanner {
	embedder
	qdrantClient
	codeParser
	cacheManager
	ignoreInstance
	batchSegmentThreshold
	constructor(embedder, qdrantClient, codeParser, cacheManager, ignoreInstance, batchSegmentThreshold) {
		this.embedder = embedder
		this.qdrantClient = qdrantClient
		this.codeParser = codeParser
		this.cacheManager = cacheManager
		this.ignoreInstance = ignoreInstance
		// Get the configurable batch size from VSCode settings, fallback to default
		// If not provided in constructor, try to get from VSCode settings
		if (batchSegmentThreshold !== undefined) {
			this.batchSegmentThreshold = batchSegmentThreshold
		} else {
			try {
				this.batchSegmentThreshold = vscode.workspace
					.getConfiguration(package_1.Package.name)
					.get("codeIndex.embeddingBatchSize", constants_1.BATCH_SEGMENT_THRESHOLD)
			} catch {
				// In test environment, vscode.workspace might not be available
				this.batchSegmentThreshold = constants_1.BATCH_SEGMENT_THRESHOLD
			}
		}
	}
	/**
	 * Recursively scans a directory for code blocks in supported files.
	 * @param directoryPath The directory to scan
	 * @param aliIgnoreController Optional AliIgnoreController instance for filtering
	 * @param context VS Code ExtensionContext for cache storage
	 * @param onError Optional error handler callback
	 * @returns Promise<{codeBlocks: CodeBlock[], stats: {processed: number, skipped: number}}> Array of parsed code blocks and processing stats
	 */
	async scanDirectory(directory, onError, onBlocksIndexed, onFileParsed, signal) {
		const directoryPath = directory
		// Capture workspace context at scan start
		const scanWorkspace = (0, path_1.getWorkspacePathForContext)(directoryPath)
		// Get all files recursively (handles .gitignore automatically)
		const [allPaths, _] = await (0, list_files_1.listFiles)(
			directoryPath,
			true,
			constants_1.MAX_LIST_FILES_LIMIT_CODE_INDEX,
		)
		// Filter out directories (marked with trailing '/')
		const filePaths = allPaths.filter((p) => !p.endsWith("/"))
		// Initialize AliIgnoreController if not provided
		const ignoreController = new AliIgnoreController_1.AliIgnoreController(directoryPath)
		await ignoreController.initialize()
		// Filter paths using .aliignore
		const allowedPaths = ignoreController.filterPaths(filePaths)
		// Filter by supported extensions, ignore patterns, and excluded directories
		const supportedPaths = allowedPaths.filter((filePath) => {
			const ext = path.extname(filePath).toLowerCase()
			const relativeFilePath = (0, get_relative_path_1.generateRelativeFilePath)(filePath, scanWorkspace)
			// Check if file is in an ignored directory using the shared helper
			// Use relative path to avoid matching parent directories outside the workspace
			if ((0, ignore_utils_1.isPathInIgnoredDirectory)(relativeFilePath)) {
				return false
			}
			return (
				supported_extensions_1.scannerExtensions.includes(ext) && !this.ignoreInstance.ignores(relativeFilePath)
			)
		})
		// Initialize tracking variables
		const processedFiles = new Set()
		let processedCount = 0
		let skippedCount = 0
		// Initialize parallel processing tools
		const parseLimiter = (0, p_limit_1.default)(constants_1.PARSING_CONCURRENCY) // Concurrency for file parsing
		const batchLimiter = (0, p_limit_1.default)(constants_1.BATCH_PROCESSING_CONCURRENCY) // Concurrency for batch processing
		const mutex = new async_mutex_1.Mutex()
		// Shared batch accumulators (protected by mutex)
		let currentBatchBlocks = []
		let currentBatchTexts = []
		let currentBatchFileInfos = []
		const activeBatchPromises = new Set()
		let pendingBatchCount = 0
		// Initialize block counter
		let totalBlockCount = 0
		// Process all files in parallel with concurrency control
		const parsePromises = supportedPaths.map((filePath) =>
			parseLimiter(async () => {
				// Check abort signal before processing each file
				if (signal?.aborted) return
				try {
					// Check file size
					const stats = await (0, promises_1.stat)(filePath)
					if (stats.size > constants_1.MAX_FILE_SIZE_BYTES) {
						skippedCount++ // Skip large files
						return
					}
					// Read file content
					const content = await vscode.workspace.fs
						.readFile(vscode.Uri.file(filePath))
						.then((buffer) => Buffer.from(buffer).toString("utf-8"))
					// Calculate current hash
					const currentFileHash = (0, crypto_1.createHash)("sha256").update(content).digest("hex")
					processedFiles.add(filePath)
					// Check against cache
					const cachedFileHash = this.cacheManager.getHash(filePath)
					const isNewFile = !cachedFileHash
					if (cachedFileHash === currentFileHash) {
						// File is unchanged
						skippedCount++
						return
					}
					// File is new or changed - parse it using the injected parser function
					const blocks = await this.codeParser.parseFile(filePath, { content, fileHash: currentFileHash })
					const fileBlockCount = blocks.length
					onFileParsed?.(fileBlockCount)
					processedCount++
					// Process embeddings if configured
					if (this.embedder && this.qdrantClient && blocks.length > 0) {
						// Add to batch accumulators
						let addedBlocksFromFile = false
						for (const block of blocks) {
							const trimmedContent = block.content.trim()
							if (trimmedContent) {
								const release = await mutex.acquire()
								try {
									currentBatchBlocks.push(block)
									currentBatchTexts.push(trimmedContent)
									addedBlocksFromFile = true
									// Check if batch threshold is met
									// Check abort signal before dispatching batch
									if (signal?.aborted) {
										throw new DOMException("Indexing aborted", "AbortError")
									}
									if (currentBatchBlocks.length >= this.batchSegmentThreshold) {
										// Wait if we've reached the maximum pending batches
										while (pendingBatchCount >= constants_1.MAX_PENDING_BATCHES) {
											if (signal?.aborted) {
												throw new DOMException("Indexing aborted", "AbortError")
											}
											await Promise.race(activeBatchPromises)
										}
										// Copy current batch data and clear accumulators
										const batchBlocks = [...currentBatchBlocks]
										const batchTexts = [...currentBatchTexts]
										const batchFileInfos = [...currentBatchFileInfos]
										currentBatchBlocks = []
										currentBatchTexts = []
										currentBatchFileInfos = []
										// Increment pending batch count
										pendingBatchCount++
										// Queue batch processing
										const batchPromise = batchLimiter(() =>
											this.processBatch(
												batchBlocks,
												batchTexts,
												batchFileInfos,
												scanWorkspace,
												onError,
												onBlocksIndexed,
											),
										)
										activeBatchPromises.add(batchPromise)
										// Clean up completed promises to prevent memory accumulation
										batchPromise.finally(() => {
											activeBatchPromises.delete(batchPromise)
											pendingBatchCount--
										})
									}
								} finally {
									release()
								}
							}
						}
						// Add file info once per file (outside the block loop)
						if (addedBlocksFromFile) {
							const release = await mutex.acquire()
							try {
								totalBlockCount += fileBlockCount
								currentBatchFileInfos.push({
									filePath,
									fileHash: currentFileHash,
									isNew: isNewFile,
								})
							} finally {
								release()
							}
						}
					} else {
						// Only update hash if not being processed in a batch
						await this.cacheManager.updateHash(filePath, currentFileHash)
					}
				} catch (error) {
					// Re-throw AbortError — it's not a file processing error, just a user-initiated stop
					if (error instanceof DOMException && error.name === "AbortError") {
						throw error
					}
					console.error(`Error processing file ${filePath} in workspace ${scanWorkspace}:`, error)
					if (onError) {
						onError(
							error instanceof Error
								? new Error(`${error.message} (Workspace: ${scanWorkspace}, File: ${filePath})`)
								: new Error(
										(0, i18n_1.t)("embeddings:scanner.unknownErrorProcessingFile", { filePath }) +
											` (Workspace: ${scanWorkspace})`,
									),
						)
					}
				}
			}),
		)
		// Wait for all parsing to complete
		await Promise.all(parsePromises)
		// Check abort signal before processing remaining batch
		if (signal?.aborted) {
			return {
				stats: {
					processed: processedCount,
					skipped: skippedCount,
				},
				totalBlockCount,
			}
		}
		// Process any remaining items in batch
		if (currentBatchBlocks.length > 0) {
			const release = await mutex.acquire()
			try {
				// Copy current batch data and clear accumulators
				const batchBlocks = [...currentBatchBlocks]
				const batchTexts = [...currentBatchTexts]
				const batchFileInfos = [...currentBatchFileInfos]
				currentBatchBlocks = []
				currentBatchTexts = []
				currentBatchFileInfos = []
				// Increment pending batch count for final batch
				pendingBatchCount++
				// Queue final batch processing
				const batchPromise = batchLimiter(() =>
					this.processBatch(batchBlocks, batchTexts, batchFileInfos, scanWorkspace, onError, onBlocksIndexed),
				)
				activeBatchPromises.add(batchPromise)
				// Clean up completed promises to prevent memory accumulation
				batchPromise.finally(() => {
					activeBatchPromises.delete(batchPromise)
					pendingBatchCount--
				})
			} finally {
				release()
			}
		}
		// Wait for all batch processing to complete
		await Promise.all(activeBatchPromises)
		// Check abort signal before handling deleted files
		if (signal?.aborted) {
			return {
				stats: {
					processed: processedCount,
					skipped: skippedCount,
				},
				totalBlockCount,
			}
		}
		// Handle deleted files
		const oldHashes = this.cacheManager.getAllHashes()
		for (const cachedFilePath of Object.keys(oldHashes)) {
			if (!processedFiles.has(cachedFilePath)) {
				// File was deleted or is no longer supported/indexed
				if (this.qdrantClient) {
					try {
						await this.qdrantClient.deletePointsByFilePath(cachedFilePath)
						await this.cacheManager.deleteHash(cachedFilePath)
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error)
						console.error(
							`[DirectoryScanner] Failed to delete points for ${cachedFilePath} in workspace ${scanWorkspace}:`,
							error,
						)
						if (onError) {
							onError(
								error instanceof Error
									? new Error(
											`${error.message} (Workspace: ${scanWorkspace}, File: ${cachedFilePath})`,
										)
									: new Error(
											(0, i18n_1.t)("embeddings:scanner.unknownErrorDeletingPoints", {
												filePath: cachedFilePath,
											}) + ` (Workspace: ${scanWorkspace})`,
										),
							)
						}
						// Log error and continue processing instead of re-throwing
						console.error(`Failed to delete points for removed file: ${cachedFilePath}`, errorMessage)
					}
				}
			}
		}
		return {
			stats: {
				processed: processedCount,
				skipped: skippedCount,
			},
			totalBlockCount,
		}
	}
	async processBatch(batchBlocks, batchTexts, batchFileInfos, scanWorkspace, onError, onBlocksIndexed) {
		if (batchBlocks.length === 0) return
		let attempts = 0
		let success = false
		let lastError = null
		while (attempts < constants_1.MAX_BATCH_RETRIES && !success) {
			attempts++
			try {
				// --- Deletion Step ---
				const uniqueFilePaths = [
					...new Set(
						batchFileInfos
							.filter((info) => !info.isNew) // Only modified files (not new)
							.map((info) => info.filePath),
					),
				]
				if (uniqueFilePaths.length > 0) {
					try {
						await this.qdrantClient.deletePointsByMultipleFilePaths(uniqueFilePaths)
					} catch (deleteError) {
						const errorMessage = deleteError instanceof Error ? deleteError.message : String(deleteError)
						console.error(
							`[DirectoryScanner] Failed to delete points for ${uniqueFilePaths.length} files before upsert in workspace ${scanWorkspace}:`,
							deleteError,
						)
						// Re-throw with workspace context
						throw new Error(
							`Failed to delete points for ${uniqueFilePaths.length} files. Workspace: ${scanWorkspace}. ${errorMessage}`,
							{ cause: deleteError },
						)
					}
				}
				// --- End Deletion Step ---
				// Create embeddings for batch
				const { embeddings } = await this.embedder.createEmbeddings(batchTexts)
				// Prepare points for Qdrant
				const points = batchBlocks.map((block, index) => {
					const normalizedAbsolutePath = (0, get_relative_path_1.generateNormalizedAbsolutePath)(
						block.file_path,
						scanWorkspace,
					)
					// Use segmentHash for unique ID generation to handle multiple segments from same line
					const pointId = (0, uuid_1.v5)(block.segmentHash, constants_1.QDRANT_CODE_BLOCK_NAMESPACE)
					return {
						id: pointId,
						vector: embeddings[index],
						payload: {
							filePath: (0, get_relative_path_1.generateRelativeFilePath)(
								normalizedAbsolutePath,
								scanWorkspace,
							),
							codeChunk: block.content,
							startLine: block.start_line,
							endLine: block.end_line,
							segmentHash: block.segmentHash,
						},
					}
				})
				// Upsert points to Qdrant
				await this.qdrantClient.upsertPoints(points)
				onBlocksIndexed?.(batchBlocks.length)
				// Update hashes for successfully processed files in this batch
				for (const fileInfo of batchFileInfos) {
					await this.cacheManager.updateHash(fileInfo.filePath, fileInfo.fileHash)
				}
				success = true
			} catch (error) {
				lastError = error
				console.error(
					`[DirectoryScanner] Error processing batch (attempt ${attempts}) in workspace ${scanWorkspace}:`,
					error,
				)
				if (attempts < constants_1.MAX_BATCH_RETRIES) {
					const delay = constants_1.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempts - 1)
					await new Promise((resolve) => setTimeout(resolve, delay))
				}
			}
		}
		if (!success && lastError) {
			console.error(`[DirectoryScanner] Failed to process batch after ${constants_1.MAX_BATCH_RETRIES} attempts`)
			if (onError) {
				// Preserve the original error message from embedders which now have detailed i18n messages
				const errorMessage = lastError.message || "Unknown error"
				// For other errors, provide context
				onError(
					new Error(
						(0, i18n_1.t)("embeddings:scanner.failedToProcessBatchWithError", {
							maxRetries: constants_1.MAX_BATCH_RETRIES,
							errorMessage,
						}),
					),
				)
			}
		}
	}
}
exports.DirectoryScanner = DirectoryScanner
