export declare function getTheme(): Promise<any>
type JsonObject = {
	[key: string]: any
}
export declare function mergeJson(
	first: JsonObject,
	second: JsonObject,
	mergeBehavior?: "merge" | "overwrite",
	mergeKeys?: {
		[key: string]: (a: any, b: any) => boolean
	},
): any
export {}
//# sourceMappingURL=getTheme.d.ts.map
