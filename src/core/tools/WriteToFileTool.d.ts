import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface WriteToFileParams {
	path: string
	content: string
}
export declare class WriteToFileTool extends BaseTool<"write_to_file"> {
	readonly name: "write_to_file"
	execute(params: WriteToFileParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"write_to_file">): Promise<void>
}
export declare const writeToFileTool: WriteToFileTool
export {}
//# sourceMappingURL=WriteToFileTool.d.ts.map
