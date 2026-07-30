import { Task } from "../task/Task"
import { BaseTool, ToolCallbacks } from "./BaseTool"
import type { ToolUse } from "../../shared/tools"
interface SkillParams {
	skill: string
	args?: string
}
export declare class SkillTool extends BaseTool<"skill"> {
	readonly name: "skill"
	execute(params: SkillParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"skill">): Promise<void>
}
export declare const skillTool: SkillTool
export {}
//# sourceMappingURL=SkillTool.d.ts.map
