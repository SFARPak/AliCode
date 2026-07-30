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
exports.AliIgnoreController = exports.LOCK_TEXT_SYMBOL = void 0
const path_1 = __importDefault(require("path"))
const fs_1 = require("../../utils/fs")
const promises_1 = __importDefault(require("fs/promises"))
const fs_2 = __importDefault(require("fs"))
const ignore_1 = __importDefault(require("ignore"))
const vscode = __importStar(require("vscode"))
exports.LOCK_TEXT_SYMBOL = "\u{1F512}"
/**
 * Controls LLM access to files by enforcing ignore patterns.
 * Designed to be instantiated once in Cline.ts and passed to file manipulation services.
 * Uses the 'ignore' library to support standard .gitignore syntax in .aliignore files.
 */
class AliIgnoreController {
	cwd
	ignoreInstance
	disposables = []
	rooIgnoreContent
	constructor(cwd) {
		this.cwd = cwd
		this.ignoreInstance = (0, ignore_1.default)()
		this.rooIgnoreContent = undefined
		// Set up file watcher for .aliignore
		this.setupFileWatcher()
	}
	/**
	 * Initialize the controller by loading custom patterns
	 * Must be called after construction and before using the controller
	 */
	async initialize() {
		await this.loadAliIgnore()
	}
	/**
	 * Set up the file watcher for .aliignore changes
	 */
	setupFileWatcher() {
		const rooignorePattern = new vscode.RelativePattern(this.cwd, ".aliignore")
		const fileWatcher = vscode.workspace.createFileSystemWatcher(rooignorePattern)
		// Watch for changes and updates
		this.disposables.push(
			fileWatcher.onDidChange(() => {
				this.loadAliIgnore()
			}),
			fileWatcher.onDidCreate(() => {
				this.loadAliIgnore()
			}),
			fileWatcher.onDidDelete(() => {
				this.loadAliIgnore()
			}),
		)
		// Add fileWatcher itself to disposables
		this.disposables.push(fileWatcher)
	}
	/**
	 * Load custom patterns from .aliignore if it exists
	 */
	async loadAliIgnore() {
		try {
			// Reset ignore instance to prevent duplicate patterns
			this.ignoreInstance = (0, ignore_1.default)()
			const ignorePath = path_1.default.join(this.cwd, ".aliignore")
			if (await (0, fs_1.fileExistsAtPath)(ignorePath)) {
				const content = await promises_1.default.readFile(ignorePath, "utf8")
				this.rooIgnoreContent = content
				this.ignoreInstance.add(content)
				this.ignoreInstance.add(".aliignore")
			} else {
				this.rooIgnoreContent = undefined
			}
		} catch (error) {
			// Should never happen: reading file failed even though it exists
			console.error("Unexpected error loading .aliignore:", error)
		}
	}
	/**
	 * Check if a file should be accessible to the LLM
	 * Automatically resolves symlinks
	 * @param filePath - Path to check (relative to cwd)
	 * @returns true if file is accessible, false if ignored
	 */
	validateAccess(filePath) {
		// Always allow access if .aliignore does not exist
		if (!this.rooIgnoreContent) {
			return true
		}
		try {
			const absolutePath = path_1.default.resolve(this.cwd, filePath)
			// Follow symlinks to get the real path
			let realPath
			try {
				realPath = fs_2.default.realpathSync(absolutePath)
			} catch {
				// If realpath fails (file doesn't exist, broken symlink, etc.),
				// use the original path
				realPath = absolutePath
			}
			// Convert real path to relative for .aliignore checking
			const relativePath = path_1.default.relative(this.cwd, realPath).toPosix()
			// Check if the real path is ignored
			return !this.ignoreInstance.ignores(relativePath)
		} catch (error) {
			// Allow access to files outside cwd or on errors (backward compatibility)
			return true
		}
	}
	/**
	 * Check if a terminal command should be allowed to execute based on file access patterns
	 * @param command - Terminal command to validate
	 * @returns path of file that is being accessed if it is being accessed, undefined if command is allowed
	 */
	validateCommand(command) {
		// Always allow if no .aliignore exists
		if (!this.rooIgnoreContent) {
			return undefined
		}
		// Split command into parts and get the base command
		const parts = command.trim().split(/\s+/)
		const baseCommand = parts[0].toLowerCase()
		// Commands that read file contents
		const fileReadingCommands = [
			// Unix commands
			"cat",
			"less",
			"more",
			"head",
			"tail",
			"grep",
			"awk",
			"sed",
			// PowerShell commands and aliases
			"get-content",
			"gc",
			"type",
			"select-string",
			"sls",
		]
		if (fileReadingCommands.includes(baseCommand)) {
			// Check each argument that could be a file path
			for (let i = 1; i < parts.length; i++) {
				const arg = parts[i]
				// Skip command flags/options (both Unix and PowerShell style)
				if (arg.startsWith("-") || arg.startsWith("/")) {
					continue
				}
				// Ignore PowerShell parameter names
				if (arg.includes(":")) {
					continue
				}
				// Validate file access
				if (!this.validateAccess(arg)) {
					return arg
				}
			}
		}
		return undefined
	}
	/**
	 * Filter an array of paths, removing those that should be ignored
	 * @param paths - Array of paths to filter (relative to cwd)
	 * @returns Array of allowed paths
	 */
	filterPaths(paths) {
		try {
			return paths
				.map((p) => ({
					path: p,
					allowed: this.validateAccess(p),
				}))
				.filter((x) => x.allowed)
				.map((x) => x.path)
		} catch (error) {
			console.error("Error filtering paths:", error)
			return [] // Fail closed for security
		}
	}
	/**
	 * Clean up resources when the controller is no longer needed
	 */
	dispose() {
		this.disposables.forEach((d) => d.dispose())
		this.disposables = []
	}
	/**
	 * Get formatted instructions about the .aliignore file for the LLM
	 * @returns Formatted instructions or undefined if .aliignore doesn't exist
	 */
	getInstructions() {
		if (!this.rooIgnoreContent) {
			return undefined
		}
		return `# .aliignore\n\n(The following is provided by a root-level .aliignore file where the user has specified files and directories that should not be accessed. When using list_files, you'll notice a ${exports.LOCK_TEXT_SYMBOL} next to files that are blocked. Attempting to access the file's contents e.g. through read_file will result in an error.)\n\n${this.rooIgnoreContent}\n.aliignore`
	}
}
exports.AliIgnoreController = AliIgnoreController
