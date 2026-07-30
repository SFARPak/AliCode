import { Anthropic } from "@anthropic-ai/sdk"
import { type ModelInfo } from "@ali-code/types"
import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
interface QwenCodeHandlerOptions extends ApiHandlerOptions {
	qwenCodeOauthPath?: string
}
export declare class QwenCodeHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: QwenCodeHandlerOptions
	private credentials
	private client
	private refreshPromise
	constructor(options: QwenCodeHandlerOptions)
	private ensureClient
	private loadCachedQwenCredentials
	private refreshAccessToken
	private doRefreshAccessToken
	private isTokenValid
	private ensureAuthenticated
	private getBaseUrl
	private callApiWithRetry
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
export {}
//# sourceMappingURL=qwen-code.d.ts.map
