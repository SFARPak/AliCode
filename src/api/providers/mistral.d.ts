import { Anthropic } from "@anthropic-ai/sdk"
import { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
export declare class MistralHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private client
	private readonly providerName
	constructor(options: ApiHandlerOptions)
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	/**
	 * Convert OpenAI tool definitions to Mistral format.
	 * Mistral uses the same format as OpenAI for function tools.
	 */
	private convertToolsForMistral
	getModel(): {
		id: string
		info:
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 128000
					readonly supportsImages: true
					readonly supportsPromptCache: false
					readonly inputPrice: 2
					readonly outputPrice: 5
			  }
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 131000
					readonly supportsImages: true
					readonly supportsPromptCache: false
					readonly inputPrice: 0.4
					readonly outputPrice: 2
			  }
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 131000
					readonly supportsImages: true
					readonly supportsPromptCache: false
					readonly inputPrice: 0.4
					readonly outputPrice: 2
			  }
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 256000
					readonly supportsImages: false
					readonly supportsPromptCache: false
					readonly inputPrice: 0.3
					readonly outputPrice: 0.9
			  }
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 131000
					readonly supportsImages: false
					readonly supportsPromptCache: false
					readonly inputPrice: 2
					readonly outputPrice: 6
			  }
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 131000
					readonly supportsImages: false
					readonly supportsPromptCache: false
					readonly inputPrice: 0.1
					readonly outputPrice: 0.1
			  }
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 131000
					readonly supportsImages: false
					readonly supportsPromptCache: false
					readonly inputPrice: 0.04
					readonly outputPrice: 0.04
			  }
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 32000
					readonly supportsImages: false
					readonly supportsPromptCache: false
					readonly inputPrice: 0.2
					readonly outputPrice: 0.6
			  }
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 131000
					readonly supportsImages: true
					readonly supportsPromptCache: false
					readonly inputPrice: 2
					readonly outputPrice: 6
			  }
		maxTokens: 8192 | undefined
		temperature: number
	}
	completePrompt(prompt: string): Promise<string>
}
//# sourceMappingURL=mistral.d.ts.map
