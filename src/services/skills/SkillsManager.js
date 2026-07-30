"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.SkillsManager = void 0
const fs = __importStar(require("fs/promises"))
const path = __importStar(require("path"))
const vscode = __importStar(require("vscode"))
const gray_matter_1 = __importDefault(require("gray-matter"))
const ali_config_1 = require("../ali-config")
const ali_config_2 = require("../ali-config")
const modes_1 = require("../../shared/modes")
const types_1 = require("@ali-code/types")
const i18n_1 = require("../../i18n")
class SkillsManager {
	skills = new Map()
	providerRef
	disposables = []
	isDisposed = false
	constructor(provider) {
		this.providerRef = new WeakRef(provider)
	}
	async initialize() {
		await this.discoverSkills()
		await this.setupFileWatchers()
	}
	/**
	 * Discover all skills from global and project directories.
	 * Supports both generic skills (skills/) and mode-specific skills (skills-{mode}/).
	 * Also supports symlinks:
	 * - .ali/skills can be a symlink to a directory containing skill subdirectories
	 * - .ali/skills/[dirname] can be a symlink to a skill directory
	 */
	async discoverSkills() {
		this.skills.clear()
		const skillsDirs = await this.getSkillsDirectories()
		for (const { dir, source, mode } of skillsDirs) {
			await this.scanSkillsDirectory(dir, source, mode)
		}
	}
	/**
	 * Scan a skills directory for skill subdirectories.
	 * Handles two symlink cases:
	 * 1. The skills directory itself is a symlink (resolved by directoryExists using realpath)
	 * 2. Individual skill subdirectories are symlinks
	 */
	async scanSkillsDirectory(dirPath, source, mode) {
		if (!(await (0, ali_config_2.directoryExists)(dirPath))) {
			return
		}
		try {
			// Get the real path (resolves if dirPath is a symlink)
			const realDirPath = await fs.realpath(dirPath)
			// Read directory entries
			const entries = await fs.readdir(realDirPath)
			for (const entryName of entries) {
				const entryPath = path.join(realDirPath, entryName)
				// Check if this entry is a directory (follows symlinks automatically)
				const stats = await fs.stat(entryPath).catch(() => null)
				if (!stats?.isDirectory()) continue
				// Load skill metadata - the skill name comes from the entry name (symlink name if symlinked)
				await this.loadSkillMetadata(entryPath, source, mode, entryName)
			}
		} catch {
			// Directory doesn't exist or can't be read - this is fine
		}
	}
	/**
	 * Load skill metadata from a skill directory.
	 * @param skillDir - The resolved path to the skill directory (target of symlink if symlinked)
	 * @param source - Whether this is a global or project skill
	 * @param mode - The mode this skill is specific to (undefined for generic skills)
	 * @param skillName - The skill name (from symlink name if symlinked, otherwise from directory name)
	 */
	async loadSkillMetadata(skillDir, source, mode, skillName) {
		const skillMdPath = path.join(skillDir, "SKILL.md")
		if (!(await (0, ali_config_2.fileExists)(skillMdPath))) return
		try {
			const fileContent = await fs.readFile(skillMdPath, "utf-8")
			// Use gray-matter to parse frontmatter
			const { data: frontmatter, content: body } = (0, gray_matter_1.default)(fileContent)
			// Validate required fields (only name and description for now)
			if (!frontmatter.name || typeof frontmatter.name !== "string") {
				console.error(`Skill at ${skillDir} is missing required 'name' field`)
				return
			}
			if (!frontmatter.description || typeof frontmatter.description !== "string") {
				console.error(`Skill at ${skillDir} is missing required 'description' field`)
				return
			}
			// Validate that frontmatter name matches the skill name (directory name or symlink name)
			// Per the Agent Skills spec: "name field must match the parent directory name"
			const effectiveSkillName = skillName || path.basename(skillDir)
			if (frontmatter.name !== effectiveSkillName) {
				console.error(`Skill name "${frontmatter.name}" doesn't match directory "${effectiveSkillName}"`)
				return
			}
			// Validate skill name per agentskills.io spec using shared validation
			const nameValidation = (0, types_1.validateSkillName)(effectiveSkillName)
			if (!nameValidation.valid) {
				const errorMessage = this.getSkillNameErrorMessage(effectiveSkillName, nameValidation.error)
				console.error(`Skill name "${effectiveSkillName}" is invalid: ${errorMessage}`)
				return
			}
			// Description constraints:
			// - 1-1024 chars
			// - non-empty (after trimming)
			const description = frontmatter.description.trim()
			if (description.length < 1 || description.length > 1024) {
				console.error(
					`Skill "${effectiveSkillName}" has an invalid description length: must be 1-1024 characters (got ${description.length})`,
				)
				return
			}
			// Parse modeSlugs from frontmatter (new format) or fall back to directory-based mode
			// Priority: frontmatter.modeSlugs > frontmatter.mode > directory mode
			let modeSlugs
			if (Array.isArray(frontmatter.modeSlugs)) {
				modeSlugs = frontmatter.modeSlugs.filter((s) => typeof s === "string" && s.length > 0)
				if (modeSlugs.length === 0) {
					modeSlugs = undefined // Empty array means "any mode"
				}
			} else if (typeof frontmatter.mode === "string" && frontmatter.mode.length > 0) {
				// Legacy single mode in frontmatter
				modeSlugs = [frontmatter.mode]
			} else if (mode) {
				// Fall back to directory-based mode (skills-{mode}/)
				modeSlugs = [mode]
			}
			// Create unique key combining name, source, and modeSlugs for override resolution
			// For backward compatibility, use first mode slug or undefined for the key
			const primaryMode = modeSlugs?.[0]
			const skillKey = this.getSkillKey(effectiveSkillName, source, primaryMode)
			this.skills.set(skillKey, {
				name: effectiveSkillName,
				description,
				path: skillMdPath,
				source,
				mode: primaryMode, // Deprecated: kept for backward compatibility
				modeSlugs, // New: array of mode slugs, undefined = any mode
			})
		} catch (error) {
			console.error(`Failed to load skill at ${skillDir}:`, error)
		}
	}
	/**
	 * Get skills available for the current mode.
	 * Resolves overrides: project > global, mode-specific > generic.
	 *
	 * @param currentMode - The current mode slug (e.g., 'code', 'architect')
	 */
	getSkillsForMode(currentMode) {
		const resolvedSkills = new Map()
		for (const skill of this.skills.values()) {
			// Check if skill is available in current mode:
			// - modeSlugs undefined or empty = available in all modes ("Any mode")
			// - modeSlugs array with values = available only if currentMode is in the array
			const isAvailableInMode = this.isSkillAvailableInMode(skill, currentMode)
			if (!isAvailableInMode) continue
			const existingSkill = resolvedSkills.get(skill.name)
			if (!existingSkill) {
				resolvedSkills.set(skill.name, skill)
				continue
			}
			// Apply override rules
			const shouldOverride = this.shouldOverrideSkill(existingSkill, skill)
			if (shouldOverride) {
				resolvedSkills.set(skill.name, skill)
			}
		}
		return Array.from(resolvedSkills.values())
	}
	/**
	 * Check if a skill is available in the given mode.
	 * - modeSlugs undefined or empty = available in all modes ("Any mode")
	 * - modeSlugs with values = available only if mode is in the array
	 */
	isSkillAvailableInMode(skill, currentMode) {
		// No mode restrictions = available in all modes
		if (!skill.modeSlugs || skill.modeSlugs.length === 0) {
			return true
		}
		// Check if current mode is in the allowed modes
		return skill.modeSlugs.includes(currentMode)
	}
	/**
	 * Determine if newSkill should override existingSkill based on priority rules.
	 * Priority: project > global, mode-specific > generic
	 */
	shouldOverrideSkill(existing, newSkill) {
		// Define source priority: project > global
		const sourcePriority = {
			project: 2,
			global: 1,
		}
		const existingPriority = sourcePriority[existing.source] ?? 0
		const newPriority = sourcePriority[newSkill.source] ?? 0
		// Higher priority source always wins
		if (newPriority > existingPriority) return true
		if (newPriority < existingPriority) return false
		// Same source: mode-specific overrides generic
		// A skill with modeSlugs (restricted) is more specific than one without (any mode)
		const existingHasModes = existing.modeSlugs && existing.modeSlugs.length > 0
		const newHasModes = newSkill.modeSlugs && newSkill.modeSlugs.length > 0
		if (newHasModes && !existingHasModes) return true
		if (!newHasModes && existingHasModes) return false
		// Same source and same mode-specificity: keep existing (first wins)
		return false
	}
	/**
	 * Get all skills (for UI display, debugging, etc.)
	 */
	getAllSkills() {
		return Array.from(this.skills.values())
	}
	async getSkillContent(name, currentMode) {
		// If mode is provided, try to find the best matching skill
		let skill
		if (currentMode) {
			const modeSkills = this.getSkillsForMode(currentMode)
			skill = modeSkills.find((s) => s.name === name)
		} else {
			// Fall back to any skill with this name
			skill = Array.from(this.skills.values()).find((s) => s.name === name)
		}
		if (!skill) return null
		// Read skill content from disk
		const fileContent = await fs.readFile(skill.path, "utf-8")
		const { content: body } = (0, gray_matter_1.default)(fileContent)
		return {
			...skill,
			instructions: body.trim(),
		}
	}
	/**
	 * Get all skills metadata (for UI display)
	 * Returns skills from all sources without content
	 */
	getSkillsMetadata() {
		return this.getAllSkills()
	}
	/**
	 * Get a skill by name, source, and optionally mode
	 */
	getSkill(name, source, mode) {
		const skillKey = this.getSkillKey(name, source, mode)
		return this.skills.get(skillKey)
	}
	/**
	 * Find a skill by name and source (regardless of mode).
	 * Useful for opening/editing skills where the exact mode key may vary.
	 */
	findSkillByNameAndSource(name, source) {
		for (const skill of this.skills.values()) {
			if (skill.name === name && skill.source === source) {
				return skill
			}
		}
		return undefined
	}
	/**
	 * Validate skill name per agentskills.io spec using shared validation.
	 * Converts error codes to user-friendly error messages.
	 */
	validateSkillName(name) {
		const result = (0, types_1.validateSkillName)(name)
		if (!result.valid) {
			return { valid: false, error: this.getSkillNameErrorMessage(name, result.error) }
		}
		return { valid: true }
	}
	/**
	 * Convert skill name validation error code to a user-friendly error message.
	 */
	getSkillNameErrorMessage(name, error) {
		switch (error) {
			case types_1.SkillNameValidationError.Empty:
				return (0, i18n_1.t)("skills:errors.name_length", {
					maxLength: types_1.SKILL_NAME_MAX_LENGTH,
					length: name.length,
				})
			case types_1.SkillNameValidationError.TooLong:
				return (0, i18n_1.t)("skills:errors.name_length", {
					maxLength: types_1.SKILL_NAME_MAX_LENGTH,
					length: name.length,
				})
			case types_1.SkillNameValidationError.InvalidFormat:
				return (0, i18n_1.t)("skills:errors.name_format")
		}
	}
	/**
	 * Create a new skill
	 * @param name - Skill name (must be valid per agentskills.io spec)
	 * @param source - "global" or "project"
	 * @param description - Skill description
	 * @param modeSlugs - Optional mode restrictions (undefined/empty = any mode)
	 * @returns Path to created SKILL.md file
	 */
	async createSkill(name, source, description, modeSlugs) {
		// Validate skill name
		const validation = this.validateSkillName(name)
		if (!validation.valid) {
			throw new Error(validation.error)
		}
		// Validate description
		const trimmedDescription = description.trim()
		if (trimmedDescription.length < 1 || trimmedDescription.length > 1024) {
			throw new Error((0, i18n_1.t)("skills:errors.description_length", { length: trimmedDescription.length }))
		}
		// Determine base directory
		let baseDir
		if (source === "global") {
			baseDir = (0, ali_config_1.getGlobalAliDirectory)()
		} else {
			const provider = this.providerRef.deref()
			if (!provider?.cwd) {
				throw new Error((0, i18n_1.t)("skills:errors.no_workspace"))
			}
			baseDir = path.join(provider.cwd, ".ali")
		}
		// Always use the generic skills directory (mode info stored in frontmatter now)
		const skillsDir = path.join(baseDir, "skills")
		const skillDir = path.join(skillsDir, name)
		const skillMdPath = path.join(skillDir, "SKILL.md")
		// Check if skill already exists
		if (await (0, ali_config_2.fileExists)(skillMdPath)) {
			throw new Error((0, i18n_1.t)("skills:errors.already_exists", { name, path: skillMdPath }))
		}
		// Create the skill directory
		await fs.mkdir(skillDir, { recursive: true })
		// Generate SKILL.md content with frontmatter
		const titleName = name
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
		// Build frontmatter with optional modeSlugs
		const frontmatterLines = [`name: ${name}`, `description: ${trimmedDescription}`]
		if (modeSlugs && modeSlugs.length > 0) {
			frontmatterLines.push(`modeSlugs:`)
			for (const slug of modeSlugs) {
				frontmatterLines.push(`  - ${slug}`)
			}
		}
		const skillContent = `---
${frontmatterLines.join("\n")}
---

# ${titleName}

## Instructions

Add your skill instructions here.
`
		// Write the SKILL.md file
		await fs.writeFile(skillMdPath, skillContent, "utf-8")
		// Refresh skills list
		await this.discoverSkills()
		return skillMdPath
	}
	/**
	 * Delete a skill
	 * @param name - Skill name to delete
	 * @param source - Where the skill is located
	 * @param mode - Optional mode (to locate in skills-{mode}/ directory)
	 */
	async deleteSkill(name, source, mode) {
		// Find the skill
		const skill = this.getSkill(name, source, mode)
		if (!skill) {
			const modeInfo = mode ? ` (mode: ${mode})` : ""
			throw new Error((0, i18n_1.t)("skills:errors.not_found", { name, source, modeInfo }))
		}
		// Get the skill directory (parent of SKILL.md)
		const skillDir = path.dirname(skill.path)
		// Delete the entire skill directory
		await fs.rm(skillDir, { recursive: true, force: true })
		// Refresh skills list
		await this.discoverSkills()
	}
	/**
	 * Move a skill to a different mode
	 * @param name - Skill name to move
	 * @param source - Where the skill is located ("global" or "project")
	 * @param currentMode - Current mode (undefined for generic skills)
	 * @param newMode - Target mode (undefined for generic skills)
	 */
	async moveSkill(name, source, currentMode, newMode) {
		// Don't move if source and destination are the same
		if (currentMode === newMode) {
			return
		}
		// Find the skill at its current location
		const skill = this.getSkill(name, source, currentMode)
		if (!skill) {
			const modeInfo = currentMode ? ` (mode: ${currentMode})` : ""
			throw new Error((0, i18n_1.t)("skills:errors.not_found", { name, source, modeInfo }))
		}
		// Determine base directory
		let baseDir
		if (source === "global") {
			baseDir = (0, ali_config_1.getGlobalAliDirectory)()
		} else {
			const provider = this.providerRef.deref()
			if (!provider?.cwd) {
				throw new Error((0, i18n_1.t)("skills:errors.no_workspace"))
			}
			baseDir = path.join(provider.cwd, ".ali")
		}
		// Determine source and destination directories
		const sourceDirName = currentMode ? `skills-${currentMode}` : "skills"
		const destDirName = newMode ? `skills-${newMode}` : "skills"
		const sourceDir = path.join(baseDir, sourceDirName, name)
		const destSkillsDir = path.join(baseDir, destDirName)
		const destDir = path.join(destSkillsDir, name)
		const destSkillMdPath = path.join(destDir, "SKILL.md")
		// Check if skill already exists at destination
		if (await (0, ali_config_2.fileExists)(destSkillMdPath)) {
			throw new Error((0, i18n_1.t)("skills:errors.already_exists", { name, path: destSkillMdPath }))
		}
		// Ensure destination skills directory exists
		await fs.mkdir(destSkillsDir, { recursive: true })
		// Move the skill directory
		await fs.rename(sourceDir, destDir)
		// Clean up empty source skills directory
		const sourceSkillsDir = path.join(baseDir, sourceDirName)
		try {
			const entries = await fs.readdir(sourceSkillsDir)
			if (entries.length === 0) {
				await fs.rmdir(sourceSkillsDir)
			}
		} catch {
			// Ignore errors - directory might not exist or have permission issues
		}
		// Refresh skills list
		await this.discoverSkills()
	}
	/**
	 * Update the mode associations for a skill by modifying its SKILL.md frontmatter.
	 * @param name - Skill name
	 * @param source - Where the skill is located ("global" or "project")
	 * @param newModeSlugs - New mode slugs (undefined/empty = any mode)
	 */
	async updateSkillModes(name, source, newModeSlugs) {
		// Find any skill with this name and source (regardless of current mode)
		let skill
		for (const s of this.skills.values()) {
			if (s.name === name && s.source === source) {
				skill = s
				break
			}
		}
		if (!skill) {
			throw new Error((0, i18n_1.t)("skills:errors.not_found", { name, source, modeInfo: "" }))
		}
		// Read the current SKILL.md file
		const fileContent = await fs.readFile(skill.path, "utf-8")
		const { data: frontmatter, content: body } = (0, gray_matter_1.default)(fileContent)
		// Update the frontmatter with new modeSlugs
		if (newModeSlugs && newModeSlugs.length > 0) {
			frontmatter.modeSlugs = newModeSlugs
			// Remove legacy mode field if present
			delete frontmatter.mode
		} else {
			// Empty/undefined = any mode, remove mode restrictions
			delete frontmatter.modeSlugs
			delete frontmatter.mode
		}
		// Serialize back to SKILL.md format
		const newContent = gray_matter_1.default.stringify(body, frontmatter)
		await fs.writeFile(skill.path, newContent, "utf-8")
		// Refresh skills list
		await this.discoverSkills()
	}
	/**
	 * Get all skills directories to scan, including mode-specific directories.
	 */
	async getSkillsDirectories() {
		const dirs = []
		const globalAliDir = (0, ali_config_1.getGlobalAliDirectory)()
		const globalAgentsDir = (0, ali_config_1.getGlobalAgentsDirectory)()
		const provider = this.providerRef.deref()
		const projectAliDir = provider?.cwd ? path.join(provider.cwd, ".ali") : null
		const projectAgentsDir = provider?.cwd ? (0, ali_config_1.getProjectAgentsDirectoryForCwd)(provider.cwd) : null
		// Get list of modes to check for mode-specific skills
		const modesList = await this.getAvailableModes()
		// Priority rules for skills with the same name:
		// 1. Source level: project > global (handled by shouldOverrideSkill in getSkillsForMode)
		// 2. Within the same source level: later-processed directories override earlier ones
		//    (via Map.set replacement during discovery - same source+mode+name key gets replaced)
		//
		// Processing order (later directories override earlier ones at the same source level):
		// - Global: .agents/skills first, then .ali/skills (so .roo wins)
		// - Project: .agents/skills first, then .ali/skills (so .roo wins)
		// Global .agents directories (lowest priority - shared across agents)
		dirs.push({ dir: path.join(globalAgentsDir, "skills"), source: "global" })
		for (const mode of modesList) {
			dirs.push({ dir: path.join(globalAgentsDir, `skills-${mode}`), source: "global", mode })
		}
		// Project .agents directories
		if (projectAgentsDir) {
			dirs.push({ dir: path.join(projectAgentsDir, "skills"), source: "project" })
			for (const mode of modesList) {
				dirs.push({ dir: path.join(projectAgentsDir, `skills-${mode}`), source: "project", mode })
			}
		}
		// Global .roo directories (Ali-specific, higher priority than .agents)
		dirs.push({ dir: path.join(globalAliDir, "skills"), source: "global" })
		for (const mode of modesList) {
			dirs.push({ dir: path.join(globalAliDir, `skills-${mode}`), source: "global", mode })
		}
		// Project .roo directories (highest priority)
		if (projectAliDir) {
			dirs.push({ dir: path.join(projectAliDir, "skills"), source: "project" })
			for (const mode of modesList) {
				dirs.push({ dir: path.join(projectAliDir, `skills-${mode}`), source: "project", mode })
			}
		}
		return dirs
	}
	/**
	 * Get list of available modes (built-in + custom)
	 */
	async getAvailableModes() {
		const provider = this.providerRef.deref()
		const builtInModeSlugs = modes_1.modes.map((m) => m.slug)
		if (!provider) {
			return builtInModeSlugs
		}
		try {
			const customModes = await provider.customModesManager.getCustomModes()
			const allModes = (0, modes_1.getAllModes)(customModes)
			return allModes.map((m) => m.slug)
		} catch {
			return builtInModeSlugs
		}
	}
	getSkillKey(name, source, mode) {
		return `${source}:${mode || "generic"}:${name}`
	}
	async setupFileWatchers() {
		// Skip if test environment is detected or VSCode APIs are not available
		if (process.env.NODE_ENV === "test" || !vscode.workspace.createFileSystemWatcher) {
			return
		}
		const provider = this.providerRef.deref()
		if (!provider?.cwd) return
		// Watch for changes in skills directories
		const globalAliDir = (0, ali_config_1.getGlobalAliDirectory)()
		const globalAgentsDir = (0, ali_config_1.getGlobalAgentsDirectory)()
		const projectAliDir = path.join(provider.cwd, ".ali")
		const projectAgentsDir = (0, ali_config_1.getProjectAgentsDirectoryForCwd)(provider.cwd)
		// Watch global .roo skills directory
		this.watchDirectory(path.join(globalAliDir, "skills"))
		// Watch global .agents skills directory
		this.watchDirectory(path.join(globalAgentsDir, "skills"))
		// Watch project .roo skills directory
		this.watchDirectory(path.join(projectAliDir, "skills"))
		// Watch project .agents skills directory
		this.watchDirectory(path.join(projectAgentsDir, "skills"))
		// Watch mode-specific directories for all available modes
		const modesList = await this.getAvailableModes()
		for (const mode of modesList) {
			// .roo mode-specific
			this.watchDirectory(path.join(globalAliDir, `skills-${mode}`))
			this.watchDirectory(path.join(projectAliDir, `skills-${mode}`))
			// .agents mode-specific
			this.watchDirectory(path.join(globalAgentsDir, `skills-${mode}`))
			this.watchDirectory(path.join(projectAgentsDir, `skills-${mode}`))
		}
	}
	watchDirectory(dirPath) {
		if (process.env.NODE_ENV === "test" || !vscode.workspace.createFileSystemWatcher) {
			return
		}
		const pattern = new vscode.RelativePattern(dirPath, "**/SKILL.md")
		const watcher = vscode.workspace.createFileSystemWatcher(pattern)
		watcher.onDidChange(async (uri) => {
			if (this.isDisposed) return
			await this.discoverSkills()
		})
		watcher.onDidCreate(async (uri) => {
			if (this.isDisposed) return
			await this.discoverSkills()
		})
		watcher.onDidDelete(async (uri) => {
			if (this.isDisposed) return
			await this.discoverSkills()
		})
		this.disposables.push(watcher)
	}
	async dispose() {
		this.isDisposed = true
		this.disposables.forEach((d) => d.dispose())
		this.disposables = []
		this.skills.clear()
	}
}
exports.SkillsManager = SkillsManager
