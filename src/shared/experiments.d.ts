import type { Keys, ExperimentId, Experiments } from "@ali-code/types"
export declare const EXPERIMENT_IDS: {
	readonly PREVENT_FOCUS_DISRUPTION: "preventFocusDisruption"
	readonly IMAGE_GENERATION: "imageGeneration"
	readonly RUN_SLASH_COMMAND: "runSlashCommand"
	readonly CUSTOM_TOOLS: "customTools"
}
type ExperimentKey = Keys<typeof EXPERIMENT_IDS>
interface ExperimentConfig {
	enabled: boolean
}
export declare const experimentConfigsMap: Record<ExperimentKey, ExperimentConfig>
export declare const experimentDefault: Record<ExperimentId, boolean>
export declare const experiments: {
	readonly get: (id: ExperimentKey) => ExperimentConfig | undefined
	readonly isEnabled: (experimentsConfig: Experiments, id: ExperimentId) => boolean
}
export {}
//# sourceMappingURL=experiments.d.ts.map
