import { Anthropic } from "@anthropic-ai/sdk"
export type ApiMessage = Anthropic.MessageParam & {
	ts?: number
	isSummary?: boolean
	id?: string
	type?: "reasoning"
	summary?: any[]
	encrypted_content?: string
	text?: string
	reasoning_details?: any[]
	reasoning_content?: string
	condenseId?: string
	condenseParent?: string
	truncationId?: string
	truncationParent?: string
	isTruncationMarker?: boolean
}
export declare function readApiMessages({
	taskId,
	globalStoragePath,
}: {
	taskId: string
	globalStoragePath: string
}): Promise<ApiMessage[]>
export declare function saveApiMessages({
	messages,
	taskId,
	globalStoragePath,
}: {
	messages: ApiMessage[]
	taskId: string
	globalStoragePath: string
}): Promise<void>
//# sourceMappingURL=apiMessages.d.ts.map
