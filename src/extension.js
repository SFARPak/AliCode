"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
exports.activate = activate
exports.deactivate = deactivate
const vscode = __importStar(require("vscode"))
const dotenvx = __importStar(require("@dotenvx/dotenvx"))
const fs = __importStar(require("fs"))
const path = __importStar(require("path"))
// Load environment variables from .env file
// The extension-level .env is optional (not shipped in production builds).
// Avoid calling dotenvx when the file doesn't exist, otherwise dotenvx emits
// a noisy [MISSING_ENV_FILE] error to the extension host console.
const envPath = path.join(__dirname, "..", ".env")
if (fs.existsSync(envPath)) {
	try {
		dotenvx.config({ path: envPath })
	} catch (e) {
		// Best-effort only: never fail extension activation due to optional env loading.
		console.warn("Failed to load environment variables:", e)
	}
}
const core_1 = require("@ali-code/core")
require("./utils/path") // Necessary to have access to String.prototype.toPosix.
const networkProxy_1 = require("./utils/networkProxy")
const package_1 = require("./shared/package")
const language_1 = require("./shared/language")
const ContextProxy_1 = require("./core/config/ContextProxy")
const ClineProvider_1 = require("./core/webview/ClineProvider")
const DiffViewProvider_1 = require("./integrations/editor/DiffViewProvider")
const TerminalRegistry_1 = require("./integrations/terminal/TerminalRegistry")
const VscodeHost_1 = require("./kilo-vscode/VscodeHost")
const oauth_1 = require("./integrations/openai-codex/oauth")
const McpServerManager_1 = require("./services/mcp/McpServerManager")
const manager_1 = require("./services/code-index/manager")
const migrateSettings_1 = require("./utils/migrateSettings")
const autoImportSettings_1 = require("./utils/autoImportSettings")
const api_1 = require("./extension/api")
const activate_1 = require("./activate")
const i18n_1 = require("./i18n")
const modelCache_1 = require("./api/providers/fetchers/modelCache")
const KiloConnectionService_1 = require("./kilo-vscode/KiloConnectionService")
const KiloClawProvider_1 = require("./kilo-vscode/KiloClawProvider")
const MarketplacePanelProvider_1 = require("./kilo-vscode/MarketplacePanelProvider")
const AgentManagerProvider_1 = require("./kilo-vscode/AgentManagerProvider")
const SettingsEditorProvider_1 = require("./kilo-vscode/SettingsEditorProvider")
const SubAgentViewerProvider_1 = require("./kilo-vscode/SubAgentViewerProvider")
const RemoteStatusService_1 = require("./kilo-vscode/RemoteStatusService")
/**
 * Built using https://github.com/microsoft/vscode-webview-ui-toolkit
 *
 * Inspired by:
 *  - https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/weather-webview
 *  - https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/frameworks/hello-world-react-cra
 */
let outputChannel
let extensionContext
/**
 * Check if we should auto-open the AliCode sidebar after switching to a worktree.
 * This is called during extension activation to handle the worktree auto-open flow.
 */
async function checkWorktreeAutoOpen(context, outputChannel) {
	try {
		const worktreeAutoOpenPath = context.globalState.get("worktreeAutoOpenPath")
		if (!worktreeAutoOpenPath) {
			return
		}
		const workspaceFolders = vscode.workspace.workspaceFolders
		if (!workspaceFolders || workspaceFolders.length === 0) {
			return
		}
		const currentPath = workspaceFolders[0].uri.fsPath
		// Normalize paths for comparison
		const normalizePath = (p) => p.replace(/\/+$/, "").replace(/\\+/g, "/").toLowerCase()
		// Check if current workspace matches the worktree path
		if (normalizePath(currentPath) === normalizePath(worktreeAutoOpenPath)) {
			// Clear the state first to prevent re-triggering
			await context.globalState.update("worktreeAutoOpenPath", undefined)
			outputChannel.appendLine(`[Worktree] Auto-opening AliCode sidebar for worktree: ${worktreeAutoOpenPath}`)
			// Open the AliCode sidebar with a slight delay to ensure UI is ready
			setTimeout(async () => {
				try {
					await vscode.commands.executeCommand("alicode.plusButtonClicked")
				} catch (error) {
					outputChannel.appendLine(
						`[Worktree] Error auto-opening sidebar: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}, 500)
		}
	} catch (error) {
		outputChannel.appendLine(
			`[Worktree] Error checking worktree auto-open: ${error instanceof Error ? error.message : String(error)}`,
		)
	}
}
// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed.
async function activate(context) {
	extensionContext = context
	outputChannel = vscode.window.createOutputChannel(package_1.Package.outputChannel)
	context.subscriptions.push(outputChannel)
	outputChannel.appendLine(`${package_1.Package.name} extension activated - ${JSON.stringify(package_1.Package)}`)
	// Initialize network proxy configuration early, before any network requests.
	// When proxyUrl is configured, all HTTP/HTTPS traffic will be routed through it.
	// Only applied in debug mode (F5).
	await (0, networkProxy_1.initializeNetworkProxy)(context, outputChannel)
	// Set extension path for custom tool registry to find bundled esbuild
	core_1.customToolRegistry.setExtensionPath(context.extensionPath)
	// Migrate old settings to new
	await (0, migrateSettings_1.migrateSettings)(context, outputChannel)
	// Initialize i18n for internationalization support.
	;(0, i18n_1.initializeI18n)(
		context.globalState.get("language") ?? (0, language_1.formatLanguage)(vscode.env.language),
	)
	// Initialize terminal shell execution handlers.
	TerminalRegistry_1.TerminalRegistry.initialize()
	// Initialize OpenAI Codex OAuth manager for ChatGPT subscription-based access.
	oauth_1.openAiCodexOAuthManager.initialize(context, (message) => outputChannel.appendLine(message))
	// Get default commands from configuration.
	const defaultCommands = vscode.workspace.getConfiguration(package_1.Package.name).get("allowedCommands") || []
	// Initialize global state if not already set.
	if (!context.globalState.get("allowedCommands")) {
		context.globalState.update("allowedCommands", defaultCommands)
	}
	const contextProxy = await ContextProxy_1.ContextProxy.getInstance(context)
	// Initialize code index managers for all workspace folders.
	const codeIndexManagers = []
	if (vscode.workspace.workspaceFolders) {
		for (const folder of vscode.workspace.workspaceFolders) {
			const manager = manager_1.CodeIndexManager.getInstance(context, folder.uri.fsPath)
			if (manager) {
				codeIndexManagers.push(manager)
				// Initialize in background; do not block extension activation
				void manager.initialize(contextProxy).catch((error) => {
					const message = error instanceof Error ? error.message : String(error)
					outputChannel.appendLine(
						`[CodeIndexManager] Error during background CodeIndexManager configuration/indexing for ${folder.uri.fsPath}: ${message}`,
					)
				})
				context.subscriptions.push(manager)
			}
		}
	}
	const provider = new ClineProvider_1.ClineProvider(context, outputChannel, "sidebar", contextProxy)
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClineProvider_1.ClineProvider.sideBarId, provider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)
	// Initialize shared connection service and remote status service for Kilo providers
	const connectionService = new KiloConnectionService_1.KiloConnectionService(context)
	const remoteService = new RemoteStatusService_1.RemoteStatusService()
	context.subscriptions.push(remoteService)
	connectionService.setRemoteService(remoteService)
	// Create additional Kilo providers
	const kiloClawProvider = new KiloClawProvider_1.KiloClawProvider(context.extensionUri, connectionService)
	// Instantiate VscodeHost to satisfy Host interface for AgentManagerProvider
	const vscodeHost = new VscodeHost_1.VscodeHost(context.extensionUri, connectionService, context, remoteService)
	const agentManagerProvider = new AgentManagerProvider_1.AgentManagerProvider(vscodeHost, connectionService)
	const settingsEditorProvider = new SettingsEditorProvider_1.SettingsEditorProvider(
		context.extensionUri,
		connectionService,
		context,
	)
	const marketplacePanelProvider = new MarketplacePanelProvider_1.MarketplacePanelProvider(
		context.extensionUri,
		connectionService,
		context,
	)
	const subAgentViewerProvider = new SubAgentViewerProvider_1.SubAgentViewerProvider(
		context.extensionUri,
		connectionService,
		context,
	)
	// Register providers and their serializers
	context.subscriptions.push(
		kiloClawProvider,
		agentManagerProvider,
		settingsEditorProvider,
		marketplacePanelProvider,
		subAgentViewerProvider,
		// Serializers
		vscode.window.registerWebviewPanelSerializer(KiloClawProvider_1.KiloClawProvider.viewType, {
			deserializeWebviewPanel(panel) {
				kiloClawProvider.restorePanel(panel)
				return Promise.resolve()
			},
		}),
		vscode.window.registerWebviewPanelSerializer(AgentManagerProvider_1.AgentManagerProvider.viewType, {
			deserializeWebviewPanel(panel) {
				// Simplified: dispose on restore
				panel.dispose()
				return Promise.resolve()
			},
		}),
		vscode.window.registerWebviewPanelSerializer("alicode.settingsPanel", {
			deserializeWebviewPanel(panel) {
				settingsEditorProvider.deserializePanel(panel)
				return Promise.resolve()
			},
		}),
		vscode.window.registerWebviewPanelSerializer("alicode.profilePanel", {
			deserializeWebviewPanel(panel) {
				settingsEditorProvider.deserializePanel(panel)
				return Promise.resolve()
			},
		}),
		vscode.window.registerWebviewPanelSerializer(MarketplacePanelProvider_1.MarketplacePanelProvider.viewType, {
			deserializeWebviewPanel(panel) {
				marketplacePanelProvider.deserializePanel(panel)
				return Promise.resolve()
			},
		}),
		vscode.window.registerWebviewPanelSerializer("alicode.SubAgentViewerPanel", {
			deserializeWebviewPanel(panel) {
				panel.dispose()
				return Promise.resolve()
			},
		}),
	)
	// Check for worktree auto-open path (set when switching to a worktree)
	await checkWorktreeAutoOpen(context, outputChannel)
	// Auto-import configuration if specified in settings.
	try {
		await (0, autoImportSettings_1.autoImportSettings)(outputChannel, {
			providerSettingsManager: provider.providerSettingsManager,
			contextProxy: provider.contextProxy,
			customModesManager: provider.customModesManager,
		})
	} catch (error) {
		outputChannel.appendLine(
			`[AutoImport] Error during auto-import: ${error instanceof Error ? error.message : String(error)}`,
		)
	}
	;(0, activate_1.registerCommands)({ context, outputChannel, provider })
	/**
	 * We use the text document content provider API to show the left side for diff
	 * view by creating a virtual document for the original content. This makes it
	 * readonly so users know to edit the right side if they want to keep their changes.
	 *
	 * This API allows you to create readonly documents in VSCode from arbitrary
	 * sources, and works by claiming an uri-scheme for which your provider then
	 * returns text contents. The scheme must be provided when registering a
	 * provider and cannot change afterwards.
	 *
	 * Note how the provider doesn't create uris for virtual documents - its role
	 * is to provide contents given such an uri. In return, content providers are
	 * wired into the open document logic so that providers are always considered.
	 *
	 * https://code.visualstudio.com/api/extension-guides/virtual-documents
	 */
	const diffContentProvider = new (class {
		provideTextDocumentContent(uri) {
			return Buffer.from(uri.query, "base64").toString("utf-8")
		}
	})()
	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			DiffViewProvider_1.DIFF_VIEW_URI_SCHEME,
			diffContentProvider,
		),
	)
	context.subscriptions.push(vscode.window.registerUriHandler({ handleUri: activate_1.handleUri }))
	// Register code actions provider.
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider({ pattern: "**/*" }, new activate_1.CodeActionProvider(), {
			providedCodeActionKinds: activate_1.CodeActionProvider.providedCodeActionKinds,
		}),
	)
	;(0, activate_1.registerCodeActions)(context)
	;(0, activate_1.registerTerminalActions)(context)
	// Allows other extensions to activate once Ali is ready.
	vscode.commands.executeCommand(`${package_1.Package.name}.activationCompleted`)
	// Implements the `AliCodeAPI` interface.
	const socketPath = process.env.ROO_CODE_IPC_SOCKET_PATH
	const enableLogging = typeof socketPath === "string"
	// Watch the core files and automatically reload the extension host.
	if (process.env.NODE_ENV === "development") {
		const watchPaths = [
			{ path: context.extensionPath, pattern: "**/*.ts" },
			{ path: path.join(context.extensionPath, "../packages/types"), pattern: "**/*.ts" },
		]
		console.log(
			`♻️♻️♻️ Core auto-reloading: Watching for changes in ${watchPaths.map(({ path }) => path).join(", ")}`,
		)
		// Create a debounced reload function to prevent excessive reloads
		let reloadTimeout
		const DEBOUNCE_DELAY = 1_000
		const debouncedReload = (uri) => {
			if (reloadTimeout) {
				clearTimeout(reloadTimeout)
			}
			console.log(`♻️ ${uri.fsPath} changed; scheduling reload...`)
			reloadTimeout = setTimeout(() => {
				console.log(`♻️ Reloading host after debounce delay...`)
				vscode.commands.executeCommand("workbench.action.reloadWindow")
			}, DEBOUNCE_DELAY)
		}
		watchPaths.forEach(({ path: watchPath, pattern }) => {
			const relPattern = new vscode.RelativePattern(vscode.Uri.file(watchPath), pattern)
			const watcher = vscode.workspace.createFileSystemWatcher(relPattern, false, false, false)
			// Listen to all change types to ensure symlinked file updates trigger reloads.
			watcher.onDidChange(debouncedReload)
			watcher.onDidCreate(debouncedReload)
			watcher.onDidDelete(debouncedReload)
			context.subscriptions.push(watcher)
		})
		// Clean up the timeout on deactivation
		context.subscriptions.push({
			dispose: () => {
				if (reloadTimeout) {
					clearTimeout(reloadTimeout)
				}
			},
		})
	}
	// Initialize background model cache refresh
	;(0, modelCache_1.initializeModelCacheRefresh)()
	return new api_1.API(outputChannel, provider, socketPath, enableLogging)
}
// This method is called when your extension is deactivated.
async function deactivate() {
	outputChannel.appendLine(`${package_1.Package.name} extension deactivated`)
	await McpServerManager_1.McpServerManager.cleanup(extensionContext)
	TerminalRegistry_1.TerminalRegistry.cleanup()
}
