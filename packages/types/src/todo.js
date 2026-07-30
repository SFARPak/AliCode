import { z } from "zod"
/**
 * TodoStatus
 */
export const todoStatusSchema = z.enum(["pending", "in_progress", "completed"])
/**
 * TodoItem
 */
export const todoItemSchema = z.object({
	id: z.string(),
	content: z.string(),
	status: todoStatusSchema,
})
