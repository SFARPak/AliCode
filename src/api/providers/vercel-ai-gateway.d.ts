import { Anthropic } from "@anthropic-ai/sdk"
import { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { RouterProvider } from "./router-provider"
export declare class VercelAiGatewayHandler extends RouterProvider implements SingleCompletionHandler {
	constructor(options: ApiHandlerOptions)
	createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream
	completePrompt(prompt: string): Promise<string>
}
//# sourceMappingURL=vercel-ai-gateway.d.ts.map
