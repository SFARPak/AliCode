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
exports.DiffViewerProvider = void 0
const vscode = __importStar(require("vscode"))
const review_utils_1 = require("../review-utils")
const review_settings_1 = require("../review-settings")
const utils_1 = require("../utils")
const font_size_1 = require("../kilo-provider/font-size")
const turn_1 = require("./sources/turn")
const SourceController_1 = require("./SourceController")
/**
 * Single global "Changes" panel. Owns the webview panel lifecycle and
 * routes webview messages to a SourceController, which owns the active
 * DiffSource.
 */
class DiffViewerProvider {
	extensionUri
	connection
	catalog
	static viewType = "kilo-code.new.DiffViewerPanel"
	panel
	ctx
	controller
	panelDisposables = []
	commentHandler
	fontConfigDisposable
	baseBranchOverride
	sessionIdProvider
	output
	constructor(extensionUri, connection, catalog, opts = {}) {
		this.extensionUri = extensionUri
		this.connection = connection
		this.catalog = catalog
		this.sessionIdProvider = opts.sessionIdProvider ?? (() => undefined)
		this.output = vscode.window.createOutputChannel("Kilo Diff Panel")
	}
	setCommentHandler(handler) {
		this.commentHandler = handler
	}
	openPanel(ctx) {
		this.ctx = { ...ctx, baseBranchOverride: this.baseBranchOverride }
		if (this.panel && this.controller) {
			this.panel.reveal(this.panel.viewColumn ?? vscode.ViewColumn.One)
			this.controller.setContext(this.ctx)
			const nextId = this.catalog.defaultSourceId(this.ctx)
			if (nextId && nextId !== this.controller.currentId) this.swap(nextId)
			return
		}
		this.createPanel()
	}
	/**
	 * Entry point for the `kilo-code.new.showChanges` command. Composes the
	 * PanelContext from the arg + injected session/workspace lookups so
	 * callers don't have to know about it.
	 */
	openFromCommand(arg) {
		const sessionId = arg?.sessionId ?? this.sessionIdProvider()
		const turnInitialSourceId =
			arg?.turnId && sessionId ? (0, turn_1.turnSourceId)(sessionId, arg.turnId) : undefined
		this.openPanel({
			workspaceRoot: (0, review_utils_1.getWorkspaceRoot)(),
			sessionId,
			initialSourceId: turnInitialSourceId ?? arg?.initialSourceId,
			hidePicker: !!turnInitialSourceId,
		})
	}
	/**
	 * Called when VS Code restores a serialized panel after restart. State
	 * is not persisted, so we discard the panel instead of rewiring it.
	 */
	deserializePanel(panel) {
		panel.dispose()
	}
	dispose() {
		this.controller?.dispose()
		this.controller = undefined
		this.fontConfigDisposable?.dispose()
		this.fontConfigDisposable = undefined
		this.disposePanel()
		this.output.dispose()
	}
	createPanel() {
		const panel = vscode.window.createWebviewPanel(DiffViewerProvider.viewType, "Changes", vscode.ViewColumn.One, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [this.extensionUri],
		})
		panel.iconPath = {
			light: vscode.Uri.joinPath(this.extensionUri, "assets", "icons", "kilo-light.svg"),
			dark: vscode.Uri.joinPath(this.extensionUri, "assets", "icons", "kilo-dark.svg"),
		}
		panel.webview.html = this.getHtml(panel.webview)
		this.panel = panel
		this.controller = new SourceController_1.SourceController(
			(id, ctx) => this.catalog.build(id, ctx),
			(ctx) => this.catalog.listAvailable(ctx),
			(msg) => void panel.webview.postMessage(msg),
		)
		if (this.ctx) this.controller.setContext(this.ctx)
		this.fontConfigDisposable?.dispose()
		this.fontConfigDisposable = (0, font_size_1.watchFontSizeConfig)((msg) => void panel.webview.postMessage(msg))
		this.panelDisposables.push(
			panel.webview.onDidReceiveMessage((msg) => this.onMessage(msg)),
			panel.onDidDispose(() => this.onPanelDisposed()),
		)
	}
	onPanelDisposed() {
		this.log("Panel disposed")
		this.controller?.dispose()
		this.controller = undefined
		this.fontConfigDisposable?.dispose()
		this.fontConfigDisposable = undefined
		this.baseBranchOverride = undefined
		this.disposePanel()
	}
	disposePanel() {
		for (const d of this.panelDisposables) d.dispose()
		this.panelDisposables = []
		this.panel = undefined
	}
	onMessage(msg) {
		const handler = this.messageHandlers[msg.type]
		handler?.(msg)
	}
	messageHandlers = {
		webviewReady: () => this.onWebviewReady(),
		selectSource: (msg) => {
			if (typeof msg.id === "string") this.swap(msg.id)
		},
		"diffViewer.sendComments": (msg) => {
			if (Array.isArray(msg.comments)) this.commentHandler?.(msg.comments, !!msg.autoSend)
		},
		"diffViewer.close": () => this.panel?.dispose(),
		"diffViewer.setDiffStyle": () => {},
		"diffViewer.setMarkdownRender": (msg) => {
			if (typeof msg.render === "boolean") void (0, review_settings_1.setDiffMarkdownRender)(msg.render)
		},
		"diffViewer.revertFile": (msg) => {
			if (typeof msg.file === "string") void this.controller?.revertFile(msg.file)
		},
		"diffViewer.requestFile": (msg) => {
			if (typeof msg.file === "string") void this.controller?.requestFile(msg.file)
		},
		"diffViewer.requestBranches": () => {
			void this.sendBranches()
		},
		"diffViewer.setBaseBranch": (msg) => {
			const branch = typeof msg.branch === "string" && msg.branch.length > 0 ? msg.branch : undefined
			this.baseBranchOverride = branch
			if (this.ctx) {
				this.ctx = { ...this.ctx, baseBranchOverride: branch }
				this.controller?.setContext(this.ctx)
			}
			void this.controller?.reactivate()
			void this.sendBranches()
		},
		openFile: (msg) => {
			if (typeof msg.filePath !== "string") return
			;(0, review_utils_1.openWorkspaceRelativeFile)(
				msg.filePath,
				typeof msg.line === "number" ? msg.line : undefined,
			)
		},
	}
	async sendBranches() {
		if (!this.panel) return
		try {
			const result = await this.catalog.listWorkspaceBranches(this.baseBranchOverride)
			if (!result || !this.panel) return
			void this.panel.webview.postMessage({
				type: "diffViewer.branches",
				branches: result.branches,
				defaultBranch: result.defaultBranch,
				autoBase: result.autoBase,
				currentBase: result.currentBase,
				isAuto: result.isAuto,
				currentBranch: result.currentBranch,
			})
		} catch (err) {
			this.log("Failed to list workspace branches:", err instanceof Error ? err.message : String(err))
		}
	}
	onWebviewReady() {
		if (!this.panel) return
		void this.panel.webview.postMessage({
			type: "ready",
			vscodeLanguage: vscode.env.language,
			languageOverride: vscode.workspace.getConfiguration("kilo-code.new").get("language"),
			fontSize: (0, utils_1.getWebviewFontSize)(),
			workspaceDirectory: (0, review_utils_1.getWorkspaceRoot)(),
		})
		void this.panel.webview.postMessage({
			type: "diffViewer.markdownRender",
			render: (0, review_settings_1.getDiffMarkdownRender)(),
		})
		const initial = this.ctx ? this.catalog.defaultSourceId(this.ctx) : undefined
		if (initial) this.swap(initial)
	}
	swap(id) {
		if (!this.panel || !this.controller) return
		if (this.controller.currentId === id) return
		void this.panel.webview.postMessage({ type: "diffViewer.loading", loading: true })
		void this.panel.webview.postMessage({ type: "diffViewer.diffs", diffs: [] })
		void this.panel.webview.postMessage({ type: "diffViewer.notice", notice: undefined })
		void this.controller.activate(id).catch((err) => {
			const message = err instanceof Error ? err.message : String(err)
			this.log("Failed to activate source:", message)
		})
	}
	getHtml(webview) {
		return (0, utils_1.buildWebviewHtml)(webview, {
			scriptUri: webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "diff-viewer.js")),
			styleUri: webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "diff-viewer.css")),
			iconsBaseUri: webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "assets", "icons")),
			workerUri: webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "shiki-worker.js")),
			title: "Changes",
			port: this.connection.getServerInfo()?.port,
			extraStyles: "#root { display: flex; flex-direction: column; }",
		})
	}
	log(...args) {
		;(0, review_utils_1.appendOutput)(this.output, "DiffViewerProvider", ...args)
	}
}
exports.DiffViewerProvider = DiffViewerProvider
