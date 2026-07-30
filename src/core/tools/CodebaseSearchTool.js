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
exports.codebaseSearchTool = exports.CodebaseSearchTool = void 0
const vscode = __importStar(require("vscode"))
const manager_1 = require("../../services/code-index/manager")
const path_1 = require("../../utils/path")
const responses_1 = require("../prompts/responses")
const BaseTool_1 = require("./BaseTool")
class CodebaseSearchTool extends BaseTool_1.BaseTool {
	name = "codebase_search"
	async execute(params, task, callbacks) {
		const { askApproval, handleError, pushToolResult } = callbacks
		const { query, path: directoryPrefix } = params
		const workspacePath = task.cwd && task.cwd.trim() !== "" ? task.cwd : (0, path_1.getWorkspacePath)()
		if (!workspacePath) {
			await handleError("codebase_search", new Error("Could not determine workspace path."))
			return
		}
		if (!query) {
			task.consecutiveMistakeCount++
			task.didToolFailInCurrentTurn = true
			pushToolResult(await task.sayAndCreateMissingParamError("codebase_search", "query"))
			return
		}
		const sharedMessageProps = {
			tool: "codebaseSearch",
			query: query,
			path: directoryPrefix,
			isOutsideWorkspace: false,
		}
		const didApprove = await askApproval("tool", JSON.stringify(sharedMessageProps))
		if (!didApprove) {
			pushToolResult(responses_1.formatResponse.toolDenied())
			return
		}
		task.consecutiveMistakeCount = 0
		try {
			const context = task.providerRef.deref()?.context
			if (!context) {
				throw new Error("Extension context is not available.")
			}
			const manager = manager_1.CodeIndexManager.getInstance(context)
			if (!manager) {
				throw new Error("CodeIndexManager is not available.")
			}
			if (!manager.isFeatureEnabled) {
				throw new Error("Code Indexing is disabled in the settings.")
			}
			if (!manager.isFeatureConfigured) {
				throw new Error("Code Indexing is not configured (Missing OpenAI Key or Qdrant URL).")
			}
			const searchResults = await manager.searchIndex(query, directoryPrefix)
			if (!searchResults || searchResults.length === 0) {
				pushToolResult(`No relevant code snippets found for the query: "${query}"`)
				return
			}
			const jsonResult = {
				query,
				results: [],
			}
			searchResults.forEach((result) => {
				if (!result.payload) return
				if (!("filePath" in result.payload)) return
				const relativePath = vscode.workspace.asRelativePath(result.payload.filePath, false)
				jsonResult.results.push({
					filePath: relativePath,
					score: result.score,
					startLine: result.payload.startLine,
					endLine: result.payload.endLine,
					codeChunk: result.payload.codeChunk.trim(),
				})
			})
			const payload = { tool: "codebaseSearch", content: jsonResult }
			await task.say("codebase_search_result", JSON.stringify(payload))
			const output = `Query: ${query}
Results:

${jsonResult.results
	.map(
		(result) => `File path: ${result.filePath}
Score: ${result.score}
Lines: ${result.startLine}-${result.endLine}
Code Chunk: ${result.codeChunk}
`,
	)
	.join("\n")}`
			pushToolResult(output)
		} catch (error) {
			await handleError("codebase_search", error)
		}
	}
	async handlePartial(task, block) {
		const query = block.params.query
		const directoryPrefix = block.params.path
		const sharedMessageProps = {
			tool: "codebaseSearch",
			query: query,
			path: directoryPrefix,
			isOutsideWorkspace: false,
		}
		await task.ask("tool", JSON.stringify(sharedMessageProps), block.partial).catch(() => {})
	}
}
exports.CodebaseSearchTool = CodebaseSearchTool
exports.codebaseSearchTool = new CodebaseSearchTool()
