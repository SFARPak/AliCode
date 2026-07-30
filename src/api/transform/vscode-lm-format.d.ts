import { Anthropic } from "@anthropic-ai/sdk"
import * as vscode from "vscode"
export declare function convertToVsCodeLmMessages(
	anthropicMessages: Anthropic.Messages.MessageParam[],
): vscode.LanguageModelChatMessage[]
export declare function convertToAnthropicRole(vsCodeLmMessageRole: vscode.LanguageModelChatMessageRole): string | null
/**
 * Extracts the text content from a VS Code Language Model chat message.
 * @param message A VS Code Language Model chat message.
 * @returns The extracted text content.
 */
export declare function extractTextCountFromMessage(message: vscode.LanguageModelChatMessage): string
//# sourceMappingURL=vscode-lm-format.d.ts.map
