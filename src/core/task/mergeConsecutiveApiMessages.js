"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.mergeConsecutiveApiMessages = mergeConsecutiveApiMessages
function normalizeContentToBlocks(content) {
	if (Array.isArray(content)) {
		return content
	}
	if (content === undefined || content === null) {
		return []
	}
	return [{ type: "text", text: String(content) }]
}
/**
 * Non-destructively merges consecutive messages with the same role.
 *
 * Used for *API request shaping only* (do not use for storage), so rewind/edit operations
 * can still reference the original individual messages.
 */
function mergeConsecutiveApiMessages(messages, options) {
	if (messages.length <= 1) {
		return messages
	}
	const mergeRoles = new Set(options?.roles ?? ["user"]) // default: user only
	const out = []
	for (const msg of messages) {
		const prev = out[out.length - 1]
		const canMerge =
			prev &&
			prev.role === msg.role &&
			mergeRoles.has(msg.role) &&
			// Allow merging regular messages into a summary (API-only shaping),
			// but never merge a summary into something else.
			!msg.isSummary &&
			!prev.isTruncationMarker &&
			!msg.isTruncationMarker
		if (!canMerge) {
			out.push(msg)
			continue
		}
		const mergedContent = [...normalizeContentToBlocks(prev.content), ...normalizeContentToBlocks(msg.content)]
		// Preserve the newest ts to keep chronological ordering for downstream logic.
		out[out.length - 1] = {
			...prev,
			content: mergedContent,
			ts: Math.max(prev.ts ?? 0, msg.ts ?? 0) || prev.ts || msg.ts,
		}
	}
	return out
}
