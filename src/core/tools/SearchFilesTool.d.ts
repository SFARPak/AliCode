import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface SearchFilesParams {
	path: string
	regex: string
	file_pattern?: string | null
}
export declare class SearchFilesTool extends BaseTool<"search_files"> {
	readonly name: "search_files"
	execute(params: SearchFilesParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"search_files">): Promise<void>
}
export declare const searchFilesTool: SearchFilesTool
export {}
//# sourceMappingURL=SearchFilesTool.d.ts.map
