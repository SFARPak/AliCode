import { z } from "zod"
/**
 * CodeAction
 */
export declare const codeActionIds: readonly ["explainCode", "fixCode", "improveCode", "addToContext", "newTask"]
export type CodeActionId = (typeof codeActionIds)[number]
export type CodeActionName = "EXPLAIN" | "FIX" | "IMPROVE" | "ADD_TO_CONTEXT" | "NEW_TASK"
/**
 * TerminalAction
 */
export declare const terminalActionIds: readonly [
	"terminalAddToContext",
	"terminalFixCommand",
	"terminalExplainCommand",
]
export type TerminalActionId = (typeof terminalActionIds)[number]
export type TerminalActionName = "ADD_TO_CONTEXT" | "FIX" | "EXPLAIN"
export type TerminalActionPromptType = `TERMINAL_${TerminalActionName}`
/**
 * Command
 */
export declare const commandIds: readonly [
	"activationCompleted",
	"plusButtonClicked",
	"historyButtonClicked",
	"popoutButtonClicked",
	"settingsButtonClicked",
	"openInNewTab",
	"newTask",
	"setCustomStoragePath",
	"importSettings",
	"focusInput",
	"acceptInput",
	"focusPanel",
	"toggleAutoApprove",
]
export type CommandId = (typeof commandIds)[number]
/**
 * Language
 */
export declare const languages: readonly [
	"ca",
	"de",
	"en",
	"es",
	"fr",
	"hi",
	"id",
	"it",
	"ja",
	"ko",
	"nl",
	"pl",
	"pt-BR",
	"ru",
	"tr",
	"vi",
	"zh-CN",
	"zh-TW",
]
export declare const languagesSchema: z.ZodEnum<
	[
		"ca",
		"de",
		"en",
		"es",
		"fr",
		"hi",
		"id",
		"it",
		"ja",
		"ko",
		"nl",
		"pl",
		"pt-BR",
		"ru",
		"tr",
		"vi",
		"zh-CN",
		"zh-TW",
	]
>
export type Language = z.infer<typeof languagesSchema>
export declare const isLanguage: (value: string) => value is Language
//# sourceMappingURL=vscode.d.ts.map
