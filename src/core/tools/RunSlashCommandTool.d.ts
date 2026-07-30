import { Task } from "../task/Task"
import { BaseTool, ToolCallbacks } from "./BaseTool"
import type { ToolUse } from "../../shared/tools"
interface RunSlashCommandParams {
	command: string
	args?: string
}
export declare class RunSlashCommandTool extends BaseTool<"run_slash_command"> {
	readonly name: "run_slash_command"
	execute(params: RunSlashCommandParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"run_slash_command">): Promise<void>
}
export declare const runSlashCommandTool: RunSlashCommandTool
export {}
//# sourceMappingURL=RunSlashCommandTool.d.ts.map
