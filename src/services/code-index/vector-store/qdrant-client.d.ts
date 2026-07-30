import { IVectorStore } from "../interfaces/vector-store"
import { VectorStoreSearchResult } from "../interfaces"
/**
 * Qdrant implementation of the vector store interface
 */
export declare class QdrantVectorStore implements IVectorStore {
	private readonly vectorSize
	private readonly DISTANCE_METRIC
	private client
	private readonly collectionName
	private readonly qdrantUrl
	private readonly workspacePath
	/**
	 * Creates a new Qdrant vector store
	 * @param workspacePath Path to the workspace
	 * @param url Optional URL to the Qdrant server
	 */
	constructor(workspacePath: string, url: string, vectorSize: number, apiKey?: string)
	/**
	 * Parses and normalizes Qdrant server URLs to handle various input formats
	 * @param url Raw URL input from user
	 * @returns Properly formatted URL for QdrantClient
	 */
	private parseQdrantUrl
	/**
	 * Handles hostname-only inputs
	 * @param hostname Raw hostname input
	 * @returns Properly formatted URL with http:// prefix
	 */
	private parseHostname
	private getCollectionInfo
	/**
	 * Initializes the vector store
	 * @returns Promise resolving to boolean indicating if a new collection was created
	 */
	initialize(): Promise<boolean>
	/**
	 * Recreates the collection with a new vector dimension, handling failures gracefully.
	 * @param existingVectorSize The current vector size of the existing collection
	 * @returns Promise resolving to boolean indicating if a new collection was created
	 */
	private _recreateCollectionWithNewDimension
	/**
	 * Creates payload indexes for the collection, handling errors gracefully.
	 */
	private _createPayloadIndexes
	/**
	 * Upserts points into the vector store
	 * @param points Array of points to upsert
	 */
	upsertPoints(
		points: Array<{
			id: string
			vector: number[]
			payload: Record<string, any>
		}>,
	): Promise<void>
	/**
	 * Checks if a payload is valid
	 * @param payload Payload to check
	 * @returns Boolean indicating if the payload is valid
	 */
	private isPayloadValid
	/**
	 * Searches for similar vectors
	 * @param queryVector Vector to search for
	 * @param directoryPrefix Optional directory prefix to filter results
	 * @param minScore Optional minimum score threshold
	 * @param maxResults Optional maximum number of results to return
	 * @returns Promise resolving to search results
	 */
	search(
		queryVector: number[],
		directoryPrefix?: string,
		minScore?: number,
		maxResults?: number,
	): Promise<VectorStoreSearchResult[]>
	/**
	 * Deletes points by file path
	 * @param filePath Path of the file to delete points for
	 */
	deletePointsByFilePath(filePath: string): Promise<void>
	deletePointsByMultipleFilePaths(filePaths: string[]): Promise<void>
	/**
	 * Deletes the entire collection.
	 */
	deleteCollection(): Promise<void>
	/**
	 * Clears all points from the collection
	 */
	clearCollection(): Promise<void>
	/**
	 * Checks if the collection exists
	 * @returns Promise resolving to boolean indicating if the collection exists
	 */
	collectionExists(): Promise<boolean>
	/**
	 * Checks if the collection exists and has indexed points
	 * @returns Promise resolving to boolean indicating if the collection exists and has points
	 */
	hasIndexedData(): Promise<boolean>
	/**
	 * Marks the indexing process as complete by storing metadata
	 * Should be called after a successful full workspace scan or incremental scan
	 */
	markIndexingComplete(): Promise<void>
	/**
	 * Marks the indexing process as incomplete by storing metadata
	 * Should be called at the start of indexing to indicate work in progress
	 */
	markIndexingIncomplete(): Promise<void>
}
//# sourceMappingURL=qdrant-client.d.ts.map
