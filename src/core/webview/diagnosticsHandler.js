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
exports.generateErrorDiagnostics = generateErrorDiagnostics
const path = __importStar(require("path"))
const os = __importStar(require("os"))
const fs = __importStar(require("fs/promises"))
const vscode = __importStar(require("vscode"))
const storage_1 = require("../../utils/storage")
const fs_1 = require("../../utils/fs")
/**
 * Generates an error diagnostics file containing error metadata and API conversation history.
 * The file is created in the system temp directory and opened in VS Code for the user to review
 * before sharing with support.
 */
async function generateErrorDiagnostics(params) {
	const { taskId, globalStoragePath, values, log } = params
	try {
		const taskDirPath = await (0, storage_1.getTaskDirectoryPath)(globalStoragePath, taskId)
		// Load API conversation history from the same file used by openDebugApiHistory
		const apiHistoryPath = path.join(taskDirPath, "api_conversation_history.json")
		let history = []
		if (await (0, fs_1.fileExistsAtPath)(apiHistoryPath)) {
			const content = await fs.readFile(apiHistoryPath, "utf8")
			try {
				history = JSON.parse(content)
			} catch {
				// If parsing fails, fall back to empty history but still generate diagnostics file
				vscode.window.showErrorMessage("Failed to parse api_conversation_history.json")
			}
		}
		const diagnostics = {
			error: {
				timestamp: values?.timestamp ?? new Date().toISOString(),
				version: values?.version ?? "",
				provider: values?.provider ?? "",
				model: values?.model ?? "",
				details: values?.details ?? "",
			},
			history,
		}
		// Prepend human-readable guidance comments before the JSON payload
		const headerComment =
			"// Please attach this file to a GitHub issue if it helps diagnose the problem faster\n" +
			"// Just make sure you're OK sharing the contents of the conversation below.\n\n"
		const jsonContent = JSON.stringify(diagnostics, null, 2)
		const fullContent = headerComment + jsonContent
		// Create a temporary diagnostics file
		const tmpDir = os.tmpdir()
		const timestamp = Date.now()
		const tempFileName = `roo-diagnostics-${taskId.slice(0, 8)}-${timestamp}.json`
		const tempFilePath = path.join(tmpDir, tempFileName)
		await fs.writeFile(tempFilePath, fullContent, "utf8")
		// Open the diagnostics file in VS Code
		const doc = await vscode.workspace.openTextDocument(tempFilePath)
		await vscode.window.showTextDocument(doc, { preview: true })
		return { success: true, filePath: tempFilePath }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		log(`Error generating diagnostics: ${errorMessage}`)
		vscode.window.showErrorMessage(`Failed to generate diagnostics: ${errorMessage}`)
		return { success: false, error: errorMessage }
	}
}
