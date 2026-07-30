import { Task } from "../task/Task"
import type { ToolUse } from "../../shared/tools"
import { BaseTool, ToolCallbacks } from "./BaseTool"
interface Suggestion {
	text: string
	mode?: string
}
interface AskFollowupQuestionParams {
	question: string
	follow_up: Suggestion[]
}
export declare class AskFollowupQuestionTool extends BaseTool<"ask_followup_question"> {
	readonly name: "ask_followup_question"
	execute(params: AskFollowupQuestionParams, task: Task, callbacks: ToolCallbacks): Promise<void>
	handlePartial(task: Task, block: ToolUse<"ask_followup_question">): Promise<void>
}
export declare const askFollowupQuestionTool: AskFollowupQuestionTool
export {}
//# sourceMappingURL=AskFollowupQuestionTool.d.ts.map
