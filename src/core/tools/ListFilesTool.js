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
exports.listFilesTool = exports.ListFilesTool = void 0
const path = __importStar(require("path"))
const responses_1 = require("../prompts/responses")
const list_files_1 = require("../../services/glob/list-files")
const path_1 = require("../../utils/path")
const pathUtils_1 = require("../../utils/pathUtils")
const BaseTool_1 = require("./BaseTool")
class ListFilesTool extends BaseTool_1.BaseTool {
	name = "list_files"
	async execute(params, task, callbacks) {
		const { path: relDirPath, recursive } = params
		const { askApproval, handleError, pushToolResult } = callbacks
		try {
			if (!relDirPath) {
				task.consecutiveMistakeCount++
				task.recordToolError("list_files")
				task.didToolFailInCurrentTurn = true
				pushToolResult(await task.sayAndCreateMissingParamError("list_files", "path"))
				return
			}
			task.consecutiveMistakeCount = 0
			const absolutePath = path.resolve(task.cwd, relDirPath)
			const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
			const [files, didHitLimit] = await (0, list_files_1.listFiles)(absolutePath, recursive || false, 200)
			const { showAliIgnoredFiles = false } = (await task.providerRef.deref()?.getState()) ?? {}
			const result = responses_1.formatResponse.formatFilesList(
				absolutePath,
				files,
				didHitLimit,
				task.aliIgnoreController,
				showAliIgnoredFiles,
				task.aliProtectedController,
			)
			const sharedMessageProps = {
				tool: !recursive ? "listFilesTopLevel" : "listFilesRecursive",
				path: (0, path_1.getReadablePath)(task.cwd, relDirPath),
				isOutsideWorkspace,
			}
			const completeMessage = JSON.stringify({ ...sharedMessageProps, content: result })
			const didApprove = await askApproval("tool", completeMessage)
			if (!didApprove) {
				return
			}
			pushToolResult(result)
		} catch (error) {
			await handleError("listing files", error)
		}
	}
	async handlePartial(task, block) {
		const relDirPath = block.params.path
		const recursiveRaw = block.params.recursive
		const recursive = recursiveRaw?.toLowerCase() === "true"
		const absolutePath = relDirPath ? path.resolve(task.cwd, relDirPath) : task.cwd
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
		const sharedMessageProps = {
			tool: !recursive ? "listFilesTopLevel" : "listFilesRecursive",
			path: (0, path_1.getReadablePath)(task.cwd, relDirPath ?? ""),
			isOutsideWorkspace,
		}
		const partialMessage = JSON.stringify({ ...sharedMessageProps, content: "" })
		await task.ask("tool", partialMessage, block.partial).catch(() => {})
	}
}
exports.ListFilesTool = ListFilesTool
exports.listFilesTool = new ListFilesTool()
