import * as vscode from "vscode"
import { Ignore } from "ignore"
import { AliIgnoreController } from "../../core/ignore/AliIgnoreController"
import { DirectoryScanner } from "./processors"
import { ICodeParser, IEmbedder, IFileWatcher, IVectorStore } from "./interfaces"
import { CodeIndexConfigManager } from "./config-manager"
import { CacheManager } from "./cache-manager"
/**
 * Factory class responsible for creating and configuring code indexing service dependencies.
 */
export declare class CodeIndexServiceFactory {
	private readonly configManager
	private readonly workspacePath
	private readonly cacheManager
	constructor(configManager: CodeIndexConfigManager, workspacePath: string, cacheManager: CacheManager)
	/**
	 * Creates an embedder instance based on the current configuration.
	 */
	createEmbedder(): IEmbedder
	/**
	 * Validates an embedder instance to ensure it's properly configured.
	 * @param embedder The embedder instance to validate
	 * @returns Promise resolving to validation result
	 */
	validateEmbedder(embedder: IEmbedder): Promise<{
		valid: boolean
		error?: string
	}>
	/**
	 * Creates a vector store instance using the current configuration.
	 */
	createVectorStore(): IVectorStore
	/**
	 * Creates a directory scanner instance with its required dependencies.
	 */
	createDirectoryScanner(
		embedder: IEmbedder,
		vectorStore: IVectorStore,
		parser: ICodeParser,
		ignoreInstance: Ignore,
	): DirectoryScanner
	/**
	 * Creates a file watcher instance with its required dependencies.
	 */
	createFileWatcher(
		context: vscode.ExtensionContext,
		embedder: IEmbedder,
		vectorStore: IVectorStore,
		cacheManager: CacheManager,
		ignoreInstance: Ignore,
		aliIgnoreController?: AliIgnoreController,
	): IFileWatcher
	/**
	 * Creates all required service dependencies if the service is properly configured.
	 * @throws Error if the service is not properly configured
	 */
	createServices(
		context: vscode.ExtensionContext,
		cacheManager: CacheManager,
		ignoreInstance: Ignore,
		aliIgnoreController?: AliIgnoreController,
	): {
		embedder: IEmbedder
		vectorStore: IVectorStore
		parser: ICodeParser
		scanner: DirectoryScanner
		fileWatcher: IFileWatcher
	}
}
//# sourceMappingURL=service-factory.d.ts.map
