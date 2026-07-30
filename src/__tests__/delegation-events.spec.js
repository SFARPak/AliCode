"use strict"
// npx vitest run __tests__/delegation-events.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const types_1 = require("@ali-code/types")
describe("delegation event schemas", () => {
	test("rooCodeEventsSchema validates tuples", () => {
		expect(() =>
			types_1.rooCodeEventsSchema.shape[types_1.AliCodeEventName.TaskDelegated].parse(["p", "c"]),
		).not.toThrow()
		expect(() =>
			types_1.rooCodeEventsSchema.shape[types_1.AliCodeEventName.TaskDelegationCompleted].parse(["p", "c", "s"]),
		).not.toThrow()
		expect(() =>
			types_1.rooCodeEventsSchema.shape[types_1.AliCodeEventName.TaskDelegationResumed].parse(["p", "c"]),
		).not.toThrow()
		// invalid shapes
		expect(() => types_1.rooCodeEventsSchema.shape[types_1.AliCodeEventName.TaskDelegated].parse(["p"])).toThrow()
		expect(() =>
			types_1.rooCodeEventsSchema.shape[types_1.AliCodeEventName.TaskDelegationCompleted].parse(["p", "c"]),
		).toThrow()
		expect(() =>
			types_1.rooCodeEventsSchema.shape[types_1.AliCodeEventName.TaskDelegationResumed].parse(["p"]),
		).toThrow()
	})
	test("taskEventSchema discriminated union includes delegation events", () => {
		expect(() =>
			types_1.taskEventSchema.parse({
				eventName: types_1.AliCodeEventName.TaskDelegated,
				payload: ["p", "c"],
				taskId: 1,
			}),
		).not.toThrow()
		expect(() =>
			types_1.taskEventSchema.parse({
				eventName: types_1.AliCodeEventName.TaskDelegationCompleted,
				payload: ["p", "c", "s"],
				taskId: 1,
			}),
		).not.toThrow()
		expect(() =>
			types_1.taskEventSchema.parse({
				eventName: types_1.AliCodeEventName.TaskDelegationResumed,
				payload: ["p", "c"],
				taskId: 1,
			}),
		).not.toThrow()
	})
})
