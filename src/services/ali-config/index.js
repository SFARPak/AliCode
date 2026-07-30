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
exports.loadAliConfiguration = void 0
exports.getGlobalAliDirectory = getGlobalAliDirectory
exports.getGlobalAgentsDirectory = getGlobalAgentsDirectory
exports.getProjectAgentsDirectoryForCwd = getProjectAgentsDirectoryForCwd
exports.getProjectAliDirectoryForCwd = getProjectAliDirectoryForCwd
exports.directoryExists = directoryExists
exports.fileExists = fileExists
exports.readFileIfExists = readFileIfExists
exports.discoverSubfolderAliDirectories = discoverSubfolderAliDirectories
exports.getAliDirectoriesForCwd = getAliDirectoriesForCwd
exports.getAllAliDirectoriesForCwd = getAllAliDirectoriesForCwd
exports.getAgentsDirectoriesForCwd = getAgentsDirectoriesForCwd
exports.loadConfiguration = loadConfiguration
const path = __importStar(require("path"))
const os = __importStar(require("os"))
const promises_1 = __importDefault(require("fs/promises"))
/**
 * Gets the global .roo directory path based on the current platform
 *
 * @returns The absolute path to the global .roo directory
 *
 * @example Platform-specific paths:
 * ```
 * // macOS/Linux: ~/.ali/
 * // Example: /Users/john/.roo
 *
 * // Windows: %USERPROFILE%\.roo\
 * // Example: C:\Users\john\.roo
 * ```
 *
 * @example Usage:
 * ```typescript
 * const globalDir = getGlobalAliDirectory()
 * // Returns: "/Users/john/.roo" (on macOS/Linux)
 * // Returns: "C:\\Users\\john\\.roo" (on Windows)
 * ```
 */
function getGlobalAliDirectory() {
	const homeDir = os.homedir()
	return path.join(homeDir, ".ali")
}
/**
 * Gets the global .agents directory path based on the current platform.
 * This is a shared directory for agent skills across different AI coding tools.
 *
 * @returns The absolute path to the global .agents directory
 *
 * @example Platform-specific paths:
 * ```
 * // macOS/Linux: ~/.agents/
 * // Example: /Users/john/.agents
 *
 * // Windows: %USERPROFILE%\.agents\
 * // Example: C:\Users\john\.agents
 * ```
 *
 * @example Usage:
 * ```typescript
 * const globalAgentsDir = getGlobalAgentsDirectory()
 * // Returns: "/Users/john/.agents" (on macOS/Linux)
 * // Returns: "C:\\Users\\john\\.agents" (on Windows)
 * ```
 */
function getGlobalAgentsDirectory() {
	const homeDir = os.homedir()
	return path.join(homeDir, ".agents")
}
/**
 * Gets the project-local .agents directory path for a given cwd.
 * This is a shared directory for agent skills across different AI coding tools.
 *
 * @param cwd - Current working directory (project path)
 * @returns The absolute path to the project-local .agents directory
 *
 * @example
 * ```typescript
 * const projectAgentsDir = getProjectAgentsDirectoryForCwd('/Users/john/my-project')
 * // Returns: "/Users/john/my-project/.agents"
 * ```
 */
function getProjectAgentsDirectoryForCwd(cwd) {
	return path.join(cwd, ".agents")
}
/**
 * Gets the project-local .roo directory path for a given cwd
 *
 * @param cwd - Current working directory (project path)
 * @returns The absolute path to the project-local .roo directory
 *
 * @example
 * ```typescript
 * const projectDir = getProjectAliDirectoryForCwd('/Users/john/my-project')
 * // Returns: "/Users/john/my-project/.roo"
 *
 * const windowsProjectDir = getProjectAliDirectoryForCwd('C:\\Users\\john\\my-project')
 * // Returns: "C:\\Users\\john\\my-project\\.roo"
 * ```
 *
 * @example Directory structure:
 * ```
 * /Users/john/my-project/
 * ├── .ali/                    # Project-local configuration directory
 * │   ├── rules/
 * │   │   └── rules.md
 * │   ├── custom-instructions.md
 * │   └── config/
 * │       └── settings.json
 * ├── src/
 * │   └── index.ts
 * └── package.json
 * ```
 */
function getProjectAliDirectoryForCwd(cwd) {
	return path.join(cwd, ".ali")
}
/**
 * Checks if a directory exists
 */
async function directoryExists(dirPath) {
	try {
		const stat = await promises_1.default.stat(dirPath)
		return stat.isDirectory()
	} catch (error) {
		// Only catch expected "not found" errors
		if (error.code === "ENOENT" || error.code === "ENOTDIR") {
			return false
		}
		// Re-throw unexpected errors (permission, I/O, etc.)
		throw error
	}
}
/**
 * Checks if a file exists
 */
async function fileExists(filePath) {
	try {
		const stat = await promises_1.default.stat(filePath)
		return stat.isFile()
	} catch (error) {
		// Only catch expected "not found" errors
		if (error.code === "ENOENT" || error.code === "ENOTDIR") {
			return false
		}
		// Re-throw unexpected errors (permission, I/O, etc.)
		throw error
	}
}
/**
 * Reads a file safely, returning null if it doesn't exist
 */
async function readFileIfExists(filePath) {
	try {
		return await promises_1.default.readFile(filePath, "utf-8")
	} catch (error) {
		// Only catch expected "not found" errors
		if (error.code === "ENOENT" || error.code === "ENOTDIR" || error.code === "EISDIR") {
			return null
		}
		// Re-throw unexpected errors (permission, I/O, etc.)
		throw error
	}
}
/**
 * Discovers all .roo directories in subdirectories of the workspace
 *
 * @param cwd - Current working directory (workspace root)
 * @returns Array of absolute paths to .roo directories found in subdirectories,
 *          sorted alphabetically. Does not include the root .roo directory.
 *
 * @example
 * ```typescript
 * const subfolderAlis = await discoverSubfolderAliDirectories('/Users/john/monorepo')
 * // Returns:
 * // [
 * //   '/Users/john/monorepo/package-a/.roo',
 * //   '/Users/john/monorepo/package-b/.roo',
 * //   '/Users/john/monorepo/packages/shared/.roo'
 * // ]
 * ```
 *
 * @example Directory structure:
 * ```
 * /Users/john/monorepo/
 * ├── .ali/                    # Root .roo (NOT included - use getProjectAliDirectoryForCwd)
 * ├── package-a/
 * │   └── .ali/                # Included
 * │       └── rules/
 * ├── package-b/
 * │   └── .ali/                # Included
 * │       └── rules-code/
 * └── packages/
 *     └── shared/
 *         └── .ali/            # Included (nested)
 *             └── rules/
 * ```
 */
async function discoverSubfolderAliDirectories(cwd) {
	try {
		// Dynamic import to avoid vscode dependency at module load time
		// This is necessary because file-search.ts imports vscode, which is not
		// available in the webview context
		const { executeRipgrep } = await import("../search/file-search")
		// Use ripgrep to find any file inside any .roo directory
		// This efficiently discovers all .roo folders regardless of their content
		const args = [
			"--files",
			"--hidden",
			"--follow",
			"-g",
			"**/.ali/**",
			"-g",
			"!node_modules/**",
			"-g",
			"!.git/**",
			cwd,
		]
		const results = await executeRipgrep({ args, workspacePath: cwd })
		// Extract unique .roo directory paths
		const aliDirs = new Set()
		const rootAliDir = path.join(cwd, ".ali")
		for (const result of results) {
			// Match paths like "subfolder/.ali/anything" or "subfolder/nested/.ali/anything"
			// Handle both forward slashes (Unix) and backslashes (Windows)
			const match = result.path.match(/^(.+?)[/\\]\.ali[/\\]/)
			if (match) {
				const aliDir = path.join(cwd, match[1], ".ali")
				// Exclude the root .ali directory (already handled by getProjectAliDirectoryForCwd)
				if (aliDir !== rootAliDir) {
					aliDirs.add(aliDir)
				}
			}
		}
		// Return sorted alphabetically
		return Array.from(aliDirs).sort()
	} catch (error) {
		// If discovery fails (e.g., ripgrep not available), return empty array
		return []
	}
}
/**
 * Gets the ordered list of .roo directories to check (global first, then project-local)
 *
 * @param cwd - Current working directory (project path)
 * @returns Array of directory paths to check in order [global, project-local]
 *
 * @example
 * ```typescript
 * // For a project at /Users/john/my-project
 * const directories = getAliDirectoriesForCwd('/Users/john/my-project')
 * // Returns:
 * // [
 * //   '/Users/john/.roo',           // Global directory
 * //   '/Users/john/my-project/.roo' // Project-local directory
 * // ]
 * ```
 *
 * @example Directory structure:
 * ```
 * /Users/john/
 * ├── .ali/                    # Global configuration
 * │   ├── rules/
 * │   │   └── rules.md
 * │   └── custom-instructions.md
 * └── my-project/
 *     ├── .ali/                # Project-specific configuration
 *     │   ├── rules/
 *     │   │   └── rules.md     # Overrides global rules
 *     │   └── project-notes.md
 *     └── src/
 *         └── index.ts
 * ```
 */
function getAliDirectoriesForCwd(cwd) {
	const directories = []
	// Add global directory first
	directories.push(getGlobalAliDirectory())
	// Add project-local directory second
	directories.push(getProjectAliDirectoryForCwd(cwd))
	return directories
}
/**
 * Gets the ordered list of all .roo directories including subdirectories
 *
 * @param cwd - Current working directory (project path)
 * @returns Array of directory paths in order: [global, project-local, ...subfolders (alphabetically)]
 *
 * @example
 * ```typescript
 * // For a monorepo at /Users/john/monorepo with .roo in subfolders
 * const directories = await getAllAliDirectoriesForCwd('/Users/john/monorepo')
 * // Returns:
 * // [
 * //   '/Users/john/.roo',                    // Global directory
 * //   '/Users/john/monorepo/.roo',           // Project-local directory
 * //   '/Users/john/monorepo/package-a/.roo', // Subfolder (alphabetical)
 * //   '/Users/john/monorepo/package-b/.roo'  // Subfolder (alphabetical)
 * // ]
 * ```
 */
async function getAllAliDirectoriesForCwd(cwd) {
	const directories = []
	// Add global directory first
	directories.push(getGlobalAliDirectory())
	// Add project-local directory second
	directories.push(getProjectAliDirectoryForCwd(cwd))
	// Discover and add subfolder .roo directories
	const subfolderDirs = await discoverSubfolderAliDirectories(cwd)
	directories.push(...subfolderDirs)
	return directories
}
/**
 * Gets parent directories containing .roo folders, in order from root to subfolders
 *
 * @param cwd - Current working directory (project path)
 * @returns Array of parent directory paths (not .roo paths) containing AGENTS.md or .roo
 *
 * @example
 * ```typescript
 * const dirs = await getAgentsDirectoriesForCwd('/Users/john/monorepo')
 * // Returns: ['/Users/john/monorepo', '/Users/john/monorepo/package-a', ...]
 * ```
 */
async function getAgentsDirectoriesForCwd(cwd) {
	const directories = []
	// Always include the root directory
	directories.push(cwd)
	// Get all subfolder .roo directories
	const subfolderAliDirs = await discoverSubfolderAliDirectories(cwd)
	// Extract parent directories (remove .roo from path)
	for (const aliDir of subfolderAliDirs) {
		const parentDir = path.dirname(aliDir)
		directories.push(parentDir)
	}
	return directories
}
/**
 * Loads configuration from multiple .roo directories with project overriding global
 *
 * @param relativePath - The relative path within each .roo directory (e.g., 'rules/rules.md')
 * @param cwd - Current working directory (project path)
 * @returns Object with global and project content, plus merged content
 *
 * @example
 * ```typescript
 * // Load rules configuration for a project
 * const config = await loadConfiguration('rules/rules.md', '/Users/john/my-project')
 *
 * // Returns:
 * // {
 * //   global: "Global rules content...",     // From ~/.ali/rules/rules.md
 * //   project: "Project rules content...",   // From /Users/john/my-project/.ali/rules/rules.md
 * //   merged: "Global rules content...\n\n# Project-specific rules (override global):\n\nProject rules content..."
 * // }
 * ```
 *
 * @example File paths resolved:
 * ```
 * relativePath: 'rules/rules.md'
 * cwd: '/Users/john/my-project'
 *
 * Reads from:
 * - Global: /Users/john/.ali/rules/rules.md
 * - Project: /Users/john/my-project/.ali/rules/rules.md
 *
 * Other common relativePath examples:
 * - 'custom-instructions.md'
 * - 'config/settings.json'
 * - 'templates/component.tsx'
 * ```
 *
 * @example Merging behavior:
 * ```
 * // If only global exists:
 * { global: "content", project: null, merged: "content" }
 *
 * // If only project exists:
 * { global: null, project: "content", merged: "content" }
 *
 * // If both exist:
 * {
 *   global: "global content",
 *   project: "project content",
 *   merged: "global content\n\n# Project-specific rules (override global):\n\nproject content"
 * }
 * ```
 */
async function loadConfiguration(relativePath, cwd) {
	const globalDir = getGlobalAliDirectory()
	const projectDir = getProjectAliDirectoryForCwd(cwd)
	const globalFilePath = path.join(globalDir, relativePath)
	const projectFilePath = path.join(projectDir, relativePath)
	// Read global configuration
	const globalContent = await readFileIfExists(globalFilePath)
	// Read project-local configuration
	const projectContent = await readFileIfExists(projectFilePath)
	// Merge configurations - project overrides global
	let merged = ""
	if (globalContent) {
		merged += globalContent
	}
	if (projectContent) {
		if (merged) {
			merged += "\n\n# Project-specific rules (override global):\n\n"
		}
		merged += projectContent
	}
	return {
		global: globalContent,
		project: projectContent,
		merged: merged || "",
	}
}
// Export with backward compatibility alias
exports.loadAliConfiguration = loadConfiguration
