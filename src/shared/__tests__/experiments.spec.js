"use strict"
// npx vitest run src/shared/__tests__/experiments.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const experiments_1 = require("../experiments")
describe("experiments", () => {
	describe("PREVENT_FOCUS_DISRUPTION", () => {
		it("is configured correctly", () => {
			expect(experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION).toBe("preventFocusDisruption")
			expect(experiments_1.experimentConfigsMap.PREVENT_FOCUS_DISRUPTION).toMatchObject({
				enabled: false,
			})
		})
	})
	describe("isEnabled", () => {
		it("returns false when experiment is not enabled", () => {
			const experiments = {
				preventFocusDisruption: false,
				imageGeneration: false,
				runSlashCommand: false,
				customTools: false,
			}
			expect(
				experiments_1.experiments.isEnabled(experiments, experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION),
			).toBe(false)
		})
		it("returns true when experiment is enabled", () => {
			const experiments = {
				preventFocusDisruption: true,
				imageGeneration: false,
				runSlashCommand: false,
				customTools: false,
			}
			expect(
				experiments_1.experiments.isEnabled(experiments, experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION),
			).toBe(true)
		})
		it("returns false when experiment is not present", () => {
			const experiments = {
				preventFocusDisruption: false,
				imageGeneration: false,
				runSlashCommand: false,
				customTools: false,
			}
			expect(
				experiments_1.experiments.isEnabled(experiments, experiments_1.EXPERIMENT_IDS.PREVENT_FOCUS_DISRUPTION),
			).toBe(false)
		})
	})
})
