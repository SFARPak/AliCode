"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.ContextProxy = exports.isPassThroughStateKey = void 0
const types_1 = require("@ali-code/types")
const logging_1 = require("../../utils/logging")
const support_prompt_1 = require("../../shared/support-prompt")
const PASS_THROUGH_STATE_KEYS = ["taskHistory"]
const isPassThroughStateKey = (key) => PASS_THROUGH_STATE_KEYS.includes(key)
exports.isPassThroughStateKey = isPassThroughStateKey
const globalSettingsExportSchema = types_1.globalSettingsSchema.omit({
	taskHistory: true,
	listApiConfigMeta: true,
	currentApiConfigName: true,
})
class ContextProxy {
	originalContext
	stateCache
	secretCache
	_isInitialized = false
	constructor(context) {
		this.originalContext = context
		this.stateCache = {}
		this.secretCache = {}
		this._isInitialized = false
	}
	get isInitialized() {
		return this._isInitialized
	}
	async initialize() {
		for (const key of types_1.GLOBAL_STATE_KEYS) {
			try {
				// Revert to original assignment
				this.stateCache[key] = this.originalContext.globalState.get(key)
			} catch (error) {
				logging_1.logger.error(
					`Error loading global ${key}: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
		}
		const promises = [
			...types_1.SECRET_STATE_KEYS.map(async (key) => {
				try {
					this.secretCache[key] = await this.originalContext.secrets.get(key)
				} catch (error) {
					logging_1.logger.error(
						`Error loading secret ${key}: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}),
			...types_1.GLOBAL_SECRET_KEYS.map(async (key) => {
				try {
					this.secretCache[key] = await this.originalContext.secrets.get(key)
				} catch (error) {
					logging_1.logger.error(
						`Error loading global secret ${key}: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}),
		]
		await Promise.all(promises)
		// Migration: Check for old nested image generation settings and migrate them
		await this.migrateImageGenerationSettings()
		// Migration: Sanitize invalid/removed API providers
		await this.migrateInvalidApiProvider()
		// Migration: Move legacy customCondensingPrompt to customSupportPrompts
		await this.migrateLegacyCondensingPrompt()
		// Migration: Clear old default condensing prompt so users get the improved v2 default
		await this.migrateOldDefaultCondensingPrompt()
		this._isInitialized = true
	}
	/**
	 * Migrates the legacy customCondensingPrompt to the new customSupportPrompts structure
	 * and removes the legacy field.
	 *
	 * Note: Only true customizations are migrated. If the legacy prompt equals the default,
	 * we skip the migration to avoid pinning users to an old default if the default changes.
	 */
	async migrateLegacyCondensingPrompt() {
		try {
			const legacyPrompt = this.originalContext.globalState.get("customCondensingPrompt")
			if (legacyPrompt) {
				const currentSupportPrompts = this.originalContext.globalState.get("customSupportPrompts") || {}
				// Only migrate if:
				// 1. The new location doesn't already have a value
				// 2. The legacy prompt is a true customization (not equal to the default)
				// This prevents pinning users to an old default if the default prompt changes.
				const isCustomized = legacyPrompt.trim() !== support_prompt_1.supportPrompt.default.CONDENSE.trim()
				if (!currentSupportPrompts.CONDENSE && isCustomized) {
					logging_1.logger.info("Migrating customized legacy customCondensingPrompt to customSupportPrompts")
					const updatedPrompts = { ...currentSupportPrompts, CONDENSE: legacyPrompt }
					await this.originalContext.globalState.update("customSupportPrompts", updatedPrompts)
					this.stateCache.customSupportPrompts = updatedPrompts
				} else if (!isCustomized) {
					logging_1.logger.info("Skipping migration: legacy customCondensingPrompt equals the default prompt")
				}
				// Always remove the legacy field
				await this.originalContext.globalState.update("customCondensingPrompt", undefined)
				this.stateCache.customCondensingPrompt = undefined
			}
		} catch (error) {
			logging_1.logger.error(
				`Error during customCondensingPrompt migration: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}
	/**
	 * Clears the old v1 default condensing prompt from customSupportPrompts.CONDENSE if present.
	 *
	 * Before PR #10873 "Intelligent Context Condensation v2", the default condensing prompt was
	 * a simpler 6-section format. Users who had this old default saved in their settings would
	 * be stuck with it instead of getting the improved v2 default (which includes analysis tags,
	 * error tracking, all user messages, and better task continuity).
	 *
	 * This migration uses fingerprinting to detect the old v1 default - checking for key
	 * identifying phrases unique to v1 and absence of v2-specific features. This is more
	 * lenient than exact matching and handles whitespace variations.
	 */
	async migrateOldDefaultCondensingPrompt() {
		try {
			const currentSupportPrompts = this.originalContext.globalState.get("customSupportPrompts") || {}
			const savedCondensePrompt = currentSupportPrompts.CONDENSE
			if (savedCondensePrompt && this.isOldV1DefaultCondensePrompt(savedCondensePrompt)) {
				logging_1.logger.info(
					"Clearing old v1 default condensing prompt from customSupportPrompts.CONDENSE - user will now get the improved v2 default",
				)
				// Remove the CONDENSE key from customSupportPrompts
				const { CONDENSE: _, ...remainingPrompts } = currentSupportPrompts
				const updatedPrompts = Object.keys(remainingPrompts).length > 0 ? remainingPrompts : undefined
				await this.originalContext.globalState.update("customSupportPrompts", updatedPrompts)
				this.stateCache.customSupportPrompts = updatedPrompts
			}
		} catch (error) {
			logging_1.logger.error(
				`Error during old default condensing prompt migration: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}
	/**
	 * Detects if a prompt is the old v1 default condensing prompt using fingerprinting.
	 * This is more lenient than exact matching - it checks for key identifying phrases
	 * unique to v1 and absence of v2-specific features.
	 *
	 * V1 characteristics:
	 * - Exactly 6 numbered sections (1-6)
	 * - Contains specific section headers like "Previous Conversation", "Current Work", etc.
	 * - Does NOT contain v2-specific features like "<analysis>", "SYSTEM OPERATION", etc.
	 */
	isOldV1DefaultCondensePrompt(prompt) {
		// Key phrases unique to the v1 default (must ALL be present)
		const v1RequiredPhrases = [
			"Your task is to create a detailed summary of the conversation so far",
			"1. Previous Conversation:",
			"2. Current Work:",
			"3. Key Technical Concepts:",
			"4. Relevant Files and Code:",
			"5. Problem Solving:",
			"6. Pending Tasks and Next Steps:",
			"Output only the summary of the conversation so far",
		]
		// V2-specific features (if ANY are present, this is NOT v1 default)
		const v2Features = [
			"<analysis>",
			"SYSTEM OPERATION",
			"Errors and fixes",
			"All user messages",
			"7.", // v2 has more than 6 sections
			"8.",
			"9.",
		]
		// Check that all v1 required phrases are present
		const hasAllV1Phrases = v1RequiredPhrases.every((phrase) => prompt.toLowerCase().includes(phrase.toLowerCase()))
		// Check that no v2 features are present
		const hasNoV2Features = v2Features.every((feature) => !prompt.toLowerCase().includes(feature.toLowerCase()))
		return hasAllV1Phrases && hasNoV2Features
	}
	/**
	 * Migrates unknown apiProvider values by clearing them from storage.
	 * Retired providers are preserved so users can keep historical configuration.
	 */
	async migrateInvalidApiProvider() {
		try {
			const apiProvider = this.stateCache.apiProvider
			const isKnownProvider =
				typeof apiProvider === "string" &&
				((0, types_1.isProviderName)(apiProvider) || (0, types_1.isRetiredProvider)(apiProvider))
			if (apiProvider !== undefined && !isKnownProvider) {
				logging_1.logger.info(`[ContextProxy] Found invalid provider "${apiProvider}" in storage - clearing it`)
				// Clear the invalid provider from both cache and storage
				this.stateCache.apiProvider = undefined
				await this.originalContext.globalState.update("apiProvider", undefined)
			}
		} catch (error) {
			logging_1.logger.error(
				`Error during invalid API provider migration: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}
	/**
	 * Migrates old nested openRouterImageGenerationSettings to the new flattened structure
	 */
	async migrateImageGenerationSettings() {
		try {
			// Check if there's an old nested structure
			const oldNestedSettings = this.originalContext.globalState.get("openRouterImageGenerationSettings")
			if (oldNestedSettings && typeof oldNestedSettings === "object") {
				logging_1.logger.info("Migrating old nested image generation settings to flattened structure")
				// Migrate the API key if it exists and we don't already have one
				if (oldNestedSettings.openRouterApiKey && !this.secretCache.openRouterImageApiKey) {
					await this.originalContext.secrets.store(
						"openRouterImageApiKey",
						oldNestedSettings.openRouterApiKey,
					)
					this.secretCache.openRouterImageApiKey = oldNestedSettings.openRouterApiKey
					logging_1.logger.info("Migrated openRouterImageApiKey to secrets")
				}
				// Migrate the selected model if it exists and we don't already have one
				if (oldNestedSettings.selectedModel && !this.stateCache.openRouterImageGenerationSelectedModel) {
					await this.originalContext.globalState.update(
						"openRouterImageGenerationSelectedModel",
						oldNestedSettings.selectedModel,
					)
					this.stateCache.openRouterImageGenerationSelectedModel = oldNestedSettings.selectedModel
					logging_1.logger.info("Migrated openRouterImageGenerationSelectedModel to global state")
				}
				// Clean up the old nested structure
				await this.originalContext.globalState.update("openRouterImageGenerationSettings", undefined)
				logging_1.logger.info("Removed old nested openRouterImageGenerationSettings")
			}
		} catch (error) {
			logging_1.logger.error(
				`Error during image generation settings migration: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}
	get extensionUri() {
		return this.originalContext.extensionUri
	}
	get extensionPath() {
		return this.originalContext.extensionPath
	}
	get globalStorageUri() {
		return this.originalContext.globalStorageUri
	}
	get logUri() {
		return this.originalContext.logUri
	}
	get extension() {
		return this.originalContext.extension
	}
	get extensionMode() {
		return this.originalContext.extensionMode
	}
	getGlobalState(key, defaultValue) {
		if ((0, exports.isPassThroughStateKey)(key)) {
			const value = this.originalContext.globalState.get(key)
			return value === undefined || value === null ? defaultValue : value
		}
		const value = this.stateCache[key]
		return value !== undefined ? value : defaultValue
	}
	updateGlobalState(key, value) {
		if ((0, exports.isPassThroughStateKey)(key)) {
			return this.originalContext.globalState.update(key, value)
		}
		this.stateCache[key] = value
		return this.originalContext.globalState.update(key, value)
	}
	getAllGlobalState() {
		return Object.fromEntries(types_1.GLOBAL_STATE_KEYS.map((key) => [key, this.getGlobalState(key)]))
	}
	/**
	 * ExtensionContext.secrets
	 * https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.secrets
	 */
	getSecret(key) {
		return this.secretCache[key]
	}
	storeSecret(key, value) {
		// Update cache.
		this.secretCache[key] = value
		// Write directly to context.
		return value === undefined
			? this.originalContext.secrets.delete(key)
			: this.originalContext.secrets.store(key, value)
	}
	/**
	 * Refresh secrets from storage and update cache
	 * This is useful when you need to ensure the cache has the latest values
	 */
	async refreshSecrets() {
		const promises = [
			...types_1.SECRET_STATE_KEYS.map(async (key) => {
				try {
					this.secretCache[key] = await this.originalContext.secrets.get(key)
				} catch (error) {
					logging_1.logger.error(
						`Error refreshing secret ${key}: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}),
			...types_1.GLOBAL_SECRET_KEYS.map(async (key) => {
				try {
					this.secretCache[key] = await this.originalContext.secrets.get(key)
				} catch (error) {
					logging_1.logger.error(
						`Error refreshing global secret ${key}: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}),
		]
		await Promise.all(promises)
	}
	getAllSecretState() {
		return Object.fromEntries([
			...types_1.SECRET_STATE_KEYS.map((key) => [key, this.getSecret(key)]),
			...types_1.GLOBAL_SECRET_KEYS.map((key) => [key, this.getSecret(key)]),
		])
	}
	/**
	 * GlobalSettings
	 */
	getGlobalSettings() {
		const values = this.getValues()
		try {
			return types_1.globalSettingsSchema.parse(values)
		} catch (error) {
			return types_1.GLOBAL_SETTINGS_KEYS.reduce((acc, key) => ({ ...acc, [key]: values[key] }), {})
		}
	}
	/**
	 * ProviderSettings
	 */
	getProviderSettings() {
		const values = this.getValues()
		// Sanitize invalid/removed apiProvider values before parsing
		// This handles cases where a user had a provider selected that was later removed
		// from the extension (e.g., "glama"). We sanitize here to avoid repeated
		// schema validation errors that can cause infinite update loops.
		const sanitizedValues = this.sanitizeProviderValues(values)
		try {
			return types_1.providerSettingsSchema.parse(sanitizedValues)
		} catch (error) {
			return types_1.PROVIDER_SETTINGS_KEYS.reduce((acc, key) => ({ ...acc, [key]: sanitizedValues[key] }), {})
		}
	}
	/**
	 * Sanitizes provider values by resetting unknown apiProvider values.
	 * Active and retired providers are preserved.
	 */
	sanitizeProviderValues(values) {
		// Remove legacy Claude Code CLI wrapper keys that may still exist in global state.
		// These keys were used by a removed local CLI runner and are no longer part of ProviderSettings.
		const legacyKeys = ["claudeCodePath", "claudeCodeMaxOutputTokens"]
		let sanitizedValues = values
		for (const key of legacyKeys) {
			if (key in sanitizedValues) {
				const copy = { ...sanitizedValues }
				delete copy[key]
				sanitizedValues = copy
			}
		}
		const isKnownProvider =
			typeof values.apiProvider === "string" &&
			((0, types_1.isProviderName)(values.apiProvider) || (0, types_1.isRetiredProvider)(values.apiProvider))
		if (values.apiProvider !== undefined && !isKnownProvider) {
			logging_1.logger.info(
				`[ContextProxy] Sanitizing invalid provider "${values.apiProvider}" - resetting to undefined`,
			)
			// Return a new values object without the invalid apiProvider
			const { apiProvider, ...restValues } = sanitizedValues
			return restValues
		}
		return sanitizedValues
	}
	async setProviderSettings(values) {
		// Explicitly clear out any old API configuration values before that
		// might not be present in the new configuration.
		// If a value is not present in the new configuration, then it is assumed
		// that the setting's value should be `undefined` and therefore we
		// need to remove it from the state cache if it exists.
		// Ensure openAiHeaders is always an object even when empty
		// This is critical for proper serialization/deserialization through IPC
		if (values.openAiHeaders !== undefined) {
			// Check if it's empty or null
			if (!values.openAiHeaders || Object.keys(values.openAiHeaders).length === 0) {
				values.openAiHeaders = {}
			}
		}
		await this.setValues({
			...types_1.PROVIDER_SETTINGS_KEYS.filter((key) => !(0, types_1.isSecretStateKey)(key))
				.filter((key) => !!this.stateCache[key])
				.reduce((acc, key) => ({ ...acc, [key]: undefined }), {}),
			...values,
		})
	}
	/**
	 * AliCodeSettings
	 */
	async setValue(key, value) {
		return (0, types_1.isSecretStateKey)(key) ? this.storeSecret(key, value) : this.updateGlobalState(key, value)
	}
	getValue(key) {
		return (0, types_1.isSecretStateKey)(key) ? this.getSecret(key) : this.getGlobalState(key)
	}
	getValues() {
		const globalState = this.getAllGlobalState()
		const secretState = this.getAllSecretState()
		// Simply merge all states - no nested secrets to handle
		return { ...globalState, ...secretState }
	}
	async setValues(values) {
		const entries = Object.entries(values)
		await Promise.all(entries.map(([key, value]) => this.setValue(key, value)))
	}
	/**
	 * Import / Export
	 */
	async export() {
		try {
			const globalSettings = globalSettingsExportSchema.parse(this.getValues())
			// Exports should only contain global settings, so this skips project custom modes (those exist in the .roomode folder)
			globalSettings.customModes = globalSettings.customModes?.filter((mode) => mode.source === "global")
			return Object.fromEntries(Object.entries(globalSettings).filter(([_, value]) => value !== undefined))
		} catch (error) {
			return undefined
		}
	}
	/**
	 * Resets all global state, secrets, and in-memory caches.
	 * This clears all data from both the in-memory caches and the VSCode storage.
	 * @returns A promise that resolves when all reset operations are complete
	 */
	async resetAllState() {
		// Clear in-memory caches
		this.stateCache = {}
		this.secretCache = {}
		await Promise.all([
			...types_1.GLOBAL_STATE_KEYS.map((key) => this.originalContext.globalState.update(key, undefined)),
			...types_1.SECRET_STATE_KEYS.map((key) => this.originalContext.secrets.delete(key)),
			...types_1.GLOBAL_SECRET_KEYS.map((key) => this.originalContext.secrets.delete(key)),
		])
		await this.initialize()
	}
	static _instance = null
	static get instance() {
		if (!this._instance) {
			throw new Error("ContextProxy not initialized")
		}
		return this._instance
	}
	static async getInstance(context) {
		if (this._instance) {
			return this._instance
		}
		this._instance = new ContextProxy(context)
		await this._instance.initialize()
		return this._instance
	}
}
exports.ContextProxy = ContextProxy
