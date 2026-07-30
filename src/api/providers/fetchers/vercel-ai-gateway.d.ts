import { z } from "zod"
import type { ModelInfo } from "@ali-code/types"
import type { ApiHandlerOptions } from "../../../shared/api"
/**
 * VercelAiGatewayModel
 */
declare const vercelAiGatewayModelSchema: z.ZodObject<
	{
		id: z.ZodString
		object: z.ZodString
		created: z.ZodNumber
		owned_by: z.ZodString
		name: z.ZodString
		description: z.ZodString
		context_window: z.ZodNumber
		max_tokens: z.ZodNumber
		type: z.ZodString
		pricing: z.ZodObject<
			{
				input: z.ZodOptional<z.ZodString>
				output: z.ZodOptional<z.ZodString>
				input_cache_write: z.ZodOptional<z.ZodString>
				input_cache_read: z.ZodOptional<z.ZodString>
				image: z.ZodOptional<z.ZodString>
			},
			"strip",
			z.ZodTypeAny,
			{
				image?: string | undefined
				input?: string | undefined
				output?: string | undefined
				input_cache_write?: string | undefined
				input_cache_read?: string | undefined
			},
			{
				image?: string | undefined
				input?: string | undefined
				output?: string | undefined
				input_cache_write?: string | undefined
				input_cache_read?: string | undefined
			}
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		object: string
		type: string
		id: string
		max_tokens: number
		description: string
		name: string
		created: number
		pricing: {
			image?: string | undefined
			input?: string | undefined
			output?: string | undefined
			input_cache_write?: string | undefined
			input_cache_read?: string | undefined
		}
		owned_by: string
		context_window: number
	},
	{
		object: string
		type: string
		id: string
		max_tokens: number
		description: string
		name: string
		created: number
		pricing: {
			image?: string | undefined
			input?: string | undefined
			output?: string | undefined
			input_cache_write?: string | undefined
			input_cache_read?: string | undefined
		}
		owned_by: string
		context_window: number
	}
>
export type VercelAiGatewayModel = z.infer<typeof vercelAiGatewayModelSchema>
/**
 * getVercelAiGatewayModels
 */
export declare function getVercelAiGatewayModels(options?: ApiHandlerOptions): Promise<Record<string, ModelInfo>>
/**
 * parseVercelAiGatewayModel
 */
export declare const parseVercelAiGatewayModel: ({
	id,
	model,
}: {
	id: string
	model: VercelAiGatewayModel
}) => ModelInfo
export {}
//# sourceMappingURL=vercel-ai-gateway.d.ts.map
