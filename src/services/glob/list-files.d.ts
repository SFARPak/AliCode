/**
 * List files in a directory, with optional recursive traversal
 *
 * @param dirPath - Directory path to list files from
 * @param recursive - Whether to recursively list files in subdirectories
 * @param limit - Maximum number of files to return
 * @returns Tuple of [file paths array, whether the limit was reached]
 */
export declare function listFiles(dirPath: string, recursive: boolean, limit: number): Promise<[string[], boolean]>
//# sourceMappingURL=list-files.d.ts.map
