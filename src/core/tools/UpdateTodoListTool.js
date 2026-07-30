"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.updateTodoListTool = exports.UpdateTodoListTool = void 0
exports.addTodoToTask = addTodoToTask
exports.updateTodoStatusForTask = updateTodoStatusForTask
exports.removeTodoFromTask = removeTodoFromTask
exports.getTodoListForTask = getTodoListForTask
exports.setTodoListForTask = setTodoListForTask
exports.restoreTodoListForTask = restoreTodoListForTask
exports.parseMarkdownChecklist = parseMarkdownChecklist
exports.setPendingTodoList = setPendingTodoList
const responses_1 = require("../prompts/responses")
const BaseTool_1 = require("./BaseTool")
const clone_deep_1 = __importDefault(require("clone-deep"))
const crypto_1 = __importDefault(require("crypto"))
const types_1 = require("@ali-code/types")
const todo_1 = require("../../shared/todo")
let approvedTodoList = undefined
class UpdateTodoListTool extends BaseTool_1.BaseTool {
	name = "update_todo_list"
	async execute(params, task, callbacks) {
		const { pushToolResult, handleError, askApproval } = callbacks
		try {
			const todosRaw = params.todos
			let todos
			try {
				todos = parseMarkdownChecklist(todosRaw || "")
			} catch {
				task.consecutiveMistakeCount++
				task.recordToolError("update_todo_list")
				task.didToolFailInCurrentTurn = true
				pushToolResult(
					responses_1.formatResponse.toolError("The todos parameter is not valid markdown checklist or JSON"),
				)
				return
			}
			const { valid, error } = validateTodos(todos)
			if (!valid) {
				task.consecutiveMistakeCount++
				task.recordToolError("update_todo_list")
				task.didToolFailInCurrentTurn = true
				pushToolResult(responses_1.formatResponse.toolError(error || "todos parameter validation failed"))
				return
			}
			let normalizedTodos = todos.map((t) => ({
				id: t.id,
				content: t.content,
				status: normalizeStatus(t.status),
			}))
			const approvalMsg = JSON.stringify({
				tool: "updateTodoList",
				todos: normalizedTodos,
			})
			approvedTodoList = (0, clone_deep_1.default)(normalizedTodos)
			const didApprove = await askApproval("tool", approvalMsg)
			if (!didApprove) {
				pushToolResult("User declined to update the todoList.")
				return
			}
			const isTodoListChanged =
				approvedTodoList !== undefined && JSON.stringify(normalizedTodos) !== JSON.stringify(approvedTodoList)
			if (isTodoListChanged) {
				normalizedTodos = approvedTodoList ?? []
				task.say(
					"user_edit_todos",
					JSON.stringify({
						tool: "updateTodoList",
						todos: normalizedTodos,
					}),
				)
			}
			await setTodoListForTask(task, normalizedTodos)
			if (isTodoListChanged) {
				const md = todoListToMarkdown(normalizedTodos)
				pushToolResult(responses_1.formatResponse.toolResult("User edits todo:\n\n" + md))
			} else {
				pushToolResult(responses_1.formatResponse.toolResult("Todo list updated successfully."))
			}
		} catch (error) {
			await handleError("update todo list", error)
		}
	}
	async handlePartial(task, block) {
		const todosRaw = block.params.todos
		// Parse the markdown checklist to maintain consistent format with execute()
		let todos
		try {
			todos = parseMarkdownChecklist(todosRaw || "")
		} catch {
			// If parsing fails during partial, send empty array
			todos = []
		}
		const approvalMsg = JSON.stringify({
			tool: "updateTodoList",
			todos: todos,
		})
		await task.ask("tool", approvalMsg, block.partial).catch(() => {})
	}
}
exports.UpdateTodoListTool = UpdateTodoListTool
function addTodoToTask(cline, content, status = "pending", id) {
	const todo = {
		id: id ?? crypto_1.default.randomUUID(),
		content,
		status,
	}
	if (!cline.todoList) cline.todoList = []
	cline.todoList.push(todo)
	return todo
}
function updateTodoStatusForTask(cline, id, nextStatus) {
	if (!cline.todoList) return false
	const idx = cline.todoList.findIndex((t) => t.id === id)
	if (idx === -1) return false
	const current = cline.todoList[idx]
	if (
		(current.status === "pending" && nextStatus === "in_progress") ||
		(current.status === "in_progress" && nextStatus === "completed") ||
		current.status === nextStatus
	) {
		cline.todoList[idx] = { ...current, status: nextStatus }
		return true
	}
	return false
}
function removeTodoFromTask(cline, id) {
	if (!cline.todoList) return false
	const idx = cline.todoList.findIndex((t) => t.id === id)
	if (idx === -1) return false
	cline.todoList.splice(idx, 1)
	return true
}
function getTodoListForTask(cline) {
	return cline.todoList?.slice()
}
async function setTodoListForTask(cline, todos) {
	if (cline === undefined) return
	cline.todoList = Array.isArray(todos) ? todos : []
}
function restoreTodoListForTask(cline, todoList) {
	if (todoList) {
		cline.todoList = Array.isArray(todoList) ? todoList : []
		return
	}
	cline.todoList = (0, todo_1.getLatestTodo)(cline.clineMessages)
}
function todoListToMarkdown(todos) {
	return todos
		.map((t) => {
			let box = "[ ]"
			if (t.status === "completed") box = "[x]"
			else if (t.status === "in_progress") box = "[-]"
			return `${box} ${t.content}`
		})
		.join("\n")
}
function normalizeStatus(status) {
	if (status === "completed") return "completed"
	if (status === "in_progress") return "in_progress"
	return "pending"
}
function parseMarkdownChecklist(md) {
	if (typeof md !== "string") return []
	const lines = md
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean)
	const todos = []
	for (const line of lines) {
		const match = line.match(/^(?:-\s*)?\[\s*([ xX\-~])\s*\]\s+(.+)$/)
		if (!match) continue
		let status = "pending"
		if (match[1] === "x" || match[1] === "X") status = "completed"
		else if (match[1] === "-" || match[1] === "~") status = "in_progress"
		const id = crypto_1.default
			.createHash("md5")
			.update(match[2] + status)
			.digest("hex")
		todos.push({
			id,
			content: match[2],
			status,
		})
	}
	return todos
}
function setPendingTodoList(todos) {
	approvedTodoList = todos
}
function validateTodos(todos) {
	if (!Array.isArray(todos)) return { valid: false, error: "todos must be an array" }
	for (const [i, t] of todos.entries()) {
		if (!t || typeof t !== "object") return { valid: false, error: `Item ${i + 1} is not an object` }
		if (!t.id || typeof t.id !== "string") return { valid: false, error: `Item ${i + 1} is missing id` }
		if (!t.content || typeof t.content !== "string")
			return { valid: false, error: `Item ${i + 1} is missing content` }
		if (t.status && !types_1.todoStatusSchema.options.includes(t.status))
			return { valid: false, error: `Item ${i + 1} has invalid status` }
	}
	return { valid: true }
}
exports.updateTodoListTool = new UpdateTodoListTool()
