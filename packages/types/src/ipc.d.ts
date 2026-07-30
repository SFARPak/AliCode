import { z } from "zod"
import { type TaskEvent } from "./events.js"
/**
 * IpcMessageType
 */
export declare enum IpcMessageType {
	Connect = "Connect",
	Disconnect = "Disconnect",
	Ack = "Ack",
	TaskCommand = "TaskCommand",
	TaskEvent = "TaskEvent",
}
/**
 * IpcOrigin
 */
export declare enum IpcOrigin {
	Client = "client",
	Server = "server",
}
/**
 * Ack
 */
export declare const ackSchema: z.ZodObject<
	{
		clientId: z.ZodString
		pid: z.ZodNumber
		ppid: z.ZodNumber
	},
	"strip",
	z.ZodTypeAny,
	{
		clientId: string
		pid: number
		ppid: number
	},
	{
		clientId: string
		pid: number
		ppid: number
	}
>
export type Ack = z.infer<typeof ackSchema>
/**
 * TaskCommandName
 */
export declare enum TaskCommandName {
	StartNewTask = "StartNewTask",
	CancelTask = "CancelTask",
	CloseTask = "CloseTask",
	ResumeTask = "ResumeTask",
	SendMessage = "SendMessage",
	GetCommands = "GetCommands",
	GetModes = "GetModes",
	GetModels = "GetModels",
	DeleteQueuedMessage = "DeleteQueuedMessage",
}
/**
 * TaskCommand
 */
export declare const taskCommandSchema: z.ZodDiscriminatedUnion<
	"commandName",
	[
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.StartNewTask>
				data: z.ZodObject<
					{
						configuration: z.ZodObject<
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
									z.ZodEnum<
										["international_coding", "china_coding", "international_api", "china_api"]
									>
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
										[
											z.ZodLiteral<"https://api.minimax.io/v1">,
											z.ZodLiteral<"https://api.minimaxi.com/v1">,
										]
									>
								>
								minimaxApiKey: z.ZodOptional<z.ZodString>
								moonshotBaseUrl: z.ZodOptional<
									z.ZodUnion<
										[
											z.ZodLiteral<"https://api.moonshot.ai/v1">,
											z.ZodLiteral<"https://api.moonshot.cn/v1">,
										]
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
																	[
																		"disable",
																		"none",
																		"minimal",
																		"low",
																		"medium",
																		"high",
																		"xhigh",
																	]
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
														z.ZodEnum<
															[
																"max_tokens",
																"temperature",
																"reasoning",
																"include_reasoning",
															]
														>,
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
																z.ZodArray<
																	z.ZodEnum<["default", "flex", "priority"]>,
																	"many"
																>
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
															appliesToServiceTiers?:
																| ("default" | "flex" | "priority")[]
																| undefined
														},
														{
															thresholdTokens: number
															inputPriceMultiplier?: number | undefined
															outputPriceMultiplier?: number | undefined
															cacheWritesPriceMultiplier?: number | undefined
															cacheReadsPriceMultiplier?: number | undefined
															appliesToServiceTiers?:
																| ("default" | "flex" | "priority")[]
																| undefined
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
																name: z.ZodOptional<
																	z.ZodEnum<["default", "flex", "priority"]>
																>
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
													| (
															| "disable"
															| "none"
															| "minimal"
															| "low"
															| "medium"
															| "high"
															| "xhigh"
													  )[]
													| undefined
												requiredReasoningEffort?: boolean | undefined
												preserveReasoning?: boolean | undefined
												supportedParameters?:
													| (
															| "reasoning"
															| "max_tokens"
															| "temperature"
															| "include_reasoning"
													  )[]
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
															appliesToServiceTiers?:
																| ("default" | "flex" | "priority")[]
																| undefined
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
													| (
															| "disable"
															| "none"
															| "minimal"
															| "low"
															| "medium"
															| "high"
															| "xhigh"
													  )[]
													| undefined
												requiredReasoningEffort?: boolean | undefined
												preserveReasoning?: boolean | undefined
												supportedParameters?:
													| (
															| "reasoning"
															| "max_tokens"
															| "temperature"
															| "include_reasoning"
													  )[]
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
															appliesToServiceTiers?:
																| ("default" | "flex" | "priority")[]
																| undefined
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
								currentApiConfigName: z.ZodOptional<z.ZodString>
								listApiConfigMeta: z.ZodOptional<
									z.ZodArray<
										z.ZodObject<
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
										>,
										"many"
									>
								>
								pinnedApiConfigs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>
								lastShownAnnouncementId: z.ZodOptional<z.ZodString>
								customInstructions: z.ZodOptional<z.ZodString>
								taskHistory: z.ZodOptional<
									z.ZodArray<
										z.ZodObject<
											{
												id: z.ZodString
												rootTaskId: z.ZodOptional<z.ZodString>
												parentTaskId: z.ZodOptional<z.ZodString>
												number: z.ZodNumber
												ts: z.ZodNumber
												task: z.ZodString
												tokensIn: z.ZodNumber
												tokensOut: z.ZodNumber
												cacheWrites: z.ZodOptional<z.ZodNumber>
												cacheReads: z.ZodOptional<z.ZodNumber>
												totalCost: z.ZodNumber
												size: z.ZodOptional<z.ZodNumber>
												workspace: z.ZodOptional<z.ZodString>
												mode: z.ZodOptional<z.ZodString>
												apiConfigName: z.ZodOptional<z.ZodString>
												status: z.ZodOptional<z.ZodEnum<["active", "completed", "delegated"]>>
												delegatedToId: z.ZodOptional<z.ZodString>
												childIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
												awaitingChildId: z.ZodOptional<z.ZodString>
												completedByChildId: z.ZodOptional<z.ZodString>
												completionResultSummary: z.ZodOptional<z.ZodString>
											},
											"strip",
											z.ZodTypeAny,
											{
												number: number
												ts: number
												totalCost: number
												id: string
												task: string
												tokensIn: number
												tokensOut: number
												status?: "active" | "completed" | "delegated" | undefined
												rootTaskId?: string | undefined
												parentTaskId?: string | undefined
												cacheWrites?: number | undefined
												cacheReads?: number | undefined
												size?: number | undefined
												workspace?: string | undefined
												mode?: string | undefined
												apiConfigName?: string | undefined
												delegatedToId?: string | undefined
												childIds?: string[] | undefined
												awaitingChildId?: string | undefined
												completedByChildId?: string | undefined
												completionResultSummary?: string | undefined
											},
											{
												number: number
												ts: number
												totalCost: number
												id: string
												task: string
												tokensIn: number
												tokensOut: number
												status?: "active" | "completed" | "delegated" | undefined
												rootTaskId?: string | undefined
												parentTaskId?: string | undefined
												cacheWrites?: number | undefined
												cacheReads?: number | undefined
												size?: number | undefined
												workspace?: string | undefined
												mode?: string | undefined
												apiConfigName?: string | undefined
												delegatedToId?: string | undefined
												childIds?: string[] | undefined
												awaitingChildId?: string | undefined
												completedByChildId?: string | undefined
												completionResultSummary?: string | undefined
											}
										>,
										"many"
									>
								>
								dismissedUpsells: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
								imageGenerationProvider: z.ZodOptional<z.ZodEnum<["openrouter"]>>
								openRouterImageApiKey: z.ZodOptional<z.ZodString>
								openRouterImageGenerationSelectedModel: z.ZodOptional<z.ZodString>
								customCondensingPrompt: z.ZodOptional<z.ZodString>
								autoApprovalEnabled: z.ZodOptional<z.ZodBoolean>
								alwaysAllowReadOnly: z.ZodOptional<z.ZodBoolean>
								alwaysAllowReadOnlyOutsideWorkspace: z.ZodOptional<z.ZodBoolean>
								alwaysAllowWrite: z.ZodOptional<z.ZodBoolean>
								alwaysAllowWriteOutsideWorkspace: z.ZodOptional<z.ZodBoolean>
								alwaysAllowWriteProtected: z.ZodOptional<z.ZodBoolean>
								writeDelayMs: z.ZodOptional<z.ZodNumber>
								requestDelaySeconds: z.ZodOptional<z.ZodNumber>
								alwaysAllowMcp: z.ZodOptional<z.ZodBoolean>
								alwaysAllowModeSwitch: z.ZodOptional<z.ZodBoolean>
								alwaysAllowSubtasks: z.ZodOptional<z.ZodBoolean>
								alwaysAllowExecute: z.ZodOptional<z.ZodBoolean>
								alwaysAllowFollowupQuestions: z.ZodOptional<z.ZodBoolean>
								followupAutoApproveTimeoutMs: z.ZodOptional<z.ZodNumber>
								allowedCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
								deniedCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
								commandExecutionTimeout: z.ZodOptional<z.ZodNumber>
								commandTimeoutAllowlist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
								preventCompletionWithOpenTodos: z.ZodOptional<z.ZodBoolean>
								allowedMaxRequests: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
								allowedMaxCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
								autoCondenseContext: z.ZodOptional<z.ZodBoolean>
								autoCondenseContextPercent: z.ZodOptional<z.ZodNumber>
								includeCurrentTime: z.ZodOptional<z.ZodBoolean>
								includeCurrentCost: z.ZodOptional<z.ZodBoolean>
								maxGitStatusFiles: z.ZodOptional<z.ZodNumber>
								includeDiagnosticMessages: z.ZodOptional<z.ZodBoolean>
								maxDiagnosticMessages: z.ZodOptional<z.ZodNumber>
								enableCheckpoints: z.ZodOptional<z.ZodBoolean>
								checkpointTimeout: z.ZodOptional<z.ZodNumber>
								ttsEnabled: z.ZodOptional<z.ZodBoolean>
								ttsSpeed: z.ZodOptional<z.ZodNumber>
								soundEnabled: z.ZodOptional<z.ZodBoolean>
								soundVolume: z.ZodOptional<z.ZodNumber>
								maxOpenTabsContext: z.ZodOptional<z.ZodNumber>
								maxWorkspaceFiles: z.ZodOptional<z.ZodNumber>
								showAliIgnoredFiles: z.ZodOptional<z.ZodBoolean>
								enableSubfolderRules: z.ZodOptional<z.ZodBoolean>
								maxImageFileSize: z.ZodOptional<z.ZodNumber>
								maxTotalImageSize: z.ZodOptional<z.ZodNumber>
								terminalOutputPreviewSize: z.ZodOptional<z.ZodEnum<["small", "medium", "large"]>>
								terminalShellIntegrationTimeout: z.ZodOptional<z.ZodNumber>
								terminalShellIntegrationDisabled: z.ZodOptional<z.ZodBoolean>
								terminalCommandDelay: z.ZodOptional<z.ZodNumber>
								terminalPowershellCounter: z.ZodOptional<z.ZodBoolean>
								terminalZshClearEolMark: z.ZodOptional<z.ZodBoolean>
								terminalZshOhMy: z.ZodOptional<z.ZodBoolean>
								terminalZshP10k: z.ZodOptional<z.ZodBoolean>
								terminalZdotdir: z.ZodOptional<z.ZodBoolean>
								execaShellPath: z.ZodOptional<z.ZodString>
								diagnosticsEnabled: z.ZodOptional<z.ZodBoolean>
								rateLimitSeconds: z.ZodOptional<z.ZodNumber>
								experiments: z.ZodOptional<
									z.ZodObject<
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
								>
								codebaseIndexModels: z.ZodOptional<
									z.ZodObject<
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
								>
								codebaseIndexConfig: z.ZodOptional<
									z.ZodObject<
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
								>
								language: z.ZodOptional<
									z.ZodEnum<
										[
											"ca",
											"de",
											"en",
											"es",
											"fr",
											"hi",
											"id",
											"it",
											"ja",
											"ko",
											"nl",
											"pl",
											"pt-BR",
											"ru",
											"tr",
											"vi",
											"zh-CN",
											"zh-TW",
										]
									>
								>
								mcpEnabled: z.ZodOptional<z.ZodBoolean>
								mode: z.ZodOptional<z.ZodString>
								modeApiConfigs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
								customModes: z.ZodOptional<
									z.ZodArray<
										z.ZodObject<
											{
												slug: z.ZodString
												name: z.ZodString
												roleDefinition: z.ZodString
												whenToUse: z.ZodOptional<z.ZodString>
												description: z.ZodOptional<z.ZodString>
												customInstructions: z.ZodOptional<z.ZodString>
												groups: z.ZodType<
													(
														| "command"
														| "read"
														| "edit"
														| "mcp"
														| "modes"
														| [
																"command" | "read" | "edit" | "mcp" | "modes",
																{
																	description?: string | undefined
																	fileRegex?: string | undefined
																},
														  ]
													)[],
													z.ZodTypeDef,
													(
														| "command"
														| "read"
														| "edit"
														| "mcp"
														| "modes"
														| [
																"command" | "read" | "edit" | "mcp" | "modes",
																{
																	description?: string | undefined
																	fileRegex?: string | undefined
																},
														  ]
													)[]
												>
												source: z.ZodOptional<z.ZodEnum<["global", "project"]>>
											},
											"strip",
											z.ZodTypeAny,
											{
												name: string
												slug: string
												roleDefinition: string
												groups: (
													| "command"
													| "read"
													| "edit"
													| "mcp"
													| "modes"
													| [
															"command" | "read" | "edit" | "mcp" | "modes",
															{
																description?: string | undefined
																fileRegex?: string | undefined
															},
													  ]
												)[]
												description?: string | undefined
												source?: "global" | "project" | undefined
												whenToUse?: string | undefined
												customInstructions?: string | undefined
											},
											{
												name: string
												slug: string
												roleDefinition: string
												groups: (
													| "command"
													| "read"
													| "edit"
													| "mcp"
													| "modes"
													| [
															"command" | "read" | "edit" | "mcp" | "modes",
															{
																description?: string | undefined
																fileRegex?: string | undefined
															},
													  ]
												)[]
												description?: string | undefined
												source?: "global" | "project" | undefined
												whenToUse?: string | undefined
												customInstructions?: string | undefined
											}
										>,
										"many"
									>
								>
								customModePrompts: z.ZodOptional<
									z.ZodRecord<
										z.ZodString,
										z.ZodOptional<
											z.ZodObject<
												{
													roleDefinition: z.ZodOptional<z.ZodString>
													whenToUse: z.ZodOptional<z.ZodString>
													description: z.ZodOptional<z.ZodString>
													customInstructions: z.ZodOptional<z.ZodString>
												},
												"strip",
												z.ZodTypeAny,
												{
													description?: string | undefined
													roleDefinition?: string | undefined
													whenToUse?: string | undefined
													customInstructions?: string | undefined
												},
												{
													description?: string | undefined
													roleDefinition?: string | undefined
													whenToUse?: string | undefined
													customInstructions?: string | undefined
												}
											>
										>
									>
								>
								customSupportPrompts: z.ZodOptional<
									z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>
								>
								enhancementApiConfigId: z.ZodOptional<z.ZodString>
								includeTaskHistoryInEnhance: z.ZodOptional<z.ZodBoolean>
								historyPreviewCollapsed: z.ZodOptional<z.ZodBoolean>
								reasoningBlockCollapsed: z.ZodOptional<z.ZodBoolean>
								enterBehavior: z.ZodOptional<z.ZodEnum<["send", "newline"]>>
								profileThresholds: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>
								hasOpenedModeSelector: z.ZodOptional<z.ZodBoolean>
								lastModeExportPath: z.ZodOptional<z.ZodString>
								lastModeImportPath: z.ZodOptional<z.ZodString>
								lastSettingsExportPath: z.ZodOptional<z.ZodString>
								lastTaskExportPath: z.ZodOptional<z.ZodString>
								lastImageSavePath: z.ZodOptional<z.ZodString>
								worktreeAutoOpenPath: z.ZodOptional<z.ZodString>
								showWorktreesInHomeScreen: z.ZodOptional<z.ZodBoolean>
								disabledTools: z.ZodOptional<
									z.ZodArray<
										z.ZodEnum<
											[
												"execute_command",
												"read_file",
												"read_command_output",
												"write_to_file",
												"apply_diff",
												"edit",
												"search_and_replace",
												"search_replace",
												"edit_file",
												"apply_patch",
												"search_files",
												"list_files",
												"use_mcp_tool",
												"access_mcp_resource",
												"ask_followup_question",
												"attempt_completion",
												"switch_mode",
												"new_task",
												"codebase_search",
												"update_todo_list",
												"run_slash_command",
												"skill",
												"generate_image",
												"custom_tool",
											]
										>,
										"many"
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
								reasoningEffort?:
									| "disable"
									| "none"
									| "minimal"
									| "low"
									| "medium"
									| "high"
									| "xhigh"
									| undefined
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
												| (
														| "disable"
														| "none"
														| "minimal"
														| "low"
														| "medium"
														| "high"
														| "xhigh"
												  )[]
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
														appliesToServiceTiers?:
															| ("default" | "flex" | "priority")[]
															| undefined
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
								moonshotBaseUrl?:
									| "https://api.moonshot.ai/v1"
									| "https://api.moonshot.cn/v1"
									| undefined
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
								zaiApiLine?:
									| "international_coding"
									| "china_coding"
									| "international_api"
									| "china_api"
									| undefined
								fireworksApiKey?: string | undefined
								qwenCodeOauthPath?: string | undefined
								vercelAiGatewayApiKey?: string | undefined
								vercelAiGatewayModelId?: string | undefined
								basetenApiKey?: string | undefined
								nvidiaNimApiKey?: string | undefined
								nvidiaNimBaseUrl?: string | undefined
								mode?: string | undefined
								customInstructions?: string | undefined
								customModes?:
									| {
											name: string
											slug: string
											roleDefinition: string
											groups: (
												| "command"
												| "read"
												| "edit"
												| "mcp"
												| "modes"
												| [
														"command" | "read" | "edit" | "mcp" | "modes",
														{
															description?: string | undefined
															fileRegex?: string | undefined
														},
												  ]
											)[]
											description?: string | undefined
											source?: "global" | "project" | undefined
											whenToUse?: string | undefined
											customInstructions?: string | undefined
									  }[]
									| undefined
								currentApiConfigName?: string | undefined
								listApiConfigMeta?:
									| {
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
									  }[]
									| undefined
								pinnedApiConfigs?: Record<string, boolean> | undefined
								lastShownAnnouncementId?: string | undefined
								taskHistory?:
									| {
											number: number
											ts: number
											totalCost: number
											id: string
											task: string
											tokensIn: number
											tokensOut: number
											status?: "active" | "completed" | "delegated" | undefined
											rootTaskId?: string | undefined
											parentTaskId?: string | undefined
											cacheWrites?: number | undefined
											cacheReads?: number | undefined
											size?: number | undefined
											workspace?: string | undefined
											mode?: string | undefined
											apiConfigName?: string | undefined
											delegatedToId?: string | undefined
											childIds?: string[] | undefined
											awaitingChildId?: string | undefined
											completedByChildId?: string | undefined
											completionResultSummary?: string | undefined
									  }[]
									| undefined
								dismissedUpsells?: string[] | undefined
								imageGenerationProvider?: "openrouter" | undefined
								openRouterImageApiKey?: string | undefined
								openRouterImageGenerationSelectedModel?: string | undefined
								customCondensingPrompt?: string | undefined
								autoApprovalEnabled?: boolean | undefined
								alwaysAllowReadOnly?: boolean | undefined
								alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
								alwaysAllowWrite?: boolean | undefined
								alwaysAllowWriteOutsideWorkspace?: boolean | undefined
								alwaysAllowWriteProtected?: boolean | undefined
								writeDelayMs?: number | undefined
								requestDelaySeconds?: number | undefined
								alwaysAllowMcp?: boolean | undefined
								alwaysAllowModeSwitch?: boolean | undefined
								alwaysAllowSubtasks?: boolean | undefined
								alwaysAllowExecute?: boolean | undefined
								alwaysAllowFollowupQuestions?: boolean | undefined
								followupAutoApproveTimeoutMs?: number | undefined
								allowedCommands?: string[] | undefined
								deniedCommands?: string[] | undefined
								commandExecutionTimeout?: number | undefined
								commandTimeoutAllowlist?: string[] | undefined
								preventCompletionWithOpenTodos?: boolean | undefined
								allowedMaxRequests?: number | null | undefined
								allowedMaxCost?: number | null | undefined
								autoCondenseContext?: boolean | undefined
								autoCondenseContextPercent?: number | undefined
								includeCurrentTime?: boolean | undefined
								includeCurrentCost?: boolean | undefined
								maxGitStatusFiles?: number | undefined
								includeDiagnosticMessages?: boolean | undefined
								maxDiagnosticMessages?: number | undefined
								enableCheckpoints?: boolean | undefined
								checkpointTimeout?: number | undefined
								ttsEnabled?: boolean | undefined
								ttsSpeed?: number | undefined
								soundEnabled?: boolean | undefined
								soundVolume?: number | undefined
								maxOpenTabsContext?: number | undefined
								maxWorkspaceFiles?: number | undefined
								showAliIgnoredFiles?: boolean | undefined
								enableSubfolderRules?: boolean | undefined
								maxImageFileSize?: number | undefined
								maxTotalImageSize?: number | undefined
								terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
								terminalShellIntegrationTimeout?: number | undefined
								terminalShellIntegrationDisabled?: boolean | undefined
								terminalCommandDelay?: number | undefined
								terminalPowershellCounter?: boolean | undefined
								terminalZshClearEolMark?: boolean | undefined
								terminalZshOhMy?: boolean | undefined
								terminalZshP10k?: boolean | undefined
								terminalZdotdir?: boolean | undefined
								execaShellPath?: string | undefined
								diagnosticsEnabled?: boolean | undefined
								experiments?:
									| {
											preventFocusDisruption?: boolean | undefined
											imageGeneration?: boolean | undefined
											runSlashCommand?: boolean | undefined
											customTools?: boolean | undefined
									  }
									| undefined
								codebaseIndexModels?:
									| {
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
									| undefined
								codebaseIndexConfig?:
									| {
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
									| undefined
								language?:
									| "id"
									| "ca"
									| "de"
									| "en"
									| "es"
									| "fr"
									| "hi"
									| "it"
									| "ja"
									| "ko"
									| "nl"
									| "pl"
									| "pt-BR"
									| "ru"
									| "tr"
									| "vi"
									| "zh-CN"
									| "zh-TW"
									| undefined
								mcpEnabled?: boolean | undefined
								modeApiConfigs?: Record<string, string> | undefined
								customModePrompts?:
									| Record<
											string,
											| {
													description?: string | undefined
													roleDefinition?: string | undefined
													whenToUse?: string | undefined
													customInstructions?: string | undefined
											  }
											| undefined
									  >
									| undefined
								customSupportPrompts?: Record<string, string | undefined> | undefined
								enhancementApiConfigId?: string | undefined
								includeTaskHistoryInEnhance?: boolean | undefined
								historyPreviewCollapsed?: boolean | undefined
								reasoningBlockCollapsed?: boolean | undefined
								enterBehavior?: "send" | "newline" | undefined
								profileThresholds?: Record<string, number> | undefined
								hasOpenedModeSelector?: boolean | undefined
								lastModeExportPath?: string | undefined
								lastModeImportPath?: string | undefined
								lastSettingsExportPath?: string | undefined
								lastTaskExportPath?: string | undefined
								lastImageSavePath?: string | undefined
								worktreeAutoOpenPath?: string | undefined
								showWorktreesInHomeScreen?: boolean | undefined
								disabledTools?:
									| (
											| "apply_patch"
											| "apply_diff"
											| "write_to_file"
											| "search_replace"
											| "search_and_replace"
											| "edit"
											| "execute_command"
											| "read_file"
											| "read_command_output"
											| "edit_file"
											| "search_files"
											| "list_files"
											| "use_mcp_tool"
											| "access_mcp_resource"
											| "ask_followup_question"
											| "attempt_completion"
											| "switch_mode"
											| "new_task"
											| "codebase_search"
											| "update_todo_list"
											| "run_slash_command"
											| "skill"
											| "generate_image"
											| "custom_tool"
									  )[]
									| undefined
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
								reasoningEffort?:
									| "disable"
									| "none"
									| "minimal"
									| "low"
									| "medium"
									| "high"
									| "xhigh"
									| undefined
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
												| (
														| "disable"
														| "none"
														| "minimal"
														| "low"
														| "medium"
														| "high"
														| "xhigh"
												  )[]
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
														appliesToServiceTiers?:
															| ("default" | "flex" | "priority")[]
															| undefined
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
								moonshotBaseUrl?:
									| "https://api.moonshot.ai/v1"
									| "https://api.moonshot.cn/v1"
									| undefined
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
								zaiApiLine?:
									| "international_coding"
									| "china_coding"
									| "international_api"
									| "china_api"
									| undefined
								fireworksApiKey?: string | undefined
								qwenCodeOauthPath?: string | undefined
								vercelAiGatewayApiKey?: string | undefined
								vercelAiGatewayModelId?: string | undefined
								basetenApiKey?: string | undefined
								nvidiaNimApiKey?: string | undefined
								nvidiaNimBaseUrl?: string | undefined
								mode?: string | undefined
								customInstructions?: string | undefined
								customModes?:
									| {
											name: string
											slug: string
											roleDefinition: string
											groups: (
												| "command"
												| "read"
												| "edit"
												| "mcp"
												| "modes"
												| [
														"command" | "read" | "edit" | "mcp" | "modes",
														{
															description?: string | undefined
															fileRegex?: string | undefined
														},
												  ]
											)[]
											description?: string | undefined
											source?: "global" | "project" | undefined
											whenToUse?: string | undefined
											customInstructions?: string | undefined
									  }[]
									| undefined
								currentApiConfigName?: string | undefined
								listApiConfigMeta?:
									| {
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
									  }[]
									| undefined
								pinnedApiConfigs?: Record<string, boolean> | undefined
								lastShownAnnouncementId?: string | undefined
								taskHistory?:
									| {
											number: number
											ts: number
											totalCost: number
											id: string
											task: string
											tokensIn: number
											tokensOut: number
											status?: "active" | "completed" | "delegated" | undefined
											rootTaskId?: string | undefined
											parentTaskId?: string | undefined
											cacheWrites?: number | undefined
											cacheReads?: number | undefined
											size?: number | undefined
											workspace?: string | undefined
											mode?: string | undefined
											apiConfigName?: string | undefined
											delegatedToId?: string | undefined
											childIds?: string[] | undefined
											awaitingChildId?: string | undefined
											completedByChildId?: string | undefined
											completionResultSummary?: string | undefined
									  }[]
									| undefined
								dismissedUpsells?: string[] | undefined
								imageGenerationProvider?: "openrouter" | undefined
								openRouterImageApiKey?: string | undefined
								openRouterImageGenerationSelectedModel?: string | undefined
								customCondensingPrompt?: string | undefined
								autoApprovalEnabled?: boolean | undefined
								alwaysAllowReadOnly?: boolean | undefined
								alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
								alwaysAllowWrite?: boolean | undefined
								alwaysAllowWriteOutsideWorkspace?: boolean | undefined
								alwaysAllowWriteProtected?: boolean | undefined
								writeDelayMs?: number | undefined
								requestDelaySeconds?: number | undefined
								alwaysAllowMcp?: boolean | undefined
								alwaysAllowModeSwitch?: boolean | undefined
								alwaysAllowSubtasks?: boolean | undefined
								alwaysAllowExecute?: boolean | undefined
								alwaysAllowFollowupQuestions?: boolean | undefined
								followupAutoApproveTimeoutMs?: number | undefined
								allowedCommands?: string[] | undefined
								deniedCommands?: string[] | undefined
								commandExecutionTimeout?: number | undefined
								commandTimeoutAllowlist?: string[] | undefined
								preventCompletionWithOpenTodos?: boolean | undefined
								allowedMaxRequests?: number | null | undefined
								allowedMaxCost?: number | null | undefined
								autoCondenseContext?: boolean | undefined
								autoCondenseContextPercent?: number | undefined
								includeCurrentTime?: boolean | undefined
								includeCurrentCost?: boolean | undefined
								maxGitStatusFiles?: number | undefined
								includeDiagnosticMessages?: boolean | undefined
								maxDiagnosticMessages?: number | undefined
								enableCheckpoints?: boolean | undefined
								checkpointTimeout?: number | undefined
								ttsEnabled?: boolean | undefined
								ttsSpeed?: number | undefined
								soundEnabled?: boolean | undefined
								soundVolume?: number | undefined
								maxOpenTabsContext?: number | undefined
								maxWorkspaceFiles?: number | undefined
								showAliIgnoredFiles?: boolean | undefined
								enableSubfolderRules?: boolean | undefined
								maxImageFileSize?: number | undefined
								maxTotalImageSize?: number | undefined
								terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
								terminalShellIntegrationTimeout?: number | undefined
								terminalShellIntegrationDisabled?: boolean | undefined
								terminalCommandDelay?: number | undefined
								terminalPowershellCounter?: boolean | undefined
								terminalZshClearEolMark?: boolean | undefined
								terminalZshOhMy?: boolean | undefined
								terminalZshP10k?: boolean | undefined
								terminalZdotdir?: boolean | undefined
								execaShellPath?: string | undefined
								diagnosticsEnabled?: boolean | undefined
								experiments?:
									| {
											preventFocusDisruption?: boolean | undefined
											imageGeneration?: boolean | undefined
											runSlashCommand?: boolean | undefined
											customTools?: boolean | undefined
									  }
									| undefined
								codebaseIndexModels?:
									| {
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
									| undefined
								codebaseIndexConfig?:
									| {
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
									| undefined
								language?:
									| "id"
									| "ca"
									| "de"
									| "en"
									| "es"
									| "fr"
									| "hi"
									| "it"
									| "ja"
									| "ko"
									| "nl"
									| "pl"
									| "pt-BR"
									| "ru"
									| "tr"
									| "vi"
									| "zh-CN"
									| "zh-TW"
									| undefined
								mcpEnabled?: boolean | undefined
								modeApiConfigs?: Record<string, string> | undefined
								customModePrompts?:
									| Record<
											string,
											| {
													description?: string | undefined
													roleDefinition?: string | undefined
													whenToUse?: string | undefined
													customInstructions?: string | undefined
											  }
											| undefined
									  >
									| undefined
								customSupportPrompts?: Record<string, string | undefined> | undefined
								enhancementApiConfigId?: string | undefined
								includeTaskHistoryInEnhance?: boolean | undefined
								historyPreviewCollapsed?: boolean | undefined
								reasoningBlockCollapsed?: boolean | undefined
								enterBehavior?: "send" | "newline" | undefined
								profileThresholds?: Record<string, number> | undefined
								hasOpenedModeSelector?: boolean | undefined
								lastModeExportPath?: string | undefined
								lastModeImportPath?: string | undefined
								lastSettingsExportPath?: string | undefined
								lastTaskExportPath?: string | undefined
								lastImageSavePath?: string | undefined
								worktreeAutoOpenPath?: string | undefined
								showWorktreesInHomeScreen?: boolean | undefined
								disabledTools?:
									| (
											| "apply_patch"
											| "apply_diff"
											| "write_to_file"
											| "search_replace"
											| "search_and_replace"
											| "edit"
											| "execute_command"
											| "read_file"
											| "read_command_output"
											| "edit_file"
											| "search_files"
											| "list_files"
											| "use_mcp_tool"
											| "access_mcp_resource"
											| "ask_followup_question"
											| "attempt_completion"
											| "switch_mode"
											| "new_task"
											| "codebase_search"
											| "update_todo_list"
											| "run_slash_command"
											| "skill"
											| "generate_image"
											| "custom_tool"
									  )[]
									| undefined
							}
						>
						text: z.ZodString
						images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
						newTab: z.ZodOptional<z.ZodBoolean>
					},
					"strip",
					z.ZodTypeAny,
					{
						text: string
						configuration: {
							codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
							codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
							codeIndexOpenAiKey?: string | undefined
							codeIndexQdrantApiKey?: string | undefined
							codebaseIndexOpenAiCompatibleApiKey?: string | undefined
							codebaseIndexGeminiApiKey?: string | undefined
							codebaseIndexMistralApiKey?: string | undefined
							codebaseIndexVercelAiGatewayApiKey?: string | undefined
							codebaseIndexOpenRouterApiKey?: string | undefined
							reasoningEffort?:
								| "disable"
								| "none"
								| "minimal"
								| "low"
								| "medium"
								| "high"
								| "xhigh"
								| undefined
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
													appliesToServiceTiers?:
														| ("default" | "flex" | "priority")[]
														| undefined
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
							zaiApiLine?:
								| "international_coding"
								| "china_coding"
								| "international_api"
								| "china_api"
								| undefined
							fireworksApiKey?: string | undefined
							qwenCodeOauthPath?: string | undefined
							vercelAiGatewayApiKey?: string | undefined
							vercelAiGatewayModelId?: string | undefined
							basetenApiKey?: string | undefined
							nvidiaNimApiKey?: string | undefined
							nvidiaNimBaseUrl?: string | undefined
							mode?: string | undefined
							customInstructions?: string | undefined
							customModes?:
								| {
										name: string
										slug: string
										roleDefinition: string
										groups: (
											| "command"
											| "read"
											| "edit"
											| "mcp"
											| "modes"
											| [
													"command" | "read" | "edit" | "mcp" | "modes",
													{
														description?: string | undefined
														fileRegex?: string | undefined
													},
											  ]
										)[]
										description?: string | undefined
										source?: "global" | "project" | undefined
										whenToUse?: string | undefined
										customInstructions?: string | undefined
								  }[]
								| undefined
							currentApiConfigName?: string | undefined
							listApiConfigMeta?:
								| {
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
								  }[]
								| undefined
							pinnedApiConfigs?: Record<string, boolean> | undefined
							lastShownAnnouncementId?: string | undefined
							taskHistory?:
								| {
										number: number
										ts: number
										totalCost: number
										id: string
										task: string
										tokensIn: number
										tokensOut: number
										status?: "active" | "completed" | "delegated" | undefined
										rootTaskId?: string | undefined
										parentTaskId?: string | undefined
										cacheWrites?: number | undefined
										cacheReads?: number | undefined
										size?: number | undefined
										workspace?: string | undefined
										mode?: string | undefined
										apiConfigName?: string | undefined
										delegatedToId?: string | undefined
										childIds?: string[] | undefined
										awaitingChildId?: string | undefined
										completedByChildId?: string | undefined
										completionResultSummary?: string | undefined
								  }[]
								| undefined
							dismissedUpsells?: string[] | undefined
							imageGenerationProvider?: "openrouter" | undefined
							openRouterImageApiKey?: string | undefined
							openRouterImageGenerationSelectedModel?: string | undefined
							customCondensingPrompt?: string | undefined
							autoApprovalEnabled?: boolean | undefined
							alwaysAllowReadOnly?: boolean | undefined
							alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
							alwaysAllowWrite?: boolean | undefined
							alwaysAllowWriteOutsideWorkspace?: boolean | undefined
							alwaysAllowWriteProtected?: boolean | undefined
							writeDelayMs?: number | undefined
							requestDelaySeconds?: number | undefined
							alwaysAllowMcp?: boolean | undefined
							alwaysAllowModeSwitch?: boolean | undefined
							alwaysAllowSubtasks?: boolean | undefined
							alwaysAllowExecute?: boolean | undefined
							alwaysAllowFollowupQuestions?: boolean | undefined
							followupAutoApproveTimeoutMs?: number | undefined
							allowedCommands?: string[] | undefined
							deniedCommands?: string[] | undefined
							commandExecutionTimeout?: number | undefined
							commandTimeoutAllowlist?: string[] | undefined
							preventCompletionWithOpenTodos?: boolean | undefined
							allowedMaxRequests?: number | null | undefined
							allowedMaxCost?: number | null | undefined
							autoCondenseContext?: boolean | undefined
							autoCondenseContextPercent?: number | undefined
							includeCurrentTime?: boolean | undefined
							includeCurrentCost?: boolean | undefined
							maxGitStatusFiles?: number | undefined
							includeDiagnosticMessages?: boolean | undefined
							maxDiagnosticMessages?: number | undefined
							enableCheckpoints?: boolean | undefined
							checkpointTimeout?: number | undefined
							ttsEnabled?: boolean | undefined
							ttsSpeed?: number | undefined
							soundEnabled?: boolean | undefined
							soundVolume?: number | undefined
							maxOpenTabsContext?: number | undefined
							maxWorkspaceFiles?: number | undefined
							showAliIgnoredFiles?: boolean | undefined
							enableSubfolderRules?: boolean | undefined
							maxImageFileSize?: number | undefined
							maxTotalImageSize?: number | undefined
							terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
							terminalShellIntegrationTimeout?: number | undefined
							terminalShellIntegrationDisabled?: boolean | undefined
							terminalCommandDelay?: number | undefined
							terminalPowershellCounter?: boolean | undefined
							terminalZshClearEolMark?: boolean | undefined
							terminalZshOhMy?: boolean | undefined
							terminalZshP10k?: boolean | undefined
							terminalZdotdir?: boolean | undefined
							execaShellPath?: string | undefined
							diagnosticsEnabled?: boolean | undefined
							experiments?:
								| {
										preventFocusDisruption?: boolean | undefined
										imageGeneration?: boolean | undefined
										runSlashCommand?: boolean | undefined
										customTools?: boolean | undefined
								  }
								| undefined
							codebaseIndexModels?:
								| {
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
								| undefined
							codebaseIndexConfig?:
								| {
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
								| undefined
							language?:
								| "id"
								| "ca"
								| "de"
								| "en"
								| "es"
								| "fr"
								| "hi"
								| "it"
								| "ja"
								| "ko"
								| "nl"
								| "pl"
								| "pt-BR"
								| "ru"
								| "tr"
								| "vi"
								| "zh-CN"
								| "zh-TW"
								| undefined
							mcpEnabled?: boolean | undefined
							modeApiConfigs?: Record<string, string> | undefined
							customModePrompts?:
								| Record<
										string,
										| {
												description?: string | undefined
												roleDefinition?: string | undefined
												whenToUse?: string | undefined
												customInstructions?: string | undefined
										  }
										| undefined
								  >
								| undefined
							customSupportPrompts?: Record<string, string | undefined> | undefined
							enhancementApiConfigId?: string | undefined
							includeTaskHistoryInEnhance?: boolean | undefined
							historyPreviewCollapsed?: boolean | undefined
							reasoningBlockCollapsed?: boolean | undefined
							enterBehavior?: "send" | "newline" | undefined
							profileThresholds?: Record<string, number> | undefined
							hasOpenedModeSelector?: boolean | undefined
							lastModeExportPath?: string | undefined
							lastModeImportPath?: string | undefined
							lastSettingsExportPath?: string | undefined
							lastTaskExportPath?: string | undefined
							lastImageSavePath?: string | undefined
							worktreeAutoOpenPath?: string | undefined
							showWorktreesInHomeScreen?: boolean | undefined
							disabledTools?:
								| (
										| "apply_patch"
										| "apply_diff"
										| "write_to_file"
										| "search_replace"
										| "search_and_replace"
										| "edit"
										| "execute_command"
										| "read_file"
										| "read_command_output"
										| "edit_file"
										| "search_files"
										| "list_files"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "new_task"
										| "codebase_search"
										| "update_todo_list"
										| "run_slash_command"
										| "skill"
										| "generate_image"
										| "custom_tool"
								  )[]
								| undefined
						}
						images?: string[] | undefined
						newTab?: boolean | undefined
					},
					{
						text: string
						configuration: {
							codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
							codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
							codeIndexOpenAiKey?: string | undefined
							codeIndexQdrantApiKey?: string | undefined
							codebaseIndexOpenAiCompatibleApiKey?: string | undefined
							codebaseIndexGeminiApiKey?: string | undefined
							codebaseIndexMistralApiKey?: string | undefined
							codebaseIndexVercelAiGatewayApiKey?: string | undefined
							codebaseIndexOpenRouterApiKey?: string | undefined
							reasoningEffort?:
								| "disable"
								| "none"
								| "minimal"
								| "low"
								| "medium"
								| "high"
								| "xhigh"
								| undefined
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
													appliesToServiceTiers?:
														| ("default" | "flex" | "priority")[]
														| undefined
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
							zaiApiLine?:
								| "international_coding"
								| "china_coding"
								| "international_api"
								| "china_api"
								| undefined
							fireworksApiKey?: string | undefined
							qwenCodeOauthPath?: string | undefined
							vercelAiGatewayApiKey?: string | undefined
							vercelAiGatewayModelId?: string | undefined
							basetenApiKey?: string | undefined
							nvidiaNimApiKey?: string | undefined
							nvidiaNimBaseUrl?: string | undefined
							mode?: string | undefined
							customInstructions?: string | undefined
							customModes?:
								| {
										name: string
										slug: string
										roleDefinition: string
										groups: (
											| "command"
											| "read"
											| "edit"
											| "mcp"
											| "modes"
											| [
													"command" | "read" | "edit" | "mcp" | "modes",
													{
														description?: string | undefined
														fileRegex?: string | undefined
													},
											  ]
										)[]
										description?: string | undefined
										source?: "global" | "project" | undefined
										whenToUse?: string | undefined
										customInstructions?: string | undefined
								  }[]
								| undefined
							currentApiConfigName?: string | undefined
							listApiConfigMeta?:
								| {
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
								  }[]
								| undefined
							pinnedApiConfigs?: Record<string, boolean> | undefined
							lastShownAnnouncementId?: string | undefined
							taskHistory?:
								| {
										number: number
										ts: number
										totalCost: number
										id: string
										task: string
										tokensIn: number
										tokensOut: number
										status?: "active" | "completed" | "delegated" | undefined
										rootTaskId?: string | undefined
										parentTaskId?: string | undefined
										cacheWrites?: number | undefined
										cacheReads?: number | undefined
										size?: number | undefined
										workspace?: string | undefined
										mode?: string | undefined
										apiConfigName?: string | undefined
										delegatedToId?: string | undefined
										childIds?: string[] | undefined
										awaitingChildId?: string | undefined
										completedByChildId?: string | undefined
										completionResultSummary?: string | undefined
								  }[]
								| undefined
							dismissedUpsells?: string[] | undefined
							imageGenerationProvider?: "openrouter" | undefined
							openRouterImageApiKey?: string | undefined
							openRouterImageGenerationSelectedModel?: string | undefined
							customCondensingPrompt?: string | undefined
							autoApprovalEnabled?: boolean | undefined
							alwaysAllowReadOnly?: boolean | undefined
							alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
							alwaysAllowWrite?: boolean | undefined
							alwaysAllowWriteOutsideWorkspace?: boolean | undefined
							alwaysAllowWriteProtected?: boolean | undefined
							writeDelayMs?: number | undefined
							requestDelaySeconds?: number | undefined
							alwaysAllowMcp?: boolean | undefined
							alwaysAllowModeSwitch?: boolean | undefined
							alwaysAllowSubtasks?: boolean | undefined
							alwaysAllowExecute?: boolean | undefined
							alwaysAllowFollowupQuestions?: boolean | undefined
							followupAutoApproveTimeoutMs?: number | undefined
							allowedCommands?: string[] | undefined
							deniedCommands?: string[] | undefined
							commandExecutionTimeout?: number | undefined
							commandTimeoutAllowlist?: string[] | undefined
							preventCompletionWithOpenTodos?: boolean | undefined
							allowedMaxRequests?: number | null | undefined
							allowedMaxCost?: number | null | undefined
							autoCondenseContext?: boolean | undefined
							autoCondenseContextPercent?: number | undefined
							includeCurrentTime?: boolean | undefined
							includeCurrentCost?: boolean | undefined
							maxGitStatusFiles?: number | undefined
							includeDiagnosticMessages?: boolean | undefined
							maxDiagnosticMessages?: number | undefined
							enableCheckpoints?: boolean | undefined
							checkpointTimeout?: number | undefined
							ttsEnabled?: boolean | undefined
							ttsSpeed?: number | undefined
							soundEnabled?: boolean | undefined
							soundVolume?: number | undefined
							maxOpenTabsContext?: number | undefined
							maxWorkspaceFiles?: number | undefined
							showAliIgnoredFiles?: boolean | undefined
							enableSubfolderRules?: boolean | undefined
							maxImageFileSize?: number | undefined
							maxTotalImageSize?: number | undefined
							terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
							terminalShellIntegrationTimeout?: number | undefined
							terminalShellIntegrationDisabled?: boolean | undefined
							terminalCommandDelay?: number | undefined
							terminalPowershellCounter?: boolean | undefined
							terminalZshClearEolMark?: boolean | undefined
							terminalZshOhMy?: boolean | undefined
							terminalZshP10k?: boolean | undefined
							terminalZdotdir?: boolean | undefined
							execaShellPath?: string | undefined
							diagnosticsEnabled?: boolean | undefined
							experiments?:
								| {
										preventFocusDisruption?: boolean | undefined
										imageGeneration?: boolean | undefined
										runSlashCommand?: boolean | undefined
										customTools?: boolean | undefined
								  }
								| undefined
							codebaseIndexModels?:
								| {
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
								| undefined
							codebaseIndexConfig?:
								| {
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
								| undefined
							language?:
								| "id"
								| "ca"
								| "de"
								| "en"
								| "es"
								| "fr"
								| "hi"
								| "it"
								| "ja"
								| "ko"
								| "nl"
								| "pl"
								| "pt-BR"
								| "ru"
								| "tr"
								| "vi"
								| "zh-CN"
								| "zh-TW"
								| undefined
							mcpEnabled?: boolean | undefined
							modeApiConfigs?: Record<string, string> | undefined
							customModePrompts?:
								| Record<
										string,
										| {
												description?: string | undefined
												roleDefinition?: string | undefined
												whenToUse?: string | undefined
												customInstructions?: string | undefined
										  }
										| undefined
								  >
								| undefined
							customSupportPrompts?: Record<string, string | undefined> | undefined
							enhancementApiConfigId?: string | undefined
							includeTaskHistoryInEnhance?: boolean | undefined
							historyPreviewCollapsed?: boolean | undefined
							reasoningBlockCollapsed?: boolean | undefined
							enterBehavior?: "send" | "newline" | undefined
							profileThresholds?: Record<string, number> | undefined
							hasOpenedModeSelector?: boolean | undefined
							lastModeExportPath?: string | undefined
							lastModeImportPath?: string | undefined
							lastSettingsExportPath?: string | undefined
							lastTaskExportPath?: string | undefined
							lastImageSavePath?: string | undefined
							worktreeAutoOpenPath?: string | undefined
							showWorktreesInHomeScreen?: boolean | undefined
							disabledTools?:
								| (
										| "apply_patch"
										| "apply_diff"
										| "write_to_file"
										| "search_replace"
										| "search_and_replace"
										| "edit"
										| "execute_command"
										| "read_file"
										| "read_command_output"
										| "edit_file"
										| "search_files"
										| "list_files"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "new_task"
										| "codebase_search"
										| "update_todo_list"
										| "run_slash_command"
										| "skill"
										| "generate_image"
										| "custom_tool"
								  )[]
								| undefined
						}
						images?: string[] | undefined
						newTab?: boolean | undefined
					}
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.StartNewTask
				data: {
					text: string
					configuration: {
						codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
						codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
						codeIndexOpenAiKey?: string | undefined
						codeIndexQdrantApiKey?: string | undefined
						codebaseIndexOpenAiCompatibleApiKey?: string | undefined
						codebaseIndexGeminiApiKey?: string | undefined
						codebaseIndexMistralApiKey?: string | undefined
						codebaseIndexVercelAiGatewayApiKey?: string | undefined
						codebaseIndexOpenRouterApiKey?: string | undefined
						reasoningEffort?:
							| "disable"
							| "none"
							| "minimal"
							| "low"
							| "medium"
							| "high"
							| "xhigh"
							| undefined
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
						zaiApiLine?:
							| "international_coding"
							| "china_coding"
							| "international_api"
							| "china_api"
							| undefined
						fireworksApiKey?: string | undefined
						qwenCodeOauthPath?: string | undefined
						vercelAiGatewayApiKey?: string | undefined
						vercelAiGatewayModelId?: string | undefined
						basetenApiKey?: string | undefined
						nvidiaNimApiKey?: string | undefined
						nvidiaNimBaseUrl?: string | undefined
						mode?: string | undefined
						customInstructions?: string | undefined
						customModes?:
							| {
									name: string
									slug: string
									roleDefinition: string
									groups: (
										| "command"
										| "read"
										| "edit"
										| "mcp"
										| "modes"
										| [
												"command" | "read" | "edit" | "mcp" | "modes",
												{
													description?: string | undefined
													fileRegex?: string | undefined
												},
										  ]
									)[]
									description?: string | undefined
									source?: "global" | "project" | undefined
									whenToUse?: string | undefined
									customInstructions?: string | undefined
							  }[]
							| undefined
						currentApiConfigName?: string | undefined
						listApiConfigMeta?:
							| {
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
							  }[]
							| undefined
						pinnedApiConfigs?: Record<string, boolean> | undefined
						lastShownAnnouncementId?: string | undefined
						taskHistory?:
							| {
									number: number
									ts: number
									totalCost: number
									id: string
									task: string
									tokensIn: number
									tokensOut: number
									status?: "active" | "completed" | "delegated" | undefined
									rootTaskId?: string | undefined
									parentTaskId?: string | undefined
									cacheWrites?: number | undefined
									cacheReads?: number | undefined
									size?: number | undefined
									workspace?: string | undefined
									mode?: string | undefined
									apiConfigName?: string | undefined
									delegatedToId?: string | undefined
									childIds?: string[] | undefined
									awaitingChildId?: string | undefined
									completedByChildId?: string | undefined
									completionResultSummary?: string | undefined
							  }[]
							| undefined
						dismissedUpsells?: string[] | undefined
						imageGenerationProvider?: "openrouter" | undefined
						openRouterImageApiKey?: string | undefined
						openRouterImageGenerationSelectedModel?: string | undefined
						customCondensingPrompt?: string | undefined
						autoApprovalEnabled?: boolean | undefined
						alwaysAllowReadOnly?: boolean | undefined
						alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
						alwaysAllowWrite?: boolean | undefined
						alwaysAllowWriteOutsideWorkspace?: boolean | undefined
						alwaysAllowWriteProtected?: boolean | undefined
						writeDelayMs?: number | undefined
						requestDelaySeconds?: number | undefined
						alwaysAllowMcp?: boolean | undefined
						alwaysAllowModeSwitch?: boolean | undefined
						alwaysAllowSubtasks?: boolean | undefined
						alwaysAllowExecute?: boolean | undefined
						alwaysAllowFollowupQuestions?: boolean | undefined
						followupAutoApproveTimeoutMs?: number | undefined
						allowedCommands?: string[] | undefined
						deniedCommands?: string[] | undefined
						commandExecutionTimeout?: number | undefined
						commandTimeoutAllowlist?: string[] | undefined
						preventCompletionWithOpenTodos?: boolean | undefined
						allowedMaxRequests?: number | null | undefined
						allowedMaxCost?: number | null | undefined
						autoCondenseContext?: boolean | undefined
						autoCondenseContextPercent?: number | undefined
						includeCurrentTime?: boolean | undefined
						includeCurrentCost?: boolean | undefined
						maxGitStatusFiles?: number | undefined
						includeDiagnosticMessages?: boolean | undefined
						maxDiagnosticMessages?: number | undefined
						enableCheckpoints?: boolean | undefined
						checkpointTimeout?: number | undefined
						ttsEnabled?: boolean | undefined
						ttsSpeed?: number | undefined
						soundEnabled?: boolean | undefined
						soundVolume?: number | undefined
						maxOpenTabsContext?: number | undefined
						maxWorkspaceFiles?: number | undefined
						showAliIgnoredFiles?: boolean | undefined
						enableSubfolderRules?: boolean | undefined
						maxImageFileSize?: number | undefined
						maxTotalImageSize?: number | undefined
						terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
						terminalShellIntegrationTimeout?: number | undefined
						terminalShellIntegrationDisabled?: boolean | undefined
						terminalCommandDelay?: number | undefined
						terminalPowershellCounter?: boolean | undefined
						terminalZshClearEolMark?: boolean | undefined
						terminalZshOhMy?: boolean | undefined
						terminalZshP10k?: boolean | undefined
						terminalZdotdir?: boolean | undefined
						execaShellPath?: string | undefined
						diagnosticsEnabled?: boolean | undefined
						experiments?:
							| {
									preventFocusDisruption?: boolean | undefined
									imageGeneration?: boolean | undefined
									runSlashCommand?: boolean | undefined
									customTools?: boolean | undefined
							  }
							| undefined
						codebaseIndexModels?:
							| {
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
							| undefined
						codebaseIndexConfig?:
							| {
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
							| undefined
						language?:
							| "id"
							| "ca"
							| "de"
							| "en"
							| "es"
							| "fr"
							| "hi"
							| "it"
							| "ja"
							| "ko"
							| "nl"
							| "pl"
							| "pt-BR"
							| "ru"
							| "tr"
							| "vi"
							| "zh-CN"
							| "zh-TW"
							| undefined
						mcpEnabled?: boolean | undefined
						modeApiConfigs?: Record<string, string> | undefined
						customModePrompts?:
							| Record<
									string,
									| {
											description?: string | undefined
											roleDefinition?: string | undefined
											whenToUse?: string | undefined
											customInstructions?: string | undefined
									  }
									| undefined
							  >
							| undefined
						customSupportPrompts?: Record<string, string | undefined> | undefined
						enhancementApiConfigId?: string | undefined
						includeTaskHistoryInEnhance?: boolean | undefined
						historyPreviewCollapsed?: boolean | undefined
						reasoningBlockCollapsed?: boolean | undefined
						enterBehavior?: "send" | "newline" | undefined
						profileThresholds?: Record<string, number> | undefined
						hasOpenedModeSelector?: boolean | undefined
						lastModeExportPath?: string | undefined
						lastModeImportPath?: string | undefined
						lastSettingsExportPath?: string | undefined
						lastTaskExportPath?: string | undefined
						lastImageSavePath?: string | undefined
						worktreeAutoOpenPath?: string | undefined
						showWorktreesInHomeScreen?: boolean | undefined
						disabledTools?:
							| (
									| "apply_patch"
									| "apply_diff"
									| "write_to_file"
									| "search_replace"
									| "search_and_replace"
									| "edit"
									| "execute_command"
									| "read_file"
									| "read_command_output"
									| "edit_file"
									| "search_files"
									| "list_files"
									| "use_mcp_tool"
									| "access_mcp_resource"
									| "ask_followup_question"
									| "attempt_completion"
									| "switch_mode"
									| "new_task"
									| "codebase_search"
									| "update_todo_list"
									| "run_slash_command"
									| "skill"
									| "generate_image"
									| "custom_tool"
							  )[]
							| undefined
					}
					images?: string[] | undefined
					newTab?: boolean | undefined
				}
			},
			{
				commandName: TaskCommandName.StartNewTask
				data: {
					text: string
					configuration: {
						codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
						codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
						codeIndexOpenAiKey?: string | undefined
						codeIndexQdrantApiKey?: string | undefined
						codebaseIndexOpenAiCompatibleApiKey?: string | undefined
						codebaseIndexGeminiApiKey?: string | undefined
						codebaseIndexMistralApiKey?: string | undefined
						codebaseIndexVercelAiGatewayApiKey?: string | undefined
						codebaseIndexOpenRouterApiKey?: string | undefined
						reasoningEffort?:
							| "disable"
							| "none"
							| "minimal"
							| "low"
							| "medium"
							| "high"
							| "xhigh"
							| undefined
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
						zaiApiLine?:
							| "international_coding"
							| "china_coding"
							| "international_api"
							| "china_api"
							| undefined
						fireworksApiKey?: string | undefined
						qwenCodeOauthPath?: string | undefined
						vercelAiGatewayApiKey?: string | undefined
						vercelAiGatewayModelId?: string | undefined
						basetenApiKey?: string | undefined
						nvidiaNimApiKey?: string | undefined
						nvidiaNimBaseUrl?: string | undefined
						mode?: string | undefined
						customInstructions?: string | undefined
						customModes?:
							| {
									name: string
									slug: string
									roleDefinition: string
									groups: (
										| "command"
										| "read"
										| "edit"
										| "mcp"
										| "modes"
										| [
												"command" | "read" | "edit" | "mcp" | "modes",
												{
													description?: string | undefined
													fileRegex?: string | undefined
												},
										  ]
									)[]
									description?: string | undefined
									source?: "global" | "project" | undefined
									whenToUse?: string | undefined
									customInstructions?: string | undefined
							  }[]
							| undefined
						currentApiConfigName?: string | undefined
						listApiConfigMeta?:
							| {
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
							  }[]
							| undefined
						pinnedApiConfigs?: Record<string, boolean> | undefined
						lastShownAnnouncementId?: string | undefined
						taskHistory?:
							| {
									number: number
									ts: number
									totalCost: number
									id: string
									task: string
									tokensIn: number
									tokensOut: number
									status?: "active" | "completed" | "delegated" | undefined
									rootTaskId?: string | undefined
									parentTaskId?: string | undefined
									cacheWrites?: number | undefined
									cacheReads?: number | undefined
									size?: number | undefined
									workspace?: string | undefined
									mode?: string | undefined
									apiConfigName?: string | undefined
									delegatedToId?: string | undefined
									childIds?: string[] | undefined
									awaitingChildId?: string | undefined
									completedByChildId?: string | undefined
									completionResultSummary?: string | undefined
							  }[]
							| undefined
						dismissedUpsells?: string[] | undefined
						imageGenerationProvider?: "openrouter" | undefined
						openRouterImageApiKey?: string | undefined
						openRouterImageGenerationSelectedModel?: string | undefined
						customCondensingPrompt?: string | undefined
						autoApprovalEnabled?: boolean | undefined
						alwaysAllowReadOnly?: boolean | undefined
						alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
						alwaysAllowWrite?: boolean | undefined
						alwaysAllowWriteOutsideWorkspace?: boolean | undefined
						alwaysAllowWriteProtected?: boolean | undefined
						writeDelayMs?: number | undefined
						requestDelaySeconds?: number | undefined
						alwaysAllowMcp?: boolean | undefined
						alwaysAllowModeSwitch?: boolean | undefined
						alwaysAllowSubtasks?: boolean | undefined
						alwaysAllowExecute?: boolean | undefined
						alwaysAllowFollowupQuestions?: boolean | undefined
						followupAutoApproveTimeoutMs?: number | undefined
						allowedCommands?: string[] | undefined
						deniedCommands?: string[] | undefined
						commandExecutionTimeout?: number | undefined
						commandTimeoutAllowlist?: string[] | undefined
						preventCompletionWithOpenTodos?: boolean | undefined
						allowedMaxRequests?: number | null | undefined
						allowedMaxCost?: number | null | undefined
						autoCondenseContext?: boolean | undefined
						autoCondenseContextPercent?: number | undefined
						includeCurrentTime?: boolean | undefined
						includeCurrentCost?: boolean | undefined
						maxGitStatusFiles?: number | undefined
						includeDiagnosticMessages?: boolean | undefined
						maxDiagnosticMessages?: number | undefined
						enableCheckpoints?: boolean | undefined
						checkpointTimeout?: number | undefined
						ttsEnabled?: boolean | undefined
						ttsSpeed?: number | undefined
						soundEnabled?: boolean | undefined
						soundVolume?: number | undefined
						maxOpenTabsContext?: number | undefined
						maxWorkspaceFiles?: number | undefined
						showAliIgnoredFiles?: boolean | undefined
						enableSubfolderRules?: boolean | undefined
						maxImageFileSize?: number | undefined
						maxTotalImageSize?: number | undefined
						terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
						terminalShellIntegrationTimeout?: number | undefined
						terminalShellIntegrationDisabled?: boolean | undefined
						terminalCommandDelay?: number | undefined
						terminalPowershellCounter?: boolean | undefined
						terminalZshClearEolMark?: boolean | undefined
						terminalZshOhMy?: boolean | undefined
						terminalZshP10k?: boolean | undefined
						terminalZdotdir?: boolean | undefined
						execaShellPath?: string | undefined
						diagnosticsEnabled?: boolean | undefined
						experiments?:
							| {
									preventFocusDisruption?: boolean | undefined
									imageGeneration?: boolean | undefined
									runSlashCommand?: boolean | undefined
									customTools?: boolean | undefined
							  }
							| undefined
						codebaseIndexModels?:
							| {
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
							| undefined
						codebaseIndexConfig?:
							| {
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
							| undefined
						language?:
							| "id"
							| "ca"
							| "de"
							| "en"
							| "es"
							| "fr"
							| "hi"
							| "it"
							| "ja"
							| "ko"
							| "nl"
							| "pl"
							| "pt-BR"
							| "ru"
							| "tr"
							| "vi"
							| "zh-CN"
							| "zh-TW"
							| undefined
						mcpEnabled?: boolean | undefined
						modeApiConfigs?: Record<string, string> | undefined
						customModePrompts?:
							| Record<
									string,
									| {
											description?: string | undefined
											roleDefinition?: string | undefined
											whenToUse?: string | undefined
											customInstructions?: string | undefined
									  }
									| undefined
							  >
							| undefined
						customSupportPrompts?: Record<string, string | undefined> | undefined
						enhancementApiConfigId?: string | undefined
						includeTaskHistoryInEnhance?: boolean | undefined
						historyPreviewCollapsed?: boolean | undefined
						reasoningBlockCollapsed?: boolean | undefined
						enterBehavior?: "send" | "newline" | undefined
						profileThresholds?: Record<string, number> | undefined
						hasOpenedModeSelector?: boolean | undefined
						lastModeExportPath?: string | undefined
						lastModeImportPath?: string | undefined
						lastSettingsExportPath?: string | undefined
						lastTaskExportPath?: string | undefined
						lastImageSavePath?: string | undefined
						worktreeAutoOpenPath?: string | undefined
						showWorktreesInHomeScreen?: boolean | undefined
						disabledTools?:
							| (
									| "apply_patch"
									| "apply_diff"
									| "write_to_file"
									| "search_replace"
									| "search_and_replace"
									| "edit"
									| "execute_command"
									| "read_file"
									| "read_command_output"
									| "edit_file"
									| "search_files"
									| "list_files"
									| "use_mcp_tool"
									| "access_mcp_resource"
									| "ask_followup_question"
									| "attempt_completion"
									| "switch_mode"
									| "new_task"
									| "codebase_search"
									| "update_todo_list"
									| "run_slash_command"
									| "skill"
									| "generate_image"
									| "custom_tool"
							  )[]
							| undefined
					}
					images?: string[] | undefined
					newTab?: boolean | undefined
				}
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.CancelTask>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.CancelTask
			},
			{
				commandName: TaskCommandName.CancelTask
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.CloseTask>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.CloseTask
			},
			{
				commandName: TaskCommandName.CloseTask
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.ResumeTask>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.ResumeTask
				data: string
			},
			{
				commandName: TaskCommandName.ResumeTask
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.SendMessage>
				data: z.ZodObject<
					{
						text: z.ZodOptional<z.ZodString>
						images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
					},
					"strip",
					z.ZodTypeAny,
					{
						text?: string | undefined
						images?: string[] | undefined
					},
					{
						text?: string | undefined
						images?: string[] | undefined
					}
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.SendMessage
				data: {
					text?: string | undefined
					images?: string[] | undefined
				}
			},
			{
				commandName: TaskCommandName.SendMessage
				data: {
					text?: string | undefined
					images?: string[] | undefined
				}
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.GetCommands>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.GetCommands
			},
			{
				commandName: TaskCommandName.GetCommands
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.GetModes>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.GetModes
			},
			{
				commandName: TaskCommandName.GetModes
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.GetModels>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.GetModels
			},
			{
				commandName: TaskCommandName.GetModels
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.DeleteQueuedMessage>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.DeleteQueuedMessage
				data: string
			},
			{
				commandName: TaskCommandName.DeleteQueuedMessage
				data: string
			}
		>,
	]
>
export type TaskCommand = z.infer<typeof taskCommandSchema>
/**
 * IpcMessage
 */
export declare const ipcMessageSchema: z.ZodDiscriminatedUnion<
	"type",
	[
		z.ZodObject<
			{
				type: z.ZodLiteral<IpcMessageType.Ack>
				origin: z.ZodLiteral<IpcOrigin.Server>
				data: z.ZodObject<
					{
						clientId: z.ZodString
						pid: z.ZodNumber
						ppid: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						clientId: string
						pid: number
						ppid: number
					},
					{
						clientId: string
						pid: number
						ppid: number
					}
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				type: IpcMessageType.Ack
				data: {
					clientId: string
					pid: number
					ppid: number
				}
				origin: IpcOrigin.Server
			},
			{
				type: IpcMessageType.Ack
				data: {
					clientId: string
					pid: number
					ppid: number
				}
				origin: IpcOrigin.Server
			}
		>,
		z.ZodObject<
			{
				type: z.ZodLiteral<IpcMessageType.TaskCommand>
				origin: z.ZodLiteral<IpcOrigin.Client>
				clientId: z.ZodString
				data: z.ZodDiscriminatedUnion<
					"commandName",
					[
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.StartNewTask>
								data: z.ZodObject<
									{
										configuration: z.ZodObject<
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
												consecutiveMistakeLimit: z.ZodOptional<z.ZodNumber>
												enableReasoningEffort: z.ZodOptional<z.ZodBoolean>
												reasoningEffort: z.ZodOptional<
													z.ZodEnum<
														["disable", "none", "minimal", "low", "medium", "high", "xhigh"]
													>
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
													z.ZodEnum<
														[
															"international_coding",
															"china_coding",
															"international_api",
															"china_api",
														]
													>
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
														[
															z.ZodLiteral<"https://api.minimax.io/v1">,
															z.ZodLiteral<"https://api.minimaxi.com/v1">,
														]
													>
												>
												minimaxApiKey: z.ZodOptional<z.ZodString>
												moonshotBaseUrl: z.ZodOptional<
													z.ZodUnion<
														[
															z.ZodLiteral<"https://api.moonshot.ai/v1">,
															z.ZodLiteral<"https://api.moonshot.cn/v1">,
														]
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
												openAiNativeServiceTier: z.ZodOptional<
													z.ZodEnum<["default", "flex", "priority"]>
												>
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
																maxThinkingTokens: z.ZodOptional<
																	z.ZodNullable<z.ZodNumber>
																>
																contextWindow: z.ZodNumber
																supportsImages: z.ZodOptional<z.ZodBoolean>
																supportsPromptCache: z.ZodBoolean
																promptCacheRetention: z.ZodOptional<
																	z.ZodEnum<["in_memory", "24h"]>
																>
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
																					[
																						"disable",
																						"none",
																						"minimal",
																						"low",
																						"medium",
																						"high",
																						"xhigh",
																					]
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
																		z.ZodEnum<
																			[
																				"max_tokens",
																				"temperature",
																				"reasoning",
																				"include_reasoning",
																			]
																		>,
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
																				z.ZodArray<
																					z.ZodEnum<
																						["default", "flex", "priority"]
																					>,
																					"many"
																				>
																			>
																		},
																		"strip",
																		z.ZodTypeAny,
																		{
																			thresholdTokens: number
																			inputPriceMultiplier?: number | undefined
																			outputPriceMultiplier?: number | undefined
																			cacheWritesPriceMultiplier?:
																				| number
																				| undefined
																			cacheReadsPriceMultiplier?:
																				| number
																				| undefined
																			appliesToServiceTiers?:
																				| ("default" | "flex" | "priority")[]
																				| undefined
																		},
																		{
																			thresholdTokens: number
																			inputPriceMultiplier?: number | undefined
																			outputPriceMultiplier?: number | undefined
																			cacheWritesPriceMultiplier?:
																				| number
																				| undefined
																			cacheReadsPriceMultiplier?:
																				| number
																				| undefined
																			appliesToServiceTiers?:
																				| ("default" | "flex" | "priority")[]
																				| undefined
																		}
																	>
																>
																description: z.ZodOptional<z.ZodString>
																reasoningEffort: z.ZodOptional<
																	z.ZodEnum<
																		[
																			"none",
																			"minimal",
																			"low",
																			"medium",
																			"high",
																			"xhigh",
																		]
																	>
																>
																minTokensPerCachePoint: z.ZodOptional<z.ZodNumber>
																maxCachePoints: z.ZodOptional<z.ZodNumber>
																cachableFields: z.ZodOptional<
																	z.ZodArray<z.ZodString, "many">
																>
																deprecated: z.ZodOptional<z.ZodBoolean>
																isStealthModel: z.ZodOptional<z.ZodBoolean>
																isFree: z.ZodOptional<z.ZodBoolean>
																excludedTools: z.ZodOptional<
																	z.ZodArray<z.ZodString, "many">
																>
																includedTools: z.ZodOptional<
																	z.ZodArray<z.ZodString, "many">
																>
																tiers: z.ZodOptional<
																	z.ZodArray<
																		z.ZodObject<
																			{
																				name: z.ZodOptional<
																					z.ZodEnum<
																						["default", "flex", "priority"]
																					>
																				>
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
																				name?:
																					| "default"
																					| "flex"
																					| "priority"
																					| undefined
																			},
																			{
																				contextWindow: number
																				inputPrice?: number | undefined
																				outputPrice?: number | undefined
																				cacheWritesPrice?: number | undefined
																				cacheReadsPrice?: number | undefined
																				name?:
																					| "default"
																					| "flex"
																					| "priority"
																					| undefined
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
																	| (
																			| "disable"
																			| "none"
																			| "minimal"
																			| "low"
																			| "medium"
																			| "high"
																			| "xhigh"
																	  )[]
																	| undefined
																requiredReasoningEffort?: boolean | undefined
																preserveReasoning?: boolean | undefined
																supportedParameters?:
																	| (
																			| "reasoning"
																			| "max_tokens"
																			| "temperature"
																			| "include_reasoning"
																	  )[]
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
																			cacheWritesPriceMultiplier?:
																				| number
																				| undefined
																			cacheReadsPriceMultiplier?:
																				| number
																				| undefined
																			appliesToServiceTiers?:
																				| ("default" | "flex" | "priority")[]
																				| undefined
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
																			name?:
																				| "default"
																				| "flex"
																				| "priority"
																				| undefined
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
																	| (
																			| "disable"
																			| "none"
																			| "minimal"
																			| "low"
																			| "medium"
																			| "high"
																			| "xhigh"
																	  )[]
																	| undefined
																requiredReasoningEffort?: boolean | undefined
																preserveReasoning?: boolean | undefined
																supportedParameters?:
																	| (
																			| "reasoning"
																			| "max_tokens"
																			| "temperature"
																			| "include_reasoning"
																	  )[]
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
																			cacheWritesPriceMultiplier?:
																				| number
																				| undefined
																			cacheReadsPriceMultiplier?:
																				| number
																				| undefined
																			appliesToServiceTiers?:
																				| ("default" | "flex" | "priority")[]
																				| undefined
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
																			name?:
																				| "default"
																				| "flex"
																				| "priority"
																				| undefined
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
												awsBedrockServiceTier: z.ZodOptional<
													z.ZodEnum<["STANDARD", "FLEX", "PRIORITY"]>
												>
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
												currentApiConfigName: z.ZodOptional<z.ZodString>
												listApiConfigMeta: z.ZodOptional<
													z.ZodArray<
														z.ZodObject<
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
														>,
														"many"
													>
												>
												pinnedApiConfigs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>
												lastShownAnnouncementId: z.ZodOptional<z.ZodString>
												customInstructions: z.ZodOptional<z.ZodString>
												taskHistory: z.ZodOptional<
													z.ZodArray<
														z.ZodObject<
															{
																id: z.ZodString
																rootTaskId: z.ZodOptional<z.ZodString>
																parentTaskId: z.ZodOptional<z.ZodString>
																number: z.ZodNumber
																ts: z.ZodNumber
																task: z.ZodString
																tokensIn: z.ZodNumber
																tokensOut: z.ZodNumber
																cacheWrites: z.ZodOptional<z.ZodNumber>
																cacheReads: z.ZodOptional<z.ZodNumber>
																totalCost: z.ZodNumber
																size: z.ZodOptional<z.ZodNumber>
																workspace: z.ZodOptional<z.ZodString>
																mode: z.ZodOptional<z.ZodString>
																apiConfigName: z.ZodOptional<z.ZodString>
																status: z.ZodOptional<
																	z.ZodEnum<["active", "completed", "delegated"]>
																>
																delegatedToId: z.ZodOptional<z.ZodString>
																childIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
																awaitingChildId: z.ZodOptional<z.ZodString>
																completedByChildId: z.ZodOptional<z.ZodString>
																completionResultSummary: z.ZodOptional<z.ZodString>
															},
															"strip",
															z.ZodTypeAny,
															{
																number: number
																ts: number
																totalCost: number
																id: string
																task: string
																tokensIn: number
																tokensOut: number
																status?:
																	| "active"
																	| "completed"
																	| "delegated"
																	| undefined
																rootTaskId?: string | undefined
																parentTaskId?: string | undefined
																cacheWrites?: number | undefined
																cacheReads?: number | undefined
																size?: number | undefined
																workspace?: string | undefined
																mode?: string | undefined
																apiConfigName?: string | undefined
																delegatedToId?: string | undefined
																childIds?: string[] | undefined
																awaitingChildId?: string | undefined
																completedByChildId?: string | undefined
																completionResultSummary?: string | undefined
															},
															{
																number: number
																ts: number
																totalCost: number
																id: string
																task: string
																tokensIn: number
																tokensOut: number
																status?:
																	| "active"
																	| "completed"
																	| "delegated"
																	| undefined
																rootTaskId?: string | undefined
																parentTaskId?: string | undefined
																cacheWrites?: number | undefined
																cacheReads?: number | undefined
																size?: number | undefined
																workspace?: string | undefined
																mode?: string | undefined
																apiConfigName?: string | undefined
																delegatedToId?: string | undefined
																childIds?: string[] | undefined
																awaitingChildId?: string | undefined
																completedByChildId?: string | undefined
																completionResultSummary?: string | undefined
															}
														>,
														"many"
													>
												>
												dismissedUpsells: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
												imageGenerationProvider: z.ZodOptional<z.ZodEnum<["openrouter"]>>
												openRouterImageApiKey: z.ZodOptional<z.ZodString>
												openRouterImageGenerationSelectedModel: z.ZodOptional<z.ZodString>
												customCondensingPrompt: z.ZodOptional<z.ZodString>
												autoApprovalEnabled: z.ZodOptional<z.ZodBoolean>
												alwaysAllowReadOnly: z.ZodOptional<z.ZodBoolean>
												alwaysAllowReadOnlyOutsideWorkspace: z.ZodOptional<z.ZodBoolean>
												alwaysAllowWrite: z.ZodOptional<z.ZodBoolean>
												alwaysAllowWriteOutsideWorkspace: z.ZodOptional<z.ZodBoolean>
												alwaysAllowWriteProtected: z.ZodOptional<z.ZodBoolean>
												writeDelayMs: z.ZodOptional<z.ZodNumber>
												requestDelaySeconds: z.ZodOptional<z.ZodNumber>
												alwaysAllowMcp: z.ZodOptional<z.ZodBoolean>
												alwaysAllowModeSwitch: z.ZodOptional<z.ZodBoolean>
												alwaysAllowSubtasks: z.ZodOptional<z.ZodBoolean>
												alwaysAllowExecute: z.ZodOptional<z.ZodBoolean>
												alwaysAllowFollowupQuestions: z.ZodOptional<z.ZodBoolean>
												followupAutoApproveTimeoutMs: z.ZodOptional<z.ZodNumber>
												allowedCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
												deniedCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
												commandExecutionTimeout: z.ZodOptional<z.ZodNumber>
												commandTimeoutAllowlist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
												preventCompletionWithOpenTodos: z.ZodOptional<z.ZodBoolean>
												allowedMaxRequests: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
												allowedMaxCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
												autoCondenseContext: z.ZodOptional<z.ZodBoolean>
												autoCondenseContextPercent: z.ZodOptional<z.ZodNumber>
												includeCurrentTime: z.ZodOptional<z.ZodBoolean>
												includeCurrentCost: z.ZodOptional<z.ZodBoolean>
												maxGitStatusFiles: z.ZodOptional<z.ZodNumber>
												includeDiagnosticMessages: z.ZodOptional<z.ZodBoolean>
												maxDiagnosticMessages: z.ZodOptional<z.ZodNumber>
												enableCheckpoints: z.ZodOptional<z.ZodBoolean>
												checkpointTimeout: z.ZodOptional<z.ZodNumber>
												ttsEnabled: z.ZodOptional<z.ZodBoolean>
												ttsSpeed: z.ZodOptional<z.ZodNumber>
												soundEnabled: z.ZodOptional<z.ZodBoolean>
												soundVolume: z.ZodOptional<z.ZodNumber>
												maxOpenTabsContext: z.ZodOptional<z.ZodNumber>
												maxWorkspaceFiles: z.ZodOptional<z.ZodNumber>
												showAliIgnoredFiles: z.ZodOptional<z.ZodBoolean>
												enableSubfolderRules: z.ZodOptional<z.ZodBoolean>
												maxImageFileSize: z.ZodOptional<z.ZodNumber>
												maxTotalImageSize: z.ZodOptional<z.ZodNumber>
												terminalOutputPreviewSize: z.ZodOptional<
													z.ZodEnum<["small", "medium", "large"]>
												>
												terminalShellIntegrationTimeout: z.ZodOptional<z.ZodNumber>
												terminalShellIntegrationDisabled: z.ZodOptional<z.ZodBoolean>
												terminalCommandDelay: z.ZodOptional<z.ZodNumber>
												terminalPowershellCounter: z.ZodOptional<z.ZodBoolean>
												terminalZshClearEolMark: z.ZodOptional<z.ZodBoolean>
												terminalZshOhMy: z.ZodOptional<z.ZodBoolean>
												terminalZshP10k: z.ZodOptional<z.ZodBoolean>
												terminalZdotdir: z.ZodOptional<z.ZodBoolean>
												execaShellPath: z.ZodOptional<z.ZodString>
												diagnosticsEnabled: z.ZodOptional<z.ZodBoolean>
												rateLimitSeconds: z.ZodOptional<z.ZodNumber>
												experiments: z.ZodOptional<
													z.ZodObject<
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
												>
												codebaseIndexModels: z.ZodOptional<
													z.ZodObject<
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
												>
												codebaseIndexConfig: z.ZodOptional<
													z.ZodObject<
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
															codebaseIndexOpenAiCompatibleModelDimension?:
																| number
																| undefined
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
															codebaseIndexOpenAiCompatibleModelDimension?:
																| number
																| undefined
															codebaseIndexBedrockRegion?: string | undefined
															codebaseIndexBedrockProfile?: string | undefined
															codebaseIndexOpenRouterSpecificProvider?: string | undefined
														}
													>
												>
												language: z.ZodOptional<
													z.ZodEnum<
														[
															"ca",
															"de",
															"en",
															"es",
															"fr",
															"hi",
															"id",
															"it",
															"ja",
															"ko",
															"nl",
															"pl",
															"pt-BR",
															"ru",
															"tr",
															"vi",
															"zh-CN",
															"zh-TW",
														]
													>
												>
												mcpEnabled: z.ZodOptional<z.ZodBoolean>
												mode: z.ZodOptional<z.ZodString>
												modeApiConfigs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
												customModes: z.ZodOptional<
													z.ZodArray<
														z.ZodObject<
															{
																slug: z.ZodString
																name: z.ZodString
																roleDefinition: z.ZodString
																whenToUse: z.ZodOptional<z.ZodString>
																description: z.ZodOptional<z.ZodString>
																customInstructions: z.ZodOptional<z.ZodString>
																groups: z.ZodType<
																	(
																		| "command"
																		| "read"
																		| "edit"
																		| "mcp"
																		| "modes"
																		| [
																				(
																					| "command"
																					| "read"
																					| "edit"
																					| "mcp"
																					| "modes"
																				),
																				{
																					description?: string | undefined
																					fileRegex?: string | undefined
																				},
																		  ]
																	)[],
																	z.ZodTypeDef,
																	(
																		| "command"
																		| "read"
																		| "edit"
																		| "mcp"
																		| "modes"
																		| [
																				(
																					| "command"
																					| "read"
																					| "edit"
																					| "mcp"
																					| "modes"
																				),
																				{
																					description?: string | undefined
																					fileRegex?: string | undefined
																				},
																		  ]
																	)[]
																>
																source: z.ZodOptional<z.ZodEnum<["global", "project"]>>
															},
															"strip",
															z.ZodTypeAny,
															{
																name: string
																slug: string
																roleDefinition: string
																groups: (
																	| "command"
																	| "read"
																	| "edit"
																	| "mcp"
																	| "modes"
																	| [
																			(
																				| "command"
																				| "read"
																				| "edit"
																				| "mcp"
																				| "modes"
																			),
																			{
																				description?: string | undefined
																				fileRegex?: string | undefined
																			},
																	  ]
																)[]
																description?: string | undefined
																source?: "global" | "project" | undefined
																whenToUse?: string | undefined
																customInstructions?: string | undefined
															},
															{
																name: string
																slug: string
																roleDefinition: string
																groups: (
																	| "command"
																	| "read"
																	| "edit"
																	| "mcp"
																	| "modes"
																	| [
																			(
																				| "command"
																				| "read"
																				| "edit"
																				| "mcp"
																				| "modes"
																			),
																			{
																				description?: string | undefined
																				fileRegex?: string | undefined
																			},
																	  ]
																)[]
																description?: string | undefined
																source?: "global" | "project" | undefined
																whenToUse?: string | undefined
																customInstructions?: string | undefined
															}
														>,
														"many"
													>
												>
												customModePrompts: z.ZodOptional<
													z.ZodRecord<
														z.ZodString,
														z.ZodOptional<
															z.ZodObject<
																{
																	roleDefinition: z.ZodOptional<z.ZodString>
																	whenToUse: z.ZodOptional<z.ZodString>
																	description: z.ZodOptional<z.ZodString>
																	customInstructions: z.ZodOptional<z.ZodString>
																},
																"strip",
																z.ZodTypeAny,
																{
																	description?: string | undefined
																	roleDefinition?: string | undefined
																	whenToUse?: string | undefined
																	customInstructions?: string | undefined
																},
																{
																	description?: string | undefined
																	roleDefinition?: string | undefined
																	whenToUse?: string | undefined
																	customInstructions?: string | undefined
																}
															>
														>
													>
												>
												customSupportPrompts: z.ZodOptional<
													z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>
												>
												enhancementApiConfigId: z.ZodOptional<z.ZodString>
												includeTaskHistoryInEnhance: z.ZodOptional<z.ZodBoolean>
												historyPreviewCollapsed: z.ZodOptional<z.ZodBoolean>
												reasoningBlockCollapsed: z.ZodOptional<z.ZodBoolean>
												enterBehavior: z.ZodOptional<z.ZodEnum<["send", "newline"]>>
												profileThresholds: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>
												hasOpenedModeSelector: z.ZodOptional<z.ZodBoolean>
												lastModeExportPath: z.ZodOptional<z.ZodString>
												lastModeImportPath: z.ZodOptional<z.ZodString>
												lastSettingsExportPath: z.ZodOptional<z.ZodString>
												lastTaskExportPath: z.ZodOptional<z.ZodString>
												lastImageSavePath: z.ZodOptional<z.ZodString>
												worktreeAutoOpenPath: z.ZodOptional<z.ZodString>
												showWorktreesInHomeScreen: z.ZodOptional<z.ZodBoolean>
												disabledTools: z.ZodOptional<
													z.ZodArray<
														z.ZodEnum<
															[
																"execute_command",
																"read_file",
																"read_command_output",
																"write_to_file",
																"apply_diff",
																"edit",
																"search_and_replace",
																"search_replace",
																"edit_file",
																"apply_patch",
																"search_files",
																"list_files",
																"use_mcp_tool",
																"access_mcp_resource",
																"ask_followup_question",
																"attempt_completion",
																"switch_mode",
																"new_task",
																"codebase_search",
																"update_todo_list",
																"run_slash_command",
																"skill",
																"generate_image",
																"custom_tool",
															]
														>,
														"many"
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
												reasoningEffort?:
													| "disable"
													| "none"
													| "minimal"
													| "low"
													| "medium"
													| "high"
													| "xhigh"
													| undefined
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
																| (
																		| "disable"
																		| "none"
																		| "minimal"
																		| "low"
																		| "medium"
																		| "high"
																		| "xhigh"
																  )[]
																| undefined
															requiredReasoningEffort?: boolean | undefined
															preserveReasoning?: boolean | undefined
															supportedParameters?:
																| (
																		| "reasoning"
																		| "max_tokens"
																		| "temperature"
																		| "include_reasoning"
																  )[]
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
																		appliesToServiceTiers?:
																			| ("default" | "flex" | "priority")[]
																			| undefined
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
																		name?:
																			| "default"
																			| "flex"
																			| "priority"
																			| undefined
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
												moonshotBaseUrl?:
													| "https://api.moonshot.ai/v1"
													| "https://api.moonshot.cn/v1"
													| undefined
												moonshotApiKey?: string | undefined
												minimaxBaseUrl?:
													| "https://api.minimax.io/v1"
													| "https://api.minimaxi.com/v1"
													| undefined
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
												zaiApiLine?:
													| "international_coding"
													| "china_coding"
													| "international_api"
													| "china_api"
													| undefined
												fireworksApiKey?: string | undefined
												qwenCodeOauthPath?: string | undefined
												vercelAiGatewayApiKey?: string | undefined
												vercelAiGatewayModelId?: string | undefined
												basetenApiKey?: string | undefined
												nvidiaNimApiKey?: string | undefined
												nvidiaNimBaseUrl?: string | undefined
												mode?: string | undefined
												customInstructions?: string | undefined
												customModes?:
													| {
															name: string
															slug: string
															roleDefinition: string
															groups: (
																| "command"
																| "read"
																| "edit"
																| "mcp"
																| "modes"
																| [
																		"command" | "read" | "edit" | "mcp" | "modes",
																		{
																			description?: string | undefined
																			fileRegex?: string | undefined
																		},
																  ]
															)[]
															description?: string | undefined
															source?: "global" | "project" | undefined
															whenToUse?: string | undefined
															customInstructions?: string | undefined
													  }[]
													| undefined
												currentApiConfigName?: string | undefined
												listApiConfigMeta?:
													| {
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
													  }[]
													| undefined
												pinnedApiConfigs?: Record<string, boolean> | undefined
												lastShownAnnouncementId?: string | undefined
												taskHistory?:
													| {
															number: number
															ts: number
															totalCost: number
															id: string
															task: string
															tokensIn: number
															tokensOut: number
															status?: "active" | "completed" | "delegated" | undefined
															rootTaskId?: string | undefined
															parentTaskId?: string | undefined
															cacheWrites?: number | undefined
															cacheReads?: number | undefined
															size?: number | undefined
															workspace?: string | undefined
															mode?: string | undefined
															apiConfigName?: string | undefined
															delegatedToId?: string | undefined
															childIds?: string[] | undefined
															awaitingChildId?: string | undefined
															completedByChildId?: string | undefined
															completionResultSummary?: string | undefined
													  }[]
													| undefined
												dismissedUpsells?: string[] | undefined
												imageGenerationProvider?: "openrouter" | undefined
												openRouterImageApiKey?: string | undefined
												openRouterImageGenerationSelectedModel?: string | undefined
												customCondensingPrompt?: string | undefined
												autoApprovalEnabled?: boolean | undefined
												alwaysAllowReadOnly?: boolean | undefined
												alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
												alwaysAllowWrite?: boolean | undefined
												alwaysAllowWriteOutsideWorkspace?: boolean | undefined
												alwaysAllowWriteProtected?: boolean | undefined
												writeDelayMs?: number | undefined
												requestDelaySeconds?: number | undefined
												alwaysAllowMcp?: boolean | undefined
												alwaysAllowModeSwitch?: boolean | undefined
												alwaysAllowSubtasks?: boolean | undefined
												alwaysAllowExecute?: boolean | undefined
												alwaysAllowFollowupQuestions?: boolean | undefined
												followupAutoApproveTimeoutMs?: number | undefined
												allowedCommands?: string[] | undefined
												deniedCommands?: string[] | undefined
												commandExecutionTimeout?: number | undefined
												commandTimeoutAllowlist?: string[] | undefined
												preventCompletionWithOpenTodos?: boolean | undefined
												allowedMaxRequests?: number | null | undefined
												allowedMaxCost?: number | null | undefined
												autoCondenseContext?: boolean | undefined
												autoCondenseContextPercent?: number | undefined
												includeCurrentTime?: boolean | undefined
												includeCurrentCost?: boolean | undefined
												maxGitStatusFiles?: number | undefined
												includeDiagnosticMessages?: boolean | undefined
												maxDiagnosticMessages?: number | undefined
												enableCheckpoints?: boolean | undefined
												checkpointTimeout?: number | undefined
												ttsEnabled?: boolean | undefined
												ttsSpeed?: number | undefined
												soundEnabled?: boolean | undefined
												soundVolume?: number | undefined
												maxOpenTabsContext?: number | undefined
												maxWorkspaceFiles?: number | undefined
												showAliIgnoredFiles?: boolean | undefined
												enableSubfolderRules?: boolean | undefined
												maxImageFileSize?: number | undefined
												maxTotalImageSize?: number | undefined
												terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
												terminalShellIntegrationTimeout?: number | undefined
												terminalShellIntegrationDisabled?: boolean | undefined
												terminalCommandDelay?: number | undefined
												terminalPowershellCounter?: boolean | undefined
												terminalZshClearEolMark?: boolean | undefined
												terminalZshOhMy?: boolean | undefined
												terminalZshP10k?: boolean | undefined
												terminalZdotdir?: boolean | undefined
												execaShellPath?: string | undefined
												diagnosticsEnabled?: boolean | undefined
												experiments?:
													| {
															preventFocusDisruption?: boolean | undefined
															imageGeneration?: boolean | undefined
															runSlashCommand?: boolean | undefined
															customTools?: boolean | undefined
													  }
													| undefined
												codebaseIndexModels?:
													| {
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
													| undefined
												codebaseIndexConfig?:
													| {
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
															codebaseIndexOpenAiCompatibleModelDimension?:
																| number
																| undefined
															codebaseIndexBedrockRegion?: string | undefined
															codebaseIndexBedrockProfile?: string | undefined
															codebaseIndexOpenRouterSpecificProvider?: string | undefined
													  }
													| undefined
												language?:
													| "id"
													| "ca"
													| "de"
													| "en"
													| "es"
													| "fr"
													| "hi"
													| "it"
													| "ja"
													| "ko"
													| "nl"
													| "pl"
													| "pt-BR"
													| "ru"
													| "tr"
													| "vi"
													| "zh-CN"
													| "zh-TW"
													| undefined
												mcpEnabled?: boolean | undefined
												modeApiConfigs?: Record<string, string> | undefined
												customModePrompts?:
													| Record<
															string,
															| {
																	description?: string | undefined
																	roleDefinition?: string | undefined
																	whenToUse?: string | undefined
																	customInstructions?: string | undefined
															  }
															| undefined
													  >
													| undefined
												customSupportPrompts?: Record<string, string | undefined> | undefined
												enhancementApiConfigId?: string | undefined
												includeTaskHistoryInEnhance?: boolean | undefined
												historyPreviewCollapsed?: boolean | undefined
												reasoningBlockCollapsed?: boolean | undefined
												enterBehavior?: "send" | "newline" | undefined
												profileThresholds?: Record<string, number> | undefined
												hasOpenedModeSelector?: boolean | undefined
												lastModeExportPath?: string | undefined
												lastModeImportPath?: string | undefined
												lastSettingsExportPath?: string | undefined
												lastTaskExportPath?: string | undefined
												lastImageSavePath?: string | undefined
												worktreeAutoOpenPath?: string | undefined
												showWorktreesInHomeScreen?: boolean | undefined
												disabledTools?:
													| (
															| "apply_patch"
															| "apply_diff"
															| "write_to_file"
															| "search_replace"
															| "search_and_replace"
															| "edit"
															| "execute_command"
															| "read_file"
															| "read_command_output"
															| "edit_file"
															| "search_files"
															| "list_files"
															| "use_mcp_tool"
															| "access_mcp_resource"
															| "ask_followup_question"
															| "attempt_completion"
															| "switch_mode"
															| "new_task"
															| "codebase_search"
															| "update_todo_list"
															| "run_slash_command"
															| "skill"
															| "generate_image"
															| "custom_tool"
													  )[]
													| undefined
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
												reasoningEffort?:
													| "disable"
													| "none"
													| "minimal"
													| "low"
													| "medium"
													| "high"
													| "xhigh"
													| undefined
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
																| (
																		| "disable"
																		| "none"
																		| "minimal"
																		| "low"
																		| "medium"
																		| "high"
																		| "xhigh"
																  )[]
																| undefined
															requiredReasoningEffort?: boolean | undefined
															preserveReasoning?: boolean | undefined
															supportedParameters?:
																| (
																		| "reasoning"
																		| "max_tokens"
																		| "temperature"
																		| "include_reasoning"
																  )[]
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
																		appliesToServiceTiers?:
																			| ("default" | "flex" | "priority")[]
																			| undefined
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
																		name?:
																			| "default"
																			| "flex"
																			| "priority"
																			| undefined
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
												moonshotBaseUrl?:
													| "https://api.moonshot.ai/v1"
													| "https://api.moonshot.cn/v1"
													| undefined
												moonshotApiKey?: string | undefined
												minimaxBaseUrl?:
													| "https://api.minimax.io/v1"
													| "https://api.minimaxi.com/v1"
													| undefined
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
												zaiApiLine?:
													| "international_coding"
													| "china_coding"
													| "international_api"
													| "china_api"
													| undefined
												fireworksApiKey?: string | undefined
												qwenCodeOauthPath?: string | undefined
												vercelAiGatewayApiKey?: string | undefined
												vercelAiGatewayModelId?: string | undefined
												basetenApiKey?: string | undefined
												nvidiaNimApiKey?: string | undefined
												nvidiaNimBaseUrl?: string | undefined
												mode?: string | undefined
												customInstructions?: string | undefined
												customModes?:
													| {
															name: string
															slug: string
															roleDefinition: string
															groups: (
																| "command"
																| "read"
																| "edit"
																| "mcp"
																| "modes"
																| [
																		"command" | "read" | "edit" | "mcp" | "modes",
																		{
																			description?: string | undefined
																			fileRegex?: string | undefined
																		},
																  ]
															)[]
															description?: string | undefined
															source?: "global" | "project" | undefined
															whenToUse?: string | undefined
															customInstructions?: string | undefined
													  }[]
													| undefined
												currentApiConfigName?: string | undefined
												listApiConfigMeta?:
													| {
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
													  }[]
													| undefined
												pinnedApiConfigs?: Record<string, boolean> | undefined
												lastShownAnnouncementId?: string | undefined
												taskHistory?:
													| {
															number: number
															ts: number
															totalCost: number
															id: string
															task: string
															tokensIn: number
															tokensOut: number
															status?: "active" | "completed" | "delegated" | undefined
															rootTaskId?: string | undefined
															parentTaskId?: string | undefined
															cacheWrites?: number | undefined
															cacheReads?: number | undefined
															size?: number | undefined
															workspace?: string | undefined
															mode?: string | undefined
															apiConfigName?: string | undefined
															delegatedToId?: string | undefined
															childIds?: string[] | undefined
															awaitingChildId?: string | undefined
															completedByChildId?: string | undefined
															completionResultSummary?: string | undefined
													  }[]
													| undefined
												dismissedUpsells?: string[] | undefined
												imageGenerationProvider?: "openrouter" | undefined
												openRouterImageApiKey?: string | undefined
												openRouterImageGenerationSelectedModel?: string | undefined
												customCondensingPrompt?: string | undefined
												autoApprovalEnabled?: boolean | undefined
												alwaysAllowReadOnly?: boolean | undefined
												alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
												alwaysAllowWrite?: boolean | undefined
												alwaysAllowWriteOutsideWorkspace?: boolean | undefined
												alwaysAllowWriteProtected?: boolean | undefined
												writeDelayMs?: number | undefined
												requestDelaySeconds?: number | undefined
												alwaysAllowMcp?: boolean | undefined
												alwaysAllowModeSwitch?: boolean | undefined
												alwaysAllowSubtasks?: boolean | undefined
												alwaysAllowExecute?: boolean | undefined
												alwaysAllowFollowupQuestions?: boolean | undefined
												followupAutoApproveTimeoutMs?: number | undefined
												allowedCommands?: string[] | undefined
												deniedCommands?: string[] | undefined
												commandExecutionTimeout?: number | undefined
												commandTimeoutAllowlist?: string[] | undefined
												preventCompletionWithOpenTodos?: boolean | undefined
												allowedMaxRequests?: number | null | undefined
												allowedMaxCost?: number | null | undefined
												autoCondenseContext?: boolean | undefined
												autoCondenseContextPercent?: number | undefined
												includeCurrentTime?: boolean | undefined
												includeCurrentCost?: boolean | undefined
												maxGitStatusFiles?: number | undefined
												includeDiagnosticMessages?: boolean | undefined
												maxDiagnosticMessages?: number | undefined
												enableCheckpoints?: boolean | undefined
												checkpointTimeout?: number | undefined
												ttsEnabled?: boolean | undefined
												ttsSpeed?: number | undefined
												soundEnabled?: boolean | undefined
												soundVolume?: number | undefined
												maxOpenTabsContext?: number | undefined
												maxWorkspaceFiles?: number | undefined
												showAliIgnoredFiles?: boolean | undefined
												enableSubfolderRules?: boolean | undefined
												maxImageFileSize?: number | undefined
												maxTotalImageSize?: number | undefined
												terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
												terminalShellIntegrationTimeout?: number | undefined
												terminalShellIntegrationDisabled?: boolean | undefined
												terminalCommandDelay?: number | undefined
												terminalPowershellCounter?: boolean | undefined
												terminalZshClearEolMark?: boolean | undefined
												terminalZshOhMy?: boolean | undefined
												terminalZshP10k?: boolean | undefined
												terminalZdotdir?: boolean | undefined
												execaShellPath?: string | undefined
												diagnosticsEnabled?: boolean | undefined
												experiments?:
													| {
															preventFocusDisruption?: boolean | undefined
															imageGeneration?: boolean | undefined
															runSlashCommand?: boolean | undefined
															customTools?: boolean | undefined
													  }
													| undefined
												codebaseIndexModels?:
													| {
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
													| undefined
												codebaseIndexConfig?:
													| {
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
															codebaseIndexOpenAiCompatibleModelDimension?:
																| number
																| undefined
															codebaseIndexBedrockRegion?: string | undefined
															codebaseIndexBedrockProfile?: string | undefined
															codebaseIndexOpenRouterSpecificProvider?: string | undefined
													  }
													| undefined
												language?:
													| "id"
													| "ca"
													| "de"
													| "en"
													| "es"
													| "fr"
													| "hi"
													| "it"
													| "ja"
													| "ko"
													| "nl"
													| "pl"
													| "pt-BR"
													| "ru"
													| "tr"
													| "vi"
													| "zh-CN"
													| "zh-TW"
													| undefined
												mcpEnabled?: boolean | undefined
												modeApiConfigs?: Record<string, string> | undefined
												customModePrompts?:
													| Record<
															string,
															| {
																	description?: string | undefined
																	roleDefinition?: string | undefined
																	whenToUse?: string | undefined
																	customInstructions?: string | undefined
															  }
															| undefined
													  >
													| undefined
												customSupportPrompts?: Record<string, string | undefined> | undefined
												enhancementApiConfigId?: string | undefined
												includeTaskHistoryInEnhance?: boolean | undefined
												historyPreviewCollapsed?: boolean | undefined
												reasoningBlockCollapsed?: boolean | undefined
												enterBehavior?: "send" | "newline" | undefined
												profileThresholds?: Record<string, number> | undefined
												hasOpenedModeSelector?: boolean | undefined
												lastModeExportPath?: string | undefined
												lastModeImportPath?: string | undefined
												lastSettingsExportPath?: string | undefined
												lastTaskExportPath?: string | undefined
												lastImageSavePath?: string | undefined
												worktreeAutoOpenPath?: string | undefined
												showWorktreesInHomeScreen?: boolean | undefined
												disabledTools?:
													| (
															| "apply_patch"
															| "apply_diff"
															| "write_to_file"
															| "search_replace"
															| "search_and_replace"
															| "edit"
															| "execute_command"
															| "read_file"
															| "read_command_output"
															| "edit_file"
															| "search_files"
															| "list_files"
															| "use_mcp_tool"
															| "access_mcp_resource"
															| "ask_followup_question"
															| "attempt_completion"
															| "switch_mode"
															| "new_task"
															| "codebase_search"
															| "update_todo_list"
															| "run_slash_command"
															| "skill"
															| "generate_image"
															| "custom_tool"
													  )[]
													| undefined
											}
										>
										text: z.ZodString
										images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
										newTab: z.ZodOptional<z.ZodBoolean>
									},
									"strip",
									z.ZodTypeAny,
									{
										text: string
										configuration: {
											codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
											codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
											codeIndexOpenAiKey?: string | undefined
											codeIndexQdrantApiKey?: string | undefined
											codebaseIndexOpenAiCompatibleApiKey?: string | undefined
											codebaseIndexGeminiApiKey?: string | undefined
											codebaseIndexMistralApiKey?: string | undefined
											codebaseIndexVercelAiGatewayApiKey?: string | undefined
											codebaseIndexOpenRouterApiKey?: string | undefined
											reasoningEffort?:
												| "disable"
												| "none"
												| "minimal"
												| "low"
												| "medium"
												| "high"
												| "xhigh"
												| undefined
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
															| (
																	| "disable"
																	| "none"
																	| "minimal"
																	| "low"
																	| "medium"
																	| "high"
																	| "xhigh"
															  )[]
															| undefined
														requiredReasoningEffort?: boolean | undefined
														preserveReasoning?: boolean | undefined
														supportedParameters?:
															| (
																	| "reasoning"
																	| "max_tokens"
																	| "temperature"
																	| "include_reasoning"
															  )[]
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
																	appliesToServiceTiers?:
																		| ("default" | "flex" | "priority")[]
																		| undefined
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
											moonshotBaseUrl?:
												| "https://api.moonshot.ai/v1"
												| "https://api.moonshot.cn/v1"
												| undefined
											moonshotApiKey?: string | undefined
											minimaxBaseUrl?:
												| "https://api.minimax.io/v1"
												| "https://api.minimaxi.com/v1"
												| undefined
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
											zaiApiLine?:
												| "international_coding"
												| "china_coding"
												| "international_api"
												| "china_api"
												| undefined
											fireworksApiKey?: string | undefined
											qwenCodeOauthPath?: string | undefined
											vercelAiGatewayApiKey?: string | undefined
											vercelAiGatewayModelId?: string | undefined
											basetenApiKey?: string | undefined
											nvidiaNimApiKey?: string | undefined
											nvidiaNimBaseUrl?: string | undefined
											mode?: string | undefined
											customInstructions?: string | undefined
											customModes?:
												| {
														name: string
														slug: string
														roleDefinition: string
														groups: (
															| "command"
															| "read"
															| "edit"
															| "mcp"
															| "modes"
															| [
																	"command" | "read" | "edit" | "mcp" | "modes",
																	{
																		description?: string | undefined
																		fileRegex?: string | undefined
																	},
															  ]
														)[]
														description?: string | undefined
														source?: "global" | "project" | undefined
														whenToUse?: string | undefined
														customInstructions?: string | undefined
												  }[]
												| undefined
											currentApiConfigName?: string | undefined
											listApiConfigMeta?:
												| {
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
												  }[]
												| undefined
											pinnedApiConfigs?: Record<string, boolean> | undefined
											lastShownAnnouncementId?: string | undefined
											taskHistory?:
												| {
														number: number
														ts: number
														totalCost: number
														id: string
														task: string
														tokensIn: number
														tokensOut: number
														status?: "active" | "completed" | "delegated" | undefined
														rootTaskId?: string | undefined
														parentTaskId?: string | undefined
														cacheWrites?: number | undefined
														cacheReads?: number | undefined
														size?: number | undefined
														workspace?: string | undefined
														mode?: string | undefined
														apiConfigName?: string | undefined
														delegatedToId?: string | undefined
														childIds?: string[] | undefined
														awaitingChildId?: string | undefined
														completedByChildId?: string | undefined
														completionResultSummary?: string | undefined
												  }[]
												| undefined
											dismissedUpsells?: string[] | undefined
											imageGenerationProvider?: "openrouter" | undefined
											openRouterImageApiKey?: string | undefined
											openRouterImageGenerationSelectedModel?: string | undefined
											customCondensingPrompt?: string | undefined
											autoApprovalEnabled?: boolean | undefined
											alwaysAllowReadOnly?: boolean | undefined
											alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
											alwaysAllowWrite?: boolean | undefined
											alwaysAllowWriteOutsideWorkspace?: boolean | undefined
											alwaysAllowWriteProtected?: boolean | undefined
											writeDelayMs?: number | undefined
											requestDelaySeconds?: number | undefined
											alwaysAllowMcp?: boolean | undefined
											alwaysAllowModeSwitch?: boolean | undefined
											alwaysAllowSubtasks?: boolean | undefined
											alwaysAllowExecute?: boolean | undefined
											alwaysAllowFollowupQuestions?: boolean | undefined
											followupAutoApproveTimeoutMs?: number | undefined
											allowedCommands?: string[] | undefined
											deniedCommands?: string[] | undefined
											commandExecutionTimeout?: number | undefined
											commandTimeoutAllowlist?: string[] | undefined
											preventCompletionWithOpenTodos?: boolean | undefined
											allowedMaxRequests?: number | null | undefined
											allowedMaxCost?: number | null | undefined
											autoCondenseContext?: boolean | undefined
											autoCondenseContextPercent?: number | undefined
											includeCurrentTime?: boolean | undefined
											includeCurrentCost?: boolean | undefined
											maxGitStatusFiles?: number | undefined
											includeDiagnosticMessages?: boolean | undefined
											maxDiagnosticMessages?: number | undefined
											enableCheckpoints?: boolean | undefined
											checkpointTimeout?: number | undefined
											ttsEnabled?: boolean | undefined
											ttsSpeed?: number | undefined
											soundEnabled?: boolean | undefined
											soundVolume?: number | undefined
											maxOpenTabsContext?: number | undefined
											maxWorkspaceFiles?: number | undefined
											showAliIgnoredFiles?: boolean | undefined
											enableSubfolderRules?: boolean | undefined
											maxImageFileSize?: number | undefined
											maxTotalImageSize?: number | undefined
											terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
											terminalShellIntegrationTimeout?: number | undefined
											terminalShellIntegrationDisabled?: boolean | undefined
											terminalCommandDelay?: number | undefined
											terminalPowershellCounter?: boolean | undefined
											terminalZshClearEolMark?: boolean | undefined
											terminalZshOhMy?: boolean | undefined
											terminalZshP10k?: boolean | undefined
											terminalZdotdir?: boolean | undefined
											execaShellPath?: string | undefined
											diagnosticsEnabled?: boolean | undefined
											experiments?:
												| {
														preventFocusDisruption?: boolean | undefined
														imageGeneration?: boolean | undefined
														runSlashCommand?: boolean | undefined
														customTools?: boolean | undefined
												  }
												| undefined
											codebaseIndexModels?:
												| {
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
												| undefined
											codebaseIndexConfig?:
												| {
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
												| undefined
											language?:
												| "id"
												| "ca"
												| "de"
												| "en"
												| "es"
												| "fr"
												| "hi"
												| "it"
												| "ja"
												| "ko"
												| "nl"
												| "pl"
												| "pt-BR"
												| "ru"
												| "tr"
												| "vi"
												| "zh-CN"
												| "zh-TW"
												| undefined
											mcpEnabled?: boolean | undefined
											modeApiConfigs?: Record<string, string> | undefined
											customModePrompts?:
												| Record<
														string,
														| {
																description?: string | undefined
																roleDefinition?: string | undefined
																whenToUse?: string | undefined
																customInstructions?: string | undefined
														  }
														| undefined
												  >
												| undefined
											customSupportPrompts?: Record<string, string | undefined> | undefined
											enhancementApiConfigId?: string | undefined
											includeTaskHistoryInEnhance?: boolean | undefined
											historyPreviewCollapsed?: boolean | undefined
											reasoningBlockCollapsed?: boolean | undefined
											enterBehavior?: "send" | "newline" | undefined
											profileThresholds?: Record<string, number> | undefined
											hasOpenedModeSelector?: boolean | undefined
											lastModeExportPath?: string | undefined
											lastModeImportPath?: string | undefined
											lastSettingsExportPath?: string | undefined
											lastTaskExportPath?: string | undefined
											lastImageSavePath?: string | undefined
											worktreeAutoOpenPath?: string | undefined
											showWorktreesInHomeScreen?: boolean | undefined
											disabledTools?:
												| (
														| "apply_patch"
														| "apply_diff"
														| "write_to_file"
														| "search_replace"
														| "search_and_replace"
														| "edit"
														| "execute_command"
														| "read_file"
														| "read_command_output"
														| "edit_file"
														| "search_files"
														| "list_files"
														| "use_mcp_tool"
														| "access_mcp_resource"
														| "ask_followup_question"
														| "attempt_completion"
														| "switch_mode"
														| "new_task"
														| "codebase_search"
														| "update_todo_list"
														| "run_slash_command"
														| "skill"
														| "generate_image"
														| "custom_tool"
												  )[]
												| undefined
										}
										images?: string[] | undefined
										newTab?: boolean | undefined
									},
									{
										text: string
										configuration: {
											codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
											codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
											codeIndexOpenAiKey?: string | undefined
											codeIndexQdrantApiKey?: string | undefined
											codebaseIndexOpenAiCompatibleApiKey?: string | undefined
											codebaseIndexGeminiApiKey?: string | undefined
											codebaseIndexMistralApiKey?: string | undefined
											codebaseIndexVercelAiGatewayApiKey?: string | undefined
											codebaseIndexOpenRouterApiKey?: string | undefined
											reasoningEffort?:
												| "disable"
												| "none"
												| "minimal"
												| "low"
												| "medium"
												| "high"
												| "xhigh"
												| undefined
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
															| (
																	| "disable"
																	| "none"
																	| "minimal"
																	| "low"
																	| "medium"
																	| "high"
																	| "xhigh"
															  )[]
															| undefined
														requiredReasoningEffort?: boolean | undefined
														preserveReasoning?: boolean | undefined
														supportedParameters?:
															| (
																	| "reasoning"
																	| "max_tokens"
																	| "temperature"
																	| "include_reasoning"
															  )[]
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
																	appliesToServiceTiers?:
																		| ("default" | "flex" | "priority")[]
																		| undefined
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
											moonshotBaseUrl?:
												| "https://api.moonshot.ai/v1"
												| "https://api.moonshot.cn/v1"
												| undefined
											moonshotApiKey?: string | undefined
											minimaxBaseUrl?:
												| "https://api.minimax.io/v1"
												| "https://api.minimaxi.com/v1"
												| undefined
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
											zaiApiLine?:
												| "international_coding"
												| "china_coding"
												| "international_api"
												| "china_api"
												| undefined
											fireworksApiKey?: string | undefined
											qwenCodeOauthPath?: string | undefined
											vercelAiGatewayApiKey?: string | undefined
											vercelAiGatewayModelId?: string | undefined
											basetenApiKey?: string | undefined
											nvidiaNimApiKey?: string | undefined
											nvidiaNimBaseUrl?: string | undefined
											mode?: string | undefined
											customInstructions?: string | undefined
											customModes?:
												| {
														name: string
														slug: string
														roleDefinition: string
														groups: (
															| "command"
															| "read"
															| "edit"
															| "mcp"
															| "modes"
															| [
																	"command" | "read" | "edit" | "mcp" | "modes",
																	{
																		description?: string | undefined
																		fileRegex?: string | undefined
																	},
															  ]
														)[]
														description?: string | undefined
														source?: "global" | "project" | undefined
														whenToUse?: string | undefined
														customInstructions?: string | undefined
												  }[]
												| undefined
											currentApiConfigName?: string | undefined
											listApiConfigMeta?:
												| {
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
												  }[]
												| undefined
											pinnedApiConfigs?: Record<string, boolean> | undefined
											lastShownAnnouncementId?: string | undefined
											taskHistory?:
												| {
														number: number
														ts: number
														totalCost: number
														id: string
														task: string
														tokensIn: number
														tokensOut: number
														status?: "active" | "completed" | "delegated" | undefined
														rootTaskId?: string | undefined
														parentTaskId?: string | undefined
														cacheWrites?: number | undefined
														cacheReads?: number | undefined
														size?: number | undefined
														workspace?: string | undefined
														mode?: string | undefined
														apiConfigName?: string | undefined
														delegatedToId?: string | undefined
														childIds?: string[] | undefined
														awaitingChildId?: string | undefined
														completedByChildId?: string | undefined
														completionResultSummary?: string | undefined
												  }[]
												| undefined
											dismissedUpsells?: string[] | undefined
											imageGenerationProvider?: "openrouter" | undefined
											openRouterImageApiKey?: string | undefined
											openRouterImageGenerationSelectedModel?: string | undefined
											customCondensingPrompt?: string | undefined
											autoApprovalEnabled?: boolean | undefined
											alwaysAllowReadOnly?: boolean | undefined
											alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
											alwaysAllowWrite?: boolean | undefined
											alwaysAllowWriteOutsideWorkspace?: boolean | undefined
											alwaysAllowWriteProtected?: boolean | undefined
											writeDelayMs?: number | undefined
											requestDelaySeconds?: number | undefined
											alwaysAllowMcp?: boolean | undefined
											alwaysAllowModeSwitch?: boolean | undefined
											alwaysAllowSubtasks?: boolean | undefined
											alwaysAllowExecute?: boolean | undefined
											alwaysAllowFollowupQuestions?: boolean | undefined
											followupAutoApproveTimeoutMs?: number | undefined
											allowedCommands?: string[] | undefined
											deniedCommands?: string[] | undefined
											commandExecutionTimeout?: number | undefined
											commandTimeoutAllowlist?: string[] | undefined
											preventCompletionWithOpenTodos?: boolean | undefined
											allowedMaxRequests?: number | null | undefined
											allowedMaxCost?: number | null | undefined
											autoCondenseContext?: boolean | undefined
											autoCondenseContextPercent?: number | undefined
											includeCurrentTime?: boolean | undefined
											includeCurrentCost?: boolean | undefined
											maxGitStatusFiles?: number | undefined
											includeDiagnosticMessages?: boolean | undefined
											maxDiagnosticMessages?: number | undefined
											enableCheckpoints?: boolean | undefined
											checkpointTimeout?: number | undefined
											ttsEnabled?: boolean | undefined
											ttsSpeed?: number | undefined
											soundEnabled?: boolean | undefined
											soundVolume?: number | undefined
											maxOpenTabsContext?: number | undefined
											maxWorkspaceFiles?: number | undefined
											showAliIgnoredFiles?: boolean | undefined
											enableSubfolderRules?: boolean | undefined
											maxImageFileSize?: number | undefined
											maxTotalImageSize?: number | undefined
											terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
											terminalShellIntegrationTimeout?: number | undefined
											terminalShellIntegrationDisabled?: boolean | undefined
											terminalCommandDelay?: number | undefined
											terminalPowershellCounter?: boolean | undefined
											terminalZshClearEolMark?: boolean | undefined
											terminalZshOhMy?: boolean | undefined
											terminalZshP10k?: boolean | undefined
											terminalZdotdir?: boolean | undefined
											execaShellPath?: string | undefined
											diagnosticsEnabled?: boolean | undefined
											experiments?:
												| {
														preventFocusDisruption?: boolean | undefined
														imageGeneration?: boolean | undefined
														runSlashCommand?: boolean | undefined
														customTools?: boolean | undefined
												  }
												| undefined
											codebaseIndexModels?:
												| {
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
												| undefined
											codebaseIndexConfig?:
												| {
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
												| undefined
											language?:
												| "id"
												| "ca"
												| "de"
												| "en"
												| "es"
												| "fr"
												| "hi"
												| "it"
												| "ja"
												| "ko"
												| "nl"
												| "pl"
												| "pt-BR"
												| "ru"
												| "tr"
												| "vi"
												| "zh-CN"
												| "zh-TW"
												| undefined
											mcpEnabled?: boolean | undefined
											modeApiConfigs?: Record<string, string> | undefined
											customModePrompts?:
												| Record<
														string,
														| {
																description?: string | undefined
																roleDefinition?: string | undefined
																whenToUse?: string | undefined
																customInstructions?: string | undefined
														  }
														| undefined
												  >
												| undefined
											customSupportPrompts?: Record<string, string | undefined> | undefined
											enhancementApiConfigId?: string | undefined
											includeTaskHistoryInEnhance?: boolean | undefined
											historyPreviewCollapsed?: boolean | undefined
											reasoningBlockCollapsed?: boolean | undefined
											enterBehavior?: "send" | "newline" | undefined
											profileThresholds?: Record<string, number> | undefined
											hasOpenedModeSelector?: boolean | undefined
											lastModeExportPath?: string | undefined
											lastModeImportPath?: string | undefined
											lastSettingsExportPath?: string | undefined
											lastTaskExportPath?: string | undefined
											lastImageSavePath?: string | undefined
											worktreeAutoOpenPath?: string | undefined
											showWorktreesInHomeScreen?: boolean | undefined
											disabledTools?:
												| (
														| "apply_patch"
														| "apply_diff"
														| "write_to_file"
														| "search_replace"
														| "search_and_replace"
														| "edit"
														| "execute_command"
														| "read_file"
														| "read_command_output"
														| "edit_file"
														| "search_files"
														| "list_files"
														| "use_mcp_tool"
														| "access_mcp_resource"
														| "ask_followup_question"
														| "attempt_completion"
														| "switch_mode"
														| "new_task"
														| "codebase_search"
														| "update_todo_list"
														| "run_slash_command"
														| "skill"
														| "generate_image"
														| "custom_tool"
												  )[]
												| undefined
										}
										images?: string[] | undefined
										newTab?: boolean | undefined
									}
								>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.StartNewTask
								data: {
									text: string
									configuration: {
										codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
										codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
										codeIndexOpenAiKey?: string | undefined
										codeIndexQdrantApiKey?: string | undefined
										codebaseIndexOpenAiCompatibleApiKey?: string | undefined
										codebaseIndexGeminiApiKey?: string | undefined
										codebaseIndexMistralApiKey?: string | undefined
										codebaseIndexVercelAiGatewayApiKey?: string | undefined
										codebaseIndexOpenRouterApiKey?: string | undefined
										reasoningEffort?:
											| "disable"
											| "none"
											| "minimal"
											| "low"
											| "medium"
											| "high"
											| "xhigh"
											| undefined
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
														| (
																| "disable"
																| "none"
																| "minimal"
																| "low"
																| "medium"
																| "high"
																| "xhigh"
														  )[]
														| undefined
													requiredReasoningEffort?: boolean | undefined
													preserveReasoning?: boolean | undefined
													supportedParameters?:
														| (
																| "reasoning"
																| "max_tokens"
																| "temperature"
																| "include_reasoning"
														  )[]
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
																appliesToServiceTiers?:
																	| ("default" | "flex" | "priority")[]
																	| undefined
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
										moonshotBaseUrl?:
											| "https://api.moonshot.ai/v1"
											| "https://api.moonshot.cn/v1"
											| undefined
										moonshotApiKey?: string | undefined
										minimaxBaseUrl?:
											| "https://api.minimax.io/v1"
											| "https://api.minimaxi.com/v1"
											| undefined
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
										zaiApiLine?:
											| "international_coding"
											| "china_coding"
											| "international_api"
											| "china_api"
											| undefined
										fireworksApiKey?: string | undefined
										qwenCodeOauthPath?: string | undefined
										vercelAiGatewayApiKey?: string | undefined
										vercelAiGatewayModelId?: string | undefined
										basetenApiKey?: string | undefined
										nvidiaNimApiKey?: string | undefined
										nvidiaNimBaseUrl?: string | undefined
										mode?: string | undefined
										customInstructions?: string | undefined
										customModes?:
											| {
													name: string
													slug: string
													roleDefinition: string
													groups: (
														| "command"
														| "read"
														| "edit"
														| "mcp"
														| "modes"
														| [
																"command" | "read" | "edit" | "mcp" | "modes",
																{
																	description?: string | undefined
																	fileRegex?: string | undefined
																},
														  ]
													)[]
													description?: string | undefined
													source?: "global" | "project" | undefined
													whenToUse?: string | undefined
													customInstructions?: string | undefined
											  }[]
											| undefined
										currentApiConfigName?: string | undefined
										listApiConfigMeta?:
											| {
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
											  }[]
											| undefined
										pinnedApiConfigs?: Record<string, boolean> | undefined
										lastShownAnnouncementId?: string | undefined
										taskHistory?:
											| {
													number: number
													ts: number
													totalCost: number
													id: string
													task: string
													tokensIn: number
													tokensOut: number
													status?: "active" | "completed" | "delegated" | undefined
													rootTaskId?: string | undefined
													parentTaskId?: string | undefined
													cacheWrites?: number | undefined
													cacheReads?: number | undefined
													size?: number | undefined
													workspace?: string | undefined
													mode?: string | undefined
													apiConfigName?: string | undefined
													delegatedToId?: string | undefined
													childIds?: string[] | undefined
													awaitingChildId?: string | undefined
													completedByChildId?: string | undefined
													completionResultSummary?: string | undefined
											  }[]
											| undefined
										dismissedUpsells?: string[] | undefined
										imageGenerationProvider?: "openrouter" | undefined
										openRouterImageApiKey?: string | undefined
										openRouterImageGenerationSelectedModel?: string | undefined
										customCondensingPrompt?: string | undefined
										autoApprovalEnabled?: boolean | undefined
										alwaysAllowReadOnly?: boolean | undefined
										alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
										alwaysAllowWrite?: boolean | undefined
										alwaysAllowWriteOutsideWorkspace?: boolean | undefined
										alwaysAllowWriteProtected?: boolean | undefined
										writeDelayMs?: number | undefined
										requestDelaySeconds?: number | undefined
										alwaysAllowMcp?: boolean | undefined
										alwaysAllowModeSwitch?: boolean | undefined
										alwaysAllowSubtasks?: boolean | undefined
										alwaysAllowExecute?: boolean | undefined
										alwaysAllowFollowupQuestions?: boolean | undefined
										followupAutoApproveTimeoutMs?: number | undefined
										allowedCommands?: string[] | undefined
										deniedCommands?: string[] | undefined
										commandExecutionTimeout?: number | undefined
										commandTimeoutAllowlist?: string[] | undefined
										preventCompletionWithOpenTodos?: boolean | undefined
										allowedMaxRequests?: number | null | undefined
										allowedMaxCost?: number | null | undefined
										autoCondenseContext?: boolean | undefined
										autoCondenseContextPercent?: number | undefined
										includeCurrentTime?: boolean | undefined
										includeCurrentCost?: boolean | undefined
										maxGitStatusFiles?: number | undefined
										includeDiagnosticMessages?: boolean | undefined
										maxDiagnosticMessages?: number | undefined
										enableCheckpoints?: boolean | undefined
										checkpointTimeout?: number | undefined
										ttsEnabled?: boolean | undefined
										ttsSpeed?: number | undefined
										soundEnabled?: boolean | undefined
										soundVolume?: number | undefined
										maxOpenTabsContext?: number | undefined
										maxWorkspaceFiles?: number | undefined
										showAliIgnoredFiles?: boolean | undefined
										enableSubfolderRules?: boolean | undefined
										maxImageFileSize?: number | undefined
										maxTotalImageSize?: number | undefined
										terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
										terminalShellIntegrationTimeout?: number | undefined
										terminalShellIntegrationDisabled?: boolean | undefined
										terminalCommandDelay?: number | undefined
										terminalPowershellCounter?: boolean | undefined
										terminalZshClearEolMark?: boolean | undefined
										terminalZshOhMy?: boolean | undefined
										terminalZshP10k?: boolean | undefined
										terminalZdotdir?: boolean | undefined
										execaShellPath?: string | undefined
										diagnosticsEnabled?: boolean | undefined
										experiments?:
											| {
													preventFocusDisruption?: boolean | undefined
													imageGeneration?: boolean | undefined
													runSlashCommand?: boolean | undefined
													customTools?: boolean | undefined
											  }
											| undefined
										codebaseIndexModels?:
											| {
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
											| undefined
										codebaseIndexConfig?:
											| {
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
											| undefined
										language?:
											| "id"
											| "ca"
											| "de"
											| "en"
											| "es"
											| "fr"
											| "hi"
											| "it"
											| "ja"
											| "ko"
											| "nl"
											| "pl"
											| "pt-BR"
											| "ru"
											| "tr"
											| "vi"
											| "zh-CN"
											| "zh-TW"
											| undefined
										mcpEnabled?: boolean | undefined
										modeApiConfigs?: Record<string, string> | undefined
										customModePrompts?:
											| Record<
													string,
													| {
															description?: string | undefined
															roleDefinition?: string | undefined
															whenToUse?: string | undefined
															customInstructions?: string | undefined
													  }
													| undefined
											  >
											| undefined
										customSupportPrompts?: Record<string, string | undefined> | undefined
										enhancementApiConfigId?: string | undefined
										includeTaskHistoryInEnhance?: boolean | undefined
										historyPreviewCollapsed?: boolean | undefined
										reasoningBlockCollapsed?: boolean | undefined
										enterBehavior?: "send" | "newline" | undefined
										profileThresholds?: Record<string, number> | undefined
										hasOpenedModeSelector?: boolean | undefined
										lastModeExportPath?: string | undefined
										lastModeImportPath?: string | undefined
										lastSettingsExportPath?: string | undefined
										lastTaskExportPath?: string | undefined
										lastImageSavePath?: string | undefined
										worktreeAutoOpenPath?: string | undefined
										showWorktreesInHomeScreen?: boolean | undefined
										disabledTools?:
											| (
													| "apply_patch"
													| "apply_diff"
													| "write_to_file"
													| "search_replace"
													| "search_and_replace"
													| "edit"
													| "execute_command"
													| "read_file"
													| "read_command_output"
													| "edit_file"
													| "search_files"
													| "list_files"
													| "use_mcp_tool"
													| "access_mcp_resource"
													| "ask_followup_question"
													| "attempt_completion"
													| "switch_mode"
													| "new_task"
													| "codebase_search"
													| "update_todo_list"
													| "run_slash_command"
													| "skill"
													| "generate_image"
													| "custom_tool"
											  )[]
											| undefined
									}
									images?: string[] | undefined
									newTab?: boolean | undefined
								}
							},
							{
								commandName: TaskCommandName.StartNewTask
								data: {
									text: string
									configuration: {
										codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
										codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
										codeIndexOpenAiKey?: string | undefined
										codeIndexQdrantApiKey?: string | undefined
										codebaseIndexOpenAiCompatibleApiKey?: string | undefined
										codebaseIndexGeminiApiKey?: string | undefined
										codebaseIndexMistralApiKey?: string | undefined
										codebaseIndexVercelAiGatewayApiKey?: string | undefined
										codebaseIndexOpenRouterApiKey?: string | undefined
										reasoningEffort?:
											| "disable"
											| "none"
											| "minimal"
											| "low"
											| "medium"
											| "high"
											| "xhigh"
											| undefined
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
														| (
																| "disable"
																| "none"
																| "minimal"
																| "low"
																| "medium"
																| "high"
																| "xhigh"
														  )[]
														| undefined
													requiredReasoningEffort?: boolean | undefined
													preserveReasoning?: boolean | undefined
													supportedParameters?:
														| (
																| "reasoning"
																| "max_tokens"
																| "temperature"
																| "include_reasoning"
														  )[]
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
																appliesToServiceTiers?:
																	| ("default" | "flex" | "priority")[]
																	| undefined
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
										moonshotBaseUrl?:
											| "https://api.moonshot.ai/v1"
											| "https://api.moonshot.cn/v1"
											| undefined
										moonshotApiKey?: string | undefined
										minimaxBaseUrl?:
											| "https://api.minimax.io/v1"
											| "https://api.minimaxi.com/v1"
											| undefined
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
										zaiApiLine?:
											| "international_coding"
											| "china_coding"
											| "international_api"
											| "china_api"
											| undefined
										fireworksApiKey?: string | undefined
										qwenCodeOauthPath?: string | undefined
										vercelAiGatewayApiKey?: string | undefined
										vercelAiGatewayModelId?: string | undefined
										basetenApiKey?: string | undefined
										nvidiaNimApiKey?: string | undefined
										nvidiaNimBaseUrl?: string | undefined
										mode?: string | undefined
										customInstructions?: string | undefined
										customModes?:
											| {
													name: string
													slug: string
													roleDefinition: string
													groups: (
														| "command"
														| "read"
														| "edit"
														| "mcp"
														| "modes"
														| [
																"command" | "read" | "edit" | "mcp" | "modes",
																{
																	description?: string | undefined
																	fileRegex?: string | undefined
																},
														  ]
													)[]
													description?: string | undefined
													source?: "global" | "project" | undefined
													whenToUse?: string | undefined
													customInstructions?: string | undefined
											  }[]
											| undefined
										currentApiConfigName?: string | undefined
										listApiConfigMeta?:
											| {
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
											  }[]
											| undefined
										pinnedApiConfigs?: Record<string, boolean> | undefined
										lastShownAnnouncementId?: string | undefined
										taskHistory?:
											| {
													number: number
													ts: number
													totalCost: number
													id: string
													task: string
													tokensIn: number
													tokensOut: number
													status?: "active" | "completed" | "delegated" | undefined
													rootTaskId?: string | undefined
													parentTaskId?: string | undefined
													cacheWrites?: number | undefined
													cacheReads?: number | undefined
													size?: number | undefined
													workspace?: string | undefined
													mode?: string | undefined
													apiConfigName?: string | undefined
													delegatedToId?: string | undefined
													childIds?: string[] | undefined
													awaitingChildId?: string | undefined
													completedByChildId?: string | undefined
													completionResultSummary?: string | undefined
											  }[]
											| undefined
										dismissedUpsells?: string[] | undefined
										imageGenerationProvider?: "openrouter" | undefined
										openRouterImageApiKey?: string | undefined
										openRouterImageGenerationSelectedModel?: string | undefined
										customCondensingPrompt?: string | undefined
										autoApprovalEnabled?: boolean | undefined
										alwaysAllowReadOnly?: boolean | undefined
										alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
										alwaysAllowWrite?: boolean | undefined
										alwaysAllowWriteOutsideWorkspace?: boolean | undefined
										alwaysAllowWriteProtected?: boolean | undefined
										writeDelayMs?: number | undefined
										requestDelaySeconds?: number | undefined
										alwaysAllowMcp?: boolean | undefined
										alwaysAllowModeSwitch?: boolean | undefined
										alwaysAllowSubtasks?: boolean | undefined
										alwaysAllowExecute?: boolean | undefined
										alwaysAllowFollowupQuestions?: boolean | undefined
										followupAutoApproveTimeoutMs?: number | undefined
										allowedCommands?: string[] | undefined
										deniedCommands?: string[] | undefined
										commandExecutionTimeout?: number | undefined
										commandTimeoutAllowlist?: string[] | undefined
										preventCompletionWithOpenTodos?: boolean | undefined
										allowedMaxRequests?: number | null | undefined
										allowedMaxCost?: number | null | undefined
										autoCondenseContext?: boolean | undefined
										autoCondenseContextPercent?: number | undefined
										includeCurrentTime?: boolean | undefined
										includeCurrentCost?: boolean | undefined
										maxGitStatusFiles?: number | undefined
										includeDiagnosticMessages?: boolean | undefined
										maxDiagnosticMessages?: number | undefined
										enableCheckpoints?: boolean | undefined
										checkpointTimeout?: number | undefined
										ttsEnabled?: boolean | undefined
										ttsSpeed?: number | undefined
										soundEnabled?: boolean | undefined
										soundVolume?: number | undefined
										maxOpenTabsContext?: number | undefined
										maxWorkspaceFiles?: number | undefined
										showAliIgnoredFiles?: boolean | undefined
										enableSubfolderRules?: boolean | undefined
										maxImageFileSize?: number | undefined
										maxTotalImageSize?: number | undefined
										terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
										terminalShellIntegrationTimeout?: number | undefined
										terminalShellIntegrationDisabled?: boolean | undefined
										terminalCommandDelay?: number | undefined
										terminalPowershellCounter?: boolean | undefined
										terminalZshClearEolMark?: boolean | undefined
										terminalZshOhMy?: boolean | undefined
										terminalZshP10k?: boolean | undefined
										terminalZdotdir?: boolean | undefined
										execaShellPath?: string | undefined
										diagnosticsEnabled?: boolean | undefined
										experiments?:
											| {
													preventFocusDisruption?: boolean | undefined
													imageGeneration?: boolean | undefined
													runSlashCommand?: boolean | undefined
													customTools?: boolean | undefined
											  }
											| undefined
										codebaseIndexModels?:
											| {
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
											| undefined
										codebaseIndexConfig?:
											| {
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
											| undefined
										language?:
											| "id"
											| "ca"
											| "de"
											| "en"
											| "es"
											| "fr"
											| "hi"
											| "it"
											| "ja"
											| "ko"
											| "nl"
											| "pl"
											| "pt-BR"
											| "ru"
											| "tr"
											| "vi"
											| "zh-CN"
											| "zh-TW"
											| undefined
										mcpEnabled?: boolean | undefined
										modeApiConfigs?: Record<string, string> | undefined
										customModePrompts?:
											| Record<
													string,
													| {
															description?: string | undefined
															roleDefinition?: string | undefined
															whenToUse?: string | undefined
															customInstructions?: string | undefined
													  }
													| undefined
											  >
											| undefined
										customSupportPrompts?: Record<string, string | undefined> | undefined
										enhancementApiConfigId?: string | undefined
										includeTaskHistoryInEnhance?: boolean | undefined
										historyPreviewCollapsed?: boolean | undefined
										reasoningBlockCollapsed?: boolean | undefined
										enterBehavior?: "send" | "newline" | undefined
										profileThresholds?: Record<string, number> | undefined
										hasOpenedModeSelector?: boolean | undefined
										lastModeExportPath?: string | undefined
										lastModeImportPath?: string | undefined
										lastSettingsExportPath?: string | undefined
										lastTaskExportPath?: string | undefined
										lastImageSavePath?: string | undefined
										worktreeAutoOpenPath?: string | undefined
										showWorktreesInHomeScreen?: boolean | undefined
										disabledTools?:
											| (
													| "apply_patch"
													| "apply_diff"
													| "write_to_file"
													| "search_replace"
													| "search_and_replace"
													| "edit"
													| "execute_command"
													| "read_file"
													| "read_command_output"
													| "edit_file"
													| "search_files"
													| "list_files"
													| "use_mcp_tool"
													| "access_mcp_resource"
													| "ask_followup_question"
													| "attempt_completion"
													| "switch_mode"
													| "new_task"
													| "codebase_search"
													| "update_todo_list"
													| "run_slash_command"
													| "skill"
													| "generate_image"
													| "custom_tool"
											  )[]
											| undefined
									}
									images?: string[] | undefined
									newTab?: boolean | undefined
								}
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.CancelTask>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.CancelTask
							},
							{
								commandName: TaskCommandName.CancelTask
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.CloseTask>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.CloseTask
							},
							{
								commandName: TaskCommandName.CloseTask
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.ResumeTask>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.ResumeTask
								data: string
							},
							{
								commandName: TaskCommandName.ResumeTask
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.SendMessage>
								data: z.ZodObject<
									{
										text: z.ZodOptional<z.ZodString>
										images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
									},
									"strip",
									z.ZodTypeAny,
									{
										text?: string | undefined
										images?: string[] | undefined
									},
									{
										text?: string | undefined
										images?: string[] | undefined
									}
								>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.SendMessage
								data: {
									text?: string | undefined
									images?: string[] | undefined
								}
							},
							{
								commandName: TaskCommandName.SendMessage
								data: {
									text?: string | undefined
									images?: string[] | undefined
								}
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.GetCommands>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.GetCommands
							},
							{
								commandName: TaskCommandName.GetCommands
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.GetModes>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.GetModes
							},
							{
								commandName: TaskCommandName.GetModes
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.GetModels>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.GetModels
							},
							{
								commandName: TaskCommandName.GetModels
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.DeleteQueuedMessage>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.DeleteQueuedMessage
								data: string
							},
							{
								commandName: TaskCommandName.DeleteQueuedMessage
								data: string
							}
						>,
					]
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				type: IpcMessageType.TaskCommand
				clientId: string
				data:
					| {
							commandName: TaskCommandName.StartNewTask
							data: {
								text: string
								configuration: {
									codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
									codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
									codeIndexOpenAiKey?: string | undefined
									codeIndexQdrantApiKey?: string | undefined
									codebaseIndexOpenAiCompatibleApiKey?: string | undefined
									codebaseIndexGeminiApiKey?: string | undefined
									codebaseIndexMistralApiKey?: string | undefined
									codebaseIndexVercelAiGatewayApiKey?: string | undefined
									codebaseIndexOpenRouterApiKey?: string | undefined
									reasoningEffort?:
										| "disable"
										| "none"
										| "minimal"
										| "low"
										| "medium"
										| "high"
										| "xhigh"
										| undefined
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
													| (
															| "disable"
															| "none"
															| "minimal"
															| "low"
															| "medium"
															| "high"
															| "xhigh"
													  )[]
													| undefined
												requiredReasoningEffort?: boolean | undefined
												preserveReasoning?: boolean | undefined
												supportedParameters?:
													| (
															| "reasoning"
															| "max_tokens"
															| "temperature"
															| "include_reasoning"
													  )[]
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
															appliesToServiceTiers?:
																| ("default" | "flex" | "priority")[]
																| undefined
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
									moonshotBaseUrl?:
										| "https://api.moonshot.ai/v1"
										| "https://api.moonshot.cn/v1"
										| undefined
									moonshotApiKey?: string | undefined
									minimaxBaseUrl?:
										| "https://api.minimax.io/v1"
										| "https://api.minimaxi.com/v1"
										| undefined
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
									zaiApiLine?:
										| "international_coding"
										| "china_coding"
										| "international_api"
										| "china_api"
										| undefined
									fireworksApiKey?: string | undefined
									qwenCodeOauthPath?: string | undefined
									vercelAiGatewayApiKey?: string | undefined
									vercelAiGatewayModelId?: string | undefined
									basetenApiKey?: string | undefined
									nvidiaNimApiKey?: string | undefined
									nvidiaNimBaseUrl?: string | undefined
									mode?: string | undefined
									customInstructions?: string | undefined
									customModes?:
										| {
												name: string
												slug: string
												roleDefinition: string
												groups: (
													| "command"
													| "read"
													| "edit"
													| "mcp"
													| "modes"
													| [
															"command" | "read" | "edit" | "mcp" | "modes",
															{
																description?: string | undefined
																fileRegex?: string | undefined
															},
													  ]
												)[]
												description?: string | undefined
												source?: "global" | "project" | undefined
												whenToUse?: string | undefined
												customInstructions?: string | undefined
										  }[]
										| undefined
									currentApiConfigName?: string | undefined
									listApiConfigMeta?:
										| {
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
										  }[]
										| undefined
									pinnedApiConfigs?: Record<string, boolean> | undefined
									lastShownAnnouncementId?: string | undefined
									taskHistory?:
										| {
												number: number
												ts: number
												totalCost: number
												id: string
												task: string
												tokensIn: number
												tokensOut: number
												status?: "active" | "completed" | "delegated" | undefined
												rootTaskId?: string | undefined
												parentTaskId?: string | undefined
												cacheWrites?: number | undefined
												cacheReads?: number | undefined
												size?: number | undefined
												workspace?: string | undefined
												mode?: string | undefined
												apiConfigName?: string | undefined
												delegatedToId?: string | undefined
												childIds?: string[] | undefined
												awaitingChildId?: string | undefined
												completedByChildId?: string | undefined
												completionResultSummary?: string | undefined
										  }[]
										| undefined
									dismissedUpsells?: string[] | undefined
									imageGenerationProvider?: "openrouter" | undefined
									openRouterImageApiKey?: string | undefined
									openRouterImageGenerationSelectedModel?: string | undefined
									customCondensingPrompt?: string | undefined
									autoApprovalEnabled?: boolean | undefined
									alwaysAllowReadOnly?: boolean | undefined
									alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
									alwaysAllowWrite?: boolean | undefined
									alwaysAllowWriteOutsideWorkspace?: boolean | undefined
									alwaysAllowWriteProtected?: boolean | undefined
									writeDelayMs?: number | undefined
									requestDelaySeconds?: number | undefined
									alwaysAllowMcp?: boolean | undefined
									alwaysAllowModeSwitch?: boolean | undefined
									alwaysAllowSubtasks?: boolean | undefined
									alwaysAllowExecute?: boolean | undefined
									alwaysAllowFollowupQuestions?: boolean | undefined
									followupAutoApproveTimeoutMs?: number | undefined
									allowedCommands?: string[] | undefined
									deniedCommands?: string[] | undefined
									commandExecutionTimeout?: number | undefined
									commandTimeoutAllowlist?: string[] | undefined
									preventCompletionWithOpenTodos?: boolean | undefined
									allowedMaxRequests?: number | null | undefined
									allowedMaxCost?: number | null | undefined
									autoCondenseContext?: boolean | undefined
									autoCondenseContextPercent?: number | undefined
									includeCurrentTime?: boolean | undefined
									includeCurrentCost?: boolean | undefined
									maxGitStatusFiles?: number | undefined
									includeDiagnosticMessages?: boolean | undefined
									maxDiagnosticMessages?: number | undefined
									enableCheckpoints?: boolean | undefined
									checkpointTimeout?: number | undefined
									ttsEnabled?: boolean | undefined
									ttsSpeed?: number | undefined
									soundEnabled?: boolean | undefined
									soundVolume?: number | undefined
									maxOpenTabsContext?: number | undefined
									maxWorkspaceFiles?: number | undefined
									showAliIgnoredFiles?: boolean | undefined
									enableSubfolderRules?: boolean | undefined
									maxImageFileSize?: number | undefined
									maxTotalImageSize?: number | undefined
									terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
									terminalShellIntegrationTimeout?: number | undefined
									terminalShellIntegrationDisabled?: boolean | undefined
									terminalCommandDelay?: number | undefined
									terminalPowershellCounter?: boolean | undefined
									terminalZshClearEolMark?: boolean | undefined
									terminalZshOhMy?: boolean | undefined
									terminalZshP10k?: boolean | undefined
									terminalZdotdir?: boolean | undefined
									execaShellPath?: string | undefined
									diagnosticsEnabled?: boolean | undefined
									experiments?:
										| {
												preventFocusDisruption?: boolean | undefined
												imageGeneration?: boolean | undefined
												runSlashCommand?: boolean | undefined
												customTools?: boolean | undefined
										  }
										| undefined
									codebaseIndexModels?:
										| {
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
										| undefined
									codebaseIndexConfig?:
										| {
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
										| undefined
									language?:
										| "id"
										| "ca"
										| "de"
										| "en"
										| "es"
										| "fr"
										| "hi"
										| "it"
										| "ja"
										| "ko"
										| "nl"
										| "pl"
										| "pt-BR"
										| "ru"
										| "tr"
										| "vi"
										| "zh-CN"
										| "zh-TW"
										| undefined
									mcpEnabled?: boolean | undefined
									modeApiConfigs?: Record<string, string> | undefined
									customModePrompts?:
										| Record<
												string,
												| {
														description?: string | undefined
														roleDefinition?: string | undefined
														whenToUse?: string | undefined
														customInstructions?: string | undefined
												  }
												| undefined
										  >
										| undefined
									customSupportPrompts?: Record<string, string | undefined> | undefined
									enhancementApiConfigId?: string | undefined
									includeTaskHistoryInEnhance?: boolean | undefined
									historyPreviewCollapsed?: boolean | undefined
									reasoningBlockCollapsed?: boolean | undefined
									enterBehavior?: "send" | "newline" | undefined
									profileThresholds?: Record<string, number> | undefined
									hasOpenedModeSelector?: boolean | undefined
									lastModeExportPath?: string | undefined
									lastModeImportPath?: string | undefined
									lastSettingsExportPath?: string | undefined
									lastTaskExportPath?: string | undefined
									lastImageSavePath?: string | undefined
									worktreeAutoOpenPath?: string | undefined
									showWorktreesInHomeScreen?: boolean | undefined
									disabledTools?:
										| (
												| "apply_patch"
												| "apply_diff"
												| "write_to_file"
												| "search_replace"
												| "search_and_replace"
												| "edit"
												| "execute_command"
												| "read_file"
												| "read_command_output"
												| "edit_file"
												| "search_files"
												| "list_files"
												| "use_mcp_tool"
												| "access_mcp_resource"
												| "ask_followup_question"
												| "attempt_completion"
												| "switch_mode"
												| "new_task"
												| "codebase_search"
												| "update_todo_list"
												| "run_slash_command"
												| "skill"
												| "generate_image"
												| "custom_tool"
										  )[]
										| undefined
								}
								images?: string[] | undefined
								newTab?: boolean | undefined
							}
					  }
					| {
							commandName: TaskCommandName.CancelTask
					  }
					| {
							commandName: TaskCommandName.CloseTask
					  }
					| {
							commandName: TaskCommandName.ResumeTask
							data: string
					  }
					| {
							commandName: TaskCommandName.SendMessage
							data: {
								text?: string | undefined
								images?: string[] | undefined
							}
					  }
					| {
							commandName: TaskCommandName.GetCommands
					  }
					| {
							commandName: TaskCommandName.GetModes
					  }
					| {
							commandName: TaskCommandName.GetModels
					  }
					| {
							commandName: TaskCommandName.DeleteQueuedMessage
							data: string
					  }
				origin: IpcOrigin.Client
			},
			{
				type: IpcMessageType.TaskCommand
				clientId: string
				data:
					| {
							commandName: TaskCommandName.StartNewTask
							data: {
								text: string
								configuration: {
									codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
									codebaseIndexOpenAiCompatibleModelDimension?: number | undefined
									codeIndexOpenAiKey?: string | undefined
									codeIndexQdrantApiKey?: string | undefined
									codebaseIndexOpenAiCompatibleApiKey?: string | undefined
									codebaseIndexGeminiApiKey?: string | undefined
									codebaseIndexMistralApiKey?: string | undefined
									codebaseIndexVercelAiGatewayApiKey?: string | undefined
									codebaseIndexOpenRouterApiKey?: string | undefined
									reasoningEffort?:
										| "disable"
										| "none"
										| "minimal"
										| "low"
										| "medium"
										| "high"
										| "xhigh"
										| undefined
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
													| (
															| "disable"
															| "none"
															| "minimal"
															| "low"
															| "medium"
															| "high"
															| "xhigh"
													  )[]
													| undefined
												requiredReasoningEffort?: boolean | undefined
												preserveReasoning?: boolean | undefined
												supportedParameters?:
													| (
															| "reasoning"
															| "max_tokens"
															| "temperature"
															| "include_reasoning"
													  )[]
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
															appliesToServiceTiers?:
																| ("default" | "flex" | "priority")[]
																| undefined
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
									moonshotBaseUrl?:
										| "https://api.moonshot.ai/v1"
										| "https://api.moonshot.cn/v1"
										| undefined
									moonshotApiKey?: string | undefined
									minimaxBaseUrl?:
										| "https://api.minimax.io/v1"
										| "https://api.minimaxi.com/v1"
										| undefined
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
									zaiApiLine?:
										| "international_coding"
										| "china_coding"
										| "international_api"
										| "china_api"
										| undefined
									fireworksApiKey?: string | undefined
									qwenCodeOauthPath?: string | undefined
									vercelAiGatewayApiKey?: string | undefined
									vercelAiGatewayModelId?: string | undefined
									basetenApiKey?: string | undefined
									nvidiaNimApiKey?: string | undefined
									nvidiaNimBaseUrl?: string | undefined
									mode?: string | undefined
									customInstructions?: string | undefined
									customModes?:
										| {
												name: string
												slug: string
												roleDefinition: string
												groups: (
													| "command"
													| "read"
													| "edit"
													| "mcp"
													| "modes"
													| [
															"command" | "read" | "edit" | "mcp" | "modes",
															{
																description?: string | undefined
																fileRegex?: string | undefined
															},
													  ]
												)[]
												description?: string | undefined
												source?: "global" | "project" | undefined
												whenToUse?: string | undefined
												customInstructions?: string | undefined
										  }[]
										| undefined
									currentApiConfigName?: string | undefined
									listApiConfigMeta?:
										| {
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
										  }[]
										| undefined
									pinnedApiConfigs?: Record<string, boolean> | undefined
									lastShownAnnouncementId?: string | undefined
									taskHistory?:
										| {
												number: number
												ts: number
												totalCost: number
												id: string
												task: string
												tokensIn: number
												tokensOut: number
												status?: "active" | "completed" | "delegated" | undefined
												rootTaskId?: string | undefined
												parentTaskId?: string | undefined
												cacheWrites?: number | undefined
												cacheReads?: number | undefined
												size?: number | undefined
												workspace?: string | undefined
												mode?: string | undefined
												apiConfigName?: string | undefined
												delegatedToId?: string | undefined
												childIds?: string[] | undefined
												awaitingChildId?: string | undefined
												completedByChildId?: string | undefined
												completionResultSummary?: string | undefined
										  }[]
										| undefined
									dismissedUpsells?: string[] | undefined
									imageGenerationProvider?: "openrouter" | undefined
									openRouterImageApiKey?: string | undefined
									openRouterImageGenerationSelectedModel?: string | undefined
									customCondensingPrompt?: string | undefined
									autoApprovalEnabled?: boolean | undefined
									alwaysAllowReadOnly?: boolean | undefined
									alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
									alwaysAllowWrite?: boolean | undefined
									alwaysAllowWriteOutsideWorkspace?: boolean | undefined
									alwaysAllowWriteProtected?: boolean | undefined
									writeDelayMs?: number | undefined
									requestDelaySeconds?: number | undefined
									alwaysAllowMcp?: boolean | undefined
									alwaysAllowModeSwitch?: boolean | undefined
									alwaysAllowSubtasks?: boolean | undefined
									alwaysAllowExecute?: boolean | undefined
									alwaysAllowFollowupQuestions?: boolean | undefined
									followupAutoApproveTimeoutMs?: number | undefined
									allowedCommands?: string[] | undefined
									deniedCommands?: string[] | undefined
									commandExecutionTimeout?: number | undefined
									commandTimeoutAllowlist?: string[] | undefined
									preventCompletionWithOpenTodos?: boolean | undefined
									allowedMaxRequests?: number | null | undefined
									allowedMaxCost?: number | null | undefined
									autoCondenseContext?: boolean | undefined
									autoCondenseContextPercent?: number | undefined
									includeCurrentTime?: boolean | undefined
									includeCurrentCost?: boolean | undefined
									maxGitStatusFiles?: number | undefined
									includeDiagnosticMessages?: boolean | undefined
									maxDiagnosticMessages?: number | undefined
									enableCheckpoints?: boolean | undefined
									checkpointTimeout?: number | undefined
									ttsEnabled?: boolean | undefined
									ttsSpeed?: number | undefined
									soundEnabled?: boolean | undefined
									soundVolume?: number | undefined
									maxOpenTabsContext?: number | undefined
									maxWorkspaceFiles?: number | undefined
									showAliIgnoredFiles?: boolean | undefined
									enableSubfolderRules?: boolean | undefined
									maxImageFileSize?: number | undefined
									maxTotalImageSize?: number | undefined
									terminalOutputPreviewSize?: "medium" | "small" | "large" | undefined
									terminalShellIntegrationTimeout?: number | undefined
									terminalShellIntegrationDisabled?: boolean | undefined
									terminalCommandDelay?: number | undefined
									terminalPowershellCounter?: boolean | undefined
									terminalZshClearEolMark?: boolean | undefined
									terminalZshOhMy?: boolean | undefined
									terminalZshP10k?: boolean | undefined
									terminalZdotdir?: boolean | undefined
									execaShellPath?: string | undefined
									diagnosticsEnabled?: boolean | undefined
									experiments?:
										| {
												preventFocusDisruption?: boolean | undefined
												imageGeneration?: boolean | undefined
												runSlashCommand?: boolean | undefined
												customTools?: boolean | undefined
										  }
										| undefined
									codebaseIndexModels?:
										| {
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
										| undefined
									codebaseIndexConfig?:
										| {
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
										| undefined
									language?:
										| "id"
										| "ca"
										| "de"
										| "en"
										| "es"
										| "fr"
										| "hi"
										| "it"
										| "ja"
										| "ko"
										| "nl"
										| "pl"
										| "pt-BR"
										| "ru"
										| "tr"
										| "vi"
										| "zh-CN"
										| "zh-TW"
										| undefined
									mcpEnabled?: boolean | undefined
									modeApiConfigs?: Record<string, string> | undefined
									customModePrompts?:
										| Record<
												string,
												| {
														description?: string | undefined
														roleDefinition?: string | undefined
														whenToUse?: string | undefined
														customInstructions?: string | undefined
												  }
												| undefined
										  >
										| undefined
									customSupportPrompts?: Record<string, string | undefined> | undefined
									enhancementApiConfigId?: string | undefined
									includeTaskHistoryInEnhance?: boolean | undefined
									historyPreviewCollapsed?: boolean | undefined
									reasoningBlockCollapsed?: boolean | undefined
									enterBehavior?: "send" | "newline" | undefined
									profileThresholds?: Record<string, number> | undefined
									hasOpenedModeSelector?: boolean | undefined
									lastModeExportPath?: string | undefined
									lastModeImportPath?: string | undefined
									lastSettingsExportPath?: string | undefined
									lastTaskExportPath?: string | undefined
									lastImageSavePath?: string | undefined
									worktreeAutoOpenPath?: string | undefined
									showWorktreesInHomeScreen?: boolean | undefined
									disabledTools?:
										| (
												| "apply_patch"
												| "apply_diff"
												| "write_to_file"
												| "search_replace"
												| "search_and_replace"
												| "edit"
												| "execute_command"
												| "read_file"
												| "read_command_output"
												| "edit_file"
												| "search_files"
												| "list_files"
												| "use_mcp_tool"
												| "access_mcp_resource"
												| "ask_followup_question"
												| "attempt_completion"
												| "switch_mode"
												| "new_task"
												| "codebase_search"
												| "update_todo_list"
												| "run_slash_command"
												| "skill"
												| "generate_image"
												| "custom_tool"
										  )[]
										| undefined
								}
								images?: string[] | undefined
								newTab?: boolean | undefined
							}
					  }
					| {
							commandName: TaskCommandName.CancelTask
					  }
					| {
							commandName: TaskCommandName.CloseTask
					  }
					| {
							commandName: TaskCommandName.ResumeTask
							data: string
					  }
					| {
							commandName: TaskCommandName.SendMessage
							data: {
								text?: string | undefined
								images?: string[] | undefined
							}
					  }
					| {
							commandName: TaskCommandName.GetCommands
					  }
					| {
							commandName: TaskCommandName.GetModes
					  }
					| {
							commandName: TaskCommandName.GetModels
					  }
					| {
							commandName: TaskCommandName.DeleteQueuedMessage
							data: string
					  }
				origin: IpcOrigin.Client
			}
		>,
		z.ZodObject<
			{
				type: z.ZodLiteral<IpcMessageType.TaskEvent>
				origin: z.ZodLiteral<IpcOrigin.Server>
				relayClientId: z.ZodOptional<z.ZodString>
				data: z.ZodDiscriminatedUnion<
					"eventName",
					[
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskCreated>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskCreated
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskCreated
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskStarted>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskStarted
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskStarted
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskCompleted>
								payload: z.ZodTuple<
									[
										z.ZodString,
										z.ZodObject<
											{
												totalTokensIn: z.ZodNumber
												totalTokensOut: z.ZodNumber
												totalCacheWrites: z.ZodOptional<z.ZodNumber>
												totalCacheReads: z.ZodOptional<z.ZodNumber>
												totalCost: z.ZodNumber
												contextTokens: z.ZodNumber
											},
											"strip",
											z.ZodTypeAny,
											{
												totalTokensIn: number
												totalTokensOut: number
												totalCost: number
												contextTokens: number
												totalCacheWrites?: number | undefined
												totalCacheReads?: number | undefined
											},
											{
												totalTokensIn: number
												totalTokensOut: number
												totalCost: number
												contextTokens: number
												totalCacheWrites?: number | undefined
												totalCacheReads?: number | undefined
											}
										>,
										z.ZodRecord<
											z.ZodEnum<
												[
													"execute_command",
													"read_file",
													"read_command_output",
													"write_to_file",
													"apply_diff",
													"edit",
													"search_and_replace",
													"search_replace",
													"edit_file",
													"apply_patch",
													"search_files",
													"list_files",
													"use_mcp_tool",
													"access_mcp_resource",
													"ask_followup_question",
													"attempt_completion",
													"switch_mode",
													"new_task",
													"codebase_search",
													"update_todo_list",
													"run_slash_command",
													"skill",
													"generate_image",
													"custom_tool",
												]
											>,
											z.ZodObject<
												{
													attempts: z.ZodNumber
													failures: z.ZodNumber
												},
												"strip",
												z.ZodTypeAny,
												{
													attempts: number
													failures: number
												},
												{
													attempts: number
													failures: number
												}
											>
										>,
										z.ZodObject<
											{
												isSubtask: z.ZodBoolean
											},
											"strip",
											z.ZodTypeAny,
											{
												isSubtask: boolean
											},
											{
												isSubtask: boolean
											}
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskCompleted
								payload: [
									string,
									{
										totalTokensIn: number
										totalTokensOut: number
										totalCost: number
										contextTokens: number
										totalCacheWrites?: number | undefined
										totalCacheReads?: number | undefined
									},
									Partial<
										Record<
											| "apply_patch"
											| "apply_diff"
											| "write_to_file"
											| "search_replace"
											| "search_and_replace"
											| "edit"
											| "execute_command"
											| "read_file"
											| "read_command_output"
											| "edit_file"
											| "search_files"
											| "list_files"
											| "use_mcp_tool"
											| "access_mcp_resource"
											| "ask_followup_question"
											| "attempt_completion"
											| "switch_mode"
											| "new_task"
											| "codebase_search"
											| "update_todo_list"
											| "run_slash_command"
											| "skill"
											| "generate_image"
											| "custom_tool",
											{
												attempts: number
												failures: number
											}
										>
									>,
									{
										isSubtask: boolean
									},
								]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskCompleted
								payload: [
									string,
									{
										totalTokensIn: number
										totalTokensOut: number
										totalCost: number
										contextTokens: number
										totalCacheWrites?: number | undefined
										totalCacheReads?: number | undefined
									},
									Partial<
										Record<
											| "apply_patch"
											| "apply_diff"
											| "write_to_file"
											| "search_replace"
											| "search_and_replace"
											| "edit"
											| "execute_command"
											| "read_file"
											| "read_command_output"
											| "edit_file"
											| "search_files"
											| "list_files"
											| "use_mcp_tool"
											| "access_mcp_resource"
											| "ask_followup_question"
											| "attempt_completion"
											| "switch_mode"
											| "new_task"
											| "codebase_search"
											| "update_todo_list"
											| "run_slash_command"
											| "skill"
											| "generate_image"
											| "custom_tool",
											{
												attempts: number
												failures: number
											}
										>
									>,
									{
										isSubtask: boolean
									},
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskAborted>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskAborted
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskAborted
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskFocused>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskFocused
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskFocused
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskUnfocused>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskUnfocused
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskUnfocused
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskActive>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskActive
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskActive
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskInteractive>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskInteractive
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskInteractive
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskResumable>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskResumable
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskResumable
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskIdle>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskIdle
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskIdle
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskPaused>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskPaused
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskPaused
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskUnpaused>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskUnpaused
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskUnpaused
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskSpawned>
								payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskSpawned
								payload: [string, string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskSpawned
								payload: [string, string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskDelegated>
								payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskDelegated
								payload: [string, string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskDelegated
								payload: [string, string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskDelegationCompleted>
								payload: z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskDelegationCompleted
								payload: [string, string, string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskDelegationCompleted
								payload: [string, string, string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskDelegationResumed>
								payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskDelegationResumed
								payload: [string, string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskDelegationResumed
								payload: [string, string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.Message>
								payload: z.ZodTuple<
									[
										z.ZodObject<
											{
												taskId: z.ZodString
												action: z.ZodUnion<[z.ZodLiteral<"created">, z.ZodLiteral<"updated">]>
												message: z.ZodObject<
													{
														ts: z.ZodNumber
														type: z.ZodUnion<[z.ZodLiteral<"ask">, z.ZodLiteral<"say">]>
														ask: z.ZodOptional<
															z.ZodEnum<
																[
																	"followup",
																	"command",
																	"command_output",
																	"completion_result",
																	"tool",
																	"api_req_failed",
																	"resume_task",
																	"resume_completed_task",
																	"mistake_limit_reached",
																	"use_mcp_server",
																	"auto_approval_max_req_reached",
																]
															>
														>
														say: z.ZodOptional<
															z.ZodEnum<
																[
																	"error",
																	"api_req_started",
																	"api_req_finished",
																	"api_req_retried",
																	"api_req_retry_delayed",
																	"api_req_rate_limit_wait",
																	"api_req_deleted",
																	"text",
																	"image",
																	"reasoning",
																	"completion_result",
																	"user_feedback",
																	"user_feedback_diff",
																	"command_output",
																	"shell_integration_warning",
																	"mcp_server_request_started",
																	"mcp_server_response",
																	"subtask_result",
																	"checkpoint_saved",
																	"rooignore_error",
																	"diff_error",
																	"condense_context",
																	"condense_context_error",
																	"sliding_window_truncation",
																	"codebase_search_result",
																	"user_edit_todos",
																	"too_many_tools_warning",
																	"tool",
																]
															>
														>
														text: z.ZodOptional<z.ZodString>
														images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
														partial: z.ZodOptional<z.ZodBoolean>
														reasoning: z.ZodOptional<z.ZodString>
														conversationHistoryIndex: z.ZodOptional<z.ZodNumber>
														checkpoint: z.ZodOptional<
															z.ZodRecord<z.ZodString, z.ZodUnknown>
														>
														progressStatus: z.ZodOptional<
															z.ZodObject<
																{
																	icon: z.ZodOptional<z.ZodString>
																	text: z.ZodOptional<z.ZodString>
																},
																"strip",
																z.ZodTypeAny,
																{
																	text?: string | undefined
																	icon?: string | undefined
																},
																{
																	text?: string | undefined
																	icon?: string | undefined
																}
															>
														>
														contextCondense: z.ZodOptional<
															z.ZodObject<
																{
																	cost: z.ZodNumber
																	prevContextTokens: z.ZodNumber
																	newContextTokens: z.ZodNumber
																	summary: z.ZodString
																	condenseId: z.ZodOptional<z.ZodString>
																},
																"strip",
																z.ZodTypeAny,
																{
																	cost: number
																	prevContextTokens: number
																	newContextTokens: number
																	summary: string
																	condenseId?: string | undefined
																},
																{
																	cost: number
																	prevContextTokens: number
																	newContextTokens: number
																	summary: string
																	condenseId?: string | undefined
																}
															>
														>
														contextTruncation: z.ZodOptional<
															z.ZodObject<
																{
																	truncationId: z.ZodString
																	messagesRemoved: z.ZodNumber
																	prevContextTokens: z.ZodNumber
																	newContextTokens: z.ZodNumber
																},
																"strip",
																z.ZodTypeAny,
																{
																	prevContextTokens: number
																	newContextTokens: number
																	truncationId: string
																	messagesRemoved: number
																},
																{
																	prevContextTokens: number
																	newContextTokens: number
																	truncationId: string
																	messagesRemoved: number
																}
															>
														>
														isProtected: z.ZodOptional<z.ZodBoolean>
														apiProtocol: z.ZodOptional<
															z.ZodUnion<
																[z.ZodLiteral<"openai">, z.ZodLiteral<"anthropic">]
															>
														>
														isAnswered: z.ZodOptional<z.ZodBoolean>
													},
													"strip",
													z.ZodTypeAny,
													{
														type: "ask" | "say"
														ts: number
														text?: string | undefined
														reasoning?: string | undefined
														ask?:
															| "followup"
															| "command"
															| "command_output"
															| "completion_result"
															| "tool"
															| "api_req_failed"
															| "resume_task"
															| "resume_completed_task"
															| "mistake_limit_reached"
															| "use_mcp_server"
															| "auto_approval_max_req_reached"
															| undefined
														say?:
															| "command_output"
															| "completion_result"
															| "tool"
															| "error"
															| "api_req_started"
															| "api_req_finished"
															| "api_req_retried"
															| "api_req_retry_delayed"
															| "api_req_rate_limit_wait"
															| "api_req_deleted"
															| "text"
															| "image"
															| "reasoning"
															| "user_feedback"
															| "user_feedback_diff"
															| "shell_integration_warning"
															| "mcp_server_request_started"
															| "mcp_server_response"
															| "subtask_result"
															| "checkpoint_saved"
															| "rooignore_error"
															| "diff_error"
															| "condense_context"
															| "condense_context_error"
															| "sliding_window_truncation"
															| "codebase_search_result"
															| "user_edit_todos"
															| "too_many_tools_warning"
															| undefined
														images?: string[] | undefined
														partial?: boolean | undefined
														conversationHistoryIndex?: number | undefined
														checkpoint?: Record<string, unknown> | undefined
														progressStatus?:
															| {
																	text?: string | undefined
																	icon?: string | undefined
															  }
															| undefined
														contextCondense?:
															| {
																	cost: number
																	prevContextTokens: number
																	newContextTokens: number
																	summary: string
																	condenseId?: string | undefined
															  }
															| undefined
														contextTruncation?:
															| {
																	prevContextTokens: number
																	newContextTokens: number
																	truncationId: string
																	messagesRemoved: number
															  }
															| undefined
														isProtected?: boolean | undefined
														apiProtocol?: "openai" | "anthropic" | undefined
														isAnswered?: boolean | undefined
													},
													{
														type: "ask" | "say"
														ts: number
														text?: string | undefined
														reasoning?: string | undefined
														ask?:
															| "followup"
															| "command"
															| "command_output"
															| "completion_result"
															| "tool"
															| "api_req_failed"
															| "resume_task"
															| "resume_completed_task"
															| "mistake_limit_reached"
															| "use_mcp_server"
															| "auto_approval_max_req_reached"
															| undefined
														say?:
															| "command_output"
															| "completion_result"
															| "tool"
															| "error"
															| "api_req_started"
															| "api_req_finished"
															| "api_req_retried"
															| "api_req_retry_delayed"
															| "api_req_rate_limit_wait"
															| "api_req_deleted"
															| "text"
															| "image"
															| "reasoning"
															| "user_feedback"
															| "user_feedback_diff"
															| "shell_integration_warning"
															| "mcp_server_request_started"
															| "mcp_server_response"
															| "subtask_result"
															| "checkpoint_saved"
															| "rooignore_error"
															| "diff_error"
															| "condense_context"
															| "condense_context_error"
															| "sliding_window_truncation"
															| "codebase_search_result"
															| "user_edit_todos"
															| "too_many_tools_warning"
															| undefined
														images?: string[] | undefined
														partial?: boolean | undefined
														conversationHistoryIndex?: number | undefined
														checkpoint?: Record<string, unknown> | undefined
														progressStatus?:
															| {
																	text?: string | undefined
																	icon?: string | undefined
															  }
															| undefined
														contextCondense?:
															| {
																	cost: number
																	prevContextTokens: number
																	newContextTokens: number
																	summary: string
																	condenseId?: string | undefined
															  }
															| undefined
														contextTruncation?:
															| {
																	prevContextTokens: number
																	newContextTokens: number
																	truncationId: string
																	messagesRemoved: number
															  }
															| undefined
														isProtected?: boolean | undefined
														apiProtocol?: "openai" | "anthropic" | undefined
														isAnswered?: boolean | undefined
													}
												>
											},
											"strip",
											z.ZodTypeAny,
											{
												message: {
													type: "ask" | "say"
													ts: number
													text?: string | undefined
													reasoning?: string | undefined
													ask?:
														| "followup"
														| "command"
														| "command_output"
														| "completion_result"
														| "tool"
														| "api_req_failed"
														| "resume_task"
														| "resume_completed_task"
														| "mistake_limit_reached"
														| "use_mcp_server"
														| "auto_approval_max_req_reached"
														| undefined
													say?:
														| "command_output"
														| "completion_result"
														| "tool"
														| "error"
														| "api_req_started"
														| "api_req_finished"
														| "api_req_retried"
														| "api_req_retry_delayed"
														| "api_req_rate_limit_wait"
														| "api_req_deleted"
														| "text"
														| "image"
														| "reasoning"
														| "user_feedback"
														| "user_feedback_diff"
														| "shell_integration_warning"
														| "mcp_server_request_started"
														| "mcp_server_response"
														| "subtask_result"
														| "checkpoint_saved"
														| "rooignore_error"
														| "diff_error"
														| "condense_context"
														| "condense_context_error"
														| "sliding_window_truncation"
														| "codebase_search_result"
														| "user_edit_todos"
														| "too_many_tools_warning"
														| undefined
													images?: string[] | undefined
													partial?: boolean | undefined
													conversationHistoryIndex?: number | undefined
													checkpoint?: Record<string, unknown> | undefined
													progressStatus?:
														| {
																text?: string | undefined
																icon?: string | undefined
														  }
														| undefined
													contextCondense?:
														| {
																cost: number
																prevContextTokens: number
																newContextTokens: number
																summary: string
																condenseId?: string | undefined
														  }
														| undefined
													contextTruncation?:
														| {
																prevContextTokens: number
																newContextTokens: number
																truncationId: string
																messagesRemoved: number
														  }
														| undefined
													isProtected?: boolean | undefined
													apiProtocol?: "openai" | "anthropic" | undefined
													isAnswered?: boolean | undefined
												}
												taskId: string
												action: "created" | "updated"
											},
											{
												message: {
													type: "ask" | "say"
													ts: number
													text?: string | undefined
													reasoning?: string | undefined
													ask?:
														| "followup"
														| "command"
														| "command_output"
														| "completion_result"
														| "tool"
														| "api_req_failed"
														| "resume_task"
														| "resume_completed_task"
														| "mistake_limit_reached"
														| "use_mcp_server"
														| "auto_approval_max_req_reached"
														| undefined
													say?:
														| "command_output"
														| "completion_result"
														| "tool"
														| "error"
														| "api_req_started"
														| "api_req_finished"
														| "api_req_retried"
														| "api_req_retry_delayed"
														| "api_req_rate_limit_wait"
														| "api_req_deleted"
														| "text"
														| "image"
														| "reasoning"
														| "user_feedback"
														| "user_feedback_diff"
														| "shell_integration_warning"
														| "mcp_server_request_started"
														| "mcp_server_response"
														| "subtask_result"
														| "checkpoint_saved"
														| "rooignore_error"
														| "diff_error"
														| "condense_context"
														| "condense_context_error"
														| "sliding_window_truncation"
														| "codebase_search_result"
														| "user_edit_todos"
														| "too_many_tools_warning"
														| undefined
													images?: string[] | undefined
													partial?: boolean | undefined
													conversationHistoryIndex?: number | undefined
													checkpoint?: Record<string, unknown> | undefined
													progressStatus?:
														| {
																text?: string | undefined
																icon?: string | undefined
														  }
														| undefined
													contextCondense?:
														| {
																cost: number
																prevContextTokens: number
																newContextTokens: number
																summary: string
																condenseId?: string | undefined
														  }
														| undefined
													contextTruncation?:
														| {
																prevContextTokens: number
																newContextTokens: number
																truncationId: string
																messagesRemoved: number
														  }
														| undefined
													isProtected?: boolean | undefined
													apiProtocol?: "openai" | "anthropic" | undefined
													isAnswered?: boolean | undefined
												}
												taskId: string
												action: "created" | "updated"
											}
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.Message
								payload: [
									{
										message: {
											type: "ask" | "say"
											ts: number
											text?: string | undefined
											reasoning?: string | undefined
											ask?:
												| "followup"
												| "command"
												| "command_output"
												| "completion_result"
												| "tool"
												| "api_req_failed"
												| "resume_task"
												| "resume_completed_task"
												| "mistake_limit_reached"
												| "use_mcp_server"
												| "auto_approval_max_req_reached"
												| undefined
											say?:
												| "command_output"
												| "completion_result"
												| "tool"
												| "error"
												| "api_req_started"
												| "api_req_finished"
												| "api_req_retried"
												| "api_req_retry_delayed"
												| "api_req_rate_limit_wait"
												| "api_req_deleted"
												| "text"
												| "image"
												| "reasoning"
												| "user_feedback"
												| "user_feedback_diff"
												| "shell_integration_warning"
												| "mcp_server_request_started"
												| "mcp_server_response"
												| "subtask_result"
												| "checkpoint_saved"
												| "rooignore_error"
												| "diff_error"
												| "condense_context"
												| "condense_context_error"
												| "sliding_window_truncation"
												| "codebase_search_result"
												| "user_edit_todos"
												| "too_many_tools_warning"
												| undefined
											images?: string[] | undefined
											partial?: boolean | undefined
											conversationHistoryIndex?: number | undefined
											checkpoint?: Record<string, unknown> | undefined
											progressStatus?:
												| {
														text?: string | undefined
														icon?: string | undefined
												  }
												| undefined
											contextCondense?:
												| {
														cost: number
														prevContextTokens: number
														newContextTokens: number
														summary: string
														condenseId?: string | undefined
												  }
												| undefined
											contextTruncation?:
												| {
														prevContextTokens: number
														newContextTokens: number
														truncationId: string
														messagesRemoved: number
												  }
												| undefined
											isProtected?: boolean | undefined
											apiProtocol?: "openai" | "anthropic" | undefined
											isAnswered?: boolean | undefined
										}
										taskId: string
										action: "created" | "updated"
									},
								]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.Message
								payload: [
									{
										message: {
											type: "ask" | "say"
											ts: number
											text?: string | undefined
											reasoning?: string | undefined
											ask?:
												| "followup"
												| "command"
												| "command_output"
												| "completion_result"
												| "tool"
												| "api_req_failed"
												| "resume_task"
												| "resume_completed_task"
												| "mistake_limit_reached"
												| "use_mcp_server"
												| "auto_approval_max_req_reached"
												| undefined
											say?:
												| "command_output"
												| "completion_result"
												| "tool"
												| "error"
												| "api_req_started"
												| "api_req_finished"
												| "api_req_retried"
												| "api_req_retry_delayed"
												| "api_req_rate_limit_wait"
												| "api_req_deleted"
												| "text"
												| "image"
												| "reasoning"
												| "user_feedback"
												| "user_feedback_diff"
												| "shell_integration_warning"
												| "mcp_server_request_started"
												| "mcp_server_response"
												| "subtask_result"
												| "checkpoint_saved"
												| "rooignore_error"
												| "diff_error"
												| "condense_context"
												| "condense_context_error"
												| "sliding_window_truncation"
												| "codebase_search_result"
												| "user_edit_todos"
												| "too_many_tools_warning"
												| undefined
											images?: string[] | undefined
											partial?: boolean | undefined
											conversationHistoryIndex?: number | undefined
											checkpoint?: Record<string, unknown> | undefined
											progressStatus?:
												| {
														text?: string | undefined
														icon?: string | undefined
												  }
												| undefined
											contextCondense?:
												| {
														cost: number
														prevContextTokens: number
														newContextTokens: number
														summary: string
														condenseId?: string | undefined
												  }
												| undefined
											contextTruncation?:
												| {
														prevContextTokens: number
														newContextTokens: number
														truncationId: string
														messagesRemoved: number
												  }
												| undefined
											isProtected?: boolean | undefined
											apiProtocol?: "openai" | "anthropic" | undefined
											isAnswered?: boolean | undefined
										}
										taskId: string
										action: "created" | "updated"
									},
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskModeSwitched>
								payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskModeSwitched
								payload: [string, string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskModeSwitched
								payload: [string, string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskAskResponded>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskAskResponded
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskAskResponded
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.QueuedMessagesUpdated>
								payload: z.ZodTuple<
									[
										z.ZodString,
										z.ZodArray<
											z.ZodObject<
												{
													timestamp: z.ZodNumber
													id: z.ZodString
													text: z.ZodString
													images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
												},
												"strip",
												z.ZodTypeAny,
												{
													text: string
													timestamp: number
													id: string
													images?: string[] | undefined
												},
												{
													text: string
													timestamp: number
													id: string
													images?: string[] | undefined
												}
											>,
											"many"
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.QueuedMessagesUpdated
								payload: [
									string,
									{
										text: string
										timestamp: number
										id: string
										images?: string[] | undefined
									}[],
								]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.QueuedMessagesUpdated
								payload: [
									string,
									{
										text: string
										timestamp: number
										id: string
										images?: string[] | undefined
									}[],
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskToolFailed>
								payload: z.ZodTuple<
									[
										z.ZodString,
										z.ZodEnum<
											[
												"execute_command",
												"read_file",
												"read_command_output",
												"write_to_file",
												"apply_diff",
												"edit",
												"search_and_replace",
												"search_replace",
												"edit_file",
												"apply_patch",
												"search_files",
												"list_files",
												"use_mcp_tool",
												"access_mcp_resource",
												"ask_followup_question",
												"attempt_completion",
												"switch_mode",
												"new_task",
												"codebase_search",
												"update_todo_list",
												"run_slash_command",
												"skill",
												"generate_image",
												"custom_tool",
											]
										>,
										z.ZodString,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskToolFailed
								payload: [
									string,
									(
										| "apply_patch"
										| "apply_diff"
										| "write_to_file"
										| "search_replace"
										| "search_and_replace"
										| "edit"
										| "execute_command"
										| "read_file"
										| "read_command_output"
										| "edit_file"
										| "search_files"
										| "list_files"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "new_task"
										| "codebase_search"
										| "update_todo_list"
										| "run_slash_command"
										| "skill"
										| "generate_image"
										| "custom_tool"
									),
									string,
								]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskToolFailed
								payload: [
									string,
									(
										| "apply_patch"
										| "apply_diff"
										| "write_to_file"
										| "search_replace"
										| "search_and_replace"
										| "edit"
										| "execute_command"
										| "read_file"
										| "read_command_output"
										| "edit_file"
										| "search_files"
										| "list_files"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "new_task"
										| "codebase_search"
										| "update_todo_list"
										| "run_slash_command"
										| "skill"
										| "generate_image"
										| "custom_tool"
									),
									string,
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.TaskTokenUsageUpdated>
								payload: z.ZodTuple<
									[
										z.ZodString,
										z.ZodObject<
											{
												totalTokensIn: z.ZodNumber
												totalTokensOut: z.ZodNumber
												totalCacheWrites: z.ZodOptional<z.ZodNumber>
												totalCacheReads: z.ZodOptional<z.ZodNumber>
												totalCost: z.ZodNumber
												contextTokens: z.ZodNumber
											},
											"strip",
											z.ZodTypeAny,
											{
												totalTokensIn: number
												totalTokensOut: number
												totalCost: number
												contextTokens: number
												totalCacheWrites?: number | undefined
												totalCacheReads?: number | undefined
											},
											{
												totalTokensIn: number
												totalTokensOut: number
												totalCost: number
												contextTokens: number
												totalCacheWrites?: number | undefined
												totalCacheReads?: number | undefined
											}
										>,
										z.ZodRecord<
											z.ZodEnum<
												[
													"execute_command",
													"read_file",
													"read_command_output",
													"write_to_file",
													"apply_diff",
													"edit",
													"search_and_replace",
													"search_replace",
													"edit_file",
													"apply_patch",
													"search_files",
													"list_files",
													"use_mcp_tool",
													"access_mcp_resource",
													"ask_followup_question",
													"attempt_completion",
													"switch_mode",
													"new_task",
													"codebase_search",
													"update_todo_list",
													"run_slash_command",
													"skill",
													"generate_image",
													"custom_tool",
												]
											>,
											z.ZodObject<
												{
													attempts: z.ZodNumber
													failures: z.ZodNumber
												},
												"strip",
												z.ZodTypeAny,
												{
													attempts: number
													failures: number
												},
												{
													attempts: number
													failures: number
												}
											>
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.TaskTokenUsageUpdated
								payload: [
									string,
									{
										totalTokensIn: number
										totalTokensOut: number
										totalCost: number
										contextTokens: number
										totalCacheWrites?: number | undefined
										totalCacheReads?: number | undefined
									},
									Partial<
										Record<
											| "apply_patch"
											| "apply_diff"
											| "write_to_file"
											| "search_replace"
											| "search_and_replace"
											| "edit"
											| "execute_command"
											| "read_file"
											| "read_command_output"
											| "edit_file"
											| "search_files"
											| "list_files"
											| "use_mcp_tool"
											| "access_mcp_resource"
											| "ask_followup_question"
											| "attempt_completion"
											| "switch_mode"
											| "new_task"
											| "codebase_search"
											| "update_todo_list"
											| "run_slash_command"
											| "skill"
											| "generate_image"
											| "custom_tool",
											{
												attempts: number
												failures: number
											}
										>
									>,
								]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.TaskTokenUsageUpdated
								payload: [
									string,
									{
										totalTokensIn: number
										totalTokensOut: number
										totalCost: number
										contextTokens: number
										totalCacheWrites?: number | undefined
										totalCacheReads?: number | undefined
									},
									Partial<
										Record<
											| "apply_patch"
											| "apply_diff"
											| "write_to_file"
											| "search_replace"
											| "search_and_replace"
											| "edit"
											| "execute_command"
											| "read_file"
											| "read_command_output"
											| "edit_file"
											| "search_files"
											| "list_files"
											| "use_mcp_tool"
											| "access_mcp_resource"
											| "ask_followup_question"
											| "attempt_completion"
											| "switch_mode"
											| "new_task"
											| "codebase_search"
											| "update_todo_list"
											| "run_slash_command"
											| "skill"
											| "generate_image"
											| "custom_tool",
											{
												attempts: number
												failures: number
											}
										>
									>,
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.CommandsResponse>
								payload: z.ZodTuple<
									[
										z.ZodArray<
											z.ZodObject<
												{
													name: z.ZodString
													source: z.ZodEnum<["global", "project", "built-in"]>
													filePath: z.ZodOptional<z.ZodString>
													description: z.ZodOptional<z.ZodString>
													argumentHint: z.ZodOptional<z.ZodString>
												},
												"strip",
												z.ZodTypeAny,
												{
													name: string
													source: "global" | "project" | "built-in"
													description?: string | undefined
													filePath?: string | undefined
													argumentHint?: string | undefined
												},
												{
													name: string
													source: "global" | "project" | "built-in"
													description?: string | undefined
													filePath?: string | undefined
													argumentHint?: string | undefined
												}
											>,
											"many"
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.CommandsResponse
								payload: [
									{
										name: string
										source: "global" | "project" | "built-in"
										description?: string | undefined
										filePath?: string | undefined
										argumentHint?: string | undefined
									}[],
								]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.CommandsResponse
								payload: [
									{
										name: string
										source: "global" | "project" | "built-in"
										description?: string | undefined
										filePath?: string | undefined
										argumentHint?: string | undefined
									}[],
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.ModesResponse>
								payload: z.ZodTuple<
									[
										z.ZodArray<
											z.ZodObject<
												{
													slug: z.ZodString
													name: z.ZodString
												},
												"strip",
												z.ZodTypeAny,
												{
													name: string
													slug: string
												},
												{
													name: string
													slug: string
												}
											>,
											"many"
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.ModesResponse
								payload: [
									{
										name: string
										slug: string
									}[],
								]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.ModesResponse
								payload: [
									{
										name: string
										slug: string
									}[],
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<import("./events.js").RooCodeEventName.ModelsResponse>
								payload: z.ZodTuple<
									[
										z.ZodRecord<
											z.ZodString,
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
																		[
																			"disable",
																			"none",
																			"minimal",
																			"low",
																			"medium",
																			"high",
																			"xhigh",
																		]
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
															z.ZodEnum<
																[
																	"max_tokens",
																	"temperature",
																	"reasoning",
																	"include_reasoning",
																]
															>,
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
																	z.ZodArray<
																		z.ZodEnum<["default", "flex", "priority"]>,
																		"many"
																	>
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
																appliesToServiceTiers?:
																	| ("default" | "flex" | "priority")[]
																	| undefined
															},
															{
																thresholdTokens: number
																inputPriceMultiplier?: number | undefined
																outputPriceMultiplier?: number | undefined
																cacheWritesPriceMultiplier?: number | undefined
																cacheReadsPriceMultiplier?: number | undefined
																appliesToServiceTiers?:
																	| ("default" | "flex" | "priority")[]
																	| undefined
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
																	name: z.ZodOptional<
																		z.ZodEnum<["default", "flex", "priority"]>
																	>
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
														| (
																| "disable"
																| "none"
																| "minimal"
																| "low"
																| "medium"
																| "high"
																| "xhigh"
														  )[]
														| undefined
													requiredReasoningEffort?: boolean | undefined
													preserveReasoning?: boolean | undefined
													supportedParameters?:
														| (
																| "reasoning"
																| "max_tokens"
																| "temperature"
																| "include_reasoning"
														  )[]
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
																appliesToServiceTiers?:
																	| ("default" | "flex" | "priority")[]
																	| undefined
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
														| (
																| "disable"
																| "none"
																| "minimal"
																| "low"
																| "medium"
																| "high"
																| "xhigh"
														  )[]
														| undefined
													requiredReasoningEffort?: boolean | undefined
													preserveReasoning?: boolean | undefined
													supportedParameters?:
														| (
																| "reasoning"
																| "max_tokens"
																| "temperature"
																| "include_reasoning"
														  )[]
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
																appliesToServiceTiers?:
																	| ("default" | "flex" | "priority")[]
																	| undefined
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
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: import("./events.js").RooCodeEventName.ModelsResponse
								payload: [
									Record<
										string,
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
												| (
														| "disable"
														| "none"
														| "minimal"
														| "low"
														| "medium"
														| "high"
														| "xhigh"
												  )[]
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
														appliesToServiceTiers?:
															| ("default" | "flex" | "priority")[]
															| undefined
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
									>,
								]
								taskId?: number | undefined
							},
							{
								eventName: import("./events.js").RooCodeEventName.ModelsResponse
								payload: [
									Record<
										string,
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
												| (
														| "disable"
														| "none"
														| "minimal"
														| "low"
														| "medium"
														| "high"
														| "xhigh"
												  )[]
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
														appliesToServiceTiers?:
															| ("default" | "flex" | "priority")[]
															| undefined
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
									>,
								]
								taskId?: number | undefined
							}
						>,
					]
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				type: IpcMessageType.TaskEvent
				data:
					| {
							eventName: import("./events.js").RooCodeEventName.TaskCreated
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskStarted
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskCompleted
							payload: [
								string,
								{
									totalTokensIn: number
									totalTokensOut: number
									totalCost: number
									contextTokens: number
									totalCacheWrites?: number | undefined
									totalCacheReads?: number | undefined
								},
								Partial<
									Record<
										| "apply_patch"
										| "apply_diff"
										| "write_to_file"
										| "search_replace"
										| "search_and_replace"
										| "edit"
										| "execute_command"
										| "read_file"
										| "read_command_output"
										| "edit_file"
										| "search_files"
										| "list_files"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "new_task"
										| "codebase_search"
										| "update_todo_list"
										| "run_slash_command"
										| "skill"
										| "generate_image"
										| "custom_tool",
										{
											attempts: number
											failures: number
										}
									>
								>,
								{
									isSubtask: boolean
								},
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskAborted
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskFocused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskUnfocused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskActive
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskInteractive
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskResumable
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskIdle
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskPaused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskUnpaused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskSpawned
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskDelegated
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskDelegationCompleted
							payload: [string, string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskDelegationResumed
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.Message
							payload: [
								{
									message: {
										type: "ask" | "say"
										ts: number
										text?: string | undefined
										reasoning?: string | undefined
										ask?:
											| "followup"
											| "command"
											| "command_output"
											| "completion_result"
											| "tool"
											| "api_req_failed"
											| "resume_task"
											| "resume_completed_task"
											| "mistake_limit_reached"
											| "use_mcp_server"
											| "auto_approval_max_req_reached"
											| undefined
										say?:
											| "command_output"
											| "completion_result"
											| "tool"
											| "error"
											| "api_req_started"
											| "api_req_finished"
											| "api_req_retried"
											| "api_req_retry_delayed"
											| "api_req_rate_limit_wait"
											| "api_req_deleted"
											| "text"
											| "image"
											| "reasoning"
											| "user_feedback"
											| "user_feedback_diff"
											| "shell_integration_warning"
											| "mcp_server_request_started"
											| "mcp_server_response"
											| "subtask_result"
											| "checkpoint_saved"
											| "rooignore_error"
											| "diff_error"
											| "condense_context"
											| "condense_context_error"
											| "sliding_window_truncation"
											| "codebase_search_result"
											| "user_edit_todos"
											| "too_many_tools_warning"
											| undefined
										images?: string[] | undefined
										partial?: boolean | undefined
										conversationHistoryIndex?: number | undefined
										checkpoint?: Record<string, unknown> | undefined
										progressStatus?:
											| {
													text?: string | undefined
													icon?: string | undefined
											  }
											| undefined
										contextCondense?:
											| {
													cost: number
													prevContextTokens: number
													newContextTokens: number
													summary: string
													condenseId?: string | undefined
											  }
											| undefined
										contextTruncation?:
											| {
													prevContextTokens: number
													newContextTokens: number
													truncationId: string
													messagesRemoved: number
											  }
											| undefined
										isProtected?: boolean | undefined
										apiProtocol?: "openai" | "anthropic" | undefined
										isAnswered?: boolean | undefined
									}
									taskId: string
									action: "created" | "updated"
								},
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskModeSwitched
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskAskResponded
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.QueuedMessagesUpdated
							payload: [
								string,
								{
									text: string
									timestamp: number
									id: string
									images?: string[] | undefined
								}[],
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskToolFailed
							payload: [
								string,
								(
									| "apply_patch"
									| "apply_diff"
									| "write_to_file"
									| "search_replace"
									| "search_and_replace"
									| "edit"
									| "execute_command"
									| "read_file"
									| "read_command_output"
									| "edit_file"
									| "search_files"
									| "list_files"
									| "use_mcp_tool"
									| "access_mcp_resource"
									| "ask_followup_question"
									| "attempt_completion"
									| "switch_mode"
									| "new_task"
									| "codebase_search"
									| "update_todo_list"
									| "run_slash_command"
									| "skill"
									| "generate_image"
									| "custom_tool"
								),
								string,
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskTokenUsageUpdated
							payload: [
								string,
								{
									totalTokensIn: number
									totalTokensOut: number
									totalCost: number
									contextTokens: number
									totalCacheWrites?: number | undefined
									totalCacheReads?: number | undefined
								},
								Partial<
									Record<
										| "apply_patch"
										| "apply_diff"
										| "write_to_file"
										| "search_replace"
										| "search_and_replace"
										| "edit"
										| "execute_command"
										| "read_file"
										| "read_command_output"
										| "edit_file"
										| "search_files"
										| "list_files"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "new_task"
										| "codebase_search"
										| "update_todo_list"
										| "run_slash_command"
										| "skill"
										| "generate_image"
										| "custom_tool",
										{
											attempts: number
											failures: number
										}
									>
								>,
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.CommandsResponse
							payload: [
								{
									name: string
									source: "global" | "project" | "built-in"
									description?: string | undefined
									filePath?: string | undefined
									argumentHint?: string | undefined
								}[],
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.ModesResponse
							payload: [
								{
									name: string
									slug: string
								}[],
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.ModelsResponse
							payload: [
								Record<
									string,
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
													appliesToServiceTiers?:
														| ("default" | "flex" | "priority")[]
														| undefined
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
								>,
							]
							taskId?: number | undefined
					  }
				origin: IpcOrigin.Server
				relayClientId?: string | undefined
			},
			{
				type: IpcMessageType.TaskEvent
				data:
					| {
							eventName: import("./events.js").RooCodeEventName.TaskCreated
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskStarted
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskCompleted
							payload: [
								string,
								{
									totalTokensIn: number
									totalTokensOut: number
									totalCost: number
									contextTokens: number
									totalCacheWrites?: number | undefined
									totalCacheReads?: number | undefined
								},
								Partial<
									Record<
										| "apply_patch"
										| "apply_diff"
										| "write_to_file"
										| "search_replace"
										| "search_and_replace"
										| "edit"
										| "execute_command"
										| "read_file"
										| "read_command_output"
										| "edit_file"
										| "search_files"
										| "list_files"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "new_task"
										| "codebase_search"
										| "update_todo_list"
										| "run_slash_command"
										| "skill"
										| "generate_image"
										| "custom_tool",
										{
											attempts: number
											failures: number
										}
									>
								>,
								{
									isSubtask: boolean
								},
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskAborted
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskFocused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskUnfocused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskActive
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskInteractive
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskResumable
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskIdle
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskPaused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskUnpaused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskSpawned
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskDelegated
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskDelegationCompleted
							payload: [string, string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskDelegationResumed
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.Message
							payload: [
								{
									message: {
										type: "ask" | "say"
										ts: number
										text?: string | undefined
										reasoning?: string | undefined
										ask?:
											| "followup"
											| "command"
											| "command_output"
											| "completion_result"
											| "tool"
											| "api_req_failed"
											| "resume_task"
											| "resume_completed_task"
											| "mistake_limit_reached"
											| "use_mcp_server"
											| "auto_approval_max_req_reached"
											| undefined
										say?:
											| "command_output"
											| "completion_result"
											| "tool"
											| "error"
											| "api_req_started"
											| "api_req_finished"
											| "api_req_retried"
											| "api_req_retry_delayed"
											| "api_req_rate_limit_wait"
											| "api_req_deleted"
											| "text"
											| "image"
											| "reasoning"
											| "user_feedback"
											| "user_feedback_diff"
											| "shell_integration_warning"
											| "mcp_server_request_started"
											| "mcp_server_response"
											| "subtask_result"
											| "checkpoint_saved"
											| "rooignore_error"
											| "diff_error"
											| "condense_context"
											| "condense_context_error"
											| "sliding_window_truncation"
											| "codebase_search_result"
											| "user_edit_todos"
											| "too_many_tools_warning"
											| undefined
										images?: string[] | undefined
										partial?: boolean | undefined
										conversationHistoryIndex?: number | undefined
										checkpoint?: Record<string, unknown> | undefined
										progressStatus?:
											| {
													text?: string | undefined
													icon?: string | undefined
											  }
											| undefined
										contextCondense?:
											| {
													cost: number
													prevContextTokens: number
													newContextTokens: number
													summary: string
													condenseId?: string | undefined
											  }
											| undefined
										contextTruncation?:
											| {
													prevContextTokens: number
													newContextTokens: number
													truncationId: string
													messagesRemoved: number
											  }
											| undefined
										isProtected?: boolean | undefined
										apiProtocol?: "openai" | "anthropic" | undefined
										isAnswered?: boolean | undefined
									}
									taskId: string
									action: "created" | "updated"
								},
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskModeSwitched
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskAskResponded
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.QueuedMessagesUpdated
							payload: [
								string,
								{
									text: string
									timestamp: number
									id: string
									images?: string[] | undefined
								}[],
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskToolFailed
							payload: [
								string,
								(
									| "apply_patch"
									| "apply_diff"
									| "write_to_file"
									| "search_replace"
									| "search_and_replace"
									| "edit"
									| "execute_command"
									| "read_file"
									| "read_command_output"
									| "edit_file"
									| "search_files"
									| "list_files"
									| "use_mcp_tool"
									| "access_mcp_resource"
									| "ask_followup_question"
									| "attempt_completion"
									| "switch_mode"
									| "new_task"
									| "codebase_search"
									| "update_todo_list"
									| "run_slash_command"
									| "skill"
									| "generate_image"
									| "custom_tool"
								),
								string,
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.TaskTokenUsageUpdated
							payload: [
								string,
								{
									totalTokensIn: number
									totalTokensOut: number
									totalCost: number
									contextTokens: number
									totalCacheWrites?: number | undefined
									totalCacheReads?: number | undefined
								},
								Partial<
									Record<
										| "apply_patch"
										| "apply_diff"
										| "write_to_file"
										| "search_replace"
										| "search_and_replace"
										| "edit"
										| "execute_command"
										| "read_file"
										| "read_command_output"
										| "edit_file"
										| "search_files"
										| "list_files"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "new_task"
										| "codebase_search"
										| "update_todo_list"
										| "run_slash_command"
										| "skill"
										| "generate_image"
										| "custom_tool",
										{
											attempts: number
											failures: number
										}
									>
								>,
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.CommandsResponse
							payload: [
								{
									name: string
									source: "global" | "project" | "built-in"
									description?: string | undefined
									filePath?: string | undefined
									argumentHint?: string | undefined
								}[],
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.ModesResponse
							payload: [
								{
									name: string
									slug: string
								}[],
							]
							taskId?: number | undefined
					  }
					| {
							eventName: import("./events.js").RooCodeEventName.ModelsResponse
							payload: [
								Record<
									string,
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
													appliesToServiceTiers?:
														| ("default" | "flex" | "priority")[]
														| undefined
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
								>,
							]
							taskId?: number | undefined
					  }
				origin: IpcOrigin.Server
				relayClientId?: string | undefined
			}
		>,
	]
>
export type IpcMessage = z.infer<typeof ipcMessageSchema>
/**
 * IpcClientEvents
 */
export type IpcClientEvents = {
	[IpcMessageType.Connect]: []
	[IpcMessageType.Disconnect]: []
	[IpcMessageType.Ack]: [data: Ack]
	[IpcMessageType.TaskCommand]: [data: TaskCommand]
	[IpcMessageType.TaskEvent]: [data: TaskEvent]
}
/**
 * IpcServerEvents
 */
export type IpcServerEvents = {
	[IpcMessageType.Connect]: [clientId: string]
	[IpcMessageType.Disconnect]: [clientId: string]
	[IpcMessageType.TaskCommand]: [clientId: string, data: TaskCommand]
	[IpcMessageType.TaskEvent]: [relayClientId: string | undefined, data: TaskEvent]
}
//# sourceMappingURL=ipc.d.ts.map
