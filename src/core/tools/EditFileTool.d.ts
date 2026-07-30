import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface EditFileParams {
	file_path: string
	old_string: string
	new_string: string
	expected_replacements?: number
}
export declare class EditFileTool extends BaseTool<"edit_file"> {
	readonly name: "edit_file"
	private didSendPartialToolAsk
	private partialToolAskRelPath
	execute(params: EditFileParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"edit_file">): Promise<void>
}
export declare const editFileTool: EditFileTool
export {}
//# sourceMappingURL=EditFileTool.d.ts.map
