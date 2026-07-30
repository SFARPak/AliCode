"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.getSkillsSection =
	exports.markdownFormattingSection =
	exports.getModesSection =
	exports.getCapabilitiesSection =
	exports.getToolUseGuidelinesSection =
	exports.getSharedToolUseSection =
	exports.addCustomInstructions =
	exports.getObjectiveSection =
	exports.getSystemInfoSection =
	exports.getRulesSection =
		void 0
var rules_1 = require("./rules")
Object.defineProperty(exports, "getRulesSection", {
	enumerable: true,
	get: function () {
		return rules_1.getRulesSection
	},
})
var system_info_1 = require("./system-info")
Object.defineProperty(exports, "getSystemInfoSection", {
	enumerable: true,
	get: function () {
		return system_info_1.getSystemInfoSection
	},
})
var objective_1 = require("./objective")
Object.defineProperty(exports, "getObjectiveSection", {
	enumerable: true,
	get: function () {
		return objective_1.getObjectiveSection
	},
})
var custom_instructions_1 = require("./custom-instructions")
Object.defineProperty(exports, "addCustomInstructions", {
	enumerable: true,
	get: function () {
		return custom_instructions_1.addCustomInstructions
	},
})
var tool_use_1 = require("./tool-use")
Object.defineProperty(exports, "getSharedToolUseSection", {
	enumerable: true,
	get: function () {
		return tool_use_1.getSharedToolUseSection
	},
})
var tool_use_guidelines_1 = require("./tool-use-guidelines")
Object.defineProperty(exports, "getToolUseGuidelinesSection", {
	enumerable: true,
	get: function () {
		return tool_use_guidelines_1.getToolUseGuidelinesSection
	},
})
var capabilities_1 = require("./capabilities")
Object.defineProperty(exports, "getCapabilitiesSection", {
	enumerable: true,
	get: function () {
		return capabilities_1.getCapabilitiesSection
	},
})
var modes_1 = require("./modes")
Object.defineProperty(exports, "getModesSection", {
	enumerable: true,
	get: function () {
		return modes_1.getModesSection
	},
})
var markdown_formatting_1 = require("./markdown-formatting")
Object.defineProperty(exports, "markdownFormattingSection", {
	enumerable: true,
	get: function () {
		return markdown_formatting_1.markdownFormattingSection
	},
})
var skills_1 = require("./skills")
Object.defineProperty(exports, "getSkillsSection", {
	enumerable: true,
	get: function () {
		return skills_1.getSkillsSection
	},
})
