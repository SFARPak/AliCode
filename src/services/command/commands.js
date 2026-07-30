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
exports.getCommands = getCommands
exports.getCommand = getCommand
exports.getCommandNames = getCommandNames
exports.getCommandNameFromFile = getCommandNameFromFile
exports.isMarkdownFile = isMarkdownFile
const promises_1 = __importDefault(require("fs/promises"))
const path = __importStar(require("path"))
const gray_matter_1 = __importDefault(require("gray-matter"))
const ali_config_1 = require("../ali-config")
const built_in_commands_1 = require("./built-in-commands")
/**
 * Maximum depth for resolving symlinks to prevent cyclic symlink loops
 */
const MAX_DEPTH = 5
/**
 * Recursively resolve a symbolic link and collect command file info
 */
async function resolveCommandSymLink(symlinkPath, fileInfo, depth) {
	// Avoid cyclic symlinks
	if (depth > MAX_DEPTH) {
		return
	}
	try {
		// Get the symlink target
		const linkTarget = await promises_1.default.readlink(symlinkPath)
		// Resolve the target path (relative to the symlink location)
		const resolvedTarget = path.resolve(path.dirname(symlinkPath), linkTarget)
		// Check if the target is a file (use lstat to detect nested symlinks)
		const stats = await promises_1.default.lstat(resolvedTarget)
		if (stats.isFile()) {
			// Only include markdown files
			if (isMarkdownFile(resolvedTarget)) {
				// For symlinks to files, store the symlink path as original and target as resolved
				fileInfo.push({ originalPath: symlinkPath, resolvedPath: resolvedTarget })
			}
		} else if (stats.isDirectory()) {
			// Read the target directory and process its entries
			const entries = await promises_1.default.readdir(resolvedTarget, { withFileTypes: true })
			const directoryPromises = []
			for (const entry of entries) {
				directoryPromises.push(resolveCommandDirectoryEntry(entry, resolvedTarget, fileInfo, depth + 1))
			}
			await Promise.all(directoryPromises)
		} else if (stats.isSymbolicLink()) {
			// Handle nested symlinks
			await resolveCommandSymLink(resolvedTarget, fileInfo, depth + 1)
		}
	} catch {
		// Skip invalid symlinks
	}
}
/**
 * Recursively resolve directory entries and collect command file paths
 */
async function resolveCommandDirectoryEntry(entry, dirPath, fileInfo, depth) {
	// Avoid cyclic symlinks
	if (depth > MAX_DEPTH) {
		return
	}
	const fullPath = path.resolve(entry.parentPath || dirPath, entry.name)
	if (entry.isFile()) {
		// Only include markdown files
		if (isMarkdownFile(entry.name)) {
			// Regular file - both original and resolved paths are the same
			fileInfo.push({ originalPath: fullPath, resolvedPath: fullPath })
		}
	} else if (entry.isSymbolicLink()) {
		// Await the resolution of the symbolic link
		await resolveCommandSymLink(fullPath, fileInfo, depth + 1)
	}
}
/**
 * Try to resolve a symlinked command file
 */
async function tryResolveSymlinkedCommand(filePath) {
	try {
		const lstat = await promises_1.default.lstat(filePath)
		if (lstat.isSymbolicLink()) {
			// Get the symlink target
			const linkTarget = await promises_1.default.readlink(filePath)
			// Resolve the target path (relative to the symlink location)
			const resolvedTarget = path.resolve(path.dirname(filePath), linkTarget)
			// Check if the target is a file
			const stats = await promises_1.default.stat(resolvedTarget)
			if (stats.isFile()) {
				return resolvedTarget
			}
		}
	} catch {
		// Not a symlink or invalid symlink
	}
	return undefined
}
/**
 * Get all available commands from built-in, global, and project directories
 * Priority order: project > global > built-in (later sources override earlier ones)
 */
async function getCommands(cwd) {
	const commands = new Map()
	// Add built-in commands first (lowest priority)
	const builtInCommands = await (0, built_in_commands_1.getBuiltInCommands)()
	for (const command of builtInCommands) {
		commands.set(command.name, command)
	}
	// Scan global commands (override built-in)
	const globalDir = path.join((0, ali_config_1.getGlobalAliDirectory)(), "commands")
	await scanCommandDirectory(globalDir, "global", commands)
	// Scan project commands (highest priority - override both global and built-in)
	const projectDir = path.join((0, ali_config_1.getProjectAliDirectoryForCwd)(cwd), "commands")
	await scanCommandDirectory(projectDir, "project", commands)
	return Array.from(commands.values())
}
/**
 * Get a specific command by name (optimized to avoid scanning all commands)
 * Priority order: project > global > built-in
 */
async function getCommand(cwd, name) {
	// Try to find the command directly without scanning all commands
	const projectDir = path.join((0, ali_config_1.getProjectAliDirectoryForCwd)(cwd), "commands")
	const globalDir = path.join((0, ali_config_1.getGlobalAliDirectory)(), "commands")
	// Check project directory first (highest priority)
	const projectCommand = await tryLoadCommand(projectDir, name, "project")
	if (projectCommand) {
		return projectCommand
	}
	// Check global directory if not found in project
	const globalCommand = await tryLoadCommand(globalDir, name, "global")
	if (globalCommand) {
		return globalCommand
	}
	// Check built-in commands if not found in project or global (lowest priority)
	return await (0, built_in_commands_1.getBuiltInCommand)(name)
}
/**
 * Try to load a specific command from a directory (supports symlinks)
 */
async function tryLoadCommand(dirPath, name, source) {
	try {
		const stats = await promises_1.default.stat(dirPath)
		if (!stats.isDirectory()) {
			return undefined
		}
		// Try to find the command file directly
		const commandFileName = `${name}.md`
		const filePath = path.join(dirPath, commandFileName)
		// Check if this is a regular file first
		let resolvedPath = filePath
		let content
		try {
			content = await promises_1.default.readFile(filePath, "utf-8")
		} catch {
			// File doesn't exist or can't be read - try resolving as symlink
			const symlinkedPath = await tryResolveSymlinkedCommand(filePath)
			if (symlinkedPath) {
				try {
					content = await promises_1.default.readFile(symlinkedPath, "utf-8")
					resolvedPath = symlinkedPath
				} catch {
					// Symlink target can't be read
					return undefined
				}
			} else {
				return undefined
			}
		}
		if (!content) {
			return undefined
		}
		let parsed
		let description
		let argumentHint
		let mode
		let commandContent
		try {
			// Try to parse frontmatter with gray-matter
			parsed = (0, gray_matter_1.default)(content)
			description =
				typeof parsed.data.description === "string" && parsed.data.description.trim()
					? parsed.data.description.trim()
					: undefined
			argumentHint =
				typeof parsed.data["argument-hint"] === "string" && parsed.data["argument-hint"].trim()
					? parsed.data["argument-hint"].trim()
					: undefined
			mode = typeof parsed.data.mode === "string" && parsed.data.mode.trim() ? parsed.data.mode.trim() : undefined
			commandContent = parsed.content.trim()
		} catch {
			// If frontmatter parsing fails, treat the entire content as command content
			description = undefined
			argumentHint = undefined
			mode = undefined
			commandContent = content.trim()
		}
		return {
			name,
			content: commandContent,
			source,
			filePath: resolvedPath,
			description,
			argumentHint,
			mode,
		}
	} catch {
		// Directory doesn't exist or can't be read
		return undefined
	}
}
/**
 * Get command names for autocomplete
 */
async function getCommandNames(cwd) {
	const commands = await getCommands(cwd)
	return commands.map((cmd) => cmd.name)
}
/**
 * Scan a specific command directory (supports symlinks)
 */
async function scanCommandDirectory(dirPath, source, commands) {
	try {
		const stats = await promises_1.default.stat(dirPath)
		if (!stats.isDirectory()) {
			return
		}
		const entries = await promises_1.default.readdir(dirPath, { withFileTypes: true })
		// Collect all command files, including those from symlinks
		const fileInfo = []
		const initialPromises = []
		for (const entry of entries) {
			initialPromises.push(resolveCommandDirectoryEntry(entry, dirPath, fileInfo, 0))
		}
		// Wait for all files to be resolved
		await Promise.all(initialPromises)
		// Process each collected file
		for (const { originalPath, resolvedPath } of fileInfo) {
			// Command name comes from the original path (symlink name if symlinked)
			const commandName = getCommandNameFromFile(path.basename(originalPath))
			try {
				const content = await promises_1.default.readFile(resolvedPath, "utf-8")
				let parsed
				let description
				let argumentHint
				let mode
				let commandContent
				try {
					// Try to parse frontmatter with gray-matter
					parsed = (0, gray_matter_1.default)(content)
					description =
						typeof parsed.data.description === "string" && parsed.data.description.trim()
							? parsed.data.description.trim()
							: undefined
					argumentHint =
						typeof parsed.data["argument-hint"] === "string" && parsed.data["argument-hint"].trim()
							? parsed.data["argument-hint"].trim()
							: undefined
					mode =
						typeof parsed.data.mode === "string" && parsed.data.mode.trim()
							? parsed.data.mode.trim()
							: undefined
					commandContent = parsed.content.trim()
				} catch {
					// If frontmatter parsing fails, treat the entire content as command content
					description = undefined
					argumentHint = undefined
					mode = undefined
					commandContent = content.trim()
				}
				// Project commands override global ones
				if (source === "project" || !commands.has(commandName)) {
					commands.set(commandName, {
						name: commandName,
						content: commandContent,
						source,
						filePath: resolvedPath,
						description,
						argumentHint,
						mode,
					})
				}
			} catch (error) {
				console.warn(`Failed to read command file ${resolvedPath}:`, error)
			}
		}
	} catch {
		// Directory doesn't exist or can't be read - this is fine
	}
}
/**
 * Extract command name from filename (strip .md extension only)
 */
function getCommandNameFromFile(filename) {
	if (filename.toLowerCase().endsWith(".md")) {
		return filename.slice(0, -3)
	}
	return filename
}
/**
 * Check if a file is a markdown file
 */
function isMarkdownFile(filename) {
	return filename.toLowerCase().endsWith(".md")
}
