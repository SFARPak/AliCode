type PromptParams = Record<string, string | any[]>
export declare const createPrompt: (template: string, params: PromptParams) => string
type SupportPromptType =
	| "ENHANCE"
	| "CONDENSE"
	| "EXPLAIN"
	| "FIX"
	| "IMPROVE"
	| "ADD_TO_CONTEXT"
	| "TERMINAL_ADD_TO_CONTEXT"
	| "TERMINAL_FIX"
	| "TERMINAL_EXPLAIN"
	| "NEW_TASK"
export declare const supportPrompt: {
	readonly default: {
		[k: string]: string
	}
	readonly get: (customSupportPrompts: Record<string, any> | undefined, type: SupportPromptType) => string
	readonly create: (
		type: SupportPromptType,
		params: PromptParams,
		customSupportPrompts?: Record<string, any>,
	) => string
}
export type { SupportPromptType }
export type CustomSupportPrompts = {
	[key: string]: string | undefined
}
//# sourceMappingURL=support-prompt.d.ts.map
