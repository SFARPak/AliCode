import { createBashCommandStream } from "./bashStream"
import { createCmdCommandStream } from "./cmdStream"
import { createPowerShellStream } from "./pwshStream"
import {
	createBaseMockStream,
	createBashMockStream,
	createCmdMockStream,
	createPowerShellMockStream,
	createChunkedMockStream,
} from "./mockStream"
/**
 * Common interface for all command streams
 */
export interface CommandStream {
	stream: AsyncIterable<string>
	exitCode: number
}
/**
 * Check if PowerShell Core (pwsh) is available on the system
 * @returns Boolean indicating whether pwsh is available
 */
export declare function isPowerShellCoreAvailable(): boolean
/**
 * Get the current platform
 * @returns The current platform: 'win32', 'darwin', 'linux', etc.
 */
export declare function getPlatform(): string
/**
 * Check if the current platform is Windows
 * @returns Boolean indicating whether the current platform is Windows
 */
export declare function isWindows(): boolean
export {
	createBashCommandStream,
	createCmdCommandStream,
	createPowerShellStream,
	createBaseMockStream,
	createBashMockStream,
	createCmdMockStream,
	createPowerShellMockStream,
	createChunkedMockStream,
}
//# sourceMappingURL=index.d.ts.map
