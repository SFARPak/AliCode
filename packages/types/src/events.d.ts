import { z } from "zod"
/**
 * RooCodeEventName
 */
export declare enum RooCodeEventName {
	TaskCreated = "taskCreated",
	TaskStarted = "taskStarted",
	TaskCompleted = "taskCompleted",
	TaskAborted = "taskAborted",
	TaskFocused = "taskFocused",
	TaskUnfocused = "taskUnfocused",
	TaskActive = "taskActive",
	TaskInteractive = "taskInteractive",
	TaskResumable = "taskResumable",
	TaskIdle = "taskIdle",
	TaskPaused = "taskPaused",
	TaskUnpaused = "taskUnpaused",
	TaskSpawned = "taskSpawned",
	TaskDelegated = "taskDelegated",
	TaskDelegationCompleted = "taskDelegationCompleted",
	TaskDelegationResumed = "taskDelegationResumed",
	Message = "message",
	TaskModeSwitched = "taskModeSwitched",
	TaskAskResponded = "taskAskResponded",
	TaskUserMessage = "taskUserMessage",
	QueuedMessagesUpdated = "queuedMessagesUpdated",
	TaskTokenUsageUpdated = "taskTokenUsageUpdated",
	TaskToolFailed = "taskToolFailed",
	ModeChanged = "modeChanged",
	ProviderProfileChanged = "providerProfileChanged",
	CommandsResponse = "commandsResponse",
	ModesResponse = "modesResponse",
	ModelsResponse = "modelsResponse",
}
/**
 * RooCodeEvents
 */
export declare const rooCodeEventsSchema: z.ZodObject<
	{
		taskCreated: z.ZodTuple<[z.ZodString], null>
		taskStarted: z.ZodTuple<[z.ZodString], null>
		taskCompleted: z.ZodTuple<
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
		taskAborted: z.ZodTuple<[z.ZodString], null>
		taskFocused: z.ZodTuple<[z.ZodString], null>
		taskUnfocused: z.ZodTuple<[z.ZodString], null>
		taskActive: z.ZodTuple<[z.ZodString], null>
		taskInteractive: z.ZodTuple<[z.ZodString], null>
		taskResumable: z.ZodTuple<[z.ZodString], null>
		taskIdle: z.ZodTuple<[z.ZodString], null>
		taskPaused: z.ZodTuple<[z.ZodString], null>
		taskUnpaused: z.ZodTuple<[z.ZodString], null>
		taskSpawned: z.ZodTuple<[z.ZodString, z.ZodString], null>
		taskDelegated: z.ZodTuple<[z.ZodString, z.ZodString], null>
		taskDelegationCompleted: z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString], null>
		taskDelegationResumed: z.ZodTuple<[z.ZodString, z.ZodString], null>
		message: z.ZodTuple<
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
								checkpoint: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>
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
									z.ZodUnion<[z.ZodLiteral<"openai">, z.ZodLiteral<"anthropic">]>
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
		taskModeSwitched: z.ZodTuple<[z.ZodString, z.ZodString], null>
		taskAskResponded: z.ZodTuple<[z.ZodString], null>
		taskUserMessage: z.ZodTuple<[z.ZodString], null>
		queuedMessagesUpdated: z.ZodTuple<
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
		taskToolFailed: z.ZodTuple<
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
		taskTokenUsageUpdated: z.ZodTuple<
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
		modeChanged: z.ZodTuple<[z.ZodString], null>
		providerProfileChanged: z.ZodTuple<
			[
				z.ZodObject<
					{
						name: z.ZodString
						provider: z.ZodString
					},
					"strip",
					z.ZodTypeAny,
					{
						name: string
						provider: string
					},
					{
						name: string
						provider: string
					}
				>,
			],
			null
		>
		commandsResponse: z.ZodTuple<
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
		modesResponse: z.ZodTuple<
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
		modelsResponse: z.ZodTuple<
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
				>,
			],
			null
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		taskCreated: [string]
		taskStarted: [string]
		taskCompleted: [
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
		taskAborted: [string]
		taskFocused: [string]
		taskUnfocused: [string]
		taskActive: [string]
		taskInteractive: [string]
		taskResumable: [string]
		taskIdle: [string]
		taskPaused: [string]
		taskUnpaused: [string]
		taskSpawned: [string, string]
		taskDelegated: [string, string]
		taskDelegationCompleted: [string, string, string]
		taskDelegationResumed: [string, string]
		message: [
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
		taskModeSwitched: [string, string]
		taskAskResponded: [string]
		taskUserMessage: [string]
		queuedMessagesUpdated: [
			string,
			{
				text: string
				timestamp: number
				id: string
				images?: string[] | undefined
			}[],
		]
		taskTokenUsageUpdated: [
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
		taskToolFailed: [
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
		modeChanged: [string]
		providerProfileChanged: [
			{
				name: string
				provider: string
			},
		]
		commandsResponse: [
			{
				name: string
				source: "global" | "project" | "built-in"
				description?: string | undefined
				filePath?: string | undefined
				argumentHint?: string | undefined
			}[],
		]
		modesResponse: [
			{
				name: string
				slug: string
			}[],
		]
		modelsResponse: [
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
			>,
		]
	},
	{
		taskCreated: [string]
		taskStarted: [string]
		taskCompleted: [
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
		taskAborted: [string]
		taskFocused: [string]
		taskUnfocused: [string]
		taskActive: [string]
		taskInteractive: [string]
		taskResumable: [string]
		taskIdle: [string]
		taskPaused: [string]
		taskUnpaused: [string]
		taskSpawned: [string, string]
		taskDelegated: [string, string]
		taskDelegationCompleted: [string, string, string]
		taskDelegationResumed: [string, string]
		message: [
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
		taskModeSwitched: [string, string]
		taskAskResponded: [string]
		taskUserMessage: [string]
		queuedMessagesUpdated: [
			string,
			{
				text: string
				timestamp: number
				id: string
				images?: string[] | undefined
			}[],
		]
		taskTokenUsageUpdated: [
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
		taskToolFailed: [
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
		modeChanged: [string]
		providerProfileChanged: [
			{
				name: string
				provider: string
			},
		]
		commandsResponse: [
			{
				name: string
				source: "global" | "project" | "built-in"
				description?: string | undefined
				filePath?: string | undefined
				argumentHint?: string | undefined
			}[],
		]
		modesResponse: [
			{
				name: string
				slug: string
			}[],
		]
		modelsResponse: [
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
			>,
		]
	}
>
export type RooCodeEvents = z.infer<typeof rooCodeEventsSchema>
/**
 * TaskEvent
 */
export declare const taskEventSchema: z.ZodDiscriminatedUnion<
	"eventName",
	[
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskCreated>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskCreated
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskCreated
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskStarted>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskStarted
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskStarted
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskCompleted>
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
				eventName: RooCodeEventName.TaskCompleted
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
				eventName: RooCodeEventName.TaskCompleted
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
				eventName: z.ZodLiteral<RooCodeEventName.TaskAborted>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskAborted
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskAborted
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskFocused>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskFocused
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskFocused
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskUnfocused>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskUnfocused
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskUnfocused
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskActive>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskActive
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskActive
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskInteractive>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskInteractive
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskInteractive
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskResumable>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskResumable
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskResumable
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskIdle>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskIdle
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskIdle
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskPaused>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskPaused
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskPaused
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskUnpaused>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskUnpaused
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskUnpaused
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskSpawned>
				payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskSpawned
				payload: [string, string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskSpawned
				payload: [string, string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskDelegated>
				payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskDelegated
				payload: [string, string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskDelegated
				payload: [string, string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskDelegationCompleted>
				payload: z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskDelegationCompleted
				payload: [string, string, string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskDelegationCompleted
				payload: [string, string, string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskDelegationResumed>
				payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskDelegationResumed
				payload: [string, string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskDelegationResumed
				payload: [string, string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.Message>
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
										checkpoint: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>
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
											z.ZodUnion<[z.ZodLiteral<"openai">, z.ZodLiteral<"anthropic">]>
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
				eventName: RooCodeEventName.Message
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
				eventName: RooCodeEventName.Message
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
				eventName: z.ZodLiteral<RooCodeEventName.TaskModeSwitched>
				payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskModeSwitched
				payload: [string, string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskModeSwitched
				payload: [string, string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskAskResponded>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskAskResponded
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskAskResponded
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.QueuedMessagesUpdated>
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
				eventName: RooCodeEventName.QueuedMessagesUpdated
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
				eventName: RooCodeEventName.QueuedMessagesUpdated
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
				eventName: z.ZodLiteral<RooCodeEventName.TaskToolFailed>
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
				eventName: RooCodeEventName.TaskToolFailed
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
				eventName: RooCodeEventName.TaskToolFailed
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
				eventName: z.ZodLiteral<RooCodeEventName.TaskTokenUsageUpdated>
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
				eventName: RooCodeEventName.TaskTokenUsageUpdated
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
				eventName: RooCodeEventName.TaskTokenUsageUpdated
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
				eventName: z.ZodLiteral<RooCodeEventName.CommandsResponse>
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
				eventName: RooCodeEventName.CommandsResponse
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
				eventName: RooCodeEventName.CommandsResponse
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
				eventName: z.ZodLiteral<RooCodeEventName.ModesResponse>
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
				eventName: RooCodeEventName.ModesResponse
				payload: [
					{
						name: string
						slug: string
					}[],
				]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.ModesResponse
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
				eventName: z.ZodLiteral<RooCodeEventName.ModelsResponse>
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
						>,
					],
					null
				>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.ModelsResponse
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
					>,
				]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.ModelsResponse
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
					>,
				]
				taskId?: number | undefined
			}
		>,
	]
>
export type TaskEvent = z.infer<typeof taskEventSchema>
export declare const AliCodeEventName: typeof RooCodeEventName
//# sourceMappingURL=events.d.ts.map
