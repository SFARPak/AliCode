"use strict"
// npx vitest run __tests__/single-open-invariant.spec.ts
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
const ClineProvider_1 = require("../core/webview/ClineProvider")
const api_1 = require("../extension/api")
const ProfileValidatorMod = __importStar(require("../shared/ProfileValidator"))
// Mock Task class used by ClineProvider to avoid heavy startup
vitest_1.vi.mock("../core/task/Task", () => {
	class TaskStub {
		taskId
		instanceId = "inst"
		parentTask
		apiConfiguration
		rootTask
		constructor(opts) {
			this.taskId = opts.historyItem?.id ?? `task-${Math.random().toString(36).slice(2, 8)}`
			this.parentTask = opts.parentTask
			this.apiConfiguration = opts.apiConfiguration ?? { apiProvider: "anthropic" }
			opts.onCreated?.(this)
		}
		start() {}
		on() {}
		off() {}
		emit() {}
	}
	return { Task: TaskStub }
})
;(0, vitest_1.describe)("Single-open-task invariant", () => {
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.restoreAllMocks()
	})
	;(0, vitest_1.it)("User-initiated create: closes existing before opening new", async () => {
		// Allow profile
		vitest_1.vi.spyOn(ProfileValidatorMod.ProfileValidator, "isProfileAllowed").mockReturnValue(true)
		const removeClineFromStack = vitest_1.vi.fn().mockResolvedValue(undefined)
		const addClineToStack = vitest_1.vi.fn().mockResolvedValue(undefined)
		const provider = {
			// Simulate an existing task present in stack
			clineStack: [{ taskId: "existing-1" }],
			setValues: vitest_1.vi.fn(),
			getState: vitest_1.vi.fn().mockResolvedValue({
				apiConfiguration: { apiProvider: "anthropic", consecutiveMistakeLimit: 0 },
				organizationAllowList: "*",
				enableCheckpoints: true,
				checkpointTimeout: 60,
				cloudUserInfo: null,
			}),
			removeClineFromStack,
			addClineToStack,
			setProviderProfile: vitest_1.vi.fn(),
			log: vitest_1.vi.fn(),
			getStateToPostToWebview: vitest_1.vi.fn(),
			providerSettingsManager: { getModeConfigId: vitest_1.vi.fn(), listConfig: vitest_1.vi.fn() },
			customModesManager: { getCustomModes: vitest_1.vi.fn().mockResolvedValue([]) },
			taskCreationCallback: vitest_1.vi.fn(),
			contextProxy: {
				extensionUri: {},
				setValue: vitest_1.vi.fn(),
				getValue: vitest_1.vi.fn(),
				setProviderSettings: vitest_1.vi.fn(),
				getProviderSettings: vitest_1.vi.fn(() => ({})),
			},
		}
		await ClineProvider_1.ClineProvider.prototype.createTask.call(provider, "New task")
		;(0, vitest_1.expect)(removeClineFromStack).toHaveBeenCalledTimes(1)
		;(0, vitest_1.expect)(addClineToStack).toHaveBeenCalledTimes(1)
	})
	;(0, vitest_1.it)(
		"History resume path always closes current before rehydration (non-rehydrating case)",
		async () => {
			const removeClineFromStack = vitest_1.vi.fn().mockResolvedValue(undefined)
			const addClineToStack = vitest_1.vi.fn().mockResolvedValue(undefined)
			const updateGlobalState = vitest_1.vi.fn().mockResolvedValue(undefined)
			const provider = {
				getCurrentTask: vitest_1.vi.fn(() => undefined), // ensure not rehydrating
				removeClineFromStack,
				addClineToStack,
				updateGlobalState,
				log: vitest_1.vi.fn(),
				customModesManager: { getCustomModes: vitest_1.vi.fn().mockResolvedValue([]) },
				providerSettingsManager: {
					getModeConfigId: vitest_1.vi.fn().mockResolvedValue(undefined),
					listConfig: vitest_1.vi.fn().mockResolvedValue([]),
				},
				getState: vitest_1.vi.fn().mockResolvedValue({
					apiConfiguration: { apiProvider: "anthropic", consecutiveMistakeLimit: 0 },
					enableCheckpoints: true,
					checkpointTimeout: 60,
					experiments: {},
					cloudUserInfo: null,
					taskSyncEnabled: false,
				}),
				// Methods used by createTaskWithHistoryItem for pending edit cleanup
				getPendingEditOperation: vitest_1.vi.fn().mockReturnValue(undefined),
				clearPendingEditOperation: vitest_1.vi.fn(),
				context: { extension: { packageJSON: {} }, globalStorageUri: { fsPath: "/tmp" } },
				contextProxy: {
					extensionUri: {},
					getValue: vitest_1.vi.fn(),
					setValue: vitest_1.vi.fn(),
					setProviderSettings: vitest_1.vi.fn(),
					getProviderSettings: vitest_1.vi.fn(() => ({})),
				},
				postStateToWebview: vitest_1.vi.fn(),
			}
			const historyItem = {
				id: "hist-1",
				number: 1,
				ts: Date.now(),
				task: "Task",
				tokensIn: 0,
				tokensOut: 0,
				totalCost: 0,
				workspace: "/tmp",
			}
			const task = await ClineProvider_1.ClineProvider.prototype.createTaskWithHistoryItem.call(
				provider,
				historyItem,
			)
			;(0, vitest_1.expect)(task).toBeTruthy()
			;(0, vitest_1.expect)(removeClineFromStack).toHaveBeenCalledTimes(1)
			;(0, vitest_1.expect)(addClineToStack).toHaveBeenCalledTimes(1)
		},
	)
	;(0, vitest_1.it)("IPC StartNewTask path closes current before new task", async () => {
		const removeClineFromStack = vitest_1.vi.fn().mockResolvedValue(undefined)
		const createTask = vitest_1.vi.fn().mockResolvedValue({ taskId: "ipc-1" })
		const provider = {
			context: {},
			removeClineFromStack,
			postStateToWebview: vitest_1.vi.fn(),
			postMessageToWebview: vitest_1.vi.fn(),
			createTask,
			getValues: vitest_1.vi.fn(() => ({})),
			providerSettingsManager: { saveConfig: vitest_1.vi.fn() },
			on: vitest_1.vi.fn((ev, cb) => {
				if (ev === "taskCreated") {
					// no-op for this test
				}
				return provider
			}),
		}
		const output = { appendLine: vitest_1.vi.fn() }
		const api = new api_1.API(output, provider, undefined, false)
		const taskId = await api.startNewTask({
			configuration: {},
			text: "hello",
			images: undefined,
			newTab: false,
		})
		;(0, vitest_1.expect)(taskId).toBe("ipc-1")
		;(0, vitest_1.expect)(removeClineFromStack).toHaveBeenCalledTimes(1)
		;(0, vitest_1.expect)(createTask).toHaveBeenCalled()
	})
})
