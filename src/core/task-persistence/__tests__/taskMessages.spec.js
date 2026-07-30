"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const os = __importStar(require("os"))
const path = __importStar(require("path"))
const fs = __importStar(require("fs/promises"))
// Mocks (use hoisted to avoid initialization ordering issues)
const hoisted = vitest_1.vi.hoisted(() => ({
	safeWriteJsonMock: vitest_1.vi.fn().mockResolvedValue(undefined),
}))
vitest_1.vi.mock("../../../utils/safeWriteJson", () => ({
	safeWriteJson: hoisted.safeWriteJsonMock,
}))
// Import after mocks
const taskMessages_1 = require("../taskMessages")
let tmpBaseDir
;(0, vitest_1.beforeEach)(async () => {
	hoisted.safeWriteJsonMock.mockClear()
	// Create a unique, writable temp directory to act as globalStoragePath
	tmpBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), "roo-test-"))
})
;(0, vitest_1.describe)("taskMessages.saveTaskMessages", () => {
	;(0, vitest_1.beforeEach)(() => {
		hoisted.safeWriteJsonMock.mockClear()
	})
	;(0, vitest_1.it)("persists messages as-is", async () => {
		const messages = [
			{
				role: "assistant",
				content: "Hello",
				metadata: {
					other: "keep",
				},
			},
			{ role: "user", content: "Do thing" },
		]
		await (0, taskMessages_1.saveTaskMessages)({
			messages,
			taskId: "task-1",
			globalStoragePath: tmpBaseDir,
		})
		;(0, vitest_1.expect)(hoisted.safeWriteJsonMock).toHaveBeenCalledTimes(1)
		const [, persisted] = hoisted.safeWriteJsonMock.mock.calls[0]
		;(0, vitest_1.expect)(persisted).toEqual(messages)
	})
	;(0, vitest_1.it)("persists messages without modification when no metadata", async () => {
		const messages = [
			{ role: "assistant", content: "Hi" },
			{ role: "user", content: "Yo" },
		]
		await (0, taskMessages_1.saveTaskMessages)({
			messages,
			taskId: "task-2",
			globalStoragePath: tmpBaseDir,
		})
		const [, persisted] = hoisted.safeWriteJsonMock.mock.calls[0]
		;(0, vitest_1.expect)(persisted).toEqual(messages)
	})
})
;(0, vitest_1.describe)("taskMessages.readTaskMessages", () => {
	;(0, vitest_1.it)("returns empty array when file contains invalid JSON", async () => {
		const taskId = "task-corrupt-json"
		// Manually create the task directory and write corrupted JSON
		const taskDir = path.join(tmpBaseDir, "tasks", taskId)
		await fs.mkdir(taskDir, { recursive: true })
		const filePath = path.join(taskDir, "ui_messages.json")
		await fs.writeFile(filePath, "{not valid json!!!", "utf8")
		const result = await (0, taskMessages_1.readTaskMessages)({
			taskId,
			globalStoragePath: tmpBaseDir,
		})
		;(0, vitest_1.expect)(result).toEqual([])
	})
	;(0, vitest_1.it)("returns [] when file contains valid JSON that is not an array", async () => {
		const taskId = "task-non-array-json"
		const taskDir = path.join(tmpBaseDir, "tasks", taskId)
		await fs.mkdir(taskDir, { recursive: true })
		const filePath = path.join(taskDir, "ui_messages.json")
		await fs.writeFile(filePath, JSON.stringify("hello"), "utf8")
		const result = await (0, taskMessages_1.readTaskMessages)({
			taskId,
			globalStoragePath: tmpBaseDir,
		})
		;(0, vitest_1.expect)(result).toEqual([])
	})
})
