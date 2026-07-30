import { z } from "zod"
/**
 * CodeAction
 */
export const codeActionIds = ["explainCode", "fixCode", "improveCode", "addToContext", "newTask"]
/**
 * TerminalAction
 */
export const terminalActionIds = ["terminalAddToContext", "terminalFixCommand", "terminalExplainCommand"]
/**
 * Command
 */
export const commandIds = [
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
/**
 * Language
 */
export const languages = [
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
export const languagesSchema = z.enum(languages)
export const isLanguage = (value) => languages.includes(value)
