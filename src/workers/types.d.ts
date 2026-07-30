import { z } from "zod"
export declare const countTokensResultSchema: z.ZodDiscriminatedUnion<
	"success",
	[
		z.ZodObject<
			{
				success: z.ZodLiteral<true>
				count: z.ZodNumber
			},
			"strip",
			z.ZodTypeAny,
			{
				success: true
				count: number
			},
			{
				success: true
				count: number
			}
		>,
		z.ZodObject<
			{
				success: z.ZodLiteral<false>
				error: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				error: string
				success: false
			},
			{
				error: string
				success: false
			}
		>,
	]
>
export type CountTokensResult = z.infer<typeof countTokensResultSchema>
//# sourceMappingURL=types.d.ts.map
