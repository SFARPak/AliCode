"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.countTokens = countTokens
const workerpool_1 = __importDefault(require("workerpool"))
const types_1 = require("../workers/types")
const tiktoken_1 = require("./tiktoken")
let pool = undefined
async function countTokens(content, { useWorker = true } = {}) {
	// Lazily create the worker pool if it doesn't exist.
	if (useWorker && typeof pool === "undefined") {
		pool = workerpool_1.default.pool(__dirname + "/workers/countTokens.js", {
			maxWorkers: 1,
			maxQueueSize: 10,
		})
	}
	// If the worker pool doesn't exist or the caller doesn't want to use it
	// then, use the non-worker implementation.
	if (!useWorker || !pool) {
		return (0, tiktoken_1.tiktoken)(content)
	}
	try {
		const data = await pool.exec("countTokens", [content])
		const result = types_1.countTokensResultSchema.parse(data)
		if (!result.success) {
			throw new Error(result.error)
		}
		return result.count
	} catch (error) {
		pool = null
		console.error(error)
		return (0, tiktoken_1.tiktoken)(content)
	}
}
