"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.searchFilesTool = exports.SearchFilesTool = void 0
const path_1 = __importDefault(require("path"))
const path_2 = require("../../utils/path")
const pathUtils_1 = require("../../utils/pathUtils")
const ripgrep_1 = require("../../services/ripgrep")
const BaseTool_1 = require("./BaseTool")
class SearchFilesTool extends BaseTool_1.BaseTool {
	name = "search_files"
	async execute(params, task, callbacks) {
		const { askApproval, handleError, pushToolResult } = callbacks
		const relDirPath = params.path
		const regex = params.regex
		const filePattern = params.file_pattern || undefined
		if (!relDirPath) {
			task.consecutiveMistakeCount++
			task.recordToolError("search_files")
			task.didToolFailInCurrentTurn = true
			pushToolResult(await task.sayAndCreateMissingParamError("search_files", "path"))
			return
		}
		if (!regex) {
			task.consecutiveMistakeCount++
			task.recordToolError("search_files")
			task.didToolFailInCurrentTurn = true
			pushToolResult(await task.sayAndCreateMissingParamError("search_files", "regex"))
			return
		}
		task.consecutiveMistakeCount = 0
		const absolutePath = path_1.default.resolve(task.cwd, relDirPath)
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
		const sharedMessageProps = {
			tool: "searchFiles",
			path: (0, path_2.getReadablePath)(task.cwd, relDirPath),
			regex: regex,
			filePattern: filePattern,
			isOutsideWorkspace,
		}
		try {
			const results = await (0, ripgrep_1.regexSearchFiles)(
				task.cwd,
				absolutePath,
				regex,
				filePattern,
				task.aliIgnoreController,
			)
			const completeMessage = JSON.stringify({ ...sharedMessageProps, content: results })
			const didApprove = await askApproval("tool", completeMessage)
			if (!didApprove) {
				return
			}
			pushToolResult(results)
		} catch (error) {
			await handleError("searching files", error)
		}
	}
	async handlePartial(task, block) {
		const relDirPath = block.params.path
		const regex = block.params.regex
		const filePattern = block.params.file_pattern
		const absolutePath = relDirPath ? path_1.default.resolve(task.cwd, relDirPath) : task.cwd
		const isOutsideWorkspace = (0, pathUtils_1.isPathOutsideWorkspace)(absolutePath)
		const sharedMessageProps = {
			tool: "searchFiles",
			path: (0, path_2.getReadablePath)(task.cwd, relDirPath ?? ""),
			regex: regex ?? "",
			filePattern: filePattern ?? "",
			isOutsideWorkspace,
		}
		const partialMessage = JSON.stringify({ ...sharedMessageProps, content: "" })
		await task.ask("tool", partialMessage, block.partial).catch(() => {})
	}
}
exports.SearchFilesTool = SearchFilesTool
exports.searchFilesTool = new SearchFilesTool()
