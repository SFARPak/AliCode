import { z } from "zod"
import { DynamicProvider, LocalProvider } from "./provider-settings.js"
/**
 * ReasoningEffort
 */
export declare const reasoningEfforts: readonly ["low", "medium", "high"]
export declare const reasoningEffortsSchema: z.ZodEnum<["low", "medium", "high"]>
export type ReasoningEffort = z.infer<typeof reasoningEffortsSchema>
/**
 * ReasoningEffortWithMinimal
 */
export declare const reasoningEffortWithMinimalSchema: z.ZodUnion<
	[z.ZodEnum<["low", "medium", "high"]>, z.ZodLiteral<"minimal">]
>
export type ReasoningEffortWithMinimal = z.infer<typeof reasoningEffortWithMinimalSchema>
/**
 * Extended Reasoning Effort (includes "none" and "minimal")
 * Note: "disable" is a UI/control value, not a value sent as effort
 */
export declare const reasoningEffortsExtended: readonly ["none", "minimal", "low", "medium", "high", "xhigh"]
export declare const reasoningEffortExtendedSchema: z.ZodEnum<["none", "minimal", "low", "medium", "high", "xhigh"]>
export type ReasoningEffortExtended = z.infer<typeof reasoningEffortExtendedSchema>
/**
 * Reasoning Effort user setting (includes "disable")
 */
export declare const reasoningEffortSettingValues: readonly [
	"disable",
	"none",
	"minimal",
	"low",
	"medium",
	"high",
	"xhigh",
]
export declare const reasoningEffortSettingSchema: z.ZodEnum<
	["disable", "none", "minimal", "low", "medium", "high", "xhigh"]
>
/**
 * Verbosity
 */
export declare const verbosityLevels: readonly ["low", "medium", "high"]
export declare const verbosityLevelsSchema: z.ZodEnum<["low", "medium", "high"]>
export type VerbosityLevel = z.infer<typeof verbosityLevelsSchema>
/**
 * Service tiers (OpenAI Responses API)
 */
export declare const serviceTiers: readonly ["default", "flex", "priority"]
export declare const serviceTierSchema: z.ZodEnum<["default", "flex", "priority"]>
export type ServiceTier = z.infer<typeof serviceTierSchema>
/**
 * ModelParameter
 */
export declare const modelParameters: readonly ["max_tokens", "temperature", "reasoning", "include_reasoning"]
export declare const modelParametersSchema: z.ZodEnum<["max_tokens", "temperature", "reasoning", "include_reasoning"]>
export type ModelParameter = z.infer<typeof modelParametersSchema>
export declare const isModelParameter: (value: string) => value is ModelParameter
/**
 * ModelInfo
 */
export declare const modelInfoSchema: z.ZodObject<
	{
		maxTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
		maxThinkingTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
		contextWindow: z.ZodNumber
		supportsImages: z.ZodOptional<z.ZodBoolean>
		supportsPromptCache: z.ZodBoolean
		promptCacheRetention: z.ZodOptional<z.ZodEnum<["in_memory", "24h"]>>
		supportsVerbosity: z.ZodOptional<z.ZodBoolean>
		supportsReasoningBudget: z.ZodOptional<z.ZodBoolean>
		supportsReasoningBinary: z.ZodOptional<z.ZodBoolean>
		supportsTemperature: z.ZodOptional<z.ZodBoolean>
		defaultTemperature: z.ZodOptional<z.ZodNumber>
		requiredReasoningBudget: z.ZodOptional<z.ZodBoolean>
		supportsReasoningEffort: z.ZodOptional<
			z.ZodUnion<
				[
					z.ZodBoolean,
					z.ZodArray<z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>, "many">,
				]
			>
		>
		requiredReasoningEffort: z.ZodOptional<z.ZodBoolean>
		preserveReasoning: z.ZodOptional<z.ZodBoolean>
		supportedParameters: z.ZodOptional<
			z.ZodArray<z.ZodEnum<["max_tokens", "temperature", "reasoning", "include_reasoning"]>, "many">
		>
		inputPrice: z.ZodOptional<z.ZodNumber>
		outputPrice: z.ZodOptional<z.ZodNumber>
		cacheWritesPrice: z.ZodOptional<z.ZodNumber>
		cacheReadsPrice: z.ZodOptional<z.ZodNumber>
		longContextPricing: z.ZodOptional<
			z.ZodObject<
				{
					thresholdTokens: z.ZodNumber
					inputPriceMultiplier: z.ZodOptional<z.ZodNumber>
					outputPriceMultiplier: z.ZodOptional<z.ZodNumber>
					cacheWritesPriceMultiplier: z.ZodOptional<z.ZodNumber>
					cacheReadsPriceMultiplier: z.ZodOptional<z.ZodNumber>
					appliesToServiceTiers: z.ZodOptional<z.ZodArray<z.ZodEnum<["default", "flex", "priority"]>, "many">>
				},
				"strip",
				z.ZodTypeAny,
				{
					thresholdTokens: number
					inputPriceMultiplier?: number | undefined
					outputPriceMultiplier?: number | undefined
					cacheWritesPriceMultiplier?: number | undefined
					cacheReadsPriceMultiplier?: number | undefined
					appliesToServiceTiers?: ("default" | "flex" | "priority")[] | undefined
				},
				{
					thresholdTokens: number
					inputPriceMultiplier?: number | undefined
					outputPriceMultiplier?: number | undefined
					cacheWritesPriceMultiplier?: number | undefined
					cacheReadsPriceMultiplier?: number | undefined
					appliesToServiceTiers?: ("default" | "flex" | "priority")[] | undefined
				}
			>
		>
		description: z.ZodOptional<z.ZodString>
		reasoningEffort: z.ZodOptional<z.ZodEnum<["none", "minimal", "low", "medium", "high", "xhigh"]>>
		minTokensPerCachePoint: z.ZodOptional<z.ZodNumber>
		maxCachePoints: z.ZodOptional<z.ZodNumber>
		cachableFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
		deprecated: z.ZodOptional<z.ZodBoolean>
		isStealthModel: z.ZodOptional<z.ZodBoolean>
		isFree: z.ZodOptional<z.ZodBoolean>
		excludedTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
		includedTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
		/**
		 * Service tiers with pricing information.
		 * Each tier can have a name (for OpenAI service tiers) and pricing overrides.
		 * The top-level input/output/cache* fields represent the default/standard tier.
		 */
		tiers: z.ZodOptional<
			z.ZodArray<
				z.ZodObject<
					{
						name: z.ZodOptional<z.ZodEnum<["default", "flex", "priority"]>>
						contextWindow: z.ZodNumber
						inputPrice: z.ZodOptional<z.ZodNumber>
						outputPrice: z.ZodOptional<z.ZodNumber>
						cacheWritesPrice: z.ZodOptional<z.ZodNumber>
						cacheReadsPrice: z.ZodOptional<z.ZodNumber>
					},
					"strip",
					z.ZodTypeAny,
					{
						contextWindow: number
						inputPrice?: number | undefined
						outputPrice?: number | undefined
						cacheWritesPrice?: number | undefined
						cacheReadsPrice?: number | undefined
						name?: "default" | "flex" | "priority" | undefined
					},
					{
						contextWindow: number
						inputPrice?: number | undefined
						outputPrice?: number | undefined
						cacheWritesPrice?: number | undefined
						cacheReadsPrice?: number | undefined
						name?: "default" | "flex" | "priority" | undefined
					}
				>,
				"many"
			>
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		contextWindow: number
		supportsPromptCache: boolean
		maxTokens?: number | null | undefined
		maxThinkingTokens?: number | null | undefined
		supportsImages?: boolean | undefined
		promptCacheRetention?: "in_memory" | "24h" | undefined
		supportsVerbosity?: boolean | undefined
		supportsReasoningBudget?: boolean | undefined
		supportsReasoningBinary?: boolean | undefined
		supportsTemperature?: boolean | undefined
		defaultTemperature?: number | undefined
		requiredReasoningBudget?: boolean | undefined
		supportsReasoningEffort?:
			| boolean
			| ("disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh")[]
			| undefined
		requiredReasoningEffort?: boolean | undefined
		preserveReasoning?: boolean | undefined
		supportedParameters?: ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[] | undefined
		inputPrice?: number | undefined
		outputPrice?: number | undefined
		cacheWritesPrice?: number | undefined
		cacheReadsPrice?: number | undefined
		longContextPricing?:
			| {
					thresholdTokens: number
					inputPriceMultiplier?: number | undefined
					outputPriceMultiplier?: number | undefined
					cacheWritesPriceMultiplier?: number | undefined
					cacheReadsPriceMultiplier?: number | undefined
					appliesToServiceTiers?: ("default" | "flex" | "priority")[] | undefined
			  }
			| undefined
		description?: string | undefined
		reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
		minTokensPerCachePoint?: number | undefined
		maxCachePoints?: number | undefined
		cachableFields?: string[] | undefined
		deprecated?: boolean | undefined
		isStealthModel?: boolean | undefined
		isFree?: boolean | undefined
		excludedTools?: string[] | undefined
		includedTools?: string[] | undefined
		tiers?:
			| {
					contextWindow: number
					inputPrice?: number | undefined
					outputPrice?: number | undefined
					cacheWritesPrice?: number | undefined
					cacheReadsPrice?: number | undefined
					name?: "default" | "flex" | "priority" | undefined
			  }[]
			| undefined
	},
	{
		contextWindow: number
		supportsPromptCache: boolean
		maxTokens?: number | null | undefined
		maxThinkingTokens?: number | null | undefined
		supportsImages?: boolean | undefined
		promptCacheRetention?: "in_memory" | "24h" | undefined
		supportsVerbosity?: boolean | undefined
		supportsReasoningBudget?: boolean | undefined
		supportsReasoningBinary?: boolean | undefined
		supportsTemperature?: boolean | undefined
		defaultTemperature?: number | undefined
		requiredReasoningBudget?: boolean | undefined
		supportsReasoningEffort?:
			| boolean
			| ("disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh")[]
			| undefined
		requiredReasoningEffort?: boolean | undefined
		preserveReasoning?: boolean | undefined
		supportedParameters?: ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[] | undefined
		inputPrice?: number | undefined
		outputPrice?: number | undefined
		cacheWritesPrice?: number | undefined
		cacheReadsPrice?: number | undefined
		longContextPricing?:
			| {
					thresholdTokens: number
					inputPriceMultiplier?: number | undefined
					outputPriceMultiplier?: number | undefined
					cacheWritesPriceMultiplier?: number | undefined
					cacheReadsPriceMultiplier?: number | undefined
					appliesToServiceTiers?: ("default" | "flex" | "priority")[] | undefined
			  }
			| undefined
		description?: string | undefined
		reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
		minTokensPerCachePoint?: number | undefined
		maxCachePoints?: number | undefined
		cachableFields?: string[] | undefined
		deprecated?: boolean | undefined
		isStealthModel?: boolean | undefined
		isFree?: boolean | undefined
		excludedTools?: string[] | undefined
		includedTools?: string[] | undefined
		tiers?:
			| {
					contextWindow: number
					inputPrice?: number | undefined
					outputPrice?: number | undefined
					cacheWritesPrice?: number | undefined
					cacheReadsPrice?: number | undefined
					name?: "default" | "flex" | "priority" | undefined
			  }[]
			| undefined
	}
>
export type ModelInfo = z.infer<typeof modelInfoSchema>
export type ModelRecord = Record<string, ModelInfo>
export type RouterModels = Record<DynamicProvider | LocalProvider, ModelRecord>
//# sourceMappingURL=model.d.ts.map
