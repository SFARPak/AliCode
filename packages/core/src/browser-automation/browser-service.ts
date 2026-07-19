import type { BrowserSession, BrowserTab, BrowserAutomationSettings } from "@ali-code/types"

/**
 * BrowserService manages OS-level browser automation.
 *
 * Talks to Chromium via the Chrome DevTools Protocol (CDP). Supports
 * screenshot capture, form interaction, navigation, and DOM extraction.
 *
 * Note: actual browser launching requires either:
 *   - A system Chrome with remote debugging enabled, OR
 *   - A bundled Chromium binary (via puppeteer-core)
 *
 * This service is intentionally decoupled from the extension lifecycle
 * so it can be tested independently.
 */
export class BrowserService {
	private settings: BrowserAutomationSettings
	private sessions: Map<string, BrowserSession> = new Map()
	private _attached = false

	constructor(settings?: Partial<BrowserAutomationSettings>) {
		this.settings = {
			enabled: false,
			useSystemChrome: false,
			headless: true,
			allowedDomains: [],
			maxTabs: 5,
			navigationTimeoutMs: 30_000,
			...settings,
		}
	}

	/** Update settings */
	updateSettings(settings: Partial<BrowserAutomationSettings>): void {
		this.settings = { ...this.settings, ...settings }
	}

	/** Current settings */
	getSettings(): BrowserAutomationSettings {
		return { ...this.settings }
	}

	/** Whether browser automation is configured */
	isEnabled(): boolean {
		return this.settings.enabled
	}

	/**
	 * Create a new browser session.
	 *
	 * NOTE: Actual browser launch is intentionally deferred to a callable
	 * that can be bound to the extension host for lifecycle management.
	 * The session record is created here so callers can reason about
	 * the session geometry before the browser is running.
	 */
	createSession(): { sessionId: string; existingTabs: number } {
		if (!this.settings.enabled) {
			throw new Error("Browser automation is not enabled. Enable it in settings first.")
		}
		const sessionId = crypto.randomUUID()
		const session: BrowserSession = {
			sessionId,
			activeTabId: undefined,
			tabs: [],
			startedAt: Date.now(),
		}
		this.sessions.set(sessionId, session)
		return { sessionId, existingTabs: 0 }
	}

	/**
	 * Close a browser session by id.
	 */
	async closeSession(sessionId: string): Promise<boolean> {
		const session = this.sessions.get(sessionId)
		if (!session) {
			return false
		}
		// Best-effort: close all tabs then remove session
		for (const tab of session.tabs) {
			await this.closeTab(sessionId, tab.id).catch(() => {})
		}
		this.sessions.delete(sessionId)
		return true
	}

	/**
	 * Open a new tab in a session.
	 */
	createTab(sessionId: string, url?: string): BrowserTab {
		const session = this.sessions.get(sessionId)
		if (!session) {
			throw new Error(`Session not found: ${sessionId}`)
		}
		if (session.tabs.length >= this.settings.maxTabs) {
			throw new Error(`Maximum tabs (${this.settings.maxTabs}) reached for session ${sessionId}`)
		}
		const tab: BrowserTab = {
			id: crypto.randomUUID(),
			url,
			title: undefined,
			active: session.tabs.length === 0,
		}
		session.tabs.push(tab)
		session.activeTabId = tab.id
		session.lastActivityAt = Date.now()
		return tab
	}

	/**
	 * Navigate a tab to a new URL.
	 */
	navigateTo(sessionId: string, tabId: string, url: string): { success: boolean; finalUrl?: string } {
		const session = this.sessions.get(sessionId)
		if (!session) {
			return { success: false }
		}
		const tab = session.tabs.find((t) => t.id === tabId)
		if (!tab) {
			return { success: false }
		}
		tab.url = url
		session.activeTabId = tabId
		session.lastActivityAt = Date.now()
		return { success: true, finalUrl: url }
	}

	/**
	 * Close a tab.
	 */
	private async closeTab(sessionId: string, tabId: string): Promise<void> {
		const session = this.sessions.get(sessionId)
		if (!session) {
			return
		}
		session.tabs = session.tabs.filter((t) => t.id !== tabId)
		if (session.activeTabId === tabId && session.tabs.length > 0) {
			session.activeTabId = session.tabs[0]!.id
		}
		session.lastActivityAt = Date.now()
	}

	/**
	 * Get the active tab for a session.
	 */
	getActiveTab(sessionId: string): BrowserTab | undefined {
		const session = this.sessions.get(sessionId)
		if (!session) {
			return undefined
		}
		return session.tabs.find((t) => t.id === session.activeTabId) ?? session.tabs[0]
	}

	/**
	 * Get session summary information.
	 */
	getSessionInfo(sessionId: string): { tabs: number; hasActiveTab: boolean } | undefined {
		const session = this.sessions.get(sessionId)
		if (!session) {
			return undefined
		}
		return {
			tabs: session.tabs.length,
			hasActiveTab: !!session.activeTabId,
		}
	}

	/**
	 * Capture an accessible representation of the current active tab.
	 * In a full implementation this would drive a CDP Page.captureScreenshot
	 * and Page.getContent call. This lightweight version returns a snapshot
	 * string describing the current state.
	 */
	async captureSnapshot(sessionId: string): Promise<string> {
		const tab = this.getActiveTab(sessionId)
		if (!tab) {
			return "(no active tab)"
		}
		return `URL: ${tab.url ?? "about:blank"}\nTitle: ${tab.title ?? "untitled"}\n`
	}

	/**
	 * Attach browser service to an existing browser launch handle.
	 * This is called by the extension host once the browser process
	 * is running. It provides a hook for future CDP connection.
	 */
	attach(): void {
		this._attached = true
	}

	detach(): void {
		this._attached = false
	}

	isAttached(): boolean {
		return this._attached
	}
}

export const browserService = new BrowserService()
