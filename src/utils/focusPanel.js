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
exports.focusPanel = focusPanel
const vscode = __importStar(require("vscode"))
const package_1 = require("../shared/package")
const ClineProvider_1 = require("../core/webview/ClineProvider")
/**
 * Focus the active panel (either tab or sidebar)
 * @param tabPanel - The tab panel reference
 * @param sidebarPanel - The sidebar panel reference
 * @returns Promise that resolves when focus is complete
 */
async function focusPanel(tabPanel, sidebarPanel) {
	const panel = tabPanel || sidebarPanel
	if (!panel) {
		// If no panel is open, open the sidebar
		await vscode.commands.executeCommand(`workbench.view.extension.${package_1.Package.name}-ActivityBar`)
	} else if (panel === tabPanel && !panel.active) {
		// For tab panels, use reveal to focus
		panel.reveal(vscode.ViewColumn.Active, false)
	} else if (panel === sidebarPanel) {
		// For sidebar panels, focus the sidebar
		await vscode.commands.executeCommand(`${ClineProvider_1.ClineProvider.sideBarId}.focus`)
	}
}
