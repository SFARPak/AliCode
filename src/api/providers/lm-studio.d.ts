import { Anthropic } from "@anthropic-ai/sdk"
import { type ModelInfo } from "@ali-code/types"
import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
export declare class LmStudioHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private client
	private readonly providerName
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
	completePrompt(prompt: string): Promise<string>
}
export declare function getLmStudioModels(baseUrl?: string): Promise<string[]>
//# sourceMappingURL=lm-studio.d.ts.map
