/**
 * Gets the base storage path for conversations
 * If a custom path is configured, uses that path
 * Otherwise uses the default VSCode extension global storage path
 */
export declare function getStorageBasePath(defaultPath: string): Promise<string>
/**
 * Gets the storage directory path for a task
 */
export declare function getTaskDirectoryPath(globalStoragePath: string, taskId: string): Promise<string>
/**
 * Gets the settings directory path
 */
export declare function getSettingsDirectoryPath(globalStoragePath: string): Promise<string>
/**
 * Gets the cache directory path
 */
export declare function getCacheDirectoryPath(globalStoragePath: string): Promise<string>
/**
 * Prompts the user to set a custom storage path
 * Displays an input box allowing the user to enter a custom path
 */
export declare function promptForCustomStoragePath(): Promise<void>
//# sourceMappingURL=storage.d.ts.map
