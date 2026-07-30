import * as vscode from "vscode"
import { ProviderSettingsManager } from "./ProviderSettingsManager"
import { ContextProxy } from "./ContextProxy"
import { CustomModesManager } from "./CustomModesManager"
export type ImportOptions = {
	providerSettingsManager: ProviderSettingsManager
	contextProxy: ContextProxy
	customModesManager: CustomModesManager
}
type ExportOptions = {
	providerSettingsManager: ProviderSettingsManager
	contextProxy: ContextProxy
}
type ImportWithProviderOptions = ImportOptions & {
	provider: {
		settingsImportedAt?: number
		postStateToWebview: () => Promise<void>
	}
}
/**
 * Imports configuration from a specific file path
 * Shares base functionality for import settings for both the manual
 * and automatic settings importing.
 *
 * Uses lenient parsing to handle invalid/removed providers gracefully:
 * - Invalid apiProvider values are removed (profile is kept but needs reconfiguration)
 * - Completely invalid profiles are skipped
 * - Warnings are returned for any issues encountered
 */
export declare function importSettingsFromPath(
	filePath: string,
	{ providerSettingsManager, contextProxy, customModesManager }: ImportOptions,
): Promise<
	| {
			success: boolean
			error: string
			providerProfiles?: undefined
			globalSettings?: undefined
			warnings?: undefined
	  }
	| {
			providerProfiles: {
				currentApiConfigName: string
				apiConfigs: {
					[x: string]: {
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
					}
				}
				modeApiConfigs: {
					[x: string]: string
				}
			}
			globalSettings: {
				rateLimitSeconds?: number | undefined
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
			success: boolean
			warnings: string[] | undefined
			error?: undefined
	  }
>
/**
 * Import settings from a file using a file dialog
 * @param options - Import options containing managers and proxy
 * @returns Promise resolving to import result
 */
export declare const importSettings: ({
	providerSettingsManager,
	contextProxy,
	customModesManager,
}: ImportOptions) => Promise<
	| {
			success: boolean
			error: string
			providerProfiles?: undefined
			globalSettings?: undefined
			warnings?: undefined
	  }
	| {
			providerProfiles: {
				currentApiConfigName: string
				apiConfigs: {
					[x: string]: {
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
					}
				}
				modeApiConfigs: {
					[x: string]: string
				}
			}
			globalSettings: {
				rateLimitSeconds?: number | undefined
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
			success: boolean
			warnings: string[] | undefined
			error?: undefined
	  }
>
/**
 * Import settings from a specific file
 * @param options - Import options containing managers and proxy
 * @param fileUri - URI of the file to import from
 * @returns Promise resolving to import result
 */
export declare const importSettingsFromFile: (
	{ providerSettingsManager, contextProxy, customModesManager }: ImportOptions,
	fileUri: vscode.Uri,
) => Promise<
	| {
			success: boolean
			error: string
			providerProfiles?: undefined
			globalSettings?: undefined
			warnings?: undefined
	  }
	| {
			providerProfiles: {
				currentApiConfigName: string
				apiConfigs: {
					[x: string]: {
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
					}
				}
				modeApiConfigs: {
					[x: string]: string
				}
			}
			globalSettings: {
				rateLimitSeconds?: number | undefined
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
			success: boolean
			warnings: string[] | undefined
			error?: undefined
	  }
>
export declare const exportSettings: ({ providerSettingsManager, contextProxy }: ExportOptions) => Promise<void>
/**
 * Import settings with complete UI feedback and provider state updates
 * @param options - Import options with provider instance
 * @param filePath - Optional file path to import from. If not provided, a file dialog will be shown.
 * @returns Promise that resolves when import is complete
 */
export declare const importSettingsWithFeedback: (
	{ providerSettingsManager, contextProxy, customModesManager, provider }: ImportWithProviderOptions,
	filePath?: string,
) => Promise<void>
export {}
//# sourceMappingURL=importExport.d.ts.map
