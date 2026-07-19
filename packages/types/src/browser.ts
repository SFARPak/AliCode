import { z } from "zod"

/**
 * BrowserAutomationSettings - configuration for browser automation
 */
export const browserAutomationSettingsSchema = z.object({
	/** Whether browser automation is enabled */
	enabled: z.boolean().default(false),
	/** Use system Chrome instead of bundled Chromium */
	useSystemChrome: z.boolean().default(false),
	/** Run browser in headless mode */
	headless: z.boolean().default(true),
	/** Allowed domains for browser automation (empty = all allowed) */
	allowedDomains: z.array(z.string()).default([]),
	/** Maximum number of browser tabs per session */
	maxTabs: z.number().default(5),
	/** Navigation timeout in milliseconds */
	navigationTimeoutMs: z.number().default(30_000),
})
export type BrowserAutomationSettings = z.infer<typeof browserAutomationSettingsSchema>

/**
 * BrowserTab - represents an open browser tab
 */
export const browserTabSchema = z.object({
	id: z.string(),
	url: z.string().optional(),
	title: z.string().optional(),
	active: z.boolean(),
})
export type BrowserTab = z.infer<typeof browserTabSchema>

/**
 * BrowserSession - a running browser instance
 */
export const browserSessionSchema = z.object({
	sessionId: z.string(),
	activeTabId: z.string().optional(),
	tabs: z.array(browserTabSchema),
	startedAt: z.number(),
	lastActivityAt: z.number().optional(),
})
export type BrowserSession = z.infer<typeof browserSessionSchema>
