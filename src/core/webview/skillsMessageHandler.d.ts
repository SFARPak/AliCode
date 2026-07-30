import type { SkillMetadata, WebviewMessage } from "@ali-code/types"
import type { ClineProvider } from "./ClineProvider"
/**
 * Handles the requestSkills message - returns all skills metadata
 */
export declare function handleRequestSkills(provider: ClineProvider): Promise<SkillMetadata[]>
/**
 * Handles the createSkill message - creates a new skill
 */
export declare function handleCreateSkill(
	provider: ClineProvider,
	message: WebviewMessage,
): Promise<SkillMetadata[] | undefined>
/**
 * Handles the deleteSkill message - deletes a skill
 */
export declare function handleDeleteSkill(
	provider: ClineProvider,
	message: WebviewMessage,
): Promise<SkillMetadata[] | undefined>
/**
 * Handles the moveSkill message - moves a skill to a different mode
 */
export declare function handleMoveSkill(
	provider: ClineProvider,
	message: WebviewMessage,
): Promise<SkillMetadata[] | undefined>
/**
 * Handles the updateSkillModes message - updates the mode associations for a skill
 */
export declare function handleUpdateSkillModes(
	provider: ClineProvider,
	message: WebviewMessage,
): Promise<SkillMetadata[] | undefined>
/**
 * Handles the openSkillFile message - opens a skill file in the editor
 */
export declare function handleOpenSkillFile(provider: ClineProvider, message: WebviewMessage): Promise<void>
//# sourceMappingURL=skillsMessageHandler.d.ts.map
