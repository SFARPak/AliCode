import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface ApplyDiffParams {
	path: string
	diff: string
}
export declare class ApplyDiffTool extends BaseTool<"apply_diff"> {
	readonly name: "apply_diff"
	execute(params: ApplyDiffParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"apply_diff">): Promise<void>
}
export declare const applyDiffTool: ApplyDiffTool
export {}
//# sourceMappingURL=ApplyDiffTool.d.ts.map
