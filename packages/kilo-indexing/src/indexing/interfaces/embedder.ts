export interface IEmbedder {
	embed(_texts: string[]): Promise<number[][]>
}

export interface EmbeddingResponse {
	embeddings: number[][]
}

export interface EmbedderInfo {
	name: string
	dimensions: number
}

export interface AvailableEmbedders {
	[name: string]: EmbedderInfo
}
