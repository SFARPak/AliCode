import { z } from "zod"
export declare const recordSourceSchema: z.ZodEnum<["read_tool", "user_edited", "roo_edited", "file_mentioned"]>
export type RecordSource = z.infer<typeof recordSourceSchema>
export declare const fileMetadataEntrySchema: z.ZodObject<
	{
		path: z.ZodString
		record_state: z.ZodEnum<["active", "stale"]>
		record_source: z.ZodEnum<["read_tool", "user_edited", "roo_edited", "file_mentioned"]>
		roo_read_date: z.ZodNullable<z.ZodNumber>
		roo_edit_date: z.ZodNullable<z.ZodNumber>
		user_edit_date: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
	},
	"strip",
	z.ZodTypeAny,
	{
		path: string
		record_state: "active" | "stale"
		record_source: "read_tool" | "user_edited" | "roo_edited" | "file_mentioned"
		roo_read_date: number | null
		roo_edit_date: number | null
		user_edit_date?: number | null | undefined
	},
	{
		path: string
		record_state: "active" | "stale"
		record_source: "read_tool" | "user_edited" | "roo_edited" | "file_mentioned"
		roo_read_date: number | null
		roo_edit_date: number | null
		user_edit_date?: number | null | undefined
	}
>
export type FileMetadataEntry = z.infer<typeof fileMetadataEntrySchema>
export declare const taskMetadataSchema: z.ZodObject<
	{
		files_in_context: z.ZodArray<
			z.ZodObject<
				{
					path: z.ZodString
					record_state: z.ZodEnum<["active", "stale"]>
					record_source: z.ZodEnum<["read_tool", "user_edited", "roo_edited", "file_mentioned"]>
					roo_read_date: z.ZodNullable<z.ZodNumber>
					roo_edit_date: z.ZodNullable<z.ZodNumber>
					user_edit_date: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				},
				"strip",
				z.ZodTypeAny,
				{
					path: string
					record_state: "active" | "stale"
					record_source: "read_tool" | "user_edited" | "roo_edited" | "file_mentioned"
					roo_read_date: number | null
					roo_edit_date: number | null
					user_edit_date?: number | null | undefined
				},
				{
					path: string
					record_state: "active" | "stale"
					record_source: "read_tool" | "user_edited" | "roo_edited" | "file_mentioned"
					roo_read_date: number | null
					roo_edit_date: number | null
					user_edit_date?: number | null | undefined
				}
			>,
			"many"
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		files_in_context: {
			path: string
			record_state: "active" | "stale"
			record_source: "read_tool" | "user_edited" | "roo_edited" | "file_mentioned"
			roo_read_date: number | null
			roo_edit_date: number | null
			user_edit_date?: number | null | undefined
		}[]
	},
	{
		files_in_context: {
			path: string
			record_state: "active" | "stale"
			record_source: "read_tool" | "user_edited" | "roo_edited" | "file_mentioned"
			roo_read_date: number | null
			roo_edit_date: number | null
			user_edit_date?: number | null | undefined
		}[]
	}
>
export type TaskMetadata = z.infer<typeof taskMetadataSchema>
//# sourceMappingURL=FileContextTrackerTypes.d.ts.map
