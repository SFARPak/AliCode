"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.ProviderSettingsManager = exports.providerProfilesSchema = void 0
const zod_1 = require("zod")
const types_1 = require("@ali-code/types")
const modes_1 = require("../../shared/modes")
const api_1 = require("../../api")
const MODEL_MIGRATIONS = {}
exports.providerProfilesSchema = zod_1.z.object({
	currentApiConfigName: zod_1.z.string(),
	apiConfigs: zod_1.z.record(zod_1.z.string(), types_1.providerSettingsWithIdSchema),
	modeApiConfigs: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
	migrations: zod_1.z
		.object({
			rateLimitSecondsMigrated: zod_1.z.boolean().optional(),
			openAiHeadersMigrated: zod_1.z.boolean().optional(),
			consecutiveMistakeLimitMigrated: zod_1.z.boolean().optional(),
			todoListEnabledMigrated: zod_1.z.boolean().optional(),
			claudeCodeLegacySettingsMigrated: zod_1.z.boolean().optional(),
		})
		.optional(),
})
class ProviderSettingsManager {
	static SCOPE_PREFIX = "roo_cline_config_"
	defaultConfigId = this.generateId()
	defaultModeApiConfigs = Object.fromEntries(modes_1.modes.map((mode) => [mode.slug, this.defaultConfigId]))
	defaultProviderProfiles = {
		currentApiConfigName: "default",
		apiConfigs: {
			default: {
				id: this.defaultConfigId,
				apiProvider: "openrouter",
				openRouterModelId: types_1.openRouterDefaultModelId,
			},
		},
		modeApiConfigs: this.defaultModeApiConfigs,
		migrations: {
			rateLimitSecondsMigrated: true, // Mark as migrated on fresh installs
			openAiHeadersMigrated: true, // Mark as migrated on fresh installs
			consecutiveMistakeLimitMigrated: true, // Mark as migrated on fresh installs
			todoListEnabledMigrated: true, // Mark as migrated on fresh installs
			claudeCodeLegacySettingsMigrated: true, // Mark as migrated on fresh installs
		},
	}
	context
	constructor(context) {
		this.context = context
		// TODO: We really shouldn't have async methods in the constructor.
		this.initialize().catch(console.error)
	}
	generateId() {
		return Math.random().toString(36).substring(2, 15)
	}
	// Synchronize readConfig/writeConfig operations to avoid data loss.
	_lock = Promise.resolve()
	lock(cb) {
		const next = this._lock.then(cb)
		this._lock = next.catch(() => {})
		return next
	}
	/**
	 * Initialize config if it doesn't exist and run migrations.
	 */
	async initialize() {
		try {
			return await this.lock(async () => {
				const providerProfiles = await this.load()
				if (!providerProfiles) {
					await this.store(this.defaultProviderProfiles)
					return
				}
				let isDirty = false
				// Migrate existing installs to have per-mode API config map
				if (!providerProfiles.modeApiConfigs) {
					// Use the currently selected config for all modes initially
					const currentName = providerProfiles.currentApiConfigName
					const seedId =
						providerProfiles.apiConfigs[currentName]?.id ??
						Object.values(providerProfiles.apiConfigs)[0]?.id ??
						this.defaultConfigId
					providerProfiles.modeApiConfigs = Object.fromEntries(modes_1.modes.map((m) => [m.slug, seedId]))
					isDirty = true
				}
				// Apply model migrations for all providers
				if (this.applyModelMigrations(providerProfiles)) {
					isDirty = true
				}
				// Ensure all configs have IDs.
				for (const [_name, apiConfig] of Object.entries(providerProfiles.apiConfigs)) {
					if (!apiConfig.id) {
						apiConfig.id = this.generateId()
						isDirty = true
					}
				}
				// Ensure migrations field exists
				if (!providerProfiles.migrations) {
					providerProfiles.migrations = {
						rateLimitSecondsMigrated: false,
						openAiHeadersMigrated: false,
						consecutiveMistakeLimitMigrated: false,
						todoListEnabledMigrated: false,
						claudeCodeLegacySettingsMigrated: false,
					} // Initialize with default values
					isDirty = true
				}
				if (!providerProfiles.migrations.rateLimitSecondsMigrated) {
					await this.migrateRateLimitSeconds(providerProfiles)
					providerProfiles.migrations.rateLimitSecondsMigrated = true
					isDirty = true
				}
				if (!providerProfiles.migrations.openAiHeadersMigrated) {
					await this.migrateOpenAiHeaders(providerProfiles)
					providerProfiles.migrations.openAiHeadersMigrated = true
					isDirty = true
				}
				if (!providerProfiles.migrations.consecutiveMistakeLimitMigrated) {
					await this.migrateConsecutiveMistakeLimit(providerProfiles)
					providerProfiles.migrations.consecutiveMistakeLimitMigrated = true
					isDirty = true
				}
				if (!providerProfiles.migrations.todoListEnabledMigrated) {
					await this.migrateTodoListEnabled(providerProfiles)
					providerProfiles.migrations.todoListEnabledMigrated = true
					isDirty = true
				}
				if (!providerProfiles.migrations.claudeCodeLegacySettingsMigrated) {
					// These keys were used by the removed local Claude Code CLI wrapper.
					for (const apiConfig of Object.values(providerProfiles.apiConfigs)) {
						// Cast to string for comparison since "claude-code" is no longer a valid ProviderName
						if (apiConfig.apiProvider !== "claude-code") continue
						const config = apiConfig
						if ("claudeCodePath" in config) {
							delete config.claudeCodePath
							isDirty = true
						}
						if ("claudeCodeMaxOutputTokens" in config) {
							delete config.claudeCodeMaxOutputTokens
							isDirty = true
						}
					}
					providerProfiles.migrations.claudeCodeLegacySettingsMigrated = true
					isDirty = true
				}
				if (isDirty) {
					await this.store(providerProfiles)
				}
			})
		} catch (error) {
			throw new Error(`Failed to initialize config: ${error}`)
		}
	}
	async migrateRateLimitSeconds(providerProfiles) {
		try {
			let rateLimitSeconds
			try {
				rateLimitSeconds = await this.context.globalState.get("rateLimitSeconds")
			} catch (error) {
				console.error("[MigrateRateLimitSeconds] Error getting global rate limit:", error)
			}
			if (rateLimitSeconds === undefined) {
				// Failed to get the existing value, use the default.
				rateLimitSeconds = 0
			}
			for (const [_name, apiConfig] of Object.entries(providerProfiles.apiConfigs)) {
				if (apiConfig.rateLimitSeconds === undefined) {
					apiConfig.rateLimitSeconds = rateLimitSeconds
				}
			}
		} catch (error) {
			console.error(`[MigrateRateLimitSeconds] Failed to migrate rate limit settings:`, error)
		}
	}
	async migrateOpenAiHeaders(providerProfiles) {
		try {
			for (const [_name, apiConfig] of Object.entries(providerProfiles.apiConfigs)) {
				// Use type assertion to access the deprecated property safely
				const configAny = apiConfig
				// Check if openAiHostHeader exists but openAiHeaders doesn't
				if (
					configAny.openAiHostHeader &&
					(!apiConfig.openAiHeaders || Object.keys(apiConfig.openAiHeaders || {}).length === 0)
				) {
					// Create the headers object with the Host value
					apiConfig.openAiHeaders = { Host: configAny.openAiHostHeader }
					// Delete the old property to prevent re-migration
					// This prevents the header from reappearing after deletion
					configAny.openAiHostHeader = undefined
				}
			}
		} catch (error) {
			console.error(`[MigrateOpenAiHeaders] Failed to migrate OpenAI headers:`, error)
		}
	}
	async migrateConsecutiveMistakeLimit(providerProfiles) {
		try {
			for (const [name, apiConfig] of Object.entries(providerProfiles.apiConfigs)) {
				if (apiConfig.consecutiveMistakeLimit == null) {
					apiConfig.consecutiveMistakeLimit = types_1.DEFAULT_CONSECUTIVE_MISTAKE_LIMIT
				}
			}
		} catch (error) {
			console.error(`[MigrateConsecutiveMistakeLimit] Failed to migrate consecutive mistake limit:`, error)
		}
	}
	async migrateTodoListEnabled(providerProfiles) {
		try {
			for (const [_name, apiConfig] of Object.entries(providerProfiles.apiConfigs)) {
				if (apiConfig.todoListEnabled === undefined) {
					apiConfig.todoListEnabled = true
				}
			}
		} catch (error) {
			console.error(`[MigrateTodoListEnabled] Failed to migrate todo list enabled setting:`, error)
		}
	}
	/**
	 * Apply model migrations for all providers
	 * Returns true if any migrations were applied
	 */
	applyModelMigrations(providerProfiles) {
		let migrated = false
		try {
			for (const [_name, apiConfig] of Object.entries(providerProfiles.apiConfigs)) {
				// Skip configs without provider or model ID
				if (!apiConfig.apiProvider || !apiConfig.apiModelId) {
					continue
				}
				// Check if this provider has migrations (with type safety)
				const provider = apiConfig.apiProvider
				const providerMigrations = MODEL_MIGRATIONS[provider]
				if (!providerMigrations) {
					continue
				}
				// Check if the current model ID needs migration
				const newModelId = providerMigrations[apiConfig.apiModelId]
				if (newModelId && newModelId !== apiConfig.apiModelId) {
					console.log(
						`[ModelMigration] Migrating ${apiConfig.apiProvider} model from ${apiConfig.apiModelId} to ${newModelId}`,
					)
					apiConfig.apiModelId = newModelId
					migrated = true
				}
			}
		} catch (error) {
			console.error(`[ModelMigration] Failed to apply model migrations:`, error)
		}
		return migrated
	}
	/**
	 * Clean model ID by removing prefix before "/"
	 */
	cleanModelId(modelId) {
		if (!modelId) return undefined
		// Check for "/" and take the part after it
		if (modelId.includes("/")) {
			return modelId.split("/").pop()
		}
		return modelId
	}
	/**
	 * List all available configs with metadata.
	 */
	async listConfig() {
		try {
			return await this.lock(async () => {
				const providerProfiles = await this.load()
				return Object.entries(providerProfiles.apiConfigs).map(([name, apiConfig]) => ({
					name,
					id: apiConfig.id || "",
					apiProvider: apiConfig.apiProvider,
					modelId: this.cleanModelId((0, types_1.getModelId)(apiConfig)),
				}))
			})
		} catch (error) {
			throw new Error(`Failed to list configs: ${error}`)
		}
	}
	/**
	 * Save a config with the given name.
	 * Preserves the ID from the input 'config' object if it exists,
	 * otherwise generates a new one (for creation scenarios).
	 */
	async saveConfig(name, config) {
		try {
			return await this.lock(async () => {
				const providerProfiles = await this.load()
				// Preserve the existing ID if this is an update to an existing config.
				const existingId = providerProfiles.apiConfigs[name]?.id
				const id = config.id || existingId || this.generateId()
				// For active providers, filter out settings from other providers.
				// For retired providers, preserve full profile fields (including legacy
				// provider-specific keys) to avoid data loss — passthrough() keeps
				// unknown keys that strict parse() would strip.
				const filteredConfig =
					typeof config.apiProvider === "string" && (0, types_1.isRetiredProvider)(config.apiProvider)
						? types_1.providerSettingsWithIdSchema.passthrough().parse(config)
						: types_1.discriminatedProviderSettingsWithIdSchema.parse(config)
				providerProfiles.apiConfigs[name] = { ...filteredConfig, id }
				await this.store(providerProfiles)
				return id
			})
		} catch (error) {
			throw new Error(`Failed to save config: ${error}`)
		}
	}
	async getProfile(params) {
		try {
			return await this.lock(async () => {
				const providerProfiles = await this.load()
				let name
				let providerSettings
				if ("name" in params) {
					name = params.name
					if (!providerProfiles.apiConfigs[name]) {
						throw new Error(`Config with name '${name}' not found`)
					}
					providerSettings = providerProfiles.apiConfigs[name]
				} else {
					const id = params.id
					const entry = Object.entries(providerProfiles.apiConfigs).find(
						([_, apiConfig]) => apiConfig.id === id,
					)
					if (!entry) {
						throw new Error(`Config with ID '${id}' not found`)
					}
					name = entry[0]
					providerSettings = entry[1]
				}
				return { name, ...providerSettings }
			})
		} catch (error) {
			throw new Error(`Failed to get profile: ${error instanceof Error ? error.message : error}`)
		}
	}
	/**
	 * Activate a profile by name or ID.
	 */
	async activateProfile(params) {
		const { name, ...providerSettings } = await this.getProfile(params)
		try {
			return await this.lock(async () => {
				const providerProfiles = await this.load()
				providerProfiles.currentApiConfigName = name
				await this.store(providerProfiles)
				return { name, ...providerSettings }
			})
		} catch (error) {
			throw new Error(`Failed to activate profile: ${error instanceof Error ? error.message : error}`)
		}
	}
	/**
	 * Delete a config by name.
	 */
	async deleteConfig(name) {
		try {
			return await this.lock(async () => {
				const providerProfiles = await this.load()
				if (!providerProfiles.apiConfigs[name]) {
					throw new Error(`Config '${name}' not found`)
				}
				if (Object.keys(providerProfiles.apiConfigs).length === 1) {
					throw new Error(`Cannot delete the last remaining configuration`)
				}
				delete providerProfiles.apiConfigs[name]
				await this.store(providerProfiles)
			})
		} catch (error) {
			throw new Error(`Failed to delete config: ${error}`)
		}
	}
	/**
	 * Check if a config exists by name.
	 */
	async hasConfig(name) {
		try {
			return await this.lock(async () => {
				const providerProfiles = await this.load()
				return name in providerProfiles.apiConfigs
			})
		} catch (error) {
			throw new Error(`Failed to check config existence: ${error}`)
		}
	}
	/**
	 * Set the API config for a specific mode.
	 */
	async setModeConfig(mode, configId) {
		try {
			return await this.lock(async () => {
				const providerProfiles = await this.load()
				// Ensure the per-mode config map exists
				if (!providerProfiles.modeApiConfigs) {
					providerProfiles.modeApiConfigs = {}
				}
				// Assign the chosen config ID to this mode
				providerProfiles.modeApiConfigs[mode] = configId
				await this.store(providerProfiles)
			})
		} catch (error) {
			throw new Error(`Failed to set mode config: ${error}`)
		}
	}
	/**
	 * Get the API config ID for a specific mode.
	 */
	async getModeConfigId(mode) {
		try {
			return await this.lock(async () => {
				const { modeApiConfigs } = await this.load()
				return modeApiConfigs?.[mode]
			})
		} catch (error) {
			throw new Error(`Failed to get mode config: ${error}`)
		}
	}
	async export() {
		try {
			return await this.lock(async () => {
				const profiles = exports.providerProfilesSchema.parse(await this.load())
				const configs = profiles.apiConfigs
				for (const name in configs) {
					const apiProvider = configs[name].apiProvider
					if (typeof apiProvider === "string" && (0, types_1.isRetiredProvider)(apiProvider)) {
						// Preserve retired-provider profiles as-is to prevent dropping legacy fields.
						continue
					}
					// Avoid leaking properties from other active providers.
					configs[name] = types_1.discriminatedProviderSettingsWithIdSchema.parse(configs[name])
					// If it has no apiProvider, skip filtering
					if (!configs[name].apiProvider) {
						continue
					}
					// Try to build an API handler to get model information
					try {
						const apiHandler = (0, api_1.buildApiHandler)(configs[name])
						const modelInfo = apiHandler.getModel().info
						// Check if the model supports reasoning budgets
						const supportsReasoningBudget =
							modelInfo.supportsReasoningBudget || modelInfo.requiredReasoningBudget
						// If the model doesn't support reasoning budgets, remove the token fields
						if (!supportsReasoningBudget) {
							delete configs[name].modelMaxTokens
							delete configs[name].modelMaxThinkingTokens
						}
					} catch (error) {
						// If we can't build the API handler or get model info, skip filtering
						// to avoid accidental data loss from incomplete configurations
						console.warn(`Skipping token field filtering for config '${name}': ${error}`)
					}
				}
				return profiles
			})
		} catch (error) {
			throw new Error(`Failed to export provider profiles: ${error}`)
		}
	}
	async import(providerProfiles) {
		try {
			return await this.lock(() => this.store(providerProfiles))
		} catch (error) {
			throw new Error(`Failed to import provider profiles: ${error}`)
		}
	}
	/**
	 * Reset provider profiles by deleting them from secrets.
	 */
	async resetAllConfigs() {
		return await this.lock(async () => {
			await this.context.secrets.delete(this.secretsKey)
		})
	}
	get secretsKey() {
		return `${ProviderSettingsManager.SCOPE_PREFIX}api_config`
	}
	async load() {
		try {
			const content = await this.context.secrets.get(this.secretsKey)
			if (!content) {
				return this.defaultProviderProfiles
			}
			const providerProfiles = exports.providerProfilesSchema
				.extend({
					apiConfigs: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
				})
				.parse(JSON.parse(content))
			const apiConfigs = Object.entries(providerProfiles.apiConfigs).reduce((acc, [key, apiConfig]) => {
				// First, sanitize invalid apiProvider values before parsing
				// This handles removed providers (like "glama") gracefully
				const sanitizedConfig = this.sanitizeProviderConfig(apiConfig)
				// For retired providers, use passthrough() to preserve legacy
				// provider-specific fields (e.g. groqApiKey, deepInfraModelId)
				// that strict parse() would strip.
				const providerValue =
					typeof sanitizedConfig === "object" && sanitizedConfig !== null && "apiProvider" in sanitizedConfig
						? sanitizedConfig.apiProvider
						: undefined
				const schema =
					typeof providerValue === "string" && (0, types_1.isRetiredProvider)(providerValue)
						? types_1.providerSettingsWithIdSchema.passthrough()
						: types_1.providerSettingsWithIdSchema
				const result = schema.safeParse(sanitizedConfig)
				return result.success ? { ...acc, [key]: result.data } : acc
			}, {})
			return {
				...providerProfiles,
				apiConfigs: Object.fromEntries(
					Object.entries(apiConfigs).filter(([_, apiConfig]) => apiConfig !== null),
				),
			}
		} catch (error) {
			throw new Error(`Failed to read provider profiles from secrets: ${error}`)
		}
	}
	/**
	 * Sanitizes a provider config by resetting unknown apiProvider values.
	 * Retired providers are preserved.
	 * This handles cases where a user had a provider selected that was later removed
	 * from the extension (e.g., "glama").
	 */
	sanitizeProviderConfig(apiConfig) {
		if (typeof apiConfig !== "object" || apiConfig === null) {
			return apiConfig
		}
		const config = apiConfig
		const apiProvider = config.apiProvider
		// Check if apiProvider is set and if it's still recognized (active or retired)
		if (
			apiProvider !== undefined &&
			(typeof apiProvider !== "string" ||
				(!(0, types_1.isProviderName)(apiProvider) && !(0, types_1.isRetiredProvider)(apiProvider)))
		) {
			console.log(
				`[ProviderSettingsManager] Sanitizing unknown provider "${config.apiProvider}" - resetting to undefined`,
			)
			// Return a new config object without the invalid apiProvider
			// This effectively resets the profile so the user can select a valid provider
			const { apiProvider, ...restConfig } = config
			return restConfig
		}
		return apiConfig
	}
	async store(providerProfiles) {
		try {
			await this.context.secrets.store(this.secretsKey, JSON.stringify(providerProfiles, null, 2))
		} catch (error) {
			throw new Error(`Failed to write provider profiles to secrets: ${error}`)
		}
	}
}
exports.ProviderSettingsManager = ProviderSettingsManager
