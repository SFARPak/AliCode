import { z } from "zod"
import { type Keys } from "./type-fu.js"
import { type ProviderSettings } from "./provider-settings.js"
/**
 * Default delay in milliseconds after writes to allow diagnostics to detect potential problems.
 * This delay is particularly important for Go and other languages where tools like goimports
 * need time to automatically clean up unused imports.
 */
export declare const DEFAULT_WRITE_DELAY_MS = 1000
/**
 * Terminal output preview size options for persisted command output.
 *
 * Controls how much command output is kept in memory as a "preview" before
 * the LLM decides to retrieve more via `read_command_output`. Larger previews
 * mean more immediate context but consume more of the context window.
 *
 * - `small`: 5KB preview - Best for long-running commands with verbose output
 * - `medium`: 10KB preview - Balanced default for most use cases
 * - `large`: 20KB preview - Best when commands produce critical info early
 *
 * @see OutputInterceptor - Uses this setting to determine when to spill to disk
 * @see PersistedCommandOutput - Contains the resulting preview and artifact reference
 */
export type TerminalOutputPreviewSize = "small" | "medium" | "large"
/**
 * Byte limits for each terminal output preview size.
 *
 * Maps preview size names to their corresponding byte thresholds.
 * When command output exceeds these thresholds, the excess is persisted
 * to disk and made available via the `read_command_output` tool.
 */
export declare const TERMINAL_PREVIEW_BYTES: Record<TerminalOutputPreviewSize, number>
/**
 * Default terminal output preview size.
 * The "medium" (10KB) setting provides a good balance between immediate
 * visibility and context window conservation for most use cases.
 */
export declare const DEFAULT_TERMINAL_OUTPUT_PREVIEW_SIZE: TerminalOutputPreviewSize
/**
 * Minimum checkpoint timeout in seconds.
 */
export declare const MIN_CHECKPOINT_TIMEOUT_SECONDS = 10
/**
 * Maximum checkpoint timeout in seconds.
 */
export declare const MAX_CHECKPOINT_TIMEOUT_SECONDS = 60
/**
 * Default checkpoint timeout in seconds.
 */
export declare const DEFAULT_CHECKPOINT_TIMEOUT_SECONDS = 15
/**
 * GlobalSettings
 */
export declare const globalSettingsSchema: z.ZodObject<
	{
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
		/**
		 * Whether to include current time in the environment details
		 * @default true
		 */
		includeCurrentTime: z.ZodOptional<z.ZodBoolean>
		/**
		 * Whether to include current cost in the environment details
		 * @default true
		 */
		includeCurrentCost: z.ZodOptional<z.ZodBoolean>
		/**
		 * Maximum number of git status file entries to include in the environment details.
		 * Set to 0 to disable git status. The header (branch, commits) is always included when > 0.
		 * @default 0
		 */
		maxGitStatusFiles: z.ZodOptional<z.ZodNumber>
		/**
		 * Whether to include diagnostic messages (errors, warnings) in tool outputs
		 * @default true
		 */
		includeDiagnosticMessages: z.ZodOptional<z.ZodBoolean>
		/**
		 * Maximum number of diagnostic messages to include in tool outputs
		 * @default 50
		 */
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
		customSupportPrompts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>>
		enhancementApiConfigId: z.ZodOptional<z.ZodString>
		includeTaskHistoryInEnhance: z.ZodOptional<z.ZodBoolean>
		historyPreviewCollapsed: z.ZodOptional<z.ZodBoolean>
		reasoningBlockCollapsed: z.ZodOptional<z.ZodBoolean>
		/**
		 * Controls the keyboard behavior for sending messages in the chat input.
		 * - "send": Enter sends message, Shift+Enter creates newline (default)
		 * - "newline": Enter creates newline, Shift+Enter/Ctrl+Enter sends message
		 * @default "send"
		 */
		enterBehavior: z.ZodOptional<z.ZodEnum<["send", "newline"]>>
		profileThresholds: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>
		hasOpenedModeSelector: z.ZodOptional<z.ZodBoolean>
		lastModeExportPath: z.ZodOptional<z.ZodString>
		lastModeImportPath: z.ZodOptional<z.ZodString>
		lastSettingsExportPath: z.ZodOptional<z.ZodString>
		lastTaskExportPath: z.ZodOptional<z.ZodString>
		lastImageSavePath: z.ZodOptional<z.ZodString>
		/**
		 * Path to worktree to auto-open after switching workspaces.
		 * Used by the worktree feature to open the Ali Code sidebar in a new window.
		 */
		worktreeAutoOpenPath: z.ZodOptional<z.ZodString>
		/**
		 * Whether to show the worktree selector in the home screen.
		 * @default true
		 */
		showWorktreesInHomeScreen: z.ZodOptional<z.ZodBoolean>
		/**
		 * List of native tool names to globally disable.
		 * Tools in this list will be excluded from prompt generation and rejected at execution time.
		 */
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
	},
	{
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
>
export type GlobalSettings = z.infer<typeof globalSettingsSchema>
export declare const GLOBAL_SETTINGS_KEYS: [
	"rateLimitSeconds",
	"mode",
	"customInstructions",
	"customModes",
	"currentApiConfigName",
	"listApiConfigMeta",
	"pinnedApiConfigs",
	"lastShownAnnouncementId",
	"taskHistory",
	"dismissedUpsells",
	"imageGenerationProvider",
	"openRouterImageApiKey",
	"openRouterImageGenerationSelectedModel",
	"customCondensingPrompt",
	"autoApprovalEnabled",
	"alwaysAllowReadOnly",
	"alwaysAllowReadOnlyOutsideWorkspace",
	"alwaysAllowWrite",
	"alwaysAllowWriteOutsideWorkspace",
	"alwaysAllowWriteProtected",
	"writeDelayMs",
	"requestDelaySeconds",
	"alwaysAllowMcp",
	"alwaysAllowModeSwitch",
	"alwaysAllowSubtasks",
	"alwaysAllowExecute",
	"alwaysAllowFollowupQuestions",
	"followupAutoApproveTimeoutMs",
	"allowedCommands",
	"deniedCommands",
	"commandExecutionTimeout",
	"commandTimeoutAllowlist",
	"preventCompletionWithOpenTodos",
	"allowedMaxRequests",
	"allowedMaxCost",
	"autoCondenseContext",
	"autoCondenseContextPercent",
	"includeCurrentTime",
	"includeCurrentCost",
	"maxGitStatusFiles",
	"includeDiagnosticMessages",
	"maxDiagnosticMessages",
	"enableCheckpoints",
	"checkpointTimeout",
	"ttsEnabled",
	"ttsSpeed",
	"soundEnabled",
	"soundVolume",
	"maxOpenTabsContext",
	"maxWorkspaceFiles",
	"showAliIgnoredFiles",
	"enableSubfolderRules",
	"maxImageFileSize",
	"maxTotalImageSize",
	"terminalOutputPreviewSize",
	"terminalShellIntegrationTimeout",
	"terminalShellIntegrationDisabled",
	"terminalCommandDelay",
	"terminalPowershellCounter",
	"terminalZshClearEolMark",
	"terminalZshOhMy",
	"terminalZshP10k",
	"terminalZdotdir",
	"execaShellPath",
	"diagnosticsEnabled",
	"experiments",
	"codebaseIndexModels",
	"codebaseIndexConfig",
	"language",
	"mcpEnabled",
	"modeApiConfigs",
	"customModePrompts",
	"customSupportPrompts",
	"enhancementApiConfigId",
	"includeTaskHistoryInEnhance",
	"historyPreviewCollapsed",
	"reasoningBlockCollapsed",
	"enterBehavior",
	"profileThresholds",
	"hasOpenedModeSelector",
	"lastModeExportPath",
	"lastModeImportPath",
	"lastSettingsExportPath",
	"lastTaskExportPath",
	"lastImageSavePath",
	"worktreeAutoOpenPath",
	"showWorktreesInHomeScreen",
	"disabledTools",
]
/**
 * RooCodeSettings
 */
export declare const rooCodeSettingsSchema: z.ZodObject<
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
		customSupportPrompts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>>
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
export type RooCodeSettings = GlobalSettings & ProviderSettings
/**
 * SecretState
 */
export declare const SECRET_STATE_KEYS: readonly [
	"apiKey",
	"openRouterApiKey",
	"awsAccessKey",
	"awsApiKey",
	"awsSecretKey",
	"awsSessionToken",
	"openAiApiKey",
	"ollamaApiKey",
	"geminiApiKey",
	"openAiNativeApiKey",
	"deepSeekApiKey",
	"moonshotApiKey",
	"mistralApiKey",
	"minimaxApiKey",
	"requestyApiKey",
	"unboundApiKey",
	"xaiApiKey",
	"litellmApiKey",
	"codeIndexOpenAiKey",
	"codeIndexQdrantApiKey",
	"codebaseIndexOpenAiCompatibleApiKey",
	"codebaseIndexGeminiApiKey",
	"codebaseIndexMistralApiKey",
	"codebaseIndexVercelAiGatewayApiKey",
	"codebaseIndexOpenRouterApiKey",
	"sambaNovaApiKey",
	"zaiApiKey",
	"fireworksApiKey",
	"vercelAiGatewayApiKey",
	"basetenApiKey",
]
export declare const GLOBAL_SECRET_KEYS: readonly ["openRouterImageApiKey"]
type ProviderSecretKey = (typeof SECRET_STATE_KEYS)[number]
type GlobalSecretKey = (typeof GLOBAL_SECRET_KEYS)[number]
export type SecretState = Pick<ProviderSettings, Extract<ProviderSecretKey, keyof ProviderSettings>> & {
	[K in GlobalSecretKey]?: string
}
export declare const isSecretStateKey: (key: string) => key is Keys<SecretState>
/**
 * GlobalState
 */
export type GlobalState = Omit<RooCodeSettings, Keys<SecretState>>
export declare const GLOBAL_STATE_KEYS: Keys<GlobalState>[]
export declare const isGlobalStateKey: (key: string) => key is Keys<GlobalState>
export {}
//# sourceMappingURL=global-settings.d.ts.map
