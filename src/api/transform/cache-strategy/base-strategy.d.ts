import { Anthropic } from "@anthropic-ai/sdk"
import { ContentBlock, SystemContentBlock, Message } from "@aws-sdk/client-bedrock-runtime"
import { CacheStrategyConfig, CacheResult, CachePointPlacement } from "./types"
export declare abstract class CacheStrategy {
	/**
	 * Determine optimal cache point placements and return the formatted result
	 */
	abstract determineOptimalCachePoints(): CacheResult
	protected config: CacheStrategyConfig
	protected systemTokenCount: number
	constructor(config: CacheStrategyConfig)
	/**
	 * Initialize message groups from the input messages
	 */
	protected initializeMessageGroups(): void
	/**
	 * Calculate token count for system prompt using a more accurate approach
	 */
	protected calculateSystemTokens(): void
	/**
	 * Create a cache point content block
	 */
	protected createCachePoint(): ContentBlock
	/**
	 * Convert messages to content blocks
	 */
	protected messagesToContentBlocks(messages: Anthropic.Messages.MessageParam[]): Message[]
	/**
	 * Check if a token count meets the minimum threshold for caching
	 */
	protected meetsMinTokenThreshold(tokenCount: number): boolean
	/**
	 * Estimate token count for a message using a more accurate approach
	 * This implementation is based on the BaseProvider's countTokens method
	 * but adapted to work without requiring an instance of BaseProvider
	 */
	protected estimateTokenCount(message: Anthropic.Messages.MessageParam): number
	/**
	 * Apply cache points to content blocks based on placements
	 */
	protected applyCachePoints(messages: Message[], placements: CachePointPlacement[]): Message[]
	/**
	 * Format the final result with cache points applied
	 */
	protected formatResult(systemBlocks: SystemContentBlock[] | undefined, messages: Message[]): CacheResult
}
//# sourceMappingURL=base-strategy.d.ts.map
