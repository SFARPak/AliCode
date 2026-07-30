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
exports.SYSTEM_PROMPT = void 0
exports.getPromptComponent = getPromptComponent
const vscode = __importStar(require("vscode"))
const modes_1 = require("../../shared/modes")
const language_1 = require("../../shared/language")
const object_1 = require("../../utils/object")
const manager_1 = require("../../services/code-index/manager")
const sections_1 = require("./sections")
// Helper function to get prompt component, filtering out empty objects
function getPromptComponent(customModePrompts, mode) {
	const component = customModePrompts?.[mode]
	// Return undefined if component is empty
	if ((0, object_1.isEmpty)(component)) {
		return undefined
	}
	return component
}
async function generatePrompt(
	context,
	cwd,
	supportsComputerUse,
	mode,
	mcpHub,
	diffStrategy,
	promptComponent,
	customModeConfigs,
	globalCustomInstructions,
	experiments,
	language,
	rooIgnoreInstructions,
	settings,
	todoList,
	modelId,
	skillsManager,
) {
	if (!context) {
		throw new Error("Extension context is required for generating system prompt")
	}
	// Get the full mode config to ensure we have the role definition (used for groups, etc.)
	const modeConfig =
		(0, modes_1.getModeBySlug)(mode, customModeConfigs) ||
		modes_1.modes.find((m) => m.slug === mode) ||
		modes_1.modes[0]
	const { roleDefinition, baseInstructions } = (0, modes_1.getModeSelection)(mode, promptComponent, customModeConfigs)
	// Check if MCP functionality should be included
	const hasMcpGroup = modeConfig.groups.some((groupEntry) => (0, modes_1.getGroupName)(groupEntry) === "mcp")
	const hasMcpServers = mcpHub && mcpHub.getServers().length > 0
	const shouldIncludeMcp = hasMcpGroup && hasMcpServers
	const codeIndexManager = manager_1.CodeIndexManager.getInstance(context, cwd)
	// Tool calling is native-only.
	const effectiveProtocol = "native"
	const [modesSection, skillsSection] = await Promise.all([
		(0, sections_1.getModesSection)(context),
		(0, sections_1.getSkillsSection)(skillsManager, mode),
	])
	// Tools catalog is not included in the system prompt.
	const toolsCatalog = ""
	const basePrompt = `${roleDefinition}

${(0, sections_1.markdownFormattingSection)()}

${(0, sections_1.getSharedToolUseSection)()}${toolsCatalog}

	${(0, sections_1.getToolUseGuidelinesSection)()}

${(0, sections_1.getCapabilitiesSection)(cwd, shouldIncludeMcp ? mcpHub : undefined)}

${modesSection}
${skillsSection ? `\n${skillsSection}` : ""}
${(0, sections_1.getRulesSection)(cwd, settings)}

${(0, sections_1.getSystemInfoSection)(cwd)}

${(0, sections_1.getObjectiveSection)()}

${await (0, sections_1.addCustomInstructions)(baseInstructions, globalCustomInstructions || "", cwd, mode, {
	language: language ?? (0, language_1.formatLanguage)(vscode.env.language),
	rooIgnoreInstructions,
	settings,
})}`
	return basePrompt
}
const SYSTEM_PROMPT = async (
	context,
	cwd,
	supportsComputerUse,
	mcpHub,
	diffStrategy,
	mode = modes_1.defaultModeSlug,
	customModePrompts,
	customModes,
	globalCustomInstructions,
	experiments,
	language,
	rooIgnoreInstructions,
	settings,
	todoList,
	modelId,
	skillsManager,
) => {
	if (!context) {
		throw new Error("Extension context is required for generating system prompt")
	}
	// Check if it's a custom mode
	const promptComponent = getPromptComponent(customModePrompts, mode)
	// Get full mode config from custom modes or fall back to built-in modes
	const currentMode =
		(0, modes_1.getModeBySlug)(mode, customModes) || modes_1.modes.find((m) => m.slug === mode) || modes_1.modes[0]
	return generatePrompt(
		context,
		cwd,
		supportsComputerUse,
		currentMode.slug,
		mcpHub,
		diffStrategy,
		promptComponent,
		customModes,
		globalCustomInstructions,
		experiments,
		language,
		rooIgnoreInstructions,
		settings,
		todoList,
		modelId,
		skillsManager,
	)
}
exports.SYSTEM_PROMPT = SYSTEM_PROMPT
