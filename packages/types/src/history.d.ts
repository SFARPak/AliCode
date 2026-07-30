import { z } from "zod"
/**
 * HistoryItem
 */
export declare const historyItemSchema: z.ZodObject<
	{
		id: z.ZodString
		rootTaskId: z.ZodOptional<z.ZodString>
		parentTaskId: z.ZodOptional<z.ZodString>
		number: z.ZodNumber
		ts: z.ZodNumber
		task: z.ZodString
		tokensIn: z.ZodNumber
		tokensOut: z.ZodNumber
		cacheWrites: z.ZodOptional<z.ZodNumber>
		cacheReads: z.ZodOptional<z.ZodNumber>
		totalCost: z.ZodNumber
		size: z.ZodOptional<z.ZodNumber>
		workspace: z.ZodOptional<z.ZodString>
		mode: z.ZodOptional<z.ZodString>
		apiConfigName: z.ZodOptional<z.ZodString>
		status: z.ZodOptional<z.ZodEnum<["active", "completed", "delegated"]>>
		delegatedToId: z.ZodOptional<z.ZodString>
		childIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
		awaitingChildId: z.ZodOptional<z.ZodString>
		completedByChildId: z.ZodOptional<z.ZodString>
		completionResultSummary: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		number: number
		ts: number
		totalCost: number
		id: string
		task: string
		tokensIn: number
		tokensOut: number
		status?: "active" | "completed" | "delegated" | undefined
		rootTaskId?: string | undefined
		parentTaskId?: string | undefined
		cacheWrites?: number | undefined
		cacheReads?: number | undefined
		size?: number | undefined
		workspace?: string | undefined
		mode?: string | undefined
		apiConfigName?: string | undefined
		delegatedToId?: string | undefined
		childIds?: string[] | undefined
		awaitingChildId?: string | undefined
		completedByChildId?: string | undefined
		completionResultSummary?: string | undefined
	},
	{
		number: number
		ts: number
		totalCost: number
		id: string
		task: string
		tokensIn: number
		tokensOut: number
		status?: "active" | "completed" | "delegated" | undefined
		rootTaskId?: string | undefined
		parentTaskId?: string | undefined
		cacheWrites?: number | undefined
		cacheReads?: number | undefined
		size?: number | undefined
		workspace?: string | undefined
		mode?: string | undefined
		apiConfigName?: string | undefined
		delegatedToId?: string | undefined
		childIds?: string[] | undefined
		awaitingChildId?: string | undefined
		completedByChildId?: string | undefined
		completionResultSummary?: string | undefined
	}
>
export type HistoryItem = z.infer<typeof historyItemSchema>
//# sourceMappingURL=history.d.ts.map
