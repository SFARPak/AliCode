import type { ModelInfo } from "../model.js"
export type MinimaxModelId = keyof typeof minimaxModels
export declare const minimaxDefaultModelId: MinimaxModelId
export declare const minimaxModels: {
	readonly "MiniMax-M2.5": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly includedTools: ["search_and_replace"]
		readonly excludedTools: ["apply_diff"]
		readonly preserveReasoning: true
		readonly inputPrice: 0.3
		readonly outputPrice: 1.2
		readonly cacheWritesPrice: 0.375
		readonly cacheReadsPrice: 0.03
		readonly description: "MiniMax M2.5, the latest MiniMax model with enhanced coding and agentic capabilities, building on the strengths of the M2 series. See pricing at https://platform.minimax.io/docs/guides/pricing-paygo. Note: When using TokenPlan, usage is billed per request, not per token."
	}
	readonly "MiniMax-M2.5-highspeed": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly includedTools: ["search_and_replace"]
		readonly excludedTools: ["apply_diff"]
		readonly preserveReasoning: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.4
		readonly cacheWritesPrice: 0.375
		readonly cacheReadsPrice: 0.03
		readonly description: "MiniMax M2.5 highspeed: same performance as M2.5 but with faster response (approximately 100 tps vs 60 tps). See pricing at https://platform.minimax.io/docs/guides/pricing-paygo. Requires TokenPlan High-Speed subscription for use with TokenPlan keys. Note: When using TokenPlan, usage is billed per request, not per token."
	}
	readonly "MiniMax-M2.7": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly includedTools: ["search_and_replace"]
		readonly excludedTools: ["apply_diff"]
		readonly preserveReasoning: true
		readonly inputPrice: 0.3
		readonly outputPrice: 1.2
		readonly cacheWritesPrice: 0.375
		readonly cacheReadsPrice: 0.06
		readonly description: "MiniMax M2.7, the latest MiniMax model with recursive self-improvement capabilities. See pricing at https://platform.minimax.io/docs/guides/pricing-paygo. Note: When using TokenPlan, usage is billed per request, not per token."
	}
	readonly "MiniMax-M2.7-highspeed": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly includedTools: ["search_and_replace"]
		readonly excludedTools: ["apply_diff"]
		readonly preserveReasoning: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.4
		readonly cacheWritesPrice: 0.375
		readonly cacheReadsPrice: 0.06
		readonly description: "MiniMax M2.7 highspeed: same performance as M2.7 but with faster response (approximately 100 tps vs 60 tps). See pricing at https://platform.minimax.io/docs/guides/pricing-paygo. Requires TokenPlan High-Speed subscription for use with TokenPlan keys. Note: When using TokenPlan, usage is billed per request, not per token."
	}
	readonly "MiniMax-M2": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly includedTools: ["search_and_replace"]
		readonly excludedTools: ["apply_diff"]
		readonly preserveReasoning: true
		readonly inputPrice: 0.3
		readonly outputPrice: 1.2
		readonly cacheWritesPrice: 0.375
		readonly cacheReadsPrice: 0.03
		readonly description: "MiniMax M2, a model born for Agents and code, featuring Top-tier Coding Capabilities, Powerful Agentic Performance, and Ultimate Cost-Effectiveness & Speed. See pricing at https://platform.minimax.io/docs/guides/pricing-paygo. Note: When using TokenPlan, usage is billed per request, not per token."
	}
	readonly "MiniMax-M2-Stable": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly includedTools: ["search_and_replace"]
		readonly excludedTools: ["apply_diff"]
		readonly preserveReasoning: true
		readonly inputPrice: 0.3
		readonly outputPrice: 1.2
		readonly cacheWritesPrice: 0.375
		readonly cacheReadsPrice: 0.03
		readonly description: "MiniMax M2 Stable (High Concurrency, Commercial Use), a model born for Agents and code, featuring Top-tier Coding Capabilities, Powerful Agentic Performance, and Ultimate Cost-Effectiveness & Speed. See pricing at https://platform.minimax.io/docs/guides/pricing-paygo. Note: When using TokenPlan, usage is billed per request, not per token."
	}
	readonly "MiniMax-M2.1": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly includedTools: ["search_and_replace"]
		readonly excludedTools: ["apply_diff"]
		readonly preserveReasoning: true
		readonly inputPrice: 0.3
		readonly outputPrice: 1.2
		readonly cacheWritesPrice: 0.375
		readonly cacheReadsPrice: 0.03
		readonly description: "MiniMax M2.1 builds on M2 with improved overall performance for agentic coding tasks and significantly faster response times. See pricing at https://platform.minimax.io/docs/guides/pricing-paygo. Note: When using TokenPlan, usage is billed per request, not per token."
	}
	readonly "MiniMax-M2.1-highspeed": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly includedTools: ["search_and_replace"]
		readonly excludedTools: ["apply_diff"]
		readonly preserveReasoning: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.4
		readonly cacheWritesPrice: 0.375
		readonly cacheReadsPrice: 0.03
		readonly description: "MiniMax M2.1 highspeed: same performance as M2.1 but with faster response (approximately 100 tps vs 60 tps). See pricing at https://platform.minimax.io/docs/guides/pricing-paygo. Requires TokenPlan High-Speed subscription for use with TokenPlan keys. Note: When using TokenPlan, usage is billed per request, not per token."
	}
}
export declare const minimaxDefaultModelInfo: ModelInfo
export declare const MINIMAX_DEFAULT_MAX_TOKENS = 16384
export declare const MINIMAX_DEFAULT_TEMPERATURE = 1
//# sourceMappingURL=minimax.d.ts.map
