import { z } from "zod"
/**
 * constants
 */
export declare const DEFAULT_CONSECUTIVE_MISTAKE_LIMIT = 3
/**
 * DynamicProvider
 *
 * Dynamic provider requires external API calls in order to get the model list.
 */
export declare const dynamicProviders: readonly [
	"openrouter",
	"vercel-ai-gateway",
	"litellm",
	"requesty",
	"unbound",
	"poe",
]
export type DynamicProvider = (typeof dynamicProviders)[number]
export declare const isDynamicProvider: (key: string) => key is DynamicProvider
/**
 * LocalProvider
 *
 * Local providers require localhost API calls in order to get the model list.
 */
export declare const localProviders: readonly ["ollama", "lmstudio"]
export type LocalProvider = (typeof localProviders)[number]
export declare const isLocalProvider: (key: string) => key is LocalProvider
/**
 * InternalProvider
 *
 * Internal providers require internal VSCode API calls in order to get the
 * model list.
 */
export declare const internalProviders: readonly ["vscode-lm"]
export type InternalProvider = (typeof internalProviders)[number]
export declare const isInternalProvider: (key: string) => key is InternalProvider
/**
 * CustomProvider
 *
 * Custom providers are completely configurable within Ali Code settings.
 */
export declare const customProviders: readonly ["openai"]
export type CustomProvider = (typeof customProviders)[number]
export declare const isCustomProvider: (key: string) => key is CustomProvider
/**
 * FauxProvider
 *
 * Faux providers do not make external inference calls and therefore do not have
 * model lists.
 */
export declare const fauxProviders: readonly ["fake-ai"]
export type FauxProvider = (typeof fauxProviders)[number]
export declare const isFauxProvider: (key: string) => key is FauxProvider
/**
 * ProviderName
 */
export declare const providerNames: readonly [
	"openrouter",
	"vercel-ai-gateway",
	"litellm",
	"requesty",
	"unbound",
	"poe",
	"ollama",
	"lmstudio",
	"vscode-lm",
	"openai",
	"fake-ai",
	"anthropic",
	"bedrock",
	"baseten",
	"deepseek",
	"fireworks",
	"gemini",
	"gemini-cli",
	"mistral",
	"moonshot",
	"minimax",
	"nvidia-nim",
	"openai-codex",
	"openai-native",
	"qwen-code",
	"sambanova",
	"vertex",
	"xai",
	"zai",
]
export declare const providerNamesSchema: z.ZodEnum<
	[
		"openrouter",
		"vercel-ai-gateway",
		"litellm",
		"requesty",
		"unbound",
		"poe",
		"ollama",
		"lmstudio",
		"vscode-lm",
		"openai",
		"fake-ai",
		"anthropic",
		"bedrock",
		"baseten",
		"deepseek",
		"fireworks",
		"gemini",
		"gemini-cli",
		"mistral",
		"moonshot",
		"minimax",
		"nvidia-nim",
		"openai-codex",
		"openai-native",
		"qwen-code",
		"sambanova",
		"vertex",
		"xai",
		"zai",
	]
>
export type ProviderName = z.infer<typeof providerNamesSchema>
export declare const isProviderName: (key: unknown) => key is ProviderName
/**
 * RetiredProviderName
 */
export declare const retiredProviderNames: readonly [
	"cerebras",
	"chutes",
	"deepinfra",
	"doubao",
	"featherless",
	"groq",
	"huggingface",
	"io-intelligence",
	"ali",
]
export declare const retiredProviderNamesSchema: z.ZodEnum<
	["cerebras", "chutes", "deepinfra", "doubao", "featherless", "groq", "huggingface", "io-intelligence", "ali"]
>
export type RetiredProviderName = z.infer<typeof retiredProviderNamesSchema>
export declare const isRetiredProvider: (value: string) => value is RetiredProviderName
export declare const providerNamesWithRetiredSchema: z.ZodUnion<
	[
		z.ZodEnum<
			[
				"openrouter",
				"vercel-ai-gateway",
				"litellm",
				"requesty",
				"unbound",
				"poe",
				"ollama",
				"lmstudio",
				"vscode-lm",
				"openai",
				"fake-ai",
				"anthropic",
				"bedrock",
				"baseten",
				"deepseek",
				"fireworks",
				"gemini",
				"gemini-cli",
				"mistral",
				"moonshot",
				"minimax",
				"nvidia-nim",
				"openai-codex",
				"openai-native",
				"qwen-code",
				"sambanova",
				"vertex",
				"xai",
				"zai",
			]
		>,
		z.ZodEnum<
			[
				"cerebras",
				"chutes",
				"deepinfra",
				"doubao",
				"featherless",
				"groq",
				"huggingface",
				"io-intelligence",
				"ali",
			]
		>,
	]
>
export type ProviderNameWithRetired = z.infer<typeof providerNamesWithRetiredSchema>
/**
 * ProviderSettingsEntry
 */
export declare const providerSettingsEntrySchema: z.ZodObject<
	{
		id: z.ZodString
		name: z.ZodString
		apiProvider: z.ZodOptional<
			z.ZodUnion<
				[
					z.ZodEnum<
						[
							"openrouter",
							"vercel-ai-gateway",
							"litellm",
							"requesty",
							"unbound",
							"poe",
							"ollama",
							"lmstudio",
							"vscode-lm",
							"openai",
							"fake-ai",
							"anthropic",
							"bedrock",
							"baseten",
							"deepseek",
							"fireworks",
							"gemini",
							"gemini-cli",
							"mistral",
							"moonshot",
							"minimax",
							"nvidia-nim",
							"openai-codex",
							"openai-native",
							"qwen-code",
							"sambanova",
							"vertex",
							"xai",
							"zai",
						]
					>,
					z.ZodEnum<
						[
							"cerebras",
							"chutes",
							"deepinfra",
							"doubao",
							"featherless",
							"groq",
							"huggingface",
							"io-intelligence",
							"ali",
						]
					>,
				]
			>
		>
		modelId: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		id: string
		name: string
		apiProvider?:
			| "openai"
			| "anthropic"
			| "ollama"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
			| "litellm"
			| "requesty"
			| "unbound"
			| "poe"
			| "lmstudio"
			| "vscode-lm"
			| "fake-ai"
			| "baseten"
			| "deepseek"
			| "fireworks"
			| "gemini-cli"
			| "moonshot"
			| "minimax"
			| "nvidia-nim"
			| "openai-codex"
			| "openai-native"
			| "qwen-code"
			| "sambanova"
			| "vertex"
			| "xai"
			| "zai"
			| "cerebras"
			| "chutes"
			| "deepinfra"
			| "doubao"
			| "featherless"
			| "groq"
			| "huggingface"
			| "io-intelligence"
			| "ali"
			| undefined
		modelId?: string | undefined
	},
	{
		id: string
		name: string
		apiProvider?:
			| "openai"
			| "anthropic"
			| "ollama"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
			| "litellm"
			| "requesty"
			| "unbound"
			| "poe"
			| "lmstudio"
			| "vscode-lm"
			| "fake-ai"
			| "baseten"
			| "deepseek"
			| "fireworks"
			| "gemini-cli"
			| "moonshot"
			| "minimax"
			| "nvidia-nim"
			| "openai-codex"
			| "openai-native"
			| "qwen-code"
			| "sambanova"
			| "vertex"
			| "xai"
			| "zai"
			| "cerebras"
			| "chutes"
			| "deepinfra"
			| "doubao"
			| "featherless"
			| "groq"
			| "huggingface"
			| "io-intelligence"
			| "ali"
			| undefined
		modelId?: string | undefined
	}
>
export type ProviderSettingsEntry = z.infer<typeof providerSettingsEntrySchema>
export declare const zaiApiLineSchema: z.ZodEnum<
	["international_coding", "china_coding", "international_api", "china_api"]
>
export type ZaiApiLine = z.infer<typeof zaiApiLineSchema>
export declare const providerSettingsSchemaDiscriminated: z.ZodDiscriminatedUnion<
	"apiProvider",
	[
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				apiKey: z.ZodOptional<z.ZodString>
				anthropicBaseUrl: z.ZodOptional<z.ZodString>
				anthropicUseAuthToken: z.ZodOptional<z.ZodBoolean>
				anthropicBeta1MContext: z.ZodOptional<z.ZodBoolean>
			} & {
				apiProvider: z.ZodLiteral<"anthropic">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "anthropic"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				apiKey?: string | undefined
				anthropicBaseUrl?: string | undefined
				anthropicUseAuthToken?: boolean | undefined
				anthropicBeta1MContext?: boolean | undefined
			},
			{
				apiProvider: "anthropic"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				apiKey?: string | undefined
				anthropicBaseUrl?: string | undefined
				anthropicUseAuthToken?: boolean | undefined
				anthropicBeta1MContext?: boolean | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				openRouterApiKey: z.ZodOptional<z.ZodString>
				openRouterModelId: z.ZodOptional<z.ZodString>
				openRouterBaseUrl: z.ZodOptional<z.ZodString>
				openRouterSpecificProvider: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"openrouter">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "openrouter"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				openRouterApiKey?: string | undefined
				openRouterModelId?: string | undefined
				openRouterBaseUrl?: string | undefined
				openRouterSpecificProvider?: string | undefined
			},
			{
				apiProvider: "openrouter"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				openRouterApiKey?: string | undefined
				openRouterModelId?: string | undefined
				openRouterBaseUrl?: string | undefined
				openRouterSpecificProvider?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				awsAccessKey: z.ZodOptional<z.ZodString>
				awsSecretKey: z.ZodOptional<z.ZodString>
				awsSessionToken: z.ZodOptional<z.ZodString>
				awsRegion: z.ZodOptional<z.ZodString>
				awsUseCrossRegionInference: z.ZodOptional<z.ZodBoolean>
				awsUseGlobalInference: z.ZodOptional<z.ZodBoolean>
				awsUsePromptCache: z.ZodOptional<z.ZodBoolean>
				awsProfile: z.ZodOptional<z.ZodString>
				awsUseProfile: z.ZodOptional<z.ZodBoolean>
				awsApiKey: z.ZodOptional<z.ZodString>
				awsUseApiKey: z.ZodOptional<z.ZodBoolean>
				awsCustomArn: z.ZodOptional<z.ZodString>
				awsModelContextWindow: z.ZodOptional<z.ZodNumber>
				awsBedrockEndpointEnabled: z.ZodOptional<z.ZodBoolean>
				awsBedrockEndpoint: z.ZodOptional<z.ZodString>
				awsBedrock1MContext: z.ZodOptional<z.ZodBoolean>
				awsBedrockServiceTier: z.ZodOptional<z.ZodEnum<["STANDARD", "FLEX", "PRIORITY"]>>
			} & {
				apiProvider: z.ZodLiteral<"bedrock">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "bedrock"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				awsAccessKey?: string | undefined
				awsSecretKey?: string | undefined
				awsSessionToken?: string | undefined
				awsRegion?: string | undefined
				awsUseCrossRegionInference?: boolean | undefined
				awsUseGlobalInference?: boolean | undefined
				awsUsePromptCache?: boolean | undefined
				awsProfile?: string | undefined
				awsUseProfile?: boolean | undefined
				awsApiKey?: string | undefined
				awsUseApiKey?: boolean | undefined
				awsCustomArn?: string | undefined
				awsModelContextWindow?: number | undefined
				awsBedrockEndpointEnabled?: boolean | undefined
				awsBedrockEndpoint?: string | undefined
				awsBedrock1MContext?: boolean | undefined
				awsBedrockServiceTier?: "STANDARD" | "FLEX" | "PRIORITY" | undefined
			},
			{
				apiProvider: "bedrock"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				awsAccessKey?: string | undefined
				awsSecretKey?: string | undefined
				awsSessionToken?: string | undefined
				awsRegion?: string | undefined
				awsUseCrossRegionInference?: boolean | undefined
				awsUseGlobalInference?: boolean | undefined
				awsUsePromptCache?: boolean | undefined
				awsProfile?: string | undefined
				awsUseProfile?: boolean | undefined
				awsApiKey?: string | undefined
				awsUseApiKey?: boolean | undefined
				awsCustomArn?: string | undefined
				awsModelContextWindow?: number | undefined
				awsBedrockEndpointEnabled?: boolean | undefined
				awsBedrockEndpoint?: string | undefined
				awsBedrock1MContext?: boolean | undefined
				awsBedrockServiceTier?: "STANDARD" | "FLEX" | "PRIORITY" | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				vertexKeyFile: z.ZodOptional<z.ZodString>
				vertexJsonCredentials: z.ZodOptional<z.ZodString>
				vertexProjectId: z.ZodOptional<z.ZodString>
				vertexRegion: z.ZodOptional<z.ZodString>
				vertex1MContext: z.ZodOptional<z.ZodBoolean>
			} & {
				apiProvider: z.ZodLiteral<"vertex">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "vertex"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				vertexKeyFile?: string | undefined
				vertexJsonCredentials?: string | undefined
				vertexProjectId?: string | undefined
				vertexRegion?: string | undefined
				vertex1MContext?: boolean | undefined
			},
			{
				apiProvider: "vertex"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				vertexKeyFile?: string | undefined
				vertexJsonCredentials?: string | undefined
				vertexProjectId?: string | undefined
				vertexRegion?: string | undefined
				vertex1MContext?: boolean | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				openAiBaseUrl: z.ZodOptional<z.ZodString>
				openAiApiKey: z.ZodOptional<z.ZodString>
				openAiR1FormatEnabled: z.ZodOptional<z.ZodBoolean>
				openAiModelId: z.ZodOptional<z.ZodString>
				openAiCustomModelInfo: z.ZodOptional<
					z.ZodNullable<
						z.ZodObject<
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
											z.ZodArray<
												z.ZodEnum<
													["disable", "none", "minimal", "low", "medium", "high", "xhigh"]
												>,
												"many"
											>,
										]
									>
								>
								requiredReasoningEffort: z.ZodOptional<z.ZodBoolean>
								preserveReasoning: z.ZodOptional<z.ZodBoolean>
								supportedParameters: z.ZodOptional<
									z.ZodArray<
										z.ZodEnum<["max_tokens", "temperature", "reasoning", "include_reasoning"]>,
										"many"
									>
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
											appliesToServiceTiers: z.ZodOptional<
												z.ZodArray<z.ZodEnum<["default", "flex", "priority"]>, "many">
											>
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
								reasoningEffort: z.ZodOptional<
									z.ZodEnum<["none", "minimal", "low", "medium", "high", "xhigh"]>
								>
								minTokensPerCachePoint: z.ZodOptional<z.ZodNumber>
								maxCachePoints: z.ZodOptional<z.ZodNumber>
								cachableFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
								deprecated: z.ZodOptional<z.ZodBoolean>
								isStealthModel: z.ZodOptional<z.ZodBoolean>
								isFree: z.ZodOptional<z.ZodBoolean>
								excludedTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
								includedTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
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
								supportedParameters?:
									| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
									| undefined
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
								supportedParameters?:
									| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
									| undefined
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
					>
				>
				openAiUseAzure: z.ZodOptional<z.ZodBoolean>
				azureApiVersion: z.ZodOptional<z.ZodString>
				openAiStreamingEnabled: z.ZodOptional<z.ZodBoolean>
				openAiHostHeader: z.ZodOptional<z.ZodString>
				openAiHeaders: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
			} & {
				apiProvider: z.ZodLiteral<"openai">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "openai"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				openAiBaseUrl?: string | undefined
				openAiApiKey?: string | undefined
				openAiR1FormatEnabled?: boolean | undefined
				openAiModelId?: string | undefined
				openAiCustomModelInfo?:
					| {
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
							supportedParameters?:
								| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
								| undefined
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
					| null
					| undefined
				openAiUseAzure?: boolean | undefined
				azureApiVersion?: string | undefined
				openAiStreamingEnabled?: boolean | undefined
				openAiHostHeader?: string | undefined
				openAiHeaders?: Record<string, string> | undefined
			},
			{
				apiProvider: "openai"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				openAiBaseUrl?: string | undefined
				openAiApiKey?: string | undefined
				openAiR1FormatEnabled?: boolean | undefined
				openAiModelId?: string | undefined
				openAiCustomModelInfo?:
					| {
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
							supportedParameters?:
								| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
								| undefined
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
					| null
					| undefined
				openAiUseAzure?: boolean | undefined
				azureApiVersion?: string | undefined
				openAiStreamingEnabled?: boolean | undefined
				openAiHostHeader?: string | undefined
				openAiHeaders?: Record<string, string> | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				ollamaModelId: z.ZodOptional<z.ZodString>
				ollamaBaseUrl: z.ZodOptional<z.ZodString>
				ollamaApiKey: z.ZodOptional<z.ZodString>
				ollamaNumCtx: z.ZodOptional<z.ZodNumber>
			} & {
				apiProvider: z.ZodLiteral<"ollama">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "ollama"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				ollamaModelId?: string | undefined
				ollamaBaseUrl?: string | undefined
				ollamaApiKey?: string | undefined
				ollamaNumCtx?: number | undefined
			},
			{
				apiProvider: "ollama"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				ollamaModelId?: string | undefined
				ollamaBaseUrl?: string | undefined
				ollamaApiKey?: string | undefined
				ollamaNumCtx?: number | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				vsCodeLmModelSelector: z.ZodOptional<
					z.ZodObject<
						{
							vendor: z.ZodOptional<z.ZodString>
							family: z.ZodOptional<z.ZodString>
							version: z.ZodOptional<z.ZodString>
							id: z.ZodOptional<z.ZodString>
						},
						"strip",
						z.ZodTypeAny,
						{
							id?: string | undefined
							family?: string | undefined
							version?: string | undefined
							vendor?: string | undefined
						},
						{
							id?: string | undefined
							family?: string | undefined
							version?: string | undefined
							vendor?: string | undefined
						}
					>
				>
			} & {
				apiProvider: z.ZodLiteral<"vscode-lm">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "vscode-lm"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				vsCodeLmModelSelector?:
					| {
							id?: string | undefined
							family?: string | undefined
							version?: string | undefined
							vendor?: string | undefined
					  }
					| undefined
			},
			{
				apiProvider: "vscode-lm"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				vsCodeLmModelSelector?:
					| {
							id?: string | undefined
							family?: string | undefined
							version?: string | undefined
							vendor?: string | undefined
					  }
					| undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				lmStudioModelId: z.ZodOptional<z.ZodString>
				lmStudioBaseUrl: z.ZodOptional<z.ZodString>
				lmStudioDraftModelId: z.ZodOptional<z.ZodString>
				lmStudioSpeculativeDecodingEnabled: z.ZodOptional<z.ZodBoolean>
			} & {
				apiProvider: z.ZodLiteral<"lmstudio">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "lmstudio"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				lmStudioModelId?: string | undefined
				lmStudioBaseUrl?: string | undefined
				lmStudioDraftModelId?: string | undefined
				lmStudioSpeculativeDecodingEnabled?: boolean | undefined
			},
			{
				apiProvider: "lmstudio"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				lmStudioModelId?: string | undefined
				lmStudioBaseUrl?: string | undefined
				lmStudioDraftModelId?: string | undefined
				lmStudioSpeculativeDecodingEnabled?: boolean | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				geminiApiKey: z.ZodOptional<z.ZodString>
				googleGeminiBaseUrl: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"gemini">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "gemini"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				geminiApiKey?: string | undefined
				googleGeminiBaseUrl?: string | undefined
			},
			{
				apiProvider: "gemini"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				geminiApiKey?: string | undefined
				googleGeminiBaseUrl?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				geminiCliOAuthPath: z.ZodOptional<z.ZodString>
				geminiCliProjectId: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"gemini-cli">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "gemini-cli"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				geminiCliOAuthPath?: string | undefined
				geminiCliProjectId?: string | undefined
			},
			{
				apiProvider: "gemini-cli"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				geminiCliOAuthPath?: string | undefined
				geminiCliProjectId?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"openai-codex">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "openai-codex"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
			},
			{
				apiProvider: "openai-codex"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				openAiNativeApiKey: z.ZodOptional<z.ZodString>
				openAiNativeBaseUrl: z.ZodOptional<z.ZodString>
				openAiNativeServiceTier: z.ZodOptional<z.ZodEnum<["default", "flex", "priority"]>>
			} & {
				apiProvider: z.ZodLiteral<"openai-native">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "openai-native"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				openAiNativeApiKey?: string | undefined
				openAiNativeBaseUrl?: string | undefined
				openAiNativeServiceTier?: "default" | "flex" | "priority" | undefined
			},
			{
				apiProvider: "openai-native"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				openAiNativeApiKey?: string | undefined
				openAiNativeBaseUrl?: string | undefined
				openAiNativeServiceTier?: "default" | "flex" | "priority" | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				mistralApiKey: z.ZodOptional<z.ZodString>
				mistralCodestralUrl: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"mistral">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "mistral"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				mistralApiKey?: string | undefined
				mistralCodestralUrl?: string | undefined
			},
			{
				apiProvider: "mistral"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				mistralApiKey?: string | undefined
				mistralCodestralUrl?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				deepSeekBaseUrl: z.ZodOptional<z.ZodString>
				deepSeekApiKey: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"deepseek">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "deepseek"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				deepSeekBaseUrl?: string | undefined
				deepSeekApiKey?: string | undefined
			},
			{
				apiProvider: "deepseek"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				deepSeekBaseUrl?: string | undefined
				deepSeekApiKey?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				poeApiKey: z.ZodOptional<z.ZodString>
				poeBaseUrl: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"poe">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "poe"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				poeApiKey?: string | undefined
				poeBaseUrl?: string | undefined
			},
			{
				apiProvider: "poe"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				poeApiKey?: string | undefined
				poeBaseUrl?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				moonshotBaseUrl: z.ZodOptional<
					z.ZodUnion<[z.ZodLiteral<"https://api.moonshot.ai/v1">, z.ZodLiteral<"https://api.moonshot.cn/v1">]>
				>
				moonshotApiKey: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"moonshot">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "moonshot"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				moonshotBaseUrl?: "https://api.moonshot.ai/v1" | "https://api.moonshot.cn/v1" | undefined
				moonshotApiKey?: string | undefined
			},
			{
				apiProvider: "moonshot"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				moonshotBaseUrl?: "https://api.moonshot.ai/v1" | "https://api.moonshot.cn/v1" | undefined
				moonshotApiKey?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				minimaxBaseUrl: z.ZodOptional<
					z.ZodUnion<[z.ZodLiteral<"https://api.minimax.io/v1">, z.ZodLiteral<"https://api.minimaxi.com/v1">]>
				>
				minimaxApiKey: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"minimax">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "minimax"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				minimaxBaseUrl?: "https://api.minimax.io/v1" | "https://api.minimaxi.com/v1" | undefined
				minimaxApiKey?: string | undefined
			},
			{
				apiProvider: "minimax"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				minimaxBaseUrl?: "https://api.minimax.io/v1" | "https://api.minimaxi.com/v1" | undefined
				minimaxApiKey?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				nvidiaNimApiKey: z.ZodOptional<z.ZodString>
				nvidiaNimBaseUrl: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"nvidia-nim">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "nvidia-nim"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				nvidiaNimApiKey?: string | undefined
				nvidiaNimBaseUrl?: string | undefined
			},
			{
				apiProvider: "nvidia-nim"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				nvidiaNimApiKey?: string | undefined
				nvidiaNimBaseUrl?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				requestyBaseUrl: z.ZodOptional<z.ZodString>
				requestyApiKey: z.ZodOptional<z.ZodString>
				requestyModelId: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"requesty">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "requesty"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				requestyBaseUrl?: string | undefined
				requestyApiKey?: string | undefined
				requestyModelId?: string | undefined
			},
			{
				apiProvider: "requesty"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				requestyBaseUrl?: string | undefined
				requestyApiKey?: string | undefined
				requestyModelId?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				unboundApiKey: z.ZodOptional<z.ZodString>
				unboundModelId: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"unbound">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "unbound"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				unboundApiKey?: string | undefined
				unboundModelId?: string | undefined
			},
			{
				apiProvider: "unbound"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				unboundApiKey?: string | undefined
				unboundModelId?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				fakeAi: z.ZodOptional<z.ZodUnknown>
			} & {
				apiProvider: z.ZodLiteral<"fake-ai">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "fake-ai"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				fakeAi?: unknown
			},
			{
				apiProvider: "fake-ai"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				fakeAi?: unknown
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				xaiApiKey: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"xai">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "xai"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				xaiApiKey?: string | undefined
			},
			{
				apiProvider: "xai"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				xaiApiKey?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				basetenApiKey: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"baseten">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "baseten"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				basetenApiKey?: string | undefined
			},
			{
				apiProvider: "baseten"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				basetenApiKey?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				litellmBaseUrl: z.ZodOptional<z.ZodString>
				litellmApiKey: z.ZodOptional<z.ZodString>
				litellmModelId: z.ZodOptional<z.ZodString>
				litellmUsePromptCache: z.ZodOptional<z.ZodBoolean>
			} & {
				apiProvider: z.ZodLiteral<"litellm">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "litellm"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				litellmBaseUrl?: string | undefined
				litellmApiKey?: string | undefined
				litellmModelId?: string | undefined
				litellmUsePromptCache?: boolean | undefined
			},
			{
				apiProvider: "litellm"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				litellmBaseUrl?: string | undefined
				litellmApiKey?: string | undefined
				litellmModelId?: string | undefined
				litellmUsePromptCache?: boolean | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				sambaNovaApiKey: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"sambanova">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "sambanova"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				sambaNovaApiKey?: string | undefined
			},
			{
				apiProvider: "sambanova"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				sambaNovaApiKey?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				zaiApiKey: z.ZodOptional<z.ZodString>
				zaiApiLine: z.ZodOptional<
					z.ZodEnum<["international_coding", "china_coding", "international_api", "china_api"]>
				>
			} & {
				apiProvider: z.ZodLiteral<"zai">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "zai"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				zaiApiKey?: string | undefined
				zaiApiLine?: "international_coding" | "china_coding" | "international_api" | "china_api" | undefined
			},
			{
				apiProvider: "zai"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				zaiApiKey?: string | undefined
				zaiApiLine?: "international_coding" | "china_coding" | "international_api" | "china_api" | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				fireworksApiKey: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"fireworks">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "fireworks"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				fireworksApiKey?: string | undefined
			},
			{
				apiProvider: "fireworks"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				fireworksApiKey?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				apiModelId: z.ZodOptional<z.ZodString>
			} & {
				qwenCodeOauthPath: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"qwen-code">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "qwen-code"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				qwenCodeOauthPath?: string | undefined
			},
			{
				apiProvider: "qwen-code"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				apiModelId?: string | undefined
				qwenCodeOauthPath?: string | undefined
			}
		>,
		z.ZodObject<
			{
				includeMaxTokens: z.ZodOptional<z.ZodBoolean>
				todoListEnabled: z.ZodOptional<z.ZodBoolean>
				modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
				rateLimitSeconds: z.ZodOptional<z.ZodNumber>
				consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
				enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
				reasoningEffort: z.ZodOptional<
					z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
				>
				modelMaxTokens: z.ZodOptional<z.ZodNumber>
				modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
				verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
			} & {
				vercelAiGatewayApiKey: z.ZodOptional<z.ZodString>
				vercelAiGatewayModelId: z.ZodOptional<z.ZodString>
			} & {
				apiProvider: z.ZodLiteral<"vercel-ai-gateway">
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider: "vercel-ai-gateway"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				vercelAiGatewayApiKey?: string | undefined
				vercelAiGatewayModelId?: string | undefined
			},
			{
				apiProvider: "vercel-ai-gateway"
				reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
				includeMaxTokens?: boolean | undefined
				todoListEnabled?: boolean | undefined
				modelTemperature?: number | null | undefined
				rateLimitSeconds?: number | undefined
				consecutiveMistakeLimit?: number | undefined
				enableReasoningEffort?: boolean | undefined
				modelMaxTokens?: number | undefined
				modelMaxThinkingTokens?: number | undefined
				verbosity?: "low" | "medium" | "high" | undefined
				vercelAiGatewayApiKey?: string | undefined
				vercelAiGatewayModelId?: string | undefined
			}
		>,
		z.ZodObject<
			{
				apiProvider: z.ZodUndefined
			},
			"strip",
			z.ZodTypeAny,
			{
				apiProvider?: undefined
			},
			{
				apiProvider?: undefined
			}
		>,
	]
>
export declare const providerSettingsSchema: z.ZodObject<
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
		includeMaxTokens: z.ZodOptional<z.ZodBoolean>
		todoListEnabled: z.ZodOptional<z.ZodBoolean>
		modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
		rateLimitSeconds: z.ZodOptional<z.ZodNumber>
		consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
		enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
		reasoningEffort: z.ZodOptional<z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>>
		modelMaxTokens: z.ZodOptional<z.ZodNumber>
		modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
		verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
		vercelAiGatewayApiKey: z.ZodOptional<z.ZodString>
		vercelAiGatewayModelId: z.ZodOptional<z.ZodString>
		apiModelId: z.ZodOptional<z.ZodString>
		qwenCodeOauthPath: z.ZodOptional<z.ZodString>
		fireworksApiKey: z.ZodOptional<z.ZodString>
		zaiApiKey: z.ZodOptional<z.ZodString>
		zaiApiLine: z.ZodOptional<z.ZodEnum<["international_coding", "china_coding", "international_api", "china_api"]>>
		sambaNovaApiKey: z.ZodOptional<z.ZodString>
		nvidiaNimApiKey: z.ZodOptional<z.ZodString>
		nvidiaNimBaseUrl: z.ZodOptional<z.ZodString>
		litellmBaseUrl: z.ZodOptional<z.ZodString>
		litellmApiKey: z.ZodOptional<z.ZodString>
		litellmModelId: z.ZodOptional<z.ZodString>
		litellmUsePromptCache: z.ZodOptional<z.ZodBoolean>
		basetenApiKey: z.ZodOptional<z.ZodString>
		xaiApiKey: z.ZodOptional<z.ZodString>
		fakeAi: z.ZodOptional<z.ZodUnknown>
		unboundApiKey: z.ZodOptional<z.ZodString>
		unboundModelId: z.ZodOptional<z.ZodString>
		requestyBaseUrl: z.ZodOptional<z.ZodString>
		requestyApiKey: z.ZodOptional<z.ZodString>
		requestyModelId: z.ZodOptional<z.ZodString>
		minimaxBaseUrl: z.ZodOptional<
			z.ZodUnion<[z.ZodLiteral<"https://api.minimax.io/v1">, z.ZodLiteral<"https://api.minimaxi.com/v1">]>
		>
		minimaxApiKey: z.ZodOptional<z.ZodString>
		moonshotBaseUrl: z.ZodOptional<
			z.ZodUnion<[z.ZodLiteral<"https://api.moonshot.ai/v1">, z.ZodLiteral<"https://api.moonshot.cn/v1">]>
		>
		moonshotApiKey: z.ZodOptional<z.ZodString>
		poeApiKey: z.ZodOptional<z.ZodString>
		poeBaseUrl: z.ZodOptional<z.ZodString>
		deepSeekBaseUrl: z.ZodOptional<z.ZodString>
		deepSeekApiKey: z.ZodOptional<z.ZodString>
		mistralApiKey: z.ZodOptional<z.ZodString>
		mistralCodestralUrl: z.ZodOptional<z.ZodString>
		openAiNativeApiKey: z.ZodOptional<z.ZodString>
		openAiNativeBaseUrl: z.ZodOptional<z.ZodString>
		openAiNativeServiceTier: z.ZodOptional<z.ZodEnum<["default", "flex", "priority"]>>
		geminiCliOAuthPath: z.ZodOptional<z.ZodString>
		geminiCliProjectId: z.ZodOptional<z.ZodString>
		geminiApiKey: z.ZodOptional<z.ZodString>
		googleGeminiBaseUrl: z.ZodOptional<z.ZodString>
		lmStudioModelId: z.ZodOptional<z.ZodString>
		lmStudioBaseUrl: z.ZodOptional<z.ZodString>
		lmStudioDraftModelId: z.ZodOptional<z.ZodString>
		lmStudioSpeculativeDecodingEnabled: z.ZodOptional<z.ZodBoolean>
		vsCodeLmModelSelector: z.ZodOptional<
			z.ZodObject<
				{
					vendor: z.ZodOptional<z.ZodString>
					family: z.ZodOptional<z.ZodString>
					version: z.ZodOptional<z.ZodString>
					id: z.ZodOptional<z.ZodString>
				},
				"strip",
				z.ZodTypeAny,
				{
					id?: string | undefined
					family?: string | undefined
					version?: string | undefined
					vendor?: string | undefined
				},
				{
					id?: string | undefined
					family?: string | undefined
					version?: string | undefined
					vendor?: string | undefined
				}
			>
		>
		ollamaModelId: z.ZodOptional<z.ZodString>
		ollamaBaseUrl: z.ZodOptional<z.ZodString>
		ollamaApiKey: z.ZodOptional<z.ZodString>
		ollamaNumCtx: z.ZodOptional<z.ZodNumber>
		openAiBaseUrl: z.ZodOptional<z.ZodString>
		openAiApiKey: z.ZodOptional<z.ZodString>
		openAiR1FormatEnabled: z.ZodOptional<z.ZodBoolean>
		openAiModelId: z.ZodOptional<z.ZodString>
		openAiCustomModelInfo: z.ZodOptional<
			z.ZodNullable<
				z.ZodObject<
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
									z.ZodArray<
										z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>,
										"many"
									>,
								]
							>
						>
						requiredReasoningEffort: z.ZodOptional<z.ZodBoolean>
						preserveReasoning: z.ZodOptional<z.ZodBoolean>
						supportedParameters: z.ZodOptional<
							z.ZodArray<
								z.ZodEnum<["max_tokens", "temperature", "reasoning", "include_reasoning"]>,
								"many"
							>
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
									appliesToServiceTiers: z.ZodOptional<
										z.ZodArray<z.ZodEnum<["default", "flex", "priority"]>, "many">
									>
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
						supportedParameters?:
							| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
							| undefined
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
						supportedParameters?:
							| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
							| undefined
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
			>
		>
		openAiUseAzure: z.ZodOptional<z.ZodBoolean>
		azureApiVersion: z.ZodOptional<z.ZodString>
		openAiStreamingEnabled: z.ZodOptional<z.ZodBoolean>
		openAiHostHeader: z.ZodOptional<z.ZodString>
		openAiHeaders: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
		vertexKeyFile: z.ZodOptional<z.ZodString>
		vertexJsonCredentials: z.ZodOptional<z.ZodString>
		vertexProjectId: z.ZodOptional<z.ZodString>
		vertexRegion: z.ZodOptional<z.ZodString>
		vertex1MContext: z.ZodOptional<z.ZodBoolean>
		awsAccessKey: z.ZodOptional<z.ZodString>
		awsSecretKey: z.ZodOptional<z.ZodString>
		awsSessionToken: z.ZodOptional<z.ZodString>
		awsRegion: z.ZodOptional<z.ZodString>
		awsUseCrossRegionInference: z.ZodOptional<z.ZodBoolean>
		awsUseGlobalInference: z.ZodOptional<z.ZodBoolean>
		awsUsePromptCache: z.ZodOptional<z.ZodBoolean>
		awsProfile: z.ZodOptional<z.ZodString>
		awsUseProfile: z.ZodOptional<z.ZodBoolean>
		awsApiKey: z.ZodOptional<z.ZodString>
		awsUseApiKey: z.ZodOptional<z.ZodBoolean>
		awsCustomArn: z.ZodOptional<z.ZodString>
		awsModelContextWindow: z.ZodOptional<z.ZodNumber>
		awsBedrockEndpointEnabled: z.ZodOptional<z.ZodBoolean>
		awsBedrockEndpoint: z.ZodOptional<z.ZodString>
		awsBedrock1MContext: z.ZodOptional<z.ZodBoolean>
		awsBedrockServiceTier: z.ZodOptional<z.ZodEnum<["STANDARD", "FLEX", "PRIORITY"]>>
		openRouterApiKey: z.ZodOptional<z.ZodString>
		openRouterModelId: z.ZodOptional<z.ZodString>
		openRouterBaseUrl: z.ZodOptional<z.ZodString>
		openRouterSpecificProvider: z.ZodOptional<z.ZodString>
		apiKey: z.ZodOptional<z.ZodString>
		anthropicBaseUrl: z.ZodOptional<z.ZodString>
		anthropicUseAuthToken: z.ZodOptional<z.ZodBoolean>
		anthropicBeta1MContext: z.ZodOptional<z.ZodBoolean>
		apiProvider: z.ZodOptional<
			z.ZodUnion<
				[
					z.ZodEnum<
						[
							"openrouter",
							"vercel-ai-gateway",
							"litellm",
							"requesty",
							"unbound",
							"poe",
							"ollama",
							"lmstudio",
							"vscode-lm",
							"openai",
							"fake-ai",
							"anthropic",
							"bedrock",
							"baseten",
							"deepseek",
							"fireworks",
							"gemini",
							"gemini-cli",
							"mistral",
							"moonshot",
							"minimax",
							"nvidia-nim",
							"openai-codex",
							"openai-native",
							"qwen-code",
							"sambanova",
							"vertex",
							"xai",
							"zai",
						]
					>,
					z.ZodEnum<
						[
							"cerebras",
							"chutes",
							"deepinfra",
							"doubao",
							"featherless",
							"groq",
							"huggingface",
							"io-intelligence",
							"ali",
						]
					>,
				]
			>
		>
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
		reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
		apiProvider?:
			| "openai"
			| "anthropic"
			| "ollama"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
			| "litellm"
			| "requesty"
			| "unbound"
			| "poe"
			| "lmstudio"
			| "vscode-lm"
			| "fake-ai"
			| "baseten"
			| "deepseek"
			| "fireworks"
			| "gemini-cli"
			| "moonshot"
			| "minimax"
			| "nvidia-nim"
			| "openai-codex"
			| "openai-native"
			| "qwen-code"
			| "sambanova"
			| "vertex"
			| "xai"
			| "zai"
			| "cerebras"
			| "chutes"
			| "deepinfra"
			| "doubao"
			| "featherless"
			| "groq"
			| "huggingface"
			| "io-intelligence"
			| "ali"
			| undefined
		includeMaxTokens?: boolean | undefined
		todoListEnabled?: boolean | undefined
		modelTemperature?: number | null | undefined
		rateLimitSeconds?: number | undefined
		consecutiveMistakeLimit?: number | undefined
		enableReasoningEffort?: boolean | undefined
		modelMaxTokens?: number | undefined
		modelMaxThinkingTokens?: number | undefined
		verbosity?: "low" | "medium" | "high" | undefined
		apiModelId?: string | undefined
		apiKey?: string | undefined
		anthropicBaseUrl?: string | undefined
		anthropicUseAuthToken?: boolean | undefined
		anthropicBeta1MContext?: boolean | undefined
		openRouterApiKey?: string | undefined
		openRouterModelId?: string | undefined
		openRouterBaseUrl?: string | undefined
		openRouterSpecificProvider?: string | undefined
		awsAccessKey?: string | undefined
		awsSecretKey?: string | undefined
		awsSessionToken?: string | undefined
		awsRegion?: string | undefined
		awsUseCrossRegionInference?: boolean | undefined
		awsUseGlobalInference?: boolean | undefined
		awsUsePromptCache?: boolean | undefined
		awsProfile?: string | undefined
		awsUseProfile?: boolean | undefined
		awsApiKey?: string | undefined
		awsUseApiKey?: boolean | undefined
		awsCustomArn?: string | undefined
		awsModelContextWindow?: number | undefined
		awsBedrockEndpointEnabled?: boolean | undefined
		awsBedrockEndpoint?: string | undefined
		awsBedrock1MContext?: boolean | undefined
		awsBedrockServiceTier?: "STANDARD" | "FLEX" | "PRIORITY" | undefined
		vertexKeyFile?: string | undefined
		vertexJsonCredentials?: string | undefined
		vertexProjectId?: string | undefined
		vertexRegion?: string | undefined
		vertex1MContext?: boolean | undefined
		openAiBaseUrl?: string | undefined
		openAiApiKey?: string | undefined
		openAiR1FormatEnabled?: boolean | undefined
		openAiModelId?: string | undefined
		openAiCustomModelInfo?:
			| {
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
					supportedParameters?:
						| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
						| undefined
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
			| null
			| undefined
		openAiUseAzure?: boolean | undefined
		azureApiVersion?: string | undefined
		openAiStreamingEnabled?: boolean | undefined
		openAiHostHeader?: string | undefined
		openAiHeaders?: Record<string, string> | undefined
		ollamaModelId?: string | undefined
		ollamaBaseUrl?: string | undefined
		ollamaApiKey?: string | undefined
		ollamaNumCtx?: number | undefined
		vsCodeLmModelSelector?:
			| {
					id?: string | undefined
					family?: string | undefined
					version?: string | undefined
					vendor?: string | undefined
			  }
			| undefined
		lmStudioModelId?: string | undefined
		lmStudioBaseUrl?: string | undefined
		lmStudioDraftModelId?: string | undefined
		lmStudioSpeculativeDecodingEnabled?: boolean | undefined
		geminiApiKey?: string | undefined
		googleGeminiBaseUrl?: string | undefined
		geminiCliOAuthPath?: string | undefined
		geminiCliProjectId?: string | undefined
		openAiNativeApiKey?: string | undefined
		openAiNativeBaseUrl?: string | undefined
		openAiNativeServiceTier?: "default" | "flex" | "priority" | undefined
		mistralApiKey?: string | undefined
		mistralCodestralUrl?: string | undefined
		deepSeekBaseUrl?: string | undefined
		deepSeekApiKey?: string | undefined
		poeApiKey?: string | undefined
		poeBaseUrl?: string | undefined
		moonshotBaseUrl?: "https://api.moonshot.ai/v1" | "https://api.moonshot.cn/v1" | undefined
		moonshotApiKey?: string | undefined
		minimaxBaseUrl?: "https://api.minimax.io/v1" | "https://api.minimaxi.com/v1" | undefined
		minimaxApiKey?: string | undefined
		requestyBaseUrl?: string | undefined
		requestyApiKey?: string | undefined
		requestyModelId?: string | undefined
		unboundApiKey?: string | undefined
		unboundModelId?: string | undefined
		fakeAi?: unknown
		xaiApiKey?: string | undefined
		litellmBaseUrl?: string | undefined
		litellmApiKey?: string | undefined
		litellmModelId?: string | undefined
		litellmUsePromptCache?: boolean | undefined
		sambaNovaApiKey?: string | undefined
		zaiApiKey?: string | undefined
		zaiApiLine?: "international_coding" | "china_coding" | "international_api" | "china_api" | undefined
		fireworksApiKey?: string | undefined
		qwenCodeOauthPath?: string | undefined
		vercelAiGatewayApiKey?: string | undefined
		vercelAiGatewayModelId?: string | undefined
		basetenApiKey?: string | undefined
		nvidiaNimApiKey?: string | undefined
		nvidiaNimBaseUrl?: string | undefined
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
		reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
		apiProvider?:
			| "openai"
			| "anthropic"
			| "ollama"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
			| "litellm"
			| "requesty"
			| "unbound"
			| "poe"
			| "lmstudio"
			| "vscode-lm"
			| "fake-ai"
			| "baseten"
			| "deepseek"
			| "fireworks"
			| "gemini-cli"
			| "moonshot"
			| "minimax"
			| "nvidia-nim"
			| "openai-codex"
			| "openai-native"
			| "qwen-code"
			| "sambanova"
			| "vertex"
			| "xai"
			| "zai"
			| "cerebras"
			| "chutes"
			| "deepinfra"
			| "doubao"
			| "featherless"
			| "groq"
			| "huggingface"
			| "io-intelligence"
			| "ali"
			| undefined
		includeMaxTokens?: boolean | undefined
		todoListEnabled?: boolean | undefined
		modelTemperature?: number | null | undefined
		rateLimitSeconds?: number | undefined
		consecutiveMistakeLimit?: number | undefined
		enableReasoningEffort?: boolean | undefined
		modelMaxTokens?: number | undefined
		modelMaxThinkingTokens?: number | undefined
		verbosity?: "low" | "medium" | "high" | undefined
		apiModelId?: string | undefined
		apiKey?: string | undefined
		anthropicBaseUrl?: string | undefined
		anthropicUseAuthToken?: boolean | undefined
		anthropicBeta1MContext?: boolean | undefined
		openRouterApiKey?: string | undefined
		openRouterModelId?: string | undefined
		openRouterBaseUrl?: string | undefined
		openRouterSpecificProvider?: string | undefined
		awsAccessKey?: string | undefined
		awsSecretKey?: string | undefined
		awsSessionToken?: string | undefined
		awsRegion?: string | undefined
		awsUseCrossRegionInference?: boolean | undefined
		awsUseGlobalInference?: boolean | undefined
		awsUsePromptCache?: boolean | undefined
		awsProfile?: string | undefined
		awsUseProfile?: boolean | undefined
		awsApiKey?: string | undefined
		awsUseApiKey?: boolean | undefined
		awsCustomArn?: string | undefined
		awsModelContextWindow?: number | undefined
		awsBedrockEndpointEnabled?: boolean | undefined
		awsBedrockEndpoint?: string | undefined
		awsBedrock1MContext?: boolean | undefined
		awsBedrockServiceTier?: "STANDARD" | "FLEX" | "PRIORITY" | undefined
		vertexKeyFile?: string | undefined
		vertexJsonCredentials?: string | undefined
		vertexProjectId?: string | undefined
		vertexRegion?: string | undefined
		vertex1MContext?: boolean | undefined
		openAiBaseUrl?: string | undefined
		openAiApiKey?: string | undefined
		openAiR1FormatEnabled?: boolean | undefined
		openAiModelId?: string | undefined
		openAiCustomModelInfo?:
			| {
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
					supportedParameters?:
						| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
						| undefined
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
			| null
			| undefined
		openAiUseAzure?: boolean | undefined
		azureApiVersion?: string | undefined
		openAiStreamingEnabled?: boolean | undefined
		openAiHostHeader?: string | undefined
		openAiHeaders?: Record<string, string> | undefined
		ollamaModelId?: string | undefined
		ollamaBaseUrl?: string | undefined
		ollamaApiKey?: string | undefined
		ollamaNumCtx?: number | undefined
		vsCodeLmModelSelector?:
			| {
					id?: string | undefined
					family?: string | undefined
					version?: string | undefined
					vendor?: string | undefined
			  }
			| undefined
		lmStudioModelId?: string | undefined
		lmStudioBaseUrl?: string | undefined
		lmStudioDraftModelId?: string | undefined
		lmStudioSpeculativeDecodingEnabled?: boolean | undefined
		geminiApiKey?: string | undefined
		googleGeminiBaseUrl?: string | undefined
		geminiCliOAuthPath?: string | undefined
		geminiCliProjectId?: string | undefined
		openAiNativeApiKey?: string | undefined
		openAiNativeBaseUrl?: string | undefined
		openAiNativeServiceTier?: "default" | "flex" | "priority" | undefined
		mistralApiKey?: string | undefined
		mistralCodestralUrl?: string | undefined
		deepSeekBaseUrl?: string | undefined
		deepSeekApiKey?: string | undefined
		poeApiKey?: string | undefined
		poeBaseUrl?: string | undefined
		moonshotBaseUrl?: "https://api.moonshot.ai/v1" | "https://api.moonshot.cn/v1" | undefined
		moonshotApiKey?: string | undefined
		minimaxBaseUrl?: "https://api.minimax.io/v1" | "https://api.minimaxi.com/v1" | undefined
		minimaxApiKey?: string | undefined
		requestyBaseUrl?: string | undefined
		requestyApiKey?: string | undefined
		requestyModelId?: string | undefined
		unboundApiKey?: string | undefined
		unboundModelId?: string | undefined
		fakeAi?: unknown
		xaiApiKey?: string | undefined
		litellmBaseUrl?: string | undefined
		litellmApiKey?: string | undefined
		litellmModelId?: string | undefined
		litellmUsePromptCache?: boolean | undefined
		sambaNovaApiKey?: string | undefined
		zaiApiKey?: string | undefined
		zaiApiLine?: "international_coding" | "china_coding" | "international_api" | "china_api" | undefined
		fireworksApiKey?: string | undefined
		qwenCodeOauthPath?: string | undefined
		vercelAiGatewayApiKey?: string | undefined
		vercelAiGatewayModelId?: string | undefined
		basetenApiKey?: string | undefined
		nvidiaNimApiKey?: string | undefined
		nvidiaNimBaseUrl?: string | undefined
	}
>
export type ProviderSettings = z.infer<typeof providerSettingsSchema>
export declare const providerSettingsWithIdSchema: z.ZodObject<
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
		includeMaxTokens: z.ZodOptional<z.ZodBoolean>
		todoListEnabled: z.ZodOptional<z.ZodBoolean>
		modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
		rateLimitSeconds: z.ZodOptional<z.ZodNumber>
		consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
		enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
		reasoningEffort: z.ZodOptional<z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>>
		modelMaxTokens: z.ZodOptional<z.ZodNumber>
		modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
		verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
		vercelAiGatewayApiKey: z.ZodOptional<z.ZodString>
		vercelAiGatewayModelId: z.ZodOptional<z.ZodString>
		apiModelId: z.ZodOptional<z.ZodString>
		qwenCodeOauthPath: z.ZodOptional<z.ZodString>
		fireworksApiKey: z.ZodOptional<z.ZodString>
		zaiApiKey: z.ZodOptional<z.ZodString>
		zaiApiLine: z.ZodOptional<z.ZodEnum<["international_coding", "china_coding", "international_api", "china_api"]>>
		sambaNovaApiKey: z.ZodOptional<z.ZodString>
		nvidiaNimApiKey: z.ZodOptional<z.ZodString>
		nvidiaNimBaseUrl: z.ZodOptional<z.ZodString>
		litellmBaseUrl: z.ZodOptional<z.ZodString>
		litellmApiKey: z.ZodOptional<z.ZodString>
		litellmModelId: z.ZodOptional<z.ZodString>
		litellmUsePromptCache: z.ZodOptional<z.ZodBoolean>
		basetenApiKey: z.ZodOptional<z.ZodString>
		xaiApiKey: z.ZodOptional<z.ZodString>
		fakeAi: z.ZodOptional<z.ZodUnknown>
		unboundApiKey: z.ZodOptional<z.ZodString>
		unboundModelId: z.ZodOptional<z.ZodString>
		requestyBaseUrl: z.ZodOptional<z.ZodString>
		requestyApiKey: z.ZodOptional<z.ZodString>
		requestyModelId: z.ZodOptional<z.ZodString>
		minimaxBaseUrl: z.ZodOptional<
			z.ZodUnion<[z.ZodLiteral<"https://api.minimax.io/v1">, z.ZodLiteral<"https://api.minimaxi.com/v1">]>
		>
		minimaxApiKey: z.ZodOptional<z.ZodString>
		moonshotBaseUrl: z.ZodOptional<
			z.ZodUnion<[z.ZodLiteral<"https://api.moonshot.ai/v1">, z.ZodLiteral<"https://api.moonshot.cn/v1">]>
		>
		moonshotApiKey: z.ZodOptional<z.ZodString>
		poeApiKey: z.ZodOptional<z.ZodString>
		poeBaseUrl: z.ZodOptional<z.ZodString>
		deepSeekBaseUrl: z.ZodOptional<z.ZodString>
		deepSeekApiKey: z.ZodOptional<z.ZodString>
		mistralApiKey: z.ZodOptional<z.ZodString>
		mistralCodestralUrl: z.ZodOptional<z.ZodString>
		openAiNativeApiKey: z.ZodOptional<z.ZodString>
		openAiNativeBaseUrl: z.ZodOptional<z.ZodString>
		openAiNativeServiceTier: z.ZodOptional<z.ZodEnum<["default", "flex", "priority"]>>
		geminiCliOAuthPath: z.ZodOptional<z.ZodString>
		geminiCliProjectId: z.ZodOptional<z.ZodString>
		geminiApiKey: z.ZodOptional<z.ZodString>
		googleGeminiBaseUrl: z.ZodOptional<z.ZodString>
		lmStudioModelId: z.ZodOptional<z.ZodString>
		lmStudioBaseUrl: z.ZodOptional<z.ZodString>
		lmStudioDraftModelId: z.ZodOptional<z.ZodString>
		lmStudioSpeculativeDecodingEnabled: z.ZodOptional<z.ZodBoolean>
		vsCodeLmModelSelector: z.ZodOptional<
			z.ZodObject<
				{
					vendor: z.ZodOptional<z.ZodString>
					family: z.ZodOptional<z.ZodString>
					version: z.ZodOptional<z.ZodString>
					id: z.ZodOptional<z.ZodString>
				},
				"strip",
				z.ZodTypeAny,
				{
					id?: string | undefined
					family?: string | undefined
					version?: string | undefined
					vendor?: string | undefined
				},
				{
					id?: string | undefined
					family?: string | undefined
					version?: string | undefined
					vendor?: string | undefined
				}
			>
		>
		ollamaModelId: z.ZodOptional<z.ZodString>
		ollamaBaseUrl: z.ZodOptional<z.ZodString>
		ollamaApiKey: z.ZodOptional<z.ZodString>
		ollamaNumCtx: z.ZodOptional<z.ZodNumber>
		openAiBaseUrl: z.ZodOptional<z.ZodString>
		openAiApiKey: z.ZodOptional<z.ZodString>
		openAiR1FormatEnabled: z.ZodOptional<z.ZodBoolean>
		openAiModelId: z.ZodOptional<z.ZodString>
		openAiCustomModelInfo: z.ZodOptional<
			z.ZodNullable<
				z.ZodObject<
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
									z.ZodArray<
										z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>,
										"many"
									>,
								]
							>
						>
						requiredReasoningEffort: z.ZodOptional<z.ZodBoolean>
						preserveReasoning: z.ZodOptional<z.ZodBoolean>
						supportedParameters: z.ZodOptional<
							z.ZodArray<
								z.ZodEnum<["max_tokens", "temperature", "reasoning", "include_reasoning"]>,
								"many"
							>
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
									appliesToServiceTiers: z.ZodOptional<
										z.ZodArray<z.ZodEnum<["default", "flex", "priority"]>, "many">
									>
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
						supportedParameters?:
							| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
							| undefined
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
						supportedParameters?:
							| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
							| undefined
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
			>
		>
		openAiUseAzure: z.ZodOptional<z.ZodBoolean>
		azureApiVersion: z.ZodOptional<z.ZodString>
		openAiStreamingEnabled: z.ZodOptional<z.ZodBoolean>
		openAiHostHeader: z.ZodOptional<z.ZodString>
		openAiHeaders: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
		vertexKeyFile: z.ZodOptional<z.ZodString>
		vertexJsonCredentials: z.ZodOptional<z.ZodString>
		vertexProjectId: z.ZodOptional<z.ZodString>
		vertexRegion: z.ZodOptional<z.ZodString>
		vertex1MContext: z.ZodOptional<z.ZodBoolean>
		awsAccessKey: z.ZodOptional<z.ZodString>
		awsSecretKey: z.ZodOptional<z.ZodString>
		awsSessionToken: z.ZodOptional<z.ZodString>
		awsRegion: z.ZodOptional<z.ZodString>
		awsUseCrossRegionInference: z.ZodOptional<z.ZodBoolean>
		awsUseGlobalInference: z.ZodOptional<z.ZodBoolean>
		awsUsePromptCache: z.ZodOptional<z.ZodBoolean>
		awsProfile: z.ZodOptional<z.ZodString>
		awsUseProfile: z.ZodOptional<z.ZodBoolean>
		awsApiKey: z.ZodOptional<z.ZodString>
		awsUseApiKey: z.ZodOptional<z.ZodBoolean>
		awsCustomArn: z.ZodOptional<z.ZodString>
		awsModelContextWindow: z.ZodOptional<z.ZodNumber>
		awsBedrockEndpointEnabled: z.ZodOptional<z.ZodBoolean>
		awsBedrockEndpoint: z.ZodOptional<z.ZodString>
		awsBedrock1MContext: z.ZodOptional<z.ZodBoolean>
		awsBedrockServiceTier: z.ZodOptional<z.ZodEnum<["STANDARD", "FLEX", "PRIORITY"]>>
		openRouterApiKey: z.ZodOptional<z.ZodString>
		openRouterModelId: z.ZodOptional<z.ZodString>
		openRouterBaseUrl: z.ZodOptional<z.ZodString>
		openRouterSpecificProvider: z.ZodOptional<z.ZodString>
		apiKey: z.ZodOptional<z.ZodString>
		anthropicBaseUrl: z.ZodOptional<z.ZodString>
		anthropicUseAuthToken: z.ZodOptional<z.ZodBoolean>
		anthropicBeta1MContext: z.ZodOptional<z.ZodBoolean>
		apiProvider: z.ZodOptional<
			z.ZodUnion<
				[
					z.ZodEnum<
						[
							"openrouter",
							"vercel-ai-gateway",
							"litellm",
							"requesty",
							"unbound",
							"poe",
							"ollama",
							"lmstudio",
							"vscode-lm",
							"openai",
							"fake-ai",
							"anthropic",
							"bedrock",
							"baseten",
							"deepseek",
							"fireworks",
							"gemini",
							"gemini-cli",
							"mistral",
							"moonshot",
							"minimax",
							"nvidia-nim",
							"openai-codex",
							"openai-native",
							"qwen-code",
							"sambanova",
							"vertex",
							"xai",
							"zai",
						]
					>,
					z.ZodEnum<
						[
							"cerebras",
							"chutes",
							"deepinfra",
							"doubao",
							"featherless",
							"groq",
							"huggingface",
							"io-intelligence",
							"ali",
						]
					>,
				]
			>
		>
	} & {
		id: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		id?: string | undefined
		codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
		codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
		codeIndexOpenAiKey?: string | undefined
		codeIndexQdrantApiKey?: string | undefined
		codebaseIndexOpenAiCompatibleApiKey?: string | undefined
		codebaseIndexGeminiApiKey?: string | undefined
		codebaseIndexMistralApiKey?: string | undefined
		codebaseIndexVercelAiGatewayApiKey?: string | undefined
		codebaseIndexOpenRouterApiKey?: string | undefined
		reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
		apiProvider?:
			| "openai"
			| "anthropic"
			| "ollama"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
			| "litellm"
			| "requesty"
			| "unbound"
			| "poe"
			| "lmstudio"
			| "vscode-lm"
			| "fake-ai"
			| "baseten"
			| "deepseek"
			| "fireworks"
			| "gemini-cli"
			| "moonshot"
			| "minimax"
			| "nvidia-nim"
			| "openai-codex"
			| "openai-native"
			| "qwen-code"
			| "sambanova"
			| "vertex"
			| "xai"
			| "zai"
			| "cerebras"
			| "chutes"
			| "deepinfra"
			| "doubao"
			| "featherless"
			| "groq"
			| "huggingface"
			| "io-intelligence"
			| "ali"
			| undefined
		includeMaxTokens?: boolean | undefined
		todoListEnabled?: boolean | undefined
		modelTemperature?: number | null | undefined
		rateLimitSeconds?: number | undefined
		consecutiveMistakeLimit?: number | undefined
		enableReasoningEffort?: boolean | undefined
		modelMaxTokens?: number | undefined
		modelMaxThinkingTokens?: number | undefined
		verbosity?: "low" | "medium" | "high" | undefined
		apiModelId?: string | undefined
		apiKey?: string | undefined
		anthropicBaseUrl?: string | undefined
		anthropicUseAuthToken?: boolean | undefined
		anthropicBeta1MContext?: boolean | undefined
		openRouterApiKey?: string | undefined
		openRouterModelId?: string | undefined
		openRouterBaseUrl?: string | undefined
		openRouterSpecificProvider?: string | undefined
		awsAccessKey?: string | undefined
		awsSecretKey?: string | undefined
		awsSessionToken?: string | undefined
		awsRegion?: string | undefined
		awsUseCrossRegionInference?: boolean | undefined
		awsUseGlobalInference?: boolean | undefined
		awsUsePromptCache?: boolean | undefined
		awsProfile?: string | undefined
		awsUseProfile?: boolean | undefined
		awsApiKey?: string | undefined
		awsUseApiKey?: boolean | undefined
		awsCustomArn?: string | undefined
		awsModelContextWindow?: number | undefined
		awsBedrockEndpointEnabled?: boolean | undefined
		awsBedrockEndpoint?: string | undefined
		awsBedrock1MContext?: boolean | undefined
		awsBedrockServiceTier?: "STANDARD" | "FLEX" | "PRIORITY" | undefined
		vertexKeyFile?: string | undefined
		vertexJsonCredentials?: string | undefined
		vertexProjectId?: string | undefined
		vertexRegion?: string | undefined
		vertex1MContext?: boolean | undefined
		openAiBaseUrl?: string | undefined
		openAiApiKey?: string | undefined
		openAiR1FormatEnabled?: boolean | undefined
		openAiModelId?: string | undefined
		openAiCustomModelInfo?:
			| {
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
					supportedParameters?:
						| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
						| undefined
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
			| null
			| undefined
		openAiUseAzure?: boolean | undefined
		azureApiVersion?: string | undefined
		openAiStreamingEnabled?: boolean | undefined
		openAiHostHeader?: string | undefined
		openAiHeaders?: Record<string, string> | undefined
		ollamaModelId?: string | undefined
		ollamaBaseUrl?: string | undefined
		ollamaApiKey?: string | undefined
		ollamaNumCtx?: number | undefined
		vsCodeLmModelSelector?:
			| {
					id?: string | undefined
					family?: string | undefined
					version?: string | undefined
					vendor?: string | undefined
			  }
			| undefined
		lmStudioModelId?: string | undefined
		lmStudioBaseUrl?: string | undefined
		lmStudioDraftModelId?: string | undefined
		lmStudioSpeculativeDecodingEnabled?: boolean | undefined
		geminiApiKey?: string | undefined
		googleGeminiBaseUrl?: string | undefined
		geminiCliOAuthPath?: string | undefined
		geminiCliProjectId?: string | undefined
		openAiNativeApiKey?: string | undefined
		openAiNativeBaseUrl?: string | undefined
		openAiNativeServiceTier?: "default" | "flex" | "priority" | undefined
		mistralApiKey?: string | undefined
		mistralCodestralUrl?: string | undefined
		deepSeekBaseUrl?: string | undefined
		deepSeekApiKey?: string | undefined
		poeApiKey?: string | undefined
		poeBaseUrl?: string | undefined
		moonshotBaseUrl?: "https://api.moonshot.ai/v1" | "https://api.moonshot.cn/v1" | undefined
		moonshotApiKey?: string | undefined
		minimaxBaseUrl?: "https://api.minimax.io/v1" | "https://api.minimaxi.com/v1" | undefined
		minimaxApiKey?: string | undefined
		requestyBaseUrl?: string | undefined
		requestyApiKey?: string | undefined
		requestyModelId?: string | undefined
		unboundApiKey?: string | undefined
		unboundModelId?: string | undefined
		fakeAi?: unknown
		xaiApiKey?: string | undefined
		litellmBaseUrl?: string | undefined
		litellmApiKey?: string | undefined
		litellmModelId?: string | undefined
		litellmUsePromptCache?: boolean | undefined
		sambaNovaApiKey?: string | undefined
		zaiApiKey?: string | undefined
		zaiApiLine?: "international_coding" | "china_coding" | "international_api" | "china_api" | undefined
		fireworksApiKey?: string | undefined
		qwenCodeOauthPath?: string | undefined
		vercelAiGatewayApiKey?: string | undefined
		vercelAiGatewayModelId?: string | undefined
		basetenApiKey?: string | undefined
		nvidiaNimApiKey?: string | undefined
		nvidiaNimBaseUrl?: string | undefined
	},
	{
		id?: string | undefined
		codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
		codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
		codeIndexOpenAiKey?: string | undefined
		codeIndexQdrantApiKey?: string | undefined
		codebaseIndexOpenAiCompatibleApiKey?: string | undefined
		codebaseIndexGeminiApiKey?: string | undefined
		codebaseIndexMistralApiKey?: string | undefined
		codebaseIndexVercelAiGatewayApiKey?: string | undefined
		codebaseIndexOpenRouterApiKey?: string | undefined
		reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
		apiProvider?:
			| "openai"
			| "anthropic"
			| "ollama"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
			| "litellm"
			| "requesty"
			| "unbound"
			| "poe"
			| "lmstudio"
			| "vscode-lm"
			| "fake-ai"
			| "baseten"
			| "deepseek"
			| "fireworks"
			| "gemini-cli"
			| "moonshot"
			| "minimax"
			| "nvidia-nim"
			| "openai-codex"
			| "openai-native"
			| "qwen-code"
			| "sambanova"
			| "vertex"
			| "xai"
			| "zai"
			| "cerebras"
			| "chutes"
			| "deepinfra"
			| "doubao"
			| "featherless"
			| "groq"
			| "huggingface"
			| "io-intelligence"
			| "ali"
			| undefined
		includeMaxTokens?: boolean | undefined
		todoListEnabled?: boolean | undefined
		modelTemperature?: number | null | undefined
		rateLimitSeconds?: number | undefined
		consecutiveMistakeLimit?: number | undefined
		enableReasoningEffort?: boolean | undefined
		modelMaxTokens?: number | undefined
		modelMaxThinkingTokens?: number | undefined
		verbosity?: "low" | "medium" | "high" | undefined
		apiModelId?: string | undefined
		apiKey?: string | undefined
		anthropicBaseUrl?: string | undefined
		anthropicUseAuthToken?: boolean | undefined
		anthropicBeta1MContext?: boolean | undefined
		openRouterApiKey?: string | undefined
		openRouterModelId?: string | undefined
		openRouterBaseUrl?: string | undefined
		openRouterSpecificProvider?: string | undefined
		awsAccessKey?: string | undefined
		awsSecretKey?: string | undefined
		awsSessionToken?: string | undefined
		awsRegion?: string | undefined
		awsUseCrossRegionInference?: boolean | undefined
		awsUseGlobalInference?: boolean | undefined
		awsUsePromptCache?: boolean | undefined
		awsProfile?: string | undefined
		awsUseProfile?: boolean | undefined
		awsApiKey?: string | undefined
		awsUseApiKey?: boolean | undefined
		awsCustomArn?: string | undefined
		awsModelContextWindow?: number | undefined
		awsBedrockEndpointEnabled?: boolean | undefined
		awsBedrockEndpoint?: string | undefined
		awsBedrock1MContext?: boolean | undefined
		awsBedrockServiceTier?: "STANDARD" | "FLEX" | "PRIORITY" | undefined
		vertexKeyFile?: string | undefined
		vertexJsonCredentials?: string | undefined
		vertexProjectId?: string | undefined
		vertexRegion?: string | undefined
		vertex1MContext?: boolean | undefined
		openAiBaseUrl?: string | undefined
		openAiApiKey?: string | undefined
		openAiR1FormatEnabled?: boolean | undefined
		openAiModelId?: string | undefined
		openAiCustomModelInfo?:
			| {
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
					supportedParameters?:
						| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
						| undefined
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
			| null
			| undefined
		openAiUseAzure?: boolean | undefined
		azureApiVersion?: string | undefined
		openAiStreamingEnabled?: boolean | undefined
		openAiHostHeader?: string | undefined
		openAiHeaders?: Record<string, string> | undefined
		ollamaModelId?: string | undefined
		ollamaBaseUrl?: string | undefined
		ollamaApiKey?: string | undefined
		ollamaNumCtx?: number | undefined
		vsCodeLmModelSelector?:
			| {
					id?: string | undefined
					family?: string | undefined
					version?: string | undefined
					vendor?: string | undefined
			  }
			| undefined
		lmStudioModelId?: string | undefined
		lmStudioBaseUrl?: string | undefined
		lmStudioDraftModelId?: string | undefined
		lmStudioSpeculativeDecodingEnabled?: boolean | undefined
		geminiApiKey?: string | undefined
		googleGeminiBaseUrl?: string | undefined
		geminiCliOAuthPath?: string | undefined
		geminiCliProjectId?: string | undefined
		openAiNativeApiKey?: string | undefined
		openAiNativeBaseUrl?: string | undefined
		openAiNativeServiceTier?: "default" | "flex" | "priority" | undefined
		mistralApiKey?: string | undefined
		mistralCodestralUrl?: string | undefined
		deepSeekBaseUrl?: string | undefined
		deepSeekApiKey?: string | undefined
		poeApiKey?: string | undefined
		poeBaseUrl?: string | undefined
		moonshotBaseUrl?: "https://api.moonshot.ai/v1" | "https://api.moonshot.cn/v1" | undefined
		moonshotApiKey?: string | undefined
		minimaxBaseUrl?: "https://api.minimax.io/v1" | "https://api.minimaxi.com/v1" | undefined
		minimaxApiKey?: string | undefined
		requestyBaseUrl?: string | undefined
		requestyApiKey?: string | undefined
		requestyModelId?: string | undefined
		unboundApiKey?: string | undefined
		unboundModelId?: string | undefined
		fakeAi?: unknown
		xaiApiKey?: string | undefined
		litellmBaseUrl?: string | undefined
		litellmApiKey?: string | undefined
		litellmModelId?: string | undefined
		litellmUsePromptCache?: boolean | undefined
		sambaNovaApiKey?: string | undefined
		zaiApiKey?: string | undefined
		zaiApiLine?: "international_coding" | "china_coding" | "international_api" | "china_api" | undefined
		fireworksApiKey?: string | undefined
		qwenCodeOauthPath?: string | undefined
		vercelAiGatewayApiKey?: string | undefined
		vercelAiGatewayModelId?: string | undefined
		basetenApiKey?: string | undefined
		nvidiaNimApiKey?: string | undefined
		nvidiaNimBaseUrl?: string | undefined
	}
>
export declare const discriminatedProviderSettingsWithIdSchema: z.ZodIntersection<
	z.ZodDiscriminatedUnion<
		"apiProvider",
		[
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					apiKey: z.ZodOptional<z.ZodString>
					anthropicBaseUrl: z.ZodOptional<z.ZodString>
					anthropicUseAuthToken: z.ZodOptional<z.ZodBoolean>
					anthropicBeta1MContext: z.ZodOptional<z.ZodBoolean>
				} & {
					apiProvider: z.ZodLiteral<"anthropic">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "anthropic"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					apiKey?: string | undefined
					anthropicBaseUrl?: string | undefined
					anthropicUseAuthToken?: boolean | undefined
					anthropicBeta1MContext?: boolean | undefined
				},
				{
					apiProvider: "anthropic"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					apiKey?: string | undefined
					anthropicBaseUrl?: string | undefined
					anthropicUseAuthToken?: boolean | undefined
					anthropicBeta1MContext?: boolean | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					openRouterApiKey: z.ZodOptional<z.ZodString>
					openRouterModelId: z.ZodOptional<z.ZodString>
					openRouterBaseUrl: z.ZodOptional<z.ZodString>
					openRouterSpecificProvider: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"openrouter">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "openrouter"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					openRouterApiKey?: string | undefined
					openRouterModelId?: string | undefined
					openRouterBaseUrl?: string | undefined
					openRouterSpecificProvider?: string | undefined
				},
				{
					apiProvider: "openrouter"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					openRouterApiKey?: string | undefined
					openRouterModelId?: string | undefined
					openRouterBaseUrl?: string | undefined
					openRouterSpecificProvider?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					awsAccessKey: z.ZodOptional<z.ZodString>
					awsSecretKey: z.ZodOptional<z.ZodString>
					awsSessionToken: z.ZodOptional<z.ZodString>
					awsRegion: z.ZodOptional<z.ZodString>
					awsUseCrossRegionInference: z.ZodOptional<z.ZodBoolean>
					awsUseGlobalInference: z.ZodOptional<z.ZodBoolean>
					awsUsePromptCache: z.ZodOptional<z.ZodBoolean>
					awsProfile: z.ZodOptional<z.ZodString>
					awsUseProfile: z.ZodOptional<z.ZodBoolean>
					awsApiKey: z.ZodOptional<z.ZodString>
					awsUseApiKey: z.ZodOptional<z.ZodBoolean>
					awsCustomArn: z.ZodOptional<z.ZodString>
					awsModelContextWindow: z.ZodOptional<z.ZodNumber>
					awsBedrockEndpointEnabled: z.ZodOptional<z.ZodBoolean>
					awsBedrockEndpoint: z.ZodOptional<z.ZodString>
					awsBedrock1MContext: z.ZodOptional<z.ZodBoolean>
					awsBedrockServiceTier: z.ZodOptional<z.ZodEnum<["STANDARD", "FLEX", "PRIORITY"]>>
				} & {
					apiProvider: z.ZodLiteral<"bedrock">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "bedrock"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					awsAccessKey?: string | undefined
					awsSecretKey?: string | undefined
					awsSessionToken?: string | undefined
					awsRegion?: string | undefined
					awsUseCrossRegionInference?: boolean | undefined
					awsUseGlobalInference?: boolean | undefined
					awsUsePromptCache?: boolean | undefined
					awsProfile?: string | undefined
					awsUseProfile?: boolean | undefined
					awsApiKey?: string | undefined
					awsUseApiKey?: boolean | undefined
					awsCustomArn?: string | undefined
					awsModelContextWindow?: number | undefined
					awsBedrockEndpointEnabled?: boolean | undefined
					awsBedrockEndpoint?: string | undefined
					awsBedrock1MContext?: boolean | undefined
					awsBedrockServiceTier?: "STANDARD" | "FLEX" | "PRIORITY" | undefined
				},
				{
					apiProvider: "bedrock"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					awsAccessKey?: string | undefined
					awsSecretKey?: string | undefined
					awsSessionToken?: string | undefined
					awsRegion?: string | undefined
					awsUseCrossRegionInference?: boolean | undefined
					awsUseGlobalInference?: boolean | undefined
					awsUsePromptCache?: boolean | undefined
					awsProfile?: string | undefined
					awsUseProfile?: boolean | undefined
					awsApiKey?: string | undefined
					awsUseApiKey?: boolean | undefined
					awsCustomArn?: string | undefined
					awsModelContextWindow?: number | undefined
					awsBedrockEndpointEnabled?: boolean | undefined
					awsBedrockEndpoint?: string | undefined
					awsBedrock1MContext?: boolean | undefined
					awsBedrockServiceTier?: "STANDARD" | "FLEX" | "PRIORITY" | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					vertexKeyFile: z.ZodOptional<z.ZodString>
					vertexJsonCredentials: z.ZodOptional<z.ZodString>
					vertexProjectId: z.ZodOptional<z.ZodString>
					vertexRegion: z.ZodOptional<z.ZodString>
					vertex1MContext: z.ZodOptional<z.ZodBoolean>
				} & {
					apiProvider: z.ZodLiteral<"vertex">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "vertex"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					vertexKeyFile?: string | undefined
					vertexJsonCredentials?: string | undefined
					vertexProjectId?: string | undefined
					vertexRegion?: string | undefined
					vertex1MContext?: boolean | undefined
				},
				{
					apiProvider: "vertex"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					vertexKeyFile?: string | undefined
					vertexJsonCredentials?: string | undefined
					vertexProjectId?: string | undefined
					vertexRegion?: string | undefined
					vertex1MContext?: boolean | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					openAiBaseUrl: z.ZodOptional<z.ZodString>
					openAiApiKey: z.ZodOptional<z.ZodString>
					openAiR1FormatEnabled: z.ZodOptional<z.ZodBoolean>
					openAiModelId: z.ZodOptional<z.ZodString>
					openAiCustomModelInfo: z.ZodOptional<
						z.ZodNullable<
							z.ZodObject<
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
												z.ZodArray<
													z.ZodEnum<
														["disable", "none", "minimal", "low", "medium", "high", "xhigh"]
													>,
													"many"
												>,
											]
										>
									>
									requiredReasoningEffort: z.ZodOptional<z.ZodBoolean>
									preserveReasoning: z.ZodOptional<z.ZodBoolean>
									supportedParameters: z.ZodOptional<
										z.ZodArray<
											z.ZodEnum<["max_tokens", "temperature", "reasoning", "include_reasoning"]>,
											"many"
										>
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
												appliesToServiceTiers: z.ZodOptional<
													z.ZodArray<z.ZodEnum<["default", "flex", "priority"]>, "many">
												>
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
									reasoningEffort: z.ZodOptional<
										z.ZodEnum<["none", "minimal", "low", "medium", "high", "xhigh"]>
									>
									minTokensPerCachePoint: z.ZodOptional<z.ZodNumber>
									maxCachePoints: z.ZodOptional<z.ZodNumber>
									cachableFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
									deprecated: z.ZodOptional<z.ZodBoolean>
									isStealthModel: z.ZodOptional<z.ZodBoolean>
									isFree: z.ZodOptional<z.ZodBoolean>
									excludedTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
									includedTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
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
									supportedParameters?:
										| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
										| undefined
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
									reasoningEffort?:
										| "none"
										| "minimal"
										| "low"
										| "medium"
										| "high"
										| "xhigh"
										| undefined
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
									supportedParameters?:
										| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
										| undefined
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
									reasoningEffort?:
										| "none"
										| "minimal"
										| "low"
										| "medium"
										| "high"
										| "xhigh"
										| undefined
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
						>
					>
					openAiUseAzure: z.ZodOptional<z.ZodBoolean>
					azureApiVersion: z.ZodOptional<z.ZodString>
					openAiStreamingEnabled: z.ZodOptional<z.ZodBoolean>
					openAiHostHeader: z.ZodOptional<z.ZodString>
					openAiHeaders: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
				} & {
					apiProvider: z.ZodLiteral<"openai">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "openai"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					openAiBaseUrl?: string | undefined
					openAiApiKey?: string | undefined
					openAiR1FormatEnabled?: boolean | undefined
					openAiModelId?: string | undefined
					openAiCustomModelInfo?:
						| {
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
								supportedParameters?:
									| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
									| undefined
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
						| null
						| undefined
					openAiUseAzure?: boolean | undefined
					azureApiVersion?: string | undefined
					openAiStreamingEnabled?: boolean | undefined
					openAiHostHeader?: string | undefined
					openAiHeaders?: Record<string, string> | undefined
				},
				{
					apiProvider: "openai"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					openAiBaseUrl?: string | undefined
					openAiApiKey?: string | undefined
					openAiR1FormatEnabled?: boolean | undefined
					openAiModelId?: string | undefined
					openAiCustomModelInfo?:
						| {
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
								supportedParameters?:
									| ("reasoning" | "max_tokens" | "temperature" | "include_reasoning")[]
									| undefined
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
						| null
						| undefined
					openAiUseAzure?: boolean | undefined
					azureApiVersion?: string | undefined
					openAiStreamingEnabled?: boolean | undefined
					openAiHostHeader?: string | undefined
					openAiHeaders?: Record<string, string> | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					ollamaModelId: z.ZodOptional<z.ZodString>
					ollamaBaseUrl: z.ZodOptional<z.ZodString>
					ollamaApiKey: z.ZodOptional<z.ZodString>
					ollamaNumCtx: z.ZodOptional<z.ZodNumber>
				} & {
					apiProvider: z.ZodLiteral<"ollama">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "ollama"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					ollamaModelId?: string | undefined
					ollamaBaseUrl?: string | undefined
					ollamaApiKey?: string | undefined
					ollamaNumCtx?: number | undefined
				},
				{
					apiProvider: "ollama"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					ollamaModelId?: string | undefined
					ollamaBaseUrl?: string | undefined
					ollamaApiKey?: string | undefined
					ollamaNumCtx?: number | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					vsCodeLmModelSelector: z.ZodOptional<
						z.ZodObject<
							{
								vendor: z.ZodOptional<z.ZodString>
								family: z.ZodOptional<z.ZodString>
								version: z.ZodOptional<z.ZodString>
								id: z.ZodOptional<z.ZodString>
							},
							"strip",
							z.ZodTypeAny,
							{
								id?: string | undefined
								family?: string | undefined
								version?: string | undefined
								vendor?: string | undefined
							},
							{
								id?: string | undefined
								family?: string | undefined
								version?: string | undefined
								vendor?: string | undefined
							}
						>
					>
				} & {
					apiProvider: z.ZodLiteral<"vscode-lm">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "vscode-lm"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					vsCodeLmModelSelector?:
						| {
								id?: string | undefined
								family?: string | undefined
								version?: string | undefined
								vendor?: string | undefined
						  }
						| undefined
				},
				{
					apiProvider: "vscode-lm"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					vsCodeLmModelSelector?:
						| {
								id?: string | undefined
								family?: string | undefined
								version?: string | undefined
								vendor?: string | undefined
						  }
						| undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					lmStudioModelId: z.ZodOptional<z.ZodString>
					lmStudioBaseUrl: z.ZodOptional<z.ZodString>
					lmStudioDraftModelId: z.ZodOptional<z.ZodString>
					lmStudioSpeculativeDecodingEnabled: z.ZodOptional<z.ZodBoolean>
				} & {
					apiProvider: z.ZodLiteral<"lmstudio">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "lmstudio"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					lmStudioModelId?: string | undefined
					lmStudioBaseUrl?: string | undefined
					lmStudioDraftModelId?: string | undefined
					lmStudioSpeculativeDecodingEnabled?: boolean | undefined
				},
				{
					apiProvider: "lmstudio"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					lmStudioModelId?: string | undefined
					lmStudioBaseUrl?: string | undefined
					lmStudioDraftModelId?: string | undefined
					lmStudioSpeculativeDecodingEnabled?: boolean | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					geminiApiKey: z.ZodOptional<z.ZodString>
					googleGeminiBaseUrl: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"gemini">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "gemini"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					geminiApiKey?: string | undefined
					googleGeminiBaseUrl?: string | undefined
				},
				{
					apiProvider: "gemini"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					geminiApiKey?: string | undefined
					googleGeminiBaseUrl?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					geminiCliOAuthPath: z.ZodOptional<z.ZodString>
					geminiCliProjectId: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"gemini-cli">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "gemini-cli"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					geminiCliOAuthPath?: string | undefined
					geminiCliProjectId?: string | undefined
				},
				{
					apiProvider: "gemini-cli"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					geminiCliOAuthPath?: string | undefined
					geminiCliProjectId?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"openai-codex">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "openai-codex"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
				},
				{
					apiProvider: "openai-codex"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					openAiNativeApiKey: z.ZodOptional<z.ZodString>
					openAiNativeBaseUrl: z.ZodOptional<z.ZodString>
					openAiNativeServiceTier: z.ZodOptional<z.ZodEnum<["default", "flex", "priority"]>>
				} & {
					apiProvider: z.ZodLiteral<"openai-native">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "openai-native"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					openAiNativeApiKey?: string | undefined
					openAiNativeBaseUrl?: string | undefined
					openAiNativeServiceTier?: "default" | "flex" | "priority" | undefined
				},
				{
					apiProvider: "openai-native"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					openAiNativeApiKey?: string | undefined
					openAiNativeBaseUrl?: string | undefined
					openAiNativeServiceTier?: "default" | "flex" | "priority" | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					mistralApiKey: z.ZodOptional<z.ZodString>
					mistralCodestralUrl: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"mistral">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "mistral"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					mistralApiKey?: string | undefined
					mistralCodestralUrl?: string | undefined
				},
				{
					apiProvider: "mistral"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					mistralApiKey?: string | undefined
					mistralCodestralUrl?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					deepSeekBaseUrl: z.ZodOptional<z.ZodString>
					deepSeekApiKey: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"deepseek">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "deepseek"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					deepSeekBaseUrl?: string | undefined
					deepSeekApiKey?: string | undefined
				},
				{
					apiProvider: "deepseek"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					deepSeekBaseUrl?: string | undefined
					deepSeekApiKey?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					poeApiKey: z.ZodOptional<z.ZodString>
					poeBaseUrl: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"poe">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "poe"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					poeApiKey?: string | undefined
					poeBaseUrl?: string | undefined
				},
				{
					apiProvider: "poe"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					poeApiKey?: string | undefined
					poeBaseUrl?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					moonshotBaseUrl: z.ZodOptional<
						z.ZodUnion<
							[z.ZodLiteral<"https://api.moonshot.ai/v1">, z.ZodLiteral<"https://api.moonshot.cn/v1">]
						>
					>
					moonshotApiKey: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"moonshot">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "moonshot"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					moonshotBaseUrl?: "https://api.moonshot.ai/v1" | "https://api.moonshot.cn/v1" | undefined
					moonshotApiKey?: string | undefined
				},
				{
					apiProvider: "moonshot"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					moonshotBaseUrl?: "https://api.moonshot.ai/v1" | "https://api.moonshot.cn/v1" | undefined
					moonshotApiKey?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					minimaxBaseUrl: z.ZodOptional<
						z.ZodUnion<
							[z.ZodLiteral<"https://api.minimax.io/v1">, z.ZodLiteral<"https://api.minimaxi.com/v1">]
						>
					>
					minimaxApiKey: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"minimax">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "minimax"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					minimaxBaseUrl?: "https://api.minimax.io/v1" | "https://api.minimaxi.com/v1" | undefined
					minimaxApiKey?: string | undefined
				},
				{
					apiProvider: "minimax"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					minimaxBaseUrl?: "https://api.minimax.io/v1" | "https://api.minimaxi.com/v1" | undefined
					minimaxApiKey?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					nvidiaNimApiKey: z.ZodOptional<z.ZodString>
					nvidiaNimBaseUrl: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"nvidia-nim">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "nvidia-nim"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					nvidiaNimApiKey?: string | undefined
					nvidiaNimBaseUrl?: string | undefined
				},
				{
					apiProvider: "nvidia-nim"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					nvidiaNimApiKey?: string | undefined
					nvidiaNimBaseUrl?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					requestyBaseUrl: z.ZodOptional<z.ZodString>
					requestyApiKey: z.ZodOptional<z.ZodString>
					requestyModelId: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"requesty">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "requesty"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					requestyBaseUrl?: string | undefined
					requestyApiKey?: string | undefined
					requestyModelId?: string | undefined
				},
				{
					apiProvider: "requesty"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					requestyBaseUrl?: string | undefined
					requestyApiKey?: string | undefined
					requestyModelId?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					unboundApiKey: z.ZodOptional<z.ZodString>
					unboundModelId: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"unbound">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "unbound"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					unboundApiKey?: string | undefined
					unboundModelId?: string | undefined
				},
				{
					apiProvider: "unbound"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					unboundApiKey?: string | undefined
					unboundModelId?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					fakeAi: z.ZodOptional<z.ZodUnknown>
				} & {
					apiProvider: z.ZodLiteral<"fake-ai">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "fake-ai"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					fakeAi?: unknown
				},
				{
					apiProvider: "fake-ai"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					fakeAi?: unknown
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					xaiApiKey: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"xai">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "xai"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					xaiApiKey?: string | undefined
				},
				{
					apiProvider: "xai"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					xaiApiKey?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					basetenApiKey: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"baseten">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "baseten"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					basetenApiKey?: string | undefined
				},
				{
					apiProvider: "baseten"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					basetenApiKey?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					litellmBaseUrl: z.ZodOptional<z.ZodString>
					litellmApiKey: z.ZodOptional<z.ZodString>
					litellmModelId: z.ZodOptional<z.ZodString>
					litellmUsePromptCache: z.ZodOptional<z.ZodBoolean>
				} & {
					apiProvider: z.ZodLiteral<"litellm">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "litellm"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					litellmBaseUrl?: string | undefined
					litellmApiKey?: string | undefined
					litellmModelId?: string | undefined
					litellmUsePromptCache?: boolean | undefined
				},
				{
					apiProvider: "litellm"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					litellmBaseUrl?: string | undefined
					litellmApiKey?: string | undefined
					litellmModelId?: string | undefined
					litellmUsePromptCache?: boolean | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					sambaNovaApiKey: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"sambanova">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "sambanova"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					sambaNovaApiKey?: string | undefined
				},
				{
					apiProvider: "sambanova"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					sambaNovaApiKey?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					zaiApiKey: z.ZodOptional<z.ZodString>
					zaiApiLine: z.ZodOptional<
						z.ZodEnum<["international_coding", "china_coding", "international_api", "china_api"]>
					>
				} & {
					apiProvider: z.ZodLiteral<"zai">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "zai"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					zaiApiKey?: string | undefined
					zaiApiLine?: "international_coding" | "china_coding" | "international_api" | "china_api" | undefined
				},
				{
					apiProvider: "zai"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					zaiApiKey?: string | undefined
					zaiApiLine?: "international_coding" | "china_coding" | "international_api" | "china_api" | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					fireworksApiKey: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"fireworks">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "fireworks"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					fireworksApiKey?: string | undefined
				},
				{
					apiProvider: "fireworks"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					fireworksApiKey?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					apiModelId: z.ZodOptional<z.ZodString>
				} & {
					qwenCodeOauthPath: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"qwen-code">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "qwen-code"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					qwenCodeOauthPath?: string | undefined
				},
				{
					apiProvider: "qwen-code"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					apiModelId?: string | undefined
					qwenCodeOauthPath?: string | undefined
				}
			>,
			z.ZodObject<
				{
					includeMaxTokens: z.ZodOptional<z.ZodBoolean>
					todoListEnabled: z.ZodOptional<z.ZodBoolean>
					modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
					rateLimitSeconds: z.ZodOptional<z.ZodNumber>
					consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
					enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
				} & {
					vercelAiGatewayApiKey: z.ZodOptional<z.ZodString>
					vercelAiGatewayModelId: z.ZodOptional<z.ZodString>
				} & {
					apiProvider: z.ZodLiteral<"vercel-ai-gateway">
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider: "vercel-ai-gateway"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					vercelAiGatewayApiKey?: string | undefined
					vercelAiGatewayModelId?: string | undefined
				},
				{
					apiProvider: "vercel-ai-gateway"
					reasoningEffort?: "disable" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
					includeMaxTokens?: boolean | undefined
					todoListEnabled?: boolean | undefined
					modelTemperature?: number | null | undefined
					rateLimitSeconds?: number | undefined
					consecutiveMistakeLimit?: number | undefined
					enableReasoningEffort?: boolean | undefined
					modelMaxTokens?: number | undefined
					modelMaxThinkingTokens?: number | undefined
					verbosity?: "low" | "medium" | "high" | undefined
					vercelAiGatewayApiKey?: string | undefined
					vercelAiGatewayModelId?: string | undefined
				}
			>,
			z.ZodObject<
				{
					apiProvider: z.ZodUndefined
				},
				"strip",
				z.ZodTypeAny,
				{
					apiProvider?: undefined
				},
				{
					apiProvider?: undefined
				}
			>,
		]
	>,
	z.ZodObject<
		{
			id: z.ZodOptional<z.ZodString>
		},
		"strip",
		z.ZodTypeAny,
		{
			id?: string | undefined
		},
		{
			id?: string | undefined
		}
	>
>
export type ProviderSettingsWithId = z.infer<typeof providerSettingsWithIdSchema>
export declare const PROVIDER_SETTINGS_KEYS: [
	"codebaseIndexOpenAiCompatibleBaseUrl",
	"codebaseIndexOpenAiCompatibleModelDimension",
	"codeIndexOpenAiKey",
	"codeIndexQdrantApiKey",
	"codebaseIndexOpenAiCompatibleApiKey",
	"codebaseIndexGeminiApiKey",
	"codebaseIndexMistralApiKey",
	"codebaseIndexVercelAiGatewayApiKey",
	"codebaseIndexOpenRouterApiKey",
	"reasoningEffort",
	"apiProvider",
	"includeMaxTokens",
	"todoListEnabled",
	"modelTemperature",
	"rateLimitSeconds",
	"consecutiveMistakeLimit",
	"enableReasoningEffort",
	"modelMaxTokens",
	"modelMaxThinkingTokens",
	"verbosity",
	"apiModelId",
	"apiKey",
	"anthropicBaseUrl",
	"anthropicUseAuthToken",
	"anthropicBeta1MContext",
	"openRouterApiKey",
	"openRouterModelId",
	"openRouterBaseUrl",
	"openRouterSpecificProvider",
	"awsAccessKey",
	"awsSecretKey",
	"awsSessionToken",
	"awsRegion",
	"awsUseCrossRegionInference",
	"awsUseGlobalInference",
	"awsUsePromptCache",
	"awsProfile",
	"awsUseProfile",
	"awsApiKey",
	"awsUseApiKey",
	"awsCustomArn",
	"awsModelContextWindow",
	"awsBedrockEndpointEnabled",
	"awsBedrockEndpoint",
	"awsBedrock1MContext",
	"awsBedrockServiceTier",
	"vertexKeyFile",
	"vertexJsonCredentials",
	"vertexProjectId",
	"vertexRegion",
	"vertex1MContext",
	"openAiBaseUrl",
	"openAiApiKey",
	"openAiR1FormatEnabled",
	"openAiModelId",
	"openAiCustomModelInfo",
	"openAiUseAzure",
	"azureApiVersion",
	"openAiStreamingEnabled",
	"openAiHostHeader",
	"openAiHeaders",
	"ollamaModelId",
	"ollamaBaseUrl",
	"ollamaApiKey",
	"ollamaNumCtx",
	"vsCodeLmModelSelector",
	"lmStudioModelId",
	"lmStudioBaseUrl",
	"lmStudioDraftModelId",
	"lmStudioSpeculativeDecodingEnabled",
	"geminiApiKey",
	"googleGeminiBaseUrl",
	"geminiCliOAuthPath",
	"geminiCliProjectId",
	"openAiNativeApiKey",
	"openAiNativeBaseUrl",
	"openAiNativeServiceTier",
	"mistralApiKey",
	"mistralCodestralUrl",
	"deepSeekBaseUrl",
	"deepSeekApiKey",
	"poeApiKey",
	"poeBaseUrl",
	"moonshotBaseUrl",
	"moonshotApiKey",
	"minimaxBaseUrl",
	"minimaxApiKey",
	"requestyBaseUrl",
	"requestyApiKey",
	"requestyModelId",
	"unboundApiKey",
	"unboundModelId",
	"fakeAi",
	"xaiApiKey",
	"litellmBaseUrl",
	"litellmApiKey",
	"litellmModelId",
	"litellmUsePromptCache",
	"sambaNovaApiKey",
	"zaiApiKey",
	"zaiApiLine",
	"fireworksApiKey",
	"qwenCodeOauthPath",
	"vercelAiGatewayApiKey",
	"vercelAiGatewayModelId",
	"basetenApiKey",
	"nvidiaNimApiKey",
	"nvidiaNimBaseUrl",
]
/**
 * ModelIdKey
 */
export declare const modelIdKeys: readonly [
	"apiModelId",
	"openRouterModelId",
	"openAiModelId",
	"ollamaModelId",
	"lmStudioModelId",
	"lmStudioDraftModelId",
	"requestyModelId",
	"unboundModelId",
	"litellmModelId",
	"vercelAiGatewayModelId",
]
export type ModelIdKey = (typeof modelIdKeys)[number]
export declare const getModelId: (settings: ProviderSettings) => string | undefined
/**
 * TypicalProvider
 */
export type TypicalProvider = Exclude<ProviderName, InternalProvider | CustomProvider | FauxProvider>
export declare const isTypicalProvider: (key: unknown) => key is TypicalProvider
export declare const modelIdKeysByProvider: Record<TypicalProvider, ModelIdKey>
/**
 * ANTHROPIC_STYLE_PROVIDERS
 */
export declare const ANTHROPIC_STYLE_PROVIDERS: ProviderName[]
export declare const getApiProtocol: (provider: ProviderName | undefined, modelId?: string) => "anthropic" | "openai"
/**
 * MODELS_BY_PROVIDER
 */
export declare const MODELS_BY_PROVIDER: Record<
	Exclude<ProviderName, "fake-ai" | "gemini-cli" | "openai">,
	{
		id: ProviderName
		label: string
		models: string[]
	}
>
//# sourceMappingURL=provider-settings.d.ts.map
