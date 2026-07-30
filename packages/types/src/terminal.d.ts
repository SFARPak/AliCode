import { z } from "zod"
/**
 * CommandExecutionStatus
 */
export declare const commandExecutionStatusSchema: z.ZodDiscriminatedUnion<
	"status",
	[
		z.ZodObject<
			{
				executionId: z.ZodString
				status: z.ZodLiteral<"started">
				pid: z.ZodOptional<z.ZodNumber>
				command: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				command: string
				status: "started"
				executionId: string
				pid?: number | undefined
			},
			{
				command: string
				status: "started"
				executionId: string
				pid?: number | undefined
			}
		>,
		z.ZodObject<
			{
				executionId: z.ZodString
				status: z.ZodLiteral<"output">
				output: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				status: "output"
				output: string
				executionId: string
			},
			{
				status: "output"
				output: string
				executionId: string
			}
		>,
		z.ZodObject<
			{
				executionId: z.ZodString
				status: z.ZodLiteral<"exited">
				exitCode: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				status: "exited"
				executionId: string
				exitCode?: number | undefined
			},
			{
				status: "exited"
				executionId: string
				exitCode?: number | undefined
			}
		>,
		z.ZodObject<
			{
				executionId: z.ZodString
				status: z.ZodLiteral<"fallback">
			},
			"strip",
			z.ZodTypeAny,
			{
				status: "fallback"
				executionId: string
			},
			{
				status: "fallback"
				executionId: string
			}
		>,
		z.ZodObject<
			{
				executionId: z.ZodString
				status: z.ZodLiteral<"timeout">
			},
			"strip",
			z.ZodTypeAny,
			{
				status: "timeout"
				executionId: string
			},
			{
				status: "timeout"
				executionId: string
			}
		>,
	]
>
export type CommandExecutionStatus = z.infer<typeof commandExecutionStatusSchema>
/**
 * PersistedCommandOutput
 *
 * Represents the result of a terminal command execution that may have been
 * truncated and persisted to disk.
 *
 * When command output exceeds the configured preview threshold, the full
 * output is saved to a disk artifact file. The LLM receives this structure
 * which contains:
 * - A preview of the output (for immediate display in context)
 * - Metadata about the full output (size, truncation status)
 * - A path to the artifact file for later retrieval via `read_command_output`
 *
 * ## Usage in execute_command Response
 *
 * The response format depends on whether truncation occurred:
 *
 * **Not truncated** (output fits in preview):
 * ```json
 * {
 *   "preview": "full output here...",
 *   "totalBytes": 1234,
 *   "artifactPath": null,
 *   "truncated": false
 * }
 * ```
 *
 * **Truncated** (output exceeded threshold):
 * ```json
 * {
 *   "preview": "first 4KB of output...",
 *   "totalBytes": 1048576,
 *   "artifactPath": "/path/to/tasks/123/command-output/cmd-1706119234567.txt",
 *   "truncated": true
 * }
 * ```
 *
 * @see OutputInterceptor - Creates these results during command execution
 * @see ReadCommandOutputTool - Retrieves full content from artifact files
 */
export interface PersistedCommandOutput {
	/**
	 * Preview of the command output, truncated to the preview threshold.
	 * Always contains the beginning of the output, even if truncated.
	 */
	preview: string
	/**
	 * Total size of the command output in bytes.
	 * Useful for determining if additional reads are needed.
	 */
	totalBytes: number
	/**
	 * Absolute path to the artifact file containing full output.
	 * `null` if output wasn't truncated (no artifact was created).
	 */
	artifactPath: string | null
	/**
	 * Whether the output was truncated (exceeded preview threshold).
	 * When `true`, use `read_command_output` to retrieve full content.
	 */
	truncated: boolean
}
//# sourceMappingURL=terminal.d.ts.map
