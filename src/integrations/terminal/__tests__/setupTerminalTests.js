"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
// setupTerminalTests.ts
const child_process_1 = require("child_process")
/**
 * Check if PowerShell Core (pwsh) is available on the system
 */
function isPowerShellCoreAvailable() {
	try {
		;(0, child_process_1.execSync)("pwsh -Command \"Write-Host 'PowerShell Core is available'\"", {
			stdio: "pipe",
		})
		return true
	} catch (error) {
		return false
	}
}
// Detect environment capabilities
const hasPwsh = isPowerShellCoreAvailable()
// Set global flags for tests to use
global.__TEST_ENV__ = {
	platform: process.platform,
	isPowerShellAvailable: hasPwsh,
}
// Dynamically enable/disable PowerShell tests based on availability
if (hasPwsh) {
	// If PowerShell is available, we could set an environment variable
	// that Jest can use to determine which tests to run
	process.env.PWSH_AVAILABLE = "true"
	// Note: Directly modifying Jest config at runtime is challenging
	// It's better to use environment variables and check them in your test files
	// or use Jest's condition-based skipping (it.skip, describe.skip)
}
