export type DeepSeekModelId = keyof typeof deepSeekModels
export declare const deepSeekDefaultModelId: DeepSeekModelId
export declare const deepSeekModels: {
	readonly "deepseek-chat": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.28
		readonly outputPrice: 0.42
		readonly cacheWritesPrice: 0.28
		readonly cacheReadsPrice: 0.028
		readonly description: "DeepSeek-V3.2 (Non-thinking Mode) achieves a significant breakthrough in inference speed over previous models. It tops the leaderboard among open-source models and rivals the most advanced closed-source models globally. Supports JSON output, tool calls, chat prefix completion (beta), and FIM completion (beta)."
	}
	readonly "deepseek-reasoner": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly preserveReasoning: true
		readonly inputPrice: 0.28
		readonly outputPrice: 0.42
		readonly cacheWritesPrice: 0.28
		readonly cacheReadsPrice: 0.028
		readonly description: "DeepSeek-V3.2 (Thinking Mode) achieves performance comparable to OpenAI-o1 across math, code, and reasoning tasks. Supports Chain of Thought reasoning with up to 8K output tokens. Supports JSON output, tool calls, and chat prefix completion (beta)."
	}
}
export declare const DEEP_SEEK_DEFAULT_TEMPERATURE = 0.3
//# sourceMappingURL=deepseek.d.ts.map
