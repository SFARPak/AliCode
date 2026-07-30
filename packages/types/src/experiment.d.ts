import { z } from "zod"
/**
 * ExperimentId
 */
export declare const experimentIds: readonly [
	"preventFocusDisruption",
	"imageGeneration",
	"runSlashCommand",
	"customTools",
]
export declare const experimentIdsSchema: z.ZodEnum<
	["preventFocusDisruption", "imageGeneration", "runSlashCommand", "customTools"]
>
export type ExperimentId = z.infer<typeof experimentIdsSchema>
/**
 * Experiments
 */
export declare const experimentsSchema: z.ZodObject<
	{
		preventFocusDisruption: z.ZodOptional<z.ZodBoolean>
		imageGeneration: z.ZodOptional<z.ZodBoolean>
		runSlashCommand: z.ZodOptional<z.ZodBoolean>
		customTools: z.ZodOptional<z.ZodBoolean>
	},
	"strip",
	z.ZodTypeAny,
	{
		preventFocusDisruption?: boolean | undefined
		imageGeneration?: boolean | undefined
		runSlashCommand?: boolean | undefined
		customTools?: boolean | undefined
	},
	{
		preventFocusDisruption?: boolean | undefined
		imageGeneration?: boolean | undefined
		runSlashCommand?: boolean | undefined
		customTools?: boolean | undefined
	}
>
export type Experiments = z.infer<typeof experimentsSchema>
//# sourceMappingURL=experiment.d.ts.map
