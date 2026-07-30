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
exports.handleNewTask = void 0
const vscode = __importStar(require("vscode"))
const package_1 = require("../shared/package")
const ClineProvider_1 = require("../core/webview/ClineProvider")
const i18n_1 = require("../i18n")
const handleNewTask = async (params) => {
	let prompt = params?.prompt
	if (!prompt) {
		prompt = await vscode.window.showInputBox({
			prompt: (0, i18n_1.t)("common:input.task_prompt"),
			placeHolder: (0, i18n_1.t)("common:input.task_placeholder"),
		})
	}
	if (!prompt) {
		await vscode.commands.executeCommand(`${package_1.Package.name}.SidebarProvider.focus`)
		return
	}
	await ClineProvider_1.ClineProvider.handleCodeAction("newTask", "NEW_TASK", { userInput: prompt })
}
exports.handleNewTask = handleNewTask
