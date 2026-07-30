import { z } from "zod"
import type { GlobalSettings, RooCodeSettings } from "./global-settings.js"
import type { ProviderSettings, ProviderSettingsEntry } from "./provider-settings.js"
import type { HistoryItem } from "./history.js"
import type { ModeConfig, PromptComponent } from "./mode.js"
import type { Experiments } from "./experiment.js"
import type { ClineMessage, QueuedMessage } from "./message.js"
import type { TodoItem } from "./todo.js"
import type { OrganizationAllowList } from "./organization.js"
import type { SerializedCustomToolDefinition } from "./custom-tool.js"
import type { GitCommit } from "./git.js"
import type { McpServer } from "./mcp.js"
import type { ModelRecord, RouterModels } from "./model.js"
import type { OpenAiCodexRateLimitInfo } from "./providers/openai-codex-rate-limits.js"
import type { SkillMetadata } from "./skills.js"
import type { WorktreeIncludeStatus } from "./worktree.js"
/**
 * ExtensionMessage
 * Extension -> Webview | CLI
 */
export interface ExtensionMessage {
	type:
		| "action"
		| "state"
		| "taskHistoryUpdated"
		| "taskHistoryItemUpdated"
		| "selectedImages"
		| "theme"
		| "workspaceUpdated"
		| "invoke"
		| "messageUpdated"
		| "mcpServers"
		| "enhancedPrompt"
		| "commitSearchResults"
		| "listApiConfig"
		| "routerModels"
		| "openAiModels"
		| "ollamaModels"
		| "lmStudioModels"
		| "vsCodeLmModels"
		| "vsCodeLmApiAvailable"
		| "updatePrompt"
		| "systemPrompt"
		| "autoApprovalEnabled"
		| "updateCustomMode"
		| "deleteCustomMode"
		| "exportModeResult"
		| "importModeResult"
		| "checkRulesDirectoryResult"
		| "deleteCustomModeCheck"
		| "currentCheckpointUpdated"
		| "checkpointInitWarning"
		| "ttsStart"
		| "ttsStop"
		| "fileSearchResults"
		| "toggleApiConfigPin"
		| "acceptInput"
		| "setHistoryPreviewCollapsed"
		| "commandExecutionStatus"
		| "mcpExecutionStatus"
		| "vsCodeSetting"
		| "authenticatedUser"
		| "condenseTaskContextStarted"
		| "condenseTaskContextResponse"
		| "singleRouterModelFetchResponse"
		| "rooCreditBalance"
		| "indexingStatusUpdate"
		| "indexCleared"
		| "codebaseIndexConfig"
		| "codeIndexSettingsSaved"
		| "codeIndexSecretStatus"
		| "showDeleteMessageDialog"
		| "showEditMessageDialog"
		| "commands"
		| "insertTextIntoTextarea"
		| "dismissedUpsells"
		| "interactionRequired"
		| "customToolsResult"
		| "modes"
		| "taskWithAggregatedCosts"
		| "openAiCodexRateLimits"
		| "worktreeList"
		| "worktreeResult"
		| "worktreeCopyProgress"
		| "branchList"
		| "worktreeDefaults"
		| "worktreeIncludeStatus"
		| "branchWorktreeIncludeResult"
		| "folderSelected"
		| "skills"
		| "fileContent"
	text?: string
	/** For fileContent: { path, content, error? } */
	fileContent?: {
		path: string
		content: string | null
		error?: string
	}
	payload?: any
	checkpointWarning?: {
		type: "WAIT_TIMEOUT" | "INIT_TIMEOUT"
		timeout: number
	}
	action?:
		| "chatButtonClicked"
		| "settingsButtonClicked"
		| "historyButtonClicked"
		| "didBecomeVisible"
		| "focusInput"
		| "switchTab"
		| "toggleAutoApprove"
	invoke?: "newChat" | "sendMessage" | "primaryButtonClick" | "secondaryButtonClick" | "setChatBoxMessage"
	/**
	 * Partial state updates are allowed to reduce message size (e.g. omit large fields like taskHistory).
	 * The webview is responsible for merging.
	 */
	state?: Partial<ExtensionState>
	images?: string[]
	filePaths?: string[]
	openedTabs?: Array<{
		label: string
		isActive: boolean
		path?: string
	}>
	clineMessage?: ClineMessage
	routerModels?: RouterModels
	openAiModels?: string[]
	ollamaModels?: ModelRecord
	lmStudioModels?: ModelRecord
	vsCodeLmModels?: {
		vendor?: string
		family?: string
		version?: string
		id?: string
	}[]
	mcpServers?: McpServer[]
	commits?: GitCommit[]
	listApiConfig?: ProviderSettingsEntry[]
	mode?: string
	customMode?: ModeConfig
	slug?: string
	success?: boolean
	/** Generic payload for extension messages that use `values` */
	values?: Record<string, any>
	requestId?: string
	promptText?: string
	results?:
		| {
				path: string
				type: "file" | "folder"
				label?: string
		  }[]
		| {
				name: string
				description?: string
				argumentHint?: string
				source: "global" | "project" | "built-in"
		  }[]
	error?: string
	setting?: string
	value?: any
	hasContent?: boolean
	organizationAllowList?: OrganizationAllowList
	tab?: string
	errors?: string[]
	rulesFolderPath?: string
	settings?: any
	messageTs?: number
	hasCheckpoint?: boolean
	context?: string
	commands?: Command[]
	queuedMessages?: QueuedMessage[]
	list?: string[]
	tools?: SerializedCustomToolDefinition[]
	skills?: SkillMetadata[]
	modes?: {
		slug: string
		name: string
	}[]
	aggregatedCosts?: {
		totalCost: number
		ownCost: number
		childrenCost: number
	}
	historyItem?: HistoryItem
	taskHistory?: HistoryItem[]
	/** For taskHistoryItemUpdated: single updated/added history item */
	taskHistoryItem?: HistoryItem
	worktrees?: Array<{
		path: string
		branch: string
		commitHash: string
		isCurrent: boolean
		isBare: boolean
		isDetached: boolean
		isLocked: boolean
		lockReason?: string
	}>
	isGitRepo?: boolean
	isMultiRoot?: boolean
	isSubfolder?: boolean
	gitRootPath?: string
	worktreeResult?: {
		success: boolean
		message: string
		worktree?: {
			path: string
			branch: string
			commitHash: string
			isCurrent: boolean
			isBare: boolean
			isDetached: boolean
			isLocked: boolean
			lockReason?: string
		}
	}
	localBranches?: string[]
	remoteBranches?: string[]
	currentBranch?: string
	suggestedBranch?: string
	suggestedPath?: string
	worktreeIncludeExists?: boolean
	worktreeIncludeStatus?: WorktreeIncludeStatus
	hasGitignore?: boolean
	gitignoreContent?: string
	branch?: string
	hasWorktreeInclude?: boolean
	copyProgressBytesCopied?: number
	copyProgressTotalBytes?: number
	copyProgressItemName?: string
	path?: string
}
export interface OpenAiCodexRateLimitsMessage {
	type: "openAiCodexRateLimits"
	values?: OpenAiCodexRateLimitInfo
	error?: string
}
export type ExtensionState = Pick<
	GlobalSettings,
	| "currentApiConfigName"
	| "listApiConfigMeta"
	| "pinnedApiConfigs"
	| "customInstructions"
	| "dismissedUpsells"
	| "autoApprovalEnabled"
	| "alwaysAllowReadOnly"
	| "alwaysAllowReadOnlyOutsideWorkspace"
	| "alwaysAllowWrite"
	| "alwaysAllowWriteOutsideWorkspace"
	| "alwaysAllowWriteProtected"
	| "alwaysAllowMcp"
	| "alwaysAllowModeSwitch"
	| "alwaysAllowSubtasks"
	| "alwaysAllowFollowupQuestions"
	| "alwaysAllowExecute"
	| "followupAutoApproveTimeoutMs"
	| "allowedCommands"
	| "deniedCommands"
	| "allowedMaxRequests"
	| "allowedMaxCost"
	| "ttsEnabled"
	| "ttsSpeed"
	| "soundEnabled"
	| "soundVolume"
	| "terminalOutputPreviewSize"
	| "terminalShellIntegrationTimeout"
	| "terminalShellIntegrationDisabled"
	| "terminalCommandDelay"
	| "terminalPowershellCounter"
	| "terminalZshClearEolMark"
	| "terminalZshOhMy"
	| "terminalZshP10k"
	| "terminalZdotdir"
	| "execaShellPath"
	| "diagnosticsEnabled"
	| "language"
	| "modeApiConfigs"
	| "customModePrompts"
	| "customSupportPrompts"
	| "enhancementApiConfigId"
	| "customCondensingPrompt"
	| "codebaseIndexConfig"
	| "codebaseIndexModels"
	| "profileThresholds"
	| "includeDiagnosticMessages"
	| "maxDiagnosticMessages"
	| "imageGenerationProvider"
	| "openRouterImageGenerationSelectedModel"
	| "includeTaskHistoryInEnhance"
	| "reasoningBlockCollapsed"
	| "enterBehavior"
	| "includeCurrentTime"
	| "includeCurrentCost"
	| "maxGitStatusFiles"
	| "requestDelaySeconds"
	| "showWorktreesInHomeScreen"
	| "disabledTools"
> & {
	lockApiConfigAcrossModes?: boolean
	version: string
	clineMessages: ClineMessage[]
	currentTaskId?: string
	currentTaskItem?: HistoryItem
	currentTaskTodos?: TodoItem[]
	apiConfiguration: ProviderSettings
	uriScheme?: string
	shouldShowAnnouncement: boolean
	taskHistory: HistoryItem[]
	writeDelayMs: number
	enableCheckpoints: boolean
	checkpointTimeout: number
	maxOpenTabsContext: number
	maxWorkspaceFiles: number
	showAliIgnoredFiles: boolean
	enableSubfolderRules: boolean
	maxReadFileLine?: number
	maxImageFileSize: number
	maxTotalImageSize: number
	experiments: Experiments
	mcpEnabled: boolean
	mode: string
	customModes: ModeConfig[]
	toolRequirements?: Record<string, boolean>
	cwd?: string
	renderContext: "sidebar" | "editor"
	settingsImportedAt?: number
	historyPreviewCollapsed?: boolean
	organizationAllowList: OrganizationAllowList
	autoCondenseContext: boolean
	autoCondenseContextPercent: number
	profileThresholds: Record<string, number>
	hasOpenedModeSelector: boolean
	openRouterImageApiKey?: string
	messageQueue?: QueuedMessage[]
	lastShownAnnouncementId?: string
	apiModelId?: string
	mcpServers?: McpServer[]
	openAiCodexIsAuthenticated?: boolean
	debug?: boolean
	/**
	 * Monotonically increasing sequence number for clineMessages state pushes.
	 * When present, the frontend should only apply clineMessages from a state push
	 * if its seq is greater than the last applied seq. This prevents stale state
	 * (captured during async getStateToPostToWebview) from overwriting newer messages.
	 */
	clineMessagesSeq?: number
}
export interface Command {
	name: string
	source: "global" | "project" | "built-in"
	filePath?: string
	description?: string
	argumentHint?: string
}
/**
 * WebviewMessage
 * Webview | CLI -> Extension
 */
export type ClineAskResponse = "yesButtonClicked" | "noButtonClicked" | "messageResponse" | "objectResponse"
export type AudioType = "notification" | "celebration" | "progress_loop"
export interface UpdateTodoListPayload {
	todos: any[]
}
export type EditQueuedMessagePayload = Pick<QueuedMessage, "id" | "text" | "images">
export interface WebviewMessage {
	type:
		| "updateTodoList"
		| "deleteMultipleTasksWithIds"
		| "currentApiConfigName"
		| "saveApiConfiguration"
		| "upsertApiConfiguration"
		| "deleteApiConfiguration"
		| "loadApiConfiguration"
		| "loadApiConfigurationById"
		| "renameApiConfiguration"
		| "getListApiConfiguration"
		| "customInstructions"
		| "webviewDidLaunch"
		| "newTask"
		| "askResponse"
		| "terminalOperation"
		| "clearTask"
		| "didShowAnnouncement"
		| "selectImages"
		| "exportCurrentTask"
		| "showTaskWithId"
		| "deleteTaskWithId"
		| "exportTaskWithId"
		| "importSettings"
		| "exportSettings"
		| "resetState"
		| "flushRouterModels"
		| "requestRouterModels"
		| "requestOpenAiModels"
		| "requestOllamaModels"
		| "requestLmStudioModels"
		| "requestVsCodeLmModels"
		| "openImage"
		| "saveImage"
		| "openFile"
		| "readFileContent"
		| "openMention"
		| "cancelTask"
		| "cancelAutoApproval"
		| "updateVSCodeSetting"
		| "getVSCodeSetting"
		| "vsCodeSetting"
		| "updateCondensingPrompt"
		| "playSound"
		| "playTts"
		| "stopTts"
		| "ttsEnabled"
		| "ttsSpeed"
		| "openKeyboardShortcuts"
		| "openMcpSettings"
		| "openProjectMcpSettings"
		| "restartMcpServer"
		| "refreshAllMcpServers"
		| "toggleToolAlwaysAllow"
		| "toggleToolEnabledForPrompt"
		| "toggleMcpServer"
		| "updateMcpTimeout"
		| "enhancePrompt"
		| "enhancedPrompt"
		| "draggedImages"
		| "deleteMessage"
		| "deleteMessageConfirm"
		| "submitEditedMessage"
		| "editMessageConfirm"
		| "searchCommits"
		| "setApiConfigPassword"
		| "mode"
		| "updatePrompt"
		| "getSystemPrompt"
		| "copySystemPrompt"
		| "systemPrompt"
		| "enhancementApiConfigId"
		| "autoApprovalEnabled"
		| "updateCustomMode"
		| "deleteCustomMode"
		| "setopenAiCustomModelInfo"
		| "openCustomModesSettings"
		| "checkpointDiff"
		| "checkpointRestore"
		| "deleteMcpServer"
		| "codebaseIndexEnabled"
		| "searchFiles"
		| "toggleApiConfigPin"
		| "hasOpenedModeSelector"
		| "lockApiConfigAcrossModes"
		| "openAiCodexSignIn"
		| "openAiCodexSignOut"
		| "condenseTaskContextRequest"
		| "requestIndexingStatus"
		| "startIndexing"
		| "stopIndexing"
		| "clearIndexData"
		| "indexingStatusUpdate"
		| "indexCleared"
		| "toggleWorkspaceIndexing"
		| "setAutoEnableDefault"
		| "focusPanelRequest"
		| "openExternal"
		| "switchTab"
		| "exportMode"
		| "exportModeResult"
		| "importMode"
		| "importModeResult"
		| "checkRulesDirectory"
		| "checkRulesDirectoryResult"
		| "saveCodeIndexSettingsAtomic"
		| "requestCodeIndexSecretStatus"
		| "requestCommands"
		| "openCommandFile"
		| "deleteCommand"
		| "createCommand"
		| "insertTextIntoTextarea"
		| "imageGenerationSettings"
		| "queueMessage"
		| "removeQueuedMessage"
		| "editQueuedMessage"
		| "dismissUpsell"
		| "getDismissedUpsells"
		| "openMarkdownPreview"
		| "updateSettings"
		| "allowedCommands"
		| "getTaskWithAggregatedCosts"
		| "deniedCommands"
		| "openDebugApiHistory"
		| "openDebugUiHistory"
		| "downloadErrorDiagnostics"
		| "requestOpenAiCodexRateLimits"
		| "refreshCustomTools"
		| "requestModes"
		| "switchMode"
		| "debugSetting"
		| "listWorktrees"
		| "createWorktree"
		| "deleteWorktree"
		| "switchWorktree"
		| "getAvailableBranches"
		| "getWorktreeDefaults"
		| "getWorktreeIncludeStatus"
		| "checkBranchWorktreeInclude"
		| "createWorktreeInclude"
		| "checkoutBranch"
		| "browseForWorktreePath"
		| "requestSkills"
		| "createSkill"
		| "deleteSkill"
		| "moveSkill"
		| "updateSkillModes"
		| "openSkillFile"
		| "renameTask"
	text?: string
	taskId?: string
	editedMessageContent?: string
	tab?: "settings" | "history" | "mcp" | "modes" | "chat"
	disabled?: boolean
	context?: string
	dataUri?: string
	askResponse?: ClineAskResponse
	apiConfiguration?: ProviderSettings
	images?: string[]
	bool?: boolean
	value?: number
	stepIndex?: number
	isLaunchAction?: boolean
	forceShow?: boolean
	commands?: string[]
	audioType?: AudioType
	serverName?: string
	toolName?: string
	alwaysAllow?: boolean
	isEnabled?: boolean
	mode?: string
	promptMode?: string | "enhance"
	customPrompt?: PromptComponent
	dataUrls?: string[]
	/** Generic payload for webview messages that use `values` */
	values?: Record<string, any>
	query?: string
	setting?: string
	slug?: string
	modeConfig?: ModeConfig
	timeout?: number
	payload?: WebViewMessagePayload
	source?: "global" | "project"
	skillName?: string
	/** @deprecated Use skillModeSlugs instead */
	skillMode?: string
	/** @deprecated Use newSkillModeSlugs instead */
	newSkillMode?: string
	skillDescription?: string
	/** Mode slugs for skill operations. undefined/empty = any mode */
	skillModeSlugs?: string[]
	/** Target mode slugs for updateSkillModes */
	newSkillModeSlugs?: string[]
	requestId?: string
	ids?: string[]
	terminalOperation?: "continue" | "abort"
	messageTs?: number
	restoreCheckpoint?: boolean
	historyPreviewCollapsed?: boolean
	filters?: {
		type?: string
		search?: string
		tags?: string[]
	}
	settings?: any
	url?: string
	config?: Record<string, any>
	hasContent?: boolean
	checkOnly?: boolean
	upsellId?: string
	list?: string[]
	organizationId?: string | null
	codeIndexSettings?: {
		codebaseIndexEnabled: boolean
		codebaseIndexQdrantUrl: string
		codebaseIndexEmbedderProvider:
			| "openai"
			| "ollama"
			| "openai-compatible"
			| "gemini"
			| "mistral"
			| "vercel-ai-gateway"
			| "bedrock"
			| "openrouter"
		codebaseIndexEmbedderBaseUrl?: string
		codebaseIndexEmbedderModelId: string
		codebaseIndexEmbedderModelDimension?: number
		codebaseIndexOpenAiCompatibleBaseUrl?: string
		codebaseIndexBedrockRegion?: string
		codebaseIndexBedrockProfile?: string
		codebaseIndexSearchMaxResults?: number
		codebaseIndexSearchMinScore?: number
		codebaseIndexOpenRouterSpecificProvider?: string
		codeIndexOpenAiKey?: string
		codeIndexQdrantApiKey?: string
		codebaseIndexOpenAiCompatibleApiKey?: string
		codebaseIndexGeminiApiKey?: string
		codebaseIndexMistralApiKey?: string
		codebaseIndexVercelAiGatewayApiKey?: string
		codebaseIndexOpenRouterApiKey?: string
	}
	updatedSettings?: RooCodeSettings
	/** Task configuration applied via `createTask()`. */
	taskConfiguration?: RooCodeSettings
	worktreePath?: string
	worktreeBranch?: string
	worktreeBaseBranch?: string
	worktreeCreateNewBranch?: boolean
	worktreeForce?: boolean
	worktreeNewWindow?: boolean
	worktreeIncludeContent?: string
}
export interface RequestOpenAiCodexRateLimitsMessage {
	type: "requestOpenAiCodexRateLimits"
}
export declare const checkoutDiffPayloadSchema: z.ZodObject<
	{
		ts: z.ZodOptional<z.ZodNumber>
		previousCommitHash: z.ZodOptional<z.ZodString>
		commitHash: z.ZodString
		mode: z.ZodEnum<["full", "checkpoint", "from-init", "to-current"]>
	},
	"strip",
	z.ZodTypeAny,
	{
		mode: "checkpoint" | "full" | "from-init" | "to-current"
		commitHash: string
		ts?: number | undefined
		previousCommitHash?: string | undefined
	},
	{
		mode: "checkpoint" | "full" | "from-init" | "to-current"
		commitHash: string
		ts?: number | undefined
		previousCommitHash?: string | undefined
	}
>
export type CheckpointDiffPayload = z.infer<typeof checkoutDiffPayloadSchema>
export declare const checkoutRestorePayloadSchema: z.ZodObject<
	{
		ts: z.ZodNumber
		commitHash: z.ZodString
		mode: z.ZodEnum<["preview", "restore"]>
	},
	"strip",
	z.ZodTypeAny,
	{
		ts: number
		mode: "preview" | "restore"
		commitHash: string
	},
	{
		ts: number
		mode: "preview" | "restore"
		commitHash: string
	}
>
export type CheckpointRestorePayload = z.infer<typeof checkoutRestorePayloadSchema>
export interface IndexingStatusPayload {
	state: "Standby" | "Indexing" | "Indexed" | "Error" | "Stopping"
	message: string
}
export interface IndexClearedPayload {
	success: boolean
	error?: string
}
export type WebViewMessagePayload =
	| CheckpointDiffPayload
	| CheckpointRestorePayload
	| IndexingStatusPayload
	| IndexClearedPayload
	| UpdateTodoListPayload
	| EditQueuedMessagePayload
export interface IndexingStatus {
	systemStatus: string
	message?: string
	processedItems: number
	totalItems: number
	currentItemUnit?: string
	workspacePath?: string
	workspaceEnabled?: boolean
	autoEnableDefault?: boolean
}
export interface IndexingStatusUpdateMessage {
	type: "indexingStatusUpdate"
	values: IndexingStatus
}
export interface LanguageModelChatSelector {
	vendor?: string
	family?: string
	version?: string
	id?: string
}
export interface ClineSayTool {
	tool:
		| "editedExistingFile"
		| "appliedDiff"
		| "newFileCreated"
		| "codebaseSearch"
		| "readFile"
		| "readCommandOutput"
		| "listFilesTopLevel"
		| "listFilesRecursive"
		| "searchFiles"
		| "switchMode"
		| "newTask"
		| "finishTask"
		| "generateImage"
		| "imageGenerated"
		| "runSlashCommand"
		| "updateTodoList"
		| "skill"
	path?: string
	readStart?: number
	readEnd?: number
	totalBytes?: number
	searchPattern?: string
	matchCount?: number
	diff?: string
	content?: string
	originalContent?: string
	diffStats?: {
		added: number
		removed: number
	}
	regex?: string
	filePattern?: string
	mode?: string
	reason?: string
	isOutsideWorkspace?: boolean
	isProtected?: boolean
	additionalFileCount?: number
	lineNumber?: number
	startLine?: number
	query?: string
	batchFiles?: Array<{
		path: string
		lineSnippet: string
		isOutsideWorkspace?: boolean
		key: string
		content?: string
	}>
	batchDiffs?: Array<{
		path: string
		changeCount: number
		key: string
		content: string
		diffStats?: {
			added: number
			removed: number
		}
		diffs?: Array<{
			content: string
			startLine?: number
		}>
	}>
	batchDirs?: Array<{
		path: string
		recursive: boolean
		isOutsideWorkspace?: boolean
		key: string
	}>
	question?: string
	imageData?: string
	command?: string
	args?: string
	source?: string
	description?: string
	skill?: string
}
export interface ClineAskUseMcpServer {
	serverName: string
	type: "use_mcp_tool" | "access_mcp_resource"
	toolName?: string
	arguments?: string
	uri?: string
	response?: string
}
export interface ClineApiReqInfo {
	request?: string
	tokensIn?: number
	tokensOut?: number
	cacheWrites?: number
	cacheReads?: number
	cost?: number
	cancelReason?: ClineApiReqCancelReason
	streamingFailedMessage?: string
	apiProtocol?: "anthropic" | "openai"
}
export type ClineApiReqCancelReason = "streaming_failed" | "user_cancelled"
//# sourceMappingURL=vscode-extension-host.d.ts.map
