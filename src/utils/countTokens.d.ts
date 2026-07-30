import { Anthropic } from "@anthropic-ai/sdk"
export type CountTokensOptions = {
	useWorker?: boolean
}
export declare function countTokens(
	content: Anthropic.Messages.ContentBlockParam[],
	{ useWorker }?: CountTokensOptions,
): Promise<number>
//# sourceMappingURL=countTokens.d.ts.map
