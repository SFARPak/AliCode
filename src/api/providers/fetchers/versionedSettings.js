"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.compareSemver = compareSemver
exports.meetsMinimumVersion = meetsMinimumVersion
exports.findHighestMatchingVersion = findHighestMatchingVersion
exports.resolveVersionedSettings = resolveVersionedSettings
const semver_compare_1 = __importDefault(require("semver-compare"))
const package_1 = require("../../../shared/package")
function isNightlyBuild() {
	return package_1.Package.name.toLowerCase().includes("nightly")
}
/**
 * Compares two semantic version strings using semver-compare.
 *
 * @param version1 First version string (e.g., "3.36.4")
 * @param version2 Second version string (e.g., "3.36.0")
 * @returns -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
function compareSemver(version1, version2) {
	// Handle pre-release versions by stripping the suffix
	// semver-compare doesn't handle pre-release properly
	const stripPrerelease = (v) => v.split("-")[0]
	return (0, semver_compare_1.default)(stripPrerelease(version1), stripPrerelease(version2))
}
/**
 * Checks if the current plugin version meets or exceeds the required minimum version.
 *
 * @param minPluginVersion The minimum required version
 * @param currentVersion The current plugin version (defaults to Package.version)
 * @returns true if current version >= minPluginVersion
 */
function meetsMinimumVersion(minPluginVersion, currentVersion = package_1.Package.version) {
	return compareSemver(currentVersion, minPluginVersion) >= 0
}
/**
 * Finds the highest version from versionedSettings that is <= the current plugin version.
 *
 * @param versionedSettings The versioned settings object with version keys
 * @param currentVersion The current plugin version (defaults to Package.version)
 * @returns The highest matching version key, or undefined if none match
 */
function findHighestMatchingVersion(versionedSettings, currentVersion = package_1.Package.version) {
	const versions = Object.keys(versionedSettings)
	if (versions.length === 0) {
		return undefined
	}
	// Nightly builds should always pick the highest available versioned settings
	if (isNightlyBuild()) {
		versions.sort((a, b) => compareSemver(b, a))
		return versions[0]
	}
	// Filter to versions that are <= currentVersion
	const matchingVersions = versions.filter((version) => meetsMinimumVersion(version, currentVersion))
	if (matchingVersions.length === 0) {
		return undefined
	}
	// Sort in descending order and return the highest
	matchingVersions.sort((a, b) => compareSemver(b, a))
	return matchingVersions[0]
}
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
function resolveVersionedSettings(versionedSettings, currentVersion = package_1.Package.version) {
	const matchingVersion = findHighestMatchingVersion(versionedSettings, currentVersion)
	if (!matchingVersion) {
		return {}
	}
	return versionedSettings[matchingVersion]
}
