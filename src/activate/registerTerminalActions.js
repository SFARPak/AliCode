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
exports.registerTerminalActions = void 0
const vscode = __importStar(require("vscode"))
const commands_1 = require("../utils/commands")
const ClineProvider_1 = require("../core/webview/ClineProvider")
const Terminal_1 = require("../integrations/terminal/Terminal")
const i18n_1 = require("../i18n")
const registerTerminalActions = (context) => {
	registerTerminalAction(context, "terminalAddToContext", "TERMINAL_ADD_TO_CONTEXT")
	registerTerminalAction(context, "terminalFixCommand", "TERMINAL_FIX")
	registerTerminalAction(context, "terminalExplainCommand", "TERMINAL_EXPLAIN")
}
exports.registerTerminalActions = registerTerminalActions
const registerTerminalAction = (context, command, promptType) => {
	context.subscriptions.push(
		vscode.commands.registerCommand((0, commands_1.getTerminalCommand)(command), async (args) => {
			let content = args?.selection
			if (!content || content === "") {
				content = await Terminal_1.Terminal.getTerminalContents(
					promptType === "TERMINAL_ADD_TO_CONTEXT" ? -1 : 1,
				)
			}
			if (!content) {
				vscode.window.showWarningMessage((0, i18n_1.t)("common:warnings.no_terminal_content"))
				return
			}
			await ClineProvider_1.ClineProvider.handleTerminalAction(command, promptType, {
				terminalContent: content,
			})
		}),
	)
}
