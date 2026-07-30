"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.parseOpenAiCodexUsagePayload = parseOpenAiCodexUsagePayload
exports.fetchOpenAiCodexRateLimitInfo = fetchOpenAiCodexRateLimitInfo
const WHAM_USAGE_URL = "https://chatgpt.com/backend-api/wham/usage"
function clampPercent(value) {
	if (!Number.isFinite(value)) return 0
	return Math.max(0, Math.min(100, value))
}
function secondsToMs(value) {
	return typeof value === "number" && Number.isFinite(value) ? Math.round(value * 1000) : undefined
}
function parseOpenAiCodexUsagePayload(payload, fetchedAt) {
	const data = payload && typeof payload === "object" ? payload : {}
	const primaryRaw = data.rate_limit?.primary_window
	const secondaryRaw = data.rate_limit?.secondary_window
	const primary =
		primaryRaw && typeof primaryRaw.used_percent === "number"
			? {
					usedPercent: clampPercent(primaryRaw.used_percent),
					...(typeof primaryRaw.limit_window_seconds === "number"
						? { windowMinutes: Math.round(primaryRaw.limit_window_seconds / 60) }
						: {}),
					...(secondsToMs(primaryRaw.reset_at) !== undefined
						? { resetsAt: secondsToMs(primaryRaw.reset_at) }
						: {}),
				}
			: undefined
	const secondary =
		secondaryRaw && typeof secondaryRaw.used_percent === "number"
			? {
					usedPercent: clampPercent(secondaryRaw.used_percent),
					...(typeof secondaryRaw.limit_window_seconds === "number"
						? { windowMinutes: Math.round(secondaryRaw.limit_window_seconds / 60) }
						: {}),
					...(secondsToMs(secondaryRaw.reset_at) !== undefined
						? { resetsAt: secondsToMs(secondaryRaw.reset_at) }
						: {}),
				}
			: undefined
	return {
		...(primary ? { primary } : {}),
		...(secondary ? { secondary } : {}),
		...(typeof data.plan_type === "string" ? { planType: data.plan_type } : {}),
		fetchedAt,
	}
}
async function fetchOpenAiCodexRateLimitInfo(accessToken, options) {
	const fetchedAt = Date.now()
	const headers = {
		Authorization: `Bearer ${accessToken}`,
		Accept: "application/json",
	}
	if (options?.accountId) {
		headers["ChatGPT-Account-Id"] = options.accountId
	}
	const response = await fetch(WHAM_USAGE_URL, { method: "GET", headers })
	if (!response.ok) {
		const text = await response.text().catch(() => "")
		throw new Error(
			`OpenAI Codex WHAM usage request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`,
		)
	}
	const json = await response.json()
	const parsed = parseOpenAiCodexUsagePayload(json, fetchedAt)
	if (!parsed.primary && !parsed.secondary) {
		throw new Error("OpenAI Codex WHAM usage response did not include rate_limit windows")
	}
	return parsed
}
