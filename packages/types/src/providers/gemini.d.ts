export type GeminiModelId = keyof typeof geminiModels
export declare const geminiDefaultModelId: GeminiModelId
export declare const geminiModels: {
	readonly "gemini-3.1-pro-preview": {
		readonly maxTokens: 65536
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "low"
		readonly supportsTemperature: true
		readonly defaultTemperature: 1
		readonly inputPrice: 4
		readonly outputPrice: 18
		readonly cacheReadsPrice: 0.4
		readonly cacheWritesPrice: 4.5
		readonly tiers: [
			{
				readonly contextWindow: 200000
				readonly inputPrice: 2
				readonly outputPrice: 12
				readonly cacheReadsPrice: 0.2
			},
			{
				readonly contextWindow: number
				readonly inputPrice: 4
				readonly outputPrice: 18
				readonly cacheReadsPrice: 0.4
			},
		]
	}
	readonly "gemini-3.1-pro-preview-customtools": {
		readonly maxTokens: 65536
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "low"
		readonly supportsTemperature: true
		readonly defaultTemperature: 1
		readonly inputPrice: 4
		readonly outputPrice: 18
		readonly cacheReadsPrice: 0.4
		readonly cacheWritesPrice: 4.5
		readonly tiers: [
			{
				readonly contextWindow: 200000
				readonly inputPrice: 2
				readonly outputPrice: 12
				readonly cacheReadsPrice: 0.2
			},
			{
				readonly contextWindow: number
				readonly inputPrice: 4
				readonly outputPrice: 18
				readonly cacheReadsPrice: 0.4
			},
		]
	}
	readonly "gemini-3-pro-preview": {
		readonly maxTokens: 65536
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "high"]
		readonly reasoningEffort: "low"
		readonly supportsTemperature: true
		readonly defaultTemperature: 1
		readonly inputPrice: 4
		readonly outputPrice: 18
		readonly cacheReadsPrice: 0.4
		readonly tiers: [
			{
				readonly contextWindow: 200000
				readonly inputPrice: 2
				readonly outputPrice: 12
				readonly cacheReadsPrice: 0.2
			},
			{
				readonly contextWindow: number
				readonly inputPrice: 4
				readonly outputPrice: 18
				readonly cacheReadsPrice: 0.4
			},
		]
	}
	readonly "gemini-3-flash-preview": {
		readonly maxTokens: 65536
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["minimal", "low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly supportsTemperature: true
		readonly defaultTemperature: 1
		readonly inputPrice: 0.5
		readonly outputPrice: 3
		readonly cacheReadsPrice: 0.05
	}
	readonly "gemini-2.5-pro": {
		readonly maxTokens: 64000
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2.5
		readonly outputPrice: 15
		readonly cacheReadsPrice: 0.625
		readonly cacheWritesPrice: 4.5
		readonly maxThinkingTokens: 32768
		readonly supportsReasoningBudget: true
		readonly requiredReasoningBudget: true
		readonly tiers: [
			{
				readonly contextWindow: 200000
				readonly inputPrice: 1.25
				readonly outputPrice: 10
				readonly cacheReadsPrice: 0.31
			},
			{
				readonly contextWindow: number
				readonly inputPrice: 2.5
				readonly outputPrice: 15
				readonly cacheReadsPrice: 0.625
			},
		]
	}
	readonly "gemini-2.5-pro-preview-06-05": {
		readonly maxTokens: 65535
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2.5
		readonly outputPrice: 15
		readonly cacheReadsPrice: 0.625
		readonly cacheWritesPrice: 4.5
		readonly maxThinkingTokens: 32768
		readonly supportsReasoningBudget: true
		readonly tiers: [
			{
				readonly contextWindow: 200000
				readonly inputPrice: 1.25
				readonly outputPrice: 10
				readonly cacheReadsPrice: 0.31
			},
			{
				readonly contextWindow: number
				readonly inputPrice: 2.5
				readonly outputPrice: 15
				readonly cacheReadsPrice: 0.625
			},
		]
	}
	readonly "gemini-2.5-pro-preview-05-06": {
		readonly maxTokens: 65535
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2.5
		readonly outputPrice: 15
		readonly cacheReadsPrice: 0.625
		readonly cacheWritesPrice: 4.5
		readonly tiers: [
			{
				readonly contextWindow: 200000
				readonly inputPrice: 1.25
				readonly outputPrice: 10
				readonly cacheReadsPrice: 0.31
			},
			{
				readonly contextWindow: number
				readonly inputPrice: 2.5
				readonly outputPrice: 15
				readonly cacheReadsPrice: 0.625
			},
		]
	}
	readonly "gemini-2.5-pro-preview-03-25": {
		readonly maxTokens: 65535
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2.5
		readonly outputPrice: 15
		readonly cacheReadsPrice: 0.625
		readonly cacheWritesPrice: 4.5
		readonly maxThinkingTokens: 32768
		readonly supportsReasoningBudget: true
		readonly tiers: [
			{
				readonly contextWindow: 200000
				readonly inputPrice: 1.25
				readonly outputPrice: 10
				readonly cacheReadsPrice: 0.31
			},
			{
				readonly contextWindow: number
				readonly inputPrice: 2.5
				readonly outputPrice: 15
				readonly cacheReadsPrice: 0.625
			},
		]
	}
	readonly "gemini-flash-latest": {
		readonly maxTokens: 65536
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.3
		readonly outputPrice: 2.5
		readonly cacheReadsPrice: 0.075
		readonly cacheWritesPrice: 1
		readonly maxThinkingTokens: 24576
		readonly supportsReasoningBudget: true
	}
	readonly "gemini-2.5-flash-preview-09-2025": {
		readonly maxTokens: 65536
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.3
		readonly outputPrice: 2.5
		readonly cacheReadsPrice: 0.075
		readonly cacheWritesPrice: 1
		readonly maxThinkingTokens: 24576
		readonly supportsReasoningBudget: true
	}
	readonly "gemini-2.5-flash": {
		readonly maxTokens: 64000
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.3
		readonly outputPrice: 2.5
		readonly cacheReadsPrice: 0.075
		readonly cacheWritesPrice: 1
		readonly maxThinkingTokens: 24576
		readonly supportsReasoningBudget: true
	}
	readonly "gemini-flash-lite-latest": {
		readonly maxTokens: 65536
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.1
		readonly outputPrice: 0.4
		readonly cacheReadsPrice: 0.025
		readonly cacheWritesPrice: 1
		readonly supportsReasoningBudget: true
		readonly maxThinkingTokens: 24576
	}
	readonly "gemini-2.5-flash-lite-preview-09-2025": {
		readonly maxTokens: 65536
		readonly contextWindow: 1048576
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.1
		readonly outputPrice: 0.4
		readonly cacheReadsPrice: 0.025
		readonly cacheWritesPrice: 1
		readonly supportsReasoningBudget: true
		readonly maxThinkingTokens: 24576
	}
}
//# sourceMappingURL=gemini.d.ts.map
