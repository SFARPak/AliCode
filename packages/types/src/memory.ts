import { z } from "zod"

/**
 * MemoryScope - controls where memory items are stored and retrieved
 */
export const memoryScopeSchema = z.enum(["project", "workspace", "global"])
export type MemoryScope = z.infer<typeof memoryScopeSchema>

/**
 * MemorySource - which markdown file a typed memory item lives in
 */
export const memorySourceSchema = z.enum(["project.md", "environment.md", "corrections.md"])
export type MemorySource = z.infer<typeof memorySourceSchema>

/**
 * MemoryMode - determines how recall searches are performed
 */
export const memoryModeSchema = z.enum(["search", "typed", "digest"])
export type MemoryMode = z.infer<typeof memoryModeSchema>

/**
 * TypedMemoryItem - a single structured memory entry
 */
export const typedMemoryItemSchema = z.object({
	id: z.string(),
	scope: memoryScopeSchema,
	source: memorySourceSchema,
	section: z.string().optional(),
	key: z.string(),
	text: z.string(),
	created: z.number(),
	modified: z.number(),
})
export type TypedMemoryItem = z.infer<typeof typedMemoryItemSchema>

/**
 * MemoryRecallResult - the returned blocks from a recall query
 */
export const memoryRecallResultSchema = z.object({
	blocks: z.array(z.string()),
	hits: z.number().optional(),
	topics: z.array(z.string()).optional(),
	files: z.array(z.string()).optional(),
})
export type MemoryRecallResult = z.infer<typeof memoryRecallResultSchema>

/**
 * MemorySettings - user-configurable memory preferences
 */
export const memorySettingsSchema = z.object({
	/** Whether the memory system is enabled */
	enabled: z.boolean().default(false),
	/** Default scope for storing new memories */
	defaultScope: memoryScopeSchema.default("project"),
	/** Auto-inject relevant memories into context */
	autoInject: z.boolean().default(true),
	/** Maximum bytes of memory to inject per context refresh */
	maxInjectionBytes: z.number().default(4096),
	/** Maximum number of session digest files to retain */
	maxSessionFiles: z.number().default(20),
	/** Maximum number of recent sessions indexed */
	maxRecentSessions: z.number().default(5),
})
export type MemorySettings = z.infer<typeof memorySettingsSchema>

/**
 * MemoryState - persisted state for the memory subsystem
 */
export const memoryStateSchema = z.object({
	version: z.number().default(1),
	enabled: z.boolean(),
	scope: memoryScopeSchema.default("project"),
	autoInject: z.boolean().default(true),
	capture: z
		.object({
			mode: z.enum(["selective"]).default("selective"),
			maxOpsPerRun: z.number().default(16),
			minIntervalMs: z.number().default(300_000),
		})
		.default({}),
	stats: z
		.object({
			recallCalls: z.number().default(0),
			injectedCalls: z.number().default(0),
			lastBuildMs: z.number().default(0),
			lastCaptureMs: z.number().default(0),
		})
		.default({}),
})
export type MemoryState = z.infer<typeof memoryStateSchema>
