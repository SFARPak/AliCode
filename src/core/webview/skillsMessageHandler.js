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
exports.handleRequestSkills = handleRequestSkills
exports.handleCreateSkill = handleCreateSkill
exports.handleDeleteSkill = handleDeleteSkill
exports.handleMoveSkill = handleMoveSkill
exports.handleUpdateSkillModes = handleUpdateSkillModes
exports.handleOpenSkillFile = handleOpenSkillFile
const vscode = __importStar(require("vscode"))
const open_file_1 = require("../../integrations/misc/open-file")
const i18n_1 = require("../../i18n")
/**
 * Handles the requestSkills message - returns all skills metadata
 */
async function handleRequestSkills(provider) {
	try {
		const skillsManager = provider.getSkillsManager()
		if (skillsManager) {
			const skills = skillsManager.getSkillsMetadata()
			await provider.postMessageToWebview({ type: "skills", skills })
			return skills
		} else {
			await provider.postMessageToWebview({ type: "skills", skills: [] })
			return []
		}
	} catch (error) {
		provider.log(`Error fetching skills: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`)
		await provider.postMessageToWebview({ type: "skills", skills: [] })
		return []
	}
}
/**
 * Handles the createSkill message - creates a new skill
 */
async function handleCreateSkill(provider, message) {
	try {
		const skillName = message.skillName
		const source = message.source
		const skillDescription = message.skillDescription
		// Support new modeSlugs array or fall back to legacy skillMode
		const modeSlugs = message.skillModeSlugs ?? (message.skillMode ? [message.skillMode] : undefined)
		if (!skillName || !source || !skillDescription) {
			throw new Error((0, i18n_1.t)("skills:errors.missing_create_fields"))
		}
		const skillsManager = provider.getSkillsManager()
		if (!skillsManager) {
			throw new Error((0, i18n_1.t)("skills:errors.manager_unavailable"))
		}
		const createdPath = await skillsManager.createSkill(skillName, source, skillDescription, modeSlugs)
		// Open the created file in the editor
		;(0, open_file_1.openFile)(createdPath)
		// Send updated skills list
		const skills = skillsManager.getSkillsMetadata()
		await provider.postMessageToWebview({ type: "skills", skills })
		return skills
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		provider.log(`Error creating skill: ${errorMessage}`)
		vscode.window.showErrorMessage(`Failed to create skill: ${errorMessage}`)
		return undefined
	}
}
/**
 * Handles the deleteSkill message - deletes a skill
 */
async function handleDeleteSkill(provider, message) {
	try {
		const skillName = message.skillName
		const source = message.source
		// Support new skillModeSlugs array or fall back to legacy skillMode
		const skillMode = message.skillModeSlugs?.[0] ?? message.skillMode
		if (!skillName || !source) {
			throw new Error((0, i18n_1.t)("skills:errors.missing_delete_fields"))
		}
		const skillsManager = provider.getSkillsManager()
		if (!skillsManager) {
			throw new Error((0, i18n_1.t)("skills:errors.manager_unavailable"))
		}
		await skillsManager.deleteSkill(skillName, source, skillMode)
		// Send updated skills list
		const skills = skillsManager.getSkillsMetadata()
		await provider.postMessageToWebview({ type: "skills", skills })
		return skills
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		provider.log(`Error deleting skill: ${errorMessage}`)
		vscode.window.showErrorMessage(`Failed to delete skill: ${errorMessage}`)
		return undefined
	}
}
/**
 * Handles the moveSkill message - moves a skill to a different mode
 */
async function handleMoveSkill(provider, message) {
	try {
		const skillName = message.skillName
		const source = message.source
		const currentMode = message.skillMode
		const newMode = message.newSkillMode
		if (!skillName || !source) {
			throw new Error((0, i18n_1.t)("skills:errors.missing_move_fields"))
		}
		const skillsManager = provider.getSkillsManager()
		if (!skillsManager) {
			throw new Error((0, i18n_1.t)("skills:errors.manager_unavailable"))
		}
		await skillsManager.moveSkill(skillName, source, currentMode, newMode)
		// Send updated skills list
		const skills = skillsManager.getSkillsMetadata()
		await provider.postMessageToWebview({ type: "skills", skills })
		return skills
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		provider.log(`Error moving skill: ${errorMessage}`)
		vscode.window.showErrorMessage(`Failed to move skill: ${errorMessage}`)
		return undefined
	}
}
/**
 * Handles the updateSkillModes message - updates the mode associations for a skill
 */
async function handleUpdateSkillModes(provider, message) {
	try {
		const skillName = message.skillName
		const source = message.source
		const newModeSlugs = message.newSkillModeSlugs
		if (!skillName || !source) {
			throw new Error((0, i18n_1.t)("skills:errors.missing_update_modes_fields"))
		}
		const skillsManager = provider.getSkillsManager()
		if (!skillsManager) {
			throw new Error((0, i18n_1.t)("skills:errors.manager_unavailable"))
		}
		await skillsManager.updateSkillModes(skillName, source, newModeSlugs)
		// Send updated skills list
		const skills = skillsManager.getSkillsMetadata()
		await provider.postMessageToWebview({ type: "skills", skills })
		return skills
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		provider.log(`Error updating skill modes: ${errorMessage}`)
		vscode.window.showErrorMessage(`Failed to update skill modes: ${errorMessage}`)
		return undefined
	}
}
/**
 * Handles the openSkillFile message - opens a skill file in the editor
 */
async function handleOpenSkillFile(provider, message) {
	try {
		const skillName = message.skillName
		const source = message.source
		if (!skillName || !source) {
			throw new Error((0, i18n_1.t)("skills:errors.missing_delete_fields"))
		}
		const skillsManager = provider.getSkillsManager()
		if (!skillsManager) {
			throw new Error((0, i18n_1.t)("skills:errors.manager_unavailable"))
		}
		// Find skill by name and source (skills may have modeSlugs arrays now)
		const skill = skillsManager.findSkillByNameAndSource(skillName, source)
		if (!skill) {
			throw new Error((0, i18n_1.t)("skills:errors.skill_not_found", { name: skillName }))
		}
		;(0, open_file_1.openFile)(skill.path)
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		provider.log(`Error opening skill file: ${errorMessage}`)
		vscode.window.showErrorMessage(`Failed to open skill file: ${errorMessage}`)
	}
}
