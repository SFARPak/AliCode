export type MistralModelId = keyof typeof mistralModels
export declare const mistralDefaultModelId: MistralModelId
export declare const mistralModels: {
	readonly "magistral-medium-latest": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 2
		readonly outputPrice: 5
	}
	readonly "devstral-medium-latest": {
		readonly maxTokens: 8192
		readonly contextWindow: 131000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 0.4
		readonly outputPrice: 2
	}
	readonly "mistral-medium-latest": {
		readonly maxTokens: 8192
		readonly contextWindow: 131000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 0.4
		readonly outputPrice: 2
	}
	readonly "codestral-latest": {
		readonly maxTokens: 8192
		readonly contextWindow: 256000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.3
		readonly outputPrice: 0.9
	}
	readonly "mistral-large-latest": {
		readonly maxTokens: 8192
		readonly contextWindow: 131000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 2
		readonly outputPrice: 6
	}
	readonly "ministral-8b-latest": {
		readonly maxTokens: 8192
		readonly contextWindow: 131000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.1
		readonly outputPrice: 0.1
	}
	readonly "ministral-3b-latest": {
		readonly maxTokens: 8192
		readonly contextWindow: 131000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.04
		readonly outputPrice: 0.04
	}
	readonly "mistral-small-latest": {
		readonly maxTokens: 8192
		readonly contextWindow: 32000
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.2
		readonly outputPrice: 0.6
	}
	readonly "pixtral-large-latest": {
		readonly maxTokens: 8192
		readonly contextWindow: 131000
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 2
		readonly outputPrice: 6
	}
}
export declare const MISTRAL_DEFAULT_TEMPERATURE = 1
//# sourceMappingURL=mistral.d.ts.map
