import { Ignore } from "ignore"
import { ICodeParser, IEmbedder, IVectorStore, IDirectoryScanner } from "../interfaces"
import { CacheManager } from "../cache-manager"
export declare class DirectoryScanner implements IDirectoryScanner {
	private readonly embedder
	private readonly qdrantClient
	private readonly codeParser
	private readonly cacheManager
	private readonly ignoreInstance
	private readonly batchSegmentThreshold
	constructor(
		embedder: IEmbedder,
		qdrantClient: IVectorStore,
		codeParser: ICodeParser,
		cacheManager: CacheManager,
		ignoreInstance: Ignore,
		batchSegmentThreshold?: number,
	)
	/**
	 * Recursively scans a directory for code blocks in supported files.
	 * @param directoryPath The directory to scan
	 * @param aliIgnoreController Optional AliIgnoreController instance for filtering
	 * @param context VS Code ExtensionContext for cache storage
	 * @param onError Optional error handler callback
	 * @returns Promise<{codeBlocks: CodeBlock[], stats: {processed: number, skipped: number}}> Array of parsed code blocks and processing stats
	 */
	scanDirectory(
		directory: string,
		onError?: (error: Error) => void,
		onBlocksIndexed?: (indexedCount: number) => void,
		onFileParsed?: (fileBlockCount: number) => void,
		signal?: AbortSignal,
	): Promise<{
		stats: {
			processed: number
			skipped: number
		}
		totalBlockCount: number
	}>
	private processBatch
}
//# sourceMappingURL=scanner.d.ts.map
