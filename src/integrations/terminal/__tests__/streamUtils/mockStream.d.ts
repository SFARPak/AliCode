import { CommandStream } from "./index"
/**
 * Base function to create a mock stream with predefined output for testing without executing real commands
 * @param output The output to return in the stream
 * @param exitCode The exit code to return
 * @returns An object containing the stream and exit code
 */
export declare function createBaseMockStream(output: string, exitCode?: number): CommandStream
/**
 * Creates a mock stream for Bash output
 * @param output The output to return in the stream
 * @param exitCode The exit code to return
 * @returns An object containing the stream and exit code
 */
export declare function createBashMockStream(output: string, exitCode?: number): CommandStream
/**
 * Creates a mock stream for CMD output
 * @param output The output to return in the stream
 * @param exitCode The exit code to return
 * @returns An object containing the stream and exit code
 */
export declare function createCmdMockStream(output: string, exitCode?: number): CommandStream
/**
 * Creates a mock stream for PowerShell output
 * @param output The output to return in the stream
 * @param exitCode The exit code to return
 * @returns An object containing the stream and exit code
 */
export declare function createPowerShellMockStream(output: string, exitCode?: number): CommandStream
/**
 * Creates a mock stream that yields output in chunks to simulate real terminal behavior
 * @param output The output to return in chunks
 * @param chunkSize The approximate size of each chunk
 * @param exitCode The exit code to return
 * @returns An object containing the stream and exit code
 */
export declare function createChunkedMockStream(output: string, chunkSize?: number, exitCode?: number): CommandStream
//# sourceMappingURL=mockStream.d.ts.map
