import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface CodebaseSearchParams {
	query: string
	path?: string
}
export declare class CodebaseSearchTool extends BaseTool<"codebase_search"> {
	readonly name: "codebase_search"
	execute(params: CodebaseSearchParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"codebase_search">): Promise<void>
}
export declare const codebaseSearchTool: CodebaseSearchTool
export {}
//# sourceMappingURL=CodebaseSearchTool.d.ts.map
