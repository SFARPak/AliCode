import { Anthropic } from "@anthropic-ai/sdk"
import type { ModelInfo } from "@ali-code/types"
import type { ApiHandler, SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
export declare class FakeAIHandler implements ApiHandler, SingleCompletionHandler {
	private ai
	constructor(options: ApiHandlerOptions)
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	getModel(): {
		id: string
		info: ModelInfo
	}
	countTokens(content: Array<Anthropic.Messages.ContentBlockParam>): Promise<number>
	completePrompt(prompt: string): Promise<string>
}
//# sourceMappingURL=fake-ai.d.ts.map
