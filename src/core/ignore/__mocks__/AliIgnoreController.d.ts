export declare const LOCK_TEXT_SYMBOL = "\uD83D\uDD12"
export declare class AliIgnoreController {
	rooIgnoreContent: string | undefined
	constructor(_cwd: string)
	initialize(): Promise<void>
	validateAccess(_filePath: string): boolean
	validateCommand(_command: string): string | undefined
	filterPaths(paths: string[]): string[]
	dispose(): void
	getInstructions(): string | undefined
}
//# sourceMappingURL=AliIgnoreController.d.ts.map
