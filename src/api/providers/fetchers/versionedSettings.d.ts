/**
 * Type for versioned settings where the version is the key.
 * Each version key maps to a settings object that should be used
 * when the current plugin version is >= that version.
 *
 * Example API response:
 * ```
 * {
 *   settings: {
 *     includedTools: ['search_replace']  // Plain value for old clients
 *   },
 *   versionedSettings: {
 *     '3.36.4': {
 *       includedTools: ['search_replace', 'apply_diff'],  // Enhanced value for 3.36.4+
 *       excludedTools: ['write_to_file'],
 *     },
 *     '3.35.0': {
 *       includedTools: ['search_replace'],  // Value for 3.35.0 - 3.36.3
 *     },
 *   }
 * }
 * ```
 *
 * The resolver will find the highest version key that is <= the current plugin version
 * and use those settings. If no version matches, falls back to plain `settings`.
 */
export type VersionedSettings = Record<string, Record<string, unknown>>
/**
 * Compares two semantic version strings using semver-compare.
 *
 * @param version1 First version string (e.g., "3.36.4")
 * @param version2 Second version string (e.g., "3.36.0")
 * @returns -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
export declare function compareSemver(version1: string, version2: string): number
/**
 * Checks if the current plugin version meets or exceeds the required minimum version.
 *
 * @param minPluginVersion The minimum required version
 * @param currentVersion The current plugin version (defaults to Package.version)
 * @returns true if current version >= minPluginVersion
 */
export declare function meetsMinimumVersion(minPluginVersion: string, currentVersion?: string): boolean
/**
 * Finds the highest version from versionedSettings that is <= the current plugin version.
 *
 * @param versionedSettings The versioned settings object with version keys
 * @param currentVersion The current plugin version (defaults to Package.version)
 * @returns The highest matching version key, or undefined if none match
 */
export declare function findHighestMatchingVersion(
	versionedSettings: VersionedSettings,
	currentVersion?: string,
): string | undefined
/**
 * Resolves versioned settings by finding the highest version that is <= the current
 * plugin version and returning those settings.
 *
 * The versionedSettings structure uses version numbers as keys:
 * ```
 * versionedSettings: {
 *   '3.36.4': { includedTools: ['search_replace'], excludedTools: ['apply_diff'] },
 *   '3.35.0': { includedTools: ['search_replace'] },
 * }
 * ```
 *
 * This function finds the highest version key that is <= currentVersion and returns
 * the corresponding settings object. If no version matches, returns an empty object.
 *
 * @param versionedSettings The versioned settings object with version keys
 * @param currentVersion The current plugin version (defaults to Package.version)
 * @returns The settings object for the highest matching version, or empty object if none match
 */
export declare function resolveVersionedSettings<T extends Record<string, unknown>>(
	versionedSettings: VersionedSettings,
	currentVersion?: string,
): Partial<T>
//# sourceMappingURL=versionedSettings.d.ts.map
