/**
 * OpenAI Codex Provider
 *
 * This provider uses OAuth authentication via ChatGPT Plus/Pro subscription
 * instead of direct API keys. Requests are routed to the Codex backend at
 * https://chatgpt.com/backend-api/codex/responses
 *
 * Key differences from openai-native:
 * - Uses OAuth Bearer tokens instead of API keys
 * - Subscription-based pricing (no per-token costs)
 * - Limited model subset available
 * - Custom routing to Codex backend
 */
export type OpenAiCodexModelId = keyof typeof openAiCodexModels
export declare const openAiCodexDefaultModelId: OpenAiCodexModelId
/**
 * Models available through the Codex OAuth flow.
 * These models are accessible to ChatGPT Plus/Pro subscribers.
 * Costs are 0 as they are covered by the subscription.
 */
export declare const openAiCodexModels: {
	readonly "gpt-5.1-codex-max": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "xhigh"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsTemperature: false
		readonly description: "GPT-5.1 Codex Max: Maximum capability coding model via ChatGPT subscription"
	}
	readonly "gpt-5.1-codex": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsTemperature: false
		readonly description: "GPT-5.1 Codex: GPT-5.1 optimized for agentic coding via ChatGPT subscription"
	}
	readonly "gpt-5.3-codex": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsTemperature: false
		readonly description: "GPT-5.3 Codex: OpenAI's flagship coding model via ChatGPT subscription"
	}
	readonly "gpt-5.3-codex-spark": {
		readonly maxTokens: 8192
		readonly contextWindow: 128000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: false
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsTemperature: false
		readonly description: "GPT-5.3 Codex Spark: Fast, text-only coding model via ChatGPT subscription"
	}
	readonly "gpt-5.2-codex": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsTemperature: false
		readonly description: "GPT-5.2 Codex: OpenAI's flagship coding model via ChatGPT subscription"
	}
	readonly "gpt-5.1": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["none", "low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly description: "GPT-5.1: General GPT-5.1 model via ChatGPT subscription"
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
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly description: "GPT-5: General GPT-5 model via ChatGPT subscription"
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
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsTemperature: false
		readonly description: "GPT-5 Codex: GPT-5 optimized for agentic coding via ChatGPT subscription"
	}
	readonly "gpt-5-codex-mini": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsTemperature: false
		readonly description: "GPT-5 Codex Mini: Faster coding model via ChatGPT subscription"
	}
	readonly "gpt-5.1-codex-mini": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["low", "medium", "high"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsTemperature: false
		readonly description: "GPT-5.1 Codex Mini: Faster version for coding tasks via ChatGPT subscription"
	}
	readonly "gpt-5.5": {
		readonly maxTokens: 128000
		readonly contextWindow: 1050000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "none"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly description: "GPT-5.5: Most capable model via ChatGPT subscription"
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
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly description: "GPT-5.4: Formerly most capable model via ChatGPT subscription"
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
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsVerbosity: true
		readonly supportsTemperature: false
		readonly description: "GPT-5.4 Mini: Lower-cost GPT-5.4 model via ChatGPT subscription"
	}
	readonly "gpt-5.2": {
		readonly maxTokens: 128000
		readonly contextWindow: 400000
		readonly includedTools: ["apply_patch"]
		readonly excludedTools: ["apply_diff", "write_to_file"]
		readonly supportsImages: true
		readonly supportsPromptCache: true
		readonly supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh"]
		readonly reasoningEffort: "medium"
		readonly inputPrice: 0
		readonly outputPrice: 0
		readonly supportsTemperature: false
		readonly description: "GPT-5.2: Latest GPT model via ChatGPT subscription"
	}
}
//# sourceMappingURL=openai-codex.d.ts.map
