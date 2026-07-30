import { AliIgnoreController } from "../../core/ignore/AliIgnoreController"
/**
 * Get the current minimum number of lines for a component to be included
 */
export declare function getMinComponentLines(): number
/**
 * Set the minimum number of lines for a component (for testing)
 */
export declare function setMinComponentLines(value: number): void
declare const extensions: string[]
export { extensions }
export declare function parseSourceCodeDefinitionsForFile(
	filePath: string,
	aliIgnoreController?: AliIgnoreController,
): Promise<string | undefined>
//# sourceMappingURL=index.d.ts.map
