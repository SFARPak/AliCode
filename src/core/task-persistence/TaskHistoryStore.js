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
exports.TaskHistoryStore = void 0
const fs = __importStar(require("fs/promises"))
const fsSync = __importStar(require("fs"))
const path = __importStar(require("path"))
const globalFileNames_1 = require("../../shared/globalFileNames")
const safeWriteJson_1 = require("../../utils/safeWriteJson")
const storage_1 = require("../../utils/storage")
class TaskHistoryStore {
	globalStoragePath
	onWrite
	cache = new Map()
	writeLock = Promise.resolve()
	indexWriteTimer = null
	fsWatcher = null
	reconcileTimer = null
	disposed = false
	/**
	 * Promise that resolves when initialization is complete.
	 * Callers can await this to ensure the store is ready before reading.
	 */
	initialized
	resolveInitialized
	/** Debounce window for index writes in milliseconds. */
	static INDEX_WRITE_DEBOUNCE_MS = 2000
	/** Periodic reconciliation interval in milliseconds. */
	static RECONCILE_INTERVAL_MS = 5 * 60 * 1000
	constructor(globalStoragePath, options) {
		this.globalStoragePath = globalStoragePath
		this.onWrite = options?.onWrite
		this.initialized = new Promise((resolve) => {
			this.resolveInitialized = resolve
		})
	}
	// ────────────────────────────── Lifecycle ──────────────────────────────
	/**
	 * Load index, reconcile if needed, start watchers.
	 */
	async initialize() {
		try {
			const tasksDir = await this.getTasksDir()
			await fs.mkdir(tasksDir, { recursive: true })
			// 1. Load existing index into the cache
			await this.loadIndex()
			// 2. Reconcile cache against actual task directories on disk
			await this.reconcile()
			// 3. Start fs.watch for cross-instance reactivity
			this.startWatcher()
			// 4. Start periodic reconciliation as a defensive fallback
			this.startPeriodicReconciliation()
		} finally {
			// Mark initialization as complete so callers awaiting `initialized` can proceed
			this.resolveInitialized()
		}
	}
	/**
	 * Flush pending writes, clear watchers, release resources.
	 */
	dispose() {
		this.disposed = true
		if (this.indexWriteTimer) {
			clearTimeout(this.indexWriteTimer)
			this.indexWriteTimer = null
		}
		if (this.reconcileTimer) {
			clearTimeout(this.reconcileTimer)
			this.reconcileTimer = null
		}
		if (this.fsWatcher) {
			this.fsWatcher.close()
			this.fsWatcher = null
		}
		// Synchronously flush the index (best-effort)
		this.flushIndex().catch((err) => {
			console.error("[TaskHistoryStore] Error flushing index on dispose:", err)
		})
	}
	// ────────────────────────────── Reads ──────────────────────────────
	/**
	 * Get a single history item by task ID.
	 */
	get(taskId) {
		return this.cache.get(taskId)
	}
	/**
	 * Get all history items, sorted by timestamp descending (newest first).
	 */
	getAll() {
		return Array.from(this.cache.values()).sort((a, b) => b.ts - a.ts)
	}
	/**
	 * Get history items filtered by workspace path.
	 */
	getByWorkspace(workspace) {
		return this.getAll().filter((item) => item.workspace === workspace)
	}
	// ────────────────────────────── Mutations ──────────────────────────────
	/**
	 * Insert or update a history item.
	 *
	 * Writes the per-task file immediately (source of truth),
	 * updates the in-memory Map, and schedules a debounced index write.
	 */
	async upsert(item) {
		return this.withLock(async () => {
			const existing = this.cache.get(item.id)
			// Merge: preserve existing metadata unless explicitly overwritten
			const merged = existing ? { ...existing, ...item } : item
			// Write per-task file (source of truth)
			await this.writeTaskFile(merged)
			// Update in-memory cache
			this.cache.set(merged.id, merged)
			// Schedule debounced index write
			this.scheduleIndexWrite()
			const all = this.getAll()
			// Call onWrite callback inside the lock for serialized write-through
			if (this.onWrite) {
				await this.onWrite(all)
			}
			return all
		})
	}
	/**
	 * Delete a single task's history item.
	 */
	async delete(taskId) {
		return this.withLock(async () => {
			this.cache.delete(taskId)
			// Remove per-task file (best-effort)
			try {
				const filePath = await this.getTaskFilePath(taskId)
				await fs.unlink(filePath)
			} catch {
				// File may already be deleted
			}
			this.scheduleIndexWrite()
			// Call onWrite callback inside the lock for serialized write-through
			if (this.onWrite) {
				await this.onWrite(this.getAll())
			}
		})
	}
	/**
	 * Delete multiple tasks' history items in a batch.
	 */
	async deleteMany(taskIds) {
		return this.withLock(async () => {
			for (const taskId of taskIds) {
				this.cache.delete(taskId)
				try {
					const filePath = await this.getTaskFilePath(taskId)
					await fs.unlink(filePath)
				} catch {
					// File may already be deleted
				}
			}
			this.scheduleIndexWrite()
			// Call onWrite callback inside the lock for serialized write-through
			if (this.onWrite) {
				await this.onWrite(this.getAll())
			}
		})
	}
	// ────────────────────────────── Reconciliation ──────────────────────────────
	/**
	 * Scan task directories vs index and fix any drift.
	 *
	 * - Tasks on disk but missing from cache: read and add
	 * - Tasks in cache but missing from disk: remove
	 */
	async reconcile() {
		// Run through the write lock to prevent interleaving with upsert/delete
		return this.withLock(async () => {
			const tasksDir = await this.getTasksDir()
			let dirEntries
			try {
				dirEntries = await fs.readdir(tasksDir)
			} catch {
				return // tasks dir doesn't exist yet
			}
			// Filter out the index file and hidden files
			const taskDirNames = dirEntries.filter((name) => !name.startsWith("_") && !name.startsWith("."))
			const onDiskIds = new Set(taskDirNames)
			const cacheIds = new Set(this.cache.keys())
			let changed = false
			// Tasks on disk but not in cache: read their history_item.json
			for (const taskId of onDiskIds) {
				if (!cacheIds.has(taskId)) {
					try {
						const item = await this.readTaskFile(taskId)
						if (item) {
							this.cache.set(taskId, item)
							changed = true
						}
					} catch {
						// Corrupted or missing file, skip
					}
				}
			}
			// Tasks in cache but not on disk: remove from cache
			for (const taskId of cacheIds) {
				if (!onDiskIds.has(taskId)) {
					this.cache.delete(taskId)
					changed = true
				}
			}
			if (changed) {
				this.scheduleIndexWrite()
			}
		})
	}
	// ────────────────────────────── Cache invalidation ──────────────────────────────
	/**
	 * Invalidate a single task's cache entry (re-read from disk on next access).
	 */
	async invalidate(taskId) {
		try {
			const item = await this.readTaskFile(taskId)
			if (item) {
				this.cache.set(taskId, item)
			} else {
				this.cache.delete(taskId)
			}
		} catch {
			this.cache.delete(taskId)
		}
	}
	/**
	 * Clear all in-memory cache and reload from index.
	 */
	invalidateAll() {
		this.cache.clear()
	}
	// ────────────────────────────── Migration ──────────────────────────────
	/**
	 * Migrate from globalState taskHistory array to per-task files.
	 *
	 * For each entry in the globalState array, writes a `history_item.json`
	 * file if one doesn't already exist. This is idempotent and safe to re-run.
	 */
	async migrateFromGlobalState(taskHistoryEntries) {
		if (!taskHistoryEntries || taskHistoryEntries.length === 0) {
			return
		}
		for (const item of taskHistoryEntries) {
			if (!item.id) {
				continue
			}
			// Check if task directory exists on disk
			const tasksDir = await this.getTasksDir()
			const taskDir = path.join(tasksDir, item.id)
			try {
				await fs.access(taskDir)
			} catch {
				// Task directory doesn't exist; skip this entry as it's orphaned in globalState
				continue
			}
			// Write history_item.json if it doesn't exist yet
			const filePath = path.join(taskDir, globalFileNames_1.GlobalFileNames.historyItem)
			try {
				await fs.access(filePath)
				// File already exists, skip (don't overwrite existing per-task files)
			} catch {
				// File doesn't exist, write it
				await (0, safeWriteJson_1.safeWriteJson)(filePath, item)
				this.cache.set(item.id, item)
			}
		}
		// Write the index
		await this.writeIndex()
	}
	// ────────────────────────────── Private: Index management ──────────────────────────────
	/**
	 * Load the `_index.json` file into the in-memory cache.
	 */
	async loadIndex() {
		const indexPath = await this.getIndexPath()
		try {
			const raw = await fs.readFile(indexPath, "utf8")
			const index = JSON.parse(raw)
			if (index.version === 1 && Array.isArray(index.entries)) {
				for (const entry of index.entries) {
					if (entry.id) {
						this.cache.set(entry.id, entry)
					}
				}
			}
		} catch {
			// Index doesn't exist or is corrupted; cache stays empty.
			// Reconciliation will rebuild it from per-task files.
		}
	}
	/**
	 * Write the full index to disk.
	 */
	async writeIndex() {
		const indexPath = await this.getIndexPath()
		const index = {
			version: 1,
			updatedAt: Date.now(),
			entries: this.getAll(),
		}
		await (0, safeWriteJson_1.safeWriteJson)(indexPath, index)
	}
	/**
	 * Schedule a debounced index write.
	 */
	scheduleIndexWrite() {
		if (this.disposed) {
			return
		}
		if (this.indexWriteTimer) {
			clearTimeout(this.indexWriteTimer)
		}
		this.indexWriteTimer = setTimeout(async () => {
			this.indexWriteTimer = null
			try {
				await this.writeIndex()
			} catch (err) {
				console.error("[TaskHistoryStore] Failed to write index:", err)
			}
		}, TaskHistoryStore.INDEX_WRITE_DEBOUNCE_MS)
	}
	/**
	 * Force an immediate index write (called on dispose/shutdown).
	 */
	async flushIndex() {
		if (this.indexWriteTimer) {
			clearTimeout(this.indexWriteTimer)
			this.indexWriteTimer = null
		}
		await this.writeIndex()
	}
	// ────────────────────────────── Private: Per-task file I/O ──────────────────────────────
	/**
	 * Write a HistoryItem to its per-task `history_item.json` file.
	 */
	async writeTaskFile(item) {
		const filePath = await this.getTaskFilePath(item.id)
		await (0, safeWriteJson_1.safeWriteJson)(filePath, item)
	}
	/**
	 * Read a HistoryItem from its per-task `history_item.json` file.
	 */
	async readTaskFile(taskId) {
		const filePath = await this.getTaskFilePath(taskId)
		try {
			const raw = await fs.readFile(filePath, "utf8")
			const item = JSON.parse(raw)
			return item.id ? item : null
		} catch {
			return null
		}
	}
	// ────────────────────────────── Private: fs.watch ──────────────────────────────
	/**
	 * Watch the tasks directory for changes from other instances.
	 */
	startWatcher() {
		if (this.disposed) {
			return
		}
		// Use a debounced handler to avoid excessive reconciliation
		let watchDebounce = null
		this.getTasksDir()
			.then((tasksDir) => {
				if (this.disposed) {
					return
				}
				try {
					this.fsWatcher = fsSync.watch(tasksDir, { recursive: false }, (_eventType, _filename) => {
						if (this.disposed) {
							return
						}
						// Debounce the reconciliation triggered by fs.watch
						if (watchDebounce) {
							clearTimeout(watchDebounce)
						}
						watchDebounce = setTimeout(() => {
							this.reconcile().catch((err) => {
								console.error("[TaskHistoryStore] Reconciliation after fs.watch failed:", err)
							})
						}, 500)
					})
					this.fsWatcher.on("error", (err) => {
						console.error("[TaskHistoryStore] fs.watch error:", err)
						// fs.watch is unreliable on some platforms; periodic reconciliation
						// serves as the fallback.
					})
				} catch (err) {
					console.error("[TaskHistoryStore] Failed to start fs.watch:", err)
				}
			})
			.catch((err) => {
				console.error("[TaskHistoryStore] Failed to get tasks dir for watcher:", err)
			})
	}
	/**
	 * Start periodic reconciliation as a defensive fallback for platforms
	 * where fs.watch is unreliable.
	 */
	startPeriodicReconciliation() {
		if (this.disposed) {
			return
		}
		this.reconcileTimer = setTimeout(async () => {
			if (this.disposed) {
				return
			}
			try {
				await this.reconcile()
			} catch (err) {
				console.error("[TaskHistoryStore] Periodic reconciliation failed:", err)
			}
			this.startPeriodicReconciliation()
		}, TaskHistoryStore.RECONCILE_INTERVAL_MS)
	}
	// ────────────────────────────── Private: Write lock ──────────────────────────────
	/**
	 * Serializes all read-modify-write operations within a single extension
	 * host process to prevent concurrent interleaving.
	 */
	withLock(fn) {
		const result = this.writeLock.then(fn, fn)
		this.writeLock = result.then(
			() => {},
			() => {},
		)
		return result
	}
	// ────────────────────────────── Private: Path helpers ──────────────────────────────
	/**
	 * Get the tasks base directory path, resolving custom storage paths.
	 */
	async getTasksDir() {
		const basePath = await (0, storage_1.getStorageBasePath)(this.globalStoragePath)
		return path.join(basePath, "tasks")
	}
	/**
	 * Get the path to a task's `history_item.json` file.
	 */
	async getTaskFilePath(taskId) {
		const tasksDir = await this.getTasksDir()
		return path.join(tasksDir, taskId, globalFileNames_1.GlobalFileNames.historyItem)
	}
	/**
	 * Get the path to the `_index.json` file.
	 */
	async getIndexPath() {
		const tasksDir = await this.getTasksDir()
		return path.join(tasksDir, globalFileNames_1.GlobalFileNames.historyIndex)
	}
}
exports.TaskHistoryStore = TaskHistoryStore
