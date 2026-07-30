import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface UseMcpToolParams {
	server_name: string
	tool_name: string
	arguments?: Record<string, unknown>
}
export declare class UseMcpToolTool extends BaseTool<"use_mcp_tool"> {
	readonly name: "use_mcp_tool"
	execute(params: UseMcpToolParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"use_mcp_tool">): Promise<void>
	private validateParams
	private validateToolExists
	private sendExecutionStatus
	private processToolContent
	private executeToolAndProcessResult
}
export declare const useMcpToolTool: UseMcpToolTool
export {}
//# sourceMappingURL=UseMcpToolTool.d.ts.map
