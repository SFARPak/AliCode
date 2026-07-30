export type SambaNovaModelId =
	| "Meta-Llama-3.1-8B-Instruct"
	| "Meta-Llama-3.3-70B-Instruct"
	| "DeepSeek-R1"
	| "DeepSeek-V3-0324"
	| "DeepSeek-V3.1"
	| "Llama-4-Maverick-17B-128E-Instruct"
	| "Qwen3-32B"
	| "gpt-oss-120b"
export declare const sambaNovaDefaultModelId: SambaNovaModelId
export declare const sambaNovaModels: {
	readonly "Meta-Llama-3.1-8B-Instruct": {
		readonly maxTokens: 8192
		readonly contextWindow: 16384
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.1
		readonly outputPrice: 0.2
		readonly description: "Meta Llama 3.1 8B Instruct model with 16K context window."
	}
	readonly "Meta-Llama-3.3-70B-Instruct": {
		readonly maxTokens: 8192
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.6
		readonly outputPrice: 1.2
		readonly description: "Meta Llama 3.3 70B Instruct model with 128K context window."
	}
	readonly "DeepSeek-R1": {
		readonly maxTokens: 8192
		readonly contextWindow: 32768
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly supportsReasoningBudget: true
		readonly inputPrice: 5
		readonly outputPrice: 7
		readonly description: "DeepSeek R1 reasoning model with 32K context window."
	}
	readonly "DeepSeek-V3-0324": {
		readonly maxTokens: 8192
		readonly contextWindow: 32768
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 3
		readonly outputPrice: 4.5
		readonly description: "DeepSeek V3 model with 32K context window."
	}
	readonly "DeepSeek-V3.1": {
		readonly maxTokens: 8192
		readonly contextWindow: 32768
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 3
		readonly outputPrice: 4.5
		readonly description: "DeepSeek V3.1 model with 32K context window."
	}
	readonly "Llama-4-Maverick-17B-128E-Instruct": {
		readonly maxTokens: 8192
		readonly contextWindow: 131072
		readonly supportsImages: true
		readonly supportsPromptCache: false
		readonly inputPrice: 0.63
		readonly outputPrice: 1.8
		readonly description: "Meta Llama 4 Maverick 17B 128E Instruct model with 128K context window."
	}
	readonly "Qwen3-32B": {
		readonly maxTokens: 8192
		readonly contextWindow: 8192
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.4
		readonly outputPrice: 0.8
		readonly description: "Alibaba Qwen 3 32B model with 8K context window."
	}
	readonly "gpt-oss-120b": {
		readonly maxTokens: 8192
		readonly contextWindow: 131072
		readonly supportsImages: false
		readonly supportsPromptCache: false
		readonly inputPrice: 0.22
		readonly outputPrice: 0.59
		readonly description: "OpenAI gpt oss 120b model with 128k context window."
	}
}
//# sourceMappingURL=sambanova.d.ts.map
