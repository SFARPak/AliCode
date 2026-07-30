import { FileContextTracker } from "../context-tracking/FileContextTracker"
import { AliIgnoreController } from "../ignore/AliIgnoreController"
import { type SkillLookup } from "../../services/skills/skillInvocation"
export declare function openMention(cwd: string, mention?: string): Promise<void>
/**
 * Represents a content block generated from an @ mention.
 * These are returned separately from the user's text to enable
 * proper formatting as distinct message blocks.
 */
export interface MentionContentBlock {
	type: "file" | "folder" | "url" | "diagnostics" | "git_changes" | "git_commit" | "terminal" | "command"
	/** Path for file/folder mentions */
	path?: string
	/** The content to display */
	content: string
	/** Metadata about truncation (for files) */
	metadata?: {
		totalLines: number
		returnedLines: number
		wasTruncated: boolean
		linesShown?: [number, number]
	}
}
export interface ParseMentionsResult {
	/** User's text with @ mentions replaced by clean path references */
	text: string
	/** Separate content blocks for each mention (file content, URLs, etc.) */
	contentBlocks: MentionContentBlock[]
	slashCommandHelp?: string
	mode?: string
}
export declare function parseMentions(
	text: string,
	cwd: string,
	fileContextTracker?: FileContextTracker,
	aliIgnoreController?: AliIgnoreController,
	showAliIgnoredFiles?: boolean,
	includeDiagnosticMessages?: boolean,
	maxDiagnosticMessages?: number,
	skillsManager?: SkillLookup,
	currentMode?: string,
): Promise<ParseMentionsResult>
/**
 * Gets the contents of the active terminal
 * @returns The terminal contents as a string
 */
export declare function getLatestTerminalOutput(): Promise<string>
export { processUserContentMentions } from "./processUserContentMentions"
export type { ProcessUserContentMentionsResult } from "./processUserContentMentions"
//# sourceMappingURL=index.d.ts.map
