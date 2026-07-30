import { type SerializedCustomToolDefinition } from "@ali-code/types"
import type { StoredCustomTool } from "./types.js"
export declare function serializeCustomTool({
	name,
	description,
	parameters,
	source,
}: StoredCustomTool): SerializedCustomToolDefinition
export declare function serializeCustomTools(tools: StoredCustomTool[]): SerializedCustomToolDefinition[]
//# sourceMappingURL=serialize.d.ts.map
