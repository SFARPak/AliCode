declare global {
	interface String {
		toPosix(): string
	}
}
export declare function arePathsEqual(path1?: string, path2?: string): boolean
export declare function getReadablePath(cwd: string, relPath?: string): string
export declare const toRelativePath: (filePath: string, cwd: string) => string
export declare const getWorkspacePath: (defaultCwdPath?: string) => string
export declare const getWorkspacePathForContext: (contextPath?: string) => string
//# sourceMappingURL=path.d.ts.map
