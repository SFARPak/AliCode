export declare const basetenModels: {
	readonly "moonshotai/Kimi-K2-Thinking": {
		readonly maxTokens: 16384
		readonly contextWindow: 262000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.6
		readonly outputPrice: 2.5
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "Kimi K2 Thinking - A model with enhanced reasoning capabilities from Kimi K2"
	}
	readonly "zai-org/GLM-4.6": {
		readonly maxTokens: 16384
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.6
		readonly outputPrice: 2.2
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "Frontier open model with advanced agentic, reasoning and coding capabilities"
	}
	readonly "deepseek-ai/DeepSeek-R1": {
		readonly maxTokens: 16384
		readonly contextWindow: 163840
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 2.55
		readonly outputPrice: 5.95
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "DeepSeek's first-generation reasoning model"
	}
	readonly "deepseek-ai/DeepSeek-R1-0528": {
		readonly maxTokens: 16384
		readonly contextWindow: 163840
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 2.55
		readonly outputPrice: 5.95
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "The latest revision of DeepSeek's first-generation reasoning model"
	}
	readonly "deepseek-ai/DeepSeek-V3-0324": {
		readonly maxTokens: 16384
		readonly contextWindow: 163840
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.77
		readonly outputPrice: 0.77
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "Fast general-purpose LLM with enhanced reasoning capabilities"
	}
	readonly "deepseek-ai/DeepSeek-V3.1": {
		readonly maxTokens: 16384
		readonly contextWindow: 163840
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.5
		readonly outputPrice: 1.5
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "Extremely capable general-purpose LLM with hybrid reasoning capabilities and advanced tool calling"
	}
	readonly "deepseek-ai/DeepSeek-V3.2": {
		readonly maxTokens: 16384
		readonly contextWindow: 163840
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.3
		readonly outputPrice: 0.45
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "DeepSeek's hybrid reasoning model with efficient long context scaling with GPT-5 level performance"
	}
	readonly "openai/gpt-oss-120b": {
		readonly maxTokens: 16384
		readonly contextWindow: 128072
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.1
		readonly outputPrice: 0.5
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "Extremely capable general-purpose LLM with strong, controllable reasoning capabilities"
	}
	readonly "Qwen/Qwen3-235B-A22B-Instruct-2507": {
		readonly maxTokens: 16384
		readonly contextWindow: 262144
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.22
		readonly outputPrice: 0.8
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "Mixture-of-experts LLM with math and reasoning capabilities"
	}
	readonly "Qwen/Qwen3-Coder-480B-A35B-Instruct": {
		readonly maxTokens: 16384
		readonly contextWindow: 262144
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.38
		readonly outputPrice: 1.53
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "Mixture-of-experts LLM with advanced coding and reasoning capabilities"
	}
	readonly "moonshotai/Kimi-K2-Instruct-0905": {
		readonly maxTokens: 16384
		readonly contextWindow: 262000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.6
		readonly outputPrice: 2.5
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "State of the art language model for agentic and coding tasks. September Update."
	}
}
export type BasetenModelId = keyof typeof basetenModels
export declare const basetenDefaultModelId = "zai-org/GLM-4.6"
//# sourceMappingURL=baseten.d.ts.map
