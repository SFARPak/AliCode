"use strict"
// Real implementation for @ali-code/core/browser module
Object.defineProperty(exports, "__esModule", { value: true })
exports.COMMAND_OUTPUT_STRING = void 0
exports.safeJsonParse = safeJsonParse
exports.consolidateApiRequests = consolidateApiRequests
exports.consolidateCommands = consolidateCommands
exports.consolidateTokenUsage = consolidateTokenUsage
exports.hasTokenUsageChanged = hasTokenUsageChanged
exports.hasToolUsageChanged = hasToolUsageChanged
// Export constant for command output string
exports.COMMAND_OUTPUT_STRING = "Output:"
// Safe JSON parse utility
function safeJsonParse(jsonString, defaultValue) {
	if (!jsonString) {
		return defaultValue
	}
	try {
		return JSON.parse(jsonString)
	} catch (error) {
		console.error("Error parsing JSON:", error)
		return defaultValue
	}
}
function consolidateApiRequests(messages) {
	if (messages.length === 0) {
		return []
	}
	if (messages.length === 1) {
		return messages
	}
	let isMergeNecessary = false
	for (const msg of messages) {
		if (msg.type === "say" && (msg.say === "api_req_started" || msg.say === "api_req_finished")) {
			isMergeNecessary = true
			break
		}
	}
	if (!isMergeNecessary) {
		return messages
	}
	const result = []
	const startedIndices = []
	for (const message of messages) {
		if (message.type !== "say" || (message.say !== "api_req_started" && message.say !== "api_req_finished")) {
			result.push(message)
			continue
		}
		if (message.say === "api_req_started") {
			result.push(message)
			startedIndices.push(result.length - 1)
			continue
		}
		const startIndex = startedIndices.length > 0 ? startedIndices.pop() : undefined
		if (startIndex !== undefined) {
			const startMessage = result[startIndex]
			if (!startMessage) continue
			let startData = {}
			let finishData = {}
			try {
				if (startMessage.text) {
					startData = JSON.parse(startMessage.text)
				}
			} catch {}
			try {
				if (message.text) {
					finishData = JSON.parse(message.text)
				}
			} catch {}
			result[startIndex] = { ...startMessage, text: JSON.stringify({ ...startData, ...finishData }) }
		}
	}
	return result
}
// Consolidate command sequences
function consolidateCommands(messages) {
	const consolidatedMessages = new Map()
	const processedIndices = new Set()
	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i]
		if (!msg) continue
		if (msg.type === "ask" && msg.ask === "use_mcp_server") {
			const responses = []
			let j = i + 1
			while (j < messages.length) {
				const nextMsg = messages[j]
				if (!nextMsg) {
					j++
					continue
				}
				if (nextMsg.say === "mcp_server_response") {
					responses.push(nextMsg.text || "")
					processedIndices.add(j)
					j++
				} else if (nextMsg.type === "ask" && nextMsg.ask === "use_mcp_server") {
					break
				} else {
					j++
				}
			}
			if (responses.length > 0) {
				const jsonObj = safeJsonParse(msg.text || "{}", {})
				jsonObj.response = responses.join("\n")
				const consolidatedText = JSON.stringify(jsonObj)
				consolidatedMessages.set(msg.ts, { ...msg, text: consolidatedText })
			} else {
				consolidatedMessages.set(msg.ts, { ...msg })
			}
		} else if (msg.type === "ask" && msg.ask === "command") {
			let consolidatedText = msg.text || ""
			let j = i + 1
			let previous
			let lastProcessedIndex = i
			while (j < messages.length) {
				const currentMsg = messages[j]
				if (!currentMsg) {
					j++
					continue
				}
				const { type, ask, say, text = "" } = currentMsg
				if (type === "ask" && ask === "command") {
					break
				}
				if (ask === "command_output" || say === "command_output") {
					if (!previous) {
						consolidatedText += `\n${exports.COMMAND_OUTPUT_STRING}`
					}
					const isDuplicate = previous && previous.type !== type && previous.text === text
					if (text.length > 0 && !isDuplicate) {
						if (
							previous &&
							consolidatedText.length >
								consolidatedText.indexOf(exports.COMMAND_OUTPUT_STRING) +
									exports.COMMAND_OUTPUT_STRING.length
						) {
							consolidatedText += "\n"
						}
						consolidatedText += text
					}
					previous = { type, text }
					processedIndices.add(j)
					lastProcessedIndex = j
				}
				j++
			}
			consolidatedMessages.set(msg.ts, { ...msg, text: consolidatedText })
			if (lastProcessedIndex > i) {
				i = lastProcessedIndex
			}
		}
	}
	const result = []
	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i]
		if (!msg) continue
		if (processedIndices.has(i)) continue
		if (msg.ask === "command_output" || msg.say === "command_output" || msg.say === "mcp_server_response") continue
		const consolidatedMsg = consolidatedMessages.get(msg.ts)
		if (consolidatedMsg) {
			result.push(consolidatedMsg)
		} else {
			result.push(msg)
		}
	}
	return result
}
function consolidateTokenUsage(messages) {
	const result = {
		totalTokensIn: 0,
		totalTokensOut: 0,
		totalCacheWrites: undefined,
		totalCacheReads: undefined,
		totalCost: 0,
		contextTokens: 0,
	}
	messages.forEach((message) => {
		if (message.type === "say" && message.say === "api_req_started" && message.text) {
			try {
				const parsedText = JSON.parse(message.text)
				const { tokensIn, tokensOut, cacheWrites, cacheReads, cost } = parsedText
				if (typeof tokensIn === "number") result.totalTokensIn += tokensIn
				if (typeof tokensOut === "number") result.totalTokensOut += tokensOut
				if (typeof cacheWrites === "number")
					result.totalCacheWrites = (result.totalCacheWrites ?? 0) + cacheWrites
				if (typeof cacheReads === "number") result.totalCacheReads = (result.totalCacheReads ?? 0) + cacheReads
				if (typeof cost === "number") result.totalCost += cost
			} catch (error) {
				console.error("Error parsing JSON:", error)
			}
		} else if (message.type === "say" && message.say === "condense_context") {
			result.totalCost += message.contextCondense?.cost ?? 0
		}
	})
	result.contextTokens = 0
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i]
		if (!message) continue
		if (message.type === "say" && message.say === "api_req_started" && message.text) {
			try {
				const parsedText = JSON.parse(message.text)
				const { tokensIn, tokensOut } = parsedText
				result.contextTokens = (tokensIn || 0) + (tokensOut || 0)
			} catch {}
		} else if (message.type === "say" && message.say === "condense_context") {
			result.contextTokens = message.contextCondense?.newContextTokens ?? 0
		}
		if (result.contextTokens) break
	}
	return result
}
function hasTokenUsageChanged(current, snapshot) {
	if (!snapshot) return true
	const keysToCompare = [
		"totalTokensIn",
		"totalTokensOut",
		"totalCacheWrites",
		"totalCacheReads",
		"totalCost",
		"contextTokens",
	]
	return keysToCompare.some((key) => current[key] !== snapshot[key])
}
function hasToolUsageChanged(current, snapshot) {
	const effectiveSnapshot = snapshot ?? {}
	const currentKeys = Object.keys(current)
	const snapshotKeys = Object.keys(effectiveSnapshot)
	if (currentKeys.length !== snapshotKeys.length) return true
	return currentKeys.some((key) => {
		const currentTool = current[key]
		const snapshotTool = effectiveSnapshot[key]
		if (!snapshotTool || !currentTool) return true
		return currentTool.attempts !== snapshotTool.attempts || currentTool.failures !== snapshotTool.failures
	})
}
