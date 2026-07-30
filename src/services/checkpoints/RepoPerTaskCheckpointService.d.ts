import { CheckpointServiceOptions } from "./types"
import { ShadowCheckpointService } from "./ShadowCheckpointService"
export declare class RepoPerTaskCheckpointService extends ShadowCheckpointService {
	static create({ taskId, workspaceDir, shadowDir, log }: CheckpointServiceOptions): RepoPerTaskCheckpointService
}
//# sourceMappingURL=RepoPerTaskCheckpointService.d.ts.map
