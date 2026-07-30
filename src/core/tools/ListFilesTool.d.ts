import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface ListFilesParams {
	path: string
	recursive?: boolean
}
export declare class ListFilesTool extends BaseTool<"list_files"> {
	readonly name: "list_files"
	execute(params: ListFilesParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"list_files">): Promise<void>
}
export declare const listFilesTool: ListFilesTool
export {}
//# sourceMappingURL=ListFilesTool.d.ts.map
