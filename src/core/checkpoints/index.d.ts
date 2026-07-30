import { Task } from "../task/Task"
import { RepoPerTaskCheckpointService } from "../../services/checkpoints"
export declare function getCheckpointService(
	task: Task,
	{
		interval,
	}?: {
		interval?: number
	},
): Promise<RepoPerTaskCheckpointService | undefined>
export declare function checkpointSave(
	task: Task,
	force?: boolean,
	suppressMessage?: boolean,
): Promise<void | import("../../services/checkpoints/types").CheckpointResult>
export type CheckpointRestoreOptions = {
	ts: number
	commitHash: string
	mode: "preview" | "restore"
	operation?: "delete" | "edit"
}
export declare function checkpointRestore(
	task: Task,
	{ ts, commitHash, mode, operation }: CheckpointRestoreOptions,
): Promise<void>
export type CheckpointDiffOptions = {
	ts?: number
	previousCommitHash?: string
	commitHash: string
	/**
	 * from-init: Compare from the first checkpoint to the selected checkpoint.
	 * checkpoint: Compare the selected checkpoint to the next checkpoint.
	 * to-current: Compare the selected checkpoint to the current workspace.
	 * full: Compare from the first checkpoint to the current workspace.
	 */
	mode: "from-init" | "checkpoint" | "to-current" | "full"
}
export declare function checkpointDiff(
	task: Task,
	{ ts, previousCommitHash, commitHash, mode }: CheckpointDiffOptions,
): Promise<void>
//# sourceMappingURL=index.d.ts.map
