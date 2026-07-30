import { z } from "zod"
/**
 * ExperimentId
 */
export const experimentIds = ["preventFocusDisruption", "imageGeneration", "runSlashCommand", "customTools"]
export const experimentIdsSchema = z.enum(experimentIds)
/**
 * Experiments
 */
export const experimentsSchema = z.object({
	preventFocusDisruption: z.boolean().optional(),
	imageGeneration: z.boolean().optional(),
	runSlashCommand: z.boolean().optional(),
	customTools: z.boolean().optional(),
})
