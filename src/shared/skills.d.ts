/**
 * Skill metadata for discovery (loaded at startup)
 * Only name and description are required for now
 */
export interface SkillMetadata {
	name: string
	description: string
	path: string
	source: "global" | "project"
	/**
	 * @deprecated Use modeSlugs instead. Kept for backward compatibility.
	 * If set, skill is only available in this mode.
	 */
	mode?: string
	/**
	 * Mode slugs where this skill is available.
	 * - undefined or empty array means the skill is available in all modes ("Any mode").
	 * - An array with one or more mode slugs restricts the skill to those modes.
	 */
	modeSlugs?: string[]
}
/**
 * Full skill content (loaded on activation)
 */
export interface SkillContent extends SkillMetadata {
	instructions: string
}
//# sourceMappingURL=skills.d.ts.map
