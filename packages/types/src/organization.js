import { z } from "zod"
export const organizationAllowListSchema = z.object({
	allowAll: z.boolean(),
	providers: z.record(
		z.object({
			allowAll: z.boolean(),
			models: z.array(z.string()).optional(),
		}),
	),
})
export const ORGANIZATION_ALLOW_ALL = {
	allowAll: true,
	providers: {},
}
