export type AnthropicModelId = keyof typeof anthropicModels
export declare const anthropicDefaultModelId: AnthropicModelId
export declare const anthropicModels: {
	readonly "claude-sonnet-4-6": {
		readonly maxTokens: 64000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
		readonly supportsReasoningBudget: true
		readonly tiers: [
			{
				readonly contextWindow: 1000000
				readonly inputPrice: 6
				readonly outputPrice: 22.5
				readonly cacheWritesPrice: 7.5
				readonly cacheReadsPrice: 0.6
			},
		]
	}
	readonly "claude-sonnet-4-5": {
		readonly maxTokens: 64000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
		readonly supportsReasoningBudget: true
		readonly tiers: [
			{
				readonly contextWindow: 1000000
				readonly inputPrice: 6
				readonly outputPrice: 22.5
				readonly cacheWritesPrice: 7.5
				readonly cacheReadsPrice: 0.6
			},
		]
	}
	readonly "claude-sonnet-4-20250514": {
		readonly maxTokens: 64000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
		readonly supportsReasoningBudget: true
		readonly tiers: [
			{
				readonly contextWindow: 1000000
				readonly inputPrice: 6
				readonly outputPrice: 22.5
				readonly cacheWritesPrice: 7.5
				readonly cacheReadsPrice: 0.6
			},
		]
	}
	readonly "claude-opus-4-6": {
		readonly maxTokens: 128000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 5
		readonly outputPrice: 25
		readonly cacheWritesPrice: 6.25
		readonly cacheReadsPrice: 0.5
		readonly supportsReasoningBudget: true
		readonly tiers: [
			{
				readonly contextWindow: 1000000
				readonly inputPrice: 10
				readonly outputPrice: 37.5
				readonly cacheWritesPrice: 12.5
				readonly cacheReadsPrice: 1
			},
		]
	}
	readonly "claude-opus-4-5-20251101": {
		readonly maxTokens: 32000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 5
		readonly outputPrice: 25
		readonly cacheWritesPrice: 6.25
		readonly cacheReadsPrice: 0.5
		readonly supportsReasoningBudget: true
	}
	readonly "claude-opus-4-1-20250805": {
		readonly maxTokens: 32000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 15
		readonly outputPrice: 75
		readonly cacheWritesPrice: 18.75
		readonly cacheReadsPrice: 1.5
		readonly supportsReasoningBudget: true
	}
	readonly "claude-opus-4-20250514": {
		readonly maxTokens: 32000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 15
		readonly outputPrice: 75
		readonly cacheWritesPrice: 18.75
		readonly cacheReadsPrice: 1.5
		readonly supportsReasoningBudget: true
	}
	readonly "claude-3-7-sonnet-20250219:thinking": {
		readonly maxTokens: 128000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
		readonly supportsReasoningBudget: true
		readonly requiredReasoningBudget: true
	}
	readonly "claude-3-7-sonnet-20250219": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
	}
	readonly "claude-3-5-sonnet-20241022": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
	}
	readonly "claude-3-5-haiku-20241022": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 1
		readonly outputPrice: 5
		readonly cacheWritesPrice: 1.25
		readonly cacheReadsPrice: 0.1
	}
	readonly "claude-3-opus-20240229": {
		readonly maxTokens: 4096
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 15
		readonly outputPrice: 75
		readonly cacheWritesPrice: 18.75
		readonly cacheReadsPrice: 1.5
	}
	readonly "claude-3-haiku-20240307": {
		readonly maxTokens: 4096
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.25
		readonly outputPrice: 1.25
		readonly cacheWritesPrice: 0.3
		readonly cacheReadsPrice: 0.03
	}
	readonly "claude-haiku-4-5-20251001": {
		readonly maxTokens: 64000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 1
		readonly outputPrice: 5
		readonly cacheWritesPrice: 1.25
		readonly cacheReadsPrice: 0.1
		readonly supportsReasoningBudget: true
		readonly description: "Claude Haiku 4.5 delivers near-frontier intelligence at lightning speeds with extended thinking, vision, and multilingual support."
	}
}
export declare const ANTHROPIC_DEFAULT_MAX_TOKENS = 8192
//# sourceMappingURL=anthropic.d.ts.map
