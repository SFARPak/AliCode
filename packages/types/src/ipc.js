import { z } from "zod"
import { taskEventSchema } from "./events.js"
import { rooCodeSettingsSchema } from "./global-settings.js"
/**
 * IpcMessageType
 */
export var IpcMessageType
;(function (IpcMessageType) {
	IpcMessageType["Connect"] = "Connect"
	IpcMessageType["Disconnect"] = "Disconnect"
	IpcMessageType["Ack"] = "Ack"
	IpcMessageType["TaskCommand"] = "TaskCommand"
	IpcMessageType["TaskEvent"] = "TaskEvent"
})(IpcMessageType || (IpcMessageType = {}))
/**
 * IpcOrigin
 */
export var IpcOrigin
;(function (IpcOrigin) {
	IpcOrigin["Client"] = "client"
	IpcOrigin["Server"] = "server"
})(IpcOrigin || (IpcOrigin = {}))
/**
 * Ack
 */
export const ackSchema = z.object({
	clientId: z.string(),
	pid: z.number(),
	ppid: z.number(),
})
/**
 * TaskCommandName
 */
export var TaskCommandName
;(function (TaskCommandName) {
	TaskCommandName["StartNewTask"] = "StartNewTask"
	TaskCommandName["CancelTask"] = "CancelTask"
	TaskCommandName["CloseTask"] = "CloseTask"
	TaskCommandName["ResumeTask"] = "ResumeTask"
	TaskCommandName["SendMessage"] = "SendMessage"
	TaskCommandName["GetCommands"] = "GetCommands"
	TaskCommandName["GetModes"] = "GetModes"
	TaskCommandName["GetModels"] = "GetModels"
	TaskCommandName["DeleteQueuedMessage"] = "DeleteQueuedMessage"
})(TaskCommandName || (TaskCommandName = {}))
/**
 * TaskCommand
 */
export const taskCommandSchema = z.discriminatedUnion("commandName", [
	z.object({
		commandName: z.literal(TaskCommandName.StartNewTask),
		data: z.object({
			configuration: rooCodeSettingsSchema,
			text: z.string(),
			images: z.array(z.string()).optional(),
			newTab: z.boolean().optional(),
		}),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CancelTask),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CloseTask),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.ResumeTask),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.SendMessage),
		data: z.object({
			text: z.string().optional(),
			images: z.array(z.string()).optional(),
		}),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetCommands),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetModes),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetModels),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.DeleteQueuedMessage),
		data: z.string(), // messageId
	}),
])
/**
 * IpcMessage
 */
export const ipcMessageSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal(IpcMessageType.Ack),
		origin: z.literal(IpcOrigin.Server),
		data: ackSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskCommand),
		origin: z.literal(IpcOrigin.Client),
		clientId: z.string(),
		data: taskCommandSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskEvent),
		origin: z.literal(IpcOrigin.Server),
		relayClientId: z.string().optional(),
		data: taskEventSchema,
	}),
])
