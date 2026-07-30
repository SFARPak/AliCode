import { z } from "zod"
/**
 * Codebase Index Constants
 */
export declare const CODEBASE_INDEX_DEFAULTS: {
	readonly MIN_SEARCH_RESULTS: 10
	readonly MAX_SEARCH_RESULTS: 200
	readonly DEFAULT_SEARCH_RESULTS: 50
	readonly SEARCH_RESULTS_STEP: 10
	readonly MIN_SEARCH_SCORE: 0
	readonly MAX_SEARCH_SCORE: 1
	readonly DEFAULT_SEARCH_MIN_SCORE: 0.4
	readonly SEARCH_SCORE_STEP: 0.05
}
/**
 * CodebaseIndexConfig
 */
export declare const codebaseIndexConfigSchema: z.ZodObject<
	{
		codebaseIndexEnabled: z.ZodOptional<z.ZodBoolean>
		codebaseIndexQdrantUrl: z.ZodOptional<z.ZodString>
		codebaseIndexEmbedderProvider: z.ZodOptional<
			z.ZodEnum<
				[
					"openai",
					"ollama",
					"openai-compatible",
					"gemini",
					"mistral",
					"vercel-ai-gateway",
					"bedrock",
					"openrouter",
				]
			>
		>
		codebaseIndexEmbedderBaseUrl: z.ZodOptional<z.ZodString>
		codebaseIndexEmbedderModelId: z.ZodOptional<z.ZodString>
		codebaseIndexEmbedderModelDimension: z.ZodOptional<z.ZodNumber>
		codebaseIndexSearchMinScore: z.ZodOptional<z.ZodNumber>
		codebaseIndexSearchMaxResults: z.ZodOptional<z.ZodNumber>
		codebaseIndexOpenAiCompatibleBaseUrl: z.ZodOptional<z.ZodString>
		codebaseIndexOpenAiCompatibleModelDimension: z.ZodOptional<z.ZodNumber>
		codebaseIndexBedrockRegion: z.ZodOptional<z.ZodString>
		codebaseIndexBedrockProfile: z.ZodOptional<z.ZodString>
		codebaseIndexOpenRouterSpecificProvider: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		codebaseIndexEnabled?: boolean | undefined
		codebaseIndexQdrantUrl?: string | undefined
		codebaseIndexEmbedderProvider?:
			| "openai"
			| "ollama"
			| "openai-compatible"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
			| undefined
		codebaseIndexEmbedderBaseUrl?: string | undefined
		codebaseIndexEmbedderModelId?: string | undefined
		codebaseIndexEmbedderModelDimension?: number | undefined
		codebaseIndexSearchMinScore?: number | undefined
		codebaseIndexSearchMaxResults?: number | undefined
		codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
		codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
		codebaseIndexBedrockRegion?: string | undefined
		codebaseIndexBedrockProfile?: string | undefined
		codebaseIndexOpenRouterSpecificProvider?: string | undefined
	},
	{
		codebaseIndexEnabled?: boolean | undefined
		codebaseIndexQdrantUrl?: string | undefined
		codebaseIndexEmbedderProvider?:
			| "openai"
			| "ollama"
			| "openai-compatible"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
			| undefined
		codebaseIndexEmbedderBaseUrl?: string | undefined
		codebaseIndexEmbedderModelId?: string | undefined
		codebaseIndexEmbedderModelDimension?: number | undefined
		codebaseIndexSearchMinScore?: number | undefined
		codebaseIndexSearchMaxResults?: number | undefined
		codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
		codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
		codebaseIndexBedrockRegion?: string | undefined
		codebaseIndexBedrockProfile?: string | undefined
		codebaseIndexOpenRouterSpecificProvider?: string | undefined
	}
>
export type CodebaseIndexConfig = z.infer<typeof codebaseIndexConfigSchema>
/**
 * CodebaseIndexModels
 */
export declare const codebaseIndexModelsSchema: z.ZodObject<
	{
		openai: z.ZodOptional<
			z.ZodRecord<
				z.ZodString,
				z.ZodObject<
					{
						dimension: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						dimension: number
					},
					{
						dimension: number
					}
				>
			>
		>
		ollama: z.ZodOptional<
			z.ZodRecord<
				z.ZodString,
				z.ZodObject<
					{
						dimension: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						dimension: number
					},
					{
						dimension: number
					}
				>
			>
		>
		"openai-compatible": z.ZodOptional<
			z.ZodRecord<
				z.ZodString,
				z.ZodObject<
					{
						dimension: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						dimension: number
					},
					{
						dimension: number
					}
				>
			>
		>
		gemini: z.ZodOptional<
			z.ZodRecord<
				z.ZodString,
				z.ZodObject<
					{
						dimension: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						dimension: number
					},
					{
						dimension: number
					}
				>
			>
		>
		mistral: z.ZodOptional<
			z.ZodRecord<
				z.ZodString,
				z.ZodObject<
					{
						dimension: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						dimension: number
					},
					{
						dimension: number
					}
				>
			>
		>
		"vercel-ai-gateway": z.ZodOptional<
			z.ZodRecord<
				z.ZodString,
				z.ZodObject<
					{
						dimension: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						dimension: number
					},
					{
						dimension: number
					}
				>
			>
		>
		openrouter: z.ZodOptional<
			z.ZodRecord<
				z.ZodString,
				z.ZodObject<
					{
						dimension: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						dimension: number
					},
					{
						dimension: number
					}
				>
			>
		>
		bedrock: z.ZodOptional<
			z.ZodRecord<
				z.ZodString,
				z.ZodObject<
					{
						dimension: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						dimension: number
					},
					{
						dimension: number
					}
				>
			>
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		openai?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		ollama?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		"openai-compatible"?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		gemini?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		mistral?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		"vercel-ai-gateway"?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		bedrock?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		openrouter?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
	},
	{
		openai?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		ollama?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		"openai-compatible"?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		gemini?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		mistral?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		"vercel-ai-gateway"?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		bedrock?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
		openrouter?:
			| Record<
					string,
					{
						dimension: number
					}
			  >
			| undefined
	}
>
export type CodebaseIndexModels = z.infer<typeof codebaseIndexModelsSchema>
/**
 * CdebaseIndexProvider
 */
export declare const codebaseIndexProviderSchema: z.ZodObject<
	{
		codeIndexOpenAiKey: z.ZodOptional<z.ZodString>
		codeIndexQdrantApiKey: z.ZodOptional<z.ZodString>
		codebaseIndexOpenAiCompatibleBaseUrl: z.ZodOptional<z.ZodString>
		codebaseIndexOpenAiCompatibleApiKey: z.ZodOptional<z.ZodString>
		codebaseIndexOpenAiCompatibleModelDimension: z.ZodOptional<z.ZodNumber>
		codebaseIndexGeminiApiKey: z.ZodOptional<z.ZodString>
		codebaseIndexMistralApiKey: z.ZodOptional<z.ZodString>
		codebaseIndexVercelAiGatewayApiKey: z.ZodOptional<z.ZodString>
		codebaseIndexOpenRouterApiKey: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
		codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
		codeIndexOpenAiKey?: string | undefined
		codeIndexQdrantApiKey?: string | undefined
		codebaseIndexOpenAiCompatibleApiKey?: string | undefined
		codebaseIndexGeminiApiKey?: string | undefined
		codebaseIndexMistralApiKey?: string | undefined
		codebaseIndexVercelAiGatewayApiKey?: string | undefined
		codebaseIndexOpenRouterApiKey?: string | undefined
	},
	{
		codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
		codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
		codeIndexOpenAiKey?: string | undefined
		codeIndexQdrantApiKey?: string | undefined
		codebaseIndexOpenAiCompatibleApiKey?: string | undefined
		codebaseIndexGeminiApiKey?: string | undefined
		codebaseIndexMistralApiKey?: string | undefined
		codebaseIndexVercelAiGatewayApiKey?: string | undefined
		codebaseIndexOpenRouterApiKey?: string | undefined
	}
>
export type CodebaseIndexProvider = z.infer<typeof codebaseIndexProviderSchema>
//# sourceMappingURL=codebase-index.d.ts.map
