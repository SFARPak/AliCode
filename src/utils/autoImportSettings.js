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
exports.autoImportSettings = autoImportSettings
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
const os = __importStar(require("os"))
const package_1 = require("../shared/package")
const fs_1 = require("./fs")
const i18n_1 = require("../i18n")
const importExport_1 = require("../core/config/importExport")
/**
 * Automatically imports AliCode settings from a specified path if it exists.
 * This function is called during extension activation to allow users to pre-configure
 * their settings by placing a settings file at a predefined location.
 */
async function autoImportSettings(outputChannel, { providerSettingsManager, contextProxy, customModesManager }) {
	try {
		// Get the auto-import settings path from VSCode settings
		const settingsPath = vscode.workspace.getConfiguration(package_1.Package.name).get("autoImportSettingsPath")
		if (!settingsPath || settingsPath.trim() === "") {
			outputChannel.appendLine("[AutoImport] No auto-import settings path specified, skipping auto-import")
			return
		}
		// Resolve the path (handle ~ for home directory and relative paths)
		const resolvedPath = resolvePath(settingsPath.trim())
		outputChannel.appendLine(`[AutoImport] Checking for settings file at: ${resolvedPath}`)
		// Check if the file exists
		if (!(await (0, fs_1.fileExistsAtPath)(resolvedPath))) {
			outputChannel.appendLine(`[AutoImport] Settings file not found at ${resolvedPath}, skipping auto-import`)
			return
		}
		// Attempt to import the configuration
		const result = await (0, importExport_1.importSettingsFromPath)(resolvedPath, {
			providerSettingsManager,
			contextProxy,
			customModesManager,
		})
		if (result.success) {
			outputChannel.appendLine(`[AutoImport] Successfully imported settings from ${resolvedPath}`)
			// Show a notification to the user
			vscode.window.showInformationMessage(
				(0, i18n_1.t)("common:info.auto_import_success", { filename: path.basename(resolvedPath) }),
			)
		} else {
			outputChannel.appendLine(`[AutoImport] Failed to import settings: ${result.error}`)
			// Show a warning but don't fail the extension activation
			vscode.window.showWarningMessage(
				(0, i18n_1.t)("common:warnings.auto_import_failed", { error: result.error }),
			)
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		outputChannel.appendLine(`[AutoImport] Unexpected error during auto-import: ${errorMessage}`)
		// Log error but don't fail extension activation
		console.warn("Auto-import settings error:", error)
	}
}
/**
 * Resolves a file path, handling home directory expansion and relative paths
 */
function resolvePath(settingsPath) {
	// Handle home directory expansion
	if (settingsPath.startsWith("~/")) {
		return path.join(os.homedir(), settingsPath.slice(2))
	}
	// Handle absolute paths
	if (path.isAbsolute(settingsPath)) {
		return settingsPath
	}
	// Handle relative paths (relative to home directory for safety)
	return path.join(os.homedir(), settingsPath)
}
