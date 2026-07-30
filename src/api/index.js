"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.buildApiHandler = buildApiHandler
const types_1 = require("@ali-code/types")
const providers_1 = require("./providers")
const native_ollama_1 = require("./providers/native-ollama")
function buildApiHandler(configuration) {
	const { apiProvider, ...options } = configuration
	if (apiProvider && (0, types_1.isRetiredProvider)(apiProvider)) {
		const retiredProviderMessage =
			apiProvider === "ali"
				? "As part of our decision to sunset the AliCode extension, we also ended the AliCode Router, which only existed to support the extension. Sorry about the hassle."
				: "This provider is no longer supported."
		throw new Error(`${retiredProviderMessage}\n\nPlease select a different provider in your API profile settings.`)
	}
	switch (apiProvider) {
		case "anthropic":
			return new providers_1.AnthropicHandler(options)
		case "openrouter":
			return new providers_1.OpenRouterHandler(options)
		case "bedrock":
			return new providers_1.AwsBedrockHandler(options)
		case "vertex":
			return options.apiModelId?.startsWith("claude")
				? new providers_1.AnthropicVertexHandler(options)
				: new providers_1.VertexHandler(options)
		case "openai":
			return new providers_1.OpenAiHandler(options)
		case "ollama":
			return new native_ollama_1.NativeOllamaHandler(options)
		case "lmstudio":
			return new providers_1.LmStudioHandler(options)
		case "gemini":
			return new providers_1.GeminiHandler(options)
		case "openai-codex":
			return new providers_1.OpenAiCodexHandler(options)
		case "openai-native":
			return new providers_1.OpenAiNativeHandler(options)
		case "deepseek":
			return new providers_1.DeepSeekHandler(options)
		case "qwen-code":
			return new providers_1.QwenCodeHandler(options)
		case "moonshot":
			return new providers_1.MoonshotHandler(options)
		case "vscode-lm":
			return new providers_1.VsCodeLmHandler(options)
		case "mistral":
			return new providers_1.MistralHandler(options)
		case "requesty":
			return new providers_1.RequestyHandler(options)
		case "unbound":
			return new providers_1.UnboundHandler(options)
		case "fake-ai":
			return new providers_1.FakeAIHandler(options)
		case "xai":
			return new providers_1.XAIHandler(options)
		case "litellm":
			return new providers_1.LiteLLMHandler(options)
		case "sambanova":
			return new providers_1.SambaNovaHandler(options)
		case "zai":
			return new providers_1.ZAiHandler(options)
		case "fireworks":
			return new providers_1.FireworksHandler(options)
		case "vercel-ai-gateway":
			return new providers_1.VercelAiGatewayHandler(options)
		case "minimax":
			return new providers_1.MiniMaxHandler(options)
		case "nvidia-nim":
			return new providers_1.NvidiaNimHandler(options)
		case "baseten":
			return new providers_1.BasetenHandler(options)
		case "poe":
			return new providers_1.PoeHandler(options)
		default:
			return new providers_1.AnthropicHandler(options)
	}
}
