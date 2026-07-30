export declare const COMMAND_OUTPUT_STRING = "Output:"
export type ParsedApiReqStartedTextType = {
	tokensIn: number
	tokensOut: number
	cacheWrites: number
	cacheReads: number
	cost?: number
	apiProtocol?: "anthropic" | "openai"
}
export declare function safeJsonParse<T>(jsonString: string | null | undefined, defaultValue?: T): T | undefined
import type { ClineMessage } from "@ali-code/types"
export declare function consolidateApiRequests(messages: ClineMessage[]): ClineMessage[]
export declare function consolidateCommands(messages: ClineMessage[]): ClineMessage[]
import type { TokenUsage, ToolUsage } from "@ali-code/types"
export declare function consolidateTokenUsage(messages: ClineMessage[]): TokenUsage
export declare function hasTokenUsageChanged(current: TokenUsage, snapshot?: TokenUsage): boolean
export declare function hasToolUsageChanged(current: ToolUsage, snapshot?: ToolUsage): boolean
//# sourceMappingURL=index.d.ts.map
