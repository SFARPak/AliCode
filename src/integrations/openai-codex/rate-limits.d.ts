import type { OpenAiCodexRateLimitInfo } from "@ali-code/types"
export declare function parseOpenAiCodexUsagePayload(payload: unknown, fetchedAt: number): OpenAiCodexRateLimitInfo
export declare function fetchOpenAiCodexRateLimitInfo(
	accessToken: string,
	options?: {
		accountId?: string | null
	},
): Promise<OpenAiCodexRateLimitInfo>
//# sourceMappingURL=rate-limits.d.ts.map
