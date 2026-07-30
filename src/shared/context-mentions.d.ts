export declare const mentionRegex: RegExp
export declare const mentionRegexGlobal: RegExp
export declare const commandRegexGlobal: RegExp
export interface MentionSuggestion {
	type: "file" | "folder" | "git" | "problems"
	label: string
	description?: string
	value: string
	icon?: string
}
export interface GitMentionSuggestion extends MentionSuggestion {
	type: "git"
	hash: string
	shortHash: string
	subject: string
	author: string
	date: string
}
export declare function formatGitSuggestion(commit: {
	hash: string
	shortHash: string
	subject: string
	author: string
	date: string
}): GitMentionSuggestion
export declare function unescapeSpaces(path: string): string
//# sourceMappingURL=context-mentions.d.ts.map
