import { ToolProgressStatus } from "@ali-code/types"
import { ToolUse, DiffStrategy, DiffResult } from "../../../shared/tools"
export declare class MultiSearchReplaceDiffStrategy implements DiffStrategy {
	private fuzzyThreshold
	private bufferLines
	getName(): string
	constructor(fuzzyThreshold?: number, bufferLines?: number)
	private unescapeMarkers
	private validateMarkerSequencing
	applyDiff(
		originalContent: string,
		diffContent: string,
		_paramStartLine?: number,
		_paramEndLine?: number,
	): Promise<DiffResult>
	getProgressStatus(toolUse: ToolUse, result?: DiffResult): ToolProgressStatus
}
//# sourceMappingURL=multi-search-replace.d.ts.map
