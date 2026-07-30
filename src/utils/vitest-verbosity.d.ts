export declare function resolveVerbosity(
	argv?: string[],
	env?: NodeJS.ProcessEnv,
): {
	silent: boolean
	reporters: string[]
	onConsoleLog: (_log: string, type: string) => false | undefined
}
//# sourceMappingURL=vitest-verbosity.d.ts.map
