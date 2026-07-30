export type EmbedderProvider =
	| "openai"
	| "ollama"
	| "openai-compatible"
	| "gemini"
	| "mistral"
	| "vercel-ai-gateway"
	| "bedrock"
	| "openrouter"
export interface EmbeddingModelProfile {
	dimension: number
	scoreThreshold?: number
	queryPrefix?: string
}
export type EmbeddingModelProfiles = {
	[provider in EmbedderProvider]?: {
		[modelId: string]: EmbeddingModelProfile
	}
}
//# sourceMappingURL=embedding.d.ts.map
