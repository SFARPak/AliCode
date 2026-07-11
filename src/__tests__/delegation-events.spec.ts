// npx vitest run __tests__/delegation-events.spec.ts

import { AliCodeEventName, rooCodeEventsSchema, taskEventSchema } from "@roo-code/types"

describe("delegation event schemas", () => {
	test("rooCodeEventsSchema validates tuples", () => {
		expect(() => (rooCodeEventsSchema.shape as any)[AliCodeEventName.TaskDelegated].parse(["p", "c"])).not.toThrow()
		expect(() =>
			(rooCodeEventsSchema.shape as any)[AliCodeEventName.TaskDelegationCompleted].parse(["p", "c", "s"]),
		).not.toThrow()
		expect(() =>
			(rooCodeEventsSchema.shape as any)[AliCodeEventName.TaskDelegationResumed].parse(["p", "c"]),
		).not.toThrow()

		// invalid shapes
		expect(() => (rooCodeEventsSchema.shape as any)[AliCodeEventName.TaskDelegated].parse(["p"])).toThrow()
		expect(() =>
			(rooCodeEventsSchema.shape as any)[AliCodeEventName.TaskDelegationCompleted].parse(["p", "c"]),
		).toThrow()
		expect(() => (rooCodeEventsSchema.shape as any)[AliCodeEventName.TaskDelegationResumed].parse(["p"])).toThrow()
	})

	test("taskEventSchema discriminated union includes delegation events", () => {
		expect(() =>
			taskEventSchema.parse({
				eventName: AliCodeEventName.TaskDelegated,
				payload: ["p", "c"],
				taskId: 1,
			}),
		).not.toThrow()

		expect(() =>
			taskEventSchema.parse({
				eventName: AliCodeEventName.TaskDelegationCompleted,
				payload: ["p", "c", "s"],
				taskId: 1,
			}),
		).not.toThrow()

		expect(() =>
			taskEventSchema.parse({
				eventName: AliCodeEventName.TaskDelegationResumed,
				payload: ["p", "c"],
				taskId: 1,
			}),
		).not.toThrow()
	})
})
