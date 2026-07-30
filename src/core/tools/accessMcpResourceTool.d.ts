import type { ToolUse } from "../../shared/tools"
import { Task } from "../task/Task"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface AccessMcpResourceParams {
	server_name: string
	uri: string
}
export declare class AccessMcpResourceTool extends BaseTool<"access_mcp_resource"> {
	readonly name: "access_mcp_resource"
	execute(params: AccessMcpResourceParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"access_mcp_resource">): Promise<void>
}
export declare const accessMcpResourceTool: AccessMcpResourceTool
export {}
//# sourceMappingURL=accessMcpResourceTool.d.ts.map
