import type { ClineProvider } from "../../core/webview/ClineProvider"
import { SkillMetadata, SkillContent } from "../../shared/skills"
export type { SkillMetadata, SkillContent }
export declare class SkillsManager {
	private skills
	private providerRef
	private disposables
	private isDisposed
	constructor(provider: ClineProvider)
	initialize(): Promise<void>
	/**
	 * Discover all skills from global and project directories.
	 * Supports both generic skills (skills/) and mode-specific skills (skills-{mode}/).
	 * Also supports symlinks:
	 * - .ali/skills can be a symlink to a directory containing skill subdirectories
	 * - .ali/skills/[dirname] can be a symlink to a skill directory
	 */
	discoverSkills(): Promise<void>
	/**
	 * Scan a skills directory for skill subdirectories.
	 * Handles two symlink cases:
	 * 1. The skills directory itself is a symlink (resolved by directoryExists using realpath)
	 * 2. Individual skill subdirectories are symlinks
	 */
	private scanSkillsDirectory
	/**
	 * Load skill metadata from a skill directory.
	 * @param skillDir - The resolved path to the skill directory (target of symlink if symlinked)
	 * @param source - Whether this is a global or project skill
	 * @param mode - The mode this skill is specific to (undefined for generic skills)
	 * @param skillName - The skill name (from symlink name if symlinked, otherwise from directory name)
	 */
	private loadSkillMetadata
	/**
	 * Get skills available for the current mode.
	 * Resolves overrides: project > global, mode-specific > generic.
	 *
	 * @param currentMode - The current mode slug (e.g., 'code', 'architect')
	 */
	getSkillsForMode(currentMode: string): SkillMetadata[]
	/**
	 * Check if a skill is available in the given mode.
	 * - modeSlugs undefined or empty = available in all modes ("Any mode")
	 * - modeSlugs with values = available only if mode is in the array
	 */
	private isSkillAvailableInMode
	/**
	 * Determine if newSkill should override existingSkill based on priority rules.
	 * Priority: project > global, mode-specific > generic
	 */
	private shouldOverrideSkill
	/**
	 * Get all skills (for UI display, debugging, etc.)
	 */
	getAllSkills(): SkillMetadata[]
	getSkillContent(name: string, currentMode?: string): Promise<SkillContent | null>
	/**
	 * Get all skills metadata (for UI display)
	 * Returns skills from all sources without content
	 */
	getSkillsMetadata(): SkillMetadata[]
	/**
	 * Get a skill by name, source, and optionally mode
	 */
	getSkill(name: string, source: "global" | "project", mode?: string): SkillMetadata | undefined
	/**
	 * Find a skill by name and source (regardless of mode).
	 * Useful for opening/editing skills where the exact mode key may vary.
	 */
	findSkillByNameAndSource(name: string, source: "global" | "project"): SkillMetadata | undefined
	/**
	 * Validate skill name per agentskills.io spec using shared validation.
	 * Converts error codes to user-friendly error messages.
	 */
	private validateSkillName
	/**
	 * Convert skill name validation error code to a user-friendly error message.
	 */
	private getSkillNameErrorMessage
	/**
	 * Create a new skill
	 * @param name - Skill name (must be valid per agentskills.io spec)
	 * @param source - "global" or "project"
	 * @param description - Skill description
	 * @param modeSlugs - Optional mode restrictions (undefined/empty = any mode)
	 * @returns Path to created SKILL.md file
	 */
	createSkill(name: string, source: "global" | "project", description: string, modeSlugs?: string[]): Promise<string>
	/**
	 * Delete a skill
	 * @param name - Skill name to delete
	 * @param source - Where the skill is located
	 * @param mode - Optional mode (to locate in skills-{mode}/ directory)
	 */
	deleteSkill(name: string, source: "global" | "project", mode?: string): Promise<void>
	/**
	 * Move a skill to a different mode
	 * @param name - Skill name to move
	 * @param source - Where the skill is located ("global" or "project")
	 * @param currentMode - Current mode (undefined for generic skills)
	 * @param newMode - Target mode (undefined for generic skills)
	 */
	moveSkill(
		name: string,
		source: "global" | "project",
		currentMode: string | undefined,
		newMode: string | undefined,
	): Promise<void>
	/**
	 * Update the mode associations for a skill by modifying its SKILL.md frontmatter.
	 * @param name - Skill name
	 * @param source - Where the skill is located ("global" or "project")
	 * @param newModeSlugs - New mode slugs (undefined/empty = any mode)
	 */
	updateSkillModes(name: string, source: "global" | "project", newModeSlugs?: string[]): Promise<void>
	/**
	 * Get all skills directories to scan, including mode-specific directories.
	 */
	private getSkillsDirectories
	/**
	 * Get list of available modes (built-in + custom)
	 */
	private getAvailableModes
	private getSkillKey
	private setupFileWatchers
	private watchDirectory
	dispose(): Promise<void>
}
//# sourceMappingURL=SkillsManager.d.ts.map
