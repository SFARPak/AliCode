export interface ICodeIndexManager {}

export interface IndexProgressUpdate {
	progress: number
}

export interface EmbedderProvider {
	getEmbedder(): unknown
}
