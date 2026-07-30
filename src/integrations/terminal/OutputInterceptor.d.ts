import { TerminalOutputPreviewSize, PersistedCommandOutput } from "@ali-code/types"
/**
 * Configuration options for creating an OutputInterceptor instance.
 */
export interface OutputInterceptorOptions {
	/** Unique identifier for this command execution (typically a timestamp) */
	executionId: string
	/** ID of the task that initiated this command */
	taskId: string
	/** The command string being executed */
	command: string
	/** Directory path where command output artifacts will be stored */
	storageDir: string
	/** Size category for the preview buffer (small/medium/large) */
	previewSize: TerminalOutputPreviewSize
}
/**
 * OutputInterceptor buffers terminal command output and spills to disk when threshold exceeded.
 *
 * This implements a "persisted output" pattern where large command outputs are saved to disk
 * files, with only a preview shown to the LLM. The LLM can then use the `read_command_output`
 * tool to retrieve full contents or search through the output.
 *
 * The interceptor uses a **head/tail buffer** strategy (inspired by Codex):
 * - 50% of the preview budget is allocated to the "head" (beginning of output)
 * - 50% of the preview budget is allocated to the "tail" (end of output)
 * - Middle content is dropped when output exceeds the preview threshold
 *
 * This approach ensures the LLM sees both:
 * - The beginning (command startup, environment info, early errors)
 * - The end (final results, exit codes, error summaries)
 *
 * @example
 * ```typescript
 * const interceptor = new OutputInterceptor({
 *   executionId: Date.now().toString(),
 *   taskId: 'task-123',
 *   command: 'npm test',
 *   storageDir: '/path/to/task/command-output',
 *   previewSize: 'medium',
 * });
 *
 * // Write output chunks as they arrive
 * interceptor.write('Running tests...\n');
 * interceptor.write('Test 1 passed\n');
 *
 * // Finalize and get the result
 * const result = interceptor.finalize();
 * // result.preview contains head + [omitted] + tail for display
 * // result.artifactPath contains path to full output if truncated
 * ```
 */
export declare class OutputInterceptor {
	private readonly options
	/** Buffer for the head (beginning) of output */
	private headBuffer
	/** Buffer for the tail (end) of output - rolling buffer that drops front when full */
	private tailBuffer
	/** Number of bytes currently in the head buffer */
	private headBytes
	/** Number of bytes currently in the tail buffer */
	private tailBytes
	/** Number of bytes omitted from the middle */
	private omittedBytes
	/**
	 * Pending chunks accumulated before spilling to disk.
	 * These contain ALL content (lossless) until we decide to spill.
	 * Once spilled, this array is cleared and subsequent writes go directly to disk.
	 */
	private pendingChunks
	private writeStream
	private artifactPath
	private totalBytes
	private spilledToDisk
	private readonly previewBytes
	/** Budget for the head buffer (50% of total preview) */
	private readonly headBudget
	/** Budget for the tail buffer (50% of total preview) */
	private readonly tailBudget
	/**
	 * Creates a new OutputInterceptor instance.
	 *
	 * @param options - Configuration options for the interceptor
	 */
	constructor(options: OutputInterceptorOptions)
	/**
	 * Write a chunk of output to the interceptor.
	 *
	 * Output is first added to the head buffer until it's full (50% of preview budget).
	 * Subsequent output goes to a rolling tail buffer that keeps the most recent content.
	 *
	 * If the total output exceeds the preview threshold, the interceptor spills to disk
	 * for full output storage while maintaining head/tail buffers for the preview.
	 *
	 * @param chunk - The output string to write
	 *
	 * @example
	 * ```typescript
	 * interceptor.write('Building project...\n');
	 * interceptor.write('Compiling 42 files\n');
	 * ```
	 */
	write(chunk: string): void
	/**
	 * Add a chunk to the head/tail preview buffers using 50/50 split strategy.
	 *
	 * Fill head first until budget exhausted, then maintain a rolling tail buffer.
	 *
	 * @private
	 */
	private addToPreviewBuffers
	/**
	 * Add content to the rolling tail buffer, dropping old content as needed.
	 *
	 * @private
	 */
	private addToTailBuffer
	/**
	 * Trim the tail buffer from the front to fit within the tail budget.
	 *
	 * @private
	 */
	private trimTailToFit
	/**
	 * Slice a string to get approximately the first N bytes (UTF-8).
	 *
	 * @private
	 */
	private sliceByBytes
	/**
	 * Slice a string to get approximately the last N bytes (UTF-8).
	 *
	 * @private
	 */
	private sliceByBytesFromEnd
	/**
	 * Spill buffered content to disk and switch to streaming mode.
	 *
	 * This is called automatically when the buffer exceeds the preview threshold.
	 * Creates the storage directory if it doesn't exist, writes the current buffer
	 * to the artifact file, and prepares for streaming subsequent output.
	 *
	 * @private
	 */
	private spillToDisk
	/**
	 * Finalize the interceptor and return the persisted output result.
	 *
	 * Closes any open file streams and waits for them to fully flush before returning.
	 * This ensures the artifact file is completely written and ready for reading.
	 *
	 * Returns a summary object containing:
	 * - A preview of the output (head + [omitted indicator] + tail)
	 * - The total byte count of all output
	 * - The path to the full output file (if truncated)
	 * - A flag indicating whether the output was truncated
	 *
	 * @returns The persisted command output summary
	 *
	 * @example
	 * ```typescript
	 * const result = await interceptor.finalize();
	 * console.log(`Preview: ${result.preview}`);
	 * console.log(`Total bytes: ${result.totalBytes}`);
	 * if (result.truncated) {
	 *   console.log(`Full output at: ${result.artifactPath}`);
	 * }
	 * ```
	 */
	finalize(): Promise<PersistedCommandOutput>
	/**
	 * Get the current buffer content for UI display.
	 *
	 * Returns the combined head + tail content for real-time UI updates.
	 * Note: Does not include the omission indicator to avoid flickering during streaming.
	 *
	 * @returns The current buffer content as a string
	 */
	getBufferForUI(): string
	/**
	 * Get the artifact file path for this command execution.
	 *
	 * Returns the path where the full output would be/is stored on disk.
	 * The file may not exist if output hasn't exceeded the preview threshold.
	 *
	 * @returns The absolute path to the artifact file
	 */
	getArtifactPath(): string
	/**
	 * Check if the output has been spilled to disk.
	 *
	 * @returns `true` if output exceeded threshold and was written to disk
	 */
	hasSpilledToDisk(): boolean
	/**
	 * Remove all command output artifact files from a directory.
	 *
	 * Deletes all files matching the pattern `cmd-*.txt` in the specified directory.
	 * This is typically called when a task is cleaned up or reset.
	 *
	 * @param storageDir - The directory containing artifact files to clean
	 *
	 * @example
	 * ```typescript
	 * await OutputInterceptor.cleanup('/path/to/task/command-output');
	 * ```
	 */
	static cleanup(storageDir: string): Promise<void>
	/**
	 * Remove artifact files that are NOT in the provided set of execution IDs.
	 *
	 * This is used for selective cleanup, preserving artifacts that are still
	 * referenced in the conversation history while removing orphaned files.
	 *
	 * @param storageDir - The directory containing artifact files
	 * @param executionIds - Set of execution IDs to preserve (files NOT in this set are deleted)
	 *
	 * @example
	 * ```typescript
	 * // Keep only artifacts for executions 123 and 456
	 * const keepIds = new Set(['123', '456']);
	 * await OutputInterceptor.cleanupByIds('/path/to/command-output', keepIds);
	 * ```
	 */
	static cleanupByIds(storageDir: string, executionIds: Set<string>): Promise<void>
}
//# sourceMappingURL=OutputInterceptor.d.ts.map
