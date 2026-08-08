import fs from "fs/promises"
import { constants as fsConstants } from "fs"
import path from "path"

// Security: Allowlist of approved shell executables to prevent arbitrary command execution
const SHELL_ALLOWLIST = new Set<string>([
	// Windows PowerShell variants
	"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
	"C:\\Program Files\\PowerShell\\7\\pwsh.exe",
	"C:\\Program Files\\PowerShell\\6\\pwsh.exe",
	"C:\\Program Files\\PowerShell\\5\\pwsh.exe",

	// Windows Command Prompt
	"C:\\Windows\\System32\\cmd.exe",

	// Windows WSL
	"C:\\Windows\\System32\\wsl.exe",

	// Git Bash on Windows
	"C:\\Program Files\\Git\\bin\\bash.exe",
	"C:\\Program Files\\Git\\usr\\bin\\bash.exe",
	"C:\\Program Files (x86)\\Git\\bin\\bash.exe",
	"C:\\Program Files (x86)\\Git\\usr\\bin\\bash.exe",

	// Unix/Linux/macOS - Bourne-compatible shells
	"/bin/sh",
	"/usr/bin/sh",
	"/bin/bash",
	"/usr/bin/bash",
	"/usr/local/bin/bash",
	"/opt/homebrew/bin/bash",
	"/opt/local/bin/bash",

	// Z Shell
	"/bin/zsh",
	"/usr/bin/zsh",
	"/usr/local/bin/zsh",
	"/opt/homebrew/bin/zsh",
	"/opt/local/bin/zsh",

	// Dash
	"/bin/dash",
	"/usr/bin/dash",

	// Fish Shell
	"/usr/bin/fish",
	"/usr/local/bin/fish",
	"/opt/homebrew/bin/fish",
	"/opt/local/bin/fish",
])

export type TerminalShellValidationResult =
	| {
			valid: true
			shellPath: string
	  }
	| {
			valid: false
			reason: string
	  }

function isShellAllowed(shellPath: string): boolean {
	if (!shellPath) return false

	const normalizedPath = path.normalize(shellPath)

	// Direct lookup first
	if (SHELL_ALLOWLIST.has(normalizedPath)) {
		return true
	}

	// On Windows, try case-insensitive comparison
	if (process.platform === "win32") {
		const lowerPath = normalizedPath.toLowerCase()
		for (const allowedPath of SHELL_ALLOWLIST) {
			if (allowedPath.toLowerCase() === lowerPath) {
				return true
			}
		}
	}

	return false
}

export async function validateTerminalShellPath(rawShellPath: string): Promise<TerminalShellValidationResult> {
	const shellPath = rawShellPath.trim()

	if (!shellPath) {
		return { valid: false, reason: "shell path cannot be empty" }
	}

	if (!path.isAbsolute(shellPath)) {
		return { valid: false, reason: "shell path must be absolute" }
	}

	try {
		const stats = await fs.stat(shellPath)

		if (!stats.isFile()) {
			return { valid: false, reason: "shell path must point to a file" }
		}

		if (process.platform !== "win32") {
			await fs.access(shellPath, fsConstants.X_OK)
		}
	} catch {
		return {
			valid: false,
			reason:
				process.platform === "win32"
					? "shell path does not exist or is not a file"
					: "shell path does not exist, is not a file, or is not executable",
		}
	}

	if (!isShellAllowed(shellPath)) {
		return { valid: false, reason: "shell path is not in the allowlist of approved shells" }
	}

	return { valid: true, shellPath }
}
