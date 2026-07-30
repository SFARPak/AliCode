import { z } from "zod"
import { type ModelInfo } from "@ali-code/types"
import type { ApiHandlerOptions } from "../../../shared/api"
declare const modelRouterBaseModelSchema: z.ZodObject<
	{
		name: z.ZodString
		description: z.ZodOptional<z.ZodString>
		context_length: z.ZodNumber
		max_completion_tokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
		pricing: z.ZodOptional<
			z.ZodObject<
				{
					prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>
					completion: z.ZodOptional<z.ZodNullable<z.ZodString>>
					input_cache_write: z.ZodOptional<z.ZodNullable<z.ZodString>>
					input_cache_read: z.ZodOptional<z.ZodNullable<z.ZodString>>
				},
				"strip",
				z.ZodTypeAny,
				{
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
				},
				{
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
				}
			>
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		name: string
		context_length: number
		description?: string | undefined
		max_completion_tokens?: number | null | undefined
		pricing?:
			| {
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
			  }
			| undefined
	},
	{
		name: string
		context_length: number
		description?: string | undefined
		max_completion_tokens?: number | null | undefined
		pricing?:
			| {
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
			  }
			| undefined
	}
>
export type OpenRouterBaseModel = z.infer<typeof modelRouterBaseModelSchema>
/**
 * OpenRouterModel
 */
export declare const openRouterModelSchema: z.ZodObject<
	{
		name: z.ZodString
		description: z.ZodOptional<z.ZodString>
		context_length: z.ZodNumber
		max_completion_tokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
		pricing: z.ZodOptional<
			z.ZodObject<
				{
					prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>
					completion: z.ZodOptional<z.ZodNullable<z.ZodString>>
					input_cache_write: z.ZodOptional<z.ZodNullable<z.ZodString>>
					input_cache_read: z.ZodOptional<z.ZodNullable<z.ZodString>>
				},
				"strip",
				z.ZodTypeAny,
				{
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
				},
				{
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
				}
			>
		>
	} & {
		id: z.ZodString
		architecture: z.ZodOptional<
			z.ZodObject<
				{
					input_modalities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>
					output_modalities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>
					tokenizer: z.ZodOptional<z.ZodNullable<z.ZodString>>
				},
				"strip",
				z.ZodTypeAny,
				{
					input_modalities?: string[] | null | undefined
					output_modalities?: string[] | null | undefined
					tokenizer?: string | null | undefined
				},
				{
					input_modalities?: string[] | null | undefined
					output_modalities?: string[] | null | undefined
					tokenizer?: string | null | undefined
				}
			>
		>
		top_provider: z.ZodOptional<
			z.ZodObject<
				{
					max_completion_tokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				},
				"strip",
				z.ZodTypeAny,
				{
					max_completion_tokens?: number | null | undefined
				},
				{
					max_completion_tokens?: number | null | undefined
				}
			>
		>
		supported_parameters: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
	},
	"strip",
	z.ZodTypeAny,
	{
		id: string
		name: string
		context_length: number
		description?: string | undefined
		max_completion_tokens?: number | null | undefined
		pricing?:
			| {
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
			  }
			| undefined
		architecture?:
			| {
					input_modalities?: string[] | null | undefined
					output_modalities?: string[] | null | undefined
					tokenizer?: string | null | undefined
			  }
			| undefined
		top_provider?:
			| {
					max_completion_tokens?: number | null | undefined
			  }
			| undefined
		supported_parameters?: string[] | undefined
	},
	{
		id: string
		name: string
		context_length: number
		description?: string | undefined
		max_completion_tokens?: number | null | undefined
		pricing?:
			| {
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
			  }
			| undefined
		architecture?:
			| {
					input_modalities?: string[] | null | undefined
					output_modalities?: string[] | null | undefined
					tokenizer?: string | null | undefined
			  }
			| undefined
		top_provider?:
			| {
					max_completion_tokens?: number | null | undefined
			  }
			| undefined
		supported_parameters?: string[] | undefined
	}
>
export type OpenRouterModel = z.infer<typeof openRouterModelSchema>
/**
 * OpenRouterModelEndpoint
 */
export declare const openRouterModelEndpointSchema: z.ZodObject<
	{
		name: z.ZodString
		description: z.ZodOptional<z.ZodString>
		context_length: z.ZodNumber
		max_completion_tokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
		pricing: z.ZodOptional<
			z.ZodObject<
				{
					prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>
					completion: z.ZodOptional<z.ZodNullable<z.ZodString>>
					input_cache_write: z.ZodOptional<z.ZodNullable<z.ZodString>>
					input_cache_read: z.ZodOptional<z.ZodNullable<z.ZodString>>
				},
				"strip",
				z.ZodTypeAny,
				{
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
				},
				{
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
				}
			>
		>
	} & {
		provider_name: z.ZodString
		tag: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		name: string
		context_length: number
		provider_name: string
		description?: string | undefined
		max_completion_tokens?: number | null | undefined
		pricing?:
			| {
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
			  }
			| undefined
		tag?: string | undefined
	},
	{
		name: string
		context_length: number
		provider_name: string
		description?: string | undefined
		max_completion_tokens?: number | null | undefined
		pricing?:
			| {
					prompt?: string | null | undefined
					completion?: string | null | undefined
					input_cache_write?: string | null | undefined
					input_cache_read?: string | null | undefined
			  }
			| undefined
		tag?: string | undefined
	}
>
export type OpenRouterModelEndpoint = z.infer<typeof openRouterModelEndpointSchema>
/**
 * getOpenRouterModels
 */
export declare function getOpenRouterModels(options?: ApiHandlerOptions): Promise<Record<string, ModelInfo>>
/**
 * getOpenRouterModelEndpoints
 */
export declare function getOpenRouterModelEndpoints(
	modelId: string,
	options?: ApiHandlerOptions,
): Promise<Record<string, ModelInfo>>
/**
 * parseOpenRouterModel
 */
export declare const parseOpenRouterModel: ({
	id,
	model,
	inputModality,
	outputModality,
	maxTokens,
	supportedParameters,
}: {
	id: string
	model: OpenRouterBaseModel
	inputModality: string[] | null | undefined
	outputModality: string[] | null | undefined
	maxTokens: number | null | undefined
	supportedParameters?: string[]
}) => ModelInfo
export {}
//# sourceMappingURL=openrouter.d.ts.map
