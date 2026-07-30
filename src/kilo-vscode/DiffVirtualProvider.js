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
exports.DiffVirtualProvider = void 0
const vscode = __importStar(require("vscode"))
const utils_1 = require("./utils")
const font_size_1 = require("./kilo-provider/font-size")
const review_utils_1 = require("./review-utils")
const review_settings_1 = require("./review-settings")
/**
 * DiffVirtualProvider opens a lightweight diff viewer for a single in-memory
 * file diff (not backed by git). Used by the permission approval dock to show
 * edit changes before the user approves or rejects them.
 */
class DiffVirtualProvider {
	extensionUri
	panel
	pending
	outputChannel
	fontConfigDisposable
	constructor(extensionUri) {
		this.extensionUri = extensionUri
		this.outputChannel = vscode.window.createOutputChannel("Kilo Diff Virtual")
	}
	log(...args) {
		;(0, review_utils_1.appendOutput)(this.outputChannel, "DiffVirtual", ...args)
	}
	open(diff) {
		this.pending = diff
		const filename = diff.file.split("/").pop() ?? diff.file
		const title = `Changes: ${filename}`
		if (this.panel) {
			this.panel.title = title
			this.panel.reveal(vscode.ViewColumn.One)
			this.pushData()
			return
		}
		const panel = vscode.window.createWebviewPanel("kilo-code.new.DiffVirtualPanel", title, vscode.ViewColumn.One, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [this.extensionUri],
		})
		panel.iconPath = {
			light: vscode.Uri.joinPath(this.extensionUri, "assets", "icons", "kilo-light.svg"),
			dark: vscode.Uri.joinPath(this.extensionUri, "assets", "icons", "kilo-dark.svg"),
		}
		panel.webview.html = this.getHtml(panel.webview)
		panel.webview.onDidReceiveMessage((msg) => this.onMessage(msg))
		this.fontConfigDisposable?.dispose()
		this.fontConfigDisposable = (0, font_size_1.watchFontSizeConfig)((msg) => this.post(msg))
		panel.onDidDispose(() => {
			this.log("Panel disposed")
			this.fontConfigDisposable?.dispose()
			this.fontConfigDisposable = undefined
			this.panel = undefined
			this.pending = undefined
		})
		this.panel = panel
	}
	onMessage(msg) {
		const type = msg.type
		if (type === "webviewReady") {
			this.post({
				type: "ready",
				vscodeLanguage: vscode.env.language,
				languageOverride: vscode.workspace.getConfiguration("kilo-code.new").get("language"),
				fontSize: (0, utils_1.getWebviewFontSize)(),
				workspaceDirectory: (0, review_utils_1.getWorkspaceRoot)(),
			})
			this.pushData()
			return
		}
		if (type === "diffVirtual.close") {
			this.panel?.dispose()
			return
		}
		if (type === "diffVirtual.setMarkdownRender" && typeof msg.render === "boolean") {
			void (0, review_settings_1.setDiffMarkdownRender)(msg.render)
		}
	}
	pushData() {
		if (!this.pending) return
		this.post({
			type: "diffVirtual.data",
			diff: this.pending,
			initialDiffStyle: this.pending.initialDiffStyle,
			markdownRender: (0, review_settings_1.getDiffMarkdownRender)(),
		})
	}
	post(message) {
		if (this.panel?.webview) void this.panel.webview.postMessage(message)
	}
	getHtml(webview) {
		return (0, utils_1.buildWebviewHtml)(webview, {
			scriptUri: webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "diff-virtual.js")),
			styleUri: webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "diff-virtual.css")),
			iconsBaseUri: webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "assets", "icons")),
			workerUri: webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "shiki-worker.js")),
			title: "Diff Virtual",
			extraStyles: "#root { display: flex; flex-direction: column; height: 100%; }",
		})
	}
	dispose() {
		this.fontConfigDisposable?.dispose()
		this.panel?.dispose()
		this.outputChannel.dispose()
	}
}
exports.DiffVirtualProvider = DiffVirtualProvider
