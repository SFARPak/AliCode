export interface TagMatcherResult {
	matched: boolean
	data: string
}
/**
 * Streaming matcher for lightweight tag-delimited regions.
 *
 * Used to separate content inside `<tag>...</tag>` from surrounding text.
 * This is used for reasoning tags like `<think>...</think>` in provider streams.
 */
export declare class TagMatcher<Result = TagMatcherResult> {
	readonly tagName: string
	readonly transform?: ((chunks: TagMatcherResult) => Result) | undefined
	readonly position: number
	index: number
	chunks: TagMatcherResult[]
	cached: string[]
	matched: boolean
	state: "TEXT" | "TAG_OPEN" | "TAG_CLOSE"
	depth: number
	pointer: number
	constructor(tagName: string, transform?: ((chunks: TagMatcherResult) => Result) | undefined, position?: number)
	private collect
	private pop
	private _update
	final(chunk?: string): Result[]
	update(chunk: string): Result[]
}
//# sourceMappingURL=tag-matcher.d.ts.map
