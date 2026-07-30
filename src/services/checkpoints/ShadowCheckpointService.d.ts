import EventEmitter from "events"
import { SimpleGit } from "simple-git"
import { CheckpointDiff, CheckpointResult, CheckpointEventMap } from "./types"
export declare abstract class ShadowCheckpointService extends EventEmitter {
	readonly taskId: string
	readonly checkpointsDir: string
	readonly workspaceDir: string
	protected _checkpoints: string[]
	protected _baseHash?: string
	protected readonly dotGitDir: string
	protected git?: SimpleGit
	protected readonly log: (message: string) => void
	protected shadowGitConfigWorktree?: string
	get baseHash(): string | undefined
	protected set baseHash(value: string | undefined)
	get isInitialized(): boolean
	getCheckpoints(): string[]
	constructor(taskId: string, checkpointsDir: string, workspaceDir: string, log: (message: string) => void)
	initShadowGit(onInit?: () => Promise<void>): Promise<{
		created: boolean
		duration: number
	}>
	protected writeExcludeFile(): Promise<void>
	private stageAll
	private getNestedGitRepository
	private getShadowGitConfigWorktree
	saveCheckpoint(
		message: string,
		options?: {
			allowEmpty?: boolean
			suppressMessage?: boolean
		},
	): Promise<CheckpointResult | undefined>
	restoreCheckpoint(commitHash: string): Promise<void>
	getDiff({ from, to }: { from?: string; to?: string }): Promise<CheckpointDiff[]>
	/**
	 * EventEmitter
	 */
	emit<K extends keyof CheckpointEventMap>(event: K, data: CheckpointEventMap[K]): boolean
	on<K extends keyof CheckpointEventMap>(event: K, listener: (data: CheckpointEventMap[K]) => void): this
	off<K extends keyof CheckpointEventMap>(event: K, listener: (data: CheckpointEventMap[K]) => void): this
	once<K extends keyof CheckpointEventMap>(event: K, listener: (data: CheckpointEventMap[K]) => void): this
	/**
	 * Storage
	 */
	static hashWorkspaceDir(workspaceDir: string): string
	protected static taskRepoDir({ taskId, globalStorageDir }: { taskId: string; globalStorageDir: string }): string
	protected static workspaceRepoDir({
		globalStorageDir,
		workspaceDir,
	}: {
		globalStorageDir: string
		workspaceDir: string
	}): string
	static deleteTask({
		taskId,
		globalStorageDir,
		workspaceDir,
	}: {
		taskId: string
		globalStorageDir: string
		workspaceDir: string
	}): Promise<void>
	static deleteBranch(git: SimpleGit, branchName: string): Promise<boolean>
}
//# sourceMappingURL=ShadowCheckpointService.d.ts.map
