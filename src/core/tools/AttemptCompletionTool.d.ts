import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface AttemptCompletionParams {
	result: string
	command?: string
}
export interface AttemptCompletionCallbacks extends ToolCallbacks {
	askFinishSubTaskApproval: () => Promise<boolean>
	toolDescription: () => string
}
export declare class AttemptCompletionTool extends BaseTool<"attempt_completion"> {
	readonly name: "attempt_completion"
	execute(params: AttemptCompletionParams, task: Task, callbacks: AttemptCompletionCallbacks): Promise<void>
	/**
	 * Handles the common delegation flow when a subtask completes.
	 * Returns:
	 * - "delegated" when completion was approved and parent resumed
	 * - "denied" when user denied finishing the subtask
	 * - "continue" when caller should fall through to normal completion ask flow
	 */
	private delegateToParent
	handlePartial(task: Task, block: ToolUse<"attempt_completion">): Promise<void>
	private emitTaskCompleted
}
export declare const attemptCompletionTool: AttemptCompletionTool
export {}
//# sourceMappingURL=AttemptCompletionTool.d.ts.map
