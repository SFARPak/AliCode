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
exports.resolveDefaultSaveUri = resolveDefaultSaveUri
exports.saveLastExportPath = saveLastExportPath
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
/**
 * Resolves the default save URI for an export operation.
 * Priorities:
 * 1. Last used export path (if available)
 * 2. Active workspace folder (if useWorkspace is true)
 * 3. Fallback directory (e.g. Downloads or Documents)
 * 4. Default to just the filename (user's home/cwd)
 */
function resolveDefaultSaveUri(context, configKey, fileName, options = {}) {
	const { useWorkspace = true, fallbackDir } = options
	const lastExportPath = context.getValue(configKey)
	if (lastExportPath) {
		// Use the directory from the last export
		const lastDir = path.dirname(lastExportPath)
		return vscode.Uri.file(path.join(lastDir, fileName))
	} else {
		// Try workspace if enabled
		const workspaceFolders = vscode.workspace.workspaceFolders
		if (useWorkspace && workspaceFolders && workspaceFolders.length > 0) {
			return vscode.Uri.file(path.join(workspaceFolders[0].uri.fsPath, fileName))
		}
		// Fallback
		if (fallbackDir) {
			return vscode.Uri.file(path.join(fallbackDir, fileName))
		}
		// Default to cwd/home
		return vscode.Uri.file(fileName)
	}
}
async function saveLastExportPath(context, configKey, uri) {
	await context.setValue(configKey, uri.fsPath)
}
