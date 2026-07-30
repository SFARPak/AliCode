export * from "./anthropic.js"
export * from "./baseten.js"
export * from "./bedrock.js"
export * from "./deepseek.js"
export * from "./fireworks.js"
export * from "./gemini.js"
export * from "./lite-llm.js"
export * from "./lm-studio.js"
export * from "./mistral.js"
export * from "./moonshot.js"
export * from "./ollama.js"
export * from "./openai.js"
export * from "./openai-codex.js"
export * from "./openai-codex-rate-limits.js"
export * from "./openrouter.js"
export * from "./poe.js"
export * from "./qwen-code.js"
export * from "./requesty.js"
export * from "./sambanova.js"
export * from "./unbound.js"
export * from "./vertex.js"
export * from "./vscode-llm.js"
export * from "./xai.js"
export * from "./vercel-ai-gateway.js"
export * from "./zai.js"
export * from "./minimax.js"
export * from "./nvidia-nim.js"
import type { ProviderName } from "../provider-settings.js"
/**
 * Get the default model ID for a given provider.
 * This function returns only the provider's default model ID, without considering user configuration.
 * Used as a fallback when provider models are still loading.
 */
export declare function getProviderDefaultModelId(
	provider: ProviderName,
	options?: {
		isChina?: boolean
	},
): string
//# sourceMappingURL=index.d.ts.map
