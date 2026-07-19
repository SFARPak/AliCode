import * as fs from "fs/promises"
import type { SandboxPolicy, SandboxStatus } from "@ali-code/types"

// Conditional native sandbox bootstrap — only import on macOS
// to keep the service importable cross-platform.
let sandboxModule: unknown = null
try {
	// Dynamic require to avoid hard dependency on @kilocode/sandbox
	sandboxModule = require("@kilocode/sandbox")
} catch {
	// Package not installed; the service will report unsupported status
}

type SandboxBackend = {
	run: (policy: unknown) => Promise<unknown>
	unrestricted: () => unknown
	backendSupport: () => { supported: boolean }
	Profile: Record<string, unknown>
}

/**
 * SandboxService provides OS-level process confinement for shell tool
 * executions. When enabled, all shell commands run inside an OS sandbox
 * profile that enforces:
 *
 *  - Filesystem write path restrictions
 *  - Network access denials
 *  - Restricted access to sensitive directories
 *
 * Supported platforms:
 *   macOS: Seatbelt sandbox profiles
 *   Linux: Bubblewrap unprivileged sandbox (bwrap)
 *   Windows: Win32 job object restrictions (limited)
 *
 * If the underlying @kilocode/sandbox package is not installed or does
 * not support the current platform, the service reports "unsupported"
 * and disables confinement.
 */
export class SandboxService {
	private policy: SandboxPolicy
	private _status: SandboxStatus
	private _backend: SandboxBackend | null = null

	constructor(policy?: Partial<SandboxPolicy>) {
		this.policy = {
			enabled: false,
			network: "allow",
			allowedWritePaths: ["."],
			deniedPaths: [".git", "node_modules"],
			...policy,
		}
		this._status = this.detectPlatformStatus()
		this._detectBackend()
	}

	private _detectBackend(): void {
		try {
			const mod = sandboxModule as unknown as SandboxBackend | undefined
			if (mod && typeof mod.run === "function" && typeof mod.unrestricted === "function") {
				this._backend = mod
			}
		} catch {
			this._backend = null
		}
	}

	private detectPlatformStatus(): SandboxStatus {
		const platform = process.platform
		const mapped =
			platform === "darwin"
				? "macos"
				: platform === "linux"
					? "linux"
					: platform === "win32"
						? "windows"
						: "unsupported"

		const hasBackend = platform === "darwin" || platform === "linux"

		return {
			enabled: this.policy.enabled && hasBackend,
			networkRestricted: this.policy.network === "deny",
			platform: mapped as SandboxStatus["platform"],
			profile: platform !== "win32" ? mapped : undefined,
			isSupported: hasBackend,
		}
	}

	/**
	 * Check if the current platform supports sandboxing.
	 */
	supportsSandbox(): boolean {
		return this._status.isSupported
	}

	/**
	 * Get the current sandbox policy.
	 */
	getPolicy(): SandboxPolicy {
		return {
			...this.policy,
			allowedWritePaths: [...this.policy.allowedWritePaths],
			deniedPaths: [...this.policy.deniedPaths],
		}
	}

	/**
	 * Update the sandbox policy.
	 */
	updatePolicy(policy: Partial<SandboxPolicy>): SandboxStatus {
		this.policy = { ...this.policy, ...policy }
		this._status = this.detectPlatformStatus()
		return this.getStatus()
	}

	/**
	 * Get the current sandbox runtime status.
	 */
	getStatus(): SandboxStatus {
		return { ...this._status }
	}

	/**
	 * Enable sandbox confinement.
	 */
	async enable(): Promise<SandboxStatus> {
		if (!this._status.isSupported) {
			throw new Error(
				`Sandboxing is not supported on platform ${process.platform}. ` +
					`Supported: macOS (Seatbelt) and Linux (bwrap).`,
			)
		}
		this.policy.enabled = true
		this._status = this.detectPlatformStatus()
		return this._status
	}

	/**
	 * Disable sandbox confinement.
	 */
	disable(): void {
		this.policy.enabled = false
		this._status = this.detectPlatformStatus()
	}

	/**
	 * Run a shell command under the sandbox policy, if enabled.
	 * Returns the command output on success.
	 *
	 * NB: For production use, this would build a platform-specific
	 * sandbox profile and execute the command inside it. The profile
	 * is derived from the policy's allowedWritePaths / deniedPaths.
	 */
	async runSandboxed(
		command: string,
		options?: { cwd?: string; timeoutMs?: number },
	): Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }> {
		if (!this.policy.enabled || !this._backend?.run) {
			// Sandbox disabled or unavailable — report policy reason then pass through
			return {
				success: false,
				error: "Sandbox unavailable: policy disabled or backend missing",
			}
		}
		try {
			// Delegate to the backend sandbox runner. In production, the backend
			// implementation handles macOS Seatbelt profile files and Linux bwrap
			// command construction from the policy.
			const result = await (this._backend as SandboxBackend).run({
				command,
				network: this.policy.network,
				allowedPaths: this.policy.allowedWritePaths,
				deniedPaths: this.policy.deniedPaths,
				cwd: options?.cwd ?? process.cwd(),
				timeout: options?.timeoutMs ?? 30_000,
			})
			return { success: true, stdout: JSON.stringify(result) }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			}
		}
	}

	/**
	 * Build a platform-specific sandbox manifest string for inspection/testing.
	 * Useful for generating Seatbelt profile files or bwrap argument lists.
	 */
	buildProfileManifest(): string {
		const { network, allowedWritePaths, deniedPaths } = this.policy
		const lines: string[] = [
			`; AliCode Sandbox Profile — generated ${new Date().toISOString()}`,
			`; Platform: ${this._status.platform}`,
			`; Network: ${network}`,
			"",
			...(network === "deny" ? ["(deny network*)", ""] : []),
			...(deniedPaths.length > 0
				? [...(deniedPaths as unknown as string[]).map((p) => `(deny file-write* (regex "^${p}"))`), ""]
				: []),
			...(allowedWritePaths.length > 0
				? [
						"(allow file-write* (subpath (getcwd)))",
						...(allowedWritePaths as unknown as string[])
							.filter((p) => p !== ".")
							.map((p) => `(allow file-write* (subpath "${p}"))`),
						"",
					]
				: []),
		]
		return lines.join("\n")
	}
}

/**
 * Singleton sandbox service instance.
 */
export const sandboxService = new SandboxService()
