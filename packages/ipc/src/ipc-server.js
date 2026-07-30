import EventEmitter from "node:events"
import * as crypto from "node:crypto"
import ipc from "node-ipc"
import { IpcOrigin, IpcMessageType, ipcMessageSchema } from "@ali-code/types"
export class IpcServer extends EventEmitter {
	_socketPath
	_log
	_clients
	_isListening = false
	constructor(socketPath, log = console.log) {
		super()
		this._socketPath = socketPath
		this._log = log
		this._clients = new Map()
	}
	listen() {
		this._isListening = true
		ipc.config.silent = true
		ipc.serve(this.socketPath, () => {
			ipc.server.on("connect", (socket) => this.onConnect(socket))
			ipc.server.on("socket.disconnected", (socket) => this.onDisconnect(socket))
			ipc.server.on("message", (data) => this.onMessage(data))
		})
		ipc.server.start()
	}
	onConnect(socket) {
		const clientId = crypto.randomBytes(6).toString("hex")
		this._clients.set(clientId, socket)
		this.log(`[server#onConnect] clientId = ${clientId}, # clients = ${this._clients.size}`)
		this.send(socket, {
			type: IpcMessageType.Ack,
			origin: IpcOrigin.Server,
			data: { clientId, pid: process.pid, ppid: process.ppid },
		})
		this.emit(IpcMessageType.Connect, clientId)
	}
	onDisconnect(destroyedSocket) {
		let disconnectedClientId
		for (const [clientId, socket] of this._clients.entries()) {
			if (socket === destroyedSocket) {
				disconnectedClientId = clientId
				this._clients.delete(clientId)
				break
			}
		}
		this.log(`[server#socket.disconnected] clientId = ${disconnectedClientId}, # clients = ${this._clients.size}`)
		if (disconnectedClientId) {
			this.emit(IpcMessageType.Disconnect, disconnectedClientId)
		}
	}
	onMessage(data) {
		if (typeof data !== "object") {
			this.log(`[server#onMessage] invalid data -> ${JSON.stringify(data)}`)
			return
		}
		const result = ipcMessageSchema.safeParse(data)
		if (!result.success) {
			this.log(
				`[server#onMessage] invalid payload -> ${JSON.stringify(result.error.issues)} -> ${JSON.stringify(data)}`,
			)
			return
		}
		const payload = result.data
		if (payload.origin === IpcOrigin.Client) {
			switch (payload.type) {
				case IpcMessageType.TaskCommand:
					this.emit(IpcMessageType.TaskCommand, payload.clientId, payload.data)
					break
				default:
					this.log(`[server#onMessage] unhandled payload: ${JSON.stringify(payload)}`)
					break
			}
		}
	}
	log(...args) {
		this._log(...args)
	}
	broadcast(message) {
		// this.log("[server#broadcast] message =", message)
		ipc.server.broadcast("message", message)
	}
	send(client, message) {
		// this.log("[server#send] message =", message)
		if (typeof client === "string") {
			const socket = this._clients.get(client)
			if (socket) {
				ipc.server.emit(socket, "message", message)
			}
		} else {
			ipc.server.emit(client, "message", message)
		}
	}
	get socketPath() {
		return this._socketPath
	}
	get isListening() {
		return this._isListening
	}
}
