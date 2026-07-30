import { EventEmitter } from "events"
import * as vscode from "vscode"
import {
	type AliCodeAPI,
	type AliCodeSettings,
	type AliCodeEvents,
	type ProviderSettings,
	type ProviderSettingsEntry,
} from "@ali-code/types"
import { ClineProvider } from "../core/webview/ClineProvider"
export declare class API extends EventEmitter<AliCodeEvents> implements AliCodeAPI {
	private readonly outputChannel
	private readonly sidebarProvider
	private readonly context
	private readonly ipc?
	private readonly log
	private logfile?
	constructor(
		outputChannel: vscode.OutputChannel,
		provider: ClineProvider,
		socketPath?: string,
		enableLogging?: boolean,
	)
	emit<K extends keyof AliCodeEvents>(
		eventName: K,
		...args: K extends keyof AliCodeEvents ? AliCodeEvents[K] : never
	): boolean
	startNewTask({
		configuration,
		text,
		images,
		newTab,
	}: {
		configuration: AliCodeSettings
		text?: string
		images?: string[]
		newTab?: boolean
	}): Promise<string>
	resumeTask(taskId: string): Promise<void>
	isTaskInHistory(taskId: string): Promise<boolean>
	getCurrentTaskStack(): string[]
	clearCurrentTask(_lastMessage?: string): Promise<void>
	cancelCurrentTask(): Promise<void>
	sendMessage(text?: string, images?: string[]): Promise<void>
	deleteQueuedMessage(messageId: string): void
	pressPrimaryButton(): Promise<void>
	pressSecondaryButton(): Promise<void>
	isReady(): boolean
	private waitForWebviewLaunch
	private registerListeners
	private outputChannelLog
	private fileLog
	getConfiguration(): AliCodeSettings
	setConfiguration(values: AliCodeSettings): Promise<void>
	getProfiles(): string[]
	getProfileEntry(name: string): ProviderSettingsEntry | undefined
	createProfile(name: string, profile?: ProviderSettings, activate?: boolean): Promise<string>
	updateProfile(name: string, profile: ProviderSettings, activate?: boolean): Promise<string | undefined>
	upsertProfile(name: string, profile: ProviderSettings, activate?: boolean): Promise<string | undefined>
	deleteProfile(name: string): Promise<void>
	getActiveProfile(): string | undefined
	setActiveProfile(name: string): Promise<string | undefined>
}
//# sourceMappingURL=api.d.ts.map
