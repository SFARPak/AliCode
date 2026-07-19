import * as vscode from "vscode"
import { DebugLogger } from "@ali-code/core"
import { memoryService, browserService, imageProcessingService, sandboxService } from "@ali-code/core"
import type { MemorySettings, BrowserAutomationSettings, SandboxPolicy } from "@ali-code/types"

const logger = new DebugLogger("advanced-services")

/**
 * ServiceManager owns the lifecycle of advanced runtime services
 * and exposes them to the extension host.
 *
 * This services layer sits between the VS Code extension host and
 * the core packages, providing a single point for configuring
 * memory recall, browser automation, image processing, and
 * sandbox confinement.
 */
export class ServiceManager {
	public readonly memory = memoryService
	public readonly browser = browserService
	public readonly imageProcessing = imageProcessingService
	public readonly sandbox = sandboxService

	private readonly _context: vscode.ExtensionContext
	private _ready = false

	constructor(context: vscode.ExtensionContext) {
		this._context = context
	}

	/**
	 * Synchronize settings from ContextProxy into each service.
	 * Called by ClineProvider on state-changed events and at startup.
	 */
	async syncSettings(config: {
		memorySettings?: Partial<MemorySettings>
		browserAutomationSettings?: Partial<BrowserAutomationSettings>
		sandboxPolicy?: Partial<SandboxPolicy>
	}): Promise<void> {
		// Apply memory settings
		if (config.memorySettings) {
			this.memory.updateSettings(config.memorySettings)
			const enabled = this.memory.getSettings().enabled
			if (enabled) {
				const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
				if (root) {
					await this.memory.initialize(root)
				}
			} else {
				this.memory.disable()
			}
		}

		// Apply browser settings
		if (config.browserAutomationSettings) {
			this.browser.updateSettings(config.browserAutomationSettings)
		}

		// Apply sandbox settings
		if (config.sandboxPolicy) {
			this.sandbox.updatePolicy(config.sandboxPolicy)
		}

		this._ready = true
		logger.info("Advanced services settings synchronized")
	}

	/** Whether all services are synchronized and ready. */
	isReady(): boolean {
		return this._ready
	}

	/**
	 * Get snapshot of all service states for the SettingsView.
	 */
	getServiceStates(): {
		memory: ReturnType<typeof this.memory.getState>
		memorySettings: ReturnType<typeof this.memory.getSettings>
		browserEnabled: boolean
		sandbox: ReturnType<typeof this.sandbox.getStatus>
	} {
		return {
			memory: this.memory.getState(),
			memorySettings: this.memory.getSettings(),
			browserEnabled: this.browser.isEnabled(),
			sandbox: this.sandbox.getStatus(),
		}
	}
}

/** Kept as a string literal because the name may be used as a discriminator. */
export const SERVICE_STATE_CHANGED = "alicode.serviceStateChanged"
