export type InternationalZAiModelId = keyof typeof internationalZAiModels
export declare const internationalZAiDefaultModelId: InternationalZAiModelId
export declare const internationalZAiModels: {
	readonly "glm-4.5": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.2
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.11
		readonly description: "GLM-4.5 is Zhipu's latest featured model. Its comprehensive capabilities in reasoning, coding, and agent reach the state-of-the-art (SOTA) level among open-source models, with a context length of up to 128k."
	}
	readonly "glm-4.5-air": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.2
		readonly outputPrice: 1.1
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.03
		readonly description: "GLM-4.5-Air is the lightweight version of GLM-4.5. It balances performance and cost-effectiveness, and can flexibly switch to hybrid thinking models."
	}
	readonly "glm-4.5-x": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 2.2
		readonly outputPrice: 8.9
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.45
		readonly description: "GLM-4.5-X is a high-performance variant optimized for strong reasoning with ultra-fast responses."
	}
	readonly "glm-4.5-airx": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 1.1
		readonly outputPrice: 4.5
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.22
		readonly description: "GLM-4.5-AirX is a lightweight, ultra-fast variant delivering strong performance with lower cost."
	}
	readonly "glm-4.5-flash": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "GLM-4.5-Flash is a free, high-speed model excellent for reasoning, coding, and agentic tasks."
	}
	readonly "glm-4.5v": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.6
		readonly outputPrice: 1.8
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.11
		readonly description: "GLM-4.5V is Z.AI's multimodal visual reasoning model (image/video/text/file input), optimized for GUI tasks, grounding, and document/video understanding."
	}
	readonly "glm-4.6v": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.3
		readonly outputPrice: 0.9
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.05
		readonly description: "GLM-4.6V is an advanced multimodal vision model with improved performance and cost-efficiency for visual understanding tasks."
	}
	readonly "glm-4.6": {
		readonly maxTokens: 16384
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.2
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.11
		readonly description: "GLM-4.6 is Zhipu's newest model with an extended context window of up to 200k tokens, providing enhanced capabilities for processing longer documents and conversations."
	}
	readonly "glm-4.7": {
		readonly maxTokens: 16384
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["disable", "medium"]
		readonly reasoningEffort: "medium"
		readonly preserveReasoning: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.2
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.11
		readonly description: "GLM-4.7 is Zhipu's latest model with built-in thinking capabilities enabled by default. It provides enhanced reasoning for complex tasks while maintaining fast response times."
	}
	readonly "glm-5": {
		readonly maxTokens: 16384
		readonly contextWindow: 202752
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["disable", "medium"]
		readonly reasoningEffort: "medium"
		readonly preserveReasoning: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.2
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.11
		readonly description: "GLM-5 is Zhipu's next-generation model with a 202k context window and built-in thinking capabilities. It delivers state-of-the-art reasoning, coding, and agentic performance."
	}
	readonly "glm-4.7-flash": {
		readonly maxTokens: 16384
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "GLM-4.7-Flash is a free, high-speed variant of GLM-4.7 offering fast responses for reasoning and coding tasks."
	}
	readonly "glm-4.7-flashx": {
		readonly maxTokens: 16384
		readonly contextWindow: 200000
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.07
		readonly outputPrice: 0.4
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.01
		readonly description: "GLM-4.7-FlashX is an ultra-fast variant of GLM-4.7 with exceptional speed and cost-effectiveness for high-throughput applications."
	}
	readonly "glm-4.6v-flash": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "GLM-4.6V-Flash is a free, high-speed multimodal vision model for rapid image understanding and visual reasoning tasks."
	}
	readonly "glm-4.6v-flashx": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.04
		readonly outputPrice: 0.4
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.004
		readonly description: "GLM-4.6V-FlashX is an ultra-fast multimodal vision model optimized for high-speed visual processing at low cost."
	}
	readonly "glm-4-32b-0414-128k": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.1
		readonly outputPrice: 0.1
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "GLM-4-32B is a 32 billion parameter model with 128k context length, optimized for efficiency."
	}
}
export type MainlandZAiModelId = keyof typeof mainlandZAiModels
export declare const mainlandZAiDefaultModelId: MainlandZAiModelId
export declare const mainlandZAiModels: {
	readonly "glm-4.5": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.29
		readonly outputPrice: 1.14
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.057
		readonly description: "GLM-4.5 is Zhipu's latest featured model. Its comprehensive capabilities in reasoning, coding, and agent reach the state-of-the-art (SOTA) level among open-source models, with a context length of up to 128k."
	}
	readonly "glm-4.5-air": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.1
		readonly outputPrice: 0.6
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.02
		readonly description: "GLM-4.5-Air is the lightweight version of GLM-4.5. It balances performance and cost-effectiveness, and can flexibly switch to hybrid thinking models."
	}
	readonly "glm-4.5-x": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.29
		readonly outputPrice: 1.14
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.057
		readonly description: "GLM-4.5-X is a high-performance variant optimized for strong reasoning with ultra-fast responses."
	}
	readonly "glm-4.5-airx": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.1
		readonly outputPrice: 0.6
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.02
		readonly description: "GLM-4.5-AirX is a lightweight, ultra-fast variant delivering strong performance with lower cost."
	}
	readonly "glm-4.5-flash": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "GLM-4.5-Flash is a free, high-speed model excellent for reasoning, coding, and agentic tasks."
	}
	readonly "glm-4.5v": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.29
		readonly outputPrice: 0.93
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.057
		readonly description: "GLM-4.5V is Z.AI's multimodal visual reasoning model (image/video/text/file input), optimized for GUI tasks, grounding, and document/video understanding."
	}
	readonly "glm-4.6": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.29
		readonly outputPrice: 1.14
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.057
		readonly description: "GLM-4.6 is Zhipu's newest model with an extended context window of up to 200k tokens, providing enhanced capabilities for processing longer documents and conversations."
	}
	readonly "glm-4.7": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["disable", "medium"]
		readonly reasoningEffort: "medium"
		readonly preserveReasoning: true
		readonly inputPrice: 0.29
		readonly outputPrice: 1.14
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.057
		readonly description: "GLM-4.7 is Zhipu's latest model with built-in thinking capabilities enabled by default. It provides enhanced reasoning for complex tasks while maintaining fast response times."
	}
	readonly "glm-5": {
		readonly maxTokens: 16384
		readonly contextWindow: 202752
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["disable", "medium"]
		readonly reasoningEffort: "medium"
		readonly preserveReasoning: true
		readonly inputPrice: 0.29
		readonly outputPrice: 1.14
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.057
		readonly description: "GLM-5 is Zhipu's next-generation model with a 202k context window and built-in thinking capabilities. It delivers state-of-the-art reasoning, coding, and agentic performance."
	}
	readonly "glm-4.7-flash": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "GLM-4.7-Flash is a free, high-speed variant of GLM-4.7 offering fast responses for reasoning and coding tasks."
	}
	readonly "glm-4.7-flashx": {
		readonly maxTokens: 16384
		readonly contextWindow: 204800
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.035
		readonly outputPrice: 0.2
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.005
		readonly description: "GLM-4.7-FlashX is an ultra-fast variant of GLM-4.7 with exceptional speed and cost-effectiveness for high-throughput applications."
	}
	readonly "glm-4.6v": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.15
		readonly outputPrice: 0.45
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.025
		readonly description: "GLM-4.6V is an advanced multimodal vision model with improved performance and cost-efficiency for visual understanding tasks."
	}
	readonly "glm-4.6v-flash": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0
		readonly description: "GLM-4.6V-Flash is a free, high-speed multimodal vision model for rapid image understanding and visual reasoning tasks."
	}
	readonly "glm-4.6v-flashx": {
		readonly maxTokens: 16384
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly inputPrice: 0.02
		readonly outputPrice: 0.2
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.002
		readonly description: "GLM-4.6V-FlashX is an ultra-fast multimodal vision model optimized for high-speed visual processing at low cost."
	}
}
export declare const ZAI_DEFAULT_TEMPERATURE = 0.6
export declare const zaiApiLineConfigs: {
	international_coding: {
		name: string
		baseUrl: string
		isChina: false
	}
	china_coding: {
		name: string
		baseUrl: string
		isChina: true
	}
	international_api: {
		name: string
		baseUrl: string
		isChina: false
	}
	china_api: {
		name: string
		baseUrl: string
		isChina: true
	}
}
//# sourceMappingURL=zai.d.ts.map
