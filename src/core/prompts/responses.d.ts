import { Anthropic } from "@anthropic-ai/sdk"
import { AliIgnoreController } from "../ignore/AliIgnoreController"
import { AliProtectedController } from "../protect/AliProtectedController"
export declare const formatResponse: {
	toolDenied: () => string
	toolDeniedWithFeedback: (feedback?: string) => string
	toolApprovedWithFeedback: (feedback?: string) => string
	toolError: (error?: string) => string
	rooIgnoreError: (path: string) => string
	noToolsUsed: () => string
	tooManyMistakes: (feedback?: string) => string
	missingToolParameterError: (paramName: string) => string
	invalidMcpToolArgumentError: (serverName: string, toolName: string) => string
	unknownMcpToolError: (serverName: string, toolName: string, availableTools: string[]) => string
	unknownMcpServerError: (serverName: string, availableServers: string[]) => string
	toolResult: (
		text: string,
		images?: string[],
	) => string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam>
	imageBlocks: (images?: string[]) => Anthropic.ImageBlockParam[]
	formatFilesList: (
		absolutePath: string,
		files: string[],
		didHitLimit: boolean,
		aliIgnoreController: AliIgnoreController | undefined,
		showAliIgnoredFiles: boolean,
		aliProtectedController?: AliProtectedController,
	) => string
	createPrettyPatch: (filename?: string, oldStr?: string, newStr?: string) => string
}
//# sourceMappingURL=responses.d.ts.map
