export interface IVectorStore {
	upsert(_points: PointStruct[]): Promise<void>
	search(_vector: number[], _limit: number): Promise<VectorStoreSearchResult[]>
}

export interface VectorStoreSearchResult {
	id: string
	score: number
	payload?: Record<string, unknown>
}

export interface PointStruct {
	id: string
	vector: number[]
	payload?: Record<string, unknown>
}

export interface Payload {
	[key: string]: unknown
}
