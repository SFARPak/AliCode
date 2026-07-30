import type { SkillContent } from "../../shared/skills"
export interface SkillLookup {
	getSkillContent(name: string, currentMode?: string): Promise<SkillContent | null>
}
export declare function resolveSkillContentForMode(
	skillsManager: SkillLookup | undefined,
	skillName: string,
	currentMode: string,
): Promise<SkillContent | null>
type SkillContentForFormatting = Pick<SkillContent, "source" | "description" | "instructions">
export declare function buildSkillApprovalMessage(
	skillName: string,
	args: string | undefined,
	skillContent: Pick<SkillContent, "source" | "description">,
): string
export declare function buildSkillResult(
	skillName: string,
	args: string | undefined,
	skillContent: SkillContentForFormatting,
): string
export {}
//# sourceMappingURL=skillInvocation.d.ts.map
