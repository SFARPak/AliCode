"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const workerpool_1 = __importDefault(require("workerpool"))
const tiktoken_1 = require("../utils/tiktoken")
async function countTokens(content) {
	try {
		const count = await (0, tiktoken_1.tiktoken)(content)
		return { success: true, count }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		}
	}
}
workerpool_1.default.worker({ countTokens })
