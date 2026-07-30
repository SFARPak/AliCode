"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const rate_limits_1 = require("../rate-limits")
;(0, vitest_1.describe)("parseOpenAiCodexUsagePayload()", () => {
	;(0, vitest_1.it)("maps primary/secondary windows", () => {
		const fetchedAt = 1234567890000
		const payload = {
			rate_limit: {
				primary_window: { used_percent: 12.34, limit_window_seconds: 300 * 60, reset_at: 1700000000 },
				secondary_window: { used_percent: 99.9, limit_window_seconds: 10080 * 60, reset_at: 1700000000 },
			},
			plan_type: "plus",
		}
		const out = (0, rate_limits_1.parseOpenAiCodexUsagePayload)(payload, fetchedAt)
		;(0, vitest_1.expect)(out).toEqual({
			primary: {
				usedPercent: 12.34,
				windowMinutes: 300,
				resetsAt: 1700000000 * 1000,
			},
			secondary: {
				usedPercent: 99.9,
				windowMinutes: 10080,
				resetsAt: 1700000000 * 1000,
			},
			planType: "plus",
			fetchedAt,
		})
	})
	;(0, vitest_1.it)("clamps used_percent to 0–100 and tolerates missing fields", () => {
		const fetchedAt = 1
		const payload = {
			rate_limit: {
				primary_window: { used_percent: 1000 },
				secondary_window: { used_percent: -5 },
			},
		}
		const out = (0, rate_limits_1.parseOpenAiCodexUsagePayload)(payload, fetchedAt)
		;(0, vitest_1.expect)(out.primary?.usedPercent).toBe(100)
		;(0, vitest_1.expect)(out.secondary?.usedPercent).toBe(0)
		;(0, vitest_1.expect)(out.fetchedAt).toBe(fetchedAt)
	})
})
