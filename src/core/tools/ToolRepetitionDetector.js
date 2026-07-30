"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.ToolRepetitionDetector = void 0
const safe_stable_stringify_1 = __importDefault(require("safe-stable-stringify"))
const i18n_1 = require("../../i18n")
/**
 * Class for detecting consecutive identical tool calls
 * to prevent the AI from getting stuck in a loop.
 */
class ToolRepetitionDetector {
	previousToolCallJson = null
	consecutiveIdenticalToolCallCount = 0
	consecutiveIdenticalToolCallLimit
	/**
	 * Creates a new ToolRepetitionDetector
	 * @param limit The maximum number of identical consecutive tool calls allowed
	 */
	constructor(limit = 3) {
		this.consecutiveIdenticalToolCallLimit = limit
	}
	/**
	 * Checks if the current tool call is identical to the previous one
	 * and determines if execution should be allowed
	 *
	 * @param currentToolCallBlock ToolUse object representing the current tool call
	 * @returns Object indicating if execution is allowed and a message to show if not
	 */
	check(currentToolCallBlock) {
		// Serialize the block to a canonical JSON string for comparison
		const currentToolCallJson = this.serializeToolUse(currentToolCallBlock)
		// Compare with previous tool call
		if (this.previousToolCallJson === currentToolCallJson) {
			this.consecutiveIdenticalToolCallCount++
		} else {
			this.consecutiveIdenticalToolCallCount = 0 // Reset to 0 for a new tool
			this.previousToolCallJson = currentToolCallJson
		}
		// Check if limit is reached (0 means unlimited)
		if (
			this.consecutiveIdenticalToolCallLimit > 0 &&
			this.consecutiveIdenticalToolCallCount >= this.consecutiveIdenticalToolCallLimit
		) {
			// Reset counters to allow recovery if user guides the AI past this point
			this.consecutiveIdenticalToolCallCount = 0
			this.previousToolCallJson = null
			// Return result indicating execution should not be allowed
			return {
				allowExecution: false,
				askUser: {
					messageKey: "mistake_limit_reached",
					messageDetail: (0, i18n_1.t)("tools:toolRepetitionLimitReached", {
						toolName: currentToolCallBlock.name,
					}),
				},
			}
		}
		// Execution is allowed
		return { allowExecution: true }
	}
	/**
	 * Serializes a ToolUse object into a canonical JSON string for comparison
	 *
	 * @param toolUse The ToolUse object to serialize
	 * @returns JSON string representation of the tool use with sorted parameter keys
	 */
	serializeToolUse(toolUse) {
		const toolObject = {
			name: toolUse.name,
			params: toolUse.params,
		}
		// Only include nativeArgs if it has content
		if (toolUse.nativeArgs && Object.keys(toolUse.nativeArgs).length > 0) {
			toolObject.nativeArgs = toolUse.nativeArgs
		}
		return (0, safe_stable_stringify_1.default)(toolObject)
	}
}
exports.ToolRepetitionDetector = ToolRepetitionDetector
