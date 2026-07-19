import { z } from "zod"

/**
 * SandboxPolicy - OS-level sandbox confinement settings
 */
export const sandboxPolicySchema = z.object({
	/** Whether sandboxing is active */
	enabled: z.boolean().default(false),
	/** Network restriction policy */
	network: z.enum(["allow", "deny"]).default("allow"),
	/** Filesystem write allowlist relative to workspace root */
	allowedWritePaths: z.array(z.string()).default(["."]),
	/** Denied filesystem paths */
	deniedPaths: z.array(z.string()).default([".git", "node_modules"]),
})
export type SandboxPolicy = z.infer<typeof sandboxPolicySchema>

/**
 * SandboxStatus - current sandbox state for a session
 */
export const sandboxStatusSchema = z.object({
	enabled: z.boolean(),
	networkRestricted: z.boolean(),
	platform: z.enum(["macos", "linux", "windows", "unsupported"]),
	profile: z.string().optional(),
	isSupported: z.boolean(),
})
export type SandboxStatus = z.infer<typeof sandboxStatusSchema>
