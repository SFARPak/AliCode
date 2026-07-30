export type ShellToken =
	| string
	| {
			op: string
	  }
	| {
			command: string
	  }
/**
 * Split a command string into individual sub-commands by
 * chaining operators (&&, ||, ;, |, or &) and newlines.
 *
 * Uses shell-quote to properly handle:
 * - Quoted strings (preserves quotes)
 * - Subshell commands ($(cmd), `cmd`, <(cmd), >(cmd))
 * - PowerShell redirections (2>&1)
 * - Chain operators (&&, ||, ;, |, &)
 * - Newlines as command separators
 */
export declare function parseCommand(command: string): string[]
//# sourceMappingURL=parse-command.d.ts.map
