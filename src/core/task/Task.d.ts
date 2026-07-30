import EventEmitter from "events"
import { Anthropic } from "@anthropic-ai/sdk"
import {
	type TaskLike,
	type TaskMetadata,
	type TaskEvents,
	type ProviderSettings,
	type TokenUsage,
	type ToolUsage,
	type ToolName,
	type ContextCondense,
	type ContextTruncation,
	type ClineMessage,
	type ClineSay,
	type ClineAsk,
	type ToolProgressStatus,
	type HistoryItem,
	type CreateTaskOptions,
	type ModelInfo,
	type ClineApiReqCancelReason,
	TaskStatus,
	TodoItem,
	QueuedMessage,
} from "@ali-code/types"
import { ApiHandler } from "../../api"
import { ApiStream } from "../../api/transform/stream"
import { ClineAskResponse } from "../../shared/WebviewMessage"
import { DiffStrategy } from "../../shared/tools"
import { RepoPerTaskCheckpointService } from "../../services/checkpoints"
import { DiffViewProvider } from "../../integrations/editor/DiffViewProvider"
import { AliTerminalProcess } from "../../integrations/terminal/types"
import { ToolRepetitionDetector } from "../tools/ToolRepetitionDetector"
import { FileContextTracker } from "../context-tracking/FileContextTracker"
import { AliIgnoreController } from "../ignore/AliIgnoreController"
import { AliProtectedController } from "../protect/AliProtectedController"
import { type AssistantMessageContent } from "../assistant-message"
import { ClineProvider } from "../webview/ClineProvider"
import { type ApiMessage } from "../task-persistence"
import { type CheckpointDiffOptions, type CheckpointRestoreOptions } from "../checkpoints"
import { MessageQueueService } from "../message-queue/MessageQueueService"
import { MessageManager } from "../message-manager"
export interface TaskOptions extends CreateTaskOptions {
	provider: ClineProvider
	apiConfiguration: ProviderSettings
	enableCheckpoints?: boolean
	checkpointTimeout?: number
	consecutiveMistakeLimit?: number
	task?: string
	images?: string[]
	historyItem?: HistoryItem
	experiments?: Record<string, boolean>
	startTask?: boolean
	rootTask?: Task
	parentTask?: Task
	taskNumber?: number
	onCreated?: (task: Task) => void
	initialTodos?: TodoItem[]
	workspacePath?: string
	/** Initial status for the task's history item (e.g., "active" for child tasks) */
	initialStatus?: "active" | "delegated" | "completed"
}
export declare class Task extends EventEmitter<TaskEvents> implements TaskLike {
	readonly taskId: string
	readonly rootTaskId?: string
	readonly parentTaskId?: string
	childTaskId?: string
	pendingNewTaskToolCallId?: string
	readonly instanceId: string
	readonly metadata: TaskMetadata
	todoList?: TodoItem[]
	readonly rootTask: Task | undefined
	readonly parentTask: Task | undefined
	readonly taskNumber: number
	readonly workspacePath: string
	/**
	 * The mode associated with this task. Persisted across sessions
	 * to maintain user context when reopening tasks from history.
	 *
	 * ## Lifecycle
	 *
	 * ### For new tasks:
	 * 1. Initially `undefined` during construction
	 * 2. Asynchronously initialized from provider state via `initializeTaskMode()`
	 * 3. Falls back to `defaultModeSlug` if provider state is unavailable
	 *
	 * ### For history items:
	 * 1. Immediately set from `historyItem.mode` during construction
	 * 2. Falls back to `defaultModeSlug` if mode is not stored in history
	 *
	 * ## Important
	 * This property should NOT be accessed directly until `taskModeReady` promise resolves.
	 * Use `getTaskMode()` for async access or `taskMode` getter for sync access after initialization.
	 *
	 * @private
	 * @see {@link getTaskMode} - For safe async access
	 * @see {@link taskMode} - For sync access after initialization
	 * @see {@link waitForModeInitialization} - To ensure initialization is complete
	 */
	private _taskMode
	/**
	 * Promise that resolves when the task mode has been initialized.
	 * This ensures async mode initialization completes before the task is used.
	 *
	 * ## Purpose
	 * - Prevents race conditions when accessing task mode
	 * - Ensures provider state is properly loaded before mode-dependent operations
	 * - Provides a synchronization point for async initialization
	 *
	 * ## Resolution timing
	 * - For history items: Resolves immediately (sync initialization)
	 * - For new tasks: Resolves after provider state is fetched (async initialization)
	 *
	 * @private
	 * @see {@link waitForModeInitialization} - Public method to await this promise
	 */
	private taskModeReady
	/**
	 * The API configuration name (provider profile) associated with this task.
	 * Persisted across sessions to maintain the provider profile when reopening tasks from history.
	 *
	 * ## Lifecycle
	 *
	 * ### For new tasks:
	 * 1. Initially `undefined` during construction
	 * 2. Asynchronously initialized from provider state via `initializeTaskApiConfigName()`
	 * 3. Falls back to "default" if provider state is unavailable
	 *
	 * ### For history items:
	 * 1. Immediately set from `historyItem.apiConfigName` during construction
	 * 2. Falls back to undefined if not stored in history (for backward compatibility)
	 *
	 * ## Important
	 * If you need a non-`undefined` provider profile (e.g., for profile-dependent operations),
	 * wait for `taskApiConfigReady` first (or use `getTaskApiConfigName()`).
	 * The sync `taskApiConfigName` getter may return `undefined` for backward compatibility.
	 *
	 * @private
	 * @see {@link getTaskApiConfigName} - For safe async access
	 * @see {@link taskApiConfigName} - For sync access after initialization
	 */
	private _taskApiConfigName
	/**
	 * Promise that resolves when the task API config name has been initialized.
	 * This ensures async API config name initialization completes before the task is used.
	 *
	 * ## Purpose
	 * - Prevents race conditions when accessing task API config name
	 * - Ensures provider state is properly loaded before profile-dependent operations
	 * - Provides a synchronization point for async initialization
	 *
	 * ## Resolution timing
	 * - For history items: Resolves immediately (sync initialization)
	 * - For new tasks: Resolves after provider state is fetched (async initialization)
	 *
	 * @private
	 */
	private taskApiConfigReady
	providerRef: WeakRef<ClineProvider>
	private readonly globalStoragePath
	abort: boolean
	currentRequestAbortController?: AbortController
	skipPrevResponseIdOnce: boolean
	idleAsk?: ClineMessage
	resumableAsk?: ClineMessage
	interactiveAsk?: ClineMessage
	didFinishAbortingStream: boolean
	abandoned: boolean
	abortReason?: ClineApiReqCancelReason
	isInitialized: boolean
	isPaused: boolean
	apiConfiguration: ProviderSettings
	api: ApiHandler
	private static lastGlobalApiRequestTime?
	private autoApprovalHandler
	/**
	 * Reset the global API request timestamp. This should only be used for testing.
	 * @internal
	 */
	static resetGlobalApiRequestTime(): void
	toolRepetitionDetector: ToolRepetitionDetector
	aliIgnoreController?: AliIgnoreController
	aliProtectedController?: AliProtectedController
	fileContextTracker: FileContextTracker
	terminalProcess?: AliTerminalProcess
	diffViewProvider: DiffViewProvider
	diffStrategy?: DiffStrategy
	didEditFile: boolean
	apiConversationHistory: ApiMessage[]
	clineMessages: ClineMessage[]
	private askResponse?
	private askResponseText?
	private askResponseImages?
	lastMessageTs?: number
	private autoApprovalTimeoutRef?
	consecutiveMistakeCount: number
	consecutiveMistakeLimit: number
	consecutiveMistakeCountForApplyDiff: Map<string, number>
	consecutiveMistakeCountForEditFile: Map<string, number>
	consecutiveNoToolUseCount: number
	consecutiveNoAssistantMessagesCount: number
	toolUsage: ToolUsage
	enableCheckpoints: boolean
	checkpointTimeout: number
	checkpointService?: RepoPerTaskCheckpointService
	checkpointServiceInitializing: boolean
	readonly messageQueueService: MessageQueueService
	private messageQueueStateChangedHandler
	isWaitingForFirstChunk: boolean
	isStreaming: boolean
	currentStreamingContentIndex: number
	currentStreamingDidCheckpoint: boolean
	assistantMessageContent: AssistantMessageContent[]
	presentAssistantMessageLocked: boolean
	presentAssistantMessageHasPendingUpdates: boolean
	userMessageContent: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam | Anthropic.ToolResultBlockParam)[]
	userMessageContentReady: boolean
	/**
	 * Flag indicating whether the assistant message for the current streaming session
	 * has been saved to API conversation history.
	 *
	 * This is critical for parallel tool calling: tools should NOT execute until
	 * the assistant message is saved. Otherwise, if a tool like `new_task` triggers
	 * `flushPendingToolResultsToHistory()`, the user message with tool_results would
	 * appear BEFORE the assistant message with tool_uses, causing API errors.
	 *
	 * Reset to `false` at the start of each API request.
	 * Set to `true` after the assistant message is saved in `recursivelyMakeClineRequests`.
	 */
	assistantMessageSavedToHistory: boolean
	/**
	 * Push a tool_result block to userMessageContent, preventing duplicates.
	 * Duplicate tool_use_ids cause API errors.
	 *
	 * @param toolResult - The tool_result block to add
	 * @returns true if added, false if duplicate was skipped
	 */
	pushToolResultToUserContent(toolResult: Anthropic.ToolResultBlockParam): boolean
	didRejectTool: boolean
	didAlreadyUseTool: boolean
	didToolFailInCurrentTurn: boolean
	didCompleteReadingStream: boolean
	private _started
	assistantMessageParser?: undefined
	private providerProfileChangeListener?
	private streamingToolCallIndices
	cachedStreamingModel?: {
		id: string
		info: ModelInfo
	}
	private tokenUsageSnapshot?
	private tokenUsageSnapshotAt?
	private toolUsageSnapshot?
	private readonly TOKEN_USAGE_EMIT_INTERVAL_MS
	private debouncedEmitTokenUsage
	private readonly initialStatus?
	private _messageManager?
	constructor({
		provider,
		apiConfiguration,
		enableCheckpoints,
		checkpointTimeout,
		consecutiveMistakeLimit,
		taskId,
		task,
		images,
		historyItem,
		experiments: experimentsConfig,
		startTask,
		rootTask,
		parentTask,
		taskNumber,
		onCreated,
		initialTodos,
		workspacePath,
		initialStatus,
	}: TaskOptions)
	/**
	 * Initialize the task mode from the provider state.
	 * This method handles async initialization with proper error handling.
	 *
	 * ## Flow
	 * 1. Attempts to fetch the current mode from provider state
	 * 2. Sets `_taskMode` to the fetched mode or `defaultModeSlug` if unavailable
	 * 3. Handles errors gracefully by falling back to default mode
	 * 4. Logs any initialization errors for debugging
	 *
	 * ## Error handling
	 * - Network failures when fetching provider state
	 * - Provider not yet initialized
	 * - Invalid state structure
	 *
	 * All errors result in fallback to `defaultModeSlug` to ensure task can proceed.
	 *
	 * @private
	 * @param provider - The ClineProvider instance to fetch state from
	 * @returns Promise that resolves when initialization is complete
	 */
	private initializeTaskMode
	/**
	 * Initialize the task API config name from the provider state.
	 * This method handles async initialization with proper error handling.
	 *
	 * ## Flow
	 * 1. Attempts to fetch the current API config name from provider state
	 * 2. Sets `_taskApiConfigName` to the fetched name or "default" if unavailable
	 * 3. Handles errors gracefully by falling back to "default"
	 * 4. Logs any initialization errors for debugging
	 *
	 * ## Error handling
	 * - Network failures when fetching provider state
	 * - Provider not yet initialized
	 * - Invalid state structure
	 *
	 * All errors result in fallback to "default" to ensure task can proceed.
	 *
	 * @private
	 * @param provider - The ClineProvider instance to fetch state from
	 * @returns Promise that resolves when initialization is complete
	 */
	private initializeTaskApiConfigName
	/**
	 * Sets up a listener for provider profile changes.
	 *
	 * @private
	 * @param provider - The ClineProvider instance to listen to
	 */
	private setupProviderProfileChangeListener
	/**
	 * Wait for the task mode to be initialized before proceeding.
	 * This method ensures that any operations depending on the task mode
	 * will have access to the correct mode value.
	 *
	 * ## When to use
	 * - Before accessing mode-specific configurations
	 * - When switching between tasks with different modes
	 * - Before operations that depend on mode-based permissions
	 *
	 * ## Example usage
	 * ```typescript
	 * // Wait for mode initialization before mode-dependent operations
	 * await task.waitForModeInitialization();
	 * const mode = task.taskMode; // Now safe to access synchronously
	 *
	 * // Or use with getTaskMode() for a one-liner
	 * const mode = await task.getTaskMode(); // Internally waits for initialization
	 * ```
	 *
	 * @returns Promise that resolves when the task mode is initialized
	 * @public
	 */
	waitForModeInitialization(): Promise<void>
	/**
	 * Get the task mode asynchronously, ensuring it's properly initialized.
	 * This is the recommended way to access the task mode as it guarantees
	 * the mode is available before returning.
	 *
	 * ## Async behavior
	 * - Internally waits for `taskModeReady` promise to resolve
	 * - Returns the initialized mode or `defaultModeSlug` as fallback
	 * - Safe to call multiple times - subsequent calls return immediately if already initialized
	 *
	 * ## Example usage
	 * ```typescript
	 * // Safe async access
	 * const mode = await task.getTaskMode();
	 * console.log(`Task is running in ${mode} mode`);
	 *
	 * // Use in conditional logic
	 * if (await task.getTaskMode() === 'architect') {
	 *   // Perform architect-specific operations
	 * }
	 * ```
	 *
	 * @returns Promise resolving to the task mode string
	 * @public
	 */
	getTaskMode(): Promise<string>
	/**
	 * Get the task mode synchronously. This should only be used when you're certain
	 * that the mode has already been initialized (e.g., after waitForModeInitialization).
	 *
	 * ## When to use
	 * - In synchronous contexts where async/await is not available
	 * - After explicitly waiting for initialization via `waitForModeInitialization()`
	 * - In event handlers or callbacks where mode is guaranteed to be initialized
	 *
	 * ## Example usage
	 * ```typescript
	 * // After ensuring initialization
	 * await task.waitForModeInitialization();
	 * const mode = task.taskMode; // Safe synchronous access
	 *
	 * // In an event handler after task is started
	 * task.on('taskStarted', () => {
	 *   console.log(`Task started in ${task.taskMode} mode`); // Safe here
	 * });
	 * ```
	 *
	 * @throws {Error} If the mode hasn't been initialized yet
	 * @returns The task mode string
	 * @public
	 */
	get taskMode(): string
	/**
	 * Wait for the task API config name to be initialized before proceeding.
	 * This method ensures that any operations depending on the task's provider profile
	 * will have access to the correct value.
	 *
	 * ## When to use
	 * - Before accessing provider profile-specific configurations
	 * - When switching between tasks with different provider profiles
	 * - Before operations that depend on the provider profile
	 *
	 * @returns Promise that resolves when the task API config name is initialized
	 * @public
	 */
	waitForApiConfigInitialization(): Promise<void>
	/**
	 * Get the task API config name asynchronously, ensuring it's properly initialized.
	 * This is the recommended way to access the task's provider profile as it guarantees
	 * the value is available before returning.
	 *
	 * ## Async behavior
	 * - Internally waits for `taskApiConfigReady` promise to resolve
	 * - Returns the initialized API config name or undefined as fallback
	 * - Safe to call multiple times - subsequent calls return immediately if already initialized
	 *
	 * @returns Promise resolving to the task API config name string or undefined
	 * @public
	 */
	getTaskApiConfigName(): Promise<string | undefined>
	/**
	 * Get the task API config name synchronously. This should only be used when you're certain
	 * that the value has already been initialized (e.g., after waitForApiConfigInitialization).
	 *
	 * ## When to use
	 * - In synchronous contexts where async/await is not available
	 * - After explicitly waiting for initialization via `waitForApiConfigInitialization()`
	 * - In event handlers or callbacks where API config name is guaranteed to be initialized
	 *
	 * Note: Unlike taskMode, this getter does not throw if uninitialized since the API config
	 * name can legitimately be undefined (backward compatibility with tasks created before
	 * this feature was added).
	 *
	 * @returns The task API config name string or undefined
	 * @public
	 */
	get taskApiConfigName(): string | undefined
	/**
	 * Update the task's API config name. This is called when the user switches
	 * provider profiles while a task is active, allowing the task to remember
	 * its new provider profile.
	 *
	 * @param apiConfigName - The new API config name to set
	 * @internal
	 */
	setTaskApiConfigName(apiConfigName: string | undefined): void
	static create(options: TaskOptions): [Task, Promise<void>]
	private getSavedApiConversationHistory
	private addToApiConversationHistory
	overwriteApiConversationHistory(newHistory: ApiMessage[]): Promise<void>
	/**
	 * Flush any pending tool results to the API conversation history.
	 *
	 * This is critical when the task is about to be
	 * delegated (e.g., via new_task). Before delegation, if other tools were
	 * called in the same turn before new_task, their tool_result blocks are
	 * accumulated in `userMessageContent` but haven't been saved to the API
	 * history yet. If we don't flush them before the parent is disposed,
	 * the API conversation will be incomplete and cause 400 errors when
	 * the parent resumes (missing tool_result for tool_use blocks).
	 *
	 * NOTE: The assistant message is typically already in history by the time
	 * tools execute (added in recursivelyMakeClineRequests after streaming completes).
	 * So we usually only need to flush the pending user message with tool_results.
	 */
	flushPendingToolResultsToHistory(): Promise<boolean>
	private saveApiConversationHistory
	/**
	 * Public wrapper to retry saving the API conversation history.
	 * Uses exponential backoff: up to 3 attempts with delays of 100 ms, 500 ms, 1500 ms.
	 * Used by delegation flow when flushPendingToolResultsToHistory reports failure.
	 */
	retrySaveApiConversationHistory(): Promise<boolean>
	private getSavedClineMessages
	private addToClineMessages
	overwriteClineMessages(newMessages: ClineMessage[]): Promise<void>
	private updateClineMessage
	private saveClineMessages
	private findMessageByTimestamp
	ask(
		type: ClineAsk,
		text?: string,
		partial?: boolean,
		progressStatus?: ToolProgressStatus,
		isProtected?: boolean,
	): Promise<{
		response: ClineAskResponse
		text?: string
		images?: string[]
	}>
	handleWebviewAskResponse(askResponse: ClineAskResponse, text?: string, images?: string[]): void
	/**
	 * Cancel any pending auto-approval timeout.
	 * Called when user interacts (types, clicks buttons, etc.) to prevent the timeout from firing.
	 */
	cancelAutoApprovalTimeout(): void
	approveAsk({ text, images }?: { text?: string; images?: string[] }): void
	denyAsk({ text, images }?: { text?: string; images?: string[] }): void
	supersedePendingAsk(): void
	/**
	 * Updates the API configuration and rebuilds the API handler.
	 * There is no tool-protocol switching or tool parser swapping.
	 *
	 * @param newApiConfiguration - The new API configuration to use
	 */
	updateApiConfiguration(newApiConfiguration: ProviderSettings): void
	submitUserMessage(text: string, images?: string[], mode?: string, providerProfile?: string): Promise<void>
	handleTerminalOperation(terminalOperation: "continue" | "abort"): Promise<void>
	private getFilesReadByAliSafely
	condenseContext(): Promise<void>
	say(
		type: ClineSay,
		text?: string,
		images?: string[],
		partial?: boolean,
		checkpoint?: Record<string, unknown>,
		progressStatus?: ToolProgressStatus,
		options?: {
			isNonInteractive?: boolean
		},
		contextCondense?: ContextCondense,
		contextTruncation?: ContextTruncation,
	): Promise<undefined>
	sayAndCreateMissingParamError(toolName: ToolName, paramName: string, relPath?: string): Promise<string>
	/**
	 * Get enabled MCP tools count for this task.
	 * Returns the count along with the number of servers contributing.
	 *
	 * @returns Object with enabledToolCount and enabledServerCount
	 */
	private getEnabledMcpToolsCount
	/**
	 * Manually start a **new** task when it was created with `startTask: false`.
	 *
	 * This fires `startTask` as a background async operation for the
	 * `task/images` code-path only.  It does **not** handle the
	 * `historyItem` resume path (use the constructor with `startTask: true`
	 * for that).  The primary use-case is in the delegation flow where the
	 * parent's metadata must be persisted to globalState **before** the
	 * child task begins writing its own history (avoiding a read-modify-write
	 * race on globalState).
	 */
	start(): void
	private startTask
	private resumeTaskFromHistory
	/**
	 * Cancels the current HTTP request if one is in progress.
	 * This immediately aborts the underlying stream rather than waiting for the next chunk.
	 */
	cancelCurrentRequest(): void
	/**
	 * Force emit a final token usage update, ignoring throttle.
	 * Called before task completion or abort to ensure final stats are captured.
	 * Triggers the debounce with current values and immediately flushes to ensure emit.
	 */
	emitFinalTokenUsageUpdate(): void
	abortTask(isAbandoned?: boolean): Promise<void>
	dispose(): void
	startSubtask(message: string, initialTodos: TodoItem[], mode: string): Promise<any>
	/**
	 * Resume parent task after delegation completion without showing resume ask.
	 * Used in metadata-driven subtask flow.
	 *
	 * This method:
	 * - Clears any pending ask states
	 * - Resets abort and streaming flags
	 * - Ensures next API call includes full context
	 * - Immediately continues task loop without user interaction
	 */
	resumeAfterDelegation(): Promise<void>
	private initiateTaskLoop
	recursivelyMakeClineRequests(
		userContent: Anthropic.Messages.ContentBlockParam[],
		includeFileDetails?: boolean,
	): Promise<boolean>
	private getSystemPrompt
	private getCurrentProfileId
	private handleContextWindowExceededError
	/**
	 * Enforce the user-configured provider rate limit.
	 *
	 * NOTE: This is intentionally treated as expected behavior and is surfaced via
	 * the `api_req_rate_limit_wait` say type (not an error).
	 */
	private maybeWaitForProviderRateLimit
	attemptApiRequest(
		retryAttempt?: number,
		options?: {
			skipProviderRateLimit?: boolean
		},
	): ApiStream
	private backoffAndAnnounce
	checkpointSave(
		force?: boolean,
		suppressMessage?: boolean,
	): Promise<void | import("../../services/checkpoints/types").CheckpointResult>
	private buildCleanConversationHistory
	checkpointRestore(options: CheckpointRestoreOptions): Promise<void>
	checkpointDiff(options: CheckpointDiffOptions): Promise<void>
	combineMessages(messages: ClineMessage[]): {
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
	}[]
	getTokenUsage(): TokenUsage
	recordToolUsage(toolName: ToolName): void
	recordToolError(toolName: ToolName, error?: string): void
	get taskStatus(): TaskStatus
	get taskAsk(): ClineMessage | undefined
	get queuedMessages(): QueuedMessage[]
	get tokenUsage(): TokenUsage | undefined
	get cwd(): string
	/**
	 * Provides convenient access to high-level message operations.
	 * Uses lazy initialization - the MessageManager is only created when first accessed.
	 * Subsequent accesses return the same cached instance.
	 *
	 * ## Important: Single Coordination Point
	 *
	 * **All MessageManager operations must go through this getter** rather than
	 * instantiating `new MessageManager(task)` directly. This ensures:
	 * - A single shared instance for consistent behavior
	 * - Centralized coordination of all rewind/message operations
	 * - Ability to add internal state or instrumentation in the future
	 *
	 * @example
	 * ```typescript
	 * // Correct: Use the getter
	 * await task.messageManager.rewindToTimestamp(ts)
	 *
	 * // Incorrect: Do NOT create new instances directly
	 * // const manager = new MessageManager(task) // Don't do this!
	 * ```
	 */
	get messageManager(): MessageManager
	/**
	 * Process any queued messages by dequeuing and submitting them.
	 * This ensures that queued user messages are sent when appropriate,
	 * preventing them from getting stuck in the queue.
	 *
	 * @param context - Context string for logging (e.g., the calling tool name)
	 */
	processQueuedMessages(): void
}
//# sourceMappingURL=Task.d.ts.map
