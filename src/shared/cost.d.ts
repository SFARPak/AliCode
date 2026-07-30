import type { ModelInfo } from "@ali-code/types"
import type { ServiceTier } from "@ali-code/types"
export interface ApiCostResult {
	totalInputTokens: number
	totalOutputTokens: number
	totalCost: number
}
export declare function calculateApiCostAnthropic(
	modelInfo: ModelInfo,
	inputTokens: number,
	outputTokens: number,
	cacheCreationInputTokens?: number,
	cacheReadInputTokens?: number,
): ApiCostResult
export declare function calculateApiCostOpenAI(
	modelInfo: ModelInfo,
	inputTokens: number,
	outputTokens: number,
	cacheCreationInputTokens?: number,
	cacheReadInputTokens?: number,
	serviceTier?: ServiceTier,
): ApiCostResult
export declare const parseApiPrice: (price: any) => number | undefined
//# sourceMappingURL=cost.d.ts.map
