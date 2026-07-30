import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { type ApiHandlerOptions } from "../../shared/api"
import type { ApiHandlerCreateMessageMetadata } from "../index"
import { BaseOpenAiCompatibleProvider } from "./base-openai-compatible-provider"
export declare class ZAiHandler extends BaseOpenAiCompatibleProvider<string> {
	constructor(options: ApiHandlerOptions)
	/**
	 * Override createStream to handle GLM-4.7's thinking mode.
	 * GLM-4.7 has thinking enabled by default in the API, so we need to
	 * explicitly send { type: "disabled" } when the user turns off reasoning.
	 */
	protected createStream(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
		requestOptions?: OpenAI.RequestOptions,
	): import("openai").APIPromise<
		import("openai/core/streaming.js").Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
	>
	/**
	 * Creates a stream with explicit thinking control for GLM-4.7
	 */
	private createStreamWithThinking
}
//# sourceMappingURL=zai.d.ts.map
