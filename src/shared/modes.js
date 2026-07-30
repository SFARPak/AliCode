"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.defaultPrompts = exports.FileRestrictionError = exports.defaultModeSlug = exports.modes = void 0
exports.getGroupName = getGroupName
exports.getToolsForMode = getToolsForMode
exports.getModeBySlug = getModeBySlug
exports.getModeConfig = getModeConfig
exports.getAllModes = getAllModes
exports.isCustomMode = isCustomMode
exports.findModeBySlug = findModeBySlug
exports.getModeSelection = getModeSelection
exports.getAllModesWithPrompts = getAllModesWithPrompts
exports.getFullModeDetails = getFullModeDetails
exports.getRoleDefinition = getRoleDefinition
exports.getDescription = getDescription
exports.getWhenToUse = getWhenToUse
exports.getCustomInstructions = getCustomInstructions
const types_1 = require("@ali-code/types")
const custom_instructions_1 = require("../core/prompts/sections/custom-instructions")
const tools_1 = require("./tools")
// Helper to extract group name regardless of format
function getGroupName(group) {
	if (typeof group === "string") {
		return group
	}
	return group[0]
}
// Helper to get all tools for a mode
function getToolsForMode(groups) {
	const tools = new Set()
	// Add tools from each group (excluding customTools which are opt-in only)
	groups.forEach((group) => {
		const groupName = getGroupName(group)
		const groupConfig = tools_1.TOOL_GROUPS[groupName]
		groupConfig.tools.forEach((tool) => tools.add(tool))
	})
	// Always add required tools
	tools_1.ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool))
	return Array.from(tools)
}
// Main modes configuration as an ordered array
exports.modes = types_1.DEFAULT_MODES
// Export the default mode slug
exports.defaultModeSlug = exports.modes[0].slug
// Helper functions
function getModeBySlug(slug, customModes) {
	// Check custom modes first
	const customMode = customModes?.find((mode) => mode.slug === slug)
	if (customMode) {
		return customMode
	}
	// Then check built-in modes
	return exports.modes.find((mode) => mode.slug === slug)
}
function getModeConfig(slug, customModes) {
	const mode = getModeBySlug(slug, customModes)
	if (!mode) {
		throw new Error(`No mode found for slug: ${slug}`)
	}
	return mode
}
// Get all available modes, with custom modes overriding built-in modes
function getAllModes(customModes) {
	if (!customModes?.length) {
		return [...exports.modes]
	}
	// Start with built-in modes
	const allModes = [...exports.modes]
	// Process custom modes
	customModes.forEach((customMode) => {
		const index = allModes.findIndex((mode) => mode.slug === customMode.slug)
		if (index !== -1) {
			// Override existing mode
			allModes[index] = customMode
		} else {
			// Add new mode
			allModes.push(customMode)
		}
	})
	return allModes
}
// Check if a mode is custom or an override
function isCustomMode(slug, customModes) {
	return !!customModes?.some((mode) => mode.slug === slug)
}
/**
 * Find a mode by its slug, don't fall back to built-in modes
 */
function findModeBySlug(slug, modes) {
	return modes?.find((mode) => mode.slug === slug)
}
/**
 * Get the mode selection based on the provided mode slug, prompt component, and custom modes.
 * If a custom mode is found, it takes precedence over the built-in modes.
 * If no custom mode is found, the built-in mode is used with partial merging from promptComponent.
 * If neither is found, the default mode is used.
 */
function getModeSelection(mode, promptComponent, customModes) {
	const customMode = findModeBySlug(mode, customModes)
	const builtInMode = findModeBySlug(mode, exports.modes)
	// If we have a custom mode, use it entirely
	if (customMode) {
		return {
			roleDefinition: customMode.roleDefinition || "",
			baseInstructions: customMode.customInstructions || "",
			description: customMode.description || "",
		}
	}
	// Otherwise, use built-in mode as base and merge with promptComponent
	const baseMode = builtInMode || exports.modes[0] // fallback to default mode
	return {
		roleDefinition: promptComponent?.roleDefinition || baseMode.roleDefinition || "",
		baseInstructions: promptComponent?.customInstructions || baseMode.customInstructions || "",
		description: baseMode.description || "",
	}
}
// Custom error class for file restrictions
class FileRestrictionError extends Error {
	constructor(mode, pattern, description, filePath, tool) {
		const toolInfo = tool ? `Tool '${tool}' in mode '${mode}'` : `This mode (${mode})`
		super(
			`${toolInfo} can only edit files matching pattern: ${pattern}${description ? ` (${description})` : ""}. Got: ${filePath}`,
		)
		this.name = "FileRestrictionError"
	}
}
exports.FileRestrictionError = FileRestrictionError
// Create the mode-specific default prompts
exports.defaultPrompts = Object.freeze(
	Object.fromEntries(
		exports.modes.map((mode) => [
			mode.slug,
			{
				roleDefinition: mode.roleDefinition,
				whenToUse: mode.whenToUse,
				customInstructions: mode.customInstructions,
				description: mode.description,
			},
		]),
	),
)
// Helper function to get all modes with their prompt overrides from extension state
async function getAllModesWithPrompts(context) {
	const customModes = (await context.globalState.get("customModes")) || []
	const customModePrompts = (await context.globalState.get("customModePrompts")) || {}
	const allModes = getAllModes(customModes)
	return allModes.map((mode) => ({
		...mode,
		roleDefinition: customModePrompts[mode.slug]?.roleDefinition ?? mode.roleDefinition,
		whenToUse: customModePrompts[mode.slug]?.whenToUse ?? mode.whenToUse,
		customInstructions: customModePrompts[mode.slug]?.customInstructions ?? mode.customInstructions,
		// description is not overridable via customModePrompts, so we keep the original
	}))
}
// Helper function to get complete mode details with all overrides
async function getFullModeDetails(modeSlug, customModes, customModePrompts, options) {
	// First get the base mode config from custom modes or built-in modes
	const baseMode =
		getModeBySlug(modeSlug, customModes) || exports.modes.find((m) => m.slug === modeSlug) || exports.modes[0]
	// Check for any prompt component overrides
	const promptComponent = customModePrompts?.[modeSlug]
	// Get the base custom instructions
	const baseCustomInstructions = promptComponent?.customInstructions || baseMode.customInstructions || ""
	const baseWhenToUse = promptComponent?.whenToUse || baseMode.whenToUse || ""
	const baseDescription = promptComponent?.description || baseMode.description || ""
	// If we have cwd, load and combine all custom instructions
	let fullCustomInstructions = baseCustomInstructions
	if (options?.cwd) {
		fullCustomInstructions = await (0, custom_instructions_1.addCustomInstructions)(
			baseCustomInstructions,
			options.globalCustomInstructions || "",
			options.cwd,
			modeSlug,
			{ language: options.language },
		)
	}
	// Return mode with any overrides applied
	return {
		...baseMode,
		roleDefinition: promptComponent?.roleDefinition || baseMode.roleDefinition,
		whenToUse: baseWhenToUse,
		description: baseDescription,
		customInstructions: fullCustomInstructions,
	}
}
// Helper function to safely get role definition
function getRoleDefinition(modeSlug, customModes) {
	const mode = getModeBySlug(modeSlug, customModes)
	if (!mode) {
		console.warn(`No mode found for slug: ${modeSlug}`)
		return ""
	}
	return mode.roleDefinition
}
// Helper function to safely get description
function getDescription(modeSlug, customModes) {
	const mode = getModeBySlug(modeSlug, customModes)
	if (!mode) {
		console.warn(`No mode found for slug: ${modeSlug}`)
		return ""
	}
	return mode.description ?? ""
}
// Helper function to safely get whenToUse
function getWhenToUse(modeSlug, customModes) {
	const mode = getModeBySlug(modeSlug, customModes)
	if (!mode) {
		console.warn(`No mode found for slug: ${modeSlug}`)
		return ""
	}
	return mode.whenToUse ?? ""
}
// Helper function to safely get custom instructions
function getCustomInstructions(modeSlug, customModes) {
	const mode = getModeBySlug(modeSlug, customModes)
	if (!mode) {
		console.warn(`No mode found for slug: ${modeSlug}`)
		return ""
	}
	return mode.customInstructions ?? ""
}
