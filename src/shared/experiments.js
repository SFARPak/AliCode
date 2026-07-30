"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.experiments = exports.experimentDefault = exports.experimentConfigsMap = exports.EXPERIMENT_IDS = void 0
exports.EXPERIMENT_IDS = {
	PREVENT_FOCUS_DISRUPTION: "preventFocusDisruption",
	IMAGE_GENERATION: "imageGeneration",
	RUN_SLASH_COMMAND: "runSlashCommand",
	CUSTOM_TOOLS: "customTools",
}
exports.experimentConfigsMap = {
	PREVENT_FOCUS_DISRUPTION: { enabled: false },
	IMAGE_GENERATION: { enabled: false },
	RUN_SLASH_COMMAND: { enabled: false },
	CUSTOM_TOOLS: { enabled: false },
}
exports.experimentDefault = Object.fromEntries(
	Object.entries(exports.experimentConfigsMap).map(([_, config]) => [exports.EXPERIMENT_IDS[_], config.enabled]),
)
exports.experiments = {
	get: (id) => exports.experimentConfigsMap[id],
	isEnabled: (experimentsConfig, id) => experimentsConfig[id] ?? exports.experimentDefault[id],
}
