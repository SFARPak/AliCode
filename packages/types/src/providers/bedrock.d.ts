export type BedrockModelId = keyof typeof bedrockModels
export declare const bedrockDefaultModelId: BedrockModelId
export declare const bedrockDefaultPromptRouterModelId: BedrockModelId
export declare const bedrockModels: {
	readonly "anthropic.claude-sonnet-4-5-20250929-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningBudget: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
		readonly minTokensPerCachePoint: 1024
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
	}
	readonly "anthropic.claude-sonnet-4-6": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningBudget: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
		readonly minTokensPerCachePoint: 1024
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
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
	readonly "amazon.nova-pro-v1:0": {
		readonly maxTokens: 5000
		readonly contextWindow: 300000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.8
		readonly outputPrice: 3.2
		readonly cacheWritesPrice: 0.8
		readonly cacheReadsPrice: 0.2
		readonly minTokensPerCachePoint: 1
		readonly maxCachePoints: 1
		readonly cachableFields: ["system"]
	}
	readonly "amazon.nova-pro-latency-optimized-v1:0": {
		readonly maxTokens: 5000
		readonly contextWindow: 300000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 1
		readonly outputPrice: 4
		readonly cacheWritesPrice: 1
		readonly cacheReadsPrice: 0.25
		readonly description: "Amazon Nova Pro with latency optimized inference"
	}
	readonly "amazon.nova-lite-v1:0": {
		readonly maxTokens: 5000
		readonly contextWindow: 300000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.06
		readonly outputPrice: 0.24
		readonly cacheWritesPrice: 0.06
		readonly cacheReadsPrice: 0.015
		readonly minTokensPerCachePoint: 1
		readonly maxCachePoints: 1
		readonly cachableFields: ["system"]
	}
	readonly "amazon.nova-2-lite-v1:0": {
		readonly maxTokens: 65535
		readonly contextWindow: 1000000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.33
		readonly outputPrice: 2.75
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.0825
		readonly minTokensPerCachePoint: 1
		readonly maxCachePoints: 1
		readonly cachableFields: ["system"]
		readonly description: "Amazon Nova 2 Lite - Comparable to Claude Haiku 4.5"
	}
	readonly "amazon.nova-micro-v1:0": {
		readonly maxTokens: 5000
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.035
		readonly outputPrice: 0.14
		readonly cacheWritesPrice: 0.035
		readonly cacheReadsPrice: 0.00875
		readonly minTokensPerCachePoint: 1
		readonly maxCachePoints: 1
		readonly cachableFields: ["system"]
	}
	readonly "anthropic.claude-sonnet-4-20250514-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningBudget: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
		readonly minTokensPerCachePoint: 1024
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
	}
	readonly "anthropic.claude-opus-4-1-20250805-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningBudget: true
		readonly inputPrice: 15
		readonly outputPrice: 75
		readonly cacheWritesPrice: 18.75
		readonly cacheReadsPrice: 1.5
		readonly minTokensPerCachePoint: 1024
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
	}
	readonly "anthropic.claude-opus-4-6-v1": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningBudget: true
		readonly inputPrice: 5
		readonly outputPrice: 25
		readonly cacheWritesPrice: 6.25
		readonly cacheReadsPrice: 0.5
		readonly minTokensPerCachePoint: 1024
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
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
	readonly "anthropic.claude-opus-4-5-20251101-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningBudget: true
		readonly inputPrice: 5
		readonly outputPrice: 25
		readonly cacheWritesPrice: 6.25
		readonly cacheReadsPrice: 0.5
		readonly minTokensPerCachePoint: 1024
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
	}
	readonly "anthropic.claude-opus-4-20250514-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningBudget: true
		readonly inputPrice: 15
		readonly outputPrice: 75
		readonly cacheWritesPrice: 18.75
		readonly cacheReadsPrice: 1.5
		readonly minTokensPerCachePoint: 1024
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
	}
	readonly "anthropic.claude-3-7-sonnet-20250219-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningBudget: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
		readonly minTokensPerCachePoint: 1024
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
	}
	readonly "anthropic.claude-3-5-sonnet-20241022-v2:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 3
		readonly outputPrice: 15
		readonly cacheWritesPrice: 3.75
		readonly cacheReadsPrice: 0.3
		readonly minTokensPerCachePoint: 1024
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
	}
	readonly "anthropic.claude-3-5-haiku-20241022-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.8
		readonly outputPrice: 4
		readonly cacheWritesPrice: 1
		readonly cacheReadsPrice: 0.08
		readonly minTokensPerCachePoint: 2048
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
	}
	readonly "anthropic.claude-haiku-4-5-20251001-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningBudget: true
		readonly inputPrice: 1
		readonly outputPrice: 5
		readonly cacheWritesPrice: 1.25
		readonly cacheReadsPrice: 0.1
		readonly minTokensPerCachePoint: 2048
		readonly maxCachePoints: 4
		readonly cachableFields: ["system", "messages", "tools"]
	}
	readonly "anthropic.claude-3-5-sonnet-20240620-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 3
		readonly outputPrice: 15
	}
	readonly "anthropic.claude-3-opus-20240229-v1:0": {
		readonly maxTokens: 4096
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 15
		readonly outputPrice: 75
	}
	readonly "anthropic.claude-3-sonnet-20240229-v1:0": {
		readonly maxTokens: 4096
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 3
		readonly outputPrice: 15
	}
	readonly "anthropic.claude-3-haiku-20240307-v1:0": {
		readonly maxTokens: 4096
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 0.25
		readonly outputPrice: 1.25
	}
	readonly "deepseek.r1-v1:0": {
		readonly maxTokens: 32768
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 1.35
		readonly outputPrice: 5.4
	}
	readonly "openai.gpt-oss-20b-1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.5
		readonly outputPrice: 1.5
		readonly description: "GPT-OSS 20B - Optimized for low latency and local/specialized use cases"
	}
	readonly "openai.gpt-oss-120b-1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 2
		readonly outputPrice: 6
		readonly description: "GPT-OSS 120B - Production-ready, general-purpose, high-reasoning model"
	}
	readonly "meta.llama3-3-70b-instruct-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.72
		readonly outputPrice: 0.72
		readonly description: "Llama 3.3 Instruct (70B)"
	}
	readonly "meta.llama3-2-90b-instruct-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 0.72
		readonly outputPrice: 0.72
		readonly description: "Llama 3.2 Instruct (90B)"
	}
	readonly "meta.llama3-2-11b-instruct-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 0.16
		readonly outputPrice: 0.16
		readonly description: "Llama 3.2 Instruct (11B)"
	}
	readonly "meta.llama3-2-3b-instruct-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.15
		readonly outputPrice: 0.15
		readonly description: "Llama 3.2 Instruct (3B)"
	}
	readonly "meta.llama3-2-1b-instruct-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.1
		readonly outputPrice: 0.1
		readonly description: "Llama 3.2 Instruct (1B)"
	}
	readonly "meta.llama3-1-405b-instruct-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 2.4
		readonly outputPrice: 2.4
		readonly description: "Llama 3.1 Instruct (405B)"
	}
	readonly "meta.llama3-1-70b-instruct-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.72
		readonly outputPrice: 0.72
		readonly description: "Llama 3.1 Instruct (70B)"
	}
	readonly "meta.llama3-1-70b-instruct-latency-optimized-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.9
		readonly outputPrice: 0.9
		readonly description: "Llama 3.1 Instruct (70B) (w/ latency optimized inference)"
	}
	readonly "meta.llama3-1-8b-instruct-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 8000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.22
		readonly outputPrice: 0.22
		readonly description: "Llama 3.1 Instruct (8B)"
	}
	readonly "meta.llama3-70b-instruct-v1:0": {
		readonly maxTokens: 2048
		readonly contextWindow: 8000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 2.65
		readonly outputPrice: 3.5
	}
	readonly "meta.llama3-8b-instruct-v1:0": {
		readonly maxTokens: 2048
		readonly contextWindow: 4000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.3
		readonly outputPrice: 0.6
	}
	readonly "amazon.titan-text-lite-v1:0": {
		readonly maxTokens: 4096
		readonly contextWindow: 8000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.15
		readonly outputPrice: 0.2
		readonly description: "Amazon Titan Text Lite"
	}
	readonly "amazon.titan-text-express-v1:0": {
		readonly maxTokens: 4096
		readonly contextWindow: 8000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.2
		readonly outputPrice: 0.6
		readonly description: "Amazon Titan Text Express"
	}
	readonly "moonshot.kimi-k2-thinking": {
		readonly maxTokens: 32000
		readonly contextWindow: 262144
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly preserveReasoning: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.5
		readonly description: "Kimi K2 Thinking (1T parameter MoE model with 32B active parameters)"
	}
	readonly "minimax.minimax-m2": {
		readonly maxTokens: 16384
		readonly contextWindow: 196608
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly preserveReasoning: true
		readonly inputPrice: 0.3
		readonly outputPrice: 1.2
		readonly description: "MiniMax M2 (230B parameter MoE model with 10B active parameters)"
	}
	readonly "qwen.qwen3-next-80b-a3b": {
		readonly maxTokens: 8192
		readonly contextWindow: 262144
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.15
		readonly outputPrice: 1.2
		readonly description: "Qwen3 Next 80B (MoE model with 3B active parameters)"
	}
	readonly "qwen.qwen3-coder-480b-a35b-v1:0": {
		readonly maxTokens: 8192
		readonly contextWindow: 262144
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.45
		readonly outputPrice: 1.8
		readonly description: "Qwen3 Coder 480B (MoE model with 35B active parameters)"
	}
}
export declare const BEDROCK_DEFAULT_TEMPERATURE = 0.3
export declare const BEDROCK_MAX_TOKENS = 4096
export declare const BEDROCK_DEFAULT_CONTEXT = 128000
export declare const AWS_INFERENCE_PROFILE_MAPPING: Array<[string, string]>
export declare const BEDROCK_REGIONS: {
	value: string
	label: string
}[]
export declare const BEDROCK_1M_CONTEXT_MODEL_IDS: readonly [
	"anthropic.claude-sonnet-4-20250514-v1:0",
	"anthropic.claude-sonnet-4-5-20250929-v1:0",
	"anthropic.claude-sonnet-4-6",
	"anthropic.claude-opus-4-6-v1",
]
export declare const BEDROCK_GLOBAL_INFERENCE_MODEL_IDS: readonly [
	"anthropic.claude-sonnet-4-20250514-v1:0",
	"anthropic.claude-sonnet-4-5-20250929-v1:0",
	"anthropic.claude-sonnet-4-6",
	"anthropic.claude-haiku-4-5-20251001-v1:0",
	"anthropic.claude-opus-4-5-20251101-v1:0",
	"anthropic.claude-opus-4-6-v1",
]
export type BedrockServiceTier = "STANDARD" | "FLEX" | "PRIORITY"
export declare const BEDROCK_SERVICE_TIER_MODEL_IDS: readonly [
	"amazon.nova-lite-v1:0",
	"amazon.nova-2-lite-v1:0",
	"amazon.nova-pro-v1:0",
	"amazon.nova-pro-latency-optimized-v1:0",
	"deepseek.r1-v1:0",
	"qwen.qwen3-next-80b-a3b",
	"qwen.qwen3-coder-480b-a35b-v1:0",
	"openai.gpt-oss-20b-1:0",
	"openai.gpt-oss-120b-1:0",
]
export declare const BEDROCK_SERVICE_TIER_PRICING: {
	readonly STANDARD: 1
	readonly FLEX: 0.5
	readonly PRIORITY: 1.75
}
//# sourceMappingURL=bedrock.d.ts.map
