"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.nativeTools =
	exports.convertOpenAIToolsToAnthropic =
	exports.convertOpenAIToolToAnthropic =
	exports.getMcpServerTools =
		void 0
exports.getNativeTools = getNativeTools
const access_mcp_resource_1 = __importDefault(require("./access_mcp_resource"))
const apply_diff_1 = require("./apply_diff")
const apply_patch_1 = __importDefault(require("./apply_patch"))
const ask_followup_question_1 = __importDefault(require("./ask_followup_question"))
const attempt_completion_1 = __importDefault(require("./attempt_completion"))
const codebase_search_1 = __importDefault(require("./codebase_search"))
const edit_1 = __importDefault(require("./edit"))
const execute_command_1 = __importDefault(require("./execute_command"))
const generate_image_1 = __importDefault(require("./generate_image"))
const list_files_1 = __importDefault(require("./list_files"))
const new_task_1 = __importDefault(require("./new_task"))
const read_command_output_1 = __importDefault(require("./read_command_output"))
const read_file_1 = require("./read_file")
const run_slash_command_1 = __importDefault(require("./run_slash_command"))
const skill_1 = __importDefault(require("./skill"))
const search_replace_1 = __importDefault(require("./search_replace"))
const edit_file_1 = __importDefault(require("./edit_file"))
const search_files_1 = __importDefault(require("./search_files"))
const switch_mode_1 = __importDefault(require("./switch_mode"))
const update_todo_list_1 = __importDefault(require("./update_todo_list"))
const write_to_file_1 = __importDefault(require("./write_to_file"))
var mcp_server_1 = require("./mcp_server")
Object.defineProperty(exports, "getMcpServerTools", {
	enumerable: true,
	get: function () {
		return mcp_server_1.getMcpServerTools
	},
})
var converters_1 = require("./converters")
Object.defineProperty(exports, "convertOpenAIToolToAnthropic", {
	enumerable: true,
	get: function () {
		return converters_1.convertOpenAIToolToAnthropic
	},
})
Object.defineProperty(exports, "convertOpenAIToolsToAnthropic", {
	enumerable: true,
	get: function () {
		return converters_1.convertOpenAIToolsToAnthropic
	},
})
/**
 * Get native tools array, optionally customizing based on settings.
 *
 * @param options - Configuration options for the tools
 * @returns Array of native tool definitions
 */
function getNativeTools(options = {}) {
	const { supportsImages = false } = options
	const readFileOptions = {
		supportsImages,
	}
	return [
		access_mcp_resource_1.default,
		apply_diff_1.apply_diff,
		apply_patch_1.default,
		ask_followup_question_1.default,
		attempt_completion_1.default,
		codebase_search_1.default,
		execute_command_1.default,
		generate_image_1.default,
		list_files_1.default,
		new_task_1.default,
		read_command_output_1.default,
		(0, read_file_1.createReadFileTool)(readFileOptions),
		run_slash_command_1.default,
		skill_1.default,
		search_replace_1.default,
		edit_file_1.default,
		edit_1.default,
		search_files_1.default,
		switch_mode_1.default,
		update_todo_list_1.default,
		write_to_file_1.default,
	]
}
// Backward compatibility: export default tools with line ranges enabled
exports.nativeTools = getNativeTools()
