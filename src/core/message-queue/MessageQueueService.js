"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.MessageQueueService = void 0
const events_1 = require("events")
const uuid_1 = require("uuid")
class MessageQueueService extends events_1.EventEmitter {
	_messages
	constructor() {
		super()
		this._messages = []
	}
	findMessage(id) {
		const index = this._messages.findIndex((msg) => msg.id === id)
		if (index === -1) {
			return { index, message: undefined }
		}
		return { index, message: this._messages[index] }
	}
	addMessage(text, images) {
		if (!text && !images?.length) {
			return undefined
		}
		const message = {
			timestamp: Date.now(),
			id: (0, uuid_1.v4)(),
			text,
			images,
		}
		this._messages.push(message)
		this.emit("stateChanged", this._messages)
		return message
	}
	removeMessage(id) {
		const { index, message } = this.findMessage(id)
		if (!message) {
			return false
		}
		this._messages.splice(index, 1)
		this.emit("stateChanged", this._messages)
		return true
	}
	updateMessage(id, text, images) {
		const { message } = this.findMessage(id)
		if (!message) {
			return false
		}
		message.timestamp = Date.now()
		message.text = text
		message.images = images
		this.emit("stateChanged", this._messages)
		return true
	}
	dequeueMessage() {
		const message = this._messages.shift()
		this.emit("stateChanged", this._messages)
		return message
	}
	get messages() {
		return this._messages
	}
	isEmpty() {
		return this._messages.length === 0
	}
	dispose() {
		this._messages = []
		this.removeAllListeners()
	}
}
exports.MessageQueueService = MessageQueueService
