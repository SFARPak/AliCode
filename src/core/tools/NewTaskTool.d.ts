import { Task } from "../task/Task"
import { BaseTool, ToolCallbacks } from "./BaseTool"
import type { ToolUse } from "../../shared/tools"
interface NewTaskParams {
	mode: string
	message: string
	todos?: string
}
export declare class NewTaskTool extends BaseTool<"new_task"> {
	readonly name: "new_task"
	execute(params: NewTaskParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"new_task">): Promise<void>
}
export declare const newTaskTool: NewTaskTool
export {}
//# sourceMappingURL=NewTaskTool.d.ts.map
