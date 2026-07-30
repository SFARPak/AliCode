"use strict"
/**
 * Worktree Handlers
 *
 * VSCode-specific handlers that bridge webview messages to the core worktree services.
 * These handlers handle VSCode-specific logic like opening folders and managing state.
 */
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
exports.handleListWorktrees = handleListWorktrees
exports.handleCreateWorktree = handleCreateWorktree
exports.handleDeleteWorktree = handleDeleteWorktree
exports.handleSwitchWorktree = handleSwitchWorktree
exports.handleGetAvailableBranches = handleGetAvailableBranches
exports.handleGetWorktreeDefaults = handleGetWorktreeDefaults
exports.handleGetWorktreeIncludeStatus = handleGetWorktreeIncludeStatus
exports.handleCheckBranchWorktreeInclude = handleCheckBranchWorktreeInclude
exports.handleCreateWorktreeInclude = handleCreateWorktreeInclude
exports.handleCheckoutBranch = handleCheckoutBranch
const vscode = __importStar(require("vscode"))
const path = __importStar(require("path"))
const os = __importStar(require("os"))
const core_1 = require("@ali-code/core")
/**
 * Generate a random alphanumeric suffix for branch/folder names.
 */
function generateRandomSuffix(length = 5) {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	let result = ""
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}
async function isWorkspaceSubfolder(cwd) {
	const gitRoot = await core_1.worktreeService.getGitRootPath(cwd)
	if (!gitRoot) {
		return false
	}
	// Normalize paths for comparison.
	const normalizedCwd = path.normalize(cwd)
	const normalizedGitRoot = path.normalize(gitRoot)
	// If cwd is deeper than git root, it's a subfolder.
	return normalizedCwd !== normalizedGitRoot && normalizedCwd.startsWith(normalizedGitRoot)
}
async function handleListWorktrees(provider) {
	const workspaceFolders = vscode.workspace.workspaceFolders
	const isMultiRoot = workspaceFolders ? workspaceFolders.length > 1 : false
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return {
			worktrees: [],
			isGitRepo: false,
			isMultiRoot: false,
			isSubfolder: false,
			gitRootPath: "",
			error: "No workspace folder open",
		}
	}
	// Multi-root workspaces not supported for worktrees.
	if (isMultiRoot) {
		return {
			worktrees: [],
			isGitRepo: false,
			isMultiRoot: true,
			isSubfolder: false,
			gitRootPath: "",
			error: "Worktrees are not supported in multi-root workspaces",
		}
	}
	const cwd = provider.cwd
	const isGitRepo = await core_1.worktreeService.checkGitRepo(cwd)
	if (!isGitRepo) {
		return {
			worktrees: [],
			isGitRepo: false,
			isMultiRoot: false,
			isSubfolder: false,
			gitRootPath: "",
			error: "Not a git repository",
		}
	}
	const isSubfolder = await isWorkspaceSubfolder(cwd)
	const gitRootPath = (await core_1.worktreeService.getGitRootPath(cwd)) || ""
	if (isSubfolder) {
		return {
			worktrees: [],
			isGitRepo: true,
			isMultiRoot: false,
			isSubfolder: true,
			gitRootPath,
			error: "Worktrees are not supported when workspace is a subfolder of a git repository",
		}
	}
	try {
		const worktrees = await core_1.worktreeService.listWorktrees(cwd)
		return {
			worktrees,
			isGitRepo: true,
			isMultiRoot: false,
			isSubfolder: false,
			gitRootPath,
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		return {
			worktrees: [],
			isGitRepo: true,
			isMultiRoot: false,
			isSubfolder: false,
			gitRootPath,
			error: `Failed to list worktrees: ${errorMessage}`,
		}
	}
}
async function handleCreateWorktree(provider, options, onCopyProgress) {
	const cwd = provider.cwd
	const isGitRepo = await core_1.worktreeService.checkGitRepo(cwd)
	if (!isGitRepo) {
		return {
			success: false,
			message: "Not a git repository",
		}
	}
	const result = await core_1.worktreeService.createWorktree(cwd, options)
	// If successful and .worktreeinclude exists, copy the files.
	if (result.success && result.worktree) {
		try {
			const copiedItems = await core_1.worktreeIncludeService.copyWorktreeIncludeFiles(
				cwd,
				result.worktree.path,
				onCopyProgress,
			)
			if (copiedItems.length > 0) {
				result.message += ` (copied ${copiedItems.length} item(s) from .worktreeinclude)`
			}
		} catch (error) {
			// Log but don't fail the worktree creation.
			provider.log(`Warning: Failed to copy .worktreeinclude files: ${error}`)
		}
	}
	return result
}
async function handleDeleteWorktree(provider, worktreePath, force = false) {
	const cwd = provider.cwd
	return core_1.worktreeService.deleteWorktree(cwd, worktreePath, force)
}
async function handleSwitchWorktree(provider, worktreePath, newWindow) {
	try {
		const worktreeUri = vscode.Uri.file(worktreePath)
		if (newWindow) {
			// Set the auto-open path so the new window opens AliCode sidebar.
			await provider.contextProxy.setValue("worktreeAutoOpenPath", worktreePath)
			// Open in new window.
			await vscode.commands.executeCommand("vscode.openFolder", worktreeUri, { forceNewWindow: true })
		} else {
			// For current window, we need to flush pending state first since window will reload.
			await provider.contextProxy.setValue("worktreeAutoOpenPath", worktreePath)
			// Open in current window (this will reload the window).
			await vscode.commands.executeCommand("vscode.openFolder", worktreeUri, { forceNewWindow: false })
		}
		return {
			success: true,
			message: `Opened worktree at ${worktreePath}`,
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		return {
			success: false,
			message: `Failed to switch worktree: ${errorMessage}`,
		}
	}
}
async function handleGetAvailableBranches(provider) {
	const cwd = provider.cwd
	// Include branches already in worktrees since we use this for base branch selection
	return core_1.worktreeService.getAvailableBranches(cwd, true)
}
async function handleGetWorktreeDefaults(provider) {
	const suffix = generateRandomSuffix()
	const workspaceFolders = vscode.workspace.workspaceFolders
	const projectName = workspaceFolders?.[0]?.name || "project"
	const dotRooPath = path.join(os.homedir(), ".ali")
	const suggestedPath = path.join(dotRooPath, "worktrees", `${projectName}-${suffix}`)
	return {
		suggestedBranch: `worktree/roo-${suffix}`,
		suggestedPath,
	}
}
async function handleGetWorktreeIncludeStatus(provider) {
	const cwd = provider.cwd
	return core_1.worktreeIncludeService.getStatus(cwd)
}
async function handleCheckBranchWorktreeInclude(provider, branch) {
	const cwd = provider.cwd
	return core_1.worktreeIncludeService.branchHasWorktreeInclude(cwd, branch)
}
async function handleCreateWorktreeInclude(provider, content) {
	const cwd = provider.cwd
	try {
		await core_1.worktreeIncludeService.createWorktreeInclude(cwd, content)
		// Open the file in the editor for easy editing
		try {
			const filePath = path.join(cwd, ".worktreeinclude")
			const document = await vscode.workspace.openTextDocument(filePath)
			await vscode.window.showTextDocument(document)
		} catch {
			// Opening the file in editor is a convenience feature - don't fail the operation
		}
		return {
			success: true,
			message: ".worktreeinclude file created",
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		return {
			success: false,
			message: `Failed to create .worktreeinclude: ${errorMessage}`,
		}
	}
}
async function handleCheckoutBranch(provider, branch) {
	const cwd = provider.cwd
	return core_1.worktreeService.checkoutBranch(cwd, branch)
}
