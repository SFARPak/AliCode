import { Anthropic } from "@anthropic-ai/sdk"
import * as vscode from "vscode"
interface ReasoningBlock {
	type: "reasoning"
	text: string
}
interface ThoughtSignatureBlock {
	type: "thoughtSignature"
}
export type ExtendedContentBlock = Anthropic.Messages.ContentBlockParam | ReasoningBlock | ThoughtSignatureBlock
export declare function getTaskFileName(dateTs: number): string
export declare function downloadTask(
	dateTs: number,
	conversationHistory: Anthropic.MessageParam[],
	defaultUri: vscode.Uri,
): Promise<vscode.Uri | undefined>
export declare function formatContentBlockToMarkdown(block: ExtendedContentBlock): string
export declare function findToolName(toolCallId: string, messages: Anthropic.MessageParam[]): string
export {}
//# sourceMappingURL=export-markdown.d.ts.map
