import { z } from "zod"
export declare const organizationAllowListSchema: z.ZodObject<
	{
		allowAll: z.ZodBoolean
		providers: z.ZodRecord<
			z.ZodString,
			z.ZodObject<
				{
					allowAll: z.ZodBoolean
					models: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
				},
				"strip",
				z.ZodTypeAny,
				{
					allowAll: boolean
					models?: string[] | undefined
				},
				{
					allowAll: boolean
					models?: string[] | undefined
				}
			>
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		allowAll: boolean
		providers: Record<
			string,
			{
				allowAll: boolean
				models?: string[] | undefined
			}
		>
	},
	{
		allowAll: boolean
		providers: Record<
			string,
			{
				allowAll: boolean
				models?: string[] | undefined
			}
		>
	}
>
export type OrganizationAllowList = z.infer<typeof organizationAllowListSchema>
export declare const ORGANIZATION_ALLOW_ALL: OrganizationAllowList
//# sourceMappingURL=organization.d.ts.map
