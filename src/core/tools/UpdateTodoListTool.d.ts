import { Task } from "../task/Task"
import { BaseTool, ToolCallbacks } from "./BaseTool"
import type { ToolUse } from "../../shared/tools"
import { TodoItem, TodoStatus } from "@ali-code/types"
interface UpdateTodoListParams {
	todos: string
}
export declare class UpdateTodoListTool extends BaseTool<"update_todo_list"> {
	readonly name: "update_todo_list"
	execute(params: UpdateTodoListParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"update_todo_list">): Promise<void>
}
export declare function addTodoToTask(cline: Task, content: string, status?: TodoStatus, id?: string): TodoItem
export declare function updateTodoStatusForTask(cline: Task, id: string, nextStatus: TodoStatus): boolean
export declare function removeTodoFromTask(cline: Task, id: string): boolean
export declare function getTodoListForTask(cline: Task): TodoItem[] | undefined
export declare function setTodoListForTask(cline?: Task, todos?: TodoItem[]): Promise<void>
export declare function restoreTodoListForTask(cline: Task, todoList?: TodoItem[]): void
export declare function parseMarkdownChecklist(md: string): TodoItem[]
export declare function setPendingTodoList(todos: TodoItem[]): void
export declare const updateTodoListTool: UpdateTodoListTool
export {}
//# sourceMappingURL=UpdateTodoListTool.d.ts.map
