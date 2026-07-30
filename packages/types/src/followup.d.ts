import { z } from "zod"
/**
 * Interface for follow-up data structure used in follow-up questions
 * This represents the data structure for follow-up questions that the LLM can ask
 * to gather more information needed to complete a task.
 */
export interface FollowUpData {
	/** The question being asked by the LLM */
	question?: string
	/** Array of suggested answers that the user can select */
	suggest?: Array<SuggestionItem>
}
/**
 * Interface for a suggestion item with optional mode switching
 */
export interface SuggestionItem {
	/** The text of the suggestion */
	answer: string
	/** Optional mode to switch to when selecting this suggestion */
	mode?: string
}
/**
 * Zod schema for SuggestionItem
 */
export declare const suggestionItemSchema: z.ZodObject<
	{
		answer: z.ZodString
		mode: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		answer: string
		mode?: string | undefined
	},
	{
		answer: string
		mode?: string | undefined
	}
>
/**
 * Zod schema for FollowUpData
 */
export declare const followUpDataSchema: z.ZodObject<
	{
		question: z.ZodOptional<z.ZodString>
		suggest: z.ZodOptional<
			z.ZodArray<
				z.ZodObject<
					{
						answer: z.ZodString
						mode: z.ZodOptional<z.ZodString>
					},
					"strip",
					z.ZodTypeAny,
					{
						answer: string
						mode?: string | undefined
					},
					{
						answer: string
						mode?: string | undefined
					}
				>,
				"many"
			>
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		question?: string | undefined
		suggest?:
			| {
					answer: string
					mode?: string | undefined
			  }[]
			| undefined
	},
	{
		question?: string | undefined
		suggest?:
			| {
					answer: string
					mode?: string | undefined
			  }[]
			| undefined
	}
>
export type FollowUpDataType = z.infer<typeof followUpDataSchema>
//# sourceMappingURL=followup.d.ts.map
