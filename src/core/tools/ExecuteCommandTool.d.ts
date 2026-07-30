import { Task } from "../task/Task"
import { ToolUse, ToolResponse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface ExecuteCommandParams {
	command: string
	cwd?: string
	timeout?: number | null
}
export declare function resolveAgentTimeoutMs(timeoutSeconds: number | null | undefined): number
export declare class ExecuteCommandTool extends BaseTool<"execute_command"> {
	readonly name: "execute_command"
	execute(params: ExecuteCommandParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"execute_command">): Promise<void>
}
export type ExecuteCommandOptions = {
	executionId: string
	command: string
	customCwd?: string
	terminalShellIntegrationDisabled?: boolean
	commandExecutionTimeout?: number
	agentTimeout?: number
}
export declare function executeCommandInTerminal(
	task: Task,
	{
		executionId,
		command,
		customCwd,
		terminalShellIntegrationDisabled,
		commandExecutionTimeout,
		agentTimeout,
	}: ExecuteCommandOptions,
): Promise<[boolean, ToolResponse]>
export declare const executeCommandTool: ExecuteCommandTool
export {}
//# sourceMappingURL=ExecuteCommandTool.d.ts.map
