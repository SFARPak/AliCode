import { z } from "zod"
import { rooCodeSettingsSchema } from "./global-settings.js"
/**
 * Ali CLI stdin commands
 */
export const rooCliCommandNames = ["start", "message", "cancel", "ping", "shutdown"]
export const rooCliCommandNameSchema = z.enum(rooCliCommandNames)
export const rooCliCommandBaseSchema = z.object({
	command: rooCliCommandNameSchema,
	requestId: z.string().min(1),
})
const rooCliSessionIdSchema = z
	.string()
	.trim()
	.regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
export const rooCliStartCommandSchema = rooCliCommandBaseSchema.extend({
	command: z.literal("start"),
	prompt: z.string(),
	taskId: rooCliSessionIdSchema.optional(),
	images: z.array(z.string()).optional(),
	configuration: rooCodeSettingsSchema.optional(),
})
export const rooCliMessageCommandSchema = rooCliCommandBaseSchema.extend({
	command: z.literal("message"),
	prompt: z.string(),
	images: z.array(z.string()).optional(),
})
export const rooCliCancelCommandSchema = rooCliCommandBaseSchema.extend({
	command: z.literal("cancel"),
})
export const rooCliPingCommandSchema = rooCliCommandBaseSchema.extend({
	command: z.literal("ping"),
})
export const rooCliShutdownCommandSchema = rooCliCommandBaseSchema.extend({
	command: z.literal("shutdown"),
})
export const rooCliInputCommandSchema = z.discriminatedUnion("command", [
	rooCliStartCommandSchema,
	rooCliMessageCommandSchema,
	rooCliCancelCommandSchema,
	rooCliPingCommandSchema,
	rooCliShutdownCommandSchema,
])
/**
 * Ali CLI stream-json output
 */
export const rooCliOutputFormats = ["text", "json", "stream-json"]
export const rooCliOutputFormatSchema = z.enum(rooCliOutputFormats)
export const rooCliEventTypes = [
	"system",
	"control",
	"queue",
	"assistant",
	"user",
	"tool_use",
	"tool_result",
	"thinking",
	"error",
	"result",
]
export const rooCliEventTypeSchema = z.enum(rooCliEventTypes)
export const rooCliControlSubtypes = ["ack", "done", "error"]
export const rooCliControlSubtypeSchema = z.enum(rooCliControlSubtypes)
export const rooCliQueueItemSchema = z.object({
	id: z.string().min(1),
	text: z.string().optional(),
	imageCount: z.number().optional(),
	timestamp: z.number().optional(),
})
export const rooCliToolUseSchema = z.object({
	name: z.string(),
	input: z.record(z.unknown()).optional(),
})
export const rooCliToolResultSchema = z.object({
	name: z.string(),
	output: z.string().optional(),
	error: z.string().optional(),
	exitCode: z.number().optional(),
})
export const rooCliCostSchema = z.object({
	totalCost: z.number().optional(),
	inputTokens: z.number().optional(),
	outputTokens: z.number().optional(),
	cacheWrites: z.number().optional(),
	cacheReads: z.number().optional(),
})
export const rooCliStreamEventSchema = z
	.object({
		type: rooCliEventTypeSchema.optional(),
		subtype: z.string().optional(),
		requestId: z.string().optional(),
		command: rooCliCommandNameSchema.optional(),
		taskId: z.string().optional(),
		code: z.string().optional(),
		content: z.string().optional(),
		success: z.boolean().optional(),
		id: z.number().optional(),
		done: z.boolean().optional(),
		queueDepth: z.number().optional(),
		queue: z.array(rooCliQueueItemSchema).optional(),
		schemaVersion: z.number().optional(),
		protocol: z.string().optional(),
		capabilities: z.array(z.string()).optional(),
		tool_use: rooCliToolUseSchema.optional(),
		tool_result: rooCliToolResultSchema.optional(),
		cost: rooCliCostSchema.optional(),
	})
	.passthrough()
export const rooCliControlEventSchema = rooCliStreamEventSchema.extend({
	type: z.literal("control"),
	subtype: rooCliControlSubtypeSchema,
	requestId: z.string().min(1),
})
export const rooCliFinalOutputSchema = z.object({
	type: z.literal("result"),
	success: z.boolean(),
	content: z.string().optional(),
	cost: rooCliCostSchema.optional(),
	events: z.array(rooCliStreamEventSchema),
})
