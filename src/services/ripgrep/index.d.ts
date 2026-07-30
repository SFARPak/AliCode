import { AliIgnoreController } from "../../core/ignore/AliIgnoreController"
/**
 * Truncates a line if it exceeds the maximum length
 * @param line The line to truncate
 * @param maxLength The maximum allowed length (defaults to MAX_LINE_LENGTH)
 * @returns The truncated line, or the original line if it's shorter than maxLength
 */
export declare function truncateLine(line: string, maxLength?: number): string
/**
 * Get the path to the ripgrep binary within the VSCode installation
 */
export declare function getBinPath(vscodeAppRoot: string): Promise<string | undefined>
export declare function regexSearchFiles(
	cwd: string,
	directoryPath: string,
	regex: string,
	filePattern?: string,
	aliIgnoreController?: AliIgnoreController,
): Promise<string>
//# sourceMappingURL=index.d.ts.map
