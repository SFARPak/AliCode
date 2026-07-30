import { CacheStrategy } from "./base-strategy"
import { CacheResult } from "./types"
/**
 * Strategy for handling multiple cache points.
 * Creates cache points after messages as soon as uncached tokens exceed minimumTokenCount.
 */
export declare class MultiPointStrategy extends CacheStrategy {
	/**
	 * Determine optimal cache point placements and return the formatted result
	 */
	determineOptimalCachePoints(): CacheResult
	/**
	 * Determine optimal cache point placements for messages
	 * This method handles both new conversations and growing conversations
	 *
	 * @param minTokensPerPoint Minimum tokens required per cache point
	 * @param remainingCachePoints Number of cache points available
	 * @returns Array of cache point placements
	 */
	private determineMessageCachePoints
	/**
	 * Find the optimal placement for a cache point within a specified range of messages
	 * Simply finds the last user message in the range
	 */
	private findOptimalPlacementForRange
	/**
	 * Format result without cache points
	 *
	 * @returns Cache result without cache points
	 */
	private formatWithoutCachePoints
}
//# sourceMappingURL=multi-point-strategy.d.ts.map
