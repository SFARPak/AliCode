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
exports.getWorkspacePathForContext = exports.getWorkspacePath = exports.toRelativePath = void 0
exports.arePathsEqual = arePathsEqual
exports.getReadablePath = getReadablePath
const path = __importStar(require("path"))
const os_1 = __importDefault(require("os"))
const vscode = __importStar(require("vscode"))
/*
The Node.js 'path' module resolves and normalizes paths differently depending on the platform:
- On Windows, it uses backslashes (\) as the default path separator.
- On POSIX-compliant systems (Linux, macOS), it uses forward slashes (/) as the default path separator.

While modules like 'upath' can be used to normalize paths to use forward slashes consistently,
this can create inconsistencies when interfacing with other modules (like vscode.fs) that use
backslashes on Windows.

Our approach:
1. We present paths with forward slashes to the AI and user for consistency.
2. We use the 'arePathsEqual' function for safe path comparisons.
3. Internally, Node.js gracefully handles both backslashes and forward slashes.

This strategy ensures consistent path presentation while leveraging Node.js's built-in
path handling capabilities across different platforms.

Note: When interacting with the file system or VS Code APIs, we still use the native path module
to ensure correct behavior on all platforms. The toPosixPath and arePathsEqual functions are
primarily used for presentation and comparison purposes, not for actual file system operations.

Observations:
- macOS isn't so flexible with mixed separators, whereas Windows can handle both. ("Node.js does automatically handle path separators on Windows, converting forward slashes to backslashes as needed. However, on macOS and other Unix-like systems, the path separator is always a forward slash (/), and backslashes are treated as regular characters.")
*/
function toPosixPath(p) {
	// Extended-Length Paths in Windows start with "\\?\" to allow longer paths and bypass usual parsing. If detected, we return the path unmodified to maintain functionality, as altering these paths could break their special syntax.
	const isExtendedLengthPath = p.startsWith("\\\\?\\")
	if (isExtendedLengthPath) {
		return p
	}
	return p.replace(/\\/g, "/")
}
String.prototype.toPosix = function () {
	return toPosixPath(this)
}
// Safe path comparison that works across different platforms
function arePathsEqual(path1, path2) {
	if (!path1 && !path2) {
		return true
	}
	if (!path1 || !path2) {
		return false
	}
	path1 = normalizePath(path1)
	path2 = normalizePath(path2)
	if (process.platform === "win32") {
		return path1.toLowerCase() === path2.toLowerCase()
	}
	return path1 === path2
}
function normalizePath(p) {
	// normalize resolve ./.. segments, removes duplicate slashes, and standardizes path separators
	let normalized = path.normalize(p)
	// however it doesn't remove trailing slashes
	// remove trailing slash, except for root paths
	if (normalized.length > 1 && (normalized.endsWith("/") || normalized.endsWith("\\"))) {
		normalized = normalized.slice(0, -1)
	}
	return normalized
}
function getReadablePath(cwd, relPath) {
	// If relPath is undefined, return empty string instead of allowing path.resolve
	// to return cwd (which would then show misleading cwd basename in UI)
	if (relPath === undefined) {
		return ""
	}
	// path.resolve is flexible in that it will resolve relative paths like '../../' to the cwd and even ignore the cwd if the relPath is actually an absolute path
	const absolutePath = path.resolve(cwd, relPath)
	if (arePathsEqual(cwd, path.join(os_1.default.homedir(), "Desktop"))) {
		// User opened vscode without a workspace, so cwd is the Desktop. Show the full absolute path to keep the user aware of where files are being created
		return absolutePath.toPosix()
	}
	if (arePathsEqual(path.normalize(absolutePath), path.normalize(cwd))) {
		return path.basename(absolutePath).toPosix()
	} else {
		// show the relative path to the cwd
		const normalizedRelPath = path.relative(cwd, absolutePath)
		if (absolutePath.includes(cwd)) {
			return normalizedRelPath.toPosix()
		} else {
			// we are outside the cwd, so show the absolute path (useful for when cline passes in '../../' for example)
			return absolutePath.toPosix()
		}
	}
}
const toRelativePath = (filePath, cwd) => {
	const relativePath = path.relative(cwd, filePath).toPosix()
	return filePath.endsWith("/") ? relativePath + "/" : relativePath
}
exports.toRelativePath = toRelativePath
const getWorkspacePath = (defaultCwdPath = "") => {
	const cwdPath = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath).at(0) || defaultCwdPath
	const currentFileUri = vscode.window.activeTextEditor?.document.uri
	if (currentFileUri) {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentFileUri)
		return workspaceFolder?.uri.fsPath || cwdPath
	}
	return cwdPath
}
exports.getWorkspacePath = getWorkspacePath
const getWorkspacePathForContext = (contextPath) => {
	// If context path provided, find its workspace
	if (contextPath) {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(contextPath))
		if (workspaceFolder) {
			return workspaceFolder.uri.fsPath
		}
		// Debug logging when falling back
		console.debug(`[CodeIndex] No workspace found for context path: ${contextPath}, falling back to default`)
	}
	// Fall back to current behavior
	return (0, exports.getWorkspacePath)()
}
exports.getWorkspacePathForContext = getWorkspacePathForContext
