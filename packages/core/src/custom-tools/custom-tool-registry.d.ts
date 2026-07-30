/**
 * CustomToolRegistry - A reusable class for dynamically loading and managing TypeScript tools.
 *
 * Features:
 * - Dynamic TypeScript/JavaScript tool loading with esbuild transpilation.
 * - Runtime validation of tool definitions.
 * - Tool execution with context.
 * - JSON Schema generation for LLM integration.
 */
import type { CustomToolDefinition, SerializedCustomToolDefinition } from "@ali-code/types"
import type { LoadResult } from "./types.js"
export interface RegistryOptions {
	/** Directory for caching compiled TypeScript files. */
	cacheDir?: string
	/** Additional paths for resolving node modules (useful for tools outside node_modules). */
	nodePaths?: string[]
	/** Path to the extension root directory (for finding bundled esbuild binary in production). */
	extensionPath?: string
}
export declare class CustomToolRegistry {
	private tools
	private tsCache
	private cacheDir
	private nodePaths
	private extensionPath?
	private lastLoaded
	constructor(options?: RegistryOptions)
	/**
	 * Load all tools from a directory.
	 * Supports both .ts and .js files.
	 *
	 * @param toolDir - Absolute path to the tools directory
	 * @returns LoadResult with lists of loaded and failed tools
	 */
	loadFromDirectory(toolDir: string): Promise<LoadResult>
	loadFromDirectoryIfStale(toolDir: string): Promise<LoadResult>
	/**
	 * Load all tools from multiple directories.
	 * Directories are processed in order, so later directories can override tools from earlier ones.
	 * Supports both .ts and .js files.
	 *
	 * @param toolDirs - Array of absolute paths to tools directories
	 * @returns LoadResult with lists of loaded and failed tools from all directories
	 */
	loadFromDirectories(toolDirs: string[]): Promise<LoadResult>
	/**
	 * Load all tools from multiple directories if any has become stale.
	 * Directories are processed in order, so later directories can override tools from earlier ones.
	 *
	 * @param toolDirs - Array of absolute paths to tools directories
	 * @returns LoadResult with lists of loaded and failed tools
	 */
	loadFromDirectoriesIfStale(toolDirs: string[]): Promise<LoadResult>
	/**
	 * Register a tool directly (without loading from file).
	 */
	register(definition: CustomToolDefinition, source?: string): void
	/**
	 * Unregister a tool by ID.
	 */
	unregister(id: string): boolean
	/**
	 * Get a tool by ID.
	 */
	get(id: string): CustomToolDefinition | undefined
	/**
	 * Check if a tool exists.
	 */
	has(id: string): boolean
	/**
	 * Get all registered tool IDs.
	 */
	list(): string[]
	/**
	 * Get all registered tools.
	 */
	getAll(): CustomToolDefinition[]
	/**
	 * Get all registered tools in the serialized format.
	 */
	getAllSerialized(): SerializedCustomToolDefinition[]
	/**
	 * Get the number of registered tools.
	 */
	get size(): number
	/**
	 * Clear all registered tools.
	 */
	clear(): void
	/**
	 * Set the extension path for finding bundled esbuild binary.
	 * This should be called with context.extensionPath when the extension activates.
	 */
	setExtensionPath(extensionPath: string): void
	/**
	 * Get the current extension path.
	 */
	getExtensionPath(): string | undefined
	/**
	 * Clear the TypeScript compilation cache (both in-memory and on disk).
	 * This removes all tool-specific subdirectories and their contents.
	 */
	clearCache(): void
	/**
	 * Dynamically import a TypeScript or JavaScript file.
	 * TypeScript files are transpiled on-the-fly using esbuild.
	 *
	 * For TypeScript files, esbuild bundles the code with these considerations:
	 * - Node.js built-in modules (fs, path, etc.) are kept external
	 * - npm packages are bundled with a CommonJS shim for require() compatibility
	 * - The tool's local node_modules is included in the resolution path
	 */
	private import
	/**
	 * Copy .env files from the tool's source directory to the tool-specific cache directory.
	 * This allows tools that use dotenv with __dirname to find their .env files,
	 * while ensuring different tools' .env files don't overwrite each other.
	 *
	 * @param toolDir - The directory containing the tool source files
	 * @param destDir - The tool-specific cache directory to copy .env files to
	 */
	private copyEnvFiles
	/**
	 * Check if a value is a Zod schema by looking for the _def property
	 * which is present on all Zod types.
	 */
	private isParametersSchema
	/**
	 * Validate a tool definition and return a typed result.
	 * Returns null for non-tool exports, throws for invalid tools.
	 */
	private validate
}
export declare const customToolRegistry: CustomToolRegistry
//# sourceMappingURL=custom-tool-registry.d.ts.map
