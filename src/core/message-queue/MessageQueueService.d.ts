import { EventEmitter } from "events"
import { QueuedMessage } from "@ali-code/types"
export interface MessageQueueState {
	messages: QueuedMessage[]
	isProcessing: boolean
	isPaused: boolean
}
export interface QueueEvents {
	stateChanged: [messages: QueuedMessage[]]
}
export declare class MessageQueueService extends EventEmitter<QueueEvents> {
	private _messages
	constructor()
	private findMessage
	addMessage(text: string, images?: string[]): QueuedMessage | undefined
	removeMessage(id: string): boolean
	updateMessage(id: string, text: string, images?: string[]): boolean
	dequeueMessage(): QueuedMessage | undefined
	get messages(): QueuedMessage[]
	isEmpty(): boolean
	dispose(): void
}
//# sourceMappingURL=MessageQueueService.d.ts.map
