import { Anthropic } from "@anthropic-ai/sdk"
import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream, ApiStreamUsageChunk } from "../transform/stream"
import { OpenAiHandler } from "./openai"
import type { ApiHandlerCreateMessageMetadata } from "../index"
export declare class DeepSeekHandler extends OpenAiHandler {
	constructor(options: ApiHandlerOptions)
	getModel(): {
		format: "openai"
		reasoning: import("../transform/reasoning").OpenAiReasoningParams | undefined
		maxTokens: number | undefined
		temperature: number | undefined
		reasoningEffort: import("@ali-code/types").ReasoningEffortExtended | undefined
		reasoningBudget: number | undefined
		verbosity: import("@ali-code/types").VerbosityLevel | undefined
		tools?: boolean
		id: string
		info:
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 128000
					readonly supportsImages: false
					readonly supportsPromptCache: true
					readonly inputPrice: 0.28
					readonly outputPrice: 0.42
					readonly cacheWritesPrice: 0.28
					readonly cacheReadsPrice: 0.028
					readonly description: "DeepSeek-V3.2 (Non-thinking Mode) achieves a significant breakthrough in inference speed over previous models. It tops the leaderboard among open-source models and rivals the most advanced closed-source models globally. Supports JSON output, tool calls, chat prefix completion (beta), and FIM completion (beta)."
			  }
			| {
					readonly maxTokens: 8192
					readonly contextWindow: 128000
					readonly supportsImages: false
					readonly supportsPromptCache: true
					readonly preserveReasoning: true
					readonly inputPrice: 0.28
					readonly outputPrice: 0.42
					readonly cacheWritesPrice: 0.28
					readonly cacheReadsPrice: 0.028
					readonly description: "DeepSeek-V3.2 (Thinking Mode) achieves performance comparable to OpenAI-o1 across math, code, and reasoning tasks. Supports Chain of Thought reasoning with up to 8K output tokens. Supports JSON output, tool calls, and chat prefix completion (beta)."
			  }
	}
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	protected processUsageMetrics(usage: any, _modelInfo?: any): ApiStreamUsageChunk
}
//# sourceMappingURL=deepseek.d.ts.map
