import type { SkillsManager } from "../../../services/skills/SkillsManager"
type SkillsManagerLike = Pick<SkillsManager, "getSkillsForMode">
/**
 * Generate the skills section for the system prompt.
 * Only includes skills relevant to the current mode.
 * Format matches the modes section style.
 *
 * @param skillsManager - The SkillsManager instance
 * @param currentMode - The current mode slug (e.g., 'code', 'architect')
 */
export declare function getSkillsSection(
	skillsManager: SkillsManagerLike | undefined,
	currentMode: string | undefined,
): Promise<string>
export {}
//# sourceMappingURL=skills.d.ts.map
