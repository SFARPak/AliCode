export type MoonshotModelId = keyof typeof moonshotModels
export declare const moonshotDefaultModelId: MoonshotModelId
export declare const moonshotModels: {
	readonly "kimi-k2-0711-preview": {
		readonly maxTokens: 32000
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.5
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.15
		readonly description: "Kimi K2 is a state-of-the-art mixture-of-experts (MoE) language model with 32 billion activated parameters and 1 trillion total parameters."
	}
	readonly "kimi-k2-0905-preview": {
		readonly maxTokens: 16384
		readonly contextWindow: 262144
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.5
		readonly cacheReadsPrice: 0.15
		readonly description: "Kimi K2 model gets a new version update: Agentic coding: more accurate, better generalization across scaffolds. Frontend coding: improved aesthetics and functionalities on web, 3d, and other tasks. Context length: extended from 128k to 256k, providing better long-horizon support."
	}
	readonly "kimi-k2-turbo-preview": {
		readonly maxTokens: 32000
		readonly contextWindow: 262144
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 2.4
		readonly outputPrice: 10
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.6
		readonly description: "Kimi K2 Turbo is a high-speed version of the state-of-the-art Kimi K2 mixture-of-experts (MoE) language model, with the same 32 billion activated parameters and 1 trillion total parameters, optimized for output speeds of up to 60 tokens per second, peaking at 100 tokens per second."
	}
	readonly "kimi-k2-thinking": {
		readonly maxTokens: 16000
		readonly contextWindow: 262144
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.6
		readonly outputPrice: 2.5
		readonly cacheWritesPrice: 0
		readonly cacheReadsPrice: 0.15
		readonly supportsTemperature: true
		readonly preserveReasoning: true
		readonly defaultTemperature: 1
		readonly description: "The kimi-k2-thinking model is a general-purpose agentic reasoning model developed by Moonshot AI. Thanks to its strength in deep reasoning and multi-turn tool use, it can solve even the hardest problems."
	}
	readonly "kimi-k2.5": {
		readonly maxTokens: 16384
		readonly contextWindow: 262144
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly inputPrice: 0.6
		readonly outputPrice: 3
		readonly cacheReadsPrice: 0.1
		readonly supportsTemperature: true
		readonly defaultTemperature: 1
		readonly description: "Kimi K2.5 is the latest generation of Moonshot AI's Kimi series, featuring improved reasoning capabilities and enhanced performance across diverse tasks."
	}
}
export declare const MOONSHOT_DEFAULT_TEMPERATURE = 0.6
//# sourceMappingURL=moonshot.d.ts.map
