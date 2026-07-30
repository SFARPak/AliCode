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
Object.defineProperty(exports, "__esModule", { value: true })
exports.executeRipgrep = executeRipgrep
exports.executeRipgrepForFiles = executeRipgrepForFiles
exports.searchWorkspaceFiles = searchWorkspaceFiles
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
const fs = __importStar(require("fs"))
const childProcess = __importStar(require("child_process"))
const readline = __importStar(require("readline"))
const fzf_1 = require("fzf")
const ripgrep_1 = require("../ripgrep")
const package_1 = require("../../shared/package")
async function executeRipgrep({ args, workspacePath, limit = 500 }) {
	const rgPath = await (0, ripgrep_1.getBinPath)(vscode.env.appRoot)
	if (!rgPath) {
		throw new Error(`ripgrep not found: ${rgPath}`)
	}
	return new Promise((resolve, reject) => {
		const rgProcess = childProcess.spawn(rgPath, args)
		const rl = readline.createInterface({ input: rgProcess.stdout, crlfDelay: Infinity })
		const fileResults = []
		const dirSet = new Set() // Track unique directory paths.
		let count = 0
		rl.on("line", (line) => {
			if (count < limit) {
				try {
					const relativePath = path.relative(workspacePath, line)
					// Add the file itself.
					fileResults.push({ path: relativePath, type: "file", label: path.basename(relativePath) })
					// Extract and store all parent directory paths.
					let dirPath = path.dirname(relativePath)
					while (dirPath && dirPath !== "." && dirPath !== "/") {
						dirSet.add(dirPath)
						dirPath = path.dirname(dirPath)
					}
					count++
				} catch (error) {
					// Silently ignore errors processing individual paths.
				}
			} else {
				rl.close()
				rgProcess.kill()
			}
		})
		let errorOutput = ""
		rgProcess.stderr.on("data", (data) => {
			errorOutput += data.toString()
		})
		rl.on("close", () => {
			if (errorOutput && fileResults.length === 0) {
				reject(new Error(`ripgrep process error: ${errorOutput}`))
			} else {
				// Convert directory set to array of directory objects.
				const dirResults = Array.from(dirSet).map((dirPath) => ({
					path: dirPath,
					type: "folder",
					label: path.basename(dirPath),
				}))
				// Combine files and directories and resolve.
				resolve([...fileResults, ...dirResults])
			}
		})
		rgProcess.on("error", (error) => {
			reject(new Error(`ripgrep process error: ${error.message}`))
		})
	})
}
/**
 * Get extra ripgrep arguments based on VSCode search configuration
 */
function getRipgrepSearchOptions() {
	const config = vscode.workspace.getConfiguration("search")
	const extraArgs = []
	// Respect VSCode's search.useIgnoreFiles setting
	if (config.get("useIgnoreFiles") === false) {
		extraArgs.push("--no-ignore")
	}
	// Respect VSCode's search.useGlobalIgnoreFiles setting
	if (config.get("useGlobalIgnoreFiles") === false) {
		extraArgs.push("--no-ignore-global")
	}
	// Respect VSCode's search.useParentIgnoreFiles setting
	if (config.get("useParentIgnoreFiles") === false) {
		extraArgs.push("--no-ignore-parent")
	}
	return extraArgs
}
async function executeRipgrepForFiles(workspacePath, limit) {
	// Get limit from configuration if not provided
	const effectiveLimit =
		limit ??
		vscode.workspace.getConfiguration(package_1.Package.name).get("maximumIndexedFilesForFileSearch", 10000)
	const args = [
		"--files",
		"--follow",
		"--hidden",
		...getRipgrepSearchOptions(),
		"-g",
		"!**/node_modules/**",
		"-g",
		"!**/.git/**",
		"-g",
		"!**/out/**",
		"-g",
		"!**/dist/**",
		workspacePath,
	]
	return executeRipgrep({ args, workspacePath, limit: effectiveLimit })
}
async function searchWorkspaceFiles(query, workspacePath, limit = 20) {
	try {
		// Get all files and directories (uses configured limit)
		const allItems = await executeRipgrepForFiles(workspacePath)
		// If no query, just return the top items
		if (!query.trim()) {
			return allItems.slice(0, limit)
		}
		// Create search items for all files AND directories
		const searchItems = allItems.map((item) => ({
			original: item,
			searchStr: `${item.path} ${item.label || ""}`,
		}))
		// Run fzf search on all items
		const fzf = new fzf_1.Fzf(searchItems, {
			selector: (item) => item.searchStr,
			tiebreakers: [fzf_1.byLengthAsc],
			limit: limit,
		})
		// Get all matching results from fzf
		const fzfResults = fzf.find(query).map((result) => result.item.original)
		// Verify types of the shortest results
		const verifiedResults = await Promise.all(
			fzfResults.map(async (result) => {
				const fullPath = path.join(workspacePath, result.path)
				// Verify if the path exists and is actually a directory
				if (fs.existsSync(fullPath)) {
					const isDirectory = fs.lstatSync(fullPath).isDirectory()
					return {
						...result,
						path: result.path.toPosix(),
						type: isDirectory ? "folder" : "file",
					}
				}
				// If path doesn't exist, keep original type
				return result
			}),
		)
		return verifiedResults
	} catch (error) {
		console.error("Error in searchWorkspaceFiles:", error)
		return []
	}
}
