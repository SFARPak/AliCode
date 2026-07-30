import Anthropic from "@anthropic-ai/sdk"
import { FileContextTracker } from "../context-tracking/FileContextTracker"
import type { SkillLookup } from "../../services/skills/skillInvocation"
export interface ProcessUserContentMentionsResult {
	content: Anthropic.Messages.ContentBlockParam[]
	mode?: string
}
/**
 * Process mentions in user content, specifically within task and feedback tags.
 *
 * File/folder @ mentions are now returned as separate text blocks that
 * look like read_file tool results, making it clear to the model that
 * the file has already been read.
 */
export declare function processUserContentMentions({
	userContent,
	cwd,
	fileContextTracker,
	aliIgnoreController,
	showAliIgnoredFiles,
	includeDiagnosticMessages,
	maxDiagnosticMessages,
	skillsManager,
	currentMode,
}: {
	userContent: Anthropic.Messages.ContentBlockParam[]
	cwd: string
	fileContextTracker: FileContextTracker
	aliIgnoreController?: any
	showAliIgnoredFiles?: boolean
	includeDiagnosticMessages?: boolean
	maxDiagnosticMessages?: number
	skillsManager?: SkillLookup
	currentMode?: string
}): Promise<ProcessUserContentMentionsResult>
//# sourceMappingURL=processUserContentMentions.d.ts.map
