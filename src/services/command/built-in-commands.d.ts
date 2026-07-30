import { Command } from "./commands"
/**
 * Get all built-in commands as Command objects
 */
export declare function getBuiltInCommands(): Promise<Command[]>
/**
 * Get a specific built-in command by name
 */
export declare function getBuiltInCommand(name: string): Promise<Command | undefined>
/**
 * Get names of all built-in commands
 */
export declare function getBuiltInCommandNames(): Promise<string[]>
//# sourceMappingURL=built-in-commands.d.ts.map
