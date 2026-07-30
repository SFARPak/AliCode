import { ExtensionContext } from "vscode"
import { z } from "zod"
import { type ProviderSettingsWithId, ProviderSettingsEntry } from "@ali-code/types"
import { Mode } from "../../shared/modes"
export declare const providerProfilesSchema: z.ZodObject<
	{
		currentApiConfigName: z.ZodString
		apiConfigs: z.ZodRecord<
			z.ZodString,
			z.ZodObject<
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
					reasoningEffort: z.ZodOptional<
						z.ZodEnum<["disable", "none", "minimal", "low", "medium", "high", "xhigh"]>
					>
					modelMaxTokens: z.ZodOptional<z.ZodNumber>
					modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
					verbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
					vercelAiGatewayApiKey: z.ZodOptional<z.ZodString>
					vercelAiGatewayModelId: z.ZodOptional<z.ZodString>
					apiModelId: z.ZodOptional<z.ZodString>
					qwenCodeOauthPath: z.ZodOptional<z.ZodString>
					fireworksApiKey: z.ZodOptional<z.ZodString>
					zaiApiKey: z.ZodOptional<z.ZodString>
					zaiApiLine: z.ZodOptional<
						z.ZodEnum<["international_coding", "china_coding", "international_api", "china_api"]>
					>
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
						z.ZodUnion<
							[z.ZodLiteral<"https://api.minimax.io/v1">, z.ZodLiteral<"https://api.minimaxi.com/v1">]
						>
					>
					minimaxApiKey: z.ZodOptional<z.ZodString>
					moonshotBaseUrl: z.ZodOptional<
						z.ZodUnion<
							[z.ZodLiteral<"https://api.moonshot.ai/v1">, z.ZodLiteral<"https://api.moonshot.cn/v1">]
						>
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
		>
		modeApiConfigs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
		migrations: z.ZodOptional<
			z.ZodObject<
				{
					rateLimitSecondsMigrated: z.ZodOptional<z.ZodBoolean>
					openAiHeadersMigrated: z.ZodOptional<z.ZodBoolean>
					consecutiveMistakeLimitMigrated: z.ZodOptional<z.ZodBoolean>
					todoListEnabledMigrated: z.ZodOptional<z.ZodBoolean>
					claudeCodeLegacySettingsMigrated: z.ZodOptional<z.ZodBoolean>
				},
				"strip",
				z.ZodTypeAny,
				{
					rateLimitSecondsMigrated?: boolean | undefined
					openAiHeadersMigrated?: boolean | undefined
					consecutiveMistakeLimitMigrated?: boolean | undefined
					todoListEnabledMigrated?: boolean | undefined
					claudeCodeLegacySettingsMigrated?: boolean | undefined
				},
				{
					rateLimitSecondsMigrated?: boolean | undefined
					openAiHeadersMigrated?: boolean | undefined
					consecutiveMistakeLimitMigrated?: boolean | undefined
					todoListEnabledMigrated?: boolean | undefined
					claudeCodeLegacySettingsMigrated?: boolean | undefined
				}
			>
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		currentApiConfigName: string
		apiConfigs: Record<
			string,
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
		modeApiConfigs?: Record<string, string> | undefined
		migrations?:
			| {
					rateLimitSecondsMigrated?: boolean | undefined
					openAiHeadersMigrated?: boolean | undefined
					consecutiveMistakeLimitMigrated?: boolean | undefined
					todoListEnabledMigrated?: boolean | undefined
					claudeCodeLegacySettingsMigrated?: boolean | undefined
			  }
			| undefined
	},
	{
		currentApiConfigName: string
		apiConfigs: Record<
			string,
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
		modeApiConfigs?: Record<string, string> | undefined
		migrations?:
			| {
					rateLimitSecondsMigrated?: boolean | undefined
					openAiHeadersMigrated?: boolean | undefined
					consecutiveMistakeLimitMigrated?: boolean | undefined
					todoListEnabledMigrated?: boolean | undefined
					claudeCodeLegacySettingsMigrated?: boolean | undefined
			  }
			| undefined
	}
>
export type ProviderProfiles = z.infer<typeof providerProfilesSchema>
export declare class ProviderSettingsManager {
	private static readonly SCOPE_PREFIX
	private readonly defaultConfigId
	private readonly defaultModeApiConfigs
	private readonly defaultProviderProfiles
	private readonly context
	constructor(context: ExtensionContext)
	generateId(): string
	private _lock
	private lock
	/**
	 * Initialize config if it doesn't exist and run migrations.
	 */
	initialize(): Promise<void>
	private migrateRateLimitSeconds
	private migrateOpenAiHeaders
	private migrateConsecutiveMistakeLimit
	private migrateTodoListEnabled
	/**
	 * Apply model migrations for all providers
	 * Returns true if any migrations were applied
	 */
	private applyModelMigrations
	/**
	 * Clean model ID by removing prefix before "/"
	 */
	private cleanModelId
	/**
	 * List all available configs with metadata.
	 */
	listConfig(): Promise<ProviderSettingsEntry[]>
	/**
	 * Save a config with the given name.
	 * Preserves the ID from the input 'config' object if it exists,
	 * otherwise generates a new one (for creation scenarios).
	 */
	saveConfig(name: string, config: ProviderSettingsWithId): Promise<string>
	getProfile(
		params:
			| {
					name: string
			  }
			| {
					id: string
			  },
	): Promise<
		ProviderSettingsWithId & {
			name: string
		}
	>
	/**
	 * Activate a profile by name or ID.
	 */
	activateProfile(
		params:
			| {
					name: string
			  }
			| {
					id: string
			  },
	): Promise<
		ProviderSettingsWithId & {
			name: string
		}
	>
	/**
	 * Delete a config by name.
	 */
	deleteConfig(name: string): Promise<void>
	/**
	 * Check if a config exists by name.
	 */
	hasConfig(name: string): Promise<boolean>
	/**
	 * Set the API config for a specific mode.
	 */
	setModeConfig(mode: Mode, configId: string): Promise<void>
	/**
	 * Get the API config ID for a specific mode.
	 */
	getModeConfigId(mode: Mode): Promise<string | undefined>
	export(): Promise<{
		currentApiConfigName: string
		apiConfigs: Record<
			string,
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
		modeApiConfigs?: Record<string, string> | undefined
		migrations?:
			| {
					rateLimitSecondsMigrated?: boolean | undefined
					openAiHeadersMigrated?: boolean | undefined
					consecutiveMistakeLimitMigrated?: boolean | undefined
					todoListEnabledMigrated?: boolean | undefined
					claudeCodeLegacySettingsMigrated?: boolean | undefined
			  }
			| undefined
	}>
	import(providerProfiles: ProviderProfiles): Promise<void>
	/**
	 * Reset provider profiles by deleting them from secrets.
	 */
	resetAllConfigs(): Promise<void>
	private get secretsKey()
	private load
	/**
	 * Sanitizes a provider config by resetting unknown apiProvider values.
	 * Retired providers are preserved.
	 * This handles cases where a user had a provider selected that was later removed
	 * from the extension (e.g., "glama").
	 */
	private sanitizeProviderConfig
	private store
}
//# sourceMappingURL=ProviderSettingsManager.d.ts.map
