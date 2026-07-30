import type { ModelInfo } from "../model.js"
export type OpenAiNativeModelId = keyof typeof openAiNativeModels
export declare const openAiNativeDefaultModelId: OpenAiNativeModelId
export declare const openAiNativeModels: {
	readonly "gpt-5.1-codex-max": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly promptCacheRetention: "24h"
		readonly supportsReasoningEffort: ["low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "xhigh"
		readonly inputPrice: 1.25
		readonly outputPrice: 10
		readonly cacheReadsPrice: 0.125
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 2.5
				readonly outputPrice: 20
				readonly cacheReadsPrice: 0.25
			},
		]
		readonly description: "GPT-5.1 Codex Max: Our most intelligent coding model optimized for long-horizon, agentic coding tasks"
	}
	readonly "gpt-5.4": {
		readonly maxTokens: 128000
		readonly contextWindow: 1050000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "none"
		readonly inputPrice: 2.5
		readonly outputPrice: 15
		readonly cacheReadsPrice: 0.25
		readonly longContextPricing: {
			readonly thresholdTokens: 272000
			readonly inputPriceMultiplier: 2
			readonly outputPriceMultiplier: 1.5
			readonly appliesToServiceTiers: ["default", "flex"]
		}
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 1050000
				readonly inputPrice: 1.25
				readonly outputPrice: 7.5
				readonly cacheReadsPrice: 0.125
			},
			{
				readonly name: "priority"
				readonly contextWindow: 1050000
				readonly inputPrice: 5
				readonly outputPrice: 30
				readonly cacheReadsPrice: 0.5
			},
		]
		readonly description: "GPT-5.4: Our most capable model for professional work"
	}
	readonly "gpt-5.4-mini": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "none"
		readonly inputPrice: 0.75
		readonly outputPrice: 4.5
		readonly cacheReadsPrice: 0.075
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.375
				readonly outputPrice: 2.25
				readonly cacheReadsPrice: 0.0375
			},
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 1.5
				readonly outputPrice: 9
				readonly cacheReadsPrice: 0.15
			},
		]
		readonly description: "GPT-5.4 Mini: A faster, lower-cost GPT-5.4 model for coding and agentic workflows"
	}
	readonly "gpt-5.4-nano": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "none"
		readonly inputPrice: 0.2
		readonly outputPrice: 1.25
		readonly cacheReadsPrice: 0.02
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.1
				readonly outputPrice: 0.625
				readonly cacheReadsPrice: 0.01
			},
		]
		readonly description: "GPT-5.4 Nano: The smallest GPT-5.4 model for high-volume, low-latency tasks"
	}
	readonly "gpt-5.2": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly promptCacheRetention: "24h"
		readonly supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 1.75
		readonly outputPrice: 14
		readonly cacheReadsPrice: 0.175
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.875
				readonly outputPrice: 7
				readonly cacheReadsPrice: 0.0875
			},
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 3.5
				readonly outputPrice: 28
				readonly cacheReadsPrice: 0.35
			},
		]
		readonly description: "GPT-5.2: Our flagship model for coding and agentic tasks across industries"
	}
	readonly "gpt-5.2-codex": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly promptCacheRetention: "24h"
		readonly supportsReasoningEffort: ["low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 1.75
		readonly outputPrice: 14
		readonly cacheReadsPrice: 0.175
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 3.5
				readonly outputPrice: 28
				readonly cacheReadsPrice: 0.35
			},
		]
		readonly description: "GPT-5.2 Codex: Our most intelligent coding model optimized for long-horizon, agentic coding tasks"
	}
	readonly "gpt-5.3-codex": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly promptCacheRetention: "24h"
		readonly supportsReasoningEffort: ["low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 1.75
		readonly outputPrice: 14
		readonly cacheReadsPrice: 0.175
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 3.5
				readonly outputPrice: 28
				readonly cacheReadsPrice: 0.35
			},
		]
		readonly description: "GPT-5.3 Codex: Our most intelligent coding model optimized for long-horizon, agentic coding tasks"
	}
	readonly "gpt-5.2-chat-latest": {
		readonly maxTokens: 16384
		readonly contextWindow: 128000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 1.75
		readonly outputPrice: 14
		readonly cacheReadsPrice: 0.175
		readonly description: "GPT-5.2 Chat: Optimized for conversational AI and chat use cases"
	}
	readonly "gpt-5.3-chat-latest": {
		readonly maxTokens: 16384
		readonly contextWindow: 128000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 1.75
		readonly outputPrice: 14
		readonly cacheReadsPrice: 0.175
		readonly description: "GPT-5.3 Chat: Optimized for conversational AI and chat use cases"
	}
	readonly "gpt-5.1": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly promptCacheRetention: "24h"
		readonly supportsReasoningEffort: ["none", "low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 1.25
		readonly outputPrice: 10
		readonly cacheReadsPrice: 0.125
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.625
				readonly outputPrice: 5
				readonly cacheReadsPrice: 0.0625
			},
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 2.5
				readonly outputPrice: 20
				readonly cacheReadsPrice: 0.25
			},
		]
		readonly description: "GPT-5.1: The best model for coding and agentic tasks across domains"
	}
	readonly "gpt-5.1-codex": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly promptCacheRetention: "24h"
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 1.25
		readonly outputPrice: 10
		readonly cacheReadsPrice: 0.125
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 2.5
				readonly outputPrice: 20
				readonly cacheReadsPrice: 0.25
			},
		]
		readonly description: "GPT-5.1 Codex: A version of GPT-5.1 optimized for agentic coding in Codex"
	}
	readonly "gpt-5.1-codex-mini": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly promptCacheRetention: "24h"
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0.25
		readonly outputPrice: 2
		readonly cacheReadsPrice: 0.025
		readonly supportsTemperature: false
		readonly description: "GPT-5.1 Codex mini: A version of GPT-5.1 optimized for agentic coding in Codex"
	}
	readonly "gpt-5": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["minimal", "low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 1.25
		readonly outputPrice: 10
		readonly cacheReadsPrice: 0.125
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.625
				readonly outputPrice: 5
				readonly cacheReadsPrice: 0.0625
			},
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 2.5
				readonly outputPrice: 20
				readonly cacheReadsPrice: 0.25
			},
		]
		readonly description: "GPT-5: The best model for coding and agentic tasks across domains"
	}
	readonly "gpt-5-mini": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["minimal", "low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0.25
		readonly outputPrice: 2
		readonly cacheReadsPrice: 0.025
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.125
				readonly outputPrice: 1
				readonly cacheReadsPrice: 0.0125
			},
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 0.45
				readonly outputPrice: 3.6
				readonly cacheReadsPrice: 0.045
			},
		]
		readonly description: "GPT-5 Mini: A faster, more cost-efficient version of GPT-5 for well-defined tasks"
	}
	readonly "gpt-5-codex": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 1.25
		readonly outputPrice: 10
		readonly cacheReadsPrice: 0.125
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 2.5
				readonly outputPrice: 20
				readonly cacheReadsPrice: 0.25
			},
		]
		readonly description: "GPT-5-Codex: A version of GPT-5 optimized for agentic coding in Codex"
	}
	readonly "gpt-5-nano": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["minimal", "low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0.05
		readonly outputPrice: 0.4
		readonly cacheReadsPrice: 0.005
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.025
				readonly outputPrice: 0.2
				readonly cacheReadsPrice: 0.0025
			},
		]
		readonly description: "GPT-5 Nano: Fastest, most cost-efficient version of GPT-5"
	}
	readonly "gpt-5-chat-latest": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 1.25
		readonly outputPrice: 10
		readonly cacheReadsPrice: 0.125
		readonly description: "GPT-5 Chat: Optimized for conversational AI and non-reasoning tasks"
	}
	readonly "gpt-4.1": {
		readonly maxTokens: 32768
		readonly contextWindow: 1047576
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2
		readonly outputPrice: 8
		readonly cacheReadsPrice: 0.5
		readonly supportsTemperature: true
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 1047576
				readonly inputPrice: 3.5
				readonly outputPrice: 14
				readonly cacheReadsPrice: 0.875
			},
		]
	}
	readonly "gpt-4.1-mini": {
		readonly maxTokens: 32768
		readonly contextWindow: 1047576
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.4
		readonly outputPrice: 1.6
		readonly cacheReadsPrice: 0.1
		readonly supportsTemperature: true
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 1047576
				readonly inputPrice: 0.7
				readonly outputPrice: 2.8
				readonly cacheReadsPrice: 0.175
			},
		]
	}
	readonly "gpt-4.1-nano": {
		readonly maxTokens: 32768
		readonly contextWindow: 1047576
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.1
		readonly outputPrice: 0.4
		readonly cacheReadsPrice: 0.025
		readonly supportsTemperature: true
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 1047576
				readonly inputPrice: 0.2
				readonly outputPrice: 0.8
				readonly cacheReadsPrice: 0.05
			},
		]
	}
	readonly o3: {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2
		readonly outputPrice: 8
		readonly cacheReadsPrice: 0.5
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 200000
				readonly inputPrice: 1
				readonly outputPrice: 4
				readonly cacheReadsPrice: 0.25
			},
			{
				readonly name: "priority"
				readonly contextWindow: 200000
				readonly inputPrice: 3.5
				readonly outputPrice: 14
				readonly cacheReadsPrice: 0.875
			},
		]
	}
	readonly "o3-high": {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2
		readonly outputPrice: 8
		readonly cacheReadsPrice: 0.5
		readonly reasoningEffort: "high"
		readonly supportsTemperature: false
	}
	readonly "o3-low": {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2
		readonly outputPrice: 8
		readonly cacheReadsPrice: 0.5
		readonly reasoningEffort: "low"
		readonly supportsTemperature: false
	}
	readonly "o4-mini": {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 1.1
		readonly outputPrice: 4.4
		readonly cacheReadsPrice: 0.275
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 200000
				readonly inputPrice: 0.55
				readonly outputPrice: 2.2
				readonly cacheReadsPrice: 0.138
			},
			{
				readonly name: "priority"
				readonly contextWindow: 200000
				readonly inputPrice: 2
				readonly outputPrice: 8
				readonly cacheReadsPrice: 0.5
			},
		]
	}
	readonly "o4-mini-high": {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 1.1
		readonly outputPrice: 4.4
		readonly cacheReadsPrice: 0.275
		readonly reasoningEffort: "high"
		readonly supportsTemperature: false
	}
	readonly "o4-mini-low": {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 1.1
		readonly outputPrice: 4.4
		readonly cacheReadsPrice: 0.275
		readonly reasoningEffort: "low"
		readonly supportsTemperature: false
	}
	readonly "o3-mini": {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 1.1
		readonly outputPrice: 4.4
		readonly cacheReadsPrice: 0.55
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly supportsTemperature: false
	}
	readonly "o3-mini-high": {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 1.1
		readonly outputPrice: 4.4
		readonly cacheReadsPrice: 0.55
		readonly reasoningEffort: "high"
		readonly supportsTemperature: false
	}
	readonly "o3-mini-low": {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 1.1
		readonly outputPrice: 4.4
		readonly cacheReadsPrice: 0.55
		readonly reasoningEffort: "low"
		readonly supportsTemperature: false
	}
	readonly o1: {
		readonly maxTokens: 100000
		readonly contextWindow: 200000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 15
		readonly outputPrice: 60
		readonly cacheReadsPrice: 7.5
		readonly supportsTemperature: false
	}
	readonly "o1-preview": {
		readonly maxTokens: 32768
		readonly contextWindow: 128000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 15
		readonly outputPrice: 60
		readonly cacheReadsPrice: 7.5
		readonly supportsTemperature: false
	}
	readonly "o1-mini": {
		readonly maxTokens: 65536
		readonly contextWindow: 128000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 1.1
		readonly outputPrice: 4.4
		readonly cacheReadsPrice: 0.55
		readonly supportsTemperature: false
	}
	readonly "gpt-4o": {
		readonly maxTokens: 16384
		readonly contextWindow: 128000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 2.5
		readonly outputPrice: 10
		readonly cacheReadsPrice: 1.25
		readonly supportsTemperature: true
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 128000
				readonly inputPrice: 4.25
				readonly outputPrice: 17
				readonly cacheReadsPrice: 2.125
			},
		]
	}
	readonly "gpt-4o-mini": {
		readonly maxTokens: 16384
		readonly contextWindow: 128000
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.15
		readonly outputPrice: 0.6
		readonly cacheReadsPrice: 0.075
		readonly supportsTemperature: true
		readonly tiers: [
			{
				readonly name: "priority"
				readonly contextWindow: 128000
				readonly inputPrice: 0.25
				readonly outputPrice: 1
				readonly cacheReadsPrice: 0.125
			},
		]
	}
	readonly "codex-mini-latest": {
		readonly maxTokens: 16384
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 1.5
		readonly outputPrice: 6
		readonly cacheReadsPrice: 0.375
		readonly supportsTemperature: false
		readonly description: "Codex Mini: Cloud-based software engineering agent powered by codex-1, a version of o3 optimized for coding tasks. Trained with reinforcement learning to generate human-style code, adhere to instructions, and iteratively run tests."
	}
	readonly "gpt-5-2025-08-07": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["minimal", "low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 1.25
		readonly outputPrice: 10
		readonly cacheReadsPrice: 0.125
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.625
				readonly outputPrice: 5
				readonly cacheReadsPrice: 0.0625
			},
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 2.5
				readonly outputPrice: 20
				readonly cacheReadsPrice: 0.25
			},
		]
		readonly description: "GPT-5: The best model for coding and agentic tasks across domains"
	}
	readonly "gpt-5-mini-2025-08-07": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["minimal", "low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0.25
		readonly outputPrice: 2
		readonly cacheReadsPrice: 0.025
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.125
				readonly outputPrice: 1
				readonly cacheReadsPrice: 0.0125
			},
			{
				readonly name: "priority"
				readonly contextWindow: 400000
				readonly inputPrice: 0.45
				readonly outputPrice: 3.6
				readonly cacheReadsPrice: 0.045
			},
		]
		readonly description: "GPT-5 Mini: A faster, more cost-efficient version of GPT-5 for well-defined tasks"
	}
	readonly "gpt-5-nano-2025-08-07": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["minimal", "low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0.05
		readonly outputPrice: 0.4
		readonly cacheReadsPrice: 0.005
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly tiers: [
			{
				readonly name: "flex"
				readonly contextWindow: 400000
				readonly inputPrice: 0.025
				readonly outputPrice: 0.2
				readonly cacheReadsPrice: 0.0025
			},
		]
		readonly description: "GPT-5 Nano: Fastest, most cost-efficient version of GPT-5"
	}
}
export declare const openAiModelInfoSaneDefaults: ModelInfo
export declare const azureOpenAiDefaultApiVersion = "2024-08-01-preview"
export declare const OPENAI_NATIVE_DEFAULT_TEMPERATURE = 0
export declare const OPENAI_AZURE_AI_INFERENCE_PATH = "/models/chat/completions"
//# sourceMappingURL=openai.d.ts.map
