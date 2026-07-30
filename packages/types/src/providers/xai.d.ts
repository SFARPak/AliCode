export type XAIModelId = keyof typeof xaiModels
export declare const xaiDefaultModelId: XAIModelId
export declare const xaiModels: {
	readonly "grok-4.20": {
		readonly maxTokens: 65536
		readonly contextWindow: 2000000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2
		readonly outputPrice: 6
		readonly cacheWritesPrice: 0.5
		readonly cacheReadsPrice: 0.5
		readonly description: "xAI's flagship Grok 4.20 model with 2M context and reasoning support via Responses API."
		readonly includedTools: ["search_replace"]
		readonly excludedTools: ["apply_diff"]
	}
	readonly "grok-code-fast-1": {
		readonly maxTokens: 16384
		readonly contextWindow: 256000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.2
		readonly outputPrice: 1.5
		readonly cacheWritesPrice: 0.02
		readonly cacheReadsPrice: 0.02
		readonly description: "xAI's Grok Code Fast model with 256K context window"
		readonly includedTools: ["search_replace"]
		readonly excludedTools: ["apply_diff"]
	}
	readonly "grok-4-1-fast-reasoning": {
		readonly maxTokens: 65536
		readonly contextWindow: 2000000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.2
		readonly outputPrice: 0.5
		readonly cacheWritesPrice: 0.05
		readonly cacheReadsPrice: 0.05
		readonly description: "xAI's Grok 4.1 Fast model with 2M context window, optimized for high-performance agentic tool calling with reasoning"
		readonly includedTools: ["search_replace"]
		readonly excludedTools: ["apply_diff"]
	}
	readonly "grok-4-1-fast-non-reasoning": {
		readonly maxTokens: 65536
		readonly contextWindow: 2000000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.2
		readonly outputPrice: 0.5
		readonly cacheWritesPrice: 0.05
		readonly cacheReadsPrice: 0.05
		readonly description: "xAI's Grok 4.1 Fast model with 2M context window, optimized for high-performance agentic tool calling"
		readonly includedTools: ["search_replace"]
		readonly excludedTools: ["apply_diff"]
	}
	readonly "grok-4-fast-reasoning": {
		readonly maxTokens: 65536
		readonly contextWindow: 2000000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.2
		readonly outputPrice: 0.5
		readonly cacheWritesPrice: 0.05
		readonly cacheReadsPrice: 0.05
		readonly description: "xAI's Grok 4 Fast model with 2M context window, optimized for high-performance agentic tool calling with reasoning"
		readonly includedTools: ["search_replace"]
		readonly excludedTools: ["apply_diff"]
	}
	readonly "grok-4-fast-non-reasoning": {
		readonly maxTokens: 65536
		readonly contextWindow: 2000000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.2
		readonly outputPrice: 0.5
		readonly cacheWritesPrice: 0.05
		readonly cacheReadsPrice: 0.05
		readonly description: "xAI's Grok 4 Fast model with 2M context window, optimized for high-performance agentic tool calling"
		readonly includedTools: ["search_replace"]
		readonly excludedTools: ["apply_diff"]
	}
	readonly "grok-4-0709": {
		readonly maxTokens: 8192
		readonly contextWindow: 256000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 0.75
		readonly cacheReadsPrice: 0.75
		readonly description: "xAI's Grok-4 model with 256K context window"
		readonly includedTools: ["search_replace"]
		readonly excludedTools: ["apply_diff"]
	}
	readonly "grok-3-mini": {
		readonly maxTokens: 8192
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.3
		readonly outputPrice: 0.5
		readonly cacheWritesPrice: 0.07
		readonly cacheReadsPrice: 0.07
		readonly description: "xAI's Grok-3 mini model with 128K context window"
		readonly supportsReasoningEffort: ["low", "high"]
		readonly reasoningEffort: "low"
		readonly includedTools: ["search_replace"]
		readonly excludedTools: ["apply_diff"]
	}
	readonly "grok-3": {
		readonly maxTokens: 8192
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 0.75
		readonly cacheReadsPrice: 0.75
		readonly description: "xAI's Grok-3 model with 128K context window"
		readonly includedTools: ["search_replace"]
		readonly excludedTools: ["apply_diff"]
	}
}
//# sourceMappingURL=xai.d.ts.map
