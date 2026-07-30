import { Task } from "../task/Task"
import { BaseTool, ToolCallbacks } from "./BaseTool"
import type { ToolUse } from "../../shared/tools"
interface ApplyPatchParams {
	patch: string
}
export declare class ApplyPatchTool extends BaseTool<"apply_patch"> {
	readonly name: "apply_patch"
	private static readonly FILE_HEADER_MARKERS
	private extractFirstPathFromPatch
	execute(params: ApplyPatchParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	private handleAddFile
	private handleDeleteFile
	private handleUpdateFile
	handlePartial(task: Task, block: ToolUse<"apply_patch">): Promise<void>
}
export declare const applyPatchTool: ApplyPatchTool
export {}
//# sourceMappingURL=ApplyPatchTool.d.ts.map
