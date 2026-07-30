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
exports.FileContextTracker = void 0
const safeWriteJson_1 = require("../../utils/safeWriteJson")
const path = __importStar(require("path"))
const vscode = __importStar(require("vscode"))
const storage_1 = require("../../utils/storage")
const globalFileNames_1 = require("../../shared/globalFileNames")
const fs_1 = require("../../utils/fs")
const promises_1 = __importDefault(require("fs/promises"))
// This class is responsible for tracking file operations that may result in stale context.
// If a user modifies a file outside of Ali, the context may become stale and need to be updated.
// We do not want Ali to reload the context every time a file is modified, so we use this class merely
// to inform Ali that the change has occurred, and tell Ali to reload the file before making
// any changes to it. This fixes an issue with diff editing, where Ali was unable to complete a diff edit.
// FileContextTracker
//
// This class is responsible for tracking file operations.
// If the full contents of a file are passed to Ali via a tool, mention, or edit, the file is marked as active.
// If a file is modified outside of Ali, we detect and track this change to prevent stale context.
class FileContextTracker {
	taskId
	providerRef
	// File tracking and watching
	fileWatchers = new Map()
	recentlyModifiedFiles = new Set()
	recentlyEditedByAli = new Set()
	checkpointPossibleFiles = new Set()
	constructor(provider, taskId) {
		this.providerRef = new WeakRef(provider)
		this.taskId = taskId
	}
	// Gets the current working directory or returns undefined if it cannot be determined
	getCwd() {
		const cwd = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath).at(0)
		if (!cwd) {
			console.info("No workspace folder available - cannot determine current working directory")
		}
		return cwd
	}
	// File watchers are set up for each file that is tracked in the task metadata.
	async setupFileWatcher(filePath) {
		// Only setup watcher if it doesn't already exist for this file
		if (this.fileWatchers.has(filePath)) {
			return
		}
		const cwd = this.getCwd()
		if (!cwd) {
			return
		}
		// Create a file system watcher for this specific file
		const fileUri = vscode.Uri.file(path.resolve(cwd, filePath))
		const watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(path.dirname(fileUri.fsPath), path.basename(fileUri.fsPath)),
		)
		// Track file changes
		watcher.onDidChange(() => {
			if (this.recentlyEditedByAli.has(filePath)) {
				this.recentlyEditedByAli.delete(filePath) // This was an edit by Ali, no need to inform Ali
			} else {
				this.recentlyModifiedFiles.add(filePath) // This was a user edit, we will inform Ali
				this.trackFileContext(filePath, "user_edited") // Update the task metadata with file tracking
			}
		})
		// Store the watcher so we can dispose it later
		this.fileWatchers.set(filePath, watcher)
	}
	// Tracks a file operation in metadata and sets up a watcher for the file
	// This is the main entry point for FileContextTracker and is called when a file is passed to Ali via a tool, mention, or edit.
	async trackFileContext(filePath, operation) {
		try {
			const cwd = this.getCwd()
			if (!cwd) {
				return
			}
			await this.addFileToFileContextTracker(this.taskId, filePath, operation)
			// Set up file watcher for this file
			await this.setupFileWatcher(filePath)
		} catch (error) {
			console.error("Failed to track file operation:", error)
		}
	}
	getContextProxy() {
		const provider = this.providerRef.deref()
		if (!provider) {
			console.error("ClineProvider reference is no longer valid")
			return undefined
		}
		const context = provider.contextProxy
		if (!context) {
			console.error("Context is not available")
			return undefined
		}
		return context
	}
	// Gets task metadata from storage
	async getTaskMetadata(taskId) {
		const globalStoragePath = this.getContextProxy()?.globalStorageUri.fsPath ?? ""
		const taskDir = await (0, storage_1.getTaskDirectoryPath)(globalStoragePath, taskId)
		const filePath = path.join(taskDir, globalFileNames_1.GlobalFileNames.taskMetadata)
		try {
			if (await (0, fs_1.fileExistsAtPath)(filePath)) {
				return JSON.parse(await promises_1.default.readFile(filePath, "utf8"))
			}
		} catch (error) {
			console.error("Failed to read task metadata:", error)
		}
		return { files_in_context: [] }
	}
	// Saves task metadata to storage
	async saveTaskMetadata(taskId, metadata) {
		try {
			const globalStoragePath = this.getContextProxy().globalStorageUri.fsPath
			const taskDir = await (0, storage_1.getTaskDirectoryPath)(globalStoragePath, taskId)
			const filePath = path.join(taskDir, globalFileNames_1.GlobalFileNames.taskMetadata)
			await (0, safeWriteJson_1.safeWriteJson)(filePath, metadata)
		} catch (error) {
			console.error("Failed to save task metadata:", error)
		}
	}
	// Adds a file to the metadata tracker
	// This handles the business logic of determining if the file is new, stale, or active.
	// It also updates the metadata with the latest read/edit dates.
	async addFileToFileContextTracker(taskId, filePath, source) {
		try {
			const metadata = await this.getTaskMetadata(taskId)
			const now = Date.now()
			// Mark existing entries for this file as stale
			metadata.files_in_context.forEach((entry) => {
				if (entry.path === filePath && entry.record_state === "active") {
					entry.record_state = "stale"
				}
			})
			// Helper to get the latest date for a specific field and file
			const getLatestDateForField = (path, field) => {
				const relevantEntries = metadata.files_in_context
					.filter((entry) => entry.path === path && entry[field])
					.sort((a, b) => b[field] - a[field])
				return relevantEntries.length > 0 ? relevantEntries[0][field] : null
			}
			let newEntry = {
				path: filePath,
				record_state: "active",
				record_source: source,
				roo_read_date: getLatestDateForField(filePath, "roo_read_date"),
				roo_edit_date: getLatestDateForField(filePath, "roo_edit_date"),
				user_edit_date: getLatestDateForField(filePath, "user_edit_date"),
			}
			switch (source) {
				// user_edited: The user has edited the file
				case "user_edited":
					newEntry.user_edit_date = now
					this.recentlyModifiedFiles.add(filePath)
					break
				// roo_edited: Ali has edited the file
				case "roo_edited":
					newEntry.roo_read_date = now
					newEntry.roo_edit_date = now
					this.checkpointPossibleFiles.add(filePath)
					this.markFileAsEditedByAli(filePath)
					break
				// read_tool/file_mentioned: Ali has read the file via a tool or file mention
				case "read_tool":
				case "file_mentioned":
					newEntry.roo_read_date = now
					break
			}
			metadata.files_in_context.push(newEntry)
			await this.saveTaskMetadata(taskId, metadata)
		} catch (error) {
			console.error("Failed to add file to metadata:", error)
		}
	}
	// Returns (and then clears) the set of recently modified files
	getAndClearRecentlyModifiedFiles() {
		const files = Array.from(this.recentlyModifiedFiles)
		this.recentlyModifiedFiles.clear()
		return files
	}
	/**
	 * Gets a list of unique file paths that Ali has read during this task.
	 * Files are sorted by most recently read first, so if there's a character
	 * budget during folded context generation, the most relevant (recent) files
	 * are prioritized.
	 *
	 * @param sinceTimestamp - Optional timestamp to filter files read after this time
	 * @returns Array of unique file paths that have been read, most recent first
	 */
	async getFilesReadByAli(sinceTimestamp) {
		try {
			const metadata = await this.getTaskMetadata(this.taskId)
			const readEntries = metadata.files_in_context.filter((entry) => {
				// Only include files that were read by Ali (not user edits)
				const isReadByAli = entry.record_source === "read_tool" || entry.record_source === "file_mentioned"
				if (!isReadByAli) {
					return false
				}
				// If sinceTimestamp is provided, only include files read after that time
				if (sinceTimestamp && entry.roo_read_date) {
					return entry.roo_read_date >= sinceTimestamp
				}
				return true
			})
			// Sort by roo_read_date descending (most recent first)
			// Entries without a date go to the end
			readEntries.sort((a, b) => {
				const dateA = a.roo_read_date ?? 0
				const dateB = b.roo_read_date ?? 0
				return dateB - dateA
			})
			// Deduplicate while preserving order (first occurrence = most recent read)
			const seen = new Set()
			const uniquePaths = []
			for (const entry of readEntries) {
				if (!seen.has(entry.path)) {
					seen.add(entry.path)
					uniquePaths.push(entry.path)
				}
			}
			return uniquePaths
		} catch (error) {
			console.error("Failed to get files read by Ali:", error)
			return []
		}
	}
	getAndClearCheckpointPossibleFile() {
		const files = Array.from(this.checkpointPossibleFiles)
		this.checkpointPossibleFiles.clear()
		return files
	}
	// Marks a file as edited by Ali to prevent false positives in file watchers
	markFileAsEditedByAli(filePath) {
		this.recentlyEditedByAli.add(filePath)
	}
	// Disposes all file watchers
	dispose() {
		for (const watcher of this.fileWatchers.values()) {
			watcher.dispose()
		}
		this.fileWatchers.clear()
	}
}
exports.FileContextTracker = FileContextTracker
