"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.stopTts = exports.playTts = exports.setTtsSpeed = exports.setTtsEnabled = void 0
let isTtsEnabled = false
const setTtsEnabled = (enabled) => (isTtsEnabled = enabled)
exports.setTtsEnabled = setTtsEnabled
let speed = 1.0
const setTtsSpeed = (newSpeed) => (speed = newSpeed)
exports.setTtsSpeed = setTtsSpeed
let sayInstance = undefined
let queue = []
const playTts = async (message, options = {}) => {
	if (!isTtsEnabled) {
		return
	}
	try {
		queue.push({ message, options })
		await processQueue()
	} catch (error) {}
}
exports.playTts = playTts
const stopTts = () => {
	sayInstance?.stop()
	sayInstance = undefined
	queue = []
}
exports.stopTts = stopTts
const processQueue = async () => {
	if (!isTtsEnabled || sayInstance) {
		return
	}
	const item = queue.shift()
	if (!item) {
		return
	}
	try {
		const { message: nextUtterance, options } = item
		await new Promise((resolve, reject) => {
			const say = require("say")
			sayInstance = say
			options.onStart?.()
			say.speak(nextUtterance, undefined, speed, (err) => {
				options.onStop?.()
				if (err) {
					reject(new Error(err))
				} else {
					resolve()
				}
				sayInstance = undefined
			})
		})
		await processQueue()
	} catch (error) {
		sayInstance = undefined
		await processQueue()
	}
}
