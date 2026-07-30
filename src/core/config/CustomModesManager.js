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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.CustomModesManager = void 0
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
const fs = __importStar(require("fs/promises"))
const os = __importStar(require("os"))
const yaml = __importStar(require("yaml"))
const strip_bom_1 = __importDefault(require("strip-bom"))
const types_1 = require("@ali-code/types")
const fs_1 = require("../../utils/fs")
const path_1 = require("../../utils/path")
const ali_config_1 = require("../../services/ali-config")
const logging_1 = require("../../utils/logging")
const globalFileNames_1 = require("../../shared/globalFileNames")
const globalContext_1 = require("../../utils/globalContext")
const i18n_1 = require("../../i18n")
const ROOMODES_FILENAME = ".alimodes"
class CustomModesManager {
	context
	onUpdate
	static cacheTTL = 10_000
	disposables = []
	isWriting = false
	writeQueue = []
	cachedModes = null
	cachedAt = 0
	constructor(context, onUpdate) {
		this.context = context
		this.onUpdate = onUpdate
		this.watchCustomModesFiles().catch((error) => {
			console.error("[CustomModesManager] Failed to setup file watchers:", error)
		})
	}
	async queueWrite(operation) {
		this.writeQueue.push(operation)
		if (!this.isWriting) {
			await this.processWriteQueue()
		}
	}
	async processWriteQueue() {
		if (this.isWriting || this.writeQueue.length === 0) {
			return
		}
		this.isWriting = true
		try {
			while (this.writeQueue.length > 0) {
				const operation = this.writeQueue.shift()
				if (operation) {
					await operation()
				}
			}
		} finally {
			this.isWriting = false
		}
	}
	async getWorkspaceRoomodes() {
		const workspaceFolders = vscode.workspace.workspaceFolders
		if (!workspaceFolders || workspaceFolders.length === 0) {
			return undefined
		}
		const workspaceRoot = (0, path_1.getWorkspacePath)()
		const roomodesPath = path.join(workspaceRoot, ROOMODES_FILENAME)
		const exists = await (0, fs_1.fileExistsAtPath)(roomodesPath)
		return exists ? roomodesPath : undefined
	}
	/**
	 * Regex pattern for problematic characters that need to be cleaned from YAML content
	 * Includes:
	 * - \u00A0: Non-breaking space
	 * - \u200B-\u200D: Zero-width spaces and joiners
	 * - \u2010-\u2015, \u2212: Various dash characters
	 * - \u2018-\u2019: Smart single quotes
	 * - \u201C-\u201D: Smart double quotes
	 */
	static PROBLEMATIC_CHARS_REGEX =
		// eslint-disable-next-line no-misleading-character-class
		/[\u00A0\u200B\u200C\u200D\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2018\u2019\u201C\u201D]/g
	/**
	 * Clean invisible and problematic characters from YAML content
	 */
	cleanInvisibleCharacters(content) {
		// Single pass replacement for all problematic characters
		return content.replace(CustomModesManager.PROBLEMATIC_CHARS_REGEX, (match) => {
			switch (match) {
				case "\u00A0": // Non-breaking space
					return " "
				case "\u200B": // Zero-width space
				case "\u200C": // Zero-width non-joiner
				case "\u200D": // Zero-width joiner
					return ""
				case "\u2018": // Left single quotation mark
				case "\u2019": // Right single quotation mark
					return "'"
				case "\u201C": // Left double quotation mark
				case "\u201D": // Right double quotation mark
					return '"'
				default: // Dash characters (U+2010 through U+2015, U+2212)
					return "-"
			}
		})
	}
	/**
	 * Parse YAML content with enhanced error handling and preprocessing
	 */
	parseYamlSafely(content, filePath) {
		// Clean the content
		let cleanedContent = (0, strip_bom_1.default)(content)
		cleanedContent = this.cleanInvisibleCharacters(cleanedContent)
		try {
			const parsed = yaml.parse(cleanedContent)
			// Ensure we never return null or undefined
			return parsed ?? {}
		} catch (yamlError) {
			// For .alimodes files, try JSON as fallback
			if (filePath.endsWith(ROOMODES_FILENAME)) {
				try {
					// Try parsing the original content as JSON (not the cleaned content)
					return JSON.parse(content)
				} catch (jsonError) {
					// JSON also failed, show the original YAML error
					const errorMsg = yamlError instanceof Error ? yamlError.message : String(yamlError)
					console.error(`[CustomModesManager] Failed to parse YAML from ${filePath}:`, errorMsg)
					const lineMatch = errorMsg.match(/at line (\d+)/)
					const line = lineMatch ? lineMatch[1] : "unknown"
					vscode.window.showErrorMessage((0, i18n_1.t)("common:customModes.errors.yamlParseError", { line }))
					// Return empty object to prevent duplicate error handling
					return {}
				}
			}
			// For non-.alimodes files, just log and return empty object
			const errorMsg = yamlError instanceof Error ? yamlError.message : String(yamlError)
			console.error(`[CustomModesManager] Failed to parse YAML from ${filePath}:`, errorMsg)
			return {}
		}
	}
	async loadModesFromFile(filePath) {
		try {
			const content = await fs.readFile(filePath, "utf-8")
			const settings = this.parseYamlSafely(content, filePath)
			// Ensure settings has customModes property
			if (!settings || typeof settings !== "object" || !settings.customModes) {
				return []
			}
			const result = types_1.customModesSettingsSchema.safeParse(settings)
			if (!result.success) {
				console.error(`[CustomModesManager] Schema validation failed for ${filePath}:`, result.error)
				// Show user-friendly error for .alimodes files
				if (filePath.endsWith(ROOMODES_FILENAME)) {
					const issues = result.error.issues
						.map((issue) => `• ${issue.path.join(".")}: ${issue.message}`)
						.join("\n")
					vscode.window.showErrorMessage(
						(0, i18n_1.t)("common:customModes.errors.schemaValidationError", { issues }),
					)
				}
				return []
			}
			// Determine source based on file path
			const isRoomodes = filePath.endsWith(ROOMODES_FILENAME)
			const source = isRoomodes ? "project" : "global"
			// Add source to each mode
			return result.data.customModes.map((mode) => ({ ...mode, source }))
		} catch (error) {
			// Only log if the error wasn't already handled in parseYamlSafely
			if (!error.alreadyHandled) {
				const errorMsg = `Failed to load modes from ${filePath}: ${error instanceof Error ? error.message : String(error)}`
				console.error(`[CustomModesManager] ${errorMsg}`)
			}
			return []
		}
	}
	async mergeCustomModes(projectModes, globalModes) {
		const slugs = new Set()
		const merged = []
		// Add project mode (takes precedence)
		for (const mode of projectModes) {
			if (!slugs.has(mode.slug)) {
				slugs.add(mode.slug)
				merged.push({ ...mode, source: "project" })
			}
		}
		// Add non-duplicate global modes
		for (const mode of globalModes) {
			if (!slugs.has(mode.slug)) {
				slugs.add(mode.slug)
				merged.push({ ...mode, source: "global" })
			}
		}
		return merged
	}
	async getCustomModesFilePath() {
		const settingsDir = await (0, globalContext_1.ensureSettingsDirectoryExists)(this.context)
		const filePath = path.join(settingsDir, globalFileNames_1.GlobalFileNames.customModes)
		const fileExists = await (0, fs_1.fileExistsAtPath)(filePath)
		if (!fileExists) {
			await this.queueWrite(() => fs.writeFile(filePath, yaml.stringify({ customModes: [] }, { lineWidth: 0 })))
		}
		return filePath
	}
	async watchCustomModesFiles() {
		// Skip if test environment is detected
		if (process.env.NODE_ENV === "test") {
			return
		}
		const settingsPath = await this.getCustomModesFilePath()
		// Watch settings file
		const settingsWatcher = vscode.workspace.createFileSystemWatcher(settingsPath)
		const handleSettingsChange = async () => {
			try {
				// Ensure that the settings file exists (especially important for delete events)
				await this.getCustomModesFilePath()
				const content = await fs.readFile(settingsPath, "utf-8")
				const errorMessage = (0, i18n_1.t)("common:customModes.errors.invalidFormat")
				let config
				try {
					config = this.parseYamlSafely(content, settingsPath)
				} catch (error) {
					console.error(error)
					vscode.window.showErrorMessage(errorMessage)
					return
				}
				const result = types_1.customModesSettingsSchema.safeParse(config)
				if (!result.success) {
					vscode.window.showErrorMessage(errorMessage)
					return
				}
				// Get modes from .alimodes if it exists (takes precedence)
				const roomodesPath = await this.getWorkspaceRoomodes()
				const roomodesModes = roomodesPath ? await this.loadModesFromFile(roomodesPath) : []
				// Merge modes from both sources (.alimodes takes precedence)
				const mergedModes = await this.mergeCustomModes(roomodesModes, result.data.customModes)
				await this.context.globalState.update("customModes", mergedModes)
				this.clearCache()
				await this.onUpdate()
			} catch (error) {
				console.error(`[CustomModesManager] Error handling settings file change:`, error)
			}
		}
		this.disposables.push(settingsWatcher.onDidChange(handleSettingsChange))
		this.disposables.push(settingsWatcher.onDidCreate(handleSettingsChange))
		this.disposables.push(settingsWatcher.onDidDelete(handleSettingsChange))
		this.disposables.push(settingsWatcher)
		// Watch .alimodes file - watch the path even if it doesn't exist yet
		const workspaceFolders = vscode.workspace.workspaceFolders
		if (workspaceFolders && workspaceFolders.length > 0) {
			const workspaceRoot = (0, path_1.getWorkspacePath)()
			const roomodesPath = path.join(workspaceRoot, ROOMODES_FILENAME)
			const roomodesWatcher = vscode.workspace.createFileSystemWatcher(roomodesPath)
			const handleRoomodesChange = async () => {
				try {
					const settingsModes = await this.loadModesFromFile(settingsPath)
					const roomodesModes = await this.loadModesFromFile(roomodesPath)
					// .alimodes takes precedence
					const mergedModes = await this.mergeCustomModes(roomodesModes, settingsModes)
					await this.context.globalState.update("customModes", mergedModes)
					this.clearCache()
					await this.onUpdate()
				} catch (error) {
					console.error(`[CustomModesManager] Error handling .alimodes file change:`, error)
				}
			}
			this.disposables.push(roomodesWatcher.onDidChange(handleRoomodesChange))
			this.disposables.push(roomodesWatcher.onDidCreate(handleRoomodesChange))
			this.disposables.push(
				roomodesWatcher.onDidDelete(async () => {
					// When .alimodes is deleted, refresh with only settings modes
					try {
						const settingsModes = await this.loadModesFromFile(settingsPath)
						await this.context.globalState.update("customModes", settingsModes)
						this.clearCache()
						await this.onUpdate()
					} catch (error) {
						console.error(`[CustomModesManager] Error handling .alimodes file deletion:`, error)
					}
				}),
			)
			this.disposables.push(roomodesWatcher)
		}
	}
	async getCustomModes() {
		// Check if we have a valid cached result.
		const now = Date.now()
		if (this.cachedModes && now - this.cachedAt < CustomModesManager.cacheTTL) {
			return this.cachedModes
		}
		// Get modes from settings file.
		const settingsPath = await this.getCustomModesFilePath()
		const settingsModes = await this.loadModesFromFile(settingsPath)
		// Get modes from .alimodes if it exists.
		const roomodesPath = await this.getWorkspaceRoomodes()
		const roomodesModes = roomodesPath ? await this.loadModesFromFile(roomodesPath) : []
		// Create maps to store modes by source.
		const projectModes = new Map()
		const globalModes = new Map()
		// Add project modes (they take precedence).
		for (const mode of roomodesModes) {
			projectModes.set(mode.slug, { ...mode, source: "project" })
		}
		// Add global modes.
		for (const mode of settingsModes) {
			if (!projectModes.has(mode.slug)) {
				globalModes.set(mode.slug, { ...mode, source: "global" })
			}
		}
		// Combine modes in the correct order: project modes first, then global modes.
		const mergedModes = [
			...roomodesModes.map((mode) => ({ ...mode, source: "project" })),
			...settingsModes
				.filter((mode) => !projectModes.has(mode.slug))
				.map((mode) => ({ ...mode, source: "global" })),
		]
		await this.context.globalState.update("customModes", mergedModes)
		this.cachedModes = mergedModes
		this.cachedAt = now
		return mergedModes
	}
	async updateCustomMode(slug, config) {
		try {
			// Validate the mode configuration before saving
			const validationResult = types_1.modeConfigSchema.safeParse(config)
			if (!validationResult.success) {
				const errorMessages = validationResult.error.errors
					.map((err) => `${err.path.join(".")}: ${err.message}`)
					.join(", ")
				const errorMessage = `Invalid mode configuration: ${errorMessages}`
				logging_1.logger.error("Mode validation failed", { slug, errors: validationResult.error.errors })
				vscode.window.showErrorMessage(
					(0, i18n_1.t)("common:customModes.errors.updateFailed", { error: errorMessage }),
				)
				throw new Error(errorMessage)
			}
			const isProjectMode = config.source === "project"
			let targetPath
			if (isProjectMode) {
				const workspaceFolders = vscode.workspace.workspaceFolders
				if (!workspaceFolders || workspaceFolders.length === 0) {
					logging_1.logger.error("Failed to update project mode: No workspace folder found", { slug })
					throw new Error((0, i18n_1.t)("common:customModes.errors.noWorkspaceForProject"))
				}
				const workspaceRoot = (0, path_1.getWorkspacePath)()
				targetPath = path.join(workspaceRoot, ROOMODES_FILENAME)
				const exists = await (0, fs_1.fileExistsAtPath)(targetPath)
				logging_1.logger.info(`${exists ? "Updating" : "Creating"} project mode in ${ROOMODES_FILENAME}`, {
					slug,
					workspace: workspaceRoot,
				})
			} else {
				targetPath = await this.getCustomModesFilePath()
			}
			await this.queueWrite(async () => {
				// Ensure source is set correctly based on target file.
				const modeWithSource = {
					...config,
					source: isProjectMode ? "project" : "global",
				}
				await this.updateModesInFile(targetPath, (modes) => {
					const updatedModes = modes.filter((m) => m.slug !== slug)
					updatedModes.push(modeWithSource)
					return updatedModes
				})
				this.clearCache()
				await this.refreshMergedState()
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			logging_1.logger.error("Failed to update custom mode", { slug, error: errorMessage })
			vscode.window.showErrorMessage(
				(0, i18n_1.t)("common:customModes.errors.updateFailed", { error: errorMessage }),
			)
			throw error
		}
	}
	async updateModesInFile(filePath, operation) {
		let content = "{}"
		try {
			content = await fs.readFile(filePath, "utf-8")
		} catch (error) {
			// File might not exist yet.
			content = yaml.stringify({ customModes: [] }, { lineWidth: 0 })
		}
		let settings
		try {
			settings = this.parseYamlSafely(content, filePath)
		} catch (error) {
			// Error already logged in parseYamlSafely
			settings = { customModes: [] }
		}
		// Ensure settings is an object and has customModes property
		if (!settings || typeof settings !== "object") {
			settings = { customModes: [] }
		}
		if (!settings.customModes) {
			settings.customModes = []
		}
		settings.customModes = operation(settings.customModes)
		await fs.writeFile(filePath, yaml.stringify(settings, { lineWidth: 0 }), "utf-8")
	}
	async refreshMergedState() {
		const settingsPath = await this.getCustomModesFilePath()
		const roomodesPath = await this.getWorkspaceRoomodes()
		const settingsModes = await this.loadModesFromFile(settingsPath)
		const roomodesModes = roomodesPath ? await this.loadModesFromFile(roomodesPath) : []
		const mergedModes = await this.mergeCustomModes(roomodesModes, settingsModes)
		await this.context.globalState.update("customModes", mergedModes)
		this.clearCache()
		await this.onUpdate()
	}
	async deleteCustomMode(slug) {
		try {
			const settingsPath = await this.getCustomModesFilePath()
			const roomodesPath = await this.getWorkspaceRoomodes()
			const settingsModes = await this.loadModesFromFile(settingsPath)
			const roomodesModes = roomodesPath ? await this.loadModesFromFile(roomodesPath) : []
			// Find the mode in either file
			const projectMode = roomodesModes.find((m) => m.slug === slug)
			const globalMode = settingsModes.find((m) => m.slug === slug)
			if (!projectMode && !globalMode) {
				throw new Error((0, i18n_1.t)("common:customModes.errors.modeNotFound"))
			}
			// Determine which mode to use for rules folder path calculation
			const modeToDelete = projectMode || globalMode
			await this.queueWrite(async () => {
				// Delete from project first if it exists there
				if (projectMode && roomodesPath) {
					await this.updateModesInFile(roomodesPath, (modes) => modes.filter((m) => m.slug !== slug))
				}
				// Delete from global settings if it exists there
				if (globalMode) {
					await this.updateModesInFile(settingsPath, (modes) => modes.filter((m) => m.slug !== slug))
				}
				// Delete associated rules folder
				if (modeToDelete) {
					await this.deleteRulesFolder(slug, modeToDelete)
				}
				// Clear cache when modes are deleted
				this.clearCache()
				await this.refreshMergedState()
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			vscode.window.showErrorMessage(
				(0, i18n_1.t)("common:customModes.errors.deleteFailed", { error: errorMessage }),
			)
		}
	}
	/**
	 * Deletes the rules folder for a specific mode
	 * @param slug - The mode slug
	 * @param mode - The mode configuration to determine the scope
	 */
	async deleteRulesFolder(slug, mode) {
		try {
			// Determine the scope based on source (project or global)
			const scope = mode.source || "global"
			// Determine the rules folder path
			let rulesFolderPath
			if (scope === "project") {
				const workspacePath = (0, path_1.getWorkspacePath)()
				if (workspacePath) {
					rulesFolderPath = path.join(workspacePath, ".ali", `rules-${slug}`)
				} else {
					return // No workspace, can't delete project rules
				}
			} else {
				// Global scope - use OS home directory
				const homeDir = os.homedir()
				rulesFolderPath = path.join(homeDir, ".ali", `rules-${slug}`)
			}
			// Check if the rules folder exists and delete it
			const rulesFolderExists = await (0, fs_1.fileExistsAtPath)(rulesFolderPath)
			if (rulesFolderExists) {
				try {
					await fs.rm(rulesFolderPath, { recursive: true, force: true })
					logging_1.logger.info(`Deleted rules folder for mode ${slug}: ${rulesFolderPath}`)
				} catch (error) {
					logging_1.logger.error(`Failed to delete rules folder for mode ${slug}: ${error}`)
					// Notify the user about the failure
					vscode.window.showWarningMessage(
						(0, i18n_1.t)("common:customModes.errors.rulesCleanupFailed", { rulesFolderPath }),
					)
					// Continue even if folder deletion fails
				}
			}
		} catch (error) {
			logging_1.logger.error(`Error deleting rules folder for mode ${slug}`, {
				error: error instanceof Error ? error.message : String(error),
			})
		}
	}
	async resetCustomModes() {
		try {
			const filePath = await this.getCustomModesFilePath()
			await fs.writeFile(filePath, yaml.stringify({ customModes: [] }, { lineWidth: 0 }))
			await this.context.globalState.update("customModes", [])
			this.clearCache()
			await this.onUpdate()
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			vscode.window.showErrorMessage(
				(0, i18n_1.t)("common:customModes.errors.resetFailed", { error: errorMessage }),
			)
		}
	}
	/**
	 * Checks if a mode has associated rules files in the .ali/rules-{slug}/ directory
	 * @param slug - The mode identifier to check
	 * @returns True if the mode has rules files with content, false otherwise
	 */
	async checkRulesDirectoryHasContent(slug) {
		try {
			// First, find the mode to determine its source
			const allModes = await this.getCustomModes()
			const mode = allModes.find((m) => m.slug === slug)
			if (!mode) {
				// If not in custom modes, check if it's in .alimodes (project-specific)
				const workspacePath = (0, path_1.getWorkspacePath)()
				if (!workspacePath) {
					return false
				}
				const roomodesPath = path.join(workspacePath, ROOMODES_FILENAME)
				try {
					const roomodesExists = await (0, fs_1.fileExistsAtPath)(roomodesPath)
					if (roomodesExists) {
						const roomodesContent = await fs.readFile(roomodesPath, "utf-8")
						const roomodesData = yaml.parse(roomodesContent)
						const roomodesModes = roomodesData?.customModes || []
						// Check if this specific mode exists in .alimodes
						const modeInRoomodes = roomodesModes.find((m) => m.slug === slug)
						if (!modeInRoomodes) {
							return false // Mode not found anywhere
						}
					} else {
						return false // No .alimodes file and not in custom modes
					}
				} catch (error) {
					return false // Cannot read .alimodes and not in custom modes
				}
			}
			// Determine the correct rules directory based on mode source
			let modeRulesDir
			const isGlobalMode = mode?.source === "global"
			if (isGlobalMode) {
				// For global modes, check in global .roo directory
				const globalAliDir = (0, ali_config_1.getGlobalAliDirectory)()
				modeRulesDir = path.join(globalAliDir, `rules-${slug}`)
			} else {
				// For project modes, check in workspace .roo directory
				const workspacePath = (0, path_1.getWorkspacePath)()
				if (!workspacePath) {
					return false
				}
				modeRulesDir = path.join(workspacePath, ".ali", `rules-${slug}`)
			}
			try {
				const stats = await fs.stat(modeRulesDir)
				if (!stats.isDirectory()) {
					return false
				}
			} catch (error) {
				return false
			}
			// Check if directory has any content files
			try {
				const entries = await fs.readdir(modeRulesDir, { withFileTypes: true })
				for (const entry of entries) {
					if (entry.isFile()) {
						// Use path.join with modeRulesDir and entry.name for compatibility
						const filePath = path.join(modeRulesDir, entry.name)
						const content = await fs.readFile(filePath, "utf-8")
						if (content.trim()) {
							return true // Found at least one file with content
						}
					}
				}
				return false // No files with content found
			} catch (error) {
				return false
			}
		} catch (error) {
			logging_1.logger.error("Failed to check rules directory for mode", {
				slug,
				error: error instanceof Error ? error.message : String(error),
			})
			return false
		}
	}
	/**
	 * Exports a mode configuration with its associated rules files into a shareable YAML format
	 * @param slug - The mode identifier to export
	 * @param customPrompts - Optional custom prompts to merge into the export
	 * @returns Success status with YAML content or error message
	 */
	async exportModeWithRules(slug, customPrompts) {
		try {
			// Import modes from shared to check built-in modes
			const { modes: builtInModes } = await import("../../shared/modes")
			// Get all current modes
			const allModes = await this.getCustomModes()
			let mode = allModes.find((m) => m.slug === slug)
			// If mode not found in custom modes, check if it's a built-in mode that has been customized
			if (!mode) {
				// Only check workspace-based modes if workspace is available
				const workspacePath = (0, path_1.getWorkspacePath)()
				if (workspacePath) {
					const roomodesPath = path.join(workspacePath, ROOMODES_FILENAME)
					try {
						const roomodesExists = await (0, fs_1.fileExistsAtPath)(roomodesPath)
						if (roomodesExists) {
							const roomodesContent = await fs.readFile(roomodesPath, "utf-8")
							const roomodesData = yaml.parse(roomodesContent)
							const roomodesModes = roomodesData?.customModes || []
							// Find the mode in .alimodes
							mode = roomodesModes.find((m) => m.slug === slug)
						}
					} catch (error) {
						// Continue to check built-in modes
					}
				}
				// If still not found, check if it's a built-in mode
				if (!mode) {
					const builtInMode = builtInModes.find((m) => m.slug === slug)
					if (builtInMode) {
						// Use the built-in mode as the base
						mode = { ...builtInMode }
					} else {
						return { success: false, error: "Mode not found" }
					}
				}
			}
			// Determine the base directory based on mode source
			const isGlobalMode = mode.source === "global"
			let baseDir
			if (isGlobalMode) {
				// For global modes, use the global .roo directory
				baseDir = (0, ali_config_1.getGlobalAliDirectory)()
			} else {
				// For project modes, use the workspace directory
				const workspacePath = (0, path_1.getWorkspacePath)()
				if (!workspacePath) {
					return { success: false, error: "No workspace found" }
				}
				baseDir = workspacePath
			}
			// Check for .ali/rules-{slug}/ directory (or rules-{slug}/ for global)
			const modeRulesDir = isGlobalMode
				? path.join(baseDir, `rules-${slug}`)
				: path.join(baseDir, ".ali", `rules-${slug}`)
			let rulesFiles = []
			try {
				const stats = await fs.stat(modeRulesDir)
				if (stats.isDirectory()) {
					// Extract content specific to this mode by looking for the mode-specific rules
					const entries = await fs.readdir(modeRulesDir, { withFileTypes: true })
					for (const entry of entries) {
						if (entry.isFile()) {
							// Use path.join with modeRulesDir and entry.name for compatibility
							const filePath = path.join(modeRulesDir, entry.name)
							const content = await fs.readFile(filePath, "utf-8")
							if (content.trim()) {
								// Calculate relative path from within the rules directory
								// This excludes the rules-{slug} folder from the path
								const relativePath = path.relative(modeRulesDir, filePath)
								// Normalize path to use forward slashes for cross-platform compatibility
								const normalizedRelativePath = relativePath.replace(/\\/g, "/")
								rulesFiles.push({ relativePath: normalizedRelativePath, content: content.trim() })
							}
						}
					}
				}
			} catch (error) {
				// Directory doesn't exist, which is fine - mode might not have rules
			}
			// Create an export mode with rules files preserved
			const exportMode = {
				...mode,
				// Remove source property for export
				source: "project",
			}
			// Merge custom prompts if provided
			if (customPrompts) {
				if (customPrompts.roleDefinition) exportMode.roleDefinition = customPrompts.roleDefinition
				if (customPrompts.description) exportMode.description = customPrompts.description
				if (customPrompts.whenToUse) exportMode.whenToUse = customPrompts.whenToUse
				if (customPrompts.customInstructions) exportMode.customInstructions = customPrompts.customInstructions
			}
			// Add rules files if any exist
			if (rulesFiles.length > 0) {
				exportMode.rulesFiles = rulesFiles
			}
			// Generate YAML
			const exportData = {
				customModes: [exportMode],
			}
			const yamlContent = yaml.stringify(exportData)
			return { success: true, yaml: yamlContent }
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			logging_1.logger.error("Failed to export mode with rules", { slug, error: errorMessage })
			return { success: false, error: errorMessage }
		}
	}
	/**
	 * Helper method to import rules files for a mode
	 * @param importMode - The mode being imported
	 * @param rulesFiles - The rules files to import
	 * @param source - The import source ("global" or "project")
	 */
	async importRulesFiles(importMode, rulesFiles, source) {
		// Determine base directory and rules folder path based on source
		let baseDir
		let rulesFolderPath
		if (source === "global") {
			baseDir = (0, ali_config_1.getGlobalAliDirectory)()
			rulesFolderPath = path.join(baseDir, `rules-${importMode.slug}`)
		} else {
			const workspacePath = (0, path_1.getWorkspacePath)()
			baseDir = path.join(workspacePath, ".ali")
			rulesFolderPath = path.join(baseDir, `rules-${importMode.slug}`)
		}
		// Always remove the existing rules folder for this mode if it exists
		// This ensures that if the imported mode has no rules, the folder is cleaned up
		try {
			await fs.rm(rulesFolderPath, { recursive: true, force: true })
			logging_1.logger.info(`Removed existing ${source} rules folder for mode ${importMode.slug}`)
		} catch (error) {
			// It's okay if the folder doesn't exist
			logging_1.logger.debug(`No existing ${source} rules folder to remove for mode ${importMode.slug}`)
		}
		// Only proceed with file creation if there are rules files to import
		if (!rulesFiles || !Array.isArray(rulesFiles) || rulesFiles.length === 0) {
			return
		}
		// Import the new rules files with path validation
		for (const ruleFile of rulesFiles) {
			if (ruleFile.relativePath && ruleFile.content) {
				// Validate the relative path to prevent path traversal attacks
				const normalizedRelativePath = path.normalize(ruleFile.relativePath)
				// Ensure the path doesn't contain traversal sequences
				if (normalizedRelativePath.includes("..") || path.isAbsolute(normalizedRelativePath)) {
					logging_1.logger.error(`Invalid file path detected: ${ruleFile.relativePath}`)
					continue // Skip this file but continue with others
				}
				// Check if path starts with a rules-* folder (old export format)
				let cleanedRelativePath = normalizedRelativePath
				const rulesMatch = normalizedRelativePath.match(/^rules-[^\/\\]+[\/\\]/)
				if (rulesMatch) {
					// Strip the entire rules-* folder reference for backwards compatibility
					cleanedRelativePath = normalizedRelativePath.substring(rulesMatch[0].length)
					logging_1.logger.info(`Detected old export format, stripping ${rulesMatch[0]} from path`)
				}
				// Use the rules folder path instead of base directory
				const targetPath = path.join(rulesFolderPath, cleanedRelativePath)
				const normalizedTargetPath = path.normalize(targetPath)
				const expectedBasePath = path.normalize(rulesFolderPath)
				// Ensure the resolved path stays within the rules folder
				if (!normalizedTargetPath.startsWith(expectedBasePath)) {
					logging_1.logger.error(`Path traversal attempt detected: ${ruleFile.relativePath}`)
					continue // Skip this file but continue with others
				}
				// Ensure directory exists
				const targetDir = path.dirname(targetPath)
				await fs.mkdir(targetDir, { recursive: true })
				// Write the file
				await fs.writeFile(targetPath, ruleFile.content, "utf-8")
			}
		}
	}
	/**
	 * Imports modes from YAML content, including their associated rules files
	 * @param yamlContent - The YAML content containing mode configurations
	 * @param source - Target level for import: "global" (all projects) or "project" (current workspace only)
	 * @returns Success status with optional error message
	 */
	async importModeWithRules(yamlContent, source = "project") {
		try {
			// Parse the YAML content with proper type validation
			let importData
			try {
				const parsed = yaml.parse(yamlContent)
				// Validate the structure
				if (!parsed?.customModes || !Array.isArray(parsed.customModes) || parsed.customModes.length === 0) {
					return { success: false, error: "Invalid import format: Expected 'customModes' array in YAML" }
				}
				importData = parsed
			} catch (parseError) {
				return {
					success: false,
					error: `Invalid YAML format: ${parseError instanceof Error ? parseError.message : "Failed to parse YAML"}`,
				}
			}
			// Check workspace availability early if importing at project level
			if (source === "project") {
				const workspacePath = (0, path_1.getWorkspacePath)()
				if (!workspacePath) {
					return { success: false, error: "No workspace found" }
				}
			}
			// Process each mode in the import
			for (const importMode of importData.customModes) {
				const { rulesFiles, ...modeConfig } = importMode
				// Validate the mode configuration
				const validationResult = types_1.modeConfigSchema.safeParse(modeConfig)
				if (!validationResult.success) {
					logging_1.logger.error(`Invalid mode configuration for ${modeConfig.slug}`, {
						errors: validationResult.error.errors,
					})
					return {
						success: false,
						error: `Invalid mode configuration for ${modeConfig.slug}: ${validationResult.error.errors.map((e) => e.message).join(", ")}`,
					}
				}
				// Check for existing mode conflicts
				const existingModes = await this.getCustomModes()
				const existingMode = existingModes.find((m) => m.slug === importMode.slug)
				if (existingMode) {
					logging_1.logger.info(`Overwriting existing mode: ${importMode.slug}`)
				}
				// Import the mode configuration with the specified source
				await this.updateCustomMode(importMode.slug, {
					...modeConfig,
					source: source, // Use the provided source parameter
				})
				// Import rules files (this also handles cleanup of existing rules folders)
				await this.importRulesFiles(importMode, rulesFiles || [], source)
			}
			// Refresh the modes after import
			await this.refreshMergedState()
			// Return the imported mode's slug so the UI can activate it
			return { success: true, slug: importData.customModes[0]?.slug }
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			logging_1.logger.error("Failed to import mode with rules", { error: errorMessage })
			return { success: false, error: errorMessage }
		}
	}
	clearCache() {
		this.cachedModes = null
		this.cachedAt = 0
	}
	dispose() {
		for (const disposable of this.disposables) {
			disposable.dispose()
		}
		this.disposables = []
	}
}
exports.CustomModesManager = CustomModesManager
