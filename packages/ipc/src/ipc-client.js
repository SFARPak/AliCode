import EventEmitter from "node:events"
import * as crypto from "node:crypto"
import ipc from "node-ipc"
import { IpcOrigin, IpcMessageType, TaskCommandName, ipcMessageSchema } from "@ali-code/types"
export class IpcClient extends EventEmitter {
	_socketPath
	_id
	_log
	_isConnected = false
	_clientId
	constructor(socketPath, log = console.log) {
		super()
		this._socketPath = socketPath
		this._id = `roo-code-ipc-${crypto.randomBytes(6).toString("hex")}`
		this._log = log
		ipc.config.silent = true
		ipc.connectTo(this._id, this.socketPath, () => {
			ipc.of[this._id]?.on("connect", () => this.onConnect())
			ipc.of[this._id]?.on("disconnect", () => this.onDisconnect())
			ipc.of[this._id]?.on("message", (data) => this.onMessage(data))
		})
	}
	onConnect() {
		if (this._isConnected) {
			return
		}
		this.log("[client#onConnect]")
		this._isConnected = true
		this.emit(IpcMessageType.Connect)
	}
	onDisconnect() {
		if (!this._isConnected) {
			return
		}
		this.log("[client#onDisconnect]")
		this._isConnected = false
		this.emit(IpcMessageType.Disconnect)
	}
	onMessage(data) {
		if (typeof data !== "object") {
			this.log(`[client#onMessage] invalid data -> ${JSON.stringify(data)}`)
			return
		}
		const result = ipcMessageSchema.safeParse(data)
		if (!result.success) {
			this.log(
				`[client#onMessage] invalid payload -> ${JSON.stringify(result.error.issues)} -> ${JSON.stringify(data)}`,
			)
			return
		}
		const payload = result.data
		if (payload.origin === IpcOrigin.Server) {
			switch (payload.type) {
				case IpcMessageType.Ack:
					this._clientId = payload.data.clientId
					this.emit(IpcMessageType.Ack, payload.data)
					break
				case IpcMessageType.TaskEvent:
					this.emit(IpcMessageType.TaskEvent, payload.data)
					break
			}
		}
	}
	log(...args) {
		this._log(...args)
	}
	sendCommand(command) {
		const message = {
			type: IpcMessageType.TaskCommand,
			origin: IpcOrigin.Client,
			clientId: this._clientId,
			data: command,
		}
		this.sendMessage(message)
	}
	sendTaskMessage(text, images) {
		this.sendCommand({
			commandName: TaskCommandName.SendMessage,
			data: { text, images },
		})
	}
	deleteQueuedMessage(messageId) {
		this.sendCommand({
			commandName: TaskCommandName.DeleteQueuedMessage,
			data: messageId,
		})
	}
	sendMessage(message) {
		ipc.of[this._id]?.emit("message", message)
	}
	disconnect() {
		try {
			ipc.disconnect(this._id)
		} catch (error) {
			this.log(
				`[client#disconnect] error disconnecting -> ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}
	get socketPath() {
		return this._socketPath
	}
	get clientId() {
		return this._clientId
	}
	get isConnected() {
		return this._isConnected
	}
	get isReady() {
		return this._isConnected && this._clientId !== undefined
	}
}
