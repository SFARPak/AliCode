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
exports.CacheManager = void 0
const vscode = __importStar(require("vscode"))
const crypto_1 = require("crypto")
const lodash_debounce_1 = __importDefault(require("lodash.debounce"))
const safeWriteJson_1 = require("../../utils/safeWriteJson")
/**
 * Manages the cache for code indexing
 */
class CacheManager {
	context
	workspacePath
	cachePath
	fileHashes = {}
	_debouncedSaveCache
	/**
	 * Creates a new cache manager
	 * @param context VS Code extension context
	 * @param workspacePath Path to the workspace
	 */
	constructor(context, workspacePath) {
		this.context = context
		this.workspacePath = workspacePath
		this.cachePath = vscode.Uri.joinPath(
			context.globalStorageUri,
			`roo-index-cache-${(0, crypto_1.createHash)("sha256").update(workspacePath).digest("hex")}.json`,
		)
		this._debouncedSaveCache = (0, lodash_debounce_1.default)(async () => {
			await this._performSave()
		}, 1500)
	}
	/**
	 * Initializes the cache manager by loading the cache file
	 */
	async initialize() {
		try {
			const cacheData = await vscode.workspace.fs.readFile(this.cachePath)
			this.fileHashes = JSON.parse(cacheData.toString())
		} catch (error) {
			this.fileHashes = {}
		}
	}
	/**
	 * Saves the cache to disk
	 */
	async _performSave() {
		try {
			await (0, safeWriteJson_1.safeWriteJson)(this.cachePath.fsPath, this.fileHashes)
		} catch (error) {
			console.error("Failed to save cache:", error)
		}
	}
	/**
	 * Clears the cache file by writing an empty object to it
	 */
	async clearCacheFile() {
		try {
			await (0, safeWriteJson_1.safeWriteJson)(this.cachePath.fsPath, {})
			this.fileHashes = {}
		} catch (error) {
			console.error("Failed to clear cache file:", error, this.cachePath)
		}
	}
	/**
	 * Gets the hash for a file path
	 * @param filePath Path to the file
	 * @returns The hash for the file or undefined if not found
	 */
	getHash(filePath) {
		return this.fileHashes[filePath]
	}
	/**
	 * Updates the hash for a file path
	 * @param filePath Path to the file
	 * @param hash New hash value
	 */
	updateHash(filePath, hash) {
		this.fileHashes[filePath] = hash
		this._debouncedSaveCache()
	}
	/**
	 * Deletes the hash for a file path
	 * @param filePath Path to the file
	 */
	deleteHash(filePath) {
		delete this.fileHashes[filePath]
		this._debouncedSaveCache()
	}
	/**
	 * Flushes any pending debounced cache writes to disk immediately.
	 */
	async flush() {
		await this._performSave()
	}
	/**
	 * Gets a copy of all file hashes
	 * @returns A copy of the file hashes record
	 */
	getAllHashes() {
		return { ...this.fileHashes }
	}
}
exports.CacheManager = CacheManager
