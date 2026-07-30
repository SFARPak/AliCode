/**
 * Context Management Types
 *
 * This module provides type definitions for context management events.
 * These events are used to handle different strategies for managing conversation context
 * when approaching token limits.
 *
 * Event Types:
 * - `condense_context`: Context was condensed using AI summarization
 * - `condense_context_error`: An error occurred during context condensation
 * - `sliding_window_truncation`: Context was truncated using sliding window strategy
 */
/**
 * Array of all context management event types.
 * Used for runtime type checking.
 */
export declare const CONTEXT_MANAGEMENT_EVENTS: readonly [
	"condense_context",
	"condense_context_error",
	"sliding_window_truncation",
]
/**
 * Union type representing all possible context management event types.
 */
export type ContextManagementEvent = (typeof CONTEXT_MANAGEMENT_EVENTS)[number]
/**
 * Type guard function to check if a value is a valid context management event.
 */
export declare function isContextManagementEvent(value: unknown): value is ContextManagementEvent
//# sourceMappingURL=context-management.d.ts.map
