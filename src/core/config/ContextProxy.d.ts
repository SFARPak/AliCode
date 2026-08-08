import * as vscode from "vscode"
import {
	type ProviderSettings,
	type GlobalSettings,
	type SecretState,
	type GlobalState,
	type AliCodeSettings,
} from "@ali-code/types"
type GlobalStateKey = keyof GlobalState
type SecretStateKey = keyof SecretState
type AliCodeSettingsKey = keyof AliCodeSettings
export declare const isPassThroughStateKey: (key: string) => boolean
export declare class ContextProxy {
	private readonly originalContext
	private stateCache
	private secretCache
	private _isInitialized
	constructor(context: vscode.ExtensionContext)
	get isInitialized(): boolean
	initialize(): Promise<void>
	/**
	 * Migrates the legacy customCondensingPrompt to the new customSupportPrompts structure
	 * and removes the legacy field.
	 *
	 * Note: Only true customizations are migrated. If the legacy prompt equals the default,
	 * we skip the migration to avoid pinning users to an old default if the default changes.
	 */
	private migrateLegacyCondensingPrompt
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
	private migrateOldDefaultCondensingPrompt
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
	private isOldV1DefaultCondensePrompt
	/**
	 * Migrates unknown apiProvider values by clearing them from storage.
	 * Retired providers are preserved so users can keep historical configuration.
	 */
	private migrateInvalidApiProvider
	/**
	 * Migrates old nested openRouterImageGenerationSettings to the new flattened structure
	 */
	private migrateImageGenerationSettings
	/**
	 * Migrates provider API keys that were previously stored in global state
	 * into secret storage now that they are recognized as secret keys.
	 */
	private migrateProviderApiKeysToSecrets
	get extensionUri(): vscode.Uri
	get extensionPath(): string
	get globalStorageUri(): vscode.Uri
	get logUri(): vscode.Uri
	get extension(): vscode.Extension<any>
	get extensionMode(): vscode.ExtensionMode
	/**
	 * ExtensionContext.globalState
	 * https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.globalState
	 */
	getGlobalState<K extends GlobalStateKey>(key: K): GlobalState[K]
	getGlobalState<K extends GlobalStateKey>(key: K, defaultValue: GlobalState[K]): GlobalState[K]
	updateGlobalState<K extends GlobalStateKey>(key: K, value: GlobalState[K]): Thenable<void>
	private getAllGlobalState
	/**
	 * ExtensionContext.secrets
	 * https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.secrets
	 */
	getSecret(key: SecretStateKey): string | undefined
	storeSecret(key: SecretStateKey, value?: string): Thenable<void>
	/**
	 * Refresh secrets from storage and update cache
	 * This is useful when you need to ensure the cache has the latest values
	 */
	refreshSecrets(): Promise<void>
	private getAllSecretState
	/**
	 * GlobalSettings
	 */
	getGlobalSettings(): GlobalSettings
	/**
	 * ProviderSettings
	 */
	getProviderSettings(): ProviderSettings
	/**
	 * Sanitizes provider values by resetting unknown apiProvider values.
	 * Active and retired providers are preserved.
	 */
	private sanitizeProviderValues
	setProviderSettings(values: ProviderSettings): Promise<void>
	/**
	 * AliCodeSettings
	 */
	setValue<K extends AliCodeSettingsKey>(key: K, value: AliCodeSettings[K]): Promise<void>
	getValue<K extends AliCodeSettingsKey>(key: K): AliCodeSettings[K]
	getValues(): AliCodeSettings
	setValues(values: AliCodeSettings): Promise<void>
	/**
	 * Import / Export
	 */
	export(): Promise<GlobalSettings | undefined>
	/**
	 * Resets all global state, secrets, and in-memory caches.
	 * This clears all data from both the in-memory caches and the VSCode storage.
	 * @returns A promise that resolves when all reset operations are complete
	 */
	resetAllState(): Promise<void>
	private static _instance
	static get instance(): ContextProxy
	static getInstance(context: vscode.ExtensionContext): Promise<ContextProxy>
}
export {}
//# sourceMappingURL=ContextProxy.d.ts.map
