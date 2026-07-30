import * as vscode from "vscode"
import type { MemorySettings, BrowserAutomationSettings, SandboxPolicy } from "@ali-code/types"
/**
 * ServiceManager owns the lifecycle of advanced runtime services
 * and exposes them to the extension host.
 *
 * This services layer sits between the VS Code extension host and
 * the core packages, providing a single point for configuring
 * memory recall, browser automation, image processing, and
 * sandbox confinement.
 */
export declare class ServiceManager {
	readonly memory: any
	readonly browser: any
	readonly imageProcessing: any
	readonly sandbox: any
	private readonly _context
	private _ready
	constructor(context: vscode.ExtensionContext)
	/**
	 * Synchronize settings from ContextProxy into each service.
	 * Called by ClineProvider on state-changed events and at startup.
	 */
	syncSettings(config: {
		memorySettings?: Partial<MemorySettings>
		browserAutomationSettings?: Partial<BrowserAutomationSettings>
		sandboxPolicy?: Partial<SandboxPolicy>
	}): Promise<void>
	/** Whether all services are synchronized and ready. */
	isReady(): boolean
	/**
	 * Get snapshot of all service states for the SettingsView.
	 */
	getServiceStates(): {
		memory: ReturnType<typeof this.memory.getState>
		memorySettings: ReturnType<typeof this.memory.getSettings>
		browserEnabled: boolean
		sandbox: ReturnType<typeof this.sandbox.getStatus>
	}
}
/** Kept as a string literal because the name may be used as a discriminator. */
export declare const SERVICE_STATE_CHANGED = "alicode.serviceStateChanged"
//# sourceMappingURL=ServiceManager.d.ts.map
