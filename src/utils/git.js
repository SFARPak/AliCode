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
exports.getGitRepositoryInfo = getGitRepositoryInfo
exports.convertGitUrlToHttps = convertGitUrlToHttps
exports.sanitizeGitUrl = sanitizeGitUrl
exports.extractRepositoryName = extractRepositoryName
exports.getWorkspaceGitInfo = getWorkspaceGitInfo
exports.checkGitInstalled = checkGitInstalled
exports.searchCommits = searchCommits
exports.getCommitInfo = getCommitInfo
exports.getWorkingState = getWorkingState
exports.getGitStatus = getGitStatus
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
const fs_1 = require("fs")
const child_process_1 = require("child_process")
const util_1 = require("util")
const extract_text_1 = require("../integrations/misc/extract-text")
const execAsync = (0, util_1.promisify)(child_process_1.exec)
const GIT_OUTPUT_LINE_LIMIT = 500
/**
 * Extracts git repository information from the workspace's .git directory
 * @param workspaceRoot The root path of the workspace
 * @returns Git repository information or empty object if not a git repository
 */
async function getGitRepositoryInfo(workspaceRoot) {
	try {
		const gitDir = path.join(workspaceRoot, ".git")
		// Check if .git directory exists
		try {
			await fs_1.promises.access(gitDir)
		} catch {
			// Not a git repository
			return {}
		}
		const gitInfo = {}
		// Try to read git config file
		try {
			const configPath = path.join(gitDir, "config")
			const configContent = await fs_1.promises.readFile(configPath, "utf8")
			// Very simple approach - just find any URL line
			const urlMatch = configContent.match(/url\s*=\s*(.+?)(?:\r?\n|$)/m)
			if (urlMatch && urlMatch[1]) {
				const url = urlMatch[1].trim()
				// Sanitize the URL and convert to HTTPS format
				gitInfo.repositoryUrl = convertGitUrlToHttps(sanitizeGitUrl(url))
				const repositoryName = extractRepositoryName(url)
				if (repositoryName) {
					gitInfo.repositoryName = repositoryName
				}
			}
			// Extract default branch (if available)
			const branchMatch = configContent.match(/\[branch "([^"]+)"\]/i)
			if (branchMatch && branchMatch[1]) {
				gitInfo.defaultBranch = branchMatch[1]
			}
		} catch (error) {
			// Ignore config reading errors
		}
		// Try to read HEAD file to get current branch
		if (!gitInfo.defaultBranch) {
			try {
				const headPath = path.join(gitDir, "HEAD")
				const headContent = await fs_1.promises.readFile(headPath, "utf8")
				const branchMatch = headContent.match(/ref: refs\/heads\/(.+)/)
				if (branchMatch && branchMatch[1]) {
					gitInfo.defaultBranch = branchMatch[1].trim()
				}
			} catch (error) {
				// Ignore HEAD reading errors
			}
		}
		return gitInfo
	} catch (error) {
		// Return empty object on any error
		return {}
	}
}
/**
 * Converts a git URL to HTTPS format
 * @param url The git URL to convert
 * @returns The URL in HTTPS format, or the original URL if conversion is not possible
 */
function convertGitUrlToHttps(url) {
	try {
		// Already HTTPS, just return it
		if (url.startsWith("https://")) {
			return url
		}
		// Handle SSH format: git@github.com:user/repo.git -> https://github.com/user/repo.git
		if (url.startsWith("git@")) {
			const match = url.match(/git@([^:]+):(.+)/)
			if (match && match.length === 3) {
				const [, host, path] = match
				return `https://${host}/${path}`
			}
		}
		// Handle SSH with protocol: ssh://git@github.com/user/repo.git -> https://github.com/user/repo.git
		if (url.startsWith("ssh://")) {
			const match = url.match(/ssh:\/\/(?:git@)?([^\/]+)\/(.+)/)
			if (match && match.length === 3) {
				const [, host, path] = match
				return `https://${host}/${path}`
			}
		}
		// Return original URL if we can't convert it
		return url
	} catch {
		// If parsing fails, return original
		return url
	}
}
/**
 * Sanitizes a git URL to remove sensitive information like tokens
 * @param url The original git URL
 * @returns Sanitized URL
 */
function sanitizeGitUrl(url) {
	try {
		// Remove credentials from HTTPS URLs
		if (url.startsWith("https://")) {
			const urlObj = new URL(url)
			// Remove username and password
			urlObj.username = ""
			urlObj.password = ""
			return urlObj.toString()
		}
		// For SSH URLs, return as-is (they don't contain sensitive tokens)
		if (url.startsWith("git@") || url.startsWith("ssh://")) {
			return url
		}
		// For other formats, return as-is but remove any potential tokens
		return url.replace(/:[a-f0-9]{40,}@/gi, "@")
	} catch {
		// If URL parsing fails, return original (might be SSH format)
		return url
	}
}
/**
 * Extracts repository name from a git URL
 * @param url The git URL
 * @returns Repository name or undefined
 */
function extractRepositoryName(url) {
	try {
		// Handle different URL formats
		const patterns = [
			// HTTPS: https://github.com/user/repo.git -> user/repo
			/https:\/\/[^\/]+\/([^\/]+\/[^\/]+?)(?:\.git)?$/,
			// SSH: git@github.com:user/repo.git -> user/repo
			/git@[^:]+:([^\/]+\/[^\/]+?)(?:\.git)?$/,
			// SSH with user: ssh://git@github.com/user/repo.git -> user/repo
			/ssh:\/\/[^\/]+\/([^\/]+\/[^\/]+?)(?:\.git)?$/,
		]
		for (const pattern of patterns) {
			const match = url.match(pattern)
			if (match && match[1]) {
				return match[1].replace(/\.git$/, "")
			}
		}
		return ""
	} catch {
		return ""
	}
}
/**
 * Gets git repository information for the current VSCode workspace
 * @returns Git repository information or empty object if not available
 */
async function getWorkspaceGitInfo() {
	const workspaceFolders = vscode.workspace.workspaceFolders
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return {}
	}
	// Use the first workspace folder.
	const workspaceRoot = workspaceFolders[0].uri.fsPath
	return getGitRepositoryInfo(workspaceRoot)
}
async function checkGitRepo(cwd) {
	try {
		await execAsync("git rev-parse --git-dir", { cwd })
		return true
	} catch (error) {
		return false
	}
}
/**
 * Checks if Git is installed on the system by attempting to run git --version
 * @returns {Promise<boolean>} True if Git is installed and accessible, false otherwise
 * @example
 * const isGitInstalled = await checkGitInstalled();
 * if (!isGitInstalled) {
 *   console.log("Git is not installed");
 * }
 */
async function checkGitInstalled() {
	try {
		await execAsync("git --version")
		return true
	} catch (error) {
		return false
	}
}
async function searchCommits(query, cwd) {
	try {
		const isInstalled = await checkGitInstalled()
		if (!isInstalled) {
			console.error("Git is not installed")
			return []
		}
		const isRepo = await checkGitRepo(cwd)
		if (!isRepo) {
			console.error("Not a git repository")
			return []
		}
		// Search commits by hash or message, limiting to 10 results
		const { stdout } = await execAsync(
			`git log -n 10 --format="%H%n%h%n%s%n%an%n%ad" --date=short ` + `--grep="${query}" --regexp-ignore-case`,
			{ cwd },
		)
		let output = stdout
		if (!output.trim() && /^[a-f0-9]+$/i.test(query)) {
			// If no results from grep search and query looks like a hash, try searching by hash
			const { stdout: hashStdout } = await execAsync(
				`git log -n 10 --format="%H%n%h%n%s%n%an%n%ad" --date=short ` + `--author-date-order ${query}`,
				{ cwd },
			).catch(() => ({ stdout: "" }))
			if (!hashStdout.trim()) {
				return []
			}
			output = hashStdout
		}
		const commits = []
		const lines = output
			.trim()
			.split("\n")
			.filter((line) => line !== "--")
		for (let i = 0; i < lines.length; i += 5) {
			commits.push({
				hash: lines[i],
				shortHash: lines[i + 1],
				subject: lines[i + 2],
				author: lines[i + 3],
				date: lines[i + 4],
			})
		}
		return commits
	} catch (error) {
		console.error("Error searching commits:", error)
		return []
	}
}
async function getCommitInfo(hash, cwd) {
	try {
		const isInstalled = await checkGitInstalled()
		if (!isInstalled) {
			return "Git is not installed"
		}
		const isRepo = await checkGitRepo(cwd)
		if (!isRepo) {
			return "Not a git repository"
		}
		// Get commit info, stats, and diff separately
		const { stdout: info } = await execAsync(`git show --format="%H%n%h%n%s%n%an%n%ad%n%b" --no-patch ${hash}`, {
			cwd,
		})
		const [fullHash, shortHash, subject, author, date, body] = info.trim().split("\n")
		const { stdout: stats } = await execAsync(`git show --stat --format="" ${hash}`, { cwd })
		const { stdout: diff } = await execAsync(`git show --format="" ${hash}`, { cwd })
		const summary = [
			`Commit: ${shortHash} (${fullHash})`,
			`Author: ${author}`,
			`Date: ${date}`,
			`\nMessage: ${subject}`,
			body ? `\nDescription:\n${body}` : "",
			"\nFiles Changed:",
			stats.trim(),
			"\nFull Changes:",
		].join("\n")
		const output = summary + "\n\n" + diff.trim()
		return (0, extract_text_1.truncateOutput)(output, GIT_OUTPUT_LINE_LIMIT)
	} catch (error) {
		console.error("Error getting commit info:", error)
		return `Failed to get commit info: ${error instanceof Error ? error.message : String(error)}`
	}
}
async function getWorkingState(cwd) {
	try {
		const isInstalled = await checkGitInstalled()
		if (!isInstalled) {
			return "Git is not installed"
		}
		const isRepo = await checkGitRepo(cwd)
		if (!isRepo) {
			return "Not a git repository"
		}
		// Get status of working directory
		const { stdout: status } = await execAsync("git status --short", { cwd })
		if (!status.trim()) {
			return "No changes in working directory"
		}
		// Get all changes (both staged and unstaged) compared to HEAD
		const { stdout: diff } = await execAsync("git diff HEAD", { cwd })
		const lineLimit = GIT_OUTPUT_LINE_LIMIT
		const output = `Working directory changes:\n\n${status}\n\n${diff}`.trim()
		return (0, extract_text_1.truncateOutput)(output, lineLimit)
	} catch (error) {
		console.error("Error getting working state:", error)
		return `Failed to get working state: ${error instanceof Error ? error.message : String(error)}`
	}
}
/**
 * Gets git status output with configurable file limit
 * @param cwd The working directory to check git status in
 * @param maxFiles Maximum number of file entries to include (0 = disabled)
 * @returns Git status string or null if not a git repository
 */
async function getGitStatus(cwd, maxFiles = 20) {
	try {
		const isInstalled = await checkGitInstalled()
		if (!isInstalled) {
			return null
		}
		const isRepo = await checkGitRepo(cwd)
		if (!isRepo) {
			return null
		}
		// Use porcelain v1 format with branch info
		const { stdout } = await execAsync("git status --porcelain=v1 --branch", { cwd })
		if (!stdout.trim()) {
			return null
		}
		const lines = stdout.trim().split("\n")
		// First line is always branch info (e.g., "## main...origin/main")
		const branchLine = lines[0]
		const fileLines = lines.slice(1)
		// Build output with branch info and limited file entries
		const output = [branchLine]
		if (maxFiles > 0 && fileLines.length > 0) {
			const filesToShow = fileLines.slice(0, maxFiles)
			output.push(...filesToShow)
			// Add truncation notice if needed
			if (fileLines.length > maxFiles) {
				output.push(`... ${fileLines.length - maxFiles} more files`)
			}
		}
		return output.join("\n")
	} catch (error) {
		console.error("Error getting git status:", error)
		return null
	}
}
