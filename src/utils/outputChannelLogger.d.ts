import * as vscode from "vscode"
export type LogFunction = (...args: unknown[]) => void
/**
 * Creates a logging function that writes to a VSCode output channel
 * Based on the outputChannelLog implementation from src/extension/api.ts
 */
export declare function createOutputChannelLogger(outputChannel: vscode.OutputChannel): LogFunction
/**
 * Creates a logging function that logs to both the output channel and console
 * Following the pattern from src/extension/api.ts
 */
export declare function createDualLogger(outputChannelLog: LogFunction): LogFunction
//# sourceMappingURL=outputChannelLogger.d.ts.map
