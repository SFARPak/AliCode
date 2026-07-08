// Real implementation for @ali-code/core/browser module

// Export constant for command output string
export const COMMAND_OUTPUT_STRING = "Output:"

// Types
export type ParsedApiReqStartedTextType = {
	tokensIn: number
	tokensOut: number
	cacheWrites: number
	cacheReads: number
	cost?: number // Only present if consolidateApiRequests has been called
	apiProtocol?: "anthropic" | "openai"
}

// Safe JSON parse utility
export function safeJsonParse<T>(jsonString: string | null | undefined, defaultValue?: T): T | undefined {
	if (!jsonString) {
		return defaultValue
	}
	try {
		return JSON.parse(jsonString) as T
	} catch (error) {
		console.error("Error parsing JSON:", error)
		return defaultValue
	}
}

// Consolidate API request start and finish messages
import type { ClineMessage } from "@ali-code/types"
export function consolidateApiRequests(messages: ClineMessage[]): ClineMessage[] {
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
	const result: ClineMessage[] = []
	const startedIndices: number[] = []
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
export function consolidateCommands(messages: ClineMessage[]): ClineMessage[] {
	const consolidatedMessages = new Map<number, ClineMessage>()
	const processedIndices = new Set<number>()
	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i]
		if (!msg) continue
		if (msg.type === "ask" && msg.ask === "use_mcp_server") {
			const responses: string[] = []
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
				const jsonObj = safeJsonParse<any>(msg.text || "{}", {})
				jsonObj.response = responses.join("\n")
				const consolidatedText = JSON.stringify(jsonObj)
				consolidatedMessages.set(msg.ts, { ...msg, text: consolidatedText })
			} else {
				consolidatedMessages.set(msg.ts, { ...msg })
			}
		} else if (msg.type === "ask" && msg.ask === "command") {
			let consolidatedText = msg.text || ""
			let j = i + 1
			let previous: { type: "ask" | "say"; text: string } | undefined
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
						consolidatedText += `\n${COMMAND_OUTPUT_STRING}`
					}
					const isDuplicate = previous && previous.type !== type && previous.text === text
					if (text.length > 0 && !isDuplicate) {
						if (
							previous &&
							consolidatedText.length >
								consolidatedText.indexOf(COMMAND_OUTPUT_STRING) + COMMAND_OUTPUT_STRING.length
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
	const result: ClineMessage[] = []
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

// Consolidate token usage
import type { TokenUsage, ToolUsage, ToolName } from "@ali-code/types"
export function consolidateTokenUsage(messages: ClineMessage[]): TokenUsage {
	const result: TokenUsage = {
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
				const parsedText: ParsedApiReqStartedTextType = JSON.parse(message.text)
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
				const parsedText: ParsedApiReqStartedTextType = JSON.parse(message.text)
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

export function hasTokenUsageChanged(current: TokenUsage, snapshot?: TokenUsage): boolean {
	if (!snapshot) return true
	const keysToCompare: (keyof TokenUsage)[] = [
		"totalTokensIn",
		"totalTokensOut",
		"totalCacheWrites",
		"totalCacheReads",
		"totalCost",
		"contextTokens",
	]
	return keysToCompare.some((key) => current[key] !== snapshot[key])
}

export function hasToolUsageChanged(current: ToolUsage, snapshot?: ToolUsage): boolean {
	const effectiveSnapshot = snapshot ?? {}
	const currentKeys = Object.keys(current) as ToolName[]
	const snapshotKeys = Object.keys(effectiveSnapshot) as ToolName[]
	if (currentKeys.length !== snapshotKeys.length) return true
	return currentKeys.some((key) => {
		const currentTool = current[key]
		const snapshotTool = effectiveSnapshot[key]
		if (!snapshotTool || !currentTool) return true
		return currentTool.attempts !== snapshotTool.attempts || currentTool.failures !== snapshotTool.failures
	})
}
