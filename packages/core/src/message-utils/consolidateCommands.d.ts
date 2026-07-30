import type { ClineMessage } from "@ali-code/types"
export declare const COMMAND_OUTPUT_STRING = "Output:"
/**
 * Consolidates sequences of command and command_output messages in an array of ClineMessages.
 * Also consolidates sequences of use_mcp_server and mcp_server_response messages.
 *
 * This function processes an array of ClineMessages objects, looking for sequences
 * where a 'command' message is followed by one or more 'command_output' messages,
 * or where a 'use_mcp_server' message is followed by one or more 'mcp_server_response' messages.
 * When such a sequence is found, it consolidates them into a single message, merging
 * their text contents.
 *
 * @param messages - An array of ClineMessage objects to process.
 * @returns A new array of ClineMessage objects with command and MCP sequences consolidated.
 *
 * @example
 * const messages: ClineMessage[] = [
 *   { type: 'ask', ask: 'command', text: 'ls', ts: 1625097600000 },
 *   { type: 'ask', ask: 'command_output', text: 'file1.txt', ts: 1625097601000 },
 *   { type: 'ask', ask: 'command_output', text: 'file2.txt', ts: 1625097602000 }
 * ];
 * const result = consolidateCommands(messages);
 * // Result: [{ type: 'ask', ask: 'command', text: 'ls\nfile1.txt\nfile2.txt', ts: 1625097600000 }]
 */
export declare function consolidateCommands(messages: ClineMessage[]): ClineMessage[]
//# sourceMappingURL=consolidateCommands.d.ts.map
