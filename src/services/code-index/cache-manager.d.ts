import * as vscode from "vscode"
import { ICacheManager } from "./interfaces/cache"
/**
 * Manages the cache for code indexing
 */
export declare class CacheManager implements ICacheManager {
	private context
	private workspacePath
	private cachePath
	private fileHashes
	private _debouncedSaveCache
	/**
	 * Creates a new cache manager
	 * @param context VS Code extension context
	 * @param workspacePath Path to the workspace
	 */
	constructor(context: vscode.ExtensionContext, workspacePath: string)
	/**
	 * Initializes the cache manager by loading the cache file
	 */
	initialize(): Promise<void>
	/**
	 * Saves the cache to disk
	 */
	private _performSave
	/**
	 * Clears the cache file by writing an empty object to it
	 */
	clearCacheFile(): Promise<void>
	/**
	 * Gets the hash for a file path
	 * @param filePath Path to the file
	 * @returns The hash for the file or undefined if not found
	 */
	getHash(filePath: string): string | undefined
	/**
	 * Updates the hash for a file path
	 * @param filePath Path to the file
	 * @param hash New hash value
	 */
	updateHash(filePath: string, hash: string): void
	/**
	 * Deletes the hash for a file path
	 * @param filePath Path to the file
	 */
	deleteHash(filePath: string): void
	/**
	 * Flushes any pending debounced cache writes to disk immediately.
	 */
	flush(): Promise<void>
	/**
	 * Gets a copy of all file hashes
	 * @returns A copy of the file hashes record
	 */
	getAllHashes(): Record<string, string>
}
//# sourceMappingURL=cache-manager.d.ts.map
