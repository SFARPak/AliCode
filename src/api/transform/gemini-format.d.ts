import { Anthropic } from "@anthropic-ai/sdk"
import { Content, Part } from "@google/genai"
type ThoughtSignatureContentBlock = {
	type: "thoughtSignature"
	thoughtSignature?: string
}
type ReasoningContentBlock = {
	type: "reasoning"
	text: string
}
type ExtendedContentBlockParam = Anthropic.ContentBlockParam | ThoughtSignatureContentBlock | ReasoningContentBlock
type ExtendedAnthropicContent = string | ExtendedContentBlockParam[]
export declare function convertAnthropicContentToGemini(
	content: ExtendedAnthropicContent,
	options?: {
		includeThoughtSignatures?: boolean
		toolIdToName?: Map<string, string>
	},
): Part[]
export declare function convertAnthropicMessageToGemini(
	message: Anthropic.Messages.MessageParam,
	options?: {
		includeThoughtSignatures?: boolean
		toolIdToName?: Map<string, string>
	},
): Content[]
export {}
//# sourceMappingURL=gemini-format.d.ts.map
