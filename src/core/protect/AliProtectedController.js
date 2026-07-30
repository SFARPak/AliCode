"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.AliProtectedController = exports.SHIELD_SYMBOL = void 0
const path_1 = __importDefault(require("path"))
const ignore_1 = __importDefault(require("ignore"))
exports.SHIELD_SYMBOL = "\u{1F6E1}"
/**
 * Controls write access to Ali configuration files by enforcing protection patterns.
 * Prevents auto-approved modifications to sensitive Ali configuration files.
 */
class AliProtectedController {
	cwd
	ignoreInstance
	// Predefined list of protected Ali configuration patterns
	static PROTECTED_PATTERNS = [
		".aliignore",
		".alimodes",
		".alirules*",
		".clinerules*",
		".ali/**",
		".vscode/**",
		"*.code-workspace",
		".aliprotected", // For future use
		"AGENTS.md",
		"AGENT.md",
	]
	constructor(cwd) {
		this.cwd = cwd
		// Initialize ignore instance with protected patterns
		this.ignoreInstance = (0, ignore_1.default)()
		this.ignoreInstance.add(AliProtectedController.PROTECTED_PATTERNS)
	}
	/**
	 * Check if a file is write-protected
	 * @param filePath - Path to check (relative to cwd)
	 * @returns true if file is write-protected, false otherwise
	 */
	isWriteProtected(filePath) {
		try {
			// Normalize path to be relative to cwd and use forward slashes
			const absolutePath = path_1.default.resolve(this.cwd, filePath)
			const relativePath = path_1.default.relative(this.cwd, absolutePath).toPosix()
			// Paths outside the cwd start with ".." and can't match any protected pattern.
			// The ignore library throws RangeError for such paths, so skip them early.
			if (relativePath.startsWith("..")) {
				return false
			}
			// Use ignore library to check if file matches any protected pattern
			return this.ignoreInstance.ignores(relativePath)
		} catch (error) {
			// If there's an error processing the path, err on the side of caution
			console.error(`Error checking protection for ${filePath}:`, error)
			return false
		}
	}
	/**
	 * Get set of write-protected files from a list
	 * @param paths - Array of paths to filter (relative to cwd)
	 * @returns Set of protected file paths
	 */
	getProtectedFiles(paths) {
		const protectedFiles = new Set()
		for (const filePath of paths) {
			if (this.isWriteProtected(filePath)) {
				protectedFiles.add(filePath)
			}
		}
		return protectedFiles
	}
	/**
	 * Filter an array of paths, marking which ones are protected
	 * @param paths - Array of paths to check (relative to cwd)
	 * @returns Array of objects with path and protection status
	 */
	annotatePathsWithProtection(paths) {
		return paths.map((filePath) => ({
			path: filePath,
			isProtected: this.isWriteProtected(filePath),
		}))
	}
	/**
	 * Get display message for protected file operations
	 */
	getProtectionMessage() {
		return "This is a Ali configuration file and requires approval for modifications"
	}
	/**
	 * Get formatted instructions about protected files for the LLM
	 * @returns Formatted instructions about file protection
	 */
	getInstructions() {
		const patterns = AliProtectedController.PROTECTED_PATTERNS.join(", ")
		return `# Protected Files\n\n(The following Ali configuration file patterns are write-protected and always require approval for modifications, regardless of autoapproval settings. When using list_files, you'll notice a ${exports.SHIELD_SYMBOL} next to files that are write-protected.)\n\nProtected patterns: ${patterns}`
	}
	/**
	 * Get the list of protected patterns (for testing/debugging)
	 */
	static getProtectedPatterns() {
		return AliProtectedController.PROTECTED_PATTERNS
	}
}
exports.AliProtectedController = AliProtectedController
