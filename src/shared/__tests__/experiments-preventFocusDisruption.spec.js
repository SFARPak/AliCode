"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const experiments_1 = require("../experiments")
describe("PREVENT_FOCUS_DISRUPTION experiment", () => {
	it("should include PREVENT_FOCUS_DISRUPTION in EXPERIMENT_IDS", () => {
		expect(experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION).toBe("preventFocusDisruption")
	})
	it("should have PREVENT_FOCUS_DISRUPTION in experimentConfigsMap", () => {
		expect(experiments_1.experimentConfigsMap.PREVENT_FOCUS_DISRUPTION).toBeDefined()
		expect(experiments_1.experimentConfigsMap.PREVENT_FOCUS_DISRUPTION.enabled).toBe(false)
	})
	it("should have PREVENT_FOCUS_DISRUPTION in experimentDefault", () => {
		expect(experiments_1.experimentDefault.preventFocusDisruption).toBe(false)
	})
	it("should correctly check if PREVENT_FOCUS_DISRUPTION is enabled", () => {
		// Test when experiment is disabled (default)
		const disabledConfig = { preventFocusDisruption: false }
		expect(
			experiments_1.experiments.isEnabled(disabledConfig, experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION),
		).toBe(false)
		// Test when experiment is enabled
		const enabledConfig = { preventFocusDisruption: true }
		expect(
			experiments_1.experiments.isEnabled(enabledConfig, experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION),
		).toBe(true)
		// Test when experiment is not in config (should use default)
		const emptyConfig = {}
		expect(
			experiments_1.experiments.isEnabled(emptyConfig, experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION),
		).toBe(false)
	})
})
