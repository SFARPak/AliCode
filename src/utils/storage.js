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
exports.getStorageBasePath = getStorageBasePath
exports.getTaskDirectoryPath = getTaskDirectoryPath
exports.getSettingsDirectoryPath = getSettingsDirectoryPath
exports.getCacheDirectoryPath = getCacheDirectoryPath
exports.promptForCustomStoragePath = promptForCustomStoragePath
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
const fs = __importStar(require("fs/promises"))
const fs_1 = require("fs")
const package_1 = require("../shared/package")
const i18n_1 = require("../i18n")
/**
 * Gets the base storage path for conversations
 * If a custom path is configured, uses that path
 * Otherwise uses the default VSCode extension global storage path
 */
async function getStorageBasePath(defaultPath) {
	// Get user-configured custom storage path
	let customStoragePath = ""
	try {
		// This is the line causing the error in tests
		const config = vscode.workspace.getConfiguration(package_1.Package.name)
		customStoragePath = config.get("customStoragePath", "")
	} catch (error) {
		console.warn("Could not access VSCode configuration - using default path")
		return defaultPath
	}
	// If no custom path is set, use default path
	if (!customStoragePath) {
		return defaultPath
	}
	try {
		// Ensure custom path exists
		await fs.mkdir(customStoragePath, { recursive: true })
		// Check directory write permission without creating temp files
		await fs.access(customStoragePath, fs_1.constants.R_OK | fs_1.constants.W_OK | fs_1.constants.X_OK)
		return customStoragePath
	} catch (error) {
		// If path is unusable, report error and fall back to default path
		console.error(`Custom storage path is unusable: ${error instanceof Error ? error.message : String(error)}`)
		if (vscode.window) {
			vscode.window.showErrorMessage(
				(0, i18n_1.t)("common:errors.custom_storage_path_unusable", { path: customStoragePath }),
			)
		}
		return defaultPath
	}
}
/**
 * Gets the storage directory path for a task
 */
async function getTaskDirectoryPath(globalStoragePath, taskId) {
	const basePath = await getStorageBasePath(globalStoragePath)
	const taskDir = path.join(basePath, "tasks", taskId)
	await fs.mkdir(taskDir, { recursive: true })
	return taskDir
}
/**
 * Gets the settings directory path
 */
async function getSettingsDirectoryPath(globalStoragePath) {
	const basePath = await getStorageBasePath(globalStoragePath)
	const settingsDir = path.join(basePath, "settings")
	await fs.mkdir(settingsDir, { recursive: true })
	return settingsDir
}
/**
 * Gets the cache directory path
 */
async function getCacheDirectoryPath(globalStoragePath) {
	const basePath = await getStorageBasePath(globalStoragePath)
	const cacheDir = path.join(basePath, "cache")
	await fs.mkdir(cacheDir, { recursive: true })
	return cacheDir
}
/**
 * Prompts the user to set a custom storage path
 * Displays an input box allowing the user to enter a custom path
 */
async function promptForCustomStoragePath() {
	if (!vscode.window || !vscode.workspace) {
		console.error("VS Code API not available")
		return
	}
	let currentPath = ""
	try {
		const currentConfig = vscode.workspace.getConfiguration(package_1.Package.name)
		currentPath = currentConfig.get("customStoragePath", "")
	} catch (error) {
		console.error("Could not access configuration")
		return
	}
	const result = await vscode.window.showInputBox({
		value: currentPath,
		placeHolder: (0, i18n_1.t)("common:storage.path_placeholder"),
		prompt: (0, i18n_1.t)("common:storage.prompt_custom_path"),
		validateInput: (input) => {
			if (!input) {
				return null // Allow empty value (use default path)
			}
			try {
				// Validate path format
				path.parse(input)
				// Check if path is absolute
				if (!path.isAbsolute(input)) {
					return (0, i18n_1.t)("common:storage.enter_absolute_path")
				}
				return null // Path format is valid
			} catch (e) {
				return (0, i18n_1.t)("common:storage.enter_valid_path")
			}
		},
	})
	// If user canceled the operation, result will be undefined
	if (result !== undefined) {
		try {
			const currentConfig = vscode.workspace.getConfiguration(package_1.Package.name)
			await currentConfig.update("customStoragePath", result, vscode.ConfigurationTarget.Global)
			if (result) {
				try {
					// Test if path is accessible
					await fs.mkdir(result, { recursive: true })
					await fs.access(result, fs_1.constants.R_OK | fs_1.constants.W_OK | fs_1.constants.X_OK)
					vscode.window.showInformationMessage(
						(0, i18n_1.t)("common:info.custom_storage_path_set", { path: result }),
					)
				} catch (error) {
					vscode.window.showErrorMessage(
						(0, i18n_1.t)("common:errors.cannot_access_path", {
							path: result,
							error: error instanceof Error ? error.message : String(error),
						}),
					)
				}
			} else {
				vscode.window.showInformationMessage((0, i18n_1.t)("common:info.default_storage_path"))
			}
		} catch (error) {
			console.error("Failed to update configuration", error)
		}
	}
}
