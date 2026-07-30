import { Anthropic } from "@anthropic-ai/sdk"
import { Message } from "@aws-sdk/client-bedrock-runtime"
/**
 * Convert Anthropic messages to Bedrock Converse format
 * @param anthropicMessages Messages in Anthropic format
 */
export declare function convertToBedrockConverseMessages(
	anthropicMessages: Anthropic.Messages.MessageParam[],
): Message[]
//# sourceMappingURL=bedrock-converse-format.d.ts.map
