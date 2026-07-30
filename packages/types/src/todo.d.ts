import { z } from "zod"
/**
 * TodoStatus
 */
export declare const todoStatusSchema: z.ZodEnum<["pending", "in_progress", "completed"]>
export type TodoStatus = z.infer<typeof todoStatusSchema>
/**
 * TodoItem
 */
export declare const todoItemSchema: z.ZodObject<
	{
		id: z.ZodString
		content: z.ZodString
		status: z.ZodEnum<["pending", "in_progress", "completed"]>
	},
	"strip",
	z.ZodTypeAny,
	{
		status: "completed" | "pending" | "in_progress"
		id: string
		content: string
	},
	{
		status: "completed" | "pending" | "in_progress"
		id: string
		content: string
	}
>
export type TodoItem = z.infer<typeof todoItemSchema>
//# sourceMappingURL=todo.d.ts.map
