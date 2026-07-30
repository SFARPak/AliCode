import { Anthropic } from "@anthropic-ai/sdk"
import { AssistantMessage } from "@mistralai/mistralai/models/components/assistantmessage"
import { SystemMessage } from "@mistralai/mistralai/models/components/systemmessage"
import { ToolMessage } from "@mistralai/mistralai/models/components/toolmessage"
import { UserMessage } from "@mistralai/mistralai/models/components/usermessage"
/**
 * Normalizes a tool call ID to be compatible with Mistral's strict ID requirements.
 * Mistral requires tool call IDs to be:
 * - Only alphanumeric characters (a-z, A-Z, 0-9)
 * - Exactly 9 characters in length
 *
 * This function extracts alphanumeric characters from the original ID and
 * pads/truncates to exactly 9 characters, ensuring deterministic output.
 *
 * @param id - The original tool call ID (e.g., "call_5019f900a247472bacde0b82" or "toolu_123")
 * @returns A normalized 9-character alphanumeric ID compatible with Mistral
 */
export declare function normalizeMistralToolCallId(id: string): string
export type MistralMessage =
	| (SystemMessage & {
			role: "system"
	  })
	| (UserMessage & {
			role: "user"
	  })
	| (AssistantMessage & {
			role: "assistant"
	  })
	| (ToolMessage & {
			role: "tool"
	  })
export declare function convertToMistralMessages(anthropicMessages: Anthropic.Messages.MessageParam[]): MistralMessage[]
//# sourceMappingURL=mistral-format.d.ts.map
