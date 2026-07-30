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
exports.migrateSettings = migrateSettings
const path = __importStar(require("path"))
const fs = __importStar(require("fs/promises"))
const fs_1 = require("./fs")
const globalFileNames_1 = require("../shared/globalFileNames")
const storage_1 = require("./storage")
const yaml = __importStar(require("yaml"))
const deprecatedCustomModesJSONFilename = "custom_modes.json"
/**
 * Migrates old settings files to new file names and removes commands from old defaults
 *
 * TODO: Remove this migration code in September 2025 (6 months after implementation)
 */
async function migrateSettings(context, outputChannel) {
	// First, migrate commands from old defaults (security fix)
	await migrateDefaultCommands(context, outputChannel)
	// Legacy file names that need to be migrated to the new names in GlobalFileNames
	const fileMigrations = [
		// custom_modes.json to custom_modes.yaml is handled separately below
		{ oldName: "cline_custom_modes.json", newName: deprecatedCustomModesJSONFilename },
		{ oldName: "cline_mcp_settings.json", newName: globalFileNames_1.GlobalFileNames.mcpSettings },
	]
	try {
		const settingsDir = await (0, storage_1.getSettingsDirectoryPath)(context.globalStorageUri.fsPath)
		// Check if settings directory exists first
		if (!(await (0, fs_1.fileExistsAtPath)(settingsDir))) {
			outputChannel.appendLine("No settings directory found, no migrations necessary")
			return
		}
		// Process each file migration
		try {
			for (const migration of fileMigrations) {
				const oldPath = path.join(settingsDir, migration.oldName)
				const newPath = path.join(settingsDir, migration.newName)
				// Only migrate if old file exists and new file doesn't exist yet
				// This ensures we don't overwrite any existing new files
				const oldFileExists = await (0, fs_1.fileExistsAtPath)(oldPath)
				const newFileExists = await (0, fs_1.fileExistsAtPath)(newPath)
				if (oldFileExists && !newFileExists) {
					await fs.rename(oldPath, newPath)
					outputChannel.appendLine(`Renamed ${migration.oldName} to ${migration.newName}`)
				} else {
					outputChannel.appendLine(
						`Skipping migration of ${migration.oldName} to ${migration.newName}: ${oldFileExists ? "new file already exists" : "old file not found"}`,
					)
				}
			}
			// Special migration for custom_modes.json to custom_modes.yaml with content transformation
			await migrateCustomModesToYaml(settingsDir, outputChannel)
		} catch (error) {
			outputChannel.appendLine(`Error in file migrations: ${error}`)
		}
	} catch (error) {
		outputChannel.appendLine(`Error migrating settings files: ${error}`)
	}
}
/**
 * Special migration function to convert custom_modes.json to YAML format
 */
async function migrateCustomModesToYaml(settingsDir, outputChannel) {
	const oldJsonPath = path.join(settingsDir, deprecatedCustomModesJSONFilename)
	const newYamlPath = path.join(settingsDir, globalFileNames_1.GlobalFileNames.customModes)
	// Only proceed if JSON exists and YAML doesn't
	const jsonExists = await (0, fs_1.fileExistsAtPath)(oldJsonPath)
	const yamlExists = await (0, fs_1.fileExistsAtPath)(newYamlPath)
	if (!jsonExists) {
		outputChannel.appendLine("No custom_modes.json found, skipping YAML migration")
		return
	}
	if (yamlExists) {
		outputChannel.appendLine("custom_modes.yaml already exists, skipping migration")
		return
	}
	try {
		// Read JSON content
		const jsonContent = await fs.readFile(oldJsonPath, "utf-8")
		try {
			// Parse JSON to object (using the yaml library just to be safe/consistent)
			const customModesData = yaml.parse(jsonContent)
			// Convert to YAML with no line width limit to prevent line breaks
			const yamlContent = yaml.stringify(customModesData, { lineWidth: 0 })
			// Write YAML file
			await fs.writeFile(newYamlPath, yamlContent, "utf-8")
			// Keeping the old JSON file for backward compatibility
			// This allows users to roll back if needed
			outputChannel.appendLine(
				"Successfully migrated custom_modes.json to YAML format (original JSON file preserved for rollback purposes)",
			)
		} catch (parseError) {
			// Handle corrupt JSON file
			outputChannel.appendLine(
				`Error parsing custom_modes.json: ${parseError}. File might be corrupted. Skipping migration.`,
			)
		}
	} catch (fileError) {
		outputChannel.appendLine(`Error reading custom_modes.json: ${fileError}. Skipping migration.`)
	}
}
/**
 * Removes commands from old defaults that could execute arbitrary code
 * This addresses the security vulnerability where npm install/test can run malicious postinstall scripts
 */
async function migrateDefaultCommands(context, outputChannel) {
	try {
		// Check if this migration has already been run
		const migrationKey = "defaultCommandsMigrationCompleted"
		if (context.globalState.get(migrationKey)) {
			outputChannel.appendLine("[Default Commands Migration] Migration already completed, skipping")
			return
		}
		const allowedCommands = context.globalState.get("allowedCommands")
		if (!allowedCommands || !Array.isArray(allowedCommands)) {
			// Mark migration as complete even if no commands to migrate
			await context.globalState.update(migrationKey, true)
			outputChannel.appendLine("No allowed commands found in global state, marking migration as complete")
			return
		}
		// Only migrate the specific commands that were removed from the defaults
		const oldDefaultCommands = ["npm install", "npm test", "tsc"]
		// Filter out old default commands (case-insensitive exact match only)
		const originalLength = allowedCommands.length
		const filteredCommands = allowedCommands.filter((cmd) => {
			const cmdLower = cmd.toLowerCase().trim()
			return !oldDefaultCommands.some((oldDefault) => cmdLower === oldDefault.toLowerCase())
		})
		if (filteredCommands.length < originalLength) {
			const removedCount = originalLength - filteredCommands.length
			await context.globalState.update("allowedCommands", filteredCommands)
			outputChannel.appendLine(
				`[Default Commands Migration] Removed ${removedCount} command(s) from old defaults to prevent arbitrary code execution vulnerability`,
			)
		} else {
			outputChannel.appendLine("[Default Commands Migration] No old default commands found in allowed list")
		}
		// Mark migration as complete
		await context.globalState.update(migrationKey, true)
		outputChannel.appendLine("[Default Commands Migration] Migration marked as complete")
	} catch (error) {
		outputChannel.appendLine(`[Default Commands Migration] Error migrating default commands: ${error}`)
	}
}
