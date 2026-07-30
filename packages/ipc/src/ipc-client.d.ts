import EventEmitter from "node:events"
import { type TaskCommand, type IpcClientEvents, type IpcMessage } from "@ali-code/types"
export declare class IpcClient extends EventEmitter<IpcClientEvents> {
	private readonly _socketPath
	private readonly _id
	private readonly _log
	private _isConnected
	private _clientId?
	constructor(
		socketPath: string,
		log?: {
			(...data: any[]): void
			(message?: any, ...optionalParams: any[]): void
		},
	)
	private onConnect
	private onDisconnect
	private onMessage
	private log
	sendCommand(command: TaskCommand): void
	sendTaskMessage(text?: string, images?: string[]): void
	deleteQueuedMessage(messageId: string): void
	sendMessage(message: IpcMessage): void
	disconnect(): void
	get socketPath(): string
	get clientId(): string | undefined
	get isConnected(): boolean
	get isReady(): boolean
}
//# sourceMappingURL=ipc-client.d.ts.map
