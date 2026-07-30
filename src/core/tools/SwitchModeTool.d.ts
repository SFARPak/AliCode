import { Task } from "../task/Task"
import { BaseTool, ToolCallbacks } from "./BaseTool"
import type { ToolUse } from "../../shared/tools"
interface SwitchModeParams {
	mode_slug: string
	reason: string
}
export declare class SwitchModeTool extends BaseTool<"switch_mode"> {
	readonly name: "switch_mode"
	execute(params: SwitchModeParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"switch_mode">): Promise<void>
}
export declare const switchModeTool: SwitchModeTool
export {}
//# sourceMappingURL=SwitchModeTool.d.ts.map
