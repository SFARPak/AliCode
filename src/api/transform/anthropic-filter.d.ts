import { Anthropic } from "@anthropic-ai/sdk"
/**
 * Set of content block types that are valid for Anthropic API.
 * Only these types will be passed through to the API.
 * See: https://docs.anthropic.com/en/api/messages
 */
export declare const VALID_ANTHROPIC_BLOCK_TYPES: Set<string>
/**
 * Filters out non-Anthropic content blocks from messages before sending to Anthropic/Vertex API.
 * Uses an allowlist approach - only blocks with types in VALID_ANTHROPIC_BLOCK_TYPES are kept.
 * This automatically filters out:
 * - Internal "reasoning" blocks (AliCode's internal representation)
 * - Gemini's "thoughtSignature" blocks (encrypted reasoning continuity tokens)
 * - Any other unknown block types
 */
export declare function filterNonAnthropicBlocks(
	messages: Anthropic.Messages.MessageParam[],
): Anthropic.Messages.MessageParam[]
//# sourceMappingURL=anthropic-filter.d.ts.map
