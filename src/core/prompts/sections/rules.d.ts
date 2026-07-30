import type { SystemPromptSettings } from "../types"
/**
 * Returns the appropriate command chaining operator based on the user's shell.
 * - Unix shells (bash, zsh, etc.): `&&` (run next command only if previous succeeds)
 * - PowerShell: `;` (semicolon for command separation)
 * - cmd.exe: `&&` (conditional execution, same as Unix)
 * @internal Exported for testing purposes
 */
export declare function getCommandChainOperator(): string
export declare function getRulesSection(cwd: string, settings?: SystemPromptSettings): string
//# sourceMappingURL=rules.d.ts.map
