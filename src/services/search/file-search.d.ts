export type FileResult = {
	path: string
	type: "file" | "folder"
	label?: string
}
export declare function executeRipgrep({
	args,
	workspacePath,
	limit,
}: {
	args: string[]
	workspacePath: string
	limit?: number
}): Promise<FileResult[]>
export declare function executeRipgrepForFiles(
	workspacePath: string,
	limit?: number,
): Promise<
	{
		path: string
		type: "file" | "folder"
		label?: string
	}[]
>
export declare function searchWorkspaceFiles(
	query: string,
	workspacePath: string,
	limit?: number,
): Promise<
	{
		path: string
		type: "file" | "folder"
		label?: string
	}[]
>
//# sourceMappingURL=file-search.d.ts.map
