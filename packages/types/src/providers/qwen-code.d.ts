export type QwenCodeModelId = "qwen3-coder-plus" | "qwen3-coder-flash"
export declare const qwenCodeDefaultModelId: QwenCodeModelId
export declare const qwenCodeModels: {
	readonly "qwen3-coder-plus": {
		readonly maxTokens: 65536
		readonly contextWindow: 1000000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "Qwen3 Coder Plus - High-performance coding model with 1M context window for large codebases"
	}
	readonly "qwen3-coder-flash": {
		readonly maxTokens: 65536
		readonly contextWindow: 1000000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "Qwen3 Coder Flash - Fast coding model with 1M context window optimized for speed"
	}
}
//# sourceMappingURL=qwen-code.d.ts.map
