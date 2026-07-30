import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface EditParams {
	file_path: string
	old_string: string
	new_string: string
	replace_all?: boolean
}
export declare class EditTool extends BaseTool<"edit"> {
	readonly name: "edit"
	execute(params: EditParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"edit">): Promise<void>
}
export declare const editTool: EditTool
export declare const searchAndReplaceTool: EditTool
export {}
//# sourceMappingURL=EditTool.d.ts.map
