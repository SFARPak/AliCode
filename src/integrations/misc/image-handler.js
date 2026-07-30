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
exports.openImage = openImage
exports.saveImage = saveImage
const path = __importStar(require("path"))
const os = __importStar(require("os"))
const vscode = __importStar(require("vscode"))
const path_1 = require("../../utils/path")
const i18n_1 = require("../../i18n")
async function openImage(dataUriOrPath, options) {
	// Check if it's a file path (absolute or relative)
	const isFilePath =
		!dataUriOrPath.startsWith("data:") &&
		!dataUriOrPath.startsWith("http:") &&
		!dataUriOrPath.startsWith("https:") &&
		!dataUriOrPath.startsWith("vscode-resource:") &&
		!dataUriOrPath.startsWith("file+.vscode-resource")
	if (isFilePath) {
		// Handle file path - open directly in VSCode
		try {
			// Resolve the path relative to workspace if needed
			let filePath = dataUriOrPath
			if (!path.isAbsolute(filePath)) {
				const workspacePath = (0, path_1.getWorkspacePath)()
				if (workspacePath) {
					filePath = path.join(workspacePath, filePath)
				}
			}
			const fileUri = vscode.Uri.file(filePath)
			// Check if this is a copy action
			if (options?.values?.action === "copy") {
				await vscode.env.clipboard.writeText(filePath)
				vscode.window.showInformationMessage((0, i18n_1.t)("common:info.path_copied_to_clipboard"))
				return
			}
			// Open the image file directly
			await vscode.commands.executeCommand("vscode.open", fileUri)
		} catch (error) {
			vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.error_opening_image", { error }))
		}
		return
	}
	// Handle data URI (existing logic)
	const matches = dataUriOrPath.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
	if (!matches) {
		vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.invalid_data_uri"))
		return
	}
	const [, format, base64Data] = matches
	const imageBuffer = Buffer.from(base64Data, "base64")
	// Default behavior: open the image
	const tempFilePath = path.join(os.tmpdir(), `temp_image_${Date.now()}.${format}`)
	try {
		await vscode.workspace.fs.writeFile(vscode.Uri.file(tempFilePath), imageBuffer)
		// Check if this is a copy action
		if (options?.values?.action === "copy") {
			try {
				// Read the image file
				const imageData = await vscode.workspace.fs.readFile(vscode.Uri.file(tempFilePath))
				// Convert to base64 for clipboard
				const base64Image = Buffer.from(imageData).toString("base64")
				const dataUri = `data:image/${format};base64,${base64Image}`
				// Use vscode.env.clipboard to copy the data URI
				// Note: VSCode doesn't support copying binary image data directly to clipboard
				// So we copy the data URI which can be pasted in many applications
				await vscode.env.clipboard.writeText(dataUri)
				vscode.window.showInformationMessage((0, i18n_1.t)("common:info.image_copied_to_clipboard"))
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.error_copying_image", { errorMessage }))
			} finally {
				// Clean up temp file
				try {
					await vscode.workspace.fs.delete(vscode.Uri.file(tempFilePath))
				} catch {
					// Ignore cleanup errors
				}
			}
			return
		}
		await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(tempFilePath))
	} catch (error) {
		vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.error_opening_image", { error }))
	}
}
async function saveImage(dataUri, defaultUri) {
	const matches = dataUri.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
	if (!matches) {
		vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.invalid_data_uri"))
		return undefined
	}
	const [, format, base64Data] = matches
	const imageBuffer = Buffer.from(base64Data, "base64")
	// Show save dialog
	const saveUri = await vscode.window.showSaveDialog({
		filters: {
			Images: [format],
			"All Files": ["*"],
		},
		defaultUri: defaultUri,
	})
	if (!saveUri) {
		// User cancelled the save dialog
		return undefined
	}
	try {
		// Write the image to the selected location
		await vscode.workspace.fs.writeFile(saveUri, imageBuffer)
		vscode.window.showInformationMessage((0, i18n_1.t)("common:info.image_saved", { path: saveUri.fsPath }))
		return saveUri
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		vscode.window.showErrorMessage((0, i18n_1.t)("common:errors.error_saving_image", { errorMessage }))
		return undefined
	}
}
