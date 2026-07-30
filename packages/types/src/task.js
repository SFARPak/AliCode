import { z } from "zod"
import { RooCodeEventName } from "./events.js"
export var TaskStatus
;(function (TaskStatus) {
	TaskStatus["Running"] = "running"
	TaskStatus["Interactive"] = "interactive"
	TaskStatus["Resumable"] = "resumable"
	TaskStatus["Idle"] = "idle"
	TaskStatus["None"] = "none"
})(TaskStatus || (TaskStatus = {}))
export const taskMetadataSchema = z.object({
	task: z.string().optional(),
	images: z.array(z.string()).optional(),
})
