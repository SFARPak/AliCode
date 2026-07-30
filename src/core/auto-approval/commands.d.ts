/**
 * Detect dangerous parameter substitutions that could lead to command execution.
 * These patterns are never auto-approved and always require explicit user approval.
 *
 * Detected patterns:
 * - ${var@P} - Prompt string expansion (interprets escape sequences and executes embedded commands)
 * - ${var@Q} - Quote removal
 * - ${var@E} - Escape sequence expansion
 * - ${var@A} - Assignment statement
 * - ${var@a} - Attribute flags
 * - ${var=value} with escape sequences - Can embed commands via \140 (backtick), \x60, or \u0060
 * - ${!var} - Indirect variable references
 * - <<<$(...) or <<<`...` - Here-strings with command substitution
 * - =(...) - Zsh process substitution that executes commands (array assignments like `var=(...)` are excluded)
 * - *(e:...:) or similar - Zsh glob qualifiers with code execution
 *
 * @param source - The command string to analyze
 * @returns true if dangerous substitution patterns are detected, false otherwise
 */
export declare function containsDangerousSubstitution(source: string): boolean
/**
 * Find the longest matching prefix from a list of prefixes for a given command.
 *
 * This is the core function that implements the "longest prefix match" strategy.
 * It searches through all provided prefixes and returns the longest one that
 * matches the beginning of the command (case-insensitive).
 *
 * **Special Cases:**
 * - Wildcard "*" matches any command but is treated as length 1 for comparison
 * - Empty command or empty prefixes list returns null
 * - Matching is case-insensitive and uses startsWith logic
 *
 * **Examples:**
 * ```typescript
 * findLongestPrefixMatch("git push origin", ["git", "git push"])
 * // Returns "git push" (longer match)
 *
 * findLongestPrefixMatch("npm install", ["*", "npm"])
 * // Returns "npm" (specific match preferred over wildcard)
 *
 * findLongestPrefixMatch("unknown command", ["git", "npm"])
 * // Returns null (no match found)
 * ```
 *
 * @param command - The command to match against
 * @param prefixes - List of prefix patterns to search through
 * @returns The longest matching prefix, or null if no match found
 */
export declare function findLongestPrefixMatch(command: string, prefixes: string[]): string | null
/**
 * Check if a single command should be auto-approved.
 * Returns true only for commands that explicitly match the allowlist
 * and either don't match the denylist or have a longer allowlist match.
 *
 * Special handling for wildcards: "*" in allowlist allows any command,
 * but denylist can still block specific commands.
 */
export declare function isAutoApprovedSingleCommand(
	command: string,
	allowedCommands: string[],
	deniedCommands?: string[],
): boolean
/**
 * Check if a single command should be auto-denied.
 * Returns true only for commands that explicitly match the denylist
 * and either don't match the allowlist or have a longer denylist match.
 */
export declare function isAutoDeniedSingleCommand(
	command: string,
	allowedCommands: string[],
	deniedCommands?: string[],
): boolean
/**
 * Command approval decision types
 */
export type CommandDecision = "auto_approve" | "auto_deny" | "ask_user"
/**
 * Unified command validation that implements the longest prefix match rule.
 * Returns a definitive decision for a command based on allowlist and denylist.
 *
 * This is the main entry point for command validation in the Command Denylist feature.
 * It handles complex command chains and applies the longest prefix match strategy
 * to resolve conflicts between allowlist and denylist patterns.
 *
 * **Decision Logic:**
 * 1. **Dangerous Substitution Protection**: Commands with dangerous parameter expansions are never auto-approved
 * 2. **Command Parsing**: Split command chains (&&, ||, ;, |, &) into individual commands
 * 3. **Individual Validation**: For each sub-command, apply longest prefix match rule
 * 4. **Aggregation**: Combine decisions using "any denial blocks all" principle
 *
 * **Return Values:**
 * - `"auto_approve"`: All sub-commands are explicitly allowed and no dangerous patterns detected
 * - `"auto_deny"`: At least one sub-command is explicitly denied
 * - `"ask_user"`: Mixed or no matches found, requires user decision, or contains dangerous patterns
 *
 * **Examples:**
 * ```typescript
 * // Simple approval
 * getCommandDecision("git status", ["git"], [])
 * // Returns "auto_approve"
 *
 * // Dangerous pattern - never auto-approved
 * getCommandDecision('echo "${var@P}"', ["echo"], [])
 * // Returns "ask_user"
 *
 * // Longest prefix match - denial wins
 * getCommandDecision("git push origin", ["git"], ["git push"])
 * // Returns "auto_deny"
 *
 * // Command chain - any denial blocks all
 * getCommandDecision("git status && rm file", ["git"], ["rm"])
 * // Returns "auto_deny"
 *
 * // No matches - ask user
 * getCommandDecision("unknown command", ["git"], ["rm"])
 * // Returns "ask_user"
 * ```
 *
 * @param command - The full command string to validate
 * @param allowedCommands - List of allowed command prefixes
 * @param deniedCommands - Optional list of denied command prefixes
 * @returns Decision indicating whether to approve, deny, or ask user
 */
export declare function getCommandDecision(
	command: string,
	allowedCommands: string[],
	deniedCommands?: string[],
): CommandDecision
/**
 * Get the decision for a single command using longest prefix match rule.
 *
 * This is the core logic that implements the conflict resolution between
 * allowlist and denylist using the "longest prefix match" strategy.
 *
 * **Longest Prefix Match Algorithm:**
 * 1. Find the longest matching prefix in the allowlist
 * 2. Find the longest matching prefix in the denylist
 * 3. Compare lengths to determine which rule takes precedence
 * 4. Longer (more specific) match wins the conflict
 *
 * **Decision Matrix:**
 * | Allowlist Match | Denylist Match | Result | Reason |
 * |----------------|----------------|---------|---------|
 * | Yes | No | auto_approve | Only allowlist matches |
 * | No | Yes | auto_deny | Only denylist matches |
 * | Yes | Yes (shorter) | auto_approve | Allowlist is more specific |
 * | Yes | Yes (longer/equal) | auto_deny | Denylist is more specific |
 * | No | No | ask_user | No rules apply |
 *
 * **Examples:**
 * ```typescript
 * // Only allowlist matches
 * getSingleCommandDecision("git status", ["git"], ["npm"])
 * // Returns "auto_approve"
 *
 * // Denylist is more specific
 * getSingleCommandDecision("git push origin", ["git"], ["git push"])
 * // Returns "auto_deny" (denylist "git push" > allowlist "git")
 *
 * // Allowlist is more specific
 * getSingleCommandDecision("git push --dry-run", ["git push --dry-run"], ["git push"])
 * // Returns "auto_approve" (allowlist is longer)
 *
 * // No matches
 * getSingleCommandDecision("unknown", ["git"], ["npm"])
 * // Returns "ask_user"
 * ```
 *
 * @param command - Single command to validate (no chaining)
 * @param allowedCommands - List of allowed command prefixes
 * @param deniedCommands - Optional list of denied command prefixes
 * @returns Decision for this specific command
 */
export declare function getSingleCommandDecision(
	command: string,
	allowedCommands: string[],
	deniedCommands?: string[],
): CommandDecision
//# sourceMappingURL=commands.d.ts.map
