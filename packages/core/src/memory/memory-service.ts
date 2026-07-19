import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"
import { randomUUID } from "crypto"
import type {
	TypedMemoryItem as MemoryItem,
	MemoryState,
	MemoryRecallResult,
	MemorySettings,
	MemoryMode,
} from "@ali-code/types"

const MEMORY_DIR_NAME = "alicode-memory"
const STATE_FILE = "state.json"
const PROJECT_FILE = "project.md"
const ENVIRONMENT_FILE = "environment.md"
const CORRECTIONS_FILE = "corrections.md"
const SESSIONS_DIR = "sessions"

/**
 * Platform-agnostic memory service for the AliCode extension.
 *
 * Provides typed project memory with recall, capture, and session digest
 * storage. Uses the filesystem as the backing store — no external database
 * required. The memory system operates on three markdown source files:
 *
 *   - project.md  — long-lived project facts, constraints, decisions
 *   - environment.md — environment details (OS, tools, versions)
 *   - corrections.md — user corrections and feedback
 *
 * Session digests are stored as separate files and indexed for recall.
 */
export class MemoryService {
	private root: string
	private memoryDir: string
	private state: MemoryState
	private settings: MemorySettings
	private _initialized = false

	constructor(options?: { root?: string; settings?: Partial<MemorySettings> }) {
		this.root = options?.root ?? process.cwd()
		this.settings = {
			enabled: true,
			defaultScope: "project",
			autoInject: true,
			maxInjectionBytes: 4096,
			maxSessionFiles: 20,
			maxRecentSessions: 5,
			...options?.settings,
		}
		this.state = this.defaultState()
		this.memoryDir = ""
	}

	/** Reset to factory defaults */
	private defaultState(): MemoryState {
		return {
			version: 1,
			enabled: this.settings.enabled,
			scope: this.settings.defaultScope,
			autoInject: this.settings.autoInject,
			capture: {
				mode: "selective",
				maxOpsPerRun: 16,
				minIntervalMs: 300_000,
			},
			stats: {
				recallCalls: 0,
				injectedCalls: 0,
				lastBuildMs: 0,
				lastCaptureMs: 0,
			},
		}
	}

	/**
	 * Initialize the memory directory structure for the current project root.
	 * Returns false if memory is disabled in settings.
	 */
	async initialize(root?: string): Promise<boolean> {
		if (root) {
			this.root = root
		}
		if (!this.settings.enabled) {
			return false
		}

		// Derive a stable identity from the project root path
		const identity = this.projectIdentity(this.root)
		this.memoryDir = path.join(os.homedir(), ".alicode", "memory", identity)

		await fs.mkdir(this.memoryDir, { recursive: true })
		await fs.mkdir(path.join(this.memoryDir, SESSIONS_DIR), { recursive: true })

		// Scaffold source files if absent
		const defaultFiles: Record<string, string> = {
			[PROJECT_FILE]: "# Project Memory\n\n<!-- This file is maintained by AliCode's memory system. -->",
			[ENVIRONMENT_FILE]: "# Environment Memory\n\n<!-- Tool versions, OS details, and runtime info. -->",
			[CORRECTIONS_FILE]: "# Corrections\n\n<!-- User corrections to guide future behavior. -->",
		}
		for (const [fileName, content] of Object.entries(defaultFiles)) {
			const filePath = path.join(this.memoryDir, fileName)
			try {
				await fs.access(filePath)
			} catch {
				await fs.writeFile(filePath, content, "utf-8")
			}
		}

		// Load persisted state
		await this.loadState()
		this._initialized = true
		return true
	}

	/**
	 * Enable the memory system and initialize storage.
	 */
	async enable(root?: string): Promise<boolean> {
		this.settings.enabled = true
		this.state.enabled = true
		return this.initialize(root)
	}

	/**
	 * Disable the memory system.
	 */
	disable(): void {
		this.settings.enabled = false
		this.state.enabled = false
	}

	/**
	 * Check whether memory is enabled and initialized.
	 */
	isEnabled(): boolean {
		return this._initialized && this.settings.enabled
	}

	/**
	 * Remember a typed fact into the project memory.
	 * Always writes to project.md plus a typed section.
	 */
	async remember(key: string, text: string, section = "facts"): Promise<void> {
		if (!this.isEnabled()) {
			return
		}
		const item: MemoryItem = {
			id: randomUUID(),
			scope: this.state.scope,
			source: "project.md",
			section,
			key,
			text,
			created: Date.now(),
			modified: Date.now(),
		}

		const projectPath = path.join(this.memoryDir, PROJECT_FILE)
		const heading = `\n## [${section}] ${key}\n\n- ${text}\n`
		await fs.appendFile(projectPath, heading, "utf-8")

		this.state.stats.lastCaptureMs = Date.now()
		await this.persistState()
	}

	/**
	 * Record a correction from the user.
	 */
	async correct(key: string, text: string): Promise<void> {
		if (!this.isEnabled()) {
			return
		}
		const correctionsPath = path.join(this.memoryDir, CORRECTIONS_FILE)
		const heading = `\n## [correction] ${key}\n\n- ${text}\n`
		await fs.appendFile(correctionsPath, heading, "utf-8")
		this.state.stats.lastCaptureMs = Date.now()
		await this.persistState()
	}

	/**
	 * Recall relevant memory items for a query string.
	 * Returns formatted markdown blocks suitable for injection into the prompt.
	 */
	async recall(query: string, mode: MemoryMode = "search"): Promise<MemoryRecallResult> {
		if (!this.isEnabled()) {
			return { blocks: [], hits: 0, topics: [], files: [] }
		}

		this.state.stats.recallCalls++
		await this.persistState()

		const sourceFiles = [PROJECT_FILE, ENVIRONMENT_FILE, CORRECTIONS_FILE]
		const blocks: string[] = []
		const hitKeys = new Set<string>()
		const topics = this.extractTopics(query)

		// Score each source file by query term frequency
		const scored = await Promise.all(
			sourceFiles.map(async (file) => {
				const filePath = path.join(this.memoryDir, file)
				try {
					const content = await fs.readFile(filePath, "utf-8")
					const score = this.scoreContent(content, topics)
					return { file, content, score }
				} catch {
					return { file, content: "", score: 0 }
				}
			}),
		)

		scored.sort((a, b) => b.score - a.score)

		let totalInjected = 0
		const maxBytes = this.settings.maxInjectionBytes || 4096
		const includedFiles: string[] = []

		for (const { file, content } of scored) {
			if (totalInjected >= maxBytes) {
				break
			}
			if (!content.trim()) {
				continue
			}

			const relevantSections = this.extractRelevantSections(content, topics)
			if (relevantSections.length === 0) {
				continue
			}

			const block = `<!-- Memory from ${file} -->\n${relevantSections.join("\n")}\n`
			const blockBytes = Buffer.byteLength(block)

			if (totalInjected + blockBytes > maxBytes) {
				// Truncate the last section to fit within budget
				const truncated = this.truncateToFit(relevantSections.join("\n"), maxBytes - totalInjected)
				if (truncated.trim()) {
					blocks.push(`<!-- Memory from ${file} (truncated) -->\n${truncated}`)
					includedFiles.push(file)
					totalInjected += Buffer.byteLength(truncated)
				}
				break
			}

			blocks.push(block)
			includedFiles.push(file)
			totalInjected += blockBytes

			// Track hit keys for metadata
			for (const section of relevantSections) {
				const keyMatch = section.match(/\[(.+?)\]/)
				if (keyMatch && keyMatch[1]) {
					hitKeys.add(keyMatch[1])
				}
			}
		}

		if (mode === "typed") {
			blocks.push("<!-- All typed memory items -->")
		}

		return {
			blocks,
			hits: hitKeys.size,
			topics,
			files: includedFiles,
		}
	}

	/**
	 * Record a session digest after a task session completes.
	 */
	async recordSession(sessionId: string, summary: string, source: string = "source.md"): Promise<void> {
		if (!this.isEnabled()) {
			return
		}
		const digestPath = path.join(this.memoryDir, SESSIONS_DIR, `${sessionId}.md`)
		const content = `# Session Digest\n\n- **Session:** ${sessionId}\n- **Recorded:** ${new Date().toISOString()}\n\n${summary}\n`
		await fs.writeFile(digestPath, content, "utf-8")

		// Prune old session files beyond retention limit
		await this.pruneSessions()
	}

	/**
	 * Get the current persisted memory state (for settings UI).
	 */
	getState(): Readonly<MemoryState> {
		return Object.freeze({ ...this.state, stats: { ...this.state.stats } })
	}

	/**
	 * Update memory settings.
	 */
	updateSettings(settings: Partial<MemorySettings>): void {
		this.settings = { ...this.settings, ...settings }
	}

	/**
	 * Get current memory settings.
	 */
	getSettings(): Readonly<MemorySettings> {
		return Object.freeze({ ...this.settings })
	}

	/**
	 * Rebuild the memory index from source files.
	 */
	async rebuild(): Promise<{ durationMs: number }> {
		const start = Date.now()
		if (!this.isEnabled()) {
			return { durationMs: 0 }
		}
		// Touch state to indicate rebuild occurred
		this.state.stats.lastBuildMs = Date.now()
		await this.persistState()
		return { durationMs: Date.now() - start }
	}

	/**
	 * Purge all memory data for the current project.
	 */
	async purge(): Promise<void> {
		if (!this.memoryDir) {
			return
		}
		try {
			await fs.rm(this.memoryDir, { recursive: true, force: true })
		} catch {
			// Best-effort purge
		}
		this._initialized = false
		this.state = this.defaultState()
	}

	// ---- Private helpers ----

	private async loadState(): Promise<void> {
		const statePath = path.join(this.memoryDir, STATE_FILE)
		try {
			const raw = await fs.readFile(statePath, "utf-8")
			const parsed = JSON.parse(raw) as MemoryState
			// Merge with defaults to handle schema evolution
			this.state = {
				...this.defaultState(),
				...parsed,
				stats: { ...this.defaultState().stats, ...(parsed.stats ?? {}) },
			}
		} catch {
			this.state = this.defaultState()
			await this.persistState()
		}
	}

	private async persistState(): Promise<void> {
		if (!this.memoryDir) {
			return
		}
		const statePath = path.join(this.memoryDir, STATE_FILE)
		// Build a payload respecting the contract: limits are NEVER persisted; stats ARE persisted
		const payload: MemoryState = {
			version: 1,
			enabled: this.state.enabled,
			scope: this.state.scope,
			autoInject: this.state.autoInject,
			capture: { ...this.state.capture },
			stats: { ...this.state.stats },
		}
		await fs.writeFile(statePath, JSON.stringify(payload, null, 2), "utf-8")
	}

	private async pruneSessions(): Promise<void> {
		const sessionsDir = path.join(this.memoryDir, SESSIONS_DIR)
		try {
			const entries = await fs.readdir(sessionsDir)
			if (entries.length <= (this.settings.maxSessionFiles ?? 20)) {
				return
			}
			const files = await Promise.all(
				entries
					.filter((f) => f.endsWith(".md"))
					.map(async (f) => ({
						name: f,
						mtime: (await fs.stat(path.join(sessionsDir, f))).mtimeMs,
					})),
			)
			files.sort((a, b) => a.mtime - b.mtime)

			const toDelete = files.slice(0, files.length - (this.settings.maxSessionFiles ?? 20))
			await Promise.all(toDelete.map((f) => fs.unlink(path.join(sessionsDir, f.name))))
		} catch {
			// Best-effort prune
		}
	}

	private projectIdentity(root: string): string {
		return Buffer.from(path.resolve(root)).toString("hex").slice(0, 16)
	}

	private extractTopics(text: string): string[] {
		const stop = new Set([
			"the",
			"a",
			"an",
			"is",
			"are",
			"was",
			"were",
			"be",
			"been",
			"being",
			"have",
			"has",
			"had",
			"do",
			"does",
			"did",
			"will",
			"would",
			"could",
			"should",
			"may",
			"might",
			"shall",
			"can",
			"to",
			"of",
			"in",
			"for",
			"on",
			"with",
			"at",
			"by",
			"from",
			"as",
			"into",
			"through",
			"during",
			"before",
			"after",
			"above",
			"below",
			"between",
			"out",
			"off",
			"over",
			"under",
			"again",
			"further",
			"then",
			"once",
			"here",
			"there",
			"when",
			"where",
			"why",
			"how",
			"all",
			"each",
			"every",
			"both",
			"few",
			"more",
			"most",
			"other",
			"some",
			"such",
			"no",
			"nor",
			"not",
			"only",
			"own",
			"same",
			"so",
			"than",
			"too",
			"very",
			"just",
			"because",
			"but",
			"and",
			"or",
			"if",
			"while",
			"about",
			"up",
			"its",
			"it",
			"this",
			"that",
			"these",
			"those",
			"i",
			"me",
			"my",
			"we",
			"our",
			"you",
			"your",
			"he",
			"him",
			"his",
			"she",
			"her",
			"they",
			"them",
			"their",
		])
		const words = text
			.toLowerCase()
			.split(/\W+/)
			.filter((w) => w.length > 2 && !stop.has(w))
		return [...new Set(words)].slice(0, 20)
	}

	private scoreContent(content: string, topics: string[]): number {
		const lower = content.toLowerCase()
		let score = 0
		for (const topic of topics) {
			const matches = lower.match(new RegExp(topic, "gi"))
			if (matches) {
				score += matches.length
			}
		}
		return score
	}

	private extractRelevantSections(content: string, topics: string[]): string[] {
		const sections: string[] = []
		const lines = content.split("\n")
		let buffer: string[] = []
		let scoreBuffer = 0

		for (const line of lines) {
			const lower = line.toLowerCase()
			const topicHits = topics.filter((t) => lower.includes(t)).length
			if (topicHits > 0 || buffer.length > 0) {
				buffer.push(line)
				scoreBuffer += topicHits
				// End section when we encounter an empty section boundary after content
				if (line.startsWith("## ") && scoreBuffer > 0 && buffer.length > 2) {
					sections.push(buffer.join("\n"))
					buffer = []
					scoreBuffer = 0
				}
			}
		}
		if (buffer.length > 0) {
			sections.push(buffer.join("\n"))
		}
		return sections.filter((s) => s.trim().length > 0)
	}

	private truncateToFit(text: string, maxBytes: number): string {
		if (Buffer.byteLength(text) <= maxBytes) {
			return text
		}
		let truncated = text
		while (Buffer.byteLength(truncated) > maxBytes && truncated.length > 0) {
			truncated = truncated.slice(0, truncated.length - 1)
		}
		return truncated.trimEnd()
	}
}

/**
 * Singleton memory service instance.
 */
export const memoryService = new MemoryService()
