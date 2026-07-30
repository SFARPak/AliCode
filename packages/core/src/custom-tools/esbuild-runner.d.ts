/**
 * esbuild-runner - Runs esbuild-wasm CLI to transpile TypeScript files.
 *
 * This module provides a way to run esbuild as a CLI process instead of using
 * the JavaScript API. This uses esbuild-wasm which is cross-platform and works
 * on all operating systems without needing native binaries.
 *
 * In production, the esbuild-wasm CLI script is bundled in dist/bin/.
 * In development, it falls back to using esbuild-wasm from node_modules.
 */
/**
 * Node.js built-in modules that should never be bundled.
 * These are always available in Node.js runtime and bundling them causes issues.
 *
 * Uses Node.js's authoritative list from `module.builtinModules` and adds
 * the `node:` prefixed versions for comprehensive coverage.
 */
export declare const NODE_BUILTIN_MODULES: readonly string[]
/**
 * Banner code to add to bundled output.
 * This provides a CommonJS-compatible `require` function for ESM bundles,
 * which is needed when bundled npm packages use `require()` internally.
 */
export declare const COMMONJS_REQUIRE_BANNER =
	"import { createRequire as __roo_createRequire } from 'module';\nvar require = __roo_createRequire(import.meta.url);"
export interface EsbuildOptions {
	/** Entry point file path (absolute) */
	entryPoint: string
	/** Output file path (absolute) */
	outfile: string
	/** Output format */
	format?: "esm" | "cjs" | "iife"
	/** Target platform */
	platform?: "node" | "browser" | "neutral"
	/** Target environment (e.g., "node18") */
	target?: string
	/** Bundle dependencies */
	bundle?: boolean
	/** Generate source maps */
	sourcemap?: boolean | "inline" | "external"
	/** How to handle packages: "bundle" includes them, "external" leaves them */
	packages?: "bundle" | "external"
	/** Additional paths for module resolution */
	nodePaths?: string[]
	/** Modules to exclude from bundling (resolved at runtime) */
	external?: readonly string[]
	/** JavaScript code to prepend to the output bundle */
	banner?: string
}
/**
 * Get the path to the esbuild CLI script.
 *
 * Resolution order:
 * 1. Production: Look in extension's dist/bin directory for bundled script.
 * 2. Development: Use esbuild-wasm from node_modules (relative to this module).
 * 3. Fallback: Try process.cwd() as last resort.
 *
 * @param extensionPath - Path to the extension's root directory (production)
 * @returns Path to the esbuild CLI script
 */
export declare function getEsbuildScriptPath(extensionPath?: string): string
/**
 * Run esbuild CLI to bundle a TypeScript file.
 *
 * Uses esbuild-wasm which is cross-platform and runs via Node.js.
 *
 * @param options - Build options
 * @param extensionPath - Path to extension root (for finding bundled script)
 * @returns Promise that resolves when build completes
 * @throws Error if the build fails
 */
export declare function runEsbuild(options: EsbuildOptions, extensionPath?: string): Promise<void>
//# sourceMappingURL=esbuild-runner.d.ts.map
