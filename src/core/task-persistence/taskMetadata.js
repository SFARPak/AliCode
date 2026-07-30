"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.taskMetadata = taskMetadata
const node_cache_1 = __importDefault(require("node-cache"))
const get_folder_size_1 = __importDefault(require("get-folder-size"))
const combineApiRequests_1 = require("../../shared/combineApiRequests")
const combineCommandSequences_1 = require("../../shared/combineCommandSequences")
const getApiMetrics_1 = require("../../shared/getApiMetrics")
const array_1 = require("../../shared/array")
const storage_1 = require("../../utils/storage")
const i18n_1 = require("../../i18n")
const taskSizeCache = new node_cache_1.default({ stdTTL: 30, checkperiod: 5 * 60 })
async function taskMetadata({
	taskId: id,
	rootTaskId,
	parentTaskId,
	taskNumber,
	messages,
	globalStoragePath,
	workspace,
	mode,
	apiConfigName,
	initialStatus,
}) {
	const taskDir = await (0, storage_1.getTaskDirectoryPath)(globalStoragePath, id)
	// Determine message availability upfront
	const hasMessages = messages && messages.length > 0
	// Pre-calculate all values based on availability
	let timestamp
	let tokenUsage
	let taskDirSize
	let taskMessage
	if (!hasMessages) {
		// Handle no messages case
		timestamp = Date.now()
		tokenUsage = {
			totalTokensIn: 0,
			totalTokensOut: 0,
			totalCacheWrites: 0,
			totalCacheReads: 0,
			totalCost: 0,
			contextTokens: 0,
		}
		taskDirSize = 0
	} else {
		// Handle messages case
		taskMessage = messages[0] // First message is always the task say.
		const lastRelevantMessage =
			messages[
				(0, array_1.findLastIndex)(
					messages,
					(m) => !(m.ask === "resume_task" || m.ask === "resume_completed_task"),
				)
			] || taskMessage
		timestamp = lastRelevantMessage.ts
		tokenUsage = (0, getApiMetrics_1.getApiMetrics)(
			(0, combineApiRequests_1.combineApiRequests)(
				(0, combineCommandSequences_1.combineCommandSequences)(messages.slice(1)),
			),
		)
		// Get task directory size
		const cachedSize = taskSizeCache.get(taskDir)
		if (cachedSize === undefined) {
			try {
				taskDirSize = await get_folder_size_1.default.loose(taskDir)
				taskSizeCache.set(taskDir, taskDirSize)
			} catch (error) {
				taskDirSize = 0
			}
		} else {
			taskDirSize = cachedSize
		}
	}
	// Create historyItem once with pre-calculated values.
	// initialStatus is included when provided (e.g., "active" for child tasks)
	// to ensure the status is set from the very first save, avoiding race conditions
	// where attempt_completion might run before a separate status update.
	const historyItem = {
		id,
		rootTaskId,
		parentTaskId,
		number: taskNumber,
		ts: timestamp,
		task: hasMessages
			? taskMessage.text?.trim() || (0, i18n_1.t)("common:tasks.incomplete", { taskNumber })
			: (0, i18n_1.t)("common:tasks.no_messages", { taskNumber }),
		tokensIn: tokenUsage.totalTokensIn,
		tokensOut: tokenUsage.totalTokensOut,
		cacheWrites: tokenUsage.totalCacheWrites,
		cacheReads: tokenUsage.totalCacheReads,
		totalCost: tokenUsage.totalCost,
		size: taskDirSize,
		workspace,
		mode,
		...(typeof apiConfigName === "string" && apiConfigName.length > 0 ? { apiConfigName } : {}),
		...(initialStatus && { status: initialStatus }),
	}
	return { historyItem, tokenUsage }
}
